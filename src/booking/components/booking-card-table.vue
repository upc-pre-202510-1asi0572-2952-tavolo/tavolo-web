<script>
import { ref, computed, onMounted } from 'vue';
import { BookingService } from "@/booking/services/booking.service.js";


export default {
  name: "BookingCardTable",
  props: {
    table: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const bookingService = new BookingService();
    const schedule = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const expanded = ref(false);

    const tableInfo = computed(() => ({
      id: props.table.id || 'N/A',
      number: props.table.tableNumber || props.table.id || 'N/A',
      seats: props.table.seats || 4,
      status: props.table.status || 'unknown'
    }));

    const fetchTableSchedule = async () => {
      if (!expanded.value) return;

      try {
        loading.value = true;
        const response = await bookingService.getTableSchedule(props.table.id);
        console.log('Table schedule response:', response);

        if (response?.data && Array.isArray(response.data)) {
          // Format timeslots from API response
          schedule.value = response.data.map(slot => {
            console.log('Processing slot:', slot);
            return {
              startTime: formatTime(slot.startTime),
              endTime: formatTime(slot.endTime),
              // Check the status property directly
              status: slot.status === 'AVAILABLE' ? 'AVAILABLE' : 'BOOKED',
              bookingId: slot.bookingId || null
            };
          });
          console.log('Processed schedule:', schedule.value);
        } else {
          console.warn('No schedule data from API, using demo data');
          schedule.value = generateDemoTimeslots();
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        error.value = 'No se pudo cargar el horario';
        schedule.value = generateDemoTimeslots();
      } finally {
        loading.value = false;
      }
    };

    // Add the missing generateDemoTimeslots function
    const generateDemoTimeslots = () => {
      const slots = [];
      const startHour = 8;
      const totalSlots = 10;

      for (let i = 0; i < totalSlots; i++) {
        const hour = startHour + Math.floor(i);
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Randomly assign status for demo purposes
        const status = Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED';

        slots.push({
          startTime,
          endTime,
          status,
          bookingId: status === 'BOOKED' ? Math.floor(Math.random() * 1000) : null
        });
      }
      return slots;
    };

    const toggleExpanded = () => {
      expanded.value = !expanded.value;
      if (expanded.value) {
        fetchTableSchedule();
      }
    };

    const formatTime = (timeString) => {
      // Convert API time format to display format
      if (!timeString) return '';

      try {
        // If it's already in HH:MM format, just return it
        if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;

        // If it's ISO or another format, parse and format
        const date = new Date(timeString);
        return date.getHours().toString().padStart(2, '0') + ':' +
               date.getMinutes().toString().padStart(2, '0');
      } catch (e) {
        return timeString;
      }
    };
    return {
      tableInfo,
      schedule,
      loading,
      error,
      expanded,
      toggleExpanded
    };
  }
}
</script>

<template>
  <div class="booking-card-table">
    <div class="table-header">
      <h4>Mesa #{{ tableInfo.number }}</h4>
      <span :class="['table-status', tableInfo.status.toLowerCase()]">{{ tableInfo.status }}</span>
    </div>
    <div class="table-details">
      <p>Capacidad: {{ tableInfo.seats }} personas</p>
      <button @click="toggleExpanded" class="toggle-button">
        {{ expanded ? 'Ocultar horarios' : 'Ver horarios' }}
      </button>
    </div>

    <div v-if="expanded" class="schedule-container">
      <div v-if="loading" class="schedule-loading">Cargando horarios...</div>
      <div v-else-if="error" class="schedule-error">{{ error }}</div>
      <div v-else-if="schedule.length === 0" class="schedule-empty">
        No hay horarios disponibles
      </div>
      <div v-else class="timeslots">
        <div
          v-for="(slot, index) in schedule"
          :key="index"
          :class="['timeslot', slot.status.toLowerCase()]"
        >
          <span class="time">{{ slot.startTime }} - {{ slot.endTime }}</span>
          <span class="status">{{ slot.status === 'AVAILABLE' ? 'Disponible' : 'Reservado' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.booking-card-table {
  padding: 20px;
  border-radius: 10px;
  background-color: rgba(186, 108, 45, 0.06);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  width: 100%;
}

.table-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
}

.table-header h4 {
  font-size: 1.2rem;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.table-status {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.table-status.available {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.table-status.occupied {
  background-color: #ffebee;
  color: #c62828;
}

.table-status.reserved {
  background-color: #fff8e1;
  color: #f57f17;
}

.table-details {
  margin-top: 10px;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.table-details p {
  margin: 0 0 10px 0;
}

.toggle-button {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  cursor: pointer;
  color: #1976d2;
  text-decoration: underline;
}

.toggle-button:hover {
  color: #0d47a1;
}

.schedule-container {
  margin-top: 15px;
  padding-top: 10px;
}

.schedule-loading, .schedule-error, .schedule-empty {
  text-align: center;
  padding: 10px;
  font-size: 0.9rem;
  color: #666;
}

.schedule-error {
  color: #c62828;
}

.timeslots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.timeslot {
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  text-align: center;
}

.timeslot.available {
  background-color: #e8f5e9;
  border: none;
  color: #2e7d32;
}

.timeslot.booked {
  background-color: #ffebee;
  border: none;
  color: #c62828;
}

.timeslots {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 5px 0;
}

.timeslot {
  flex: 0 0 auto;
  min-width: 60px;
  padding: 8px 12px;
  border-radius: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timeslot .time {
  font-weight: normal;
  font-size: 0.9rem;
}

.timeslot .status {
  display: none;
}

.timeslot.available {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.timeslot.booked {
  background-color: #ffcdd2;
  color: #c62828;
}

.toggle-button {
  background-color: var(--background-color-light);
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--primaryColor600);
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: 10px;
  align-self: flex-start;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.toggle-button:hover {
  background-color: var(--primaryColor100);
  color: var(--primaryColor900);
}

.toggle-button:active {
  transform: translateY(1px);
  box-shadow: none;
}
</style>