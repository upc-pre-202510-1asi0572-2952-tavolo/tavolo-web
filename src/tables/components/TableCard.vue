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
  background: linear-gradient(135deg, rgba(172, 131, 98, 0.08) 0%, rgba(186, 108, 45, 0.12) 100%);
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(57, 43, 27, 0.1);
  padding: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(172, 131, 98, 0.2);
  position: relative;
}

.table-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(57, 43, 27, 0.15);
  border-color: rgba(172, 131, 98, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(172, 131, 98, 0.2);
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #563F25;
  margin: 0;
}

.table-info {
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-weight: 600;
  width: 100px;
  color: #392B1B;
}

.info-value {
  color: #392B1B;
}

.table-status {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #AC8362;
  color: white;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(172, 131, 98, 0.2);
}

.delete-btn {
  background-color: #C2754A;
  color: white;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-btn:hover {
  background-color: #A5542C;
}
</style>