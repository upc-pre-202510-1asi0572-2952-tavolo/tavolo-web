<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { TableEntity } from '../model/table.entity.js';

const props = defineProps({
  table: {
    type: Object, // Changed from Table to Object since TableEntity is a class
    required: true
  }
});

const emit = defineEmits(['delete']);

const handleDelete = () => {
  console.log('ID de mesa a eliminar:', props.table.id, typeof props.table.id);
  console.log('Mesa completa:', props.table);
  emit('delete', props.table.id);
};
</script>

<template>
  <div class="table-card" :class="'zone-' + table.zone?.toLowerCase()">
    <div class="table-header">
      <h3>Mesa #{{ table.tableNumber }}</h3>
    </div>
    <div class="table-content">
      <div class="table-info">
        <p><strong>ID:</strong> {{ table.id }}</p>
        <p>Capacidad: {{ table.seats }} personas</p>
        <p>Zona: <span class="zone-indicator" :class="'zone-' + table.zone?.toLowerCase()"></span> {{ table.getZoneDisplayName() }}</p>
        <p>Estado: {{ table.status }}</p>
      </div>
      <div class="table-actions">
        <pv-button 
          icon="pi pi-trash" 
          class="delete-btn" 
          @click="handleDelete"
          label="Eliminar"
          severity="danger"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background-color: #FAF5F0;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  color: #333333;
  border-top: 4px solid #ddd;
}

/* Estilos según la zona */
.table-card.zone-main_hall {
  border-top-color: #4287f5; /* Azul para MAIN_HALL */
}

.table-card.zone-window {
  border-top-color: #42d77d; /* Verde para WINDOW */
}

.table-card.zone-terrace {
  border-top-color: #f5a742; /* Naranja para TERRACE */
}

.zone-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.zone-indicator.zone-main_hall {
  background-color: #4287f5; /* Azul para MAIN_HALL */
}

.zone-indicator.zone-window {
  background-color: #42d77d; /* Verde para WINDOW */
}

.zone-indicator.zone-terrace {
  background-color: #f5a742; /* Naranja para TERRACE */
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333333;
}

.table-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.table-info p {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333333;
}

.delete-btn {
  background-color: #9C2B1B;
  color: var(--primaryColor50);
  border-radius: 1.5em;
  transition: transform 0.2s ease-in-out, background-color 0.2s, border-color 0.2s;
}

.delete-btn {
  background-color: #9C2B1B;
  color: var(--primaryColor50);
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}
</style> 