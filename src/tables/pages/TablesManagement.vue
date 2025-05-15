<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import TableList from '../components/TableList.vue';
import TableForm from '../components/TableForm.vue';
import tableService from '../services/table.service';
import { Table } from '../model/table.entitie';

const toast = useToast();
const tables = ref([]);
const loading = ref(true);
const showModal = ref(false);

// Cargar todas las mesas al iniciar
onMounted(async () => {
  try {
    await loadTables();
  } catch (error) {
    handleError(error, 'Error al cargar las mesas');
  }
});

// Función para cargar mesas desde el API
const loadTables = async () => {
  loading.value = true;
  try {
    const response = await tableService.getAllTables();
    console.log('Respuesta del servidor:', response);
    
    // Verificar si hay datos antes de mapear
    if (Array.isArray(response)) {
      tables.value = response.map(table => {
        console.log('Procesando tabla:', table);
        return Table.fromJson(table);
      });
    } else {
      console.error('La respuesta no es un array:', response);
      tables.value = [];
    }
  } catch (error) {
    console.error('Error al cargar tablas:', error);
    throw error;
  } finally {
    loading.value = false;
  }
};

// Función para agregar una mesa
const handleAddTable = async (newTable) => {
  try {
    await tableService.createTable(newTable.toCreateJson());
    await loadTables();
    showModal.value = false;
    showSuccessMessage('Mesa agregada correctamente');
  } catch (error) {
    handleError(error, 'Error al agregar la mesa');
  }
};

// Función para eliminar una mesa
const handleDeleteTable = async (tableId) => {
  try {
    console.log(`Intentando eliminar mesa con ID: ${tableId} (tipo: ${typeof tableId})`);
    
    if (confirm(`¿Está seguro de eliminar la mesa con ID ${tableId}?`)) {
      console.log('Confirmación aceptada, procediendo a eliminar...');
      
      // Asegurarse de que tableId sea un número si es necesario
      const id = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
      
      await tableService.deleteTable(id);
      console.log('Eliminación completada sin errores del servicio');
      
      await loadTables();
      showSuccessMessage('Mesa eliminada correctamente');
    } else {
      console.log('Eliminación cancelada por el usuario');
    }
  } catch (error) {
    console.error('Error completo al eliminar:', error);
    
    // Extraer información detallada del error
    const errorData = error.response?.data;
    const errorStatus = error.response?.status;
    const errorMessage = errorData?.message || error.message;
    
    console.error(`Error HTTP ${errorStatus}: ${errorMessage}`, errorData);
    
    handleError(
      error, 
      `Error al eliminar la mesa ${tableId}. ${errorStatus === 500 ? 'Error interno del servidor.' : errorMessage}`
    );
  }
};

// Función para mostrar el modal
const openAddTableModal = () => {
  showModal.value = true;
};

// Función para cerrar el modal
const closeModal = () => {
  showModal.value = false;
};

// Función para manejar errores
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

// Función para mostrar mensajes de éxito
const showSuccessMessage = (message) => {
  toast.add({
    severity: 'success',
    summary: 'Éxito',
    detail: message,
    life: 3000
  });
};
</script>

<template>
  <div class="tables-management">
    <pv-toast />
    <!-- Título centrado -->
    <div class="header">
      <h1 class="title">Gestionar mesas</h1>
    </div>

    <!-- Sección de acciones con botón -->
    <div class="actions-container">
      <pv-button
        label="+ Agregar mesa"
        class="add-table-btn"
        @click="openAddTableModal"
      />
    </div>

    <div v-if="loading" class="loading-state">
      <p>Cargando mesas...</p>
    </div>
    <TableList v-else :tables="tables" @delete="handleDeleteTable" />

    <!-- Modal personalizado para agregar mesa -->
    <div v-if="showModal" class="custom-modal-overlay" @click.self="closeModal">
      <div class="custom-modal-container">
        <TableForm @save="handleAddTable" @cancel="closeModal" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tables-management {
  max-width: 1200px;
  margin: 80px auto 0;
  padding: 20px;
  color: #333333;
}

.header {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
}

.title {
  font-size: 24px;
  font-weight: 500;
  color: #333333;
  margin: 0;
  display: inline-block;
}

.actions-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-table-btn {
  background-color: #a67c52;
  color: white;
  border: none;
  border-radius: 6px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 50px 0;
  color: #333333;
}

/* Modal personalizado */
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
  z-index: 9999;
  backdrop-filter: blur(3px);
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