<template>
  <div class="waiting-page">
    <div class="waiting-card glass-panel">
      <div class="status-icon">⏳</div>
      <h2>طلبك قيد المراجعة الآن</h2>
      <p>شكراً لثقتك بنا! لقد تلقينا طلب اشتراكك وصورة التحويل.</p>
      <div class="info-box">
        <p>يتم الآن مراجعة بياناتك من قبل الإدارة. سيتم تفعيل حسابك تلقائياً فور التأكد من عملية الدفع.</p>
        <p class="hint">عادة ما تستغرق هذه العملية من 15 دقيقة إلى ساعتين كحد أقصى.</p>
      </div>
      <div class="machine-id">معرف جهازك: <span>{{ machineId }}</span></div>
      <div class="waiting-actions">
        <button class="btn-refresh" @click="checkStatus">تحديث الحالة 🔄</button>
        <button class="btn-back-plans" @click="router.push('/subscriptions')">العودة للباقات ⬅️</button>
      </div>
      <p class="support-text">للدعم الفني السريع: <span>01094085228</span></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';

const router = useRouter();
const store = useAppStore();
const ui = useUIStore();
const machineId = ref('');
let pollInterval = null;

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/system/machine-id');
    machineId.value = res.data.id;

    // Initial check
    await checkStatus();

    // Polling Fallback (Every 10 seconds)
    pollInterval = setInterval(checkStatus, 10000);
  } catch (err) {
    console.error('Error fetching machine ID:', err);
  }
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

const checkStatus = async () => {
  if (!machineId.value) return;
  try {
    const status = await store.checkSubscription();

    if (status === 'active') {
      if (pollInterval) clearInterval(pollInterval);
      const planName = store.subscriptionData?.plan_type === 'trial' ? 'تجربة مجانية' : 
                       store.subscriptionData?.plan_type === 'monthly' ? 'باقة شهرية' : 'باقة سنوية';
      ui.showCelebration(`لقد تم تفعيل اشتراكك بنجاح! نتمى لك تجربة رائعة مع كلاسيكو.`, planName);
      setTimeout(() => router.push('/login'), 2000);
    }
  } catch (err) {
    console.error('Check status error:', err);
  }
};
</script>

<style scoped>
.waiting-page {
  min-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
}

.waiting-card {
  max-width: 600px;
  padding: 4rem;
  border-radius: 30px;
}

.status-icon { font-size: 5rem; margin-bottom: 2rem; animation: pulse 2s infinite; }

h2 { color: #fff; font-size: 2.2rem; margin-bottom: 1rem; }
p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }

.info-box {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  padding: 1.5rem;
  border-radius: 15px;
  margin: 2rem 0;
}

.hint { font-size: 0.9rem; color: #10b981; margin-top: 0.5rem; }

.machine-id { font-size: 0.9rem; color: #64748b; margin-bottom: 2rem; }
.machine-id span { color: #00e5ff; font-weight: bold; }

.waiting-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-refresh {
  background: #10b981;
  border: none;
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.btn-refresh:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); }

.btn-back-plans {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.btn-back-plans:hover { background: rgba(255,255,255,0.05); }

.support-text { font-size: 0.9rem; }
.support-text span { color: #10b981; font-weight: bold; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
