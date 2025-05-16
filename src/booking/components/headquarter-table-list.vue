<script>
import { ref, onMounted } from 'vue';
import { TableEntity } from '../model/table.entity.js';
import BookingCardTable from './booking-card-table.vue';
import { useAuthenticationStore } from "@/iam/services/authentication.store.js";
import {BookingService} from "@/booking/services/booking.service.js";

export default {
  name: "HeadquarterTableList",
  components: {
    BookingCardTable
  },
  props: {
    headquarterId: {
      type: [Number, String],
      required: false,
      default: null
    }
  },
  setup(props) {
    const tables = ref([]);
    const bookingService = new BookingService();
    const loading = ref(true);
    const error = ref(null);
    const headquarter = ref(null);
    const authStore = useAuthenticationStore();


    const fetchHeadquarterTables = async () => {
      console.log('Starting fetchHeadquarterTables function');
      try {
        loading.value = true;
        console.log('Props headquarterId:', props.headquarterId);

        let hqId = props.headquarterId;

        if (!hqId) {
          console.log('No headquarterId in props, fetching from supervisor');
          const supervisorId = authStore.currentUserId;
          console.log('SupervisorId from auth store:', supervisorId);

          if (!supervisorId) {
            throw new Error('No supervisor ID available');
          }

          console.log('Calling getHeadquarterBySupervisorId with:', supervisorId);
          const response = await bookingService.getHeadquarterBySupervisorId(supervisorId);
          console.log('Headquarter response:', response);

          if (!response?.data) {
            throw new Error('No headquarter data returned for this supervisor');
          }

          headquarter.value = response.data;
          hqId = headquarter.value.headquarterId || headquarter.value.id;
          console.log('Found headquarter ID:', hqId);

          if (!hqId) {
            throw new Error('Invalid headquarter data structure');
          }
        }


        console.log('Fetching tables for headquarter ID:', hqId);
        const tablesResponse = await bookingService.getTablesByHeadquarterId(hqId);
        console.log('Tables response:', tablesResponse);

        if (Array.isArray(tablesResponse.data)) {
          tables.value = tablesResponse.data.map(t => {
            console.log('Processing table:', t);
            return {
              id: t.id,
              headquarterId: hqId,
              tableNumber: t.tableNumber || t.number || 0,
              seats: t.seats || 0,
              status: t.status || 'available'
            };
          });
          console.log('Processed tables:', tables.value);
        } else {
          console.error('Invalid table data format:', tablesResponse.data);
          throw new Error('Invalid table data format received');
        }
      } catch (err) {
        error.value = `Error al cargar mesas: ${err.message}`;
        console.error('Error fetching tables data:', err);
      } finally {
        loading.value = false;
        console.log('Final tables value:', tables.value);
        console.log('Final loading state:', loading.value);
        console.log('Final error state:', error.value);
      }
    };

    onMounted(fetchHeadquarterTables);

    return {
      tables,
      loading,
      error,
      headquarter
    };
  }
}
</script>

<template>
  <div class="headquarter-tables">
    <div v-if="tables.length === 0" class="status-message empty">
      <p>No hay mesas disponibles en esta sede.</p>
    </div>

    <div v-else class="tables-grid">
      <BookingCardTable
          v-for="table in tables"
          :key="`table-${table.id}`"
          :table="table"
      />
    </div>
  </div>
</template>

<style scoped>
.headquarter-tables {
  width: 100%;
}

.tables-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.status-message {
  text-align: center;
  padding: 20px;
  color: #392B1B;
  border-radius: 8px;
  margin: 20px 0;
}

.loading {
  background-color: #f5f5f5;
}

.error {
  background-color: #ffebee;
  color: #b3261e;
}

.empty {
  background-color: #fff8e1;
}
</style>