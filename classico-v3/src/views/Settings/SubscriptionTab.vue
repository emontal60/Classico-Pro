<template>
  <div class="subscription-tab-container">
    
    <!-- Top Header Card Integrated with Machine ID -->
    <div class="sub-header-glass">
      <div class="header-main-info">
        <div class="header-icon-shield">🛡️</div>
        <div class="header-text">
          <h3>إدارة اشتراكي</h3>
          <p>تحكم في باقتك وتابع تاريخ عملياتك</p>
        </div>
      </div>
      
      <!-- Integrated Machine ID on the left -->
      <div class="header-machine-id" @click="copyId" title="اضغط للنسخ">
        <div class="h-m-label">معرف الجهاز (للدعم)</div>
        <div class="h-m-value">{{ machineId }}</div>
        <span class="copy-hint">📋</span>
      </div>
    </div>

    <!-- Side by Side Layout for Cards -->
    <div class="cards-grid-layout">
      <!-- Main Subscription Info -->
      <div class="current-sub-card">
        <div class="card-top-header">
          <div class="status-badge" :class="statusClass">
            {{ statusLabel }}
          </div>
          <div class="plan-info">
            <h4>الاشتراك الحالي</h4>
            <p>{{ planLabel }}</p>
          </div>
          <div class="crown-icon">👑</div>
        </div>

        <!-- Two-Column Content Layout -->
        <div class="card-columns-body">
          <!-- Right Column: Dates -->
          <div class="card-details-rows">
            <div class="detail-row">
              <span class="d-label">🗓️ يبدأ في</span>
              <span class="d-value">{{ formatDate(startDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">📅 ينتهي في</span>
              <span class="d-value">{{ formatDate(subData?.expires_at) }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">🖥️ عدد الأجهزة</span>
              <span class="d-value" style="color: #00e5ff; font-weight: 900;">{{ subData?.max_devices || subData?.device_limit || 1 }} أجهزة</span>
            </div>
          </div>

          <!-- Left Column: Countdown Circle -->
          <div class="countdown-section">
            <div class="countdown-label">حالة الاشتراك</div>
            <div class="countdown-box">
              <div class="days-num">{{ remainingDays }}</div>
              <div class="days-unit">يوم متبقي</div>
            </div>
          </div>
        </div>

        <!-- Renew Button -->
        <button class="btn-renew-sub" @click="renewSubscription">
          <svg class="modern-sync-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
          </svg>
          تجديد الاشتراك
        </button>
      </div>

      <!-- History Section -->
      <div class="sub-history-section">
        <div class="history-header">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <span class="h-icon">⏳</span>
            <h3>سجل الاشتراكات</h3>
          </div>
          <button class="refresh-history-btn" @click="refreshHistory" :disabled="isRefreshing">
            {{ isRefreshing ? 'جاري التحديث...' : '🔄 تحديث' }}
          </button>
        </div>

        <div class="history-table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>الباقة</th>
                <th>الفترة</th>
                <th style="text-align: center;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(h, idx) in history" :key="idx">
                <td>{{ getPlanLabel(h.plan_type) }}</td>
                <td class="date-range">
                  {{ formatDate(h.activated_at || h.created_at) }} ⬅️ {{ formatDate(h.expires_at) }}
                </td>
                <td style="text-align: center;">
                  <span :class="['h-status-badge', getStatusLabel(h) === 'نشط' ? 'active' : (getStatusLabel(h) === 'منتهي' ? 'expired' : 'cancelled')]">
                    {{ getStatusLabel(h) }}
                  </span>
                </td>
              </tr>
              <tr v-if="!history.length">
                <td colspan="3" class="empty-history">
                  <div class="history-empty">
                    <p>لا توجد سجلات سابقة مفعلة لهذا الجهاز</p>
                    <small style="opacity: 0.5; font-family: monospace;">ID: {{ store.machineId }}</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Integrated Multi-Device Management Section -->
    <div v-if="(subData?.max_devices || 0) > 1" class="mt-8">
      <MultiDeviceTab />
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';
import { useRouter } from 'vue-router';
import MultiDeviceTab from './MultiDeviceTab.vue';

const store = useAppStore();
const ui = useUIStore();
const router = useRouter();

const isRefreshing = ref(false);
const refreshHistory = async () => {
  isRefreshing.value = true;
  await store.refreshStatus();
  isRefreshing.value = false;
};

const machineId = computed(() => store.machineId);
const subData = computed(() => store.subscriptionData);

const statusClass = computed(() => {
  if (store.subscriptionStatus === 'active') return 'active';
  if (store.subscriptionStatus === 'expired') return 'expired';
  if (store.subscriptionStatus === 'pending') return 'pending';
  return 'none';
});

const statusLabel = computed(() => {
  if (store.subscriptionStatus === 'active') return 'نشط';
  if (store.subscriptionStatus === 'expired') return 'منتهي';
  if (store.subscriptionStatus === 'pending') return 'قيد المراجعة';
  return 'غير مشترك';
});

const planLabel = computed(() => {
  const p = subData.value?.plan_type;
  if (p === 'yearly') return 'الاشتراك السنوي (Vip)';
  if (p === 'monthly') return 'الاشتراك الشهري';
  if (p === 'trial') return 'تجربة مجانية';
  return 'لا توجد باقة مفعلة';
});

const startDate = computed(() => {
  const h = history.value;
  if (h.length > 0) {
    // Return the oldest one in the filtered list (which is the last one due to DESC order)
    return h[h.length - 1].activated_at || h[h.length - 1].created_at;
  }
  // Fallback to the current subscription's activation or creation date
  return subData.value?.activated_at || subData.value?.created_at;
});

const remainingDays = computed(() => {
  if (!subData.value?.expires_at) return 0;
  const expiry = new Date(subData.value.expires_at);
  const now = new Date();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

const history = computed(() => {
  const hList = Array.isArray(store.subscriptionHistory) ? store.subscriptionHistory : [];
  // Only filter out rows that have NO plan_type or NO status (broken records)
  // We want to show active, expired, and cancelled records.
  return hList.filter(h => h && h.plan_type && h.status);
});

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '---';
  // Use en-GB for DD/MM/YYYY format in English
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getPlanLabel = (p) => {
  if (!p) return 'تجربة';
  const val = p.toLowerCase().trim();
  if (val === 'yearly') return 'خطة سنوية';
  if (val === 'monthly') return 'خطة شهرية';
  if (val === 'trial') return 'تجربة مجانية';
  return p;
};

const getStatusLabel = (h) => {
  if (!h || !h.status) return '---';
  const s = h.status.toLowerCase().trim();
  
  // Strict Date Comparison: If current time is >= expiry time, it's expired
  if (s === 'active' && h.expires_at) {
    const expiryDate = new Date(h.expires_at);
    const now = new Date();
    if (expiryDate <= now) return 'منتهي';
    return 'نشط';
  }
  
  if (s === 'expired') return 'منتهي';
  if (s === 'cancelled' || s === 'none') return 'ملغي';
  return s;
};

const copyId = () => {
  navigator.clipboard.writeText(machineId.value);
  ui.showToast('تم نسخ المعرف بنجاح! ✅', 'success');
};

const renewSubscription = () => {
  router.push('/subscriptions?renew=true');
};

const subSerials = computed(() => subData.value?.activation_keys || []);
const usedSerialsCount = computed(() => subSerials.value.filter(s => s.hardware_id).length);

const copySerial = (code) => {
  navigator.clipboard.writeText(code);
  ui.showToast('تم نسخ كود التفعيل! 🔑 قم باستخدامه في الجهاز الجديد.', 'success');
};
</script>

<style scoped>
.subscription-tab-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 10px;
  padding-bottom: 100px; /* Space at bottom to avoid cutoff */
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.sub-header-glass {
  background: rgba(30, 41, 59, 0.4);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(255,255,255,0.05);
}

.header-main-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon-shield {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
}

.header-text h3 { color: #00e5ff; font-weight: 900; margin: 0; font-size: 1.1rem; }
.header-text p { color: #64748b; font-size: 0.8rem; margin: 2px 0 0; }

/* Integrated Machine ID Style */
.header-machine-id {
  text-align: center;
  background: rgba(0, 229, 255, 0.05);
  padding: 10px 30px;
  border-radius: 12px;
  border: 1px solid rgba(0, 229, 255, 0.1);
  cursor: pointer;
  transition: 0.3s;
  position: relative;
  min-width: 180px;
}

.header-machine-id:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: rgba(0, 229, 255, 0.3);
}

.h-m-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 4px;
  text-transform: uppercase;
  display: block;
}

.h-m-value {
  color: #00e5ff;
  font-weight: 900;
  font-size: 0.85rem;
  font-family: monospace;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  display: block;
}

.copy-hint {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.6;
}

/* Side by Side Grid */
.cards-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.current-sub-card {
  background: #1e293b;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  height: 100%;
}

.card-top-header {
  background: linear-gradient(to left, #0f172a, #0369a1);
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-badge {
  background: #f59e0b;
  color: #fff;
  padding: 3px 10px;
  border-radius: 50px;
  font-weight: 900;
  font-size: 0.75rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.status-badge.active { 
  background: #10b981; 
  animation: pulseActive 2s infinite;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
}

@keyframes pulseActive {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-badge.expired { background: #ef4444; }

.plan-info { flex: 1; margin: 0 15px; }
.plan-info h4 { margin: 0; font-size: 1.1rem; font-weight: 900; }
.plan-info p { margin: 1px 0 0; opacity: 0.9; font-size: 0.8rem; }
.crown-icon { font-size: 1.5rem; }

.card-columns-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.card-details-rows { flex: 1; display: flex; flex-direction: column; gap: 20px; border-left: 1px solid rgba(255,255,255,0.05); padding-left: 20px; }
.detail-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.d-label { color: #94a3b8; font-weight: 700; font-size: 0.85rem; }
.d-value { color: #fff; font-weight: 900; font-size: 0.9rem; }

.countdown-section {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.countdown-label { color: #00e5ff; font-weight: 900; font-size: 1rem; }
.countdown-box {
  width: 100px;
  height: 100px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(0, 229, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 229, 255, 0.1);
}
.days-num { font-size: 2.2rem; font-weight: 900; color: #f59e0b; line-height: 1; }
.days-unit { color: #64748b; font-size: 0.75rem; font-weight: 900; margin-top: 3px; }

.btn-renew-sub {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%);
  border: none;
  border-top: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-renew-sub::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: 0.5s;
}

.btn-renew-sub:hover::before {
  left: 100%;
}

.btn-renew-sub:hover {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(14, 165, 233, 0.15) 100%);
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
  box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.1);
}

.btn-renew-sub .modern-sync-icon {
  width: 22px;
  height: 22px;
  animation: rotateModern 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes rotateModern {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sub-history-section {
  background: rgba(30, 41, 59, 0.4);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.05);
  height: 100%;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  background: linear-gradient(to left, #0f172a, #0369a1);
  padding: 12px 20px;
  border-radius: 12px;
  color: #fff;
  border: 1px solid rgba(0, 229, 255, 0.2);
}
.history-header h3 { margin: 0; font-size: 1.1rem; font-weight: 900; }

.history-table-container { 
  max-height: 400px; 
  overflow-y: auto; 
  padding-right: 10px;
}
.history-table { width: 100%; border-collapse: collapse; }
.history-table th { text-align: right; color: #64748b; font-size: 0.85rem; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.history-table td { padding: 15px 0; color: #fff; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 800; }
.date-range { color: #94a3b8; font-size: 0.85rem; font-weight: 600; }

.h-status-badge {
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 900;
}
.h-status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.h-status-badge.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.empty-history { text-align: center; color: #64748b; padding: 2rem !important; }
.history-empty p { margin-bottom: 5px; color: #94a3b8; }

.refresh-history-btn {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.3s;
}
.refresh-history-btn:hover { background: #00e5ff; color: #000; }
.refresh-history-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1024px) {
  .cards-grid-layout { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .machine-id-bar { flex-direction: column; text-align: center; gap: 15px; }
}

/* Features Guide Styles */
.features-guide-section {
  margin-top: 1rem;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 10px;
}

.guide-icon { font-size: 1.5rem; }
.guide-header h3 { color: #fff; margin: 0; font-size: 1.1rem; font-weight: 800; }

.features-grid-mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.feature-item-mini {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.f-icon-wrap {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.f-icon-wrap.cyan { background: rgba(0, 229, 255, 0.1); color: #00e5ff; }
.f-icon-wrap.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.f-icon-wrap.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.f-icon-wrap.gold { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.f-text strong { display: block; color: #fff; font-size: 0.95rem; margin-bottom: 4px; }
.f-text p { color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5; }

@media (max-width: 768px) {
  .features-grid-mini { grid-template-columns: 1fr; }
}

/* Serials Management Styles */
.serials-management-section {
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 20px;
}

.serials-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.s-h-left { display: flex; align-items: center; gap: 12px; color: #00e5ff; }
.s-h-left h3 { font-size: 1.3rem; font-weight: 800; margin: 0; }
.badge-count { background: rgba(0, 229, 255, 0.1); color: #00e5ff; padding: 4px 12px; border-radius: 50px; font-size: 0.85rem; font-weight: 800; border: 1px solid rgba(0, 229, 255, 0.2); }

.serials-desc { color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem; line-height: 1.6; }

.serials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.serial-card {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: 0.3s;
}

.serial-card.used { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.02); }

.serial-info { display: flex; flex-direction: column; gap: 5px; }
.s-label { font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase; }
.s-code { color: #00e5ff; font-size: 1.4rem; font-weight: 900; font-family: monospace; cursor: pointer; letter-spacing: 2px; }

.serial-status { font-size: 0.85rem; font-weight: 700; }
.status-unused { color: #f59e0b; }
.status-used { color: #10b981; }

.btn-copy-serial {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}

.btn-copy-serial:hover { background: #00e5ff; color: #000; border-color: #00e5ff; }
</style>
