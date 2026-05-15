<template>
  <div class="app-container" style="height: 100vh !important; display: flex !important; flex-direction: column !important; background: #0a0e14 !important; padding: 0 5px 5px 5px !important; overflow: hidden !important; gap: 8px !important;">
    <SplashScreen />
    <Navbar v-if="showNavbar" />
    <main class="main-content" style="flex: 1 !important; display: flex !important; flex-direction: column !important; min-height: 0 !important; margin: 0 !important;">
      <router-view style="flex: 1 !important;" />
    </main>
    <GlobalUI />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useAppStore } from './stores/appStore';
import { useUIStore } from './stores/uiStore';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import GlobalUI from './components/GlobalUI.vue';
import SplashScreen from './components/SplashScreen.vue';

const store = useAppStore();
const ui = useUIStore();
const route = useRoute();

const showNavbar = computed(() => {
  const hiddenPages = ['/subscriptions', '/payment', '/waiting'];
  return store.isLoggedIn && !hiddenPages.includes(route.path);
});

onMounted(() => {
  // Hide initial splash after 1s
  setTimeout(() => {
    ui.splashShow = false;
  }, 1000);
});
</script>

<style>
/* Global styles are imported in main.js */
</style>
