<!-- src/booking/components/headquarter-tables-card.component.vue -->
<script setup>
import { ref } from 'vue';

const props = defineProps({
  table: {
    type: Object,
    required: true
  },
  headquarter: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['select-table', 'reserve-table']);

const isAvailable = ref(props.table.status?.toLowerCase() === 'available');
const tableClass = ref(`table-card ${isAvailable.value ? 'available' : 'occupied'}`);
const showReservationForm = ref(false);

const getStatusLabel = () => {
  return isAvailable.value ? 'Disponible' : 'Ocupada';
};

const selectTable = () => {
  if (isAvailable.value) {
    emit('select-table', props.table.id);
  }
};

const openReservationForm = () => {
  if (isAvailable.value) {
    emit('reserve-table', {
      tableId: props.table.id,
      tableNumber: props.table.tableNumber,
      seats: props.table.seats,
      zone: props.table.zone,
      headquarter: props.headquarter
    });
  }
};
</script>

<template>
  <div :class="tableClass">
    <div class="table-content">
      <div class="table-number">Mesa {{ table.tableNumber }}</div>
      <div class="table-info">
        <p><strong>Capacidad:</strong> {{ table.seats }} personas</p>
        <p><strong>Zona:</strong> {{ table.zone }}</p>
        <div class="table-status">
          <span :class="isAvailable ? 'status-available' : 'status-occupied'">
            {{ getStatusLabel() }}
          </span>
        </div>
      </div>
      <div class="table-actions">
        <button
            class="btn-reserve"
            @click="openReservationForm"
            :disabled="!isAvailable">
          Reservar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.table-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table-card.available {
  border-left: 4px solid #4caf50;
}

.table-card.occupied {
  border-left: 4px solid #f44336;
  opacity: 0.7;
}

.table-number {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.table-info p {
  margin: 5px 0;
}

.table-status {
  margin-top: 10px;
  margin-bottom: 15px;
}

.status-available {
  color: #4caf50;
  font-weight: 500;
}

.status-occupied {
  color: #f44336;
  font-weight: 500;
}

.table-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.btn-reserve {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  width: 100%;
}

.btn-reserve:hover:not(:disabled) {
  background-color: #3982d7;
}

.btn-reserve:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>