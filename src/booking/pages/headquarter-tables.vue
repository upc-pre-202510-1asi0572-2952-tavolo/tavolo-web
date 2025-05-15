<!-- src/booking/pages/headquarter-tables.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { HeadquartersService } from '../services/headquarter.service';
import { TablesService } from '../services/tables.service';
import HeadquarterTablesCard from '../components/headquarter-tables-card.component.vue';
import ReservationForm from '../components/reservation-form.component.vue';

const route = useRoute();
const headquarterId = computed(() => route.params.id);

const headquarter = ref(null);
const tables = ref([]);
const loading = ref(true);
const error = ref(null);

// Filtros
const capacityFilter = ref('all');
const zoneFilter = ref('all');
const availableZones = ref(['terraza', 'ventana', 'interior']);
const availableCapacities = ref([1, 2, 4, 6, 8]);

// Formulario de reserva
const showReservationForm = ref(false);
const selectedTableInfo = ref(null);

const headquartersService = new HeadquartersService();
const tablesService = new TablesService();

onMounted(async () => {
  try {
    // Cargar datos de la sede
    const headquarterResponse = await headquartersService.getHeadquarterById(headquarterId.value);
    headquarter.value = headquarterResponse;

    // Cargar mesas de la sede
    const tablesResponse = await tablesService.getTablesByHeadquarter(headquarterId.value);
    tables.value = tablesResponse.data;

    loading.value = false;
  } catch (err) {
    error.value = 'Error al cargar los datos: ' + err.message;
    loading.value = false;
  }
});

const filteredTables = computed(() => {
  let filtered = [...tables.value];

  if (capacityFilter.value !== 'all') {
    filtered = filtered.filter(table => table.seats === parseInt(capacityFilter.value));
  }

  if (zoneFilter.value !== 'all') {
    filtered = filtered.filter(table => table.zone === zoneFilter.value);
  }

  return filtered;
});

const resetFilters = () => {
  capacityFilter.value = 'all';
  zoneFilter.value = 'all';
};

const handleReserveTable = (tableInfo) => {
  selectedTableInfo.value = tableInfo;
  showReservationForm.value = true;
};

const handleReservationSuccess = () => {
  setTimeout(() => {
    // Actualizar las mesas para reflejar la nueva reserva
    refreshTables();
  }, 2000);
};

const closeReservationForm = () => {
  showReservationForm.value = false;
  selectedTableInfo.value = null;
};

const refreshTables = async () => {
  try {
    const tablesResponse = await tablesService.getTablesByHeadquarter(headquarterId.value);
    tables.value = tablesResponse.data;
  } catch (err) {
    console.error('Error al actualizar las mesas:', err);
  }
};
</script>

<template>
  <div class="headquarter-tables-page">
    <div class="loading" v-if="loading">
      <p>Cargando información...</p>
    </div>

    <div class="error-message" v-else-if="error">
      <p>{{ error }}</p>
    </div>

    <div class="headquarter-content" v-else>
      <div class="back-button">
        <router-link to="/headquarters" class="btn btn-text">
          <i class="pi pi-arrow-left"></i> Volver a sedes
        </router-link>
      </div>

      <div class="headquarter-header">
        <h1>{{ headquarter.name }} - Mesas</h1>
        <p class="headquarter-address">
          <i class="pi pi-map-marker"></i> {{ headquartersService.getFullAddress(headquarter) }}
        </p>
      </div>

      <div class="main-content">
        <!-- Panel de filtros (lado izquierdo) -->
        <div class="filters-panel">
          <div class="filters-header">
            <h2>Filtros</h2>
          </div>

          <div class="filter-group">
            <label for="capacityFilter">Capacidad:</label>
            <select id="capacityFilter" v-model="capacityFilter">
              <option value="all">Todas las capacidades</option>
              <option v-for="capacity in availableCapacities" :key="capacity" :value="capacity">
                {{ capacity }} {{ capacity === 1 ? 'persona' : 'personas' }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="zoneFilter">Zona:</label>
            <select id="zoneFilter" v-model="zoneFilter">
              <option value="all">Todas las zonas</option>
              <option v-for="zone in availableZones" :key="zone" :value="zone">
                {{ zone.charAt(0).toUpperCase() + zone.slice(1) }}
              </option>
            </select>
          </div>

          <button class="btn-reset" @click="resetFilters">
            <i class="pi pi-filter-slash"></i> Limpiar filtros
          </button>
        </div>

        <!-- Sección de mesas (lado derecho) -->
        <div class="tables-section">
          <div v-if="filteredTables.length === 0" class="no-tables">
            <p>No se encontraron mesas que coincidan con los filtros seleccionados.</p>
          </div>

          <div v-else class="tables-grid">
            <div class="table-card" v-for="table in filteredTables" :key="table.id"
                 :class="table.status?.toLowerCase() === 'available' ? 'available' : 'occupied'">
              <div class="table-header">
                <div class="table-number">Mesa {{ table.tableNumber }}</div>
                <div class="status-badge" :class="table.status?.toLowerCase() === 'available' ? 'badge-available' : 'badge-occupied'">
                  {{ table.status?.toLowerCase() === 'available' ? 'Disponible' : 'Ocupada' }}
                </div>
              </div>
              <div class="table-info">
                <p><strong>Capacidad:</strong> {{ table.seats }} personas</p>
              </div>
              <button
                  class="btn-reserve"
                  @click="handleReserveTable({
                tableId: table.id,
                tableNumber: table.tableNumber,
                seats: table.seats,
                zone: table.zone,
                headquarter: headquarter
              })"
                  :disabled="table.status?.toLowerCase() !== 'available'">
                <i class="pi pi-calendar-plus"></i> Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      <reservation-form
          :visible="showReservationForm"
          :tableInfo="selectedTableInfo"
          @close="closeReservationForm"
          @success="handleReservationSuccess"
      />
    </div>
  </div>
</template>

<style scoped>
.headquarter-tables-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error-message {
  text-align: center;
  padding: 30px;
  color: #563F25;
}

.error-message {
  color: #D59969;
}

.back-button {
  margin-bottom: 20px;
}

.btn-text {
  text-decoration: none;
  color: #AC8362;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.headquarter-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #DCC8B9;
  padding-bottom: 15px;
}

h1 {
  font-size: 2rem;
  color: #392B1B;
  margin-bottom: 10px;
}

.headquarter-address {
  color: #563F25;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.main-content {
  display: flex;
  gap: 30px;
}

.filters-panel {
  width: 250px;
  background-color: #FFF8F3;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(57, 43, 27, 0.1);
  height: fit-content;
}

.filters-header {
  border-bottom: 1px solid #DCC8B9;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.filters-header h2 {
  margin: 0;
  color: #392B1B;
  font-size: 1.3rem;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #563F25;
}

.filter-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #DCC8B9;
  border-radius: 4px;
  background-color: #fff;
  color: #392B1B;
  font-size: 0.95rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23563F25' d='M4 8l4-4H4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
}

.btn-reset {
  width: 100%;
  padding: 10px;
  background-color: #8A724A;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-reset:hover {
  background-color: #59411A;
}

.tables-section {
  flex: 1;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.table-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(57, 43, 27, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.table-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(57, 43, 27, 0.2);
}

.table-card.available {
  border-top: 4px solid #8A724A;
}

.table-card.occupied {
  border-top: 4px solid #D59969;
  opacity: 0.7;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #392B1B;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-available {
  background-color: #8A724A;
  color: white;
}

.badge-occupied {
  background-color: #D59969;
  color: white;
}

.table-info {
  margin-bottom: 15px;
  flex-grow: 1;
}

.table-info p {
  margin: 5px 0;
  color: #563F25;
}

.btn-reserve {
  padding: 10px;
  background-color: #AC8362;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-reserve:hover:not(:disabled) {
  background-color: #8A724A;
}

.btn-reserve:disabled {
  background-color: #DCC8B9;
  cursor: not-allowed;
}

.no-tables {
  text-align: center;
  padding: 30px;
  background-color: #FFF8F3;
  border-radius: 8px;
  color: #563F25;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .filters-panel {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>