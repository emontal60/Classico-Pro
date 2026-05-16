<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar (Add Expense) -->
    <aside class="sidebar glass-panel">
      <div class="sidebar-section">
        <h2 class="section-title">تسجيل مصروف جديد</h2>
        <div class="form-group">
          <label>الفئة</label>
          <select v-model="form.category" class="input-field" style="font-size: 1rem; padding: 0.8rem; color: white;">
            <option value="بضاعة">📦 بضاعة</option>
            <option value="كهرباء">⚡ كهرباء</option>
            <option value="غاز">🔥 غاز</option>
            <option value="مياه">💧 مياه</option>
            <option value="إيجار">🏠 إيجار</option>
            <option value="نثرية">💸 نثرية</option>
            <option value="أخرى">➕ أخرى</option>
          </select>
        </div>
        <div class="form-group">
          <label>المبلغ (ج)</label>
          <input type="number" v-model="form.amount" class="input-field" placeholder="ادخل المبلغ" style="font-weight: bold; color: var(--accent-cyan);">
        </div>
        <div class="form-group">
          <label>ملاحظات / البيان</label>
          <textarea v-model="form.note" class="input-field" rows="4" 
            placeholder="اكتب تفاصيل المصروف هنا..." 
            style="line-height: 1.6; padding: 1rem; border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); color: white;"></textarea>
        </div>
        <button v-if="store.canAccess('expenses', 'edit')" @click="addExpense" class="btn danger-btn" style="width: 100%; margin-top: 1rem; background: #ef4444 !important;">تسجيل المصروف 💸</button>
      </div>

    </aside>

    <!-- Main Area -->
    <main class="main-area glass-panel">
      <div class="section-header-premium">
        <h2 class="premium-title-main">💸 سجل المصروفات الحالية</h2>

        <div class="header-summary-row">
          <div class="summary-card-neon neon-red">
            <span class="summary-label">إجمالي مصروفات القائمة :</span>
            <span class="summary-value">{{ formatCurrency(totalDisplay) }} ج</span>
          </div>
        </div>

        <div class="search-wrapper">
          <input type="text" v-model="searchQuery" placeholder="بحث في الفئات أو الملاحظات..." class="search-input-glass">
        </div>
      </div>

      <div class="table-container" style="margin-top: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; position: relative; overflow: hidden;">
        <!-- Watermark Logo -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; pointer-events: none; width: 300px;">
          <img src="../assets/images/logo1.png" style="width: 100%; filter: grayscale(1) invert(1);">
        </div>

        <table style="position: relative; z-index: 1;">
          <thead style="background: rgba(30, 41, 59, 0.8);">
            <tr>
              <th style="text-align: right; padding-right: 2rem;">التاريخ والوقت</th>
              <th style="text-align: center;">الفئة</th>
              <th style="text-align: center;">الملاحظات</th>
              <th style="text-align: center;">المبلغ</th>
              <th style="text-align: center;">المسؤول</th>
              <th style="text-align: center;">إجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filteredExpenses" :key="e.id">
              <td style="text-align: right; padding-right: 2rem;">
                <div style="font-size: 0.95rem;">{{ formatDateOnly(e.timestamp) }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">{{ formatTimeOnly(e.timestamp) }}</div>
              </td>
              <td style="text-align: center;">
                <span class="category-badge">
                  <span v-if="!e.category.includes(getCategoryIcon(e.category))">{{ getCategoryIcon(e.category) }}</span>
                  {{ e.category }}
                </span>
              </td>
              <td style="max-width: 300px; text-align: center;">{{ e.note || '------' }}</td>
              <td style="text-align: center; color: #ef4444; font-weight: bold; font-size: 1.1rem;">
                {{ formatCurrency(e.amount) }} ج
              </td>
              <td style="text-align: center; color: var(--text-muted);">{{ e.processedBy }}</td>
              <td style="text-align: center;">
                <button v-if="store.canAccess('expenses', 'edit')" @click="deleteExpense(e)" class="btn danger-btn-action">
                  🗑️ حذف
                </button>
              </td>
            </tr>
            <tr v-if="!filteredExpenses.length">
              <td colspan="6" style="text-align: center; padding: 5rem; color: var(--text-muted);">لا توجد مصروفات مسجلة حالياً 🔍</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary footer removed and moved to header -->
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';

const store = useAppStore();
const ui = useUIStore();

const searchQuery = ref('');
const form = reactive({
  category: 'نثرية',
  amount: '',
  note: ''
});

const expenses = computed(() => store.expenses);

const filteredExpenses = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter(e => 
      e.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
});

const totalDisplay = computed(() => {
  return filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0);
});

const addExpense = () => {
  if (form.amount <= 0) return ui.showToast('يرجى إدخال مبلغ صحيح', 'error');

  const expenseRecord = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    category: form.category,
    amount: form.amount,
    note: form.note.trim(),
    processedBy: store.session.username
  };

  const newExpenses = [...store.expenses];
  newExpenses.push(expenseRecord);
  store.setExpenses(newExpenses);

  const newArchives = [...store.archivedExpenses];
  newArchives.push({ ...expenseRecord, archivedAt: expenseRecord.timestamp, archivedBy: store.session.username });
  store.setArchivedExpenses(newArchives);

  form.amount = '';
  form.note = '';
  ui.showToast('تم إضافة المصروف بنجاح ✅');
};

const deleteExpense = async (e) => {
  const confirmed = await ui.confirm({
    title: 'حذف مصروف',
    message: `هل تريد حذف مصروف "${e.category}" بقيمة ${e.amount} ج؟ سيتم مسحه من السجل ومن الأرشيف أيضاً.`,
    type: 'danger'
  });
  if (confirmed) {
    store.deleteExpense(e.id);
    store.deleteFromArchivedExpenses(e.id);
    ui.showToast('تم حذف المصروف بنجاح (من السجل والأرشيف)');
  }
};


const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const formatDateOnly = (iso) => new Date(iso).toLocaleDateString();
const formatTimeOnly = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const getCategoryIcon = (cat) => {
  const icons = {
    'بضاعة': '📦',
    'كهرباء': '⚡',
    'غاز': '🔥',
    'مياه': '💧',
    'إيجار': '🏠',
    'نثرية': '💸',
    'أخرى': '➕'
  };
  return icons[cat] || '';
};
</script>

<style scoped>
.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 115px; /* Uniform width */
  background: rgba(0, 229, 255, 0.03); /* Almost transparent */
  color: #00e5ff; /* Neon Cyan */
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1.5px solid rgba(0, 229, 255, 0.5); /* Modern thin frame */
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.1); /* Subtle neon glow */
  transition: all 0.3s ease;
}
.category-badge:hover {
  border-color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
}

.section-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
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

.danger-btn-action {
  background: #ef4444 !important;
  color: white !important;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 0.85rem;
}
.danger-btn-action:hover {
  background: #dc2626 !important;
}

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
</style>
