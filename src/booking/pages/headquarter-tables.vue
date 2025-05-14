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
          &larr; Volver a sedes
        </router-link>
      </div>

      <div class="headquarter-header">
        <h1>{{ headquarter.name }} - Mesas</h1>
        <p class="headquarter-address">
          {{ headquartersService.getFullAddress(headquarter) }}
        </p>
      </div>

      <div class="filters-section">
        <h2>Filtros</h2>
        <div class="filters-container">
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

          <button class="btn btn-reset" @click="resetFilters">
            Limpiar filtros
          </button>
        </div>
      </div>

      <div class="tables-container">
        <div v-if="filteredTables.length === 0" class="no-tables">
          <p>No se encontraron mesas que coincidan con los filtros seleccionados.</p>
        </div>

        <div v-else class="tables-grid">
          <headquarter-tables-card
              v-for="table in filteredTables"
              :key="table.id"
              :table="table"
              :headquarter="headquarter"
              @reserve-table="handleReserveTable"
          />
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
  color: #666;
}

.error-message {
  color: #e74c3c;
}

.back-button {
  margin-bottom: 20px;
}

.btn-text {
  text-decoration: none;
  color: #4a90e2;
  font-weight: 500;
}

.headquarter-header {
  margin-bottom: 30px;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.headquarter-address {
  color: #666;
  font-size: 1.1rem;
}

.filters-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.filters-section h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  color: #333;
}

.filters-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.filter-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-reset {
  background-color: #e0e0e0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-left: auto;
  align-self: flex-end;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.no-tables {
  text-align: center;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .btn-reset {
    margin-top: 10px;
    width: 100%;
  }

  .tables-grid {
    grid-template-columns: 1fr;
  }
}
</style>