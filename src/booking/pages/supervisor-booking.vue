<template>
  <div class="supervisor-booking-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-calendar"></i>
        Reservas de la Sede
      </h1>
      <p class="page-subtitle">Administra y visualiza las reservas en tu sede asignada</p>
    </div>

    <div class="filter-container">
      <div class="filter-buttons">
        <button
            @click="activeFilter = 'person'"
            :class="['filter-btn', activeFilter === 'person' ? 'active' : '']">
          <i class="pi pi-user"></i> Por Cliente
        </button>
        <button
            @click="activeFilter = 'table'"
            :class="['filter-btn', activeFilter === 'table' ? 'active' : '']">
          <i class="pi pi-th-large"></i> Por Mesa
        </button>
      </div>
    </div>

    <div class="bookings-container">
      <!-- Vista de carga -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando reservas...</p>
      </div>

      <!-- Vista filtrada por persona -->
      <div v-else-if="activeFilter === 'person'" class="bookings-list person-view">
        <div v-if="bookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-users"></i>
          </div>
          <h3 class="empty-title">No hay reservas de clientes</h3>
          <p class="empty-description">No se encontraron reservas activas en este momento.</p>
        </div>

        <div v-else class="bookings-grid">
          <BookingCardPerson
              v-for="booking in bookings"
              :key="`person-${booking.id}`"
              :booking="booking"
          />
        </div>
      </div>

      <!-- Vista filtrada por mesa -->
      <div v-else-if="activeFilter === 'table'" class="bookings-list table-view">
        <div v-if="tablesWithBookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-table"></i>
          </div>
          <h3 class="empty-title">No hay mesas con reservas</h3>
          <p class="empty-description">No se encontraron mesas con reservas activas.</p>
        </div>

        <div v-else class="tables-grid">
          <BookingCardTable
              v-for="table in tablesWithBookings"
              :key="`table-${table.id}`"
              :table="table"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { BookingService } from '../services/booking.service.js';
import BookingCardPerson from '../components/booking-card-person.vue';
import BookingCardTable from '../components/booking-card-table.vue';
import { useAuthenticationStore } from '@/iam/services/authentication.store.js';

export default {
  name: "SupervisorBooking",
  components: {
    BookingCardPerson,
    BookingCardTable
  },
  setup() {
    const bookingService = new BookingService();
    const authStore = useAuthenticationStore();
    const loading = ref(true);
    const activeFilter = ref('person');
    const headquarter = ref(null);
    const bookings = ref([]);
    const tables = ref([]);

    const tablesWithBookings = computed(() => {
      // Filtrar solo las mesas que tienen reservas asociadas
      return tables.value.filter(table => {
        return bookings.value.some(booking => booking.tableId === table.id);
      });
    });

    const fetchData = async () => {
      try {
        loading.value = true;

        // 1. Obtener la sede del supervisor actual
        const supervisorId = authStore.currentUserId;
        const hqResponse = await bookingService.getHeadquarterBySupervisorId(supervisorId);

        if (!hqResponse?.data) {
          throw new Error('No se encontró una sede asignada para este supervisor');
        }

        headquarter.value = hqResponse.data;
        const hqId = headquarter.value.headquarterId || headquarter.value.id;

        // 2. Obtener las mesas de la sede
        const tablesResponse = await bookingService.getTablesByHeadquarterId(hqId);
        tables.value = tablesResponse?.data || [];

        // 3. Obtener todas las reservas
        const bookingsResponse = await bookingService.getAllBookings();

        if (bookingsResponse?.data) {
          // Filtrar solo las reservas de esta sede
          bookings.value = bookingsResponse.data
              .filter(booking => booking.headquarterId === hqId)
              .map(booking => {
                const table = tables.value.find(t => t.id === booking.tableId);
                return {
                  ...booking,
                  clientName: booking.clientName || 'Cliente',
                  tableNumber: table?.tableNumber || 'N/A',
                  tableCapacity: table?.seats || 'Desconocida',
                  zone: 'Sala principal'
                };
              });
        }
      } catch (error) {
        console.error('Error al cargar datos de reservas:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchData);

    return {
      loading,
      activeFilter,
      bookings,
      tables,
      tablesWithBookings
    };
  }
}
</script>

<style scoped>
.supervisor-booking-page {
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

.filter-container {
  margin-bottom: 2rem;
}

.filter-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--primaryColor300);
  background-color: var(--surface-color);
  color: var(--primaryColor600);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background-color: var(--primaryColor50);
  transform: translateY(-2px);
}

.filter-btn.active {
  background-color: var(--primaryColor500);
  color: white;
  border-color: var(--primaryColor600);
  box-shadow: 0 4px 8px rgba(172, 131, 98, 0.2);
}

.bookings-container {
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

.bookings-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .tables-grid {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    flex-direction: column;
  }
}
</style>