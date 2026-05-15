<template>
  <div class="portal-wrapper">
    <!-- Login Screen -->
    <div v-if="!isLoggedIn" class="portal-login glass-panel">
      <h2>🔐 بوابة مالك النظام</h2>
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" v-model="loginForm.email" placeholder="emontal.33@yahoo.com">
      </div>
      <div class="form-group">
        <label>كلمة المرور</label>
        <input type="password" v-model="loginForm.password" placeholder="••••••••">
      </div>
      <button class="btn-login" @click="handleLogin">دخول البوابة</button>
    </div>

    <!-- Dashboard Screen -->
    <div v-else class="portal-dashboard">
      <header class="portal-header">
        <h1>📊 لوحة تحكم الاشتراكات</h1>
        <button class="btn-logout" @click="isLoggedIn = false">تسجيل خروج</button>
      </header>

      <div class="stats-row">
        <div class="stat-card">
          <span class="label">إجمالي المشتركين</span>
          <span class="value">{{ subscriptions.length }}</span>
        </div>
        <div class="stat-card">
          <span class="label">بانتظار التفعيل</span>
          <span class="value">{{ pendingRequests.length }}</span>
        </div>
      </div>

      <div class="requests-table glass-panel">
        <h3>📥 طلبات الاشتراك الجديدة</h3>
        <table>
          <thead>
            <tr>
              <th>معرف الجهاز (Machine ID)</th>
              <th>الباقة</th>
              <th>التاريخ</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in pendingRequests" :key="req.machine_id">
              <td><code>{{ req.machine_id }}</code></td>
              <td>{{ getPlanLabel(req.plan_type) }}</td>
              <td>{{ new Date(req.created_at).toLocaleString('ar-EG') }}</td>
              <td class="actions">
                <button class="btn-approve" @click="approveRequest(req)">✅ تفعيل</button>
                <button class="btn-reject" @click="rejectRequest(req)">❌ رفض</button>
              </td>
            </tr>
            <tr v-if="pendingRequests.length === 0">
              <td colspan="4" style="text-align: center; padding: 3rem; color: #64748b;">لا توجد طلبات معلقة حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 2. Active Subscriptions Management -->
      <div class="requests-table glass-panel" style="margin-top: 3rem;">
        <h3 style="color: #10b981;">✅ إدارة المشتركين النشطين</h3>
        <table>
          <thead>
            <tr>
              <th>المشترك (ID)</th>
              <th>الحالة</th>
              <th>الأيام المتبقية</th>
              <th>تعديل المدة (± أيام)</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sub in activeSubscriptions" :key="sub.machine_id">
              <td>
                <div style="font-weight: bold; color: #00e5ff;">{{ sub.machine_id }}</div>
                <div style="font-size: 0.8rem; color: #94a3b8;">ينتهي: {{ new Date(sub.expires_at).toLocaleDateString('ar-EG') }}</div>
              </td>
              <td><span class="badge active">نشط</span></td>
              <td style="font-weight: 900; color: #fff;">
                {{ calculateRemainingDays(sub.expires_at) }} يوم
              </td>
              <td>
                <div class="adjust-box">
                  <input type="number" v-model="dayAdjustments[sub.machine_id]" placeholder="مثال: 10 أو -5" class="adjust-input">
                </div>
              </td>
              <td>
                <button class="btn-update" @click="confirmAdjust(sub)">💾 تحديث</button>
                <button class="btn-delete-tiny" @click="confirmDelete(sub)">🗑️</button>
              </td>
            </tr>
            <tr v-if="activeSubscriptions.length === 0">
              <td colspan="5" style="text-align: center; padding: 3rem; color: #64748b;">لا يوجد مشتركون نشطون حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 🔔 Custom Alert Modal -->
    <div v-if="customAlert.show" class="portal-overlay">
      <div class="glass-panel alert-box" :class="customAlert.type">
        <div class="alert-icon">{{ customAlert.type === 'warning' ? '⚠️' : '🔔' }}</div>
        <h3>{{ customAlert.title }}</h3>
        <p>{{ customAlert.message }}</p>
        <div class="alert-actions">
          <button @click="customAlert.show = false" class="btn-cancel">إلغاء</button>
          <button @click="customAlert.onConfirm" class="btn-confirm">تأكيد الاستمرار</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUIStore } from '../../stores/uiStore';
import axios from 'axios';

const ui = useUIStore();
const isLoggedIn = ref(false);
const subscriptions = ref([]);
const loginForm = ref({ email: '', password: '' });
const dayAdjustments = ref({});

// Custom Alert State
const customAlert = ref({
  show: false,
  title: '',
  message: '',
  type: 'info',
  onConfirm: () => {}
});

const handleLogin = () => {
  if (loginForm.value.email === 'emontal.33@yahoo.com' && loginForm.value.password === 'EMOmoro30630') {
    isLoggedIn.value = true;
    fetchData();
  } else {
    ui.showToast('بيانات الدخول غير صحيحة!', 'error');
  }
};

const fetchData = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/admin/subscriptions/list', {
      password: loginForm.value.password
    });
    if (res.data) {
      subscriptions.value = res.data;
      res.data.forEach(s => {
        if (!dayAdjustments.value[s.machine_id]) dayAdjustments.value[s.machine_id] = 0;
      });
    }
  } catch (err) {
    ui.showToast('فشل في جلب البيانات من السيرفر', 'error');
  }
};

const pendingRequests = computed(() => 
  subscriptions.value.filter(s => s.status === 'pending')
);

const activeSubscriptions = computed(() => 
  subscriptions.value.filter(s => s.status === 'active')
);

const getPlanLabel = (type) => {
  const plans = { trial: 'تجربة مجانية', monthly: 'شهري', yearly: 'سنوي' };
  return plans[type] || type;
};

const calculateRemainingDays = (expiry) => {
  if (!expiry) return 0;
  const diff = new Date(expiry) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const approveRequest = async (req) => {
  const days = req.plan_type === 'yearly' ? 365 : (req.plan_type === 'monthly' ? 30 : 7);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);

  try {
    await axios.post('http://localhost:3000/api/admin/subscriptions/update', {
      password: loginForm.value.password,
      machine_id: req.machine_id,
      updates: {
        status: 'active',
        expires_at: expiry.toISOString(),
        device_limit: req.device_limit || (req.plan_type === 'yearly' ? 50 : 20)
      }
    });
    ui.showToast(`تم تفعيل الجهاز ${req.machine_id} بنجاح!`, 'success');
    fetchData();
  } catch (err) {
    ui.showToast('فشل في تفعيل الجهاز. تأكد من إعدادات السيرفر.', 'error');
  }
};

const confirmAdjust = (sub) => {
  const days = parseInt(dayAdjustments.value[sub.machine_id] || 0);
  if (days === 0) return ui.showToast('يرجى تحديد عدد الأيام!', 'warning');
  
  customAlert.value = {
    show: true,
    title: 'تعديل مدة الاشتراك',
    message: `هل أنت متأكد من ${days > 0 ? 'زيادة' : 'نقصان'} مدة الاشتراك بمقدار ${Math.abs(days)} يوم؟`,
    type: 'warning',
    onConfirm: () => adjustSubscription(sub, days)
  };
};

const adjustSubscription = async (sub, days) => {
  customAlert.value.show = false;
  
  const currentExpiry = new Date(sub.expires_at || new Date());
  currentExpiry.setDate(currentExpiry.getDate() + days);

  try {
    await axios.post('http://localhost:3000/api/admin/subscriptions/update', {
      password: loginForm.value.password,
      machine_id: sub.machine_id,
      updates: { expires_at: currentExpiry.toISOString() }
    });
    ui.showToast('تم تحديث مدة الاشتراك بنجاح!', 'success');
    dayAdjustments.value[sub.machine_id] = 0;
    fetchData();
  } catch (err) {
    ui.showToast('فشل في تحديث المدة.', 'error');
  }
};

const rejectRequest = async (req) => {
  try {
    await axios.post('http://localhost:3000/api/admin/subscriptions/delete', {
      password: loginForm.value.password,
      machine_id: req.machine_id
    });
    ui.showToast('تم حذف السجل بنجاح.', 'info');
    fetchData();
  } catch (err) {
    ui.showToast('فشل في عملية الحذف.', 'error');
  }
};

const confirmDelete = (sub) => {
  customAlert.value = {
    show: true,
    title: 'حذف اشتراك',
    message: `هل أنت متأكد من حذف اشتراك العميل ${sub.machine_id} نهائياً؟`,
    type: 'danger',
    onConfirm: async () => {
      customAlert.value.show = false;
      await rejectRequest(sub);
    }
  };
};

onMounted(() => {
  if (isLoggedIn.value) fetchData();
});
</script>

<style scoped>
.portal-wrapper {
  min-height: 100vh;
  background: #020617;
  color: #f8fafc;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.portal-login {
  max-width: 400px;
  margin: 10vh auto;
  padding: 3rem;
  border-radius: 20px;
}

.portal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.stats-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.5);
  padding: 2rem;
  border-radius: 16px;
  flex: 1;
  border: 1px solid rgba(255,255,255,0.05);
}

.stat-card .label { display: block; color: #94a3b8; font-size: 1rem; margin-bottom: 0.5rem; }
.stat-card .value { font-size: 2.5rem; font-weight: 900; color: #00e5ff; }

.requests-table {
  padding: 2rem;
  border-radius: 20px;
}

table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
th { text-align: right; padding: 1rem; border-bottom: 2px solid rgba(255,255,255,0.05); color: #94a3b8; }
td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }

.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
.badge.active { background: rgba(16, 185, 129, 0.2); color: #10b981; }

.adjust-input {
  width: 100px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
}

.btn-update {
  background: linear-gradient(135deg, #0ea5e9, #00e5ff);
  color: #000;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.btn-delete-tiny {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 10px;
}

.portal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.alert-box {
  width: 450px;
  padding: 2.5rem;
  text-align: center;
  border-radius: 24px;
}

.alert-icon { font-size: 3rem; margin-bottom: 1.5rem; }
.alert-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.alert-actions button { flex: 1; padding: 1rem; border-radius: 12px; font-weight: bold; cursor: pointer; border: none; }

.btn-cancel { background: rgba(255,255,255,0.05); color: #fff; }
.btn-confirm { background: #00e5ff; color: #000; }

.glass-panel.danger { border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 0 30px rgba(239, 68, 68, 0.1); }
.glass-panel.warning { border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: 0 0 30px rgba(245, 158, 11, 0.1); }

.btn-approve { background: #10b981; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-reject { background: #ef4444; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #94a3b8; }
.form-group input { width: 100%; padding: 0.8rem; border-radius: 8px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; }

.btn-login { width: 100%; padding: 1rem; background: #00e5ff; color: #000; border: none; border-radius: 8px; font-weight: 900; cursor: pointer; }
</style>
