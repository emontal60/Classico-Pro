<template>
  <div class="global-ui-container">
    
    <!-- Toasts Stack -->
    <TransitionGroup name="toast" tag="div" class="toast-stack">
      <div v-for="toast in ui.toasts" :key="toast.id" :class="['toast-v3', toast.type]">
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error' || toast.type === 'danger'">❌</span>
          <span v-else-if="toast.type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </TransitionGroup>

    <!-- Global Modal / Dialog -->
    <Transition name="fade">
      <div v-if="ui.dialog.show" class="dialog-overlay" @click.self="ui.dialog.onCancel">
        <div :class="['dialog-card', ui.dialog.type]">
          <div class="dialog-header">
            <div class="dialog-title">
              <span class="dialog-type-icon">
                <span v-if="ui.dialog.type === 'success'">✅</span>
                <span v-else-if="ui.dialog.type === 'danger'">⚠️</span>
                <span v-else-if="ui.dialog.type === 'warning'">⚡</span>
                <span v-else>🔔</span>
              </span>
              {{ ui.dialog.title }}
            </div>
          </div>
          <div class="dialog-body">
            <p class="dialog-msg">{{ ui.dialog.message }}</p>
            
            <div v-if="ui.dialog.showInput" class="dialog-input-wrap">
              <input 
                type="text" 
                v-model="ui.dialog.inputValue" 
                :placeholder="ui.dialog.inputPlaceholder"
                @keyup.enter="ui.dialog.onConfirm"
                ref="dialogInput"
                class="premium-input-v3"
              >
            </div>
          </div>
          <div class="dialog-footer">
            <button v-if="ui.dialog.cancelText" @click="ui.dialog.onCancel" class="btn-cancel-v3">
              {{ ui.dialog.cancelText }}
            </button>
            <button @click="ui.dialog.onConfirm" :class="['btn-confirm-v3', ui.dialog.type]">
              {{ ui.dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Celebration Modal -->
    <Transition name="celebrate">
      <div v-if="ui.celebration.show" class="celebration-overlay">
        <div class="celebration-card glass-panel shadow-premium">
          <button class="close-btn" @click="ui.celebration.show = false">×</button>
          
          <div class="celebration-content">
            <div class="confetti-container">
              <span class="emoji-particle">🎉</span>
              <span class="emoji-particle">✨</span>
              <span class="emoji-particle">🎊</span>
              <span class="emoji-particle">⭐</span>
            </div>
            
            <div class="celebration-icon">🏆</div>
            <h2 class="celebration-title">تهانينا!</h2>
            <p class="celebration-msg">{{ ui.celebration.message }}</p>
            <div v-if="ui.celebration.plan" class="plan-badge">
              خطة: <span>{{ ui.celebration.plan }}</span>
            </div>
            <div class="welcome-text">أهلاً بك في عائلة كلاسيكو! ❤️</div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- 🔄 Update Notification Bar -->
    <Transition name="update">
      <div v-if="ui.updateInfo.available || ui.updateInfo.downloaded" class="update-bar-v3">
        <div class="update-content">
          <span class="update-icon">{{ ui.updateInfo.downloaded ? '✅' : '🚀' }}</span>
          <div class="update-text">
            <template v-if="ui.updateInfo.downloaded">
              <span class="title">تم تحميل التحديث الجديد!</span>
              <span class="desc">يرجى إعادة تشغيل البرنامج لتطبيق التغييرات.</span>
            </template>
            <template v-else>
              <span class="title">يوجد تحديث جديد متاح!</span>
              <span class="desc">جاري التحميل في الخلفية...</span>
            </template>
          </div>
          <div class="update-actions">
            <button v-if="ui.updateInfo.downloaded" @click="restartApp" class="btn-update-now">تحديث وإعادة تشغيل 🔄</button>
            <button @click="dismissUpdate" class="btn-update-close">إغلاق</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore';
import { watch, nextTick, ref } from 'vue';

const ui = useUIStore();
const dialogInput = ref(null);

const restartApp = () => {
  if (window.electronAPI) {
    window.electronAPI.send('restart_app');
  }
};

const dismissUpdate = () => {
  ui.updateInfo.available = false;
  ui.updateInfo.downloaded = false;
};

watch(() => ui.dialog.show, (newVal) => {
  if (newVal && ui.dialog.showInput) {
    nextTick(() => {
      dialogInput.value?.focus();
    });
  }
});
</script>

<style scoped>
.global-ui-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

/* Toast Stack */
.toast-stack {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

.toast-v3 {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  min-width: 250px;
  max-width: 400px;
}

.toast-v3.success { border-right: 4px solid #10b981; }
.toast-v3.error, .toast-v3.danger { border-right: 4px solid #ef4444; }
.toast-v3.warning { border-right: 4px solid #fbbf24; }
.toast-v3.info { border-right: 4px solid #3b82f6; }

.toast-message { color: white; font-weight: 600; font-size: 0.9rem; }

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.dialog-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 90%;
  max-width: 450px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  animation: slideUp 0.3s ease-out;
}

.dialog-card.danger { border: 1px solid rgba(239, 68, 68, 0.3); }
.dialog-card.success { border: 1px solid rgba(16, 185, 129, 0.3); }

.dialog-header {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dialog-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-body {
  padding: 25px;
}

.dialog-msg {
  color: #94a3b8;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

.dialog-input-wrap {
  margin-top: 20px;
}

.premium-input-v3 {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px;
  border-radius: 10px;
  color: white;
  outline: none;
  font-family: inherit;
}

.premium-input-v3:focus {
  border-color: #00e5ff;
}

.dialog-footer {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel-v3 {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 10px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-confirm-v3 {
  padding: 10px 30px;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  color: white;
}

.btn-confirm-v3.info { background: #3b82f6; }
.btn-confirm-v3.success { background: #10b981; }
.btn-confirm-v3.danger { background: #ef4444; }
.btn-confirm-v3.warning { background: #fbbf24; color: black; }

/* Animations */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }


.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Celebration Modal */
.celebration-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
}

.celebration-card {
  position: relative;
  width: 90%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(0, 229, 255, 0.3);
  padding: 3rem 2rem;
  border-radius: 30px;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0, 229, 255, 0.2);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
  line-height: 1;
}

.celebration-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4));
  animation: bounce 1.5s infinite;
}

.celebration-title {
  color: #fff;
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.celebration-msg {
  color: #cbd5e1;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.plan-badge {
  display: inline-block;
  background: rgba(0, 229, 255, 0.1);
  padding: 8px 20px;
  border-radius: 100px;
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.plan-badge span { color: #00e5ff; font-weight: 900; }

.welcome-text {
  color: #10b981;
  font-weight: 700;
  font-size: 1.1rem;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
}

.progress-fill {
  height: 100%;
  background: #00e5ff;
  width: 100%;
  animation: progressShrink 10s linear forwards;
}

@keyframes progressShrink {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.celebrate-enter-active { animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.celebrate-leave-active { animation: zoomIn 0.3s reverse ease-in; }

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

.confetti-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.emoji-particle {
  position: absolute;
  font-size: 1.5rem;
  animation: floatUp 3s infinite ease-out;
  opacity: 0;
}

.emoji-particle:nth-child(1) { left: 10%; animation-delay: 0s; }
.emoji-particle:nth-child(2) { left: 40%; animation-delay: 1s; }
.emoji-particle:nth-child(3) { left: 70%; animation-delay: 0.5s; }
.emoji-particle:nth-child(4) { left: 90%; animation-delay: 1.5s; }

@keyframes floatUp {
  0% { transform: translateY(100px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px); opacity: 0; }
}

/* Update Bar Styles */
.update-bar-v3 {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #00e5ff;
  border-radius: 16px;
  padding: 15px 25px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 40px rgba(0, 229, 255, 0.3);
  pointer-events: auto;
  z-index: 10001;
}

.update-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.update-icon { font-size: 2rem; }

.update-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: right;
}

.update-text .title { color: white; font-weight: 800; font-size: 1.1rem; }
.update-text .desc { color: #94a3b8; font-size: 0.85rem; }

.update-actions {
  display: flex;
  gap: 10px;
}

.btn-update-now {
  background: #00e5ff;
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}

.btn-update-now:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(0, 229, 255, 0.5); }

.btn-update-close {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
}

.update-enter-active { animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.update-leave-active { animation: slideUp 0.3s reverse ease-in; }
</style>
