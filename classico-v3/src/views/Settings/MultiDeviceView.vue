<template>
  <div class="settings-page">
    <div class="settings-container glass-panel">
      <!-- Re-using Settings Sidebar Header style -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
           <img :src="logoApp" alt="Logo" class="sidebar-logo">
           <div class="sidebar-title">
             <h2>إدارة تعدد الأجهزة</h2>
             <p>مراقبة ومتابعة الحسابات</p>
           </div>
        </div>
      </div>

      <div class="settings-content-wrapper">
         <MultiDeviceTab />
      </div>
    </div>
  </div>
</template>

<script setup>
import MultiDeviceTab from './MultiDeviceTab.vue';
import logoApp from '../../assets/images/logoapp.png';
</script>

<style scoped>
.settings-page {
  padding: 2rem;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
}
.settings-container {
  width: 100%;
  max-width: 1400px;
  display: grid;
  grid-template-columns: 280px 1fr;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.settings-sidebar {
  background: rgba(15, 23, 42, 0.6);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem 1.5rem;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.sidebar-logo { width: 50px; height: auto; }
.sidebar-title h2 { font-size: 1.2rem; font-weight: 900; color: #fff; }
.sidebar-title p { font-size: 0.75rem; color: #94a3b8; }
.settings-content-wrapper {
  background: rgba(15, 23, 42, 0.4);
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
