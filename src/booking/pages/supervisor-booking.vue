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

/* Enhance the select element */
.dropdown-control {
  padding: 10px 14px;
  border: 1px solid var(--primaryColor200);
  border-radius: 6px;
  background-color: var(--background-color);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.dropdown-control:hover {
  border-color: var(--primaryColor400);
  box-shadow: 0 2px 5px rgba(194, 154, 108, 0.2);
}

.dropdown-control:focus {
  outline: none;
  border-color: var(--primaryColor500);
  box-shadow: 0 0 0 2px rgba(172, 131, 98, 0.25);
}

.dropdown-control option {
  background-color: var(--background-color);
  color: var(--text-primary);
  padding: 12px;
  font-size: 1rem;
}

.view-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 15px;
  border-radius: 8px;
}

.view-selector label {
  font-weight: 600;
  color: var(--primaryColor800);
}
.content-container {
  padding: 20px;
}
</style>