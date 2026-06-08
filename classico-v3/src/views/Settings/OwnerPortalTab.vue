<template>
  <div class="owner-portal-tab">
    <!-- Header Section for Customer -->
    <div class="owner-header-v3">
      <div class="owner-info">
        <h3>👑 لوحة المالك</h3>
        <p>إدارة أجهزة اشتراكك المتعدد ({{ subscriptionCount }} أجهزة)</p>
      </div>
      <div class="owner-stats">
        <div class="o-stat">
          <span class="o-val">{{ activeDevices.length + 1 }}</span>
          <span class="o-label">أجهزة نشطة</span>
        </div>
        <div class="o-stat">
          <span class="o-val">{{ remainingSlots }}</span>
          <span class="o-label">خانات متبقية</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="owner-grid-v3 mt-6">
      <!-- 1. Serial Keys for Activation -->
      <div class="owner-card-v3">
        <div class="card-header-v3">
          <h4>🔑 مفاتيح التفعيل المتاحة</h4>
          <p>استخدم هذه الأكواد لتفعيل الأجهزة الإضافية في فروعك</p>
        </div>
        
        <div class="serials-list">
          <div v-for="key in unusedKeys" :key="key.id" class="serial-item-v3">
            <div class="s-code-box" @click="copyText(key.serial_key)">
              <span class="s-code">{{ key.serial_key }}</span>
              <span class="s-copy">📋 نسخ</span>
            </div>
            <!-- Name Input Field -->
            <div class="s-name-input-group">
              <input 
                type="text" 
                v-model="key.device_name" 
                placeholder="اسم الفرع / الجهاز"
                class="s-name-input"
              >
              <button @click="saveKeyName(key)" class="btn-save-name">💾 حفظ</button>
            </div>
            <div class="s-hint">صالح حتى: {{ formatDate(key.expires_at) }}</div>
          </div>
          <div v-if="!unusedKeys.length && remainingSlots > 0" class="empty-keys">
             جاري استخراج الأكواد... يرجى تحديث الصفحة 🔄
          </div>
          <div v-if="remainingSlots === 0" class="full-keys">
             ✅ تم استنفاد جميع خانات الاشتراك المتاحة.
          </div>
        </div>
      </div>

      <!-- 2. Linked Devices -->
      <div class="owner-card-v3">
        <div class="card-header-v3">
          <h4>🖥️ الأجهزة المرتبطة</h4>
          <p>الأجهزة التي تستخدم اشتراكك حالياً</p>
        </div>
        
        <div class="devices-list">
          <div class="device-item-v3 main">
            <div class="d-icon">🏠</div>
            <div class="d-info">
              <span class="d-name">الجهاز الرئيسي (الحالي)</span>
              <span class="d-id">{{ store.machineId }}</span>
            </div>
            <div class="d-status">نشط</div>
          </div>

          <div v-for="dev in usedKeys" :key="dev.id" class="device-item-v3">
            <div class="d-icon">🖥️</div>
            <div class="d-info">
              <span class="d-name">{{ dev.device_name || 'جهاز فرعي' }}</span>
              <span class="d-id">{{ dev.used_by }}</span>
              <div class="d-name-edit" style="margin-top: 5px; display: flex; gap: 5px;">
                 <input type="text" v-model="dev.device_name" placeholder="تعديل الاسم" style="font-size: 0.7rem; padding: 2px 5px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 4px; outline: none;">
                 <button @click="saveKeyName(dev)" style="font-size: 0.7rem; background: #00e5ff; color: #000; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">حفظ</button>
              </div>
            </div>
            <div class="d-status">نشط</div>
          </div>
        </div>
      </div>
    </div>

    <div class="owner-footer-v3 mt-6">
      <div class="footer-note">
        ⚠️ ملاحظة: هذه اللوحة تظهر لك فقط لأنك مشترك في باقة تعدد الأجهزة. يمكنك متابعة حالة أجهزتك هنا، ولكن التفعيل الأساسي للباقة يتم من قبل الإدارة.
      </div>
      <button class="btn-refresh-owner" @click="fetchMyKeys" :disabled="loading">
        {{ loading ? 'جاري التحديث...' : '🔄 تحديث البيانات' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';

const store = useAppStore();
const ui = useUIStore();
const loading = ref(false);
const myKeys = ref([]);

const subscriptionCount = computed(() => store.subscriptionData?.max_devices || 1);
const unusedKeys = computed(() => myKeys.value.filter(k => k.status === 'unused'));
const usedKeys = computed(() => myKeys.value.filter(k => k.status === 'used'));
const activeDevices = computed(() => usedKeys.value);
const remainingSlots = computed(() => Math.max(0, subscriptionCount.value - (activeDevices.value.length + 1)));

const fetchMyKeys = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/system/my-keys');
    myKeys.value = res.data.keys || [];
  } catch (err) {
    console.error("Failed to fetch keys:", err);
  } finally {
    loading.value = false;
  }
};

const saveKeyName = async (key) => {
  try {
    await axios.post('http://localhost:3000/api/system/update-key-name', {
      key_id: key.id,
      device_name: key.device_name
    });
    ui.showToast('تم حفظ اسم الجهاز بنجاح! ✅', 'success');
  } catch (err) {
    ui.showToast('فشل حفظ الاسم', 'error');
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '---';

const copyText = (text) => {
  navigator.clipboard.writeText(text);
  ui.showToast('تم نسخ كود التفعيل! 🔑', 'success');
};

onMounted(fetchMyKeys);
</script>

<style scoped>
.owner-portal-tab { padding: 1.5rem; animation: fadeIn 0.4s ease-out; }

.owner-header-v3 {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.owner-info h3 { font-size: 1.5rem; font-weight: 900; color: #fff; margin-bottom: 5px; }
.owner-info p { color: #94a3b8; font-size: 0.9rem; }

.owner-stats { display: flex; gap: 2rem; }
.o-stat { text-align: center; }
.o-val { display: block; font-size: 1.8rem; font-weight: 900; color: #00e5ff; line-height: 1; }
.o-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

.owner-grid-v3 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

.owner-card-v3 {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
}

.card-header-v3 h4 { color: #fff; font-size: 1.1rem; font-weight: 800; margin-bottom: 5px; }
.card-header-v3 p { color: #64748b; font-size: 0.8rem; margin-bottom: 1.5rem; }

.serial-item-v3 {
  background: rgba(15, 23, 42, 0.5);
  border: 1px dashed rgba(0, 229, 255, 0.3);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.s-code-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
}
.s-code-box:hover { opacity: 0.8; }
.s-code { font-family: monospace; font-size: 1.2rem; font-weight: 900; color: #00e5ff; letter-spacing: 2px; }
.s-copy { font-size: 0.75rem; color: #94a3b8; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; }

.s-name-input-group {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.s-name-input {
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
}
.s-name-input:focus { border-color: #00e5ff; }
.btn-save-name {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.btn-save-name:hover { background: #00e5ff; color: #000; }

.s-hint { font-size: 0.7rem; color: #475569; margin-top: 8px; }

.device-item-v3 {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 12px;
  margin-bottom: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
}
.device-item-v3.main { border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); }

.d-icon { font-size: 1.5rem; }
.d-info { flex: 1; display: flex; flex-direction: column; }
.d-name { font-size: 0.9rem; font-weight: 800; color: #fff; }
.d-id { font-family: monospace; font-size: 0.75rem; color: #64748b; }
.d-status { font-size: 0.75rem; color: #10b981; font-weight: 900; }

.owner-footer-v3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.2);
  border-radius: 12px;
}
.footer-note { font-size: 0.75rem; color: #64748b; max-width: 70%; line-height: 1.5; }
.btn-refresh-owner {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.3s;
}
.btn-refresh-owner:hover { background: rgba(255, 255, 255, 0.05); border-color: #00e5ff; color: #00e5ff; }

.empty-keys, .full-keys { text-align: center; padding: 2rem; color: #475569; font-style: italic; font-size: 0.9rem; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
