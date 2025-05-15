<script>
import { ref } from 'vue';
import HeadquarterTableList from '../components/headquarter-table-list.vue';
import HeadquarterBookingList from '../components/headquarter-booking-list.vue';

export default {
  name: "SupervisorBooking",
  components: {
    HeadquarterTableList,
    HeadquarterBookingList
  },
  setup() {
    const viewType = ref('tables'); // Default view is tables

    return {
      viewType
    };
  }
}
</script>

<template>
  <div class="supervisor-booking-container">
    <div class="header-section">
      <h1 class="page-title">Ver reservas</h1>

      <div class="view-selector">
        <label for="view-dropdown">Ver: </label>
        <select
          id="view-dropdown"
          v-model="viewType"
          class="dropdown-control"
        >
          <option value="tables">Por mesa</option>
          <option value="bookings">Por persona</option>
        </select>
      </div>
    </div>

    <div class="content-container">
      <HeadquarterTableList v-if="viewType === 'tables'" />
      <HeadquarterBookingList v-else-if="viewType === 'bookings'" />
    </div>
  </div>
</template>

<style scoped>
.page-title {
  color: var(--primaryColor900);
  text-align: center;
  padding: 0 0 20px 0;
  margin: 0;
}

.view-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-control {
  padding: 8px 12px;
  border: 1px solid #DCC8B9;
  border-radius: 4px;
  background-color: #F9F5F1;
  color: #392B1B;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 180px;
}

.content-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-top: 2em;
  padding: 20px;
}
</style>