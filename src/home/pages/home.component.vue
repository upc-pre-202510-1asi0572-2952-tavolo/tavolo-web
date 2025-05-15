<script>
import { RoleEnum } from "@/iam/model/role.enum.js";
import BookingCarousel from '@/booking/components/booking-carousel.component.vue';
import {onMounted, ref} from 'vue';
import AssignedHeadquarterCard from "@/branching/components/assigned-headquarter-card.vue";
import HeadquarterTableList from "@/booking/components/headquarter-table-list.vue";

export default {
  name: "HomeComponent",
  components: {
    HeadquarterTableList,
    BookingCarousel,
    AssignedHeadquarterCard,
  },
  setup() {
    // Define refs
    const currentSupervisorId = ref(null);
    const defaultViewType = 'table';

    onMounted(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id && user.roles && user.roles.includes(RoleEnum.SUPERVISOR)) {
        currentSupervisorId.value = user.id;
      }
    });

    return {
      RoleEnum,
      currentSupervisorId,
      defaultViewType
    };
  }
}

</script>

<template>
  <div class="home-container">
    <div class="home-content">
      <!-- Solo visible para administradores -->
      <div v-rbac="[RoleEnum.ADMIN]" class="admin-panel">
        <h2 class="panel-title">Panel de administración</h2>
        <p>Bienvenido al panel de administración. Aquí puedes gestionar configuraciones avanzadas.</p>
      </div>
      <!-- Visible supervisores -->
      <div v-rbac="[RoleEnum.SUPERVISOR]" class="actions">
        <AssignedHeadquarterCard/>
        <HeadquarterTableList/>
      </div>

      <!-- Contenido visible para todos -->
      <div v-rbac="[RoleEnum.USER]" class="general-content">
        <BookingCarousel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 64px);
  padding-top: 64px; /* Espacio para el navbar */
  background-color: var(--background-color);
}

.home-content {
  width: 100%;
  max-width: none;
  padding: 0 32px;
  text-align: center;
  background: var(--surface-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: calc(85vh - 64px);
}

.admin-panel {
  background-color: var(--primaryColor50);
  border: 1px solid var(--primaryColor200);
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 8px;
  text-align: left;
  flex-grow: 0; /* No crecer más de lo necesario */
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-grow: 1;
  width: 100%;
}
.general-content {
  text-align: left;
  margin-top: 20px;
  flex-grow: 1; /* Crecer para ocupar espacio disponible */
  display: flex;
  flex-direction: column;
}
</style>