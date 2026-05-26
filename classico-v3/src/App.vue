<template>
  <div class="app-container" style="height: 100vh !important; display: flex !important; flex-direction: column !important; background: var(--bg-deep) !important; padding: 0 5px 5px 5px !important; overflow: hidden !important; gap: 8px !important;">
    <SplashScreen />
    <Navbar v-if="showNavbar" />
    <main class="main-content" style="flex: 1 !important; display: flex !important; flex-direction: column !important; min-height: 0 !important; margin: 0 !important;">
      <router-view style="flex: 1 !important;" />
    </main>
    <GlobalUI />

    <!-- 🛑 Blocker Overlay for Inactive/Expired/Tampered Subscription -->
    <div v-if="isExpired" class="expiry-blocker-overlay">
      <div class="expiry-blocker-content">
        <div class="expiry-icon-wrapper">
          <span class="expiry-icon">{{ blockerIcon }}</span>
        </div>
        <h2 class="expiry-title">{{ blockerTitle }}</h2>
        <p class="expiry-message">{{ blockerMessage }}</p>
        
        <div class="countdown-container">
          <div class="countdown-ring">
            <svg class="countdown-svg">
              <circle r="30" cx="35" cy="35" class="countdown-bg-circle"></circle>
              <circle r="30" cx="35" cy="35" class="countdown-progress-circle" :style="countdownProgressStyle"></circle>
            </svg>
            <div class="countdown-number">{{ countdown }}</div>
          </div>
          <span class="countdown-text">سيتم تحويلك تلقائياً إلى صفحة الاشتراكات خلال ثوانٍ...</span>
        </div>

        <button class="btn-close-app" @click="goToSubscriptions">
          <span>تفعيل الاشتراك الآن 🔑</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, watch, ref } from 'vue';
import { useAppStore } from './stores/appStore';
import { useUIStore } from './stores/uiStore';
import { useRoute, useRouter } from 'vue-router';
import Navbar from './components/Navbar.vue';
import GlobalUI from './components/GlobalUI.vue';
import SplashScreen from './components/SplashScreen.vue';

const store = useAppStore();
const ui = useUIStore();
const route = useRoute();
const router = useRouter();

const showNavbar = computed(() => {
  const hiddenPages = ['/subscriptions', '/payment', '/waiting'];
  return store.isLoggedIn && !hiddenPages.includes(route.path);
});

// --- Blocker Overlay countdown logic ---
const countdown = ref(5);
let countdownInterval = null;

const isExpired = computed(() => {
  // If store is loading or status is checking, do not block yet
  if (store.isLoading || store.subscriptionStatus === 'checking') return false;

  const activeStatuses = ['active', 'pending'];
  const isInactive = !activeStatuses.includes(store.subscriptionStatus);
  const hiddenPages = ['/subscriptions', '/payment', '/waiting'];
  
  return isInactive && !hiddenPages.includes(route.path);
});

const blockerTitle = computed(() => {
  if (store.subscriptionStatus === 'tampered') return 'تنبيه أمني: تلاعب في التاريخ!';
  if (store.subscriptionStatus === 'expired_offline_limit') return 'مطلوب الاتصال بالإنترنت';
  if (store.subscriptionStatus === 'expired') return 'انتهت صلاحية الاشتراك!';
  return 'الاشتراك غير نشط';
});

const blockerMessage = computed(() => {
  if (store.subscriptionStatus === 'tampered') return 'تم اكتشاف تلاعب في تاريخ أو وقت الجهاز. يرجى ضبط الساعة بالوقت الصحيح ثم الاتصال بالإنترنت لإعادة تفعيل النظام.';
  if (store.subscriptionStatus === 'expired_offline_limit') return 'لقد مضى أكثر من 7 أيام على آخر تحقق من الاشتراك عبر الإنترنت. يرجى توصيل الجهاز بالإنترنت لتحديث ترخيصك والتمكن من الدخول للبرنامج.';
  if (store.subscriptionStatus === 'expired') return 'عذراً، انتهت فترة صلاحية الاشتراك المخصص لهذا الجهاز في نظام كلاسيكو. يرجى تجديد الباقة لتتمكن من استخدام البرنامج.';
  return 'الرجاء تفعيل اشتراكك لتتمكن من تشغيل البرنامج واستخدام كافة مزاياه.';
});

const blockerIcon = computed(() => {
  if (store.subscriptionStatus === 'tampered') return '🚨';
  if (store.subscriptionStatus === 'expired_offline_limit') return '⚠️';
  if (store.subscriptionStatus === 'expired') return '🛑';
  return '🔑';
});

const countdownProgressStyle = computed(() => {
  const circumference = 188.5; // 2 * pi * r (30)
  const offset = (1 - countdown.value / 5) * circumference;
  return {
    strokeDasharray: circumference,
    strokeDashoffset: offset
  };
});

const goToSubscriptions = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  router.push('/subscriptions');
};

watch(isExpired, (newVal) => {
  if (newVal) {
    countdown.value = 5;
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval);
        goToSubscriptions();
      }
    }, 1000);
  } else {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }
}, { immediate: true });

onMounted(() => {
  if (ui.theme) {
    ui.setTheme(ui.theme);
  }
  // Hide initial splash after both 1s minimum and store finishes loading
  const minTimePromise = new Promise(resolve => setTimeout(resolve, 1000));
  const storeLoadPromise = new Promise(resolve => {
    if (!store.isLoading) {
      resolve();
    } else {
      const unwatch = watch(() => store.isLoading, (loading) => {
        if (!loading) {
          unwatch();
          resolve();
        }
      });
    }
  });

  Promise.all([minTimePromise, storeLoadPromise]).then(() => {
    ui.splashShow = false;
  });

  // Listen for Electron Updates
  if (window.electronAPI && typeof window.electronAPI.receive === 'function') {
    window.electronAPI.receive('update_available', (newVersion) => {
      // If we already refreshed/approved this version's download, don't show the side notification, show progress bar!
      const notifiedVersion = sessionStorage.getItem('update_notified_version');
      if (notifiedVersion === newVersion) {
        ui.updateInfo.available = true;
        ui.updateToast.show = false;
        return;
      }

      // Otherwise, show the beautiful side notification (updateToast)
      ui.updateToast.version = newVersion;
      ui.updateToast.show = true;
      sessionStorage.setItem('update_notified_version', newVersion);

      // Re-trigger the side notification every 5 minutes if they haven't refreshed yet
      if (window._updateNotifyInterval) clearInterval(window._updateNotifyInterval);
      window._updateNotifyInterval = setInterval(() => {
        if (sessionStorage.getItem('update_notified_version') === newVersion && !ui.updateInfo.available && !ui.updateInfo.downloaded) {
          // Re-show/flash the notification elegantly
          ui.updateToast.show = false;
          setTimeout(() => {
            ui.updateToast.show = true;
          }, 1000);
        }
      }, 5 * 60 * 1000); // every 5 minutes
    });

    window.electronAPI.receive('download_progress', (percent) => {
      ui.updateToast.show = false; // Hide notification when downloading
      ui.updateInfo.available = true; // Ensure bar is visible
      ui.updateInfo.progress = Math.round(percent);
    });

    window.electronAPI.receive('update_downloaded', () => {
      ui.updateToast.show = false;
      ui.updateInfo.available = false;
      ui.updateInfo.downloaded = true;
      ui.updateInfo.progress = 100;
      ui.showToast('✅ التحديث جاهز!', 'success');
    });
  }
});
</script>

<style>
/* Global styles are imported in main.js */

/* Blocker Overlay CSS */
.expiry-blocker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 14, 20, 0.95);
  backdrop-filter: blur(15px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  direction: rtl;
}

.expiry-blocker-content {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.1);
  padding: 3rem;
  border-radius: 24px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.expiry-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.expiry-icon {
  font-size: 2.5rem;
}

.expiry-title {
  font-size: 1.8rem;
  color: #f87171;
  font-weight: 900;
  margin: 0;
}

.expiry-message {
  font-size: 1.05rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 1rem 0;
}

.countdown-ring {
  position: relative;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-svg {
  position: absolute;
  width: 70px;
  height: 70px;
  transform: rotate(-90deg);
}

.countdown-bg-circle {
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 5px;
}

.countdown-progress-circle {
  fill: none;
  stroke: #ef4444;
  stroke-width: 5px;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.countdown-number {
  font-size: 1.8rem;
  font-weight: 900;
  color: #fff;
  z-index: 2;
}

.countdown-text {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}

.btn-close-app {
  width: 100%;
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 14px;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-close-app:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
  filter: brightness(1.1);
}

.btn-close-app:active {
  transform: translateY(0);
}
</style>
