<script>
import { RoleEnum } from "@/iam/model/role.enum.js";
import BookingCarousel from '@/booking/components/booking-carousel.component.vue';
import {onMounted, ref} from 'vue';
import AssignedHeadquarterCard from "@/branching/components/assigned-headquarter-card.vue";
import HeadquarterTableList from "@/booking/components/headquarter-table-list.vue";
import {useRouter} from "vue-router";
import HeadquarterCard from "@/branching/components/headquarter-card.vue";
import HeadquarterCardList from "@/branching/components/headquarter-card-list.vue";
import SupervisorCardList from "@/branching/components/supervisor-card-list.vue";

export default {
  name: "HomeComponent",
  components: {
    SupervisorCardList,
    HeadquarterCardList,
    HeadquarterCard,
    HeadquarterTableList,
    BookingCarousel,
    AssignedHeadquarterCard,
  },
  setup() {
    const currentSupervisorId = ref(null);
    const defaultViewType = 'table';
    const router = useRouter();

    const navigateTo = (routeName) => {
      try {
        router.push({ name: routeName });
      } catch (error) {
        console.error(`Navigation error: ${error}`);
        router.push({ name: 'home' });
      }
    }

    onMounted(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id && user.roles && user.roles.includes(RoleEnum.SUPERVISOR)) {
        currentSupervisorId.value = user.id;
      }
    });

    return {
      RoleEnum,
      currentSupervisorId,
      defaultViewType,
      navigateTo
    };
  }
}

</script>

<template>
  <div class="home-container">
    <div class="home-content">
      <!-- Solo visible para administradores -->
      <div v-rbac="[RoleEnum.ADMIN]" class="admin-panel">
        <h2>Panel de Administración</h2>
        <p>Acceso exclusivo para administradores.</p>
        <pv-button @click="navigateTo('admin-dashboard')" label="Ir al panel de administración" />
      </div>

      <!-- Visible supervisores -->
      <div v-rbac="[RoleEnum.SUPERVISOR]" class="actions">
        <AssignedHeadquarterCard/>
        <div class="title">
          <h2 class="subtitle">Ver reservas</h2>
          <pv-button class="btn-ver-mas" @click="navigateTo('supervisor-booking')">Ver más</pv-button>
        </div>
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
.admin-panel {
  background-color: var(--primaryColor50);
  border: 1px solid var(--primaryColor200);
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 8px;
  text-align: left;
  flex-grow: 0;
}
</style>