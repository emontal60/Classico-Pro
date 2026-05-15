<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="btn-refresh-page" @click="refreshPage" title="تحديث الصفحة">
        <span style="font-size: 1.4rem;">↻</span>
      </div>
      
      <img src="../assets/images/logo1.png" alt="Logo" class="login-logo">
      <h1 class="login-title">Classico Login</h1>

      <div class="login-form">
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label>اسم المستخدم</label>
          <select v-model="username" style="width: 100%; appearance: none; cursor: pointer;">
            <option value="" disabled selected>اختر اسم المستخدم...</option>
            <option v-for="user in users" :key="user.id" :value="user.username">{{ user.username }}</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 2rem;">
          <label>كلمة السر</label>
          <input type="password" v-model="password" @keyup.enter="handleLogin" placeholder="Password">
        </div>

        <button @click="handleLogin" class="login-btn btn" style="width: 100%;">🚀 دخول النظام</button>
        <div v-if="error" class="error-msg" style="margin-top: 1.5rem;">
          اسم المستخدم أو كلمة السر غير صحيحة
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';

const store = useAppStore();
const ui = useUIStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref(false);

const users = computed(() => store.users);

const handleLogin = async () => {
  error.value = false;
  const success = await store.login(username.value, password.value);
  if (success) {
    ui.triggerSplash(1000);
    router.push('/');
  } else {
    error.value = true;
    password.value = ''; // Clear password on error
  }
};

const refreshPage = () => {
  window.location.reload();
};

onMounted(() => {
  if (store.session) {
    router.push('/');
  }
});
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
}

.login-card {
  width: 100%;
  max-width: 460px;
  padding: 3.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);

  /* Entry Animation */
  animation: modernEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

@keyframes modernEntry {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-logo {
  width: 140px;
  margin: 0 auto;
  display: block;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
  transition: transform 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.05);
}

.login-title {
  color: #22d3ee;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Outfit', 'Cairo', sans-serif;
  text-shadow: 0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.2);
  letter-spacing: -1px;
}

.form-group label {
  display: block;
  margin-bottom: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  font-size: 1.1rem;
  padding-right: 0.2rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  cursor: pointer;
}

.form-group input:focus,
.form-group select:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-color);
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.2);
}

option {
  background: #1a1a2e;
  color: white;
}

.login-btn {
  background: #3b82f6 !important;
  color: white !important;
  padding: 1.1rem !important;
  border-radius: 14px !important;
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3) !important;
  transition: all 0.3s ease !important;
  margin-top: 0.5rem;
}

.login-btn:hover {
  background: #2563eb !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4) !important;
}

.error-msg {
  color: #f87171;
  text-align: center;
  font-weight: 600;
  background: rgba(248, 113, 113, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.btn-refresh-page {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: #94a3b8;
  z-index: 100;
  backdrop-filter: blur(5px);
}

.btn-refresh-page:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: #22d3ee;
  color: #22d3ee;
  transform: rotate(180deg) scale(1.1);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}
</style>
