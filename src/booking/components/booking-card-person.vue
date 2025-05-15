<script>
import { ref, onMounted } from 'vue';
import { BookingService } from '../services/booking.service.js';

export default {
  name: "BookingCardPerson",
  props: {
    booking: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const clientName = ref(props.booking.clientName || 'Cliente');
    const bookingService = new BookingService();

    onMounted(async () => {
      try {
        if (props.booking.clientId || props.booking.userId) {
          const userId = props.booking.clientId || props.booking.userId;
          const response = await bookingService.getUserById(userId);

          if (response?.data) {
            clientName.value = response.data.username
          }
        }
      } catch (error) {
        console.error('Error fetching client details:', error);
      }
    });

    return {
      clientName
    };
  },
  methods: {
    formatTime(bookingSlots) {
      if (bookingSlots && bookingSlots.length > 0) {
        return `${bookingSlots[0].startTime} - ${bookingSlots[bookingSlots.length - 1].endTime}`;
      }
      return 'No time specified';
    }
  }
}
</script>

<template>
  <div class="booking-card">
    <div class="booking-card-header">
      <h3>{{ clientName }}</h3>
    </div>

    <div class="booking-card-content">
      <div class="info-row">
        <span class="info-label">Mesa:</span>
        <span class="info-value">{{ booking.tableNumber }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Capacidad:</span>
        <span class="info-value">{{ booking.tableCapacity }} personas</span>
      </div>

      <div class="info-row">
        <span class="info-label">Hora:</span>
        <span class="info-value">{{ formatTime(booking.bookingSlots) }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Fecha:</span>
        <span class="info-value">{{ booking.bookingDate }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  background-color: #DCC8B9;
  border-radius: 10px;
  background-color: rgba(186, 108, 45, 0.06);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.booking-card-header {
  color: #563F25;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.booking-card-content {
  padding: 15px;
  flex-grow: 1;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
}

.info-label {
  font-weight: bold;
  width: 100px;
  color: #392B1B;
}

.info-value {
  flex-grow: 1;
  color: #392B1B;
}

.booking-card-actions {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #AC8362;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.confirmed {
  background-color: #4caf50;
  color: white;
}

.pending {
  background-color: #ff9800;
  color: white;
}

.cancelled {
  background-color: #f44336;
  color: white;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.8rem;
  transition: opacity 0.2s;
}

.view-btn {
  background-color: #8A724A;
  color: white;
}

.edit-btn {
  background-color: #AC8362;
  color: white;
}

.cancel-btn {
  background-color: #b3261e;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
</style>