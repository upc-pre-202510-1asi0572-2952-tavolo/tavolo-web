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
  <div class="tables-management-page">
    <pv-toast />

    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-table"></i>
        Gestión de Mesas
      </h1>
      <p class="page-subtitle">Administra las mesas disponibles en tu sede asignada</p>
    </div>

    <div class="tables-container">
      <!-- Vista de carga -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando mesas...</p>
      </div>

      <!-- Error - No hay sede asociada -->
      <div v-else-if="!headquarterId" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-building"></i>
        </div>
        <h3 class="empty-title">Sede no encontrada</h3>
        <p class="empty-description">No se encontró una sede asociada a su cuenta.</p>
      </div>

      <!-- Vista principal -->
      <div v-else>
        <div class="actions-container">
          <pv-button
              label="Agregar mesa"
              icon="pi pi-plus"
              class="add-table-btn"
              @click="openAddTableModal"
          />
        </div>

        <TableList v-if="tables.length > 0" :tables="tables" @delete="handleDeleteTable" />

        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-table"></i>
          </div>
          <h3 class="empty-title">Sin mesas</h3>
          <p class="empty-description">No hay mesas registradas en esta sede. Agrega una nueva mesa para comenzar.</p>
        </div>
      </div>
    </div>

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
.tables-management-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  color: var(--primaryColor700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--primaryColor600);
  font-size: 1rem;
}

.tables-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--primaryColor100);
  overflow: hidden;
  padding: 2rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  font-size: 2rem;
  color: var(--primaryColor500);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primaryColor200) 0%, var(--primaryColor300) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--primaryColor600);
  font-size: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.actions-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.add-table-btn {
  background-color: var(--primaryColor500);
  border-color: var(--primaryColor500);
  color: white;
  transition: background-color 0.3s ease;
}

.add-table-btn:hover {
  background-color: var(--primaryColor600);
  border-color: var(--primaryColor600);
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .tables-container {
    padding: 1rem;
  }

  .custom-modal-container {
    width: 95%;
  }
}
</style>