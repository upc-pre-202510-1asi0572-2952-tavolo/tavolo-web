<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/shared/components/nav-bar.component.vue'
import {useAuthenticationStore} from "@/iam/services/authentication.store.js";
import {computed} from "vue";

const authStore = useAuthenticationStore();
const isAuthenticated = computed(() => {
  return authStore.isSignedIn;
});
</script>

<template>
  <div class="app-container">
    <NavBar v-if="isAuthenticated" />
    <main class="main-content" :class="{ 'no-header': !isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.main-content {
  font-family: 'Nunito', sans-serif;
  padding-top: 60px;
  flex: 1;
  width: 100%;
}

.main-content.no-header {
  padding-top: 0;
}

.header-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}
</style>