<template>
  <div class="payment-page">
    <div class="payment-container">
      
      <!-- Top Header -->
      <div class="payment-header-card glass-panel header-glow">
        <div class="ph-content">
          <div class="header-badge">خطوة التفعيل النهائية</div>
          <h2>تأكيد الاشتراك 💳</h2>
          <p>أكمل عملية الدفع الآمنة لتفعيل حسابك في Classico</p>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="payment-main-grid">
        
        <!-- Right Side: Details & Methods (Main Column for RTL) -->
        <div class="main-column">
          <div class="section-card glass-panel animate-in">
            <h3 class="section-title">
              <span class="title-icon">💎</span>
              تفاصيل الاشتراك
            </h3>
            
            <div class="plan-banner">
              <div class="banner-item">
                <span class="banner-label">الباقة المختارة</span> 
                <span class="highlight">{{ getPlanLabel(plan) }}</span>
              </div>
              <div class="banner-sep"></div>
              <div class="banner-item">
                <span class="banner-label">عدد الأجهزة</span> 
                <span class="highlight">{{ devices }} أجهزة</span>
              </div>
              <div class="banner-sep"></div>
              <div class="banner-item">
                <span class="banner-label">المبلغ الإجمالي</span> 
                <span class="highlight total-price">{{ getPlanPrice(plan) }} ج.م</span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-with-icon">
                <span class="label-icon">🔒</span>
                <span>معرف الجهاز (Machine ID)</span>
              </label>
              <div class="input-wrapper disabled-input">
                <input type="text" :value="machineId" readonly>
              </div>
            </div>

            <div class="form-row-modern mt-4">
              <div class="form-group flex-1">
                <label class="label-with-icon">
                  <span class="label-icon">✨</span>
                  <span>رقم عملية التحويل</span>
                </label>
                <div class="input-wrapper main-input">
                  <input type="text" v-model="transactionId" placeholder="الرقم المرجعي (Ref ID)">
                </div>
              </div>
              
              <div class="form-group flex-1">
                <label class="label-with-icon">
                  <span class="label-icon">📱</span>
                  <span>رقم الهاتف المحول منه</span>
                </label>
                <div class="input-wrapper main-input">
                  <input type="text" v-model="paymentPhone" placeholder="01xxxxxxxxx">
                </div>
              </div>
            </div>
            <p class="helper-text">يجب إدخال رقم الهاتف الصحيح لتتمكن من تفعيل الأجهزة الإضافية لاحقاً</p>
          </div>

          <!-- Methods Selection - Larger Icons -->
          <div class="section-card glass-panel animate-in delay-1 mt-6">
            <h3 class="section-title">
              <span class="title-icon">💳</span>
              اختر وسيلة الدفع
            </h3>
            <div class="methods-grid">
              <div :class="['method-btn', 'voda-card', { active: selectedMethod === 'vodafone' }]" @click="selectedMethod = 'vodafone'">
                <div class="check-circle" v-if="selectedMethod === 'vodafone'">✓</div>
                <div class="m-icon-img">
                  <img src="../assets/images/cash.png.webp" alt="Vodafone Cash">
                </div>
                <div class="m-content">
                  <h4>فودافون كاش</h4>
                  <span class="m-hint">محفظة إلكترونية</span>
                </div>
              </div>

              <div :class="['method-btn', 'insta-card', { active: selectedMethod === 'instapay' }]" @click="selectedMethod = 'instapay'">
                <div class="check-circle" v-if="selectedMethod === 'instapay'">✓</div>
                <div class="m-icon-img">
                  <img src="../assets/images/insta.png" alt="InstaPay">
                </div>
                <div class="m-content">
                  <h4>انستا باي</h4>
                  <span class="m-hint">تحويل بنكي لحظي</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Left Side: Instructions & Action (Sidebar Column) -->
        <div class="sidebar-column animate-in delay-2">
          <div class="sticky-sidebar">
            <div class="instructions-box" :class="selectedMethod">
              <div class="i-header">
                <span class="i-pulse"></span>
                <span>خطوات التحويل:</span>
              </div>
              <ul class="i-list-custom">
                <li>
                  <span class="li-num">1</span>
                  <p>افتح تطبيق {{ selectedMethod === 'vodafone' ? 'أنا فودافون' : 'InstaPay' }}</p>
                </li>
                <li>
                  <span class="li-num">2</span>
                  <div class="acc-info">
                    <p>حول إلى هذا الرقم:</p>
                    <div class="copy-container" @click="copyText('01094085228')">
                      <span class="acc-number">01094085228</span>
                      <span class="copy-badge">نسخ 📋</span>
                    </div>
                  </div>
                </li>
                <li>
                  <span class="li-num">3</span>
                  <p>ادخل المبلغ المطلوب: <strong>{{ getPlanPrice(plan) }} ج.م</strong></p>
                </li>
                <li>
                  <span class="li-num">4</span>
                  <p>انسخ <strong>رقم العملية</strong> وضعه في الخانة المخصصة باليمين</p>
                </li>
              </ul>
            </div>

            <button class="btn-submit-payment" @click="confirmPayment" :disabled="loading || !transactionId">
              <span v-if="loading" class="loader-dots">جاري إرسال الطلب...</span>
              <div v-else class="btn-content">
                <span>تأكيد وإرسال الطلب</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>
            </button>

            <button class="btn-change-plan" @click="$router.push('/subscriptions')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>العودة لتغيير الباقة</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';
import axios from 'axios';


const route = useRoute();
const router = useRouter();
const store = useAppStore();
const ui = useUIStore();

const plan = route.query.plan || 'monthly';
const devices = parseInt(route.query.devices || '1');

const transactionId = ref('');
const paymentPhone = ref('');
const selectedMethod = ref('vodafone');
const loading = ref(false);

// Use machineId from store for maximum reliability
import { computed } from 'vue';
const machineId = computed(() => store.machineId || 'جاري الجلب...');

const getPlanLabel = (p) => {
  if (p === 'yearly') return 'الاشتراك السنوي (Vip)';
  if (p === 'monthly') return 'الاشتراك الشهري';
  return 'تجربة مجانية';
};

const getPlanPrice = (p) => {
  const base = p === 'yearly' ? 4500 : 400;
  return (base * devices).toLocaleString();
};

const copyText = (text) => {
  navigator.clipboard.writeText(text);
  ui.showToast('تم نسخ الرقم بنجاح! ✅', 'success');
};

const confirmPayment = async () => {
  // Prevent duplicate requests if already pending or active
  if (store.subscriptionStatus === 'pending') {
    return ui.showToast('لديك طلب اشتراك قيد الانتظار بالفعل! ⏳ يرجى انتظار التفعيل.', 'info');
  }
  if (store.subscriptionStatus === 'active') {
    return ui.showToast('اشتراكك مفعل بالفعل! ✅ لا داعي لإرسال طلب جديد.', 'success');
  }

  if (!transactionId.value || !paymentPhone.value) {
    return ui.showToast('يرجى إدخال رقم العملية ورقم الهاتف للتأكيد.', 'warning');
  }

  loading.value = true;
  try {
    const API_BASE = 'http://localhost:3000/api';
    const response = await axios.post(`${API_BASE}/system/subscription-request`, {
      plan_type: plan,
      amount: (plan === 'yearly' ? 4500 : 400) * devices,
      payment_method: selectedMethod.value,
      transaction_id: transactionId.value,
      phone_number: paymentPhone.value, // Added phone number
      max_devices: devices // Send number of devices
    });
    
    if (!response.data.success) throw new Error('Failed to send request');
    ui.showToast('تم إرسال طلب التفعيل بنجاح! ✨', 'success');
    router.push({ name: 'Waiting' });
  } catch (err) {
    console.error(err);
    ui.showToast('فشل في إرسال الطلب.', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0; left: 0;
  background: radial-gradient(circle at top right, #0f172a, #020617);
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  z-index: 9999;
  overflow-y: auto;
}

.payment-container {
  max-width: 1150px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .payment-main-grid {
    grid-template-columns: 1fr 400px;
    align-items: start;
  }
}

.glass-panel {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}

.payment-header-card {
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(124, 58, 237, 0.12));
  border: 1px solid rgba(0, 229, 255, 0.2);
  padding: 1rem !important;
}

.header-badge {
  background: rgba(0, 229, 255, 0.15);
  color: #00e5ff;
  display: inline-block;
  padding: 3px 12px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(0, 229, 255, 0.3);
}

.ph-content h2 { color: #fff; margin: 0; font-size: 1.6rem; font-weight: 900; letter-spacing: -0.5px; }
.ph-content p { color: #94a3b8; margin: 4px 0 0; font-size: 0.85rem; }

.section-title { font-size: 1.2rem; font-weight: 900; color: #fff; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 12px; }

.plan-banner {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 1.5rem;
}

.banner-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.banner-label { color: #64748b; font-size: 0.75rem; font-weight: 700; }
.banner-sep { width: 1px; height: 30px; background: rgba(255,255,255,0.15); }
.plan-banner .highlight { color: #fff; font-weight: 900; font-size: 1rem; }
.plan-banner .total-price { color: #00e5ff; font-size: 1.2rem; }

.form-group label { display: block; color: #94a3b8; margin-bottom: 8px; font-size: 0.9rem; font-weight: 800; }
.label-with-icon { display: flex; align-items: center; gap: 8px; }
.label-icon { font-size: 1.1rem; }

.input-wrapper input {
  width: 100%;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 12px 15px; /* Normalized padding */
  color: #fff;
  font-size: 1rem;
  transition: 0.3s;
}

.main-input input { border-color: rgba(0, 229, 255, 0.3); background: rgba(0, 229, 255, 0.05); }

.methods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.method-btn {
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: 0.4s;
  position: relative;
}

.m-icon-img img { width: 70px; height: 50px; object-fit: contain; }
.method-btn h4 { margin: 0; color: #fff; font-size: 1.1rem; font-weight: 900; }
.m-hint { color: #64748b; font-size: 0.8rem; }

.check-circle {
  position: absolute; top: -12px; right: -12px; 
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  color: #fff; font-size: 0.9rem; font-weight: 900;
  border: 2px solid rgba(255,255,255,0.4);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;
}

.voda-card.active .check-circle { background: linear-gradient(135deg, #e60000, #ff4d4d); box-shadow: 0 5px 20px rgba(230, 0, 0, 0.4); }
.insta-card.active .check-circle { background: linear-gradient(135deg, #7c3aed, #a78bfa); box-shadow: 0 5px 20px rgba(124, 58, 237, 0.4); }

@keyframes checkPop {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.instructions-box {
  background: rgba(15, 23, 42, 0.7);
  border-right: 5px solid #00e5ff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

/* Dynamic Colors Based on Method */
.instructions-box.vodafone { border-right-color: #e60000; background: rgba(230, 0, 0, 0.03); }
.instructions-box.instapay { border-right-color: #7c3aed; background: rgba(124, 58, 237, 0.03); }

.i-header { display: flex; align-items: center; gap: 10px; color: #fff; font-weight: 900; margin-bottom: 15px; font-size: 1.1rem; }
.i-pulse { width: 10px; height: 10px; background: #00e5ff; border-radius: 50%; animation: pulse 1.5s infinite; transition: all 0.3s; }
.vodafone .i-pulse { background: #e60000; box-shadow: 0 0 10px rgba(230, 0, 0, 0.5); }
.instapay .i-pulse { background: #7c3aed; box-shadow: 0 0 10px rgba(124, 58, 237, 0.5); }

.i-list-custom { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px; }
.i-list-custom li { display: flex; gap: 12px; align-items: flex-start; color: #94a3b8; font-size: 0.9rem; }
.li-num { 
  background: rgba(255,255,255,0.1); color: #fff; width: 24px; height: 24px; 
  border-radius: 6px; display: flex; justify-content: center; align-items: center; 
  font-weight: 900; flex-shrink: 0; transition: all 0.3s;
}
.vodafone .li-num { background: #e60000; color: #fff; }
.instapay .li-num { background: #7c3aed; color: #fff; }

.acc-info { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.copy-container {
  background: rgba(255,255,255,0.05);
  border: 1.5px dashed rgba(255,255,255,0.1);
  padding: 8px 15px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
  transition: all 0.3s;
}

/* Dynamic Acc Number Colors */
.vodafone .acc-number { color: #ff4d4d; }
.instapay .acc-number { color: #a78bfa; }
.acc-number { font-weight: 900; font-size: 0.9rem; letter-spacing: 0.5px; transition: all 0.3s; }
.copy-badge { font-size: 0.7rem; color: #fff; opacity: 0.9; }

.btn-submit-payment {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #00e5ff, #0ea5e9);
  color: #000;
  font-weight: 900;
  font-size: 1.15rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(0, 229, 255, 0.2);
}

.btn-change-plan {
  width: 100%;
  margin-top: 1rem;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-change-plan:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.form-row-modern {
  display: flex;
  gap: 1.5rem;
  width: 100%;
}

.flex-1 { flex: 1; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-in { animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; }
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 480px) {
  .plan-banner { flex-direction: column; gap: 20px; }
  .banner-sep { width: 60%; height: 1px; }
  .methods-grid { grid-template-columns: 1fr; }
}
</style>
