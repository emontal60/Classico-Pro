<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar glass-panel">
      <div class="sidebar-section">
        <h2 class="section-title">إضافة عميل جديد</h2>
        <div class="form-group">
          <label>اسم العميل (للحفظ في الدليل)</label>
          <input type="text" v-model="newDirName" placeholder="أدخل اسم العميل..." class="input-field">
          <button v-if="store.canAccess('customers', 'edit')" @click="saveToDirectory" class="btn secondary-btn" style="width: 100%; margin-top: 0.5rem;">حفظ في الدليل وفتح حساب</button>
        </div>
        <hr style="opacity: 0.1; margin: 1rem 0;">
        <div class="form-group">
          <label>فتح حساب لعميل موجود</label>
          <select v-model="selectedDirId" class="input-field">
            <option value="" disabled>اختر اسماً من الدليل...</option>
            <option v-for="c in clientsDir" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <button v-if="store.canAccess('customers', 'edit')" @click="openAccountFromDir" class="btn primary-btn" style="width: 100%; margin-top: 0.5rem;">+ فتح حساب للعميل المختار</button>
        </div>
        <button v-if="store.canAccess('customers', 'edit')" @click="showDirectoryModal = true" class="btn secondary-btn" style="width: 100%; margin-top: 1rem;">⚙️ إدارة الدليل (تعديل/حذف)</button>
      </div>

      <!-- Statistics section removed from sidebar as requested -->
    </aside>

    <!-- Main Area -->
    <main class="main-area glass-panel">
      <div class="section-header-premium">
        <h2 class="premium-title-main">حسابات العملاء ( الآجل )</h2>

        <div class="header-summary-row">
          <div class="summary-card-neon neon-red">
            <span class="summary-label">إجمالي الديون :</span>
            <span class="summary-value">{{ formatCurrency(stats.totalDebt) }} ج</span>
          </div>
          <div class="summary-card-neon neon-green">
            <span class="summary-label">إجمالي تحصيل اليوم :</span>
            <span class="summary-value">{{ formatCurrency(stats.totalPaid) }} ج</span>
          </div>
          <div class="summary-card-neon neon-cyan">
            <span class="summary-label">صافي المتبقي :</span>
            <span class="summary-value">{{ formatCurrency(stats.totalRemaining) }} ج</span>
          </div>
        </div>

        <div class="search-wrapper">
          <input type="text" v-model="searchQuery" placeholder="بحث باسم العميل..." class="search-input-glass">
        </div>
      </div>

      <div class="table-container" style="margin-top: 1rem;">
        <table>
          <thead>
            <tr>
              <th>العميل</th>
              <th>الرصيد المتبقي</th>
              <th>سداد</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredCustomers" :key="c.id">
              <td>{{ c.name }}</td>
              <td :style="{ color: getBalance(c) > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', fontWeight: 'bold' }">
                {{ formatCurrency(getBalance(c)) }} ج
              </td>
              <td style="color: var(--accent-success); font-weight: bold;">
                {{ formatCurrency(getPaid(c)) }} ج
              </td>
              <td>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                  <button @click="openProfile(c)" class="btn secondary-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">عرض الحساب 📁</button>
                  <button v-if="store.canAccess('customers', 'edit')" @click="archiveCustomer(c)" class="btn primary-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">تصفية وأرشفة 💾</button>
                  <button v-if="store.canAccess('customers', 'edit')" @click="deleteCustomer(c)" class="btn danger-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">حذف ✖</button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredCustomers.length">
              <td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-muted);">لا توجد حسابات عملاء تطابق البحث 🔍</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Customer Profile Modal -->
    <div v-if="showProfileModal" class="overlay">
      <div class="modal glass-panel" style="width: 900px; max-width: 95%; padding: 2rem;">
        <div class="modal-header" style="border: none; padding-bottom: 0;">
          <button @click="showProfileModal = false" class="btn-icon" style="color: #ef4444; font-size: 1.5rem;">✖</button>
          <h2 style="color: #06b6d4;">حساب العميل: {{ activeCustomer.name }}</h2>
        </div>
        
        <hr style="opacity: 0.1; margin: 1.5rem 0;">

        <!-- Top Action Cards -->
        <div v-if="store.canAccess('customers', 'edit')" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <!-- Order Card (Right now becomes Left) -->
          <div class="glass-panel" style="padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
            <h4 style="text-align: center; margin-bottom: 1rem;">إضافة طلب للعميل (دين)</h4>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button @click="addOrderDebt" class="btn danger-btn" style="padding: 0.8rem 1.2rem; background: #ef4444 !important;">إضافة طلب</button>
              <div class="qty-control" style="height: 42px;">
                <button class="qty-btn" @click="itemQty > 1 ? itemQty-- : null">-</button>
                <input type="number" class="qty-input" v-model="itemQty" min="1">
                <button class="qty-btn" @click="itemQty++">+</button>
              </div>
              <div class="searchable-select" style="flex: 1;">
                <input type="text" v-model="itemQuery" @focus="showItemsList = true" placeholder="بحث عن صنف..." class="input-field" style="background: rgba(0,0,0,0.3);">
                <div v-if="showItemsList && filteredItems.length" class="options-list glass-panel">
                  <div v-for="m in filteredItems" :key="m.id" class="option-item" @click="selectMenuItem(m)">
                    {{ m.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Card (Left now becomes Right) -->
          <div class="glass-panel" style="padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
            <h4 style="text-align: center; margin-bottom: 1rem;">تسديد مبلغ (سداد)</h4>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button @click="addPayment" class="btn success-btn" style="padding: 0.8rem 1.5rem; background: #10b981 !important;">تسديد</button>
              <input type="number" v-model="paymentAmount" placeholder="ادخل مبلغ السداد" class="input-field" style="text-align: center; background: rgba(0,0,0,0.3);">
            </div>
          </div>
        </div>

        <hr style="opacity: 0.1; margin: 1.5rem 0;">

        <!-- Summary Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="color: #ef4444; margin: 0;">{{ formatCurrency(getBalance(activeCustomer)) }} ج</h2>
          <button @click="printStatement" class="btn primary-btn" style="background: #3b82f6; display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.5rem;">
            <span>🖨️</span> طباعة كشف الحساب بالكامل
          </button>
        </div>

        <!-- Ledger Table -->
        <div class="table-container" style="max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 8px; position: relative;">

          <table style="position: relative; z-index: 1;">
            <thead style="background: rgba(30, 41, 59, 0.8);">
              <tr>
                <th style="text-align: center;">التاريخ</th>
                <th style="text-align: center;">البيان</th>
                <th style="text-align: center;">المبلغ</th>
                <th style="text-align: center;">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in sortedLedger" :key="l.id">
                <td style="text-align: center;">{{ formatDateTime(l.timestamp) }}</td>
                <td style="text-align: center;">{{ l.note }}</td>
                <td style="text-align: center;" :style="{ color: l.type === 'debt' ? '#ef4444' : '#10b981' }">
                  {{ l.type === 'debt' ? '+' : '-' }}{{ formatCurrency(l.amount) }}
                </td>
                <td style="text-align: center;">{{ formatCurrency(getRunningBalance(i)) }}</td>
              </tr>
              <tr v-if="!sortedLedger.length">
                <td colspan="4" style="text-align: center; padding: 4rem; color: var(--text-muted);">لا توجد حركات مسجلة لهذا العميل</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Directory Modal -->
    <div v-if="showDirectoryModal" class="overlay">
      <div class="modal glass-panel" style="width: 600px;">
        <div class="modal-header">
          <h2>إدارة دليل الأسماء</h2>
          <button @click="showDirectoryModal = false" class="btn-icon">✖</button>
        </div>
        <div class="form-group" style="margin-top: 1rem;">
          <input type="text" v-model="dirSearchQuery" placeholder="بحث في الدليل..." class="input-field">
        </div>
        <div class="table-container" style="max-height: 400px; overflow-y: auto; margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in filteredDir" :key="c.id">
                <td>{{ c.name }}</td>
                <td>
                  <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button @click="editDirName(c)" class="btn secondary-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">تعديل</button>
                    <button @click="deleteDirItem(c)" class="btn danger-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">حذف</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';
import watermarkLogo from '../assets/images/logoapp.png';

const store = useAppStore();
const ui = useUIStore();

const searchQuery = ref('');
const newDirName = ref('');
const selectedDirId = ref('');
const showDirectoryModal = ref(false);
const dirSearchQuery = ref('');

const showProfileModal = ref(false);
const activeCustomer = ref(null);

const itemQuery = ref('');
const showItemsList = ref(false);
const selectedItem = ref(null);
const itemQty = ref(1);
const paymentAmount = ref(null);

const customers = computed(() => store.customers);
const clientsDir = computed(() => store.clientsDir);
const menu = computed(() => store.menu);

const filteredCustomers = computed(() => {
  return customers.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const filteredDir = computed(() => {
  return clientsDir.value.filter(c => c.name.toLowerCase().includes(dirSearchQuery.value.toLowerCase()));
});

const filteredItems = computed(() => {
  if (!itemQuery.value) return menu.value;
  return menu.value.filter(m => m.name.toLowerCase().includes(itemQuery.value.toLowerCase()));
});

const getBalance = (c) => {
  return c.ledger.reduce((sum, l) => l.type === 'debt' ? sum + l.amount : sum - l.amount, 0);
};

const getPaid = (c) => {
  return c.ledger.reduce((sum, l) => l.type === 'payment' ? sum + l.amount : sum, 0);
};

const stats = computed(() => {
  let totalRemaining = 0;
  customers.value.forEach(c => {
    totalRemaining += getBalance(c);
  });

  const lastClosure = new Date(store.lastJournalClosure);
  let totalPaidToday = 0;
  const seenPaymentKeys = new Set();
  
  const processPayment = (c) => {
    (c.ledger || []).forEach(l => {
      if (l.type === 'payment') {
        const paymentKey = l.id || l.timestamp;
        if (paymentKey && !seenPaymentKeys.has(paymentKey)) {
          seenPaymentKeys.add(paymentKey);
          if (new Date(l.timestamp) > lastClosure) {
            totalPaidToday += l.amount || 0;
          }
        }
      }
    });
  };

  (store.customers || []).forEach(processPayment);

  const totalDebt = totalRemaining + totalPaidToday;

  return {
    totalDebt,
    totalPaid: totalPaidToday,
    totalRemaining
  };
});

const sortedLedger = computed(() => {
  if (!activeCustomer.value) return [];
  return [...activeCustomer.value.ledger].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const getRunningBalance = (idx) => {
  const ledger = sortedLedger.value;
  // Since we display newest first, we calculate from the end
  let balance = 0;
  const inOrder = [...ledger].reverse();
  for (let i = 0; i <= (ledger.length - 1 - idx); i++) {
    if (inOrder[i].type === 'debt') balance += inOrder[i].amount;
    else balance -= inOrder[i].amount;
  }
  return balance;
};

const saveToDirectory = () => {
  const name = newDirName.value.trim();
  if (!name) return;

  const dir = [...store.clientsDir];
  let client = dir.find(c => c.name.toLowerCase() === name.toLowerCase());

  if (!client) {
    client = { id: Date.now(), name };
    dir.push(client);
    store.setClientsDirectory(dir);
  }

  const custs = [...store.customers];
  if (custs.find(c => c.clientId === client.id)) {
    ui.showToast('هذا العميل لديه حساب مفتوح بالفعل', 'warning');
    return;
  }

  custs.push({
    id: Date.now() + 1,
    clientId: client.id,
    name: client.name,
    ledger: []
  });
  store.setCustomers(custs);
  newDirName.value = '';
};

const openAccountFromDir = () => {
  if (!selectedDirId.value) return;
  const client = store.clientsDir.find(c => c.id === selectedDirId.value);
  const custs = [...store.customers];
  if (custs.find(c => c.clientId === client.id)) {
    ui.showToast('هذا العميل له حساب مفتوح بالفعل', 'warning');
    return;
  }

  custs.push({
    id: Date.now(),
    clientId: client.id,
    name: client.name,
    ledger: []
  });
  store.setCustomers(custs);
  selectedDirId.value = '';
};

const deleteCustomer = async (c) => {
  const confirmed = await ui.confirm({
    title: 'حذف حساب عميل',
    message: `حذف حساب ${c.name} بالكامل؟ لا يمكن التراجع.`,
    type: 'danger'
  });
  if (confirmed) {
    store.deleteCustomer(c.id);
    ui.showToast('تم حذف الحساب بنجاح');
  }
};

const archiveCustomer = async (c) => {
  const balance = getBalance(c);
  let msg = `هل تريد تصفية وإرسال حساب ${c.name} للأرشيف؟`;
  if (balance > 0) {
    msg = `العميل لديه مديونية متبقية بقيمة ${balance} ج. هل تؤكد سداد المبلغ بالكامل وأرشفة الحساب؟`;
  }

  const confirmed = await ui.confirm({
    title: 'تصفية وأرشفة',
    message: msg,
    type: balance > 0 ? 'warning' : 'info'
  });

  if (confirmed) {
    const cust = { ...c };
    if (balance > 0) {
      cust.ledger.push({
        id: Date.now(),
        type: 'payment',
        amount: balance,
        note: 'تسوية آلية عند الأرشفة (سداد كامل)',
        timestamp: new Date().toISOString()
      });
    }

    const archives = [...store.archivedCustomers];
    const archiveData = {
      ...cust,
      id: Date.now() + Math.random(), // Ensure unique ID for the archive record
      originalCustomerId: cust.id,
      settledAmount: balance > 0 ? balance : 0,
      archivedAt: new Date().toISOString(),
      archivedBy: store.session.username
    };

    archives.push(archiveData);

    store.setArchivedCustomers(archives);
    store.setCustomers(store.customers.filter(cust => cust.id !== c.id));
    ui.showToast('تم تصفية وأرشفة الحساب بنجاح ✅');
  }
};

const openProfile = (c) => {
  activeCustomer.value = c;
  showProfileModal.value = true;
};

const selectMenuItem = (m) => {
  selectedItem.value = m;
  itemQuery.value = m.name;
  showItemsList.value = false;
};

const addOrderDebt = () => {
  if (!selectedItem.value || !activeCustomer.value) return;
  const cust = { ...activeCustomer.value };
  cust.ledger.push({
    id: Date.now(),
    type: 'debt',
    amount: selectedItem.value.price * itemQty.value,
    note: `طلب صنف: ${selectedItem.value.name} (${itemQty.value}x)`,
    timestamp: new Date().toISOString()
  });
  store.updateCustomer(cust);
  activeCustomer.value = cust;
  itemQty.value = 1;
  itemQuery.value = '';
  selectedItem.value = null;
};

const addPayment = () => {
  if (paymentAmount.value <= 0 || !activeCustomer.value) return;
  const cust = { ...activeCustomer.value };
  cust.ledger.push({
    id: Date.now(),
    type: 'payment',
    amount: paymentAmount.value,
    note: 'تسديد مبلغ نقدًا',
    timestamp: new Date().toISOString()
  });
  store.updateCustomer(cust);
  activeCustomer.value = cust;

  // Partial archive logic
  const archives = [...store.archivedCustomers];
  const archiveData = {
    ...cust,
    id: Date.now() + Math.random(), // Ensure unique ID for the archive record
    originalCustomerId: cust.id,
    settledAmount: paymentAmount.value,
    archivedAt: new Date().toISOString(),
    archivedBy: store.session.username
  };
  archives.push(archiveData);
  store.setArchivedCustomers(archives);

  paymentAmount.value = null;
};

// Click outside logic for dropdown
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.searchable-select')) {
      showItemsList.value = false;
    }
  });
}

const editDirName = async (c) => {
  const newName = await ui.confirm({
    title: 'تعديل اسم العميل',
    message: 'أدخل الاسم الجديد للعميل:',
    showInput: true,
    inputValue: c.name,
    inputPlaceholder: 'اسم العميل...'
  });

  if (newName && newName.trim() !== '') {
    const dir = [...store.clientsDir];
    const item = dir.find(i => i.id === c.id);
    if (item) {
      item.name = newName.trim();
      store.setClientsDirectory(dir);
      ui.showToast('تم تعديل الاسم بنجاح ✅');
    }
  }
};

const deleteDirItem = async (c) => {
  const confirmed = await ui.confirm({
    title: 'حذف من الدليل',
    message: 'حذف العميل من الدليل؟',
    type: 'danger'
  });
  if (confirmed) {
    store.setClientsDirectory(store.clientsDir.filter(item => item.id !== c.id));
    ui.showToast('تم الحذف من الدليل');
  }
};

const printStatement = () => {
  ui.showToast('سيتم طباعة كشف الحساب حالاً... 🖨️');
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.success-btn { background: var(--accent-success) !important; }
.options-list {
  position: absolute;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  background: #1e293b !important; /* Force opaque in dark mode */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
:global(.light-mode) .searchable-select .options-list {
  background: #ffffff !important; /* Force opaque in light mode */
  border-color: rgba(15, 23, 42, 0.15) !important;
}
.option-item { padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border-color); }
.option-item:hover { background: rgba(255, 255, 255, 0.08) !important; }
:global(.light-mode) .option-item:hover { background: rgba(15, 23, 42, 0.06) !important; }
.section-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}
.premium-title-main {
  margin: 0;
  white-space: nowrap;
}
.header-summary-row {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.summary-card-neon {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  font-weight: 800;
  font-size: 0.95rem;
}
.neon-red { border-color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
.neon-red .summary-value { color: #ef4444; }
.neon-green { border-color: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
.neon-green .summary-value { color: #10b981; }
.neon-cyan { border-color: #00e5ff; box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); }
.neon-cyan .summary-value { color: #00e5ff; }

.search-input-glass {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: white;
  width: 250px;
}
.search-input-glass:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  outline: none;
}

/* Custom Quantity Control */
.qty-control {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
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
.qty-btn:hover {
  background: rgba(0, 229, 255, 0.2);
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
