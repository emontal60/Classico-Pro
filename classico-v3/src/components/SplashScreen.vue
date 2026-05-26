<template>
  <transition name="fade">
    <div v-if="show" class="splash-screen" :class="{ 'light-mode': ui.theme === 'light' }">
      <div class="splash-content">
        <!-- Squircle Logo Container -->
        <div class="logo-box">
          <img src="../assets/images/app-icon.png" alt="App Logo" class="splash-logo">
        </div>

        <!-- App Branding -->
        <div class="text-group">
          <h1 class="app-name">CLASSICO PRO</h1>
          <p class="app-tagline">PREMIUM MANAGEMENT SYSTEM</p>
        </div>

        <!-- Dual-Segment Circular Loader -->
        <div class="loader-wrapper">
          <div class="circular-loader">
            <div class="loader-track"></div>
            <div class="loader-segment teal"></div>
            <div class="loader-segment orange"></div>
          </div>
        </div>

        <!-- System Status -->
        <p class="status-text">جاري الاتصال بالسيرفر...</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../stores/uiStore';

const ui = useUIStore();
const show = computed(() => ui.splashShow);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&family=Cairo:wght@400;700&display=swap');

.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0a1120; /* Deep navy from image */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0; /* Minimal gap for tight layout */
}

.logo-box {
  width: 160px;
  height: 160px;
  background: #121b2d;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.5);
  margin-bottom: 1.2rem;
  border: 1px solid rgba(255,255,255,0.05);
}

.splash-logo {
  width: 110px;
  height: auto;
}

.text-group {
  text-align: center;
  margin-bottom: 2.2rem;
}

.app-name {
  font-size: 3.2rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  padding: 0;
  line-height: 1.1;
  letter-spacing: 5px;
  background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-tagline {
  color: #14b8a6; /* Exact Teal from image */
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 2.5px;
  margin-top: 2px;
  text-transform: uppercase;
  opacity: 0.9;
}

.loader-wrapper {
  position: relative;
  width: 75px;
  height: 75px;
  margin-bottom: 1.2rem;
}

.circular-loader {
  width: 100%;
  height: 100%;
  position: relative;
}

.loader-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 7px solid rgba(255,255,255,0.04);
  border-radius: 50%;
}

.loader-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 7px solid transparent;
}

.loader-segment.teal {
  border-top-color: #14b8a6;
  animation: rotateCW 1.8s linear infinite;
}

.loader-segment.orange {
  border-bottom-color: #f59e0b; /* Exact Orange from image */
  width: 65%;
  height: 65%;
  top: 17.5%;
  left: 17.5%;
  border-width: 5px;
  animation: rotateCW 1.4s linear infinite reverse; /* Rotates opposite */
}

.status-text {
  font-family: 'Cairo', sans-serif;
  color: #475569;
  font-size: 0.9rem;
  margin: 0;
  letter-spacing: 0.5px;
}

@keyframes rotateCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-leave-active {
  transition: opacity 0.8s ease-out;
}

.fade-leave-to {
  opacity: 0;
}

/* --- Splash Screen Light Mode Overrides --- */
.splash-screen.light-mode {
  background-color: #f8fafc !important;
  background: radial-gradient(circle at center, #ffffff 0%, #f1f5f9 60%, #edfaf9 100%) !important;
}

.splash-screen.light-mode .logo-box {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
}

.splash-screen.light-mode .app-name {
  background: linear-gradient(180deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.splash-screen.light-mode .app-tagline {
  color: #0d9488; /* High-contrast emerald/teal-600 */
  text-shadow: none;
  opacity: 1;
}

.splash-screen.light-mode .loader-track {
  border-color: rgba(15, 23, 42, 0.06);
}

.splash-screen.light-mode .status-text {
  color: #64748b;
}
</style>
