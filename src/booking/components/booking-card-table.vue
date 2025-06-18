<script>
import { ref, onMounted } from 'vue';
import { BookingService } from '../services/booking.service.js';

export default {
  name: "BookingCardTable",
  props: {
    table: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const bookings = ref([]);
    const loading = ref(true);
    const bookingService = new BookingService();

    // Obtener las reservas asociadas a esta mesa
    onMounted(async () => {
      try {
        loading.value = true;
        const response = await bookingService.getAllBookings();

        if (response?.data) {
          // Filtrar las reservas que corresponden a esta mesa
          bookings.value = response.data.filter(booking =>
              booking.tableId === props.table.id
          );

          // Para cada reserva, obtener el nombre del cliente
          for (const booking of bookings.value) {
            if (booking.clientId || booking.userId) {
              const userId = booking.clientId || booking.userId;
              const userResponse = await bookingService.getUserById(userId);

              if (userResponse?.data) {
                booking.clientName = userResponse.data.username;
              } else {
                booking.clientName = 'Cliente';
              }
            } else {
              booking.clientName = 'Cliente';
            }
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      bookings,
      loading
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
      <h3>Mesa {{ table.tableNumber }}</h3>
      <span class="capacity-badge">{{ table.seats }} personas</span>
    </div>

    <div class="booking-card-content">
      <div v-if="loading" class="loading-message">
        Cargando reservas...
      </div>

      <div v-else-if="bookings.length === 0" class="empty-message">
        No hay reservas para esta mesa.
      </div>

      <div v-else class="bookings-list">
        <div v-for="booking in bookings" :key="booking.id" class="booking-item">
          <div class="booking-info">
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span class="info-value">{{ booking.clientName }}</span>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  background-color: rgba(186, 108, 45, 0.06);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.booking-card-header {
  color: #563F25;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(172, 131, 98, 0.2);
}

.booking-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.capacity-badge {
  background-color: #AC8362;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.booking-card-content {
  padding: 15px;
  flex-grow: 1;
}

.loading-message, .empty-message {
  text-align: center;
  padding: 20px;
  color: #392B1B;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-item {
  padding: 10px;
  border-radius: 8px;
  background-color: rgba(172, 131, 98, 0.1);
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  margin-bottom: 6px;
  display: flex;
}

.info-label {
  font-weight: bold;
  width: 80px;
  color: #392B1B;
}

.info-value {
  flex-grow: 1;
  color: #392B1B;
}
</style>