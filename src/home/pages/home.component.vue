<script setup>
import { RoleEnum } from "@/iam/model/role.enum.js";
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
      <!-- Logo y título -->
      <div class="logo">
        <img src="@/assets/images/icon_tavolo.svg" alt="Logo Tavolo">
      </div>

      <div class="welcome-text">
        ¡Bienvenido a Tavolo!
      </div>

      <div class="home-title">
        Panel Principal
      </div>

      <!-- Solo visible para administradores -->
      <div v-rbac="[RoleEnum.ADMIN]" class="admin-panel">
        <h2 class="panel-title">Panel de administración</h2>
        <p>Bienvenido al panel de administración. Aquí puedes gestionar configuraciones avanzadas.</p>
      </div>

      <!-- Visible para administradores O supervisores -->
      <div v-rbac="[RoleEnum.ADMIN, RoleEnum.SUPERVISOR]" class="actions">
        <pv-button @click="generateReport" class="action-button">
          Generar informe
        </pv-button>
      </div>

      <!-- Contenido visible para todos -->
      <div class="general-content">
        <div class="content-card">
          <h3>Información General</h3>
          <p>Este contenido es visible para todos los usuarios. Explora las funcionalidades disponibles.</p>
        </div>

        <div class="navigation-options">
          <pv-button class="action-button">Explorar Menú</pv-button>
          <pv-button class="action-button secondary">Ver Promociones</pv-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}

.home-content {
  width: 100%;
  max-width: 800px;
  padding: 32px;
  text-align: center;
  background: var(--surface-color);
  border-radius: 8px;
}

.logo {
  margin-bottom: 6px;
}

.logo img {
  height: 120px;
  width: auto;
}

.welcome-text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.home-title {
  font-size: 36px;
  color: var(--text-primary);
  margin-bottom: 32px;
  font-weight: 600;
}

.admin-panel {
  background-color: var(--primaryColor50);
  border: 1px solid var(--primaryColor200);
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 8px;
  text-align: left;
}

.panel-title {
  color: var(--text-primary);
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.action-button {
  min-width: 160px;
  padding: 12px 32px;
  background-color: var(--text-primary);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 8px;
}

.action-button.secondary {
  background-color: var(--primaryColor300);
}

.action-button:hover {
  background-color: var(--primaryColor600);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.general-content {
  text-align: left;
  margin-top: 20px;
}

.content-card {
  background-color: var(--primaryColor50);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--primaryColor200);
}

.content-card h3 {
  color: var(--text-primary);
  margin-top: 0;
}

.navigation-options {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
</style>