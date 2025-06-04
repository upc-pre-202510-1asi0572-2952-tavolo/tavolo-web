<script>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableList from '../components/TableList.vue';
import TableForm from '../components/TableForm.vue';
import tableService from '../services/table.service';
import { useAuthenticationStore } from "@/iam/services/authentication.store.js";
import { TableEntity } from "@/tables/model/table.entity.js";

export default {
  name: 'TablesManagement',
  components: {
    TableList,
    TableForm
  },
  setup() {
    const toast = useToast();
    const authStore = useAuthenticationStore();
    const tables = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    const headquarterId = ref(null);

    onMounted(async () => {
      try {
        await loadSupervisorHeadquarter();
      } catch (error) {
        handleError(error, 'Error al cargar la información de la sede');
      }
    });

    // Función para cargar la sede asociada al supervisor
    const loadSupervisorHeadquarter = async () => {
      loading.value = true;
      try {
        // Obtener el ID del usuario actual desde el store de autenticación
        const supervisorId = authStore.currentUserId;
        console.log('Cargando sede para el supervisor ID:', supervisorId);

        // Obtener la sede asociada al supervisor
        const headquarterResponse = await tableService.getHeadquarterBySupervisorId(supervisorId);

        if (!headquarterResponse || !headquarterResponse.data) {
          throw new Error('No se encontró información de la sede para este supervisor');
        }

        headquarterId.value = headquarterResponse.data.headquarterId;
        console.log('ID de la sede obtenido:', headquarterId.value);

        // Cargar las mesas para esa sede
        await loadTablesByHeadquarter();
      } catch (error) {
        console.error('Error al cargar la sede del supervisor:', error);
        loading.value = false;
        throw error;
      }
    };

    const loadTablesByHeadquarter = async () => {
      if (!headquarterId.value) {
        tables.value = [];
        loading.value = false;
        return;
      }

      try {
        console.log('Cargando mesas para la sede ID:', headquarterId.value);
        const response = await tableService.getTablesByHeadquarterId(headquarterId.value);

        if (response && response.data) {
          console.log('Mesas obtenidas:', response.data);
          tables.value = Array.isArray(response.data) ?
            response.data.map(tableData => {
              return new TableEntity(
                tableData.id,
                tableData.headquarterId,
                tableData.tableNumber,
                tableData.seats,
                tableData.status,
                tableData.zone || 'MAIN_HALL'
              );
            }) : [];
        } else {
          tables.value = [];
          console.error('Respuesta inesperada al cargar mesas:', response);
        }
      } catch (error) {
        console.error('Error al cargar tablas de la sede:', error);
        tables.value = []; // Establecer un array vacío en lugar de propagar el error
        // Solo mostrar mensaje de error si no es un problema de conectividad o backend caído
        if (error.response && error.response.status !== 500) {
          throw error;
        }
      } finally {
        loading.value = false;
      }
    };

    // Función para agregar una mesa
    const handleAddTable = async (newTable) => {
      try {
        // Asegurar que la mesa pertenezca a la sede del supervisor
        newTable.headquarterId = headquarterId.value;
        const createdTable = await tableService.createTable(newTable);
        
        // Si la creación fue exitosa, agregar la mesa a la lista actual sin recargar
        if (createdTable) {
          // Si tenemos datos de la mesa creada, la agregamos al array
          if (typeof createdTable === 'object' && createdTable.id) {
            tables.value.push(new TableEntity(
              createdTable.id,
              createdTable.headquarterId,
              createdTable.tableNumber,
              createdTable.seats,
              createdTable.status,
              createdTable.zone || 'MAIN_HALL'
            ));
          }
          // Si no, intentamos recargar (pero evitamos propagar errores si falla)
          else {
            try {
              await loadTablesByHeadquarter();
            } catch (loadError) {
              console.error("Error al recargar mesas después de crear:", loadError);
            }
          }
        }
        
        showModal.value = false;
        showSuccessMessage('Mesa agregada correctamente');
      } catch (error) {
        handleError(error, 'Error al agregar la mesa');
      }
    };

    // ELIMINAR MESA NO HAY ENDPOINT
    const handleDeleteTable = async (tableId) => {
      try {
        if (confirm(`¿Está seguro de eliminar la mesa con ID ${tableId}?`)) {
          // Asegurarse de que tableId sea un número si es necesario
          const id = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
          await tableService.deleteTable(id);
          
          // Actualizar inmediatamente la lista de mesas eliminando la mesa borrada
          tables.value = tables.value.filter(table => table.id !== id);
          
          showSuccessMessage('Mesa eliminada correctamente');
        }
      } catch (error) {
        const errorData = error.response?.data;
        const errorStatus = error.response?.status;
        const errorMessage = errorData?.message || error.message;

        handleError(
          error,
          `Error al eliminar la mesa ${tableId}. ${errorStatus === 500 ? 'Error interno del servidor.' : errorMessage}`
        );
      }
    };

    const openAddTableModal = () => {
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const handleError = (error, defaultMessage) => {
      console.error(error);
      const message = error.response?.data?.message || defaultMessage;
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000
      });
    };

    const showSuccessMessage = (message) => {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: message,
        life: 3000
      });
    };

    return {
      tables,
      loading,
      showModal,
      openAddTableModal,
      closeModal,
      handleAddTable,
      handleDeleteTable,
      headquarterId
    };
  }
}
</script>

<template>
  <div class="tables-management">
    <pv-toast />
    <div class="header">
      <h1 class="title">Gestionar mesas</h1>
    </div>

    <!-- Sección de acciones con botón -->
    <div class="actions-container">
      <pv-button
        label="+ Agregar mesa"
        class="add-table-btn"
        @click="openAddTableModal"
        :disabled="!headquarterId"
      />
    </div>

    <div v-if="loading" class="loading-state">
      <p>Cargando mesas...</p>
    </div>
    <div v-else-if="!headquarterId" class="error-state">
      <p>No se encontró una sede asociada a su cuenta.</p>
    </div>
    <TableList v-else :tables="tables" @delete="handleDeleteTable" />

    <!-- Modal personalizado para agregar mesa -->
    <div v-if="showModal" class="custom-modal-overlay" @click.self="closeModal">
      <div class="custom-modal-container">
        <TableForm
          @save="handleAddTable"
          @cancel="closeModal"
          :predefinedHeadquarterId="headquarterId"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
}

.title {
  color: var(--primaryColor900);
  text-align: left;
  padding: 0 0 20px 0;
  margin: 0;
}

.actions-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-table-btn {
  margin-left: auto;
  background-color: var(--primaryColor500);
  border-color: var(--primaryColor500);
  color: var(--primaryColor50);
  border-radius: 1.5em;
  transition: transform 0.2s ease-in-out, background-color 0.2s, border-color 0.2s;
}

.add-table-btn:hover {
  background-color: var(--primaryColor400);
  border-color: var(--primaryColor400);
  color: var(--primaryColor50);
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}

.loading-state, .error-state {
  display: flex;
  justify-content: center;
  padding: 50px 0;
  color: #333333;
}

.error-state {
  color: #9C2B1B;
}

/* Modal personalizado */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.custom-modal-container {
  animation: modalFadeIn 0.3s ease;
  max-width: 100%;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>