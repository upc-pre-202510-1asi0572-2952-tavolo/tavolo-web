<script setup>
import { RoleEnum } from "@/iam/model/role.enum.js";
import BookingCarousel from '@/booking/components/booking-carousel.component.vue';
import { ref } from 'vue';

// Función para generar informe (mock)
const generateReport = () => {
  alert("Generando informe...");
};

// Datos de ejemplo
const username = ref('Usuario');
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
        <pv-button @click="generateReport" class="action-button">
          Generar informe
        </pv-button>
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
  align-items: flex-start; /* Cambiado de center a flex-start */
  min-height: calc(100vh - 64px); /* Restar la altura del navbar */
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
  min-height: calc(85vh - 64px); /* Altura mínima para contenido */
}

/* Estilos para que cada sección ocupe el espacio apropiado */
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
  justify-content: center;
  margin-bottom: 24px;
  flex-grow: 0; /* No crecer más de lo necesario */
}

.general-content {
  text-align: left;
  margin-top: 20px;
  flex-grow: 1; /* Crecer para ocupar espacio disponible */
  display: flex;
  flex-direction: column;
}

/* El resto de los estilos permanecen igual */
</style>