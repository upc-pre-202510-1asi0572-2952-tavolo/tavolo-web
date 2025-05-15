<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { Table } from '../model/table.entitie';

const props = defineProps({
  table: {
    type: Table,
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
  <div class="table-card">
    <div class="table-header">
      <h3>Mesa #{{ table.tableNumber }}</h3>
    </div>
    <div class="table-content">
      <div class="table-info">
        <p><strong>ID:</strong> {{ table.id }}</p>
        <p>Capacidad: {{ table.seats }} personas</p>
        <p>Zona: {{ table.zone }}</p>
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
}

.table-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  color: white;
}
</style> 