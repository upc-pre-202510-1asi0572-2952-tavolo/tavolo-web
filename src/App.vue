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
  <NavBar v-if="isAuthenticated" />
  <main class="main-content" :class="{ 'no-header': !isAuthenticated }">
    <router-view />
  </main>
</template>

<style scoped>

</style>