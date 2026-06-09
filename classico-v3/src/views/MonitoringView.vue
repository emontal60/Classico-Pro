<template>
  <div class="dashboard-wrapper" style="display: flex !important; gap: 8px !important; height: 100% !important; direction: rtl !important;">
    <!-- Sidebar -->
    <aside class="sidebar glass-panel">
      <div class="sidebar-section">
        <h2 class="section-title">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span>{{ selectedDevice ? getDeviceIcon(selectedDevice.name) : '⚙️' }}</span>
            <span>{{ settingsTitle }}</span>
          </span>
          <span v-if="selectedDevice" style="opacity: 0.3; margin: 0 0.5rem;">|</span>
          <span class="device-badge-premium" v-if="selectedDevice">{{ selectedDevice.name }}</span>
        </h2>
        
        <div class="form-group row">
          <label>سعر الساعة</label>
          <div class="input-with-symbol">
            <input type="number" v-model="deviceForm.hourPrice" :disabled="isDeviceRunning" min="0">
            <span class="symbol">ج</span>
          </div>
        </div>

        <div class="form-group row">
          <label>الدفع المسبق (Prepaid)</label>
          <input type="checkbox" v-model="deviceForm.isPrepaid" :disabled="isDeviceRunning">
        </div>

        <div v-if="deviceForm.isPrepaid" class="form-group row">
          <label>المدة (بالدقائق)</label>
          <input type="number" v-model="deviceForm.prepaidMinutes" :disabled="isDeviceRunning" min="1">
        </div>

        <div class="action-buttons" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <button @click="toggleDeviceStatus" class="btn" :class="isDeviceRunning ? 'danger-btn' : 'primary-btn'"
            style="width: 100%; font-size: 1.1rem; padding: 0.8rem;" :disabled="!selectedDevice || !store.canAccess('monitoring', 'edit')">
            {{ isDeviceRunning ? 'إيقاف / محاسبة' : 'بدء (Start)' }}
          </button>
        </div>
      </div>

      <!-- Elegant Modern Divider -->
      <div class="section-divider-modern"></div>

      <div class="sidebar-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
          <h2 class="section-title" style="margin:0;"><span>🛒</span> ركن الطلبات</h2>
          <button @click="showFullOrders" class="btn secondary-btn"
            style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" :disabled="!selectedDevice">👁️ عرض الكل</button>
        </div>
        
        <div class="form-group">
          <label>الصنف</label>
          <div class="searchable-select">
            <input type="text" v-model="itemSearchQuery" @focus="showMenuDropdown = true" 
              placeholder="بحث عن صنف..." autocomplete="off" :disabled="!isDeviceRunning">
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
              <button class="qty-btn" @click="itemQty > 1 ? itemQty-- : null" :disabled="!isDeviceRunning || !store.canAccess('monitoring', 'edit')">-</button>
              <input type="number" class="qty-input" v-model="itemQty" min="1" :disabled="!isDeviceRunning || !store.canAccess('monitoring', 'edit')">
              <button class="qty-btn" @click="itemQty++" :disabled="!isDeviceRunning || !store.canAccess('monitoring', 'edit')">+</button>
            </div>
          </div>
          <button @click="addOrderItem" class="btn secondary-btn" style="flex: 1;" :disabled="!isDeviceRunning || !selectedMenuItem || !store.canAccess('monitoring', 'edit')">إضافة</button>
        </div>

        <div style="max-height: 200px; overflow-y: auto; margin-top: 1rem; border: 1px solid var(--border-color); border-radius: 6px;">
          <table>
            <tbody>
              <tr v-for="(order, index) in activeOrders" :key="index">
                <td>{{ order.name }}</td>
                <td>{{ order.qty }}</td>
                <td>{{ formatCurrency(order.total) }}</td>
                <td><button v-if="store.canAccess('monitoring', 'edit')" @click="removeOrderItem(index)" class="btn-icon">✖</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="highlight" style="margin-top: 10px; display: flex; justify-content: space-between;">
          <span>إجمالي الطلبات:</span>
          <span>{{ formatCurrency(activeOrdersTotal) }} ج</span>
        </div>
      </div>
    </aside>

    <!-- Main Area -->
    <main class="main-area glass-panel">
      <div class="table-container monitoring-list-v3">
        <table class="devices-table">
          <thead style="position: sticky; top: 0; z-index: 10; background: var(--bg-panel);">
            <tr>
              <th>الجهاز (Timer)</th>
              <th>البداية</th>
              <th>الوقت المنقضي</th>
              <th>المتبقي</th>
              <th>السعر</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, gName) in groupedDevices" :key="gName">
              <!-- Group Header / Smart Divider -->
              <tr class="group-divider-row-v4">
                <td colspan="6">
                  <span class="g-icon">{{ getGroupIcon(gName) }}</span>
                  <span class="g-title">{{ gName }}</span>
                </td>
              </tr>

              <tr v-for="device in group" :key="device.id" :class="{ selected: selectedDeviceId === device.id }" @click="selectDevice(device.id)">
                <td style="position: relative;">
                  <button v-if="store.canAccess('monitoring', 'edit')" @click.stop="deleteDevice(device)" class="btn-icon floating-del">✖</button>
                  <span class="device-icon-wrapper">{{ getDeviceIcon(device.name) }}</span> {{ device.name }}
                </td>
                <td>{{ formatStartTime(device) }}</td>
                <td>{{ getElapsedTime(device) }}</td>
                <td :class="{ 'time-warning-pulse': isPrepaidLow(device) }">
                  {{ getRemainingTime(device) }}
                </td>
                <td class="highlight">{{ formatCurrency(calculateTotalCost(device)) }}</td>
                <td>
                  <span class="status-badge" :class="device.status === 'running' ? 'status-running' : 'status-stopped'">
                    {{ device.status === 'running' ? 'قيد التشغيل' : 'متاح' }}
                  </span>
                </td>
              </tr>
            </template>
            <tr v-if="!devices.length">
              <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">لا توجد أجهزة مضافة حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="main-actions-modern">
        <button v-if="store.canAccess('monitoring', 'edit')" @click="addGenericDevice('PlayStation')" class="btn secondary-btn">
          <span class="icon">🎮</span> + إضافة PlayStation
        </button>

        <div class="dropdown-wrapper">
          <button v-if="store.canAccess('monitoring', 'edit')" @click.stop="showTableMenu = !showTableMenu" class="btn purple-btn">
            <span class="icon">🎱</span> + إضافة ترابيزة
          </button>
          <div v-if="showTableMenu" class="dropdown-menu-modern glass-panel" v-click-outside="() => showTableMenu = false">
            <button @click="addGenericDevice('بلياردو'); showTableMenu = false">بلياردو 🎱</button>
            <button @click="addGenericDevice('تنس طاولة'); showTableMenu = false">تنس طاولة 🏓</button>
          </div>
        </div>

        <button v-if="store.canAccess('monitoring', 'edit')" @click="addCustomDevice" class="btn secondary-btn gray-btn">
          <span class="icon">🏠</span> أخرى
        </button>

        <button v-if="store.canAccess('tournaments', 'none')" @click="showTournamentsOverlay = true" class="btn secondary-btn tournaments-btn" style="margin-inline-start: auto; min-width: 180px;">
          <span class="icon">🏆</span> البطولات
        </button>
      </div>
    </main>

    <!-- Full Orders Modal -->
    <div v-if="showOrdersModal" class="overlay" @click.self="showOrdersModal = false">
      <div class="modal glass-panel" style="max-width: 500px;">
        <div class="modal-header">
          <h2>ملخص طلبات: {{ selectedDevice?.name }}</h2>
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
              <tr v-for="(order, index) in activeOrders" :key="index">
                <td style="text-align: right;">{{ order.name }}</td>
                <td style="text-align: center;">{{ order.qty }}</td>
                <td style="text-align: left; color: var(--accent-cyan);">{{ formatCurrency(order.total) }} ج</td>
              </tr>
              <tr v-if="!activeOrders.length">
                <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">لا توجد طلبات حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="grand-total-row" style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 12px; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.2rem; color: var(--accent-cyan);">
          <span>إجمالي الحساب:</span>
          <span>{{ formatCurrency(activeOrdersTotal) }} ج</span>
        </div>
      </div>
    </div>

    <!-- Invoice Modal -->
    <div v-if="showInvoiceModal" class="overlay">
      <div class="modal glass-panel">
        <div class="modal-header">
          <h2>فاتورة حساب - {{ invoiceData.deviceName }}</h2>
          <button @click="showInvoiceModal = false" class="btn-icon">✖</button>
        </div>
        <div class="invoice-details compact-invoice">
          <!-- 🎮 Device/Time Section -->
          <div class="invoice-section-v3">
            <div class="invoice-row-mini"><span>وقت البدء</span><span>{{ formatTimeStr(invoiceData.startTime) }}</span></div>
            <div class="invoice-row-mini"><span>وقت الانتهاء</span><span>{{ formatTimeStr(invoiceData.endTime) }}</span></div>
            <div class="invoice-row-mini"><span>المدة</span><span>{{ formatSeconds(invoiceData.usedSeconds) }}</span></div>
            <div class="subtotal-item cyan">
              <span class="label">⏳ تكلفة الوقت:</span>
              <span class="val">{{ formatCurrency(invoiceData.timeCost) }} ج</span>
            </div>
          </div>

          <!-- 📦 Orders Section -->
          <template v-if="invoiceData.orders.length">
            <div class="invoice-divider-mini"></div>
            <div class="invoice-section-v3">
              <h4 class="section-subtitle-v3">📦 تفاصيل الطلبات</h4>
              <div v-for="(o, i) in invoiceData.orders" :key="i" class="invoice-row-mini order-item">
                <span>{{ o.qty }}x {{ o.name }}</span>
                <span>{{ formatCurrency(o.total) }} ج</span>
              </div>
              <div class="subtotal-item green">
                <span class="label">🛒 إجمالي الطلبات:</span>
                <span class="val">{{ formatCurrency(invoiceData.ordersCost) }} ج</span>
              </div>
            </div>
          </template>

          <div class="invoice-divider-elegant"></div>

          <!-- 💰 Final Total Section -->
          <div class="total-amount-row-premium compact">
            <span class="label">الإجمالي النهائي</span>
            <span class="value">{{ formatCurrency(invoiceData.totalCost) }} ج</span>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 2.5rem; margin-bottom: 1.5rem;">
            <button @click="printInvoice(true)" class="btn secondary-btn" style="flex: 1; padding: 0.8rem; background: #3b82f6 !important; font-size: 1.1rem;">🖨️ طباعة الفاتورة</button>
            <button @click="confirmInvoice" class="btn success-btn" style="flex: 1.2; padding: 0.8rem; font-size: 1.1rem; background: #10b981 !important;">
              💸 تحصيل نقدي وأرشفة
            </button>
          </div>

          <hr style="border: none; border-top: 2px dashed rgba(255,255,255,0.1); margin: 1.5rem 0;">

          <!-- Debt Section (Same as Lounge) -->
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
        </div>
      </div>
    </div>

    <div v-if="showTournamentsOverlay" class="overlay" @click.self="showTournamentsOverlay = false">
      <div class="modal glass-panel full-screen-modal" style="width: 100%; height: 100%; max-width: none; max-height: none; border-radius: 0; padding: 0; overflow: hidden;">
        <div class="modal-header" style="padding: 1rem 1.25rem; gap: 1rem; background: var(--bg-navbar); border-bottom: 1px solid var(--border-color);">
          <h2 style="margin: 0; font-size: 1.4rem; color: var(--accent-cyan);">🏆 البطولات</h2>
          <button @click="showTournamentsOverlay = false" class="btn-icon">✖</button>
        </div>
        <div style="height: calc(100% - 4rem); overflow: auto; background: var(--bg-panel);">
          <TournamentsView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';
import { printUnifiedInvoice, printOrderBon } from '../utils/printSystem';
import TournamentsView from './Tournaments/TournamentsView.vue';

const store = useAppStore();
const ui = useUIStore();

const selectedDeviceId = ref(null);
const timerInterval = ref(null);
const currentTime = ref(Date.now());

const deviceForm = reactive({
  hourPrice: 50,
  isPrepaid: false,
  prepaidMinutes: 60
});

const itemSearchQuery = ref('');
const itemQty = ref(1);
const selectedMenuItem = ref(null);
const showMenuDropdown = ref(false);

const showInvoiceModal = ref(false);
const showOrdersModal = ref(false);
const showTournamentsOverlay = ref(false);
const invoiceData = ref(null);
const targetClientId = ref('');

const clientsDir = computed(() => store.clientsDir);

const getDeviceGroupName = (deviceName) => {
  if (deviceName.includes('بلياردو')) return 'بلياردو 🎱';
  if (deviceName.includes('تنس طاولة')) return 'تنس طاولة 🏓';
  if (deviceName.includes('PlayStation') || deviceName.includes('جهاز بلاى ستيشن')) return 'بلاي ستيشن 🎮';
  return 'أجهزة أخرى 🏠';
};

const showFullOrders = () => {
  if (selectedDevice.value) {
    showOrdersModal.value = true;
  }
};

const devices = computed(() => store.devices);
const menu = computed(() => store.menu);

const selectedDevice = computed(() => store.devices.find(d => d.id === selectedDeviceId.id) || store.getDeviceById(selectedDeviceId.value));

const settingsTitle = computed(() => {
  if (!selectedDevice.value) return 'إعدادات الجهاز';
  const name = selectedDevice.value.name;
  if (name.includes('بلياردو') || name.includes('تنس طاولة')) return 'إعدادات الترابيزة';
  if (name.includes('PlayStation') || name.includes('جهاز بلاى ستيشن')) return 'إعدادات الجهاز';
  return 'الإعدادات';
});

const isDeviceRunning = computed(() => selectedDevice.value?.status === 'running');

const filteredMenu = computed(() => {
  if (!itemSearchQuery.value) return menu.value;
  return menu.value.filter(m => m.name.toLowerCase().includes(itemSearchQuery.value.toLowerCase()));
});

const activeOrders = computed(() => selectedDevice.value?.orders || []);
const activeOrdersTotal = computed(() => activeOrders.value.reduce((sum, o) => sum + o.total, 0));

const selectDevice = (id) => {
  selectedDeviceId.value = id;
  const dev = store.getDeviceById(id);
  if (dev) {
    deviceForm.hourPrice = dev.hourPrice;
    deviceForm.isPrepaid = dev.prepaidSeconds > 0;
    deviceForm.prepaidMinutes = dev.prepaidSeconds / 60 || 60;
  }
};

const toggleDeviceStatus = () => {
  if (!selectedDevice.value) return;

  if (selectedDevice.value.status === 'stopped') {
    // Start
    const updated = { ...selectedDevice.value };
    updated.status = 'running';
    updated.startTime = new Date().toISOString();
    updated.hourPrice = deviceForm.hourPrice;
    updated.prepaidSeconds = deviceForm.isPrepaid ? deviceForm.prepaidMinutes * 60 : 0;
    updated.usedTimeSeconds = 0;
    updated.orders = [];
    store.updateDevice(updated);
  } else {
    // Stop & Invoice
    const dev = selectedDevice.value;
    const usedSeconds = dev.startTime ? Math.floor((Date.now() - new Date(dev.startTime)) / 1000) : dev.usedTimeSeconds;
    const timeCost = (usedSeconds / 3600) * dev.hourPrice;
    const ordersCost = dev.orders.reduce((sum, o) => sum + o.total, 0);
    const totalCost = timeCost + ordersCost;

    invoiceData.value = {
      deviceId: dev.id,
      deviceName: dev.name,
      groupName: getDeviceGroupName(dev.name),
      startTime: dev.startTime,
      endTime: new Date().toISOString(),
      usedSeconds,
      timeCost,
      ordersCost,
      totalCost,
      orders: [...dev.orders],
      hourPrice: dev.hourPrice
    };
    showInvoiceModal.value = true;
  }
};

const sendToCustomerAccount = () => {
  const data = invoiceData.value;
  if (!targetClientId.value || !data) return;
  
  const client = store.clientsDir.find(c => c.id === targetClientId.value);
  if (!client) return;

  let customer = store.customers.find(cust => cust.clientId === client.id);
  if (!customer) {
    customer = { id: Date.now(), clientId: client.id, name: client.name, ledger: [] };
    store.customers.push(customer);
  }

  // Add to customer ledger - Split Time and Orders
  // 1. Time Debt
  customer.ledger.push({
    id: Date.now() + 1,
    type: 'debt',
    amount: data.timeCost,
    note: `وقت جهاز: ${data.deviceName} (${data.groupName})`,
    timestamp: new Date().toISOString()
  });

  // 2. Orders Debt
  if (data.orders.length > 0) {
    customer.ledger.push({
      id: Date.now() + 2,
      type: 'debt',
      amount: data.ordersCost,
      note: `طلبات مشروبات - جهاز: ${data.deviceName}`,
      timestamp: new Date().toISOString()
    });
  }
  store.updateCustomer(customer);
  
  // Removed archiving to prevent deferred credit sessions/orders from appearing in general history / archives as per user request

  store.resetDevice(data.deviceId);
  showInvoiceModal.value = false;
  targetClientId.value = '';
  ui.showToast(`تم ترحيل مديونية الجهاز ${data.deviceName} لحساب العميل ${client.name} بنجاح ✅`);
};

const confirmInvoice = () => {
  const data = invoiceData.value;
  // Archive Device Part (Time Only)
  store.addHistoryRecord({
    name: data.deviceName,
    dept: data.groupName,
    startTime: data.startTime,
    endTime: data.endTime,
    usedTimeSeconds: data.usedSeconds,
    hourPrice: data.hourPrice,
    timeCost: data.timeCost,
    ordersCost: 0,
    totalCost: data.timeCost,
    orders: [],
    paymentType: 'cash',
    processedBy: store.session.username
  });

  // Archive Lounge Part (Beverages Only)
  if (data.orders.length > 0) {
    store.addLoungeHistoryRecord({
      name: `طلبات ${data.deviceName}`,
      startTime: data.startTime,
      endTime: data.endTime,
      orders: [...data.orders],
      total: data.ordersCost,
      paymentType: 'cash',
      processedBy: store.session.username
    });
  }

  store.resetDevice(data.deviceId);
  showInvoiceModal.value = false;
  targetClientId.value = '';
  ui.showToast(`تم محاسبة وأرشفة الجهاز ${data.deviceName} بنجاح ✅`);
};

const printInvoice = (isQuick = false) => {
  if (!invoiceData.value) return;
  const data = invoiceData.value;
  printUnifiedInvoice({
    deviceName: data.deviceName,
    startTimeFormatted: formatTimeStr(data.startTime),
    endTimeFormatted: formatTimeStr(data.endTime),
    usedDuration: formatSeconds(data.usedSeconds),
    timeCost: data.timeCost,
    orders: data.orders,
    ordersCost: data.ordersCost,
    totalCost: data.totalCost,
    processedBy: store.session.username,
    paymentType: 'cash' // Default in modal
  }, isQuick);
};

const printCurrentState = () => {
  if (!selectedDevice.value) return;
  const dev = selectedDevice.value;
  const usedSeconds = dev.startTime ? Math.floor((Date.now() - new Date(dev.startTime)) / 1000) : dev.usedTimeSeconds;
  const timeCost = (usedSeconds / 3600) * dev.hourPrice;
  const ordersCost = dev.orders.reduce((sum, o) => sum + o.total, 0);
  const totalCost = timeCost + ordersCost;

  printUnifiedInvoice({
    deviceName: dev.name,
    startTimeFormatted: formatTimeStr(dev.startTime),
    endTimeFormatted: '---',
    usedDuration: formatSeconds(usedSeconds),
    timeCost: timeCost,
    orders: [...dev.orders],
    ordersCost: ordersCost,
    totalCost: totalCost,
    processedBy: store.session.username,
    paymentType: 'current'
  }, true);
};

const selectItem = (item) => {
  selectedMenuItem.value = item;
  itemSearchQuery.value = item.name;
  showMenuDropdown.value = false;
};

const addOrderItem = () => {
  if (!selectedMenuItem.value || !selectedDevice.value) return;

  const dev = { ...selectedDevice.value };
  const existing = dev.orders.find(o => o.itemId === selectedMenuItem.value.id);

  if (existing) {
    existing.qty += itemQty.value;
    existing.total = existing.qty * existing.price;
  } else {
    dev.orders.push({
      itemId: selectedMenuItem.value.id,
      name: selectedMenuItem.value.name,
      price: selectedMenuItem.value.price,
      qty: itemQty.value,
      total: selectedMenuItem.value.price * itemQty.value
    });
  }

  store.updateDevice(dev);
  
  // Quick Bon Print (Disabled as per user request)
  // printOrderBon(dev.name, { name: selectedMenuItem.value.name, qty: itemQty.value });

  itemQty.value = 1;
  itemSearchQuery.value = '';
  selectedMenuItem.value = null;
};

const removeOrderItem = (index) => {
  const dev = { ...selectedDevice.value };
  dev.orders.splice(index, 1);
  store.updateDevice(dev);
};

const showTableMenu = ref(false);

const addGenericDevice = (prefix) => {
  let maxNum = 0;
  // Support both "PlayStation" and "جهاز بلاى ستيشن" for migration cleanup
  const searchRegex = (prefix === 'PlayStation') 
    ? /(?:PlayStation|جهاز بلاى ستيشن)\s*(\d+)$/i 
    : new RegExp(`${prefix}\\s*(\\d+)$`, 'i');

  devices.value.forEach(d => {
    const match = d.name.match(searchRegex);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  });

  const newName = `${prefix} ${maxNum + 1}`;
  const newId = devices.value.length > 0 ? Math.max(...devices.value.map(d => d.id)) + 1 : 1;

  store.addDevice({
    id: newId,
    name: newName,
    status: 'stopped',
    startTime: null,
    usedTimeSeconds: 0,
    prepaidSeconds: 0,
    hourPrice: 50,
    orders: []
  });
  ui.showToast(`تم إضافة ${newName} بنجاح ✨`);
};

const addCustomDevice = async () => {
  const deviceSuggestions = new Set();
  const ignored = store.appSettings?.ignoredSuggestions || [];
  (store.devices || []).forEach(d => {
    if (d.name && !ignored.includes(d.name)) deviceSuggestions.add(d.name);
  });
  (store.history || []).forEach(h => {
    if (h.deviceName && !ignored.includes(h.deviceName)) deviceSuggestions.add(h.deviceName);
    if (h.name && !ignored.includes(h.name)) deviceSuggestions.add(h.name);
  });

  const name = await ui.confirm({
    title: 'إضافة مخصصة',
    message: 'يرجى إدخال اسم الجهاز أو الترابيزة الجديدة:',
    showInput: true,
    inputPlaceholder: 'مثلاً: بلاي ستيشن VIP',
    suggestions: Array.from(deviceSuggestions).sort()
  });
  
  if (name && name.trim()) {
    const newId = devices.value.length > 0 ? Math.max(...devices.value.map(d => d.id)) + 1 : 1;
    store.addDevice({
      id: newId,
      name: name.trim(),
      status: 'stopped',
      startTime: null,
      usedTimeSeconds: 0,
      prepaidSeconds: 0,
      hourPrice: 50,
      orders: []
    });
    ui.showToast(`تم إضافة ${name} بنجاح ✨`);
  }
};

const deleteDevice = async (device) => {
  const confirmed = await ui.confirm({
    title: 'حذف جهاز',
    message: `هل أنت متأكد من حذف ${device.name}؟`,
    type: 'danger'
  });
  if (confirmed) {
    store.deleteDevice(device.id);
    if (selectedDeviceId.value === device.id) selectedDeviceId.value = null;
    ui.showToast('تم حذف الجهاز بنجاح');
  }
};

// Utilities
const formatStartTime = (device) => {
  if (!device.startTime) return '--:--';
  return new Date(device.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getElapsedTime = (device) => {
  let seconds = device.usedTimeSeconds || 0;
  if (device.status === 'running' && device.startTime) {
    const startTs = new Date(device.startTime).getTime();
    if (!isNaN(startTs)) {
      seconds = Math.floor((currentTime.value - startTs) / 1000);
    }
  }
  return formatSeconds(seconds);
};

const getRemainingTime = (device) => {
  if (device.status !== 'running' || device.prepaidSeconds <= 0 || !device.startTime) return '--:--:--';
  const startTs = new Date(device.startTime).getTime();
  if (isNaN(startTs)) return '--:--:--';
  const elapsed = Math.floor((currentTime.value - startTs) / 1000);
  return formatSeconds(Math.max(0, device.prepaidSeconds - elapsed));
};

const isPrepaidLow = (device) => {
  if (device.status !== 'running' || device.prepaidSeconds <= 0) return false;
  const elapsed = Math.floor((currentTime.value - new Date(device.startTime)) / 1000);
  return (device.prepaidSeconds - elapsed) < 300; // less than 5 mins
};

const calculateTotalCost = (device) => {
  let usedSeconds = device.usedTimeSeconds || 0;
  if (device.status === 'running' && device.startTime) {
    const startTs = new Date(device.startTime).getTime();
    if (!isNaN(startTs)) {
      usedSeconds = Math.floor((currentTime.value - startTs) / 1000);
    }
  }
  const timeCost = (usedSeconds / 3600) * (device.hourPrice || 0);
  const ordersCost = (device.orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  return timeCost + ordersCost;
};

const formatSeconds = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatTimeStr = (iso) => iso ? new Date(iso).toLocaleTimeString() : '--:--';

// Grouping Logic
const groupedDevices = computed(() => {
  const groups = {};

  devices.value.forEach(d => {
    const gName = getDeviceGroupName(d.name);
    if (!groups[gName]) groups[gName] = [];
    groups[gName].push(d);
  });

  return groups;
});

const getDeviceIcon = (name) => {
  if (name.includes('بلياردو')) return '🎱';
  if (name.includes('تنس طاولة')) return '🏓';
  if (name.includes('جهاز') || name.includes('PlayStation')) return '🎮';
  return '🏠';
};

const getGroupIcon = (groupName) => {
  if (groupName.includes('بلاي ستيشن')) return '🎮';
  if (groupName.includes('بلياردو')) return '🎱';
  if (groupName.includes('تنس طاولة')) return '🏓';
  return '🏠';
};

// Directives
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

onMounted(() => {
  timerInterval.value = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
  
  if (devices.value.length > 0) {
    selectDevice(devices.value[0].id);
  }
});

// Watch for devices to load (if empty on mount)
import { watch } from 'vue';
watch(devices, (newDevs) => {
  if (newDevs.length > 0 && !selectedDeviceId.value) {
    selectDevice(newDevs[0].id);
  }
}, { immediate: true });

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
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
  background: #1e293b !important; /* Force opaque in dark mode */
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 5px;
}
:global(.light-mode) .searchable-select .options-list {
  background: #ffffff !important; /* Force opaque in light mode */
  border-color: rgba(15, 23, 42, 0.15) !important;
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
  background: rgba(255, 255, 255, 0.08) !important;
}
:global(.light-mode) .option-item:hover {
  background: rgba(15, 23, 42, 0.06) !important;
}
.tournaments-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #fde68a 45%, #facc15 100%);
  color: #091e42;
  box-shadow: 0 16px 35px rgba(250, 204, 21, 0.22), 0 0 0 1px rgba(250, 204, 21, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.35);
  transform: translateZ(0);
}
.tournaments-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #fde68a 0%, #f59e0b 45%, #d97706 100%);
  box-shadow: 0 18px 40px rgba(249, 115, 22, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.18);
}
.tournaments-btn .icon {
  transform: translateY(1px);
}
.success-btn {
  background: var(--accent-success) !important;
  color: white;
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

/* Light Mode Overrides for Quantity Control */
:global(.light-mode) .qty-control {
  background: #f1f5f9 !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}
:global(.light-mode) .qty-btn {
  background: rgba(15, 23, 42, 0.04) !important;
  color: #0891b2 !important;
}
:global(.light-mode) .qty-btn:hover:not(:disabled) {
  background: rgba(8, 145, 178, 0.1) !important;
}
:global(.light-mode) .qty-input {
  color: #0f172a !important;
}
</style>
