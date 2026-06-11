<template>
  <header class="topbar glass-panel" style="border-radius: 0 0 10px 10px !important; width: 100% !important; margin: 0 !important; padding: 35px 25px 10px 25px !important; height: auto !important; display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: wrap !important; gap: 15px !important; direction: rtl !important;">
    <div class="logo-container" style="display: flex !important; align-items: center !important; gap: 12px !important; order: 1 !important; margin: 0 !important; padding: 0 !important; flex: 1 !important; justify-content: flex-start !important;">
      <img :src="appLogo" alt="App Logo" class="app-logo" style="height: 40px !important; margin: 0 !important; order: 1 !important;">
      <h1 class="logo glow-text" style="font-size: 1.6rem !important; white-space: nowrap !important; margin: 0 !important; order: 2 !important;">{{ appName }}</h1>
    </div>

    <nav class="top-nav" style="display: flex !important; justify-content: center !important; align-items: center !important; gap: 0.8rem !important; order: 2 !important; flex: 0 1 auto !important;">
      <router-link v-if="store.appSettings.pageVisibility?.monitoring !== false && store.canAccess('monitoring', 'none')" to="/" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon icon-devices">🎮</span> الأجهزة
        </button>
      </router-link>
      
      <router-link v-if="store.appSettings.pageVisibility?.lounge !== false && store.canAccess('lounge', 'none')" to="/lounge" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">☕</span> الصالة
        </button>
      </router-link>

      <router-link v-if="store.appSettings.pageVisibility?.customers !== false && store.canAccess('customers', 'none')" to="/customers" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">📒</span> حسابات العملاء
        </button>
      </router-link>

      <router-link v-if="store.appSettings.pageVisibility?.expenses !== false && store.canAccess('expenses', 'none')" to="/expenses" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">💸</span> المصروفات
        </button>
      </router-link>

      <router-link v-if="store.appSettings.pageVisibility?.archive !== false && store.canAccess('archive', 'none')" to="/archive" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">📦</span> الأرشيف
        </button>
      </router-link>

      <router-link v-if="store.appSettings.pageVisibility?.menu !== false && store.canAccess('menu', 'none')" to="/menu" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">📜</span> قائمة الأسعار
        </button>
      </router-link>

      <router-link v-if="store.appSettings.pageVisibility?.gamepad !== false && store.canAccess('gamepad', 'none')" to="/gamepad" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">🕹️</span> فحص الأذرع
        </button>
      </router-link>

      <router-link v-if="store.canAccess('settings', 'none')" to="/settings" v-slot="{ isActive }">
        <button class="nav-btn" :class="{ active: isActive }">
          <span class="icon">⚙️</span> لوحة الإدارة
        </button>
      </router-link>
    </nav>

    <div class="user-profile-widget" style="display: flex !important; align-items: center !important; order: 3 !important; margin: 0 !important; flex: 1 !important; justify-content: flex-end !important;">
      <div class="user-widget-column">
        <!-- Compact Control Toolbar Above Profile -->
        <div class="mini-control-toolbar">
          <!-- Refresh -->
          <button @click="refreshPage" class="mini-glass-icon-btn" title="تحديث">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4V9H9" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 20V15H15" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 9C18.5 5.5 15.5 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 12.5 3.54224 12.9902 3.62358 13.4655" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 15C5.5 18.5 8.5 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 11.5 20.4578 11.0098 20.3764 10.5345" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Zoom -->
          <div class="zoom-dropdown-container" v-click-outside="() => showZoomMenu = false">
            <button @click="showZoomMenu = !showZoomMenu" class="mini-glass-icon-btn" :class="{ active: showZoomMenu }" title="حجم الخط">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke-width="2" stroke-linecap="round"/>
                <path d="M11 8V14" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 11H14" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            
            <div v-if="showZoomMenu" class="zoom-popover glass-panel shadow-premium">
              <div class="zoom-title">حجم الخط</div>
              <div class="zoom-grid">
                <button @click="changeFontSize('120')" class="zoom-btn" :class="{ current: ui.fontSize === '120' }">2+</button>
                <button @click="changeFontSize('110')" class="zoom-btn" :class="{ current: ui.fontSize === '110' }">1+</button>
                <button @click="changeFontSize('90')" class="zoom-btn" :class="{ current: ui.fontSize === '90' }">1-</button>
                <button @click="changeFontSize('80')" class="zoom-btn" :class="{ current: ui.fontSize === '80' }">2-</button>
              </div>
              <button @click="changeFontSize('100')" class="zoom-reset-btn">إعادة ضبط (0)</button>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button @click="ui.toggleTheme()" class="mini-glass-icon-btn" :title="ui.theme === 'light' ? 'الوضع الداكن 🌙' : 'الوضع المضيء ☀️'">
            <svg v-if="ui.theme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 1V3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 21V23" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.22 4.22L5.64 5.64" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.36 18.36L19.78 19.78" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 12H3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12H23" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.22 19.78L5.64 18.36" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.36 5.64L19.78 4.22" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Fullscreen -->
          <button @click="toggleFullscreen" class="mini-glass-icon-btn" title="ملء الشاشة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H21V9" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 21H3V15" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 3L14 10" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 21L10 14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Username and Exit buttons Row -->
        <div class="user-badge-row" style="display: flex !important; align-items: center !important; gap: 8px !important;">
          <div :class="['user-badge-premium', connectionClass]">
            <span class="user-role-dot"></span>
            <span class="user-name-text">{{ username }}</span>
          </div>

          <button @click="logout" class="logout-btn-premium">
            <span class="icon">🚪</span> خروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';
import defaultLogoUrl from '../assets/images/logo1.png';

const store = useAppStore();
const ui = useUIStore();
const router = useRouter();

const appName = computed(() => store.appSettings?.appName || 'Classico');
const appLogo = computed(() => store.appSettings?.appLogo || defaultLogoUrl);

const showZoomMenu = ref(false);

const changeFontSize = (size) => {
  ui.setFontSize(size);
  showZoomMenu.value = false;
};

const username = computed(() => store.session?.username || '---');

// Connection Status Monitor
const connectionStatus = ref(navigator.onLine ? 'online' : 'offline');
const connectionClass = computed(() => `conn-${connectionStatus.value}`);

let connectionInterval = null;

const checkConnectionQuality = async () => {
  if (!navigator.onLine) {
    connectionStatus.value = 'offline';
    return;
  }

  // Quick initial check via navigator.connection if supported
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      connectionStatus.value = 'weak';
      return;
    }
    if (conn.rtt && conn.rtt > 1000) {
      connectionStatus.value = 'weak';
      return;
    }
  }

  // Active check to measure real latency with concurrent fetches
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for offline detection
  const startTime = performance.now();

  const fetchGoogle = fetch(`https://clients3.google.com/generate_204?cb=${Date.now()}`, {
    method: 'GET',
    mode: 'no-cors',
    signal: controller.signal,
    cache: 'no-store'
  });

  const fetchCloudflare = fetch(`https://1.1.1.1/cdn-cgi/trace?cb=${Date.now()}`, {
    method: 'GET',
    mode: 'no-cors',
    signal: controller.signal,
    cache: 'no-store'
  });

  try {
    // Wait for the fastest successful connection
    await Promise.any([fetchGoogle, fetchCloudflare]);
    clearTimeout(timeoutId);

    const duration = performance.now() - startTime;
    if (duration > 2500) {
      connectionStatus.value = 'weak';
    } else {
      connectionStatus.value = 'online';
    }
  } catch (err) {
    clearTimeout(timeoutId);
    connectionStatus.value = 'offline';
  }
};

const handleOnline = () => {
  checkConnectionQuality();
};

const handleOffline = () => {
  connectionStatus.value = 'offline';
};

const isAdmin = computed(() => {
  const role = store.session?.role?.toLowerCase()?.trim();
  return role === 'manager' || role === 'admin';
});

const logout = () => {
  ui.triggerSplash(1000);
  store.logout();
  router.push('/login');
};

const refreshPage = () => {
  localStorage.setItem('classico_just_refreshed', 'true');
  window.location.reload();
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// Initial font size application
onMounted(() => {
  if (ui.fontSize) {
    // Use px units with !important to prevent color-scheme from resetting the value
    const pct = parseFloat(ui.fontSize) || 100;
    const px = (pct / 100) * 16;
    document.documentElement.style.setProperty('font-size', px + 'px', 'important');
  }

  // Handle post-refresh toast
  if (localStorage.getItem('classico_just_refreshed')) {
    localStorage.removeItem('classico_just_refreshed');
    // Wait for the splash screen to fade out (approx 1s)
    setTimeout(() => {
      ui.showToast('تم تحديث البيانات بنجاح ✅', 'success');
    }, 1200);
  }

  // Start connection quality check immediately and schedule periodic checks
  checkConnectionQuality();
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('focus', checkConnectionQuality);
  connectionInterval = setInterval(checkConnectionQuality, 30000);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('focus', checkConnectionQuality);
  if (connectionInterval) {
    clearInterval(connectionInterval);
  }
});

// Click outside directive for the zoom menu
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.zoom-dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
}

.zoom-popover {
  position: absolute;
  top: 110%;
  right: 0;
  background: #1e2530;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.8rem; /* Reduced padding */
  border-radius: 16px; /* Slightly smaller radius */
  min-width: 160px; /* Reduced width */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.6rem; /* Reduced gap */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
}

.zoom-title {
  font-size: 0.85rem; /* Smaller title */
  font-weight: 700;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 0.2rem;
}

.zoom-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Changed to 2 columns */
  gap: 0.6rem;
}

.zoom-btn {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.03);
  color: white;
  padding: 0.5rem 0; /* Smaller buttons */
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 0.9rem; /* Smaller font */
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-btn:hover {
  background: #334155;
}

.zoom-btn.current {
  background: #2dd4bf;
  color: #0f172a;
  box-shadow: 0 0 10px rgba(45, 212, 191, 0.3);
}

.zoom-reset-btn {
  margin-top: 0.3rem;
  background: transparent;
  border: 1px dashed rgba(45, 212, 191, 0.5);
  color: #2dd4bf;
  padding: 0.5rem; /* Smaller reset button */
  border-radius: 10px;
  font-family: 'Cairo', sans-serif;
  font-weight: 700;
  font-size: 0.8rem; /* Smaller reset font */
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-reset-btn:hover {
  background: rgba(45, 212, 191, 0.05);
  border-style: solid;
}

/* Light Mode Overrides for Zoom Popover and components */
:global(.light-mode) .zoom-popover {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(15, 23, 42, 0.1) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
}

:global(.light-mode) .zoom-title {
  color: #1e293b !important;
}

:global(.light-mode) .zoom-btn {
  background: rgba(15, 23, 42, 0.04) !important;
  border: 1px solid rgba(15, 23, 42, 0.06) !important;
  color: #0f172a !important;
}

:global(.light-mode) .zoom-btn:hover {
  background: rgba(15, 23, 42, 0.08) !important;
}

:global(.light-mode) .zoom-btn.current {
  background: #2563eb !important;
  color: white !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.3) !important;
}

:global(.light-mode) .zoom-reset-btn {
  color: #2563eb !important;
  border-color: rgba(37, 99, 235, 0.5) !important;
}

:global(.light-mode) .zoom-reset-btn:hover {
  background: rgba(37, 99, 235, 0.05) !important;
  border-style: solid;
}
.nav-btn {
  flex-shrink: 0; /* Prevent buttons from shrinking/clipping */
  white-space: nowrap;
  font-size: 0.95rem !important;
  line-height: 1.2 !important;
}

.owner-btn-glow {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.owner-btn-glow.active {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #fff;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.owner-btn-glow:hover {
  background: #f59e0b;
  color: #000;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
}

.icon {
  margin-left: 6px;
  display: inline-block;
  vertical-align: middle;
  filter: brightness(1.5) saturate(1.2) drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
  transition: filter 0.3s ease, transform 0.3s ease;
}

.nav-btn:hover .icon {
  filter: brightness(1.8) saturate(1.4) drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
  transform: scale(1.15);
}

.nav-btn.active .icon {
  filter: brightness(1.8) saturate(1.4) drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
}

/* 🎮 Smart color converter to make the devices icon silver-white and high contrast */
.icon-devices {
  filter: grayscale(1) brightness(2.2) contrast(1.2) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5)) !important;
}

.nav-btn:hover .icon-devices {
  filter: grayscale(1) brightness(2.6) contrast(1.2) drop-shadow(0 0 6px rgba(255, 255, 255, 0.7)) !important;
  transform: scale(1.15);
}

.nav-btn.active .icon-devices {
  filter: grayscale(1) brightness(2.6) contrast(1.2) drop-shadow(0 0 6px rgba(255, 255, 255, 0.7)) !important;
}

/* Compact Toolbar Mini Icons styling */
.user-widget-column {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 8px !important; /* Dynamic spacing that scales beautifully with font zoom */
}

.mini-control-toolbar {
  display: flex !important;
  gap: 4px !important;
  align-items: center !important;
  z-index: 10 !important;
}

.mini-glass-icon-btn {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 5px !important;
  padding: 4.5px !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  color: #8fa0b5 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) !important;
}

.mini-glass-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #00e5ff !important;
  color: #00e5ff !important;
  transform: translateY(-0.5px) !important;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.3) !important;
}

.mini-glass-icon-btn:active {
  transform: translateY(0) !important;
}

.mini-glass-icon-btn svg {
  width: 12px !important;
  height: 12px !important;
  stroke-width: 2.5 !important;
  display: block !important;
}

.mini-control-toolbar .zoom-popover {
  top: 105% !important;
  left: 0 !important;
  right: auto !important;
  transform: scale(0.92);
  transform-origin: top left;
}

/* Dynamic connection styling overrides */
.user-badge-premium.conn-online {
    background: rgba(32, 201, 151, 0.05) !important;
    border: 1px solid rgba(32, 201, 151, 0.2) !important;
    box-shadow: inset 0 0 10px rgba(32, 201, 151, 0.05) !important;
}
.user-badge-premium.conn-online .user-role-dot {
    background: #20c997 !important;
    box-shadow: 0 0 10px #20c997 !important;
}
.user-badge-premium.conn-online .user-name-text {
    color: #20c997 !important;
    text-shadow: 0 0 8px rgba(32, 201, 151, 0.3) !important;
}

.user-badge-premium.conn-weak {
    background: rgba(245, 158, 11, 0.05) !important;
    border: 1px solid rgba(245, 158, 11, 0.2) !important;
    box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.05) !important;
}
.user-badge-premium.conn-weak .user-role-dot {
    background: #f59e0b !important;
    box-shadow: 0 0 10px #f59e0b !important;
}
.user-badge-premium.conn-weak .user-name-text {
    color: #f59e0b !important;
    text-shadow: 0 0 8px rgba(245, 158, 11, 0.3) !important;
}

.user-badge-premium.conn-offline {
    background: rgba(239, 68, 68, 0.05) !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
    box-shadow: inset 0 0 10px rgba(239, 68, 68, 0.05) !important;
}
.user-badge-premium.conn-offline .user-role-dot {
    background: #ef4444 !important;
    box-shadow: 0 0 10px #ef4444 !important;
}
.user-badge-premium.conn-offline .user-name-text {
    color: #ef4444 !important;
    text-shadow: 0 0 8px rgba(239, 68, 68, 0.3) !important;
}
</style>
