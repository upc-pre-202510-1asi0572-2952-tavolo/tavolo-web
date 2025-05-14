<!-- src/booking/components/reservation-form.component.vue -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { BookingService } from '../services/booking.service.js';
import { TablesService } from "../services/tables.service.js";

const props = defineProps({
  tableInfo: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'success']);

const bookingService = new BookingService();
const tablesService = new TablesService();
const timeSlots = ref([]);
const selectedSlotId = ref(null);
const customerName = ref('');
const customerPhone = ref('');
const customerEmail = ref('');
const loading = ref(false);
const loadingSlots = ref(false);
const error = ref(null);
const success = ref(false);

const formattedDate = ref(new Date().toISOString().split('T')[0]);

const tableName = computed(() => {
  return `Mesa ${props.tableInfo?.tableNumber || ''}`;
});

const loadTimeSlots = async () => {
  if (!props.tableInfo?.tableId || !formattedDate.value) return;

  console.log(`Cargando slots para mesa ${props.tableInfo.tableId} en fecha ${formattedDate.value}`);

  loadingSlots.value = true;
  error.value = null;
  selectedSlotId.value = null;

  try {
    const response = await tablesService.getTableSchedule(props.tableInfo.tableId, formattedDate.value);

    if (response && response.data) {
      timeSlots.value = response.data.map(slot => ({
        id: slot.id,
        label: `${slot.startTime} - ${slot.endTime}`,
        available: slot.status.toLowerCase() === 'available'
      }));
    } else {
      timeSlots.value = [];
    }
  } catch (err) {
    console.error("Error al cargar los horarios:", err);
    error.value = "No se pudieron cargar los horarios disponibles. Por favor, inténtelo de nuevo.";
    timeSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

const handleDateChange = () => {
  selectedSlotId.value = null;
  loadTimeSlots();
};

const selectTimeSlot = (slotId) => {
  selectedSlotId.value = slotId;
};

const validateForm = () => {
  if (!customerName.value.trim()) {
    error.value = "Por favor ingrese su nombre.";
    return false;
  }

  if (!customerPhone.value.trim()) {
    error.value = "Por favor ingrese su número de teléfono.";
    return false;
  }

  if (!customerEmail.value.trim() || !customerEmail.value.includes('@')) {
    error.value = "Por favor ingrese un correo electrónico válido.";
    return false;
  }

  if (!selectedSlotId.value) {
    error.value = "Por favor seleccione un horario para su reserva.";
    return false;
  }

  return true;
};

const submitReservation = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = null;

  try {
    // El valor clientId debería venir del usuario autenticado
    const reservationData = {
      clientId: 1, // Usar ID del cliente real
      tableId: props.tableInfo.tableId,
      bookingDate: formattedDate.value,
      slotIds: [selectedSlotId.value] // Asegúrate de que sea un array
    };

    console.log('Enviando datos de reserva:', reservationData);
    const response = await bookingService.create(reservationData);
    console.log('Reserva creada con éxito:', response);

    success.value = true;
    emit('success', reservationData);
  } catch (err) {
    console.error('Error al crear la reserva:', err);
    error.value = 'No se pudo completar la reserva. Por favor, inténtelo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  if (!loading.value) {
    emit('close');
    setTimeout(() => {
      success.value = false;
      error.value = null;
      customerName.value = '';
      customerPhone.value = '';
      customerEmail.value = '';
      selectedSlotId.value = null;
    }, 300);
  }
};

// Cargar slots cuando se monta el componente
onMounted(() => {
  loadTimeSlots();
});

// Vigilar cambios en la fecha
watch(formattedDate, handleDateChange);
</script>

<template>
  <div class="modal-overlay" v-if="visible" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ success ? 'Reserva Exitosa' : 'Reservar Mesa' }}</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="success" class="success-message">
          <i class="pi pi-check-circle"></i>
          <h3>¡Reserva confirmada!</h3>
          <p><strong>Mesa:</strong> {{ tableName }}</p>
          <p><strong>Fecha:</strong> {{ formattedDate }}</p>
          <p><strong>Horario:</strong> {{ timeSlots.find(slot => slot.id === selectedSlotId)?.label }}</p>
          <button class="btn-reserve" @click="closeModal">Cerrar</button>
        </div>

        <div v-else>
          <div class="form-group">
            <label><strong>Mesa:</strong></label>
            <div class="info-value">{{ tableName }}</div>
          </div>

          <div class="form-group">
            <label><strong>Capacidad:</strong></label>
            <div class="info-value">{{ props.tableInfo?.seats }} personas</div>
          </div>

          <div class="form-group" v-if="props.tableInfo?.zone">
            <label><strong>Zona:</strong></label>
            <div class="info-value">{{ props.tableInfo.zone }}</div>
          </div>

          <div class="form-group">
            <label for="date">Fecha:</label>
            <input
                type="date"
                id="date"
                v-model="formattedDate"
                :min="new Date().toISOString().split('T')[0]"
            />
          </div>

          <div class="form-group">
            <label>Horario disponible:</label>

            <div v-if="loadingSlots" class="loading-slots">
              Cargando horarios disponibles...
            </div>

            <div v-else-if="timeSlots.length === 0 && !error" class="no-slots-message">
              No hay horarios disponibles para la fecha seleccionada.
            </div>

            <div v-else class="time-slots-container">
              <div
                  v-for="slot in timeSlots"
                  :key="slot.id"
                  :class="{
                    'time-slot': true,
                    'selected': selectedSlotId === slot.id,
                    'unavailable': !slot.available
                  }"
                  @click="slot.available && selectTimeSlot(slot.id)"
              >
                {{ slot.label }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="name">Nombre:</label>
            <input type="text" id="name" v-model="customerName" />
          </div>

          <div class="form-group">
            <label for="phone">Teléfono:</label>
            <input type="tel" id="phone" v-model="customerPhone" />
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="customerEmail" />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="closeModal" :disabled="loading">
              Cancelar
            </button>
            <button
                class="btn-reserve"
                @click="submitReservation"
                :disabled="loading || timeSlots.length === 0"
            >
              {{ loading ? 'Procesando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
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

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

.info-value {
  padding: 8px 0;
  color: #333;
  font-weight: 500;
}

input[type="date"],
input[type="text"],
input[type="tel"],
input[type="email"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.time-slots-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.time-slot {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.time-slot:hover:not(.unavailable) {
  background-color: #f5f5f5;
}

.time-slot.selected {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.time-slot.unavailable {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
  text-decoration: line-through;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-reserve {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-reserve:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 10px;
  padding: 10px;
  background-color: #fde2e2;
  border-radius: 4px;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #2ecc71;
  text-align: center;
}

.success-message i {
  font-size: 3rem;
  margin-bottom: 10px;
}

.success-message h3 {
  color: #2ecc71;
  margin-bottom: 10px;
}

.success-message p {
  margin: 5px 0;
  color: #333;
}

.success-message button {
  margin-top: 20px;
}

.no-slots-message {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #666;
  text-align: center;
}

.loading-slots {
  text-align: center;
  padding: 15px;
  color: #666;
}

@media (max-width: 576px) {
  .time-slots-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>