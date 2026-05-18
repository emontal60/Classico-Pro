<template>
  <div class="subscriptions-page">
    <button class="btn-refresh-status" @click="refreshStatus">
      <span>تحديث الحالة</span>
      <i class="icon">🔄</i>
    </button>
    <div class="pricing-header">
      <h2 class="ph-title">نظام متكامل لإدارة الكافيهات وصالات الألعاب</h2>
      <p class="ph-subtitle">حل شامل لإدارة البلايستيشن، البوفيه، وتعدد الفروع — آمن ومرتبط بجهازك</p>
      <div class="ph-hint-container">
        <a href="#features-section" @click.prevent="scrollToFeatures" class="features-badge-hint">
          اطلع على كل مزايا البرنامج بالأسفل 👇
        </a>
      </div>
    </div>

    <div class="pricing-cards-container">
      <!-- Trial Card -->
      <div class="pricing-card free-trial-card">
        <div class="card-header">
          <h3>🎁 تجربة مجانية</h3>
          <div class="price"><span>مجاناً</span> <small>/ 7 أيام</small></div>
        </div>
        <ul class="card-features">
          <li><span class="icon">✔️</span> تجربة كل المميزات بدون قيود</li>
          <li><span class="icon">🚀</span> ابدأ العمل وتعرف على النظام بنفسك</li>
        </ul>
        <button class="btn-subscribe btn-free-trial" @click="selectPlan('trial')">ابدأ تجربتك المجانية الآن 🚀</button>
      </div>

      <!-- Monthly Card -->
      <div class="pricing-card">
        <div class="card-header">
          <h3>الاشتراك الشهري</h3>
          <div class="price"><span>{{ 400 * monthlyDevices }}</span> ج.م <small>/ شهر</small></div>
        </div>
        <ul class="card-features">
          <li><span class="icon">✔️</span> جميع المميزات الأساسية</li>
          <li><span class="icon">➕</span> سعر ثابت للجهاز: 400 ج.م</li>
        </ul>
        
        <!-- Device Selector -->
        <div class="premium-device-selector">
          <label>عدد الأجهزة</label>
          <div class="counter-box">
            <button class="cnt-btn" @click="monthlyDevices > 1 ? monthlyDevices-- : null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <div class="cnt-display">
              <span class="cnt-num">{{ monthlyDevices }}</span>
              <span class="cnt-unit">جهاز</span>
            </div>
            <button class="cnt-btn" @click="monthlyDevices++">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <button class="btn-subscribe" @click="selectPlan('monthly', monthlyDevices)">اشترك شهرياً</button>
      </div>

      <!-- Yearly Card -->
      <div class="pricing-card featured">
        <div class="best-value-badge">الأكثر توفيراً 🌟</div>
        <div class="card-header">
          <h3>الاشتراك السنوي</h3>
          <div class="price"><span>{{ 4500 * yearlyDevices }}</span> ج.م <small>/ سنة</small></div>
        </div>
        <ul class="card-features">
          <li><span class="icon">✔️</span> جميع المميزات الأساسية</li>
          <li><span class="icon">➕</span> سعر ثابت للجهاز: 4500 ج.م</li>
        </ul>

        <!-- Device Selector -->
        <div class="premium-device-selector">
          <label>عدد الأجهزة</label>
          <div class="counter-box">
            <button class="cnt-btn" @click="yearlyDevices > 1 ? yearlyDevices-- : null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <div class="cnt-display">
              <span class="cnt-num">{{ yearlyDevices }}</span>
              <span class="cnt-unit">جهاز</span>
            </div>
            <button class="cnt-btn" @click="yearlyDevices++">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <button class="btn-subscribe featured-btn" @click="selectPlan('yearly', yearlyDevices)">اشترك سنوياً</button>
      </div>
    </div>

    <div id="features-section" class="features-section">
      <h3 class="section-title">🚀 مميزات النظام المتكامل</h3>
      <div class="features-grid">
        <!-- 1. أجهزة وترابيزات غير محدودة -->
        <div class="feature-item">
          <span class="f-icon">♾️</span>
          <div class="f-content">
            <h4>أجهزة وترابيزات غير محدودة</h4>
            <p>إدارة كاملة لكل الأجهزة والطاولات المسجلة بدون أي قيود تقنية</p>
          </div>
        </div>

        <!-- 2. إدارة البوفيه والطلبات -->
        <div class="feature-item">
          <span class="f-icon">🍔</span>
          <div class="f-content">
            <h4>إدارة البوفيه والطلبات السريعة</h4>
            <p>إضافة المنتجات وتسجيل الطلبات وحساب إجمالياتها بمرونة شديدة</p>
          </div>
        </div>

        <!-- 3. قائمة أسعار مرنة -->
        <div class="feature-item">
          <span class="f-icon">💰</span>
          <div class="f-content">
            <h4>قائمة أسعار مرنة</h4>
            <p>إمكانية كتابة وتخصيص الأسعار وسعر الساعة لكل جهاز يدوياً حسب رغبتك</p>
          </div>
        </div>

        <!-- 4. نظام الوقت مسبق الدفع والإنذار (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">⏳</span>
          <div class="f-content">
            <h4>نظام الدفع المسبق والإنذار <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>دعم تشغيل الأجهزة بوقت محدد مسبقاً، مع وميض إنذار مرئي وتنبيه عند اقتراب انتهاء الوقت</p>
          </div>
        </div>

        <!-- 5. حسابات العملاء (آجل) وإمكانية ترحيل طلبات من الصالة والأجهزة إلى آجل (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">📒</span>
          <div class="f-content">
            <h4>حسابات العملاء (آجل) وإمكانية ترحيل طلبات من الصالة والأجهزة إلى آجل <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>تسجيل وتتبع ديون الزبائن بدقة، مع إمكانية ترحيل وإرسال فواتير الأجهزة أو البوفيه والصالة مباشرة لحساب العميل الآجل لتسويتها لاحقاً.</p>
          </div>
        </div>

        <!-- 6. نظام الطباعة وبونات البوفيه (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">🖨️</span>
          <div class="f-content">
            <h4>الطباعة الحرارية المدمجة <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>إصدار فواتير حرارية منسقة وتلقائية مع إمكانية طباعة بون طلبات البوفيه للمطبخ فوراً</p>
          </div>
        </div>

        <!-- 7. النسخ الاحتياطي السحابي والمحلي (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">☁️</span>
          <div class="f-content">
            <h4>النسخ الاحتياطي الهجين <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>تأمين أرباحك وبياناتك عبر حفظ نسخ احتياطية محلياً وسحابياً على السحابة بنقرة واحدة</p>
          </div>
        </div>

        <!-- 8. مركز التحكم بظهور الصفحات -->
        <div class="feature-item">
          <span class="f-icon">👁️</span>
          <div class="f-content">
            <h4>مركز التحكم بظهور الصفحات</h4>
            <p>إمكانية إخفاء أو إظهار أقسام بأكملها من شاشات البرنامج ليناسب نشاطك بدقة</p>
          </div>
        </div>

        <!-- 9. دمج وترحيل حساب الصالة للأجهزة والعكس -->
        <div class="feature-item">
          <span class="f-icon">🔄</span>
          <div class="f-content">
            <h4>دمج وترحيل حساب الصالة للأجهزة والعكس</h4>
            <p>دمج وترحيل طلبات مشروبات الصالة مباشرة إلى الأجهزة والعكس لتسهيل الحساب وتجنب النسيان بنقرة واحدة.</p>
          </div>
        </div>

        <!-- 10. حساب سلف الموظفين والرواتب -->
        <div class="feature-item">
          <span class="f-icon">💵</span>
          <div class="f-content">
            <h4>سجل مسحوبات الموظفين والرواتب</h4>
            <p>تسجيل سلف الموظفين والمسحوبات اليومية من الدرج وتصفية رواتبهم بنهاية الوردية</p>
          </div>
        </div>

        <!-- 11. تقارير يومية وشاملة -->
        <div class="feature-item">
          <span class="f-icon">📊</span>
          <div class="f-content">
            <h4>تقارير يومية وشاملة للوردية</h4>
            <p>ملخصات دقيقة لأرباح الأجهزة والصالة، المصروفات والرواتب، وصافي المبالغ بالدرج</p>
          </div>
        </div>

        <!-- 12. أرشيف كامل للفواتير والعمليات -->
        <div class="feature-item">
          <span class="f-icon">📁</span>
          <div class="f-content">
            <h4>أرشيف كامل ومؤمن</h4>
            <p>إمكانية مراجعة أي فاتورة قديمة أو جلسة لعب سابقة بالتفصيل وتاريخ تشغيلها</p>
          </div>
        </div>

        <!-- 13. إدارة المصروفات -->
        <div class="feature-item">
          <span class="f-icon">📑</span>
          <div class="f-content">
            <h4>إدارة المصروفات</h4>
            <p>تسجيل كافة المصروفات التشغيلية والرواتب اليومية ومسحوبات الموظفين لمتابعة حركة الأموال بالكامل.</p>
          </div>
        </div>

        <!-- 14. صلاحيات الموظفين الدقيقة -->
        <div class="feature-item">
          <span class="f-icon">🔐</span>
          <div class="f-content">
            <h4>صلاحيات الموظفين الدقيقة</h4>
            <p>التحكم الكامل في تحديد ما يمكن لكل كاشير رؤيته، تعديله، أو إخفائه بالأقسام</p>
          </div>
        </div>

        <!-- 15. ربط السلاسل والفروع المتعددة للاطلاع والمراقبة (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">🏢</span>
          <div class="f-content">
            <h4>ربط السلاسل والفروع المتعددة للاطلاع والمراقبة <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>ربط فروعك وأجهزتك المتعددة بحساب مركزي واحد، مما يتيح لك كمشرف تصفية ومراقبة تقارير كل فرع على حدة، ومتابعة إيرادات الأجهزة والصالة وسجل العمليات لحظة بلحظة من مكانك.</p>
          </div>
        </div>

        <!-- 16. واجهة سهلة الاستخدام -->
        <div class="feature-item">
          <span class="f-icon">💡</span>
          <div class="f-content">
            <h4>واجهة سهلة الاستخدام</h4>
            <p>تصميم عصري ومريح للعين، يدعم الوضع الليلي والشاشات اللمسية لتوفير أسهل تجربة إدارة ممكنة.</p>
          </div>
        </div>

        <!-- 17. ذكاء الأعمال والتحليلات الرسومية (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">📈</span>
          <div class="f-content">
            <h4>تحليلات ذكاء الأعمال BI <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>رسومات بيانية تفاعلية (ApexCharts) تعرض ساعات الذروة، الأصناف الأكثر مبيعاً، وتطور أرباحك</p>
          </div>
        </div>

        <!-- 18. سجل النشاط والرقابة الكاملة -->
        <div class="feature-item">
          <span class="f-icon">📜</span>
          <div class="f-content">
            <h4>سجل الرقابة والنشاط الكامل</h4>
            <p>تسجيل كافة عمليات النظام (تسجيل الدخول، الخروج، وتعديل الفواتير) لحماية الكاش من السرقة</p>
          </div>
        </div>

        <!-- 19. الأرشفة الذكية وتخفيف قواعد البيانات -->
        <div class="feature-item">
          <span class="f-icon">⚡</span>
          <div class="f-content">
            <h4>الأرشفة التلقائية والصيانة</h4>
            <p>نظام ذكي لنقل السجلات القديمة للأرشيف للحفاظ على سرعة الصاروخ للبرنامج مدى الحياة</p>
          </div>
        </div>

        <!-- 20. تحديثات مستمرة للنظام -->
        <div class="feature-item">
          <span class="f-icon">🛠️</span>
          <div class="f-content">
            <h4>تحديثات مستمرة وتطوير دوري</h4>
            <p>متابعة ودعم مستمر للتطبيق وإطلاق تحسينات وإضافات مستمرة لزيادة مبيعاتك</p>
          </div>
        </div>

        <!-- 21. الاستشارة والدعم الفني المتكامل (⭐ ميزة حصرية) -->
        <div class="feature-item highlighted">
          <span class="f-icon">📞</span>
          <div class="f-content">
            <h4>الاستشارة والدعم الفني المتكامل <span class="badge-featured">⭐ ميزة حصرية</span></h4>
            <p>تقديم استشارات تشغيلية مجانية لمشروعك ودعم فني متواصل على مدار الساعة لحل أي مشكلة وضمان استمرارية العمل بأمان.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="machine-id-footer">
      <p>معرف الجهاز الحالي: <span>{{ store.machineId || 'جاري التحميل...' }}</span></p>
    </div>

    <!-- 🔑 Activate Additional Device Section -->
    <div class="activation-section-v3 glass-panel">
       <div class="act-header">
          <span class="icon">🔑</span>
          <h3>تفعيل جهاز إضافي</h3>
       </div>
       <p class="act-desc">إذا كان لديك اشتراك نشط لأكثر من جهاز، قم بإدخال كود التفعيل المولد ورقم الهاتف المستخدم في الدفع.</p>
       
       <div class="act-form">
          <div class="act-field">
             <label>كود التفعيل (Serial)</label>
             <input type="text" v-model="activationCode" placeholder="أدخل الكود المكون من 12 رقم">
          </div>
          <div class="act-field">
             <label>رقم الهاتف المرتبط بالدفع</label>
             <input type="text" v-model="activationPhone" placeholder="01xxxxxxxxx">
          </div>
          <button @click="activateAdditionalDevice" class="btn-activate-v3" :disabled="!activationCode || !activationPhone">
             تفعيل هذا الجهاز الآن ⚡
          </button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';

import axios from 'axios';

const ui = useUIStore();

const router = useRouter();
const store = useAppStore();

const scrollToFeatures = () => {
  const element = document.getElementById('features-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const refreshStatus = async () => {
  // 1. Show Splash Screen
  ui.triggerSplash(1200);
  
  // 2. Perform check in background
  try {
    await store.checkSubscription();
  } catch (err) {
    console.error('Check failed', err);
  }

  // 3. Show Result after splash ends
  setTimeout(() => {
    const status = store.subscriptionStatus;
    
    if (status === 'active') {
      const planName = store.subscriptionData?.plan_type === 'trial' ? 'تجربة مجانية' : 
                       store.subscriptionData?.plan_type === 'monthly' ? 'باقة شهرية' : 'باقة سنوية';
      ui.showCelebration(`لقد تم تفعيل اشتراكك بنجاح! نتمى لك تجربة رائعة مع كلاسيكو.`, planName);
      setTimeout(() => router.push('/login'), 2000);
    } else if (status === 'pending') {
      ui.showToast('طلب الاشتراك قيد المراجعة حالياً ⏳ سيتم التفعيل فور التأكد.', 'warning');
    } else if (status === 'expired') {
      ui.showToast('عذراً، انتهت مدة الاشتراك لهذا الجهاز 🛑 يرجى التجديد.', 'error');
    } else {
      ui.showToast('لم يتم العثور على اشتراك نشط لهذا الجهاز.', 'info');
    }
  }, 1300);
};


onMounted(async () => {
  try {
    // If status is checking, do a one-time check
    if (store.subscriptionStatus === 'checking') {
      await store.checkSubscription();
    }
    
    // Silent redirect if already active (no toast)
    // EXCEPT if they came here explicitly to renew (buy a new plan while current is still active)
    const isRenewing = router.currentRoute.value.query.renew === 'true';
    if (store.subscriptionStatus === 'active' && !isRenewing) {
      router.push('/login');
    }
  } catch (err) {
    console.error('Failed to initialize subscription view', err);
  }
});

const monthlyDevices = ref(1);
const yearlyDevices = ref(1);

const activationCode = ref('');
const activationPhone = ref('');

const activateAdditionalDevice = async () => {
  if (!activationCode.value || !activationPhone.value) return;
  
  ui.triggerSplash(1500);
  
  try {
    const API_BASE = 'http://localhost:3000/api';
    const response = await axios.post(`${API_BASE}/system/activate-additional`, {
      serial: activationCode.value,
      phone: activationPhone.value,
      machineId: store.machineId
    });

    if (response.data.success) {
      ui.showCelebration('تم تفعيل الجهاز الإضافي بنجاح! 🎉', 'باقة إضافية');
      await store.checkSubscription();
      setTimeout(() => router.push('/login'), 2000);
    } else {
      ui.showToast(response.data.message || 'فشل التفعيل، تأكد من الكود ورقم الهاتف.', 'error');
    }
  } catch (err) {
    console.error(err);
    ui.showToast('حدث خطأ أثناء الاتصال بالسيرفر.', 'error');
  }
};

const selectPlan = async (plan, devices = 1) => {
  // Global check before proceeding
  if (store.subscriptionStatus === 'pending') {
    return ui.showToast('لديك طلب اشتراك قيد الانتظار حالياً ⏳ يرجى انتظار التفعيل.', 'info');
  }
  if (store.subscriptionStatus === 'active') {
    return ui.showToast('جهازك مفعل بالفعل بموجب اشتراك نشط! ✅', 'success');
  }

  if (plan === 'trial') {
    try {
      // 1. Check if this machine already exists (via store/local server)
      await store.checkSubscription();
      if (store.subscriptionStatus !== 'none') {
        return ui.showToast('عذراً، لقد حصلت على التجربة المجانية لهذا الجهاز بالفعل.', 'warning');
      }

      // 2. If new, create pending trial request via server
      const API_BASE = 'http://localhost:3000/api';
      const response = await axios.post(`${API_BASE}/system/subscription-request`, {
        plan_type: 'trial',
        amount: 0,
        payment_method: 'طلب تجربة مجانية',
        transaction_id: 'FREE_TRIAL'
      });
      
      if (!response.data.success) throw new Error('Failed to send trial request');

      ui.showToast('تم إرسال طلب التجربة المجانية! ✨ جاري التحويل...', 'success');
      router.push({ name: 'Waiting' });
    } catch (err) {
      console.error(err);
      ui.showToast('فشل في إرسال طلب التجربة.', 'error');
    }
  } else {
    router.push({ name: 'Payment', query: { plan, machineId: store.machineId, devices } });
  }
};

</script>

<style scoped>
@import './Settings/SettingsStyle.css';

.subscriptions-page {
  min-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rem 2rem;
  text-align: center;
}

.btn-refresh-status {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  transition: 0.3s;
  backdrop-filter: blur(10px);
}

.btn-refresh-status:hover {
  background: var(--accent);
  color: #000;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
}

.pricing-header {
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.ph-title {
  font-size: 2.5rem;
  color: #fff;
  margin: 0;
  font-weight: 900;
  line-height: 1.3;
}

.ph-subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.ph-hint-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

.features-badge-hint {
  background: rgba(0, 229, 255, 0.08);
  color: #00e5ff;
  border: 1.5px solid rgba(0, 229, 255, 0.25);
  padding: 10px 28px;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pulse-hint 2s infinite;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.features-badge-hint:hover {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.35);
  transform: translateY(-3px);
}

@keyframes pulse-hint {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.45);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(0, 229, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 229, 255, 0);
  }
}

.features-section {
  max-width: 1200px;
  width: 100%;
  margin-top: 6rem;
  padding-top: 4rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.section-title { font-size: 2rem; color: #fff; margin-bottom: 3rem; font-weight: 900; }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-item {
  background: rgba(30, 41, 59, 0.5);
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  text-align: right;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-item:hover {
  background: rgba(30, 41, 59, 0.8);
  transform: translateY(-5px);
  border-color: rgba(0, 229, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.feature-item.highlighted {
  border: 1px solid rgba(0, 229, 255, 0.3);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(0, 229, 255, 0.03));
  box-shadow: 0 5px 20px rgba(0, 229, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.feature-item.highlighted::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #00e5ff, #7c3aed);
}

.badge-featured {
  background: rgba(0, 229, 255, 0.15);
  color: #00e5ff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 50px;
  border: 1px solid rgba(0, 229, 255, 0.3);
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

.f-icon { font-size: 2rem; }
.f-content h4 { color: #00e5ff; margin-bottom: 0.5rem; font-size: 1.1rem; }
.f-content p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }

.machine-id-footer {
  margin-top: 5rem;
  padding: 1rem 2rem;
  background: rgba(0, 229, 255, 0.05);
  border-radius: 50px;
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: #94a3b8;
  font-size: 0.9rem;
}

.machine_id-footer span { color: #00e5ff; font-weight: 900; margin-right: 10px; }

/* Premium Device Selector */
.premium-device-selector {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.premium-device-selector label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
}

.counter-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 5px;
  border-radius: 12px;
  gap: 10px;
}

.cnt-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #00e5ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.cnt-btn:hover {
  background: #00e5ff;
  color: #000;
}

.cnt-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.cnt-num {
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}

.cnt-unit {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 700;
}

.pricing-card {
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 229, 255, 0.15);
}

/* Activation Section Styles */
.activation-section-v3 {
  margin-top: 4rem;
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  border: 1px solid rgba(0, 229, 255, 0.2);
  text-align: right;
}

.act-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  color: #00e5ff;
}

.act-header h3 { font-size: 1.4rem; font-weight: 800; }
.act-desc { color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem; line-height: 1.6; }

.act-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.act-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.act-field label { color: #fff; font-size: 0.9rem; font-weight: 600; }
.act-field input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem;
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  text-align: center;
}

.act-field input:focus { border-color: #00e5ff; }

.btn-activate-v3 {
  background: #00e5ff;
  color: #000;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
}

.btn-activate-v3:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
  transform: scale(1.02);
}

.btn-activate-v3:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
