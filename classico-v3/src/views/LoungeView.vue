<template>
  <div class="dashboard-wrapper" style="display: flex !important; gap: 8px !important; height: 100% !important; direction: rtl !important;">
    <!-- Sidebar -->
    <aside class="sidebar glass-panel">
      <!-- Invoice Settings -->
      <div class="sidebar-section">
        <h2 class="section-title">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🧾</span>
            <span>إعدادات الفاتورة</span>
          </span>
          <span v-if="selectedInvoice" style="opacity: 0.3; margin: 0 0.5rem;">|</span>
          <span class="device-badge-premium" v-if="selectedInvoice">{{ selectedInvoice.name }}</span>
        </h2>
        <div class="action-buttons" style="margin-top: 1rem;">
          <button @click="payAndCloseInvoice" class="btn success-btn"
            style="width: 100%; font-size: 1.1rem; padding: 0.8rem;" :disabled="!selectedInvoice || !store.canAccess('lounge', 'edit')">
            ترحيل \سداد وإنهاء الفاتورة 💸
          </button>
        </div>
      </div>

      <!-- Elegant Modern Divider -->
      <div class="section-divider-modern"></div>

      <!-- Add Orders Section -->
      <div class="sidebar-section" style="margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
          <h2 class="section-title" style="margin:0;"><span>🛒</span> إضافة طلبات (الصالة)</h2>
          <button @click="showFullOrders" class="btn secondary-btn"
            style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" :disabled="!selectedInvoice">👁️ عرض الكل</button>
        </div>
        
        <div class="form-group">
          <label>الصنف</label>
          <div class="searchable-select">
            <input type="text" v-model="itemSearchQuery" @focus="showMenuDropdown = true" 
              placeholder="بحث عن صنف..." autocomplete="off" :disabled="!selectedInvoice">
            <div v-if="showMenuDropdown && filteredMenu.length" class="options-list glass-panel">
              <div v-for="item in filteredMenu" :key="item.id" class="option-item" @click="selectItem(item)">
                {{ item.name }} ({{ item.price }} ج)
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
          <div class="form-group" style="width: 110px;">
            <label>الكمية</label>
            <div class="qty-control">
              <button class="qty-btn" @click="itemQty > 1 ? itemQty-- : null" :disabled="!selectedInvoice || !store.canAccess('lounge', 'edit')">-</button>
              <input type="number" class="qty-input" v-model="itemQty" min="1" :disabled="!selectedInvoice || !store.canAccess('lounge', 'edit')">
              <button class="qty-btn" @click="itemQty++" :disabled="!selectedInvoice || !store.canAccess('lounge', 'edit')">+</button>
            </div>
          </div>
          <button @click="addOrderItem" class="btn primary-btn" style="flex: 1;" :disabled="!selectedInvoice || !selectedMenuItem || !store.canAccess('lounge', 'edit')">إضافة</button>
        </div>

        <!-- Selected Invoice Items Preview -->
        <div style="max-height: 250px; overflow-y: auto; margin-top: 1rem; border: 1px solid var(--border-color); border-radius: 6px;">
          <table v-if="selectedInvoice">
            <tbody>
              <tr v-for="(order, index) in selectedInvoice.orders" :key="index">
                <td>{{ order.name }}</td>
                <td>{{ order.qty }}</td>
                <td class="highlight">{{ formatCurrency(order.total) }}</td>
                <td><button v-if="store.canAccess('lounge', 'edit')" @click="removeOrderItem(index)" class="btn-icon">✖</button></td>
              </tr>
            </tbody>
          </table>
          <div v-else style="padding: 2rem; text-align: center; color: var(--text-muted);">
            برجاء اختيار فاتورة لعرض الطلبات
          </div>
        </div>
        <div v-if="selectedInvoice" class="highlight" style="margin-top: 10px; display: flex; justify-content: space-between;">
          <span>إجمالي الطلبات:</span>
          <span>{{ formatCurrency(activeInvoiceTotal) }} ج</span>
        </div>
      </div>
    </aside>

    <!-- Main Area -->
    <main class="main-area glass-panel">
      <div class="table-container" style="flex: 1; overflow-y: auto; border: 1px solid var(--border-color); margin-bottom: 1rem;">
        <table class="devices-table">
          <thead style="position: sticky; top: 0; z-index: 10; background: var(--bg-panel);">
            <tr>
              <th>اسم الفاتورة / الطاولة</th>
              <th>وقت الإنشاء</th>
              <th>قيمة الطلبات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in loungeInvoices" :key="inv.id" :class="{ selected: selectedInvoiceId === inv.id }" @click="selectedInvoiceId = inv.id">
              <td style="position: relative;">
                <button v-if="store.canAccess('lounge', 'edit')" @click.stop="deleteInvoice(inv)" class="btn-icon floating-del">✖</button>
                ☕ {{ inv.name }}
              </td>
              <td>{{ formatTimeStr(inv.startTime) }}</td>
              <td class="highlight">{{ formatCurrency(calculateInvoiceTotal(inv)) }}</td>
              <td>
                <button @click.stop="selectedInvoiceId = inv.id" class="btn secondary-btn">تحديد</button>
              </td>
            </tr>
            <tr v-if="!loungeInvoices.length">
              <td colspan="4" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                لا توجد فواتير صالة مفتوحة حالياً. اضغط على الزر أدناه لفتح فاتورة جديدة.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="main-actions-modern" style="margin-top: auto;">
        <button v-if="store.canAccess('lounge', 'edit')" @click="createNewInvoice" class="btn secondary-btn" style="background: #3b82f6 !important;">
          <span class="icon">☕</span> + فاتورة صالة جديدة
        </button>
      </div>
    </main>

    <!-- Full Orders Modal (Summary) -->
    <div v-if="showOrdersModal" class="overlay" @click.self="showOrdersModal = false">
      <div class="modal glass-panel" style="max-width: 500px;">
        <div class="modal-header">
          <h2>ملخص طلبات: {{ selectedInvoice?.name }}</h2>
          <button @click="showOrdersModal = false" class="btn-icon">✖</button>
        </div>
        <div class="table-container" style="max-height: 400px; overflow-y: auto;">
          <table>
            <thead>
              <tr>
                <th style="text-align: right;">الصنف</th>
                <th style="text-align: center;">الكمية</th>
                <th style="text-align: left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in selectedInvoice?.orders" :key="index">
                <td style="text-align: right;">{{ order.name }}</td>
                <td style="text-align: center;">{{ order.qty }}</td>
                <td style="text-align: left; color: var(--accent-cyan);">{{ formatCurrency(order.total) }} ج</td>
              </tr>
              <tr v-if="!selectedInvoice?.orders.length">
                <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">لا توجد طلبات حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="grand-total-row" style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 12px; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.2rem; color: var(--accent-cyan);">
          <span>إجمالي الحساب:</span>
          <span>{{ formatCurrency(activeInvoiceTotal) }} ج</span>
        </div>
      </div>
    </div>

    <!-- Invoice Modal (Checkout) -->
    <div v-if="showInvoiceModal" class="overlay">
      <div class="modal glass-panel" style="width: 550px; padding: 2rem;">
        <div class="modal-header" style="border: none;">
          <h2 style="color: var(--accent-cyan);">فاتورة صالة - {{ invoiceData.name }}</h2>
          <button @click="showInvoiceModal = false" class="btn-icon" style="color: #ef4444;">✖</button>
        </div>
        
          <div class="invoice-details">
            <div class="invoice-summary-box-v3">
              <div class="invoice-row" style="justify-content: flex-end; margin-bottom: 0;">
                 <span style="color: var(--text-main);">وقت البدء {{ formatTimeStr(invoiceData.startTime) }}</span>
              </div>
            </div>

            <div class="invoice-breakdown-v3">
              <div class="breakdown-item">
                <span class="label">🛒 إجمالي الطلبات:</span>
                <span class="val">{{ formatCurrency(invoiceData.total) }} ج</span>
              </div>
            </div>
            
            <div style="text-align: left; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
              <h4 style="color: var(--text-muted); margin-bottom: 0.8rem; font-size: 0.9rem;">📦 تفاصيل الطلبات</h4>
              <div v-for="(o, i) in invoiceData.orders" :key="i" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-bottom: 0.3rem; font-size: 0.9rem; opacity: 0.8;">
                <span>{{ o.qty }}x {{ o.name }}</span>
                <span style="color: var(--text-muted);">{{ formatCurrency(o.total) }} ج</span>
              </div>
            </div>
            
            <div class="invoice-divider-elegant"></div>
            <div class="total-amount-row-premium">
              <span class="label">الإجمالي النهائي</span>
              <span class="value" style="font-size: 1.7rem;">{{ formatCurrency(invoiceData.total) }} ج</span>
            </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 2.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1;">
              <button @click="printInvoice(true)" class="btn secondary-btn" style="background: #3b82f6 !important; padding: 0.8rem; font-size: 1.1rem; width: 100%;">
                🖨️ طباعة الفاتورة
              </button>
            </div>
            <button v-if="store.canAccess('lounge', 'edit')" @click="confirmPayment" class="btn success-btn" style="flex: 1.2; padding: 0.8rem; font-size: 1.1rem; background: #10b981 !important;">
              💸 تحصيل نقدي وأرشفة
            </button>
          </div>

          <hr style="border: none; border-top: 2px dashed rgba(255,255,255,0.1); margin: 1.5rem 0;">

          <!-- Debt Section -->
          <div style="text-align: right; margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">إرسال المديونية لحساب عميل:</label>
            <div style="display: flex; gap: 0.5rem;">
              <select v-model="targetClientId" class="input-field" style="flex: 2; background: #0f172a; border-color: rgba(255,255,255,0.1); padding: 0.6rem;">
                <option value="">اختر العميل...</option>
                <option v-for="c in clientsDir" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <button @click="sendToCustomerAccount" class="btn primary-btn" style="flex: 1; background: #3b82f6 !important; white-space: nowrap; padding: 0.6rem 1rem;" :disabled="!targetClientId">
                👤 إرسال للحساب
              </button>
            </div>
          </div>

          <!-- Transfer to Device Section -->
          <div style="text-align: right; margin-bottom: 0.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">إرسال المديونية لحساب جهاز & ترابيزه:</label>
            <div style="display: flex; gap: 0.5rem;">
              <select v-model="targetDeviceId" class="input-field" style="flex: 2; background: #0f172a; border-color: rgba(255,255,255,0.1); padding: 0.6rem;">
                <option value="">اختر الجهاز / الترابيزة...</option>
                <option v-for="d in store.devices" :key="d.id" :value="d.id" :disabled="d.status !== 'running'" :style="d.status !== 'running' ? 'color: #475569; background: #1e293b;' : ''">
                  {{ d.name }} {{ d.status === 'running' ? '🟢 (نشط)' : '⚪ (غير نشط)' }}
                </option>
              </select>
              <button @click="transferToDevice" class="btn primary-btn" style="flex: 1; background: #8b5cf6 !important; white-space: nowrap; padding: 0.6rem 1rem;" :disabled="!targetDeviceId">
                🔄 {{ transferButtonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';
import { printUnifiedInvoice, printOrderBon } from '../utils/printSystem';

const store = useAppStore();
const ui = useUIStore();

const selectedInvoiceId = ref(null);
const itemSearchQuery = ref('');
const itemQty = ref(1);
const selectedMenuItem = ref(null);
const showMenuDropdown = ref(false);

const showInvoiceModal = ref(false);
const showOrdersModal = ref(false);
const invoiceData = ref(null);
const targetClientId = ref('');
const targetDeviceId = ref('');

const transferButtonText = computed(() => {
  if (!targetDeviceId.value) return 'ترحيل للجهاز / الترابيزة';
  const device = store.getDeviceById(targetDeviceId.value);
  if (!device) return 'ترحيل للجهاز / الترابيزة';
  
  if (device.name.includes('بلياردو') || device.name.includes('تنس طاولة') || device.name.includes('ترابيزة')) {
    return `ترحيل لـ ${device.name}`;
  }
  return `ترحيل لـ ${device.name}`;
});

const clientsDir = computed(() => store.clientsDir);

const showFullOrders = () => {
  if (selectedInvoice.value) {
    showOrdersModal.value = true;
  }
};

const sendToCustomerAccount = () => {
  if (!targetClientId.value || !invoiceData.value) return;
  
  const client = store.clientsDir.find(c => c.id === targetClientId.value);
  if (!client) return;

  // Check if customer account exists for this client
  let customer = store.customers.find(cust => cust.clientId === client.id);
  
  if (!customer) {
    // Automatically open account if it doesn't exist
    customer = {
      id: Date.now(),
      clientId: client.id,
      name: client.name,
      ledger: []
    };
    store.customers.push(customer);
  }

  // Add debt record
  customer.ledger.push({
    id: Date.now() + 1,
    type: 'debt',
    amount: invoiceData.value.total,
    note: `فاتورة صالة: ${invoiceData.value.name}`,
    timestamp: new Date().toISOString()
  });

  store.updateCustomer(customer);
  
  // Archive Lounge Invoice as 'debt'
  store.addLoungeHistoryRecord({
    name: invoiceData.value.name,
    startTime: invoiceData.value.startTime,
    endTime: new Date().toISOString(),
    orders: invoiceData.value.orders,
    total: invoiceData.value.total,
    paymentType: 'debt',
    processedBy: store.session.username
  });

  store.deleteLoungeInvoice(invoiceData.value.id);
  selectedInvoiceId.value = null;
  showInvoiceModal.value = false;
  targetClientId.value = '';
  ui.showToast(`تم ترحيل الفاتورة لحساب العميل "${client.name}" بنجاح ✅`);
};

const transferToDevice = () => {
  if (!targetDeviceId.value || !invoiceData.value) return;
  
  const device = store.getDeviceById(targetDeviceId.value);
  if (!device || device.status !== 'running') {
    ui.showToast('عذراً، يجب أن يكون الجهاز نشطاً للترحيل إليه ⚠️', 'warning');
    return;
  }

  // Clone device to update
  const updatedDevice = { ...device };
  
  // Merge orders
  invoiceData.value.orders.forEach(newOrder => {
    const existing = updatedDevice.orders.find(o => o.itemId === newOrder.itemId);
    if (existing) {
      existing.qty += newOrder.qty;
      existing.total = existing.qty * existing.price;
    } else {
      updatedDevice.orders.push({ ...newOrder });
    }
  });

  store.updateDevice(updatedDevice);
  
  // Delete lounge invoice
  store.deleteLoungeInvoice(invoiceData.value.id);
  
  selectedInvoiceId.value = null;
  showInvoiceModal.value = false;
  targetDeviceId.value = '';
  ui.showToast(`تم ترحيل طلبات الصالة إلى "${device.name}" بنجاح 🚀✅`);
};

const loungeInvoices = computed(() => store.loungeInvoices);
const menu = computed(() => store.menu);

const selectedInvoice = computed(() => store.loungeInvoices.find(i => i.id === selectedInvoiceId.value));

const filteredMenu = computed(() => {
  if (!itemSearchQuery.value) return menu.value;
  return menu.value.filter(m => m.name.toLowerCase().includes(itemSearchQuery.value.toLowerCase()));
});

const activeInvoiceTotal = computed(() => {
  if (!selectedInvoice.value) return 0;
  return selectedInvoice.value.orders.reduce((sum, o) => sum + o.total, 0);
});

const calculateInvoiceTotal = (inv) => {
  return inv.orders.reduce((sum, o) => sum + o.total, 0);
};

const createNewInvoice = async () => {
  const name = await ui.confirm({
    title: 'فتح فاتورة جديدة',
    message: 'أدخل اسم الفاتورة أو الطاولة (اختياري):',
    showInput: true,
    inputValue: '',
    inputPlaceholder: 'مثلاً: طاولة 5'
  });
  
  if (name === false) return; // Cancelled

  let finalName = name ? name.trim() : '';
  if (!finalName) {
    const allInvoices = [...store.loungeInvoices, ...store.loungeHistory];
    let maxNum = 100;
    allInvoices.forEach(inv => {
      const match = inv.name.match(/فاتورة #(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    finalName = `فاتورة #${maxNum + 1}`;
  }

  const newInv = {
    id: Date.now(),
    name: finalName,
    startTime: new Date().toISOString(),
    orders: []
  };
  store.addLoungeInvoice(newInv);
  selectedInvoiceId.value = newInv.id;
};

const deleteInvoice = async (inv) => {
  const confirmed = await ui.confirm({
    title: 'حذف فاتورة',
    message: `هل تريد حذف فاتورة ${inv.name} بشكل نهائي؟`,
    type: 'danger'
  });
  if (confirmed) {
    store.deleteLoungeInvoice(inv.id);
    if (selectedInvoiceId.value === inv.id) selectedInvoiceId.value = null;
    ui.showToast('تم حذف الفاتورة بنجاح');
  }
};

const selectItem = (item) => {
  selectedMenuItem.value = item;
  itemSearchQuery.value = item.name;
  showMenuDropdown.value = false;
};

const addOrderItem = () => {
  if (!selectedMenuItem.value || !selectedInvoice.value) return;

  const inv = { ...selectedInvoice.value };
  const existing = inv.orders.find(o => o.itemId === selectedMenuItem.value.id);

  if (existing) {
    existing.qty += itemQty.value;
    existing.total = existing.qty * existing.price;
  } else {
    inv.orders.push({
      itemId: selectedMenuItem.value.id,
      name: selectedMenuItem.value.name,
      price: selectedMenuItem.value.price,
      qty: itemQty.value,
      total: selectedMenuItem.value.price * itemQty.value
    });
  }

  store.updateLoungeInvoice(inv);
  
  // Quick Bon Print (Disabled as per user request)
  // printOrderBon(inv.name, { name: selectedMenuItem.value.name, qty: itemQty.value });

  itemQty.value = 1;
  itemSearchQuery.value = '';
  selectedMenuItem.value = null;
};

const removeOrderItem = (index) => {
  const inv = { ...selectedInvoice.value };
  inv.orders.splice(index, 1);
  store.updateLoungeInvoice(inv);
};

const payAndCloseInvoice = () => {
  const inv = selectedInvoice.value;
  const total = calculateInvoiceTotal(inv);
  
  invoiceData.value = {
    id: inv.id,
    name: inv.name,
    startTime: inv.startTime,
    orders: [...inv.orders],
    total: total
  };
  showInvoiceModal.value = true;
};

const confirmPayment = () => {
  const data = invoiceData.value;
  store.addLoungeHistoryRecord({
    name: data.name,
    startTime: data.startTime,
    endTime: new Date().toISOString(),
    orders: data.orders,
    total: data.total,
    paymentType: 'cash',
    processedBy: store.session.username
  });
  
  store.deleteLoungeInvoice(data.id);
  selectedInvoiceId.value = null;
  showInvoiceModal.value = false;
  ui.showToast(`تم تحصيل فاتورة ${data.name} بنجاح ✅`);
};

const printInvoice = (isQuick = false) => {
  if (!invoiceData.value) return;
  const data = invoiceData.value;
  printUnifiedInvoice({
    deviceName: null, // It's lounge
    loungeName: data.name,
    orders: data.orders,
    ordersCost: data.total,
    timeCost: 0,
    totalCost: data.total,
    processedBy: store.session.username,
    paymentType: 'cash'
  }, isQuick);
};

const printCurrentState = () => {
  if (!selectedInvoice.value) return;
  const inv = selectedInvoice.value;
  printUnifiedInvoice({
    deviceName: null,
    loungeName: inv.name,
    orders: [...inv.orders],
    ordersCost: calculateInvoiceTotal(inv),
    timeCost: 0,
    totalCost: calculateInvoiceTotal(inv),
    processedBy: store.session.username,
    paymentType: 'current'
  }, true);
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatTimeStr = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

onMounted(() => {
  if (store.loungeInvoices.length > 0) {
    selectedInvoiceId.value = store.loungeInvoices[0].id;
  }
});

// Click outside logic for dropdown
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.searchable-select')) {
      showMenuDropdown.value = false;
    }
  });
}
</script>

<style scoped>
.options-list {
  position: absolute;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  background: #1e293b; /* Opaque Dark Blue */
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 5px;
}
.section-title {
  font-size: 1.1rem;
  color: var(--text-main);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.device-badge-premium {
  background: rgba(0, 229, 255, 0.1);
  color: var(--accent-cyan);
  padding: 0.3rem 1.2rem;
  border-radius: 8px;
  font-size: 1.15rem;
  font-weight: 900;
  border: 1px solid rgba(0, 229, 255, 0.4);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.15);
}
.highlight { color: var(--accent-cyan); font-weight: bold; }
.option-item {
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
}
.option-item:hover {
  background: var(--bg-hover);
}
.success-btn {
  background: var(--accent-success) !important;
}

/* Custom Quantity Control */
.qty-control {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  height: 38px;
}
.qty-btn {
  background: rgba(255, 255, 255, 0.05);
  color: var(--accent-cyan);
  border: none;
  width: 32px;
  height: 100%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.qty-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.2);
}
.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.qty-input {
  width: 40px !important;
  text-align: center;
  border: none !important;
  background: transparent !important;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  padding: 0 !important;
  height: 100%;
}
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.qty-input[type=number] {
  -moz-appearance: textfield;
}
</style>
