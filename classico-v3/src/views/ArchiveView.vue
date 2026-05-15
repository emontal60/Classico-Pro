<template>
  <div class="dashboard-wrapper">
    <main class="main-area glass-panel" style="width: 100%; position: relative; overflow: hidden;">
      <!-- Watermark Logo -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; pointer-events: none; width: 400px; z-index: 0;">
        <img src="../assets/images/logo1.png" style="width: 100%; filter: grayscale(1) invert(1);">
      </div>

      <div style="position: relative; z-index: 1;">
        <!-- Unified System Header -->
        <div class="archive-header">
          <h1 class="premium-title-main">📂 الأرشيف</h1>
        </div>

        <!-- Integrated Bar: Tabs and Dynamic Summary Card -->
        <div class="archive-header-unified glass-panel">
          <nav class="settings-tabs-bar-integrated">
            <button v-if="store.canAccess('archive_devices', 'none')" @click="activeTab = 'devices'" :class="['tab-item-mini', { active: activeTab === 'devices' }]">
              <span class="icon">🎮</span> الأجهزة
            </button>
            <button v-if="store.canAccess('archive_lounge', 'none')" @click="activeTab = 'lounge'" :class="['tab-item-mini', { active: activeTab === 'lounge' }]">
              <span class="icon">☕</span> الصالة
            </button>
            <button v-if="store.canAccess('archive_customers', 'none')" @click="activeTab = 'customers'" :class="['tab-item-mini', { active: activeTab === 'customers' }]">
              <span class="icon">👥</span> العملاء
            </button>
            <button v-if="store.canAccess('archive_expenses', 'none')" @click="activeTab = 'expenses'" :class="['tab-item-mini', { active: activeTab === 'expenses' }]">
              <span class="icon">💸</span> المصروفات
            </button>
            <button v-if="store.canAccess('archive_salaries', 'none')" @click="activeTab = 'salaries'" :class="['tab-item-mini', { active: activeTab === 'salaries' }]">
              <span class="icon">💰</span> المرتبات
            </button>
            <button v-if="store.canAccess('archive_global', 'none')" @click="activeTab = 'global'" :class="['tab-item-mini', { active: activeTab === 'global' }]">
              <span class="icon">📋</span> الشامل
            </button>
          </nav>

          <div class="summary-side">
            <div v-if="activeTab !== 'global'" :class="['header-summary-card-mini', activeTabColor]">
              <span class="summary-label">{{ activeTabLabel }} :</span>
              <span class="summary-value">{{ formatCurrency(activeTabTotal) }} ج</span>
            </div>
            <div v-else class="header-summary-card-mini neon-gold">
              <span class="summary-label">الصافي العام :</span>
              <span class="summary-value">{{ formatCurrency(globalTotal) }} ج</span>
            </div>
          </div>
        </div>

        <div class="tab-container-wrapper">
          <!-- 1. Devices Archive Tab -->
          <div v-if="activeTab === 'devices'" class="tab-content">
            <div class="archive-header-row">
              <button v-if="store.canAccess('archive_devices', 'edit')" @click="clearArchive('history')" class="btn-clear-modern">🗑️ تفريغ أرشيف الأجهزة</button>
            </div>
            <div class="table-container" style="max-height: 60vh; overflow-y: auto;">
              <table>
                <thead>
                  <tr>
                    <th style="text-align: right;">الوقت</th>
                    <th style="text-align: center;">الجهاز</th>
                    <th style="text-align: center;">المدة</th>
                    <th style="text-align: center;">قيمة الوقت</th>
                    <th style="text-align: center;">الطلبات</th>
                    <th style="text-align: center;">الإجمالي</th>
                    <th style="text-align: center;">المسؤول</th>
                    <th style="text-align: center;">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in sortedHistory" :key="h.timestamp">
                    <td style="text-align: right;">
                      <div>{{ formatDate(h.timestamp) }}</div>
                      <small style="color: var(--text-muted)">{{ formatTime(h.timestamp) }}</small>
                    </td>
                    <td style="text-align: center;">{{ h.deviceName }}</td>
                    <td style="text-align: center;">{{ formatDuration(h.usedTimeSeconds) }}</td>
                    <td style="text-align: center;">{{ formatCurrency(h.timeCost) }} ج</td>
                    <td style="text-align: center;">{{ formatCurrency(h.ordersCost) }} ج</td>
                    <td style="text-align: center; color: var(--accent-cyan); font-weight: bold;">{{ formatCurrency(h.totalCost) }} ج</td>
                    <td style="text-align: center; color: var(--text-muted);">{{ h.processedBy || '---' }}</td>
                    <td style="text-align: center;">
                      <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button @click="viewInvoice(h)" class="btn secondary-btn" style="padding: 0.3rem 0.7rem; font-size: 0.85rem; background: #3b82f6 !important;">عرض</button>
                        <button v-if="store.canAccess('archive_devices', 'edit')" @click="deleteRecord('history', h)" class="btn danger-btn" style="padding: 0.3rem 0.7rem; font-size: 0.85rem; background: #ef4444 !important;">حذف</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. Lounge Archive Tab -->
          <div v-if="activeTab === 'lounge'" class="tab-content">
            <div class="archive-header-row">
              <button v-if="store.canAccess('archive_lounge', 'edit')" @click="clearArchive('loungeHistory')" class="btn-clear-modern">🗑️ تفريغ أرشيف الصالة</button>
            </div>
            <div class="table-container" style="max-height: 60vh; overflow-y: auto;">
              <table>
                <thead>
                  <tr>
                    <th style="text-align: right;">الوقت</th>
                    <th style="text-align: center;">الاسم / الطلب</th>
                    <th style="text-align: center;">الإجمالي</th>
                    <th style="text-align: center;">المسؤول</th>
                    <th style="text-align: center;">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="l in sortedLounge" :key="l.timestamp">
                    <td style="text-align: right;">
                      <div>{{ formatDate(l.timestamp) }}</div>
                      <small style="color: var(--text-muted)">{{ formatTime(l.timestamp) }}</small>
                    </td>
                    <td style="text-align: center;">{{ l.name }}</td>
                    <td style="text-align: center; color: #fbbf24; font-weight: bold;">{{ formatCurrency(l.total) }} ج</td>
                    <td style="text-align: center; color: var(--text-muted);">{{ l.processedBy || '---' }}</td>
                    <td style="text-align: center;">
                      <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button @click="viewLoungeInvoice(l)" class="btn secondary-btn" style="background: #3b82f6 !important;">عرض</button>
                        <button v-if="store.canAccess('archive_lounge', 'edit')" @click="deleteRecord('loungeHistory', l)" class="btn danger-btn" style="background: #ef4444 !important;">حذف</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. Customers Archive Tab -->
          <div v-if="activeTab === 'customers'" class="tab-content">
            <div class="archive-header-row">
              <button v-if="store.canAccess('archive_customers', 'edit')" @click="clearArchive('archivedCustomers')" class="btn-clear-modern">🗑️ تفريغ أرشيف العملاء</button>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>تاريخ الأرشفة</th>
                    <th>اسم العميل</th>
                    <th>المبلغ المسدد عند الإغلاق</th>
                    <th>بواسطة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in sortedCustomers" :key="c.archivedAt">
                    <td>{{ formatDate(c.archivedAt) }}</td>
                    <td>{{ c.name }}</td>
                    <td style="color: var(--accent-success); font-weight: bold;">{{ formatCurrency(c.settledAmount || 0) }} ج</td>
                    <td>{{ c.archivedBy || '---' }}</td>
                    <td>
                      <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button @click="viewCustomerArchive(c)" class="btn secondary-btn" style="background: #3b82f6 !important;">عرض السجل</button>
                        <button v-if="store.canAccess('archive_customers', 'edit')" @click="deleteRecord('archivedCustomers', c)" class="btn danger-btn" style="background: #ef4444 !important;">حذف</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. Expenses Archive Tab -->
          <div v-if="activeTab === 'expenses'" class="tab-content">
            <div class="archive-header-row">
              <button v-if="store.canAccess('archive_expenses', 'edit')" @click="clearArchive('archivedExpenses')" class="btn-clear-modern">🗑️ تفريغ أرشيف المصروفات</button>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="text-align: right;">التاريخ</th>
                    <th style="text-align: center;">الفئة</th>
                    <th style="text-align: center;">الملاحظات</th>
                    <th style="text-align: center;">المبلغ</th>
                    <th style="text-align: center;">المسؤول</th>
                    <th v-if="store.canAccess('archive_expenses', 'edit')" style="text-align: center;">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in sortedExpenses" :key="e.id">
                    <td style="text-align: right;">
                      <div>{{ formatDate(e.timestamp || e.archivedAt) }}</div>
                      <small style="color: var(--text-muted)">{{ formatTime(e.timestamp || e.archivedAt) }}</small>
                    </td>
                    <td style="text-align: center;">
                      <span class="category-badge-neon">{{ e.category }}</span>
                    </td>
                    <td style="text-align: center;">{{ e.note || '------' }}</td>
                    <td style="text-align: center; color: #ef4444; font-weight: bold;">{{ formatCurrency(e.amount) }} ج</td>
                    <td style="text-align: center;">{{ e.processedBy || '---' }}</td>
                    <td v-if="store.canAccess('archive_expenses', 'edit')" style="text-align: center;">
                      <button @click="deleteRecord('archivedExpenses', e)" class="btn danger-btn" style="padding: 0.3rem 0.7rem; font-size: 0.85rem; background: #ef4444 !important;">حذف</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 5. Salaries Archive Tab -->
          <div v-if="activeTab === 'salaries' && store.canAccess('archive_salaries', 'none')" class="tab-content">
            <div class="archive-header-row">
              <button v-if="store.canAccess('archive_salaries', 'edit')" @click="clearArchive('archivedSalaries')" class="btn-clear-modern">🗑️ تفريغ أرشيف المرتبات</button>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الموظف</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>ملاحظات</th>
                    <th>بواسطة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in sortedSalaries" :key="s.timestamp">
                    <td>{{ formatDate(s.timestamp) }}</td>
                    <td>{{ s.username }}</td>
                    <td>
                      <span :class="['status-badge', s.type === 'salary_payment' ? 'status-running' : 'status-stopped']">
                        {{ s.type === 'salary_payment' ? 'صرف مرتب' : 'مسحوبات' }}
                      </span>
                    </td>
                    <td class="highlight">{{ formatCurrency(s.amount) }} ج</td>
                    <td>{{ s.note || '---' }}</td>
                    <td>{{ s.processedBy || '---' }}</td>
                    <td>
                      <button v-if="store.canAccess('archive_salaries', 'edit')" @click="deleteRecord('archivedSalaries', s)" class="btn-icon" style="color: #ef4444;">✖</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 6. Global Archive Tab -->
          <div v-if="activeTab === 'global'" class="tab-content">
            <div class="archive-header-row">
              <button v-if="store.canAccess('archive_global', 'edit')" @click="clearAllArchives" class="btn-clear-modern">🗑️ تفريغ الأرشيف الشامل</button>
            </div>

            <div class="filters-bar" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; background: rgba(15, 23, 42, 0.4); padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
              <div class="filter-group">
                <label>👤 المسؤول</label>
                <select v-model="globalFilters.user" class="premium-input">
                  <option value="">الكل</option>
                  <option v-for="u in store.users" :key="u.username" :value="u.username">{{ u.username }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>📂 القسم</label>
                <select v-model="globalFilters.dept" class="premium-input" @change="globalFilters.subDept = ''">
                  <option value="">الكل</option>
                  <option value="🎮 أجهزة">🎮 أرشيف الأجهزة</option>
                  <option value="☕ صالة">☕ أرشيف الصالة</option>
                  <option value="👥 عملاء">👥 أرشيف العملاء</option>
                  <option value="💸 مصروفات">💸 أرشيف المصروفات</option>
                  <option value="💰 مرتبات">💰 أرشيف المرتبات</option>
                </select>
              </div>
              <!-- Smart Sub-Filter for Archive -->
              <div v-if="globalFilters.dept === '🎮 أجهزة' && monitoringGroups.length > 0" class="filter-group animate-fade-in">
                <label>🔍 التحديد</label>
                <select v-model="globalFilters.subDept" class="premium-input">
                  <option value="">كل الأنواع</option>
                  <option v-for="g in monitoringGroups" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>📅 من تاريخ</label>
                <input type="date" v-model="globalFilters.from" class="premium-input">
              </div>
              <div class="filter-group">
                <label>📅 إلى تاريخ</label>
                <input type="date" v-model="globalFilters.to" class="premium-input">
              </div>
              <button @click="resetFilters" class="btn secondary-btn" style="margin-top: auto; padding: 7px 15px; border-radius: 8px; font-size: 0.9rem;">إعادة ضبط 🔄</button>
            </div>

            <div class="table-container" style="max-height: 55vh; overflow-y: auto;">
              <table>
                <thead>
                  <tr>
                    <th style="text-align: right;">الوقت</th>
                    <th style="text-align: center;">القسم</th>
                    <th style="text-align: center;">البيان</th>
                    <th style="text-align: center;">المبلغ</th>
                    <th style="text-align: center;">المسؤول</th>
                    <th style="text-align: right;">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredGlobalData" :key="row.ts + row.name">
                    <td style="text-align: right;">
                      <div>{{ formatDate(row.ts) }}</div>
                      <small style="color: var(--text-muted)">{{ formatTime(row.ts) }}</small>
                    </td>
                    <td style="text-align: center;">
                      <span class="status-badge" :style="`background: ${row.color}22; color: ${row.color}; border: 1px solid ${row.color}44; font-size: 0.85rem; padding: 0.2rem 0.6rem;` ">{{ row.dept }}</span>
                    </td>
                    <td style="text-align: center;">{{ row.name }}</td>
                    <td :class="['highlight', { 'danger-text': row.amount < 0 }]" style="text-align: center; font-weight: bold;">{{ formatCurrency(row.amount) }} ج</td>
                    <td style="text-align: center; color: var(--text-muted);">{{ row.processedBy || '---' }}</td>
                    <td style="text-align: right; font-size: 0.85rem; color: var(--text-muted);">{{ row.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Detailed Invoice Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content glass-panel" style="max-width: 600px; width: 90%;">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button @click="showModal = false" class="btn-icon">✖</button>
        </div>
        
        <div v-if="activeInvoice" class="invoice-body">
          <div v-if="modalType === 'device'" class="details-list">
             <div class="detail-row"><span>تاريخ الفاتورة:</span> <span>{{ formatDate(activeInvoice.timestamp) }}</span></div>
             <div class="detail-row"><span>وقت البدء:</span> <span>{{ formatTime(activeInvoice.startTime) }}</span></div>
             <div class="detail-row"><span>وقت الانتهاء:</span> <span>{{ formatTime(activeInvoice.endTime) }}</span></div>
             <div class="detail-row"><span>مدة الاستخدام:</span> <span>{{ formatDuration(activeInvoice.usedTimeSeconds) }}</span></div>
             <div class="detail-row highlight-row"><span>تكلفة الوقت:</span> <span>{{ formatCurrency(activeInvoice.timeCost) }} ج</span></div>
             
             <div class="orders-section">
               <h4>قائمة الطلبات:</h4>
               <div v-if="activeInvoice.orders.length" class="order-items">
                 <div v-for="o in activeInvoice.orders" :key="o.id" class="detail-row">
                   <span>{{ o.qty }}x {{ o.name }}</span>
                   <span>{{ formatCurrency(o.total) }} ج</span>
                 </div>
               </div>
               <p v-else style="color: var(--text-muted); text-align: center;">لا توجد طلبات</p>
               <div class="detail-row highlight-row"><span>إجمالي الطلبات:</span> <span>{{ formatCurrency(activeInvoice.ordersCost) }} ج</span></div>
             </div>

             <div class="grand-total-row">
               <span>الإجمالي النهائي:</span>
               <span>{{ formatCurrency(activeInvoice.totalCost) }} ج</span>
             </div>
          </div>

          <div v-if="modalType === 'lounge'" class="details-list">
             <div class="detail-row"><span>تاريخ الفاتورة:</span> <span>{{ formatDate(activeInvoice.timestamp) }}</span></div>
             <div class="detail-row"><span>وقت المحاسبة:</span> <span>{{ formatTime(activeInvoice.timestamp) }}</span></div>
             
             <div class="orders-section">
               <h4>تفاصيل الطلبات:</h4>
               <div class="order-items">
                 <div v-for="o in activeInvoice.orders" :key="o.id" class="detail-row">
                   <span>{{ o.qty }}x {{ o.name }}</span>
                   <span>{{ formatCurrency(o.total) }} ج</span>
                 </div>
               </div>
             </div>

             <div class="grand-total-row">
               <span>الإجمالي النهائي:</span>
               <span>{{ formatCurrency(activeInvoice.total) }} ج</span>
             </div>
          </div>

          <div v-if="modalType === 'customer'" class="details-list">
             <div class="detail-row"><span>الرصيد عند الأرشفة:</span> <span class="danger-text">{{ formatCurrency(calculateBalance(activeInvoice.ledger)) }} ج</span></div>
             <div class="table-container" style="max-height: 300px; margin-top: 1rem;">
               <table>
                 <thead>
                   <tr>
                     <th>التاريخ</th>
                     <th>الملاحظة</th>
                     <th style="text-align: left;">القيمة</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr v-for="l in activeInvoice.ledger" :key="l.timestamp">
                     <td>{{ formatDate(l.timestamp) }}</td>
                     <td>{{ l.note }}</td>
                     <td :style="`text-align: left; color: ${l.type === 'debt' ? 'var(--accent-danger)' : 'var(--accent-success)'}`">
                       {{ l.type === 'debt' ? '+' : '-' }}{{ formatCurrency(l.amount) }}
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 2rem; display: flex; gap: 1rem;">
          <button @click="printActiveInvoice(true)" class="btn secondary-btn" style="flex: 1; padding: 0.8rem; background: #3b82f6 !important; font-size: 1.1rem;">🖨️ طباعة الفاتورة</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';
import { printUnifiedInvoice } from '../utils/printSystem';

const store = useAppStore();
const ui = useUIStore();
const isAdmin = computed(() => store.session?.role === 'manager' || store.session?.role === 'admin');

// Tab Persistence
const savedTab = localStorage.getItem('classico_archive_active_tab') || 'devices';
const activeTab = ref(savedTab);

watch(activeTab, (newTab) => {
  localStorage.setItem('classico_archive_active_tab', newTab);
});

const showModal = ref(false);
const modalType = ref('');
const modalTitle = ref('');
const activeInvoice = ref(null);

const globalFilters = reactive({
  user: '',
  dept: '',
  subDept: '',
  from: '',
  to: ''
});

const monitoringGroups = computed(() => {
  const groups = new Set();
  (store.history || []).forEach(h => {
    if (h.dept) groups.add(h.dept);
  });
  return Array.from(groups);
});

// Sorting Logic
const sortedHistory = computed(() => [...store.history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
const sortedLounge = computed(() => [...store.loungeHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
const sortedCustomers = computed(() => [...store.archivedCustomers].sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)));
const sortedExpenses = computed(() => [...store.archivedExpenses].sort((a, b) => new Date(b.timestamp || b.archivedAt) - new Date(a.timestamp || a.archivedAt)));
const sortedSalaries = computed(() => [...store.archivedSalaries].filter(s => !s.isAdjustment).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

// Summary Totals
const totalPSRevenue = computed(() => sortedHistory.value.reduce((sum, h) => sum + h.totalCost, 0));
const totalLoungeRevenue = computed(() => sortedLounge.value.reduce((sum, l) => sum + l.total, 0));
const totalCustomerRevenue = computed(() => sortedCustomers.value.reduce((sum, c) => sum + (c.settledAmount || 0), 0));
const totalExpenseSum = computed(() => sortedExpenses.value.reduce((sum, e) => sum + e.amount, 0));
const totalSalariesSum = computed(() => sortedSalaries.value.reduce((sum, s) => sum + s.amount, 0));

// Dynamic Header Logic
const activeTabLabel = computed(() => {
  const labels = { devices: 'إجمالي الأجهزة', lounge: 'إجمالي الصالة', customers: 'تحصيلات العملاء', expenses: 'إجمالي المصروفات', salaries: 'إجمالي المرتبات' };
  return labels[activeTab.value] || '';
});

const activeTabTotal = computed(() => {
  const totals = { devices: totalPSRevenue.value, lounge: totalLoungeRevenue.value, customers: totalCustomerRevenue.value, expenses: totalExpenseSum.value, salaries: totalSalariesSum.value };
  return totals[activeTab.value] || 0;
});

const activeTabColor = computed(() => {
  const colors = { devices: 'neon-cyan', lounge: 'neon-green', customers: 'neon-yellow', expenses: 'neon-red', salaries: 'neon-purple' };
  return colors[activeTab.value] || 'neon-cyan';
});

// Global Archive Logic
const globalData = computed(() => {
  let data = [];
  
  // Devices
  store.history.forEach(h => {
    data.push({
      ts: h.timestamp, dept: '🎮 أجهزة', subDept: h.dept, name: h.name || h.deviceName, amount: h.totalCost,
      note: `مدة الاستخدام: ${formatDuration(h.usedTimeSeconds)}`, color: '#00e5ff', processedBy: h.processedBy
    });
  });

  // Lounge
  store.loungeHistory.forEach(l => {
    data.push({
      ts: l.timestamp, dept: '☕ صالة', name: l.name, amount: l.total,
      note: l.orders.map(o => `${o.qty}x ${o.name}`).join(', '), color: '#10b981', processedBy: l.processedBy
    });
  });

  // Customers
  store.archivedCustomers.forEach(c => {
    data.push({
      ts: c.archivedAt, dept: '👥 عملاء', name: c.name, amount: c.settledAmount || 0,
      note: 'تحصيل مديونية عند أرشفة الحساب', color: '#f59e0b', processedBy: c.archivedBy
    });
  });

  // Expenses
  store.archivedExpenses.forEach(e => {
    data.push({
      ts: e.timestamp || e.archivedAt, dept: '💸 مصروفات', name: e.category, amount: -e.amount,
      note: e.note || 'مصروف عام', color: '#ef4444', processedBy: e.processedBy
    });
  });

  // Salaries (Admin Only)
  if (isAdmin.value) {
    store.archivedSalaries.filter(s => !s.isAdjustment).forEach(s => {
      data.push({
        ts: s.timestamp, dept: '💰 مرتبات', name: s.username, amount: -s.amount,
        note: (s.type === 'salary_payment' ? 'صرف مرتب' : 'مسحوبات') + (s.note ? ` - ${s.note}` : ''),
        color: '#8b5cf6', processedBy: s.processedBy
      });
    });
  }

  return data.sort((a, b) => new Date(b.ts) - new Date(a.ts));
});

const filteredGlobalData = computed(() => {
  return globalData.value.filter(d => {
    const matchesUser = globalFilters.user ? (d.processedBy === globalFilters.user) : true;
    const matchesDept = globalFilters.dept ? (d.dept === globalFilters.dept) : true;
    const matchesSub = globalFilters.subDept ? (d.subDept === globalFilters.subDept) : true;
    let matchesDate = true;
    if (globalFilters.from && new Date(d.ts) < new Date(globalFilters.from)) matchesDate = false;
    if (globalFilters.to) {
      const toDate = new Date(globalFilters.to);
      toDate.setHours(23,59,59,999);
      if (new Date(d.ts) > toDate) matchesDate = false;
    }
    return matchesUser && matchesDept && matchesSub && matchesDate;
  });
});

const globalTotal = computed(() => filteredGlobalData.value.reduce((sum, row) => sum + row.amount, 0));

// Actions
const clearArchive = async (type) => {
  const titles = { history: 'أرشيف الأجهزة', loungeHistory: 'أرشيف الصالة', archivedCustomers: 'أرشيف العملاء', archivedExpenses: 'أرشيف المصروفات', archivedSalaries: 'أرشيف المرتبات' };
  const confirmed = await ui.confirm({
    title: 'تفريغ الأرشيف',
    message: `تحذير: سيتم مسح ${titles[type]} بالكامل. هل أنت متأكد؟`,
    type: 'danger'
  });
  if (confirmed) {
    store.clearArchiveData(type);
    ui.showToast('تم تفريغ الأرشيف بنجاح');
  }
};

const clearAllArchives = async () => {
  const confirmed = await ui.confirm({
    title: 'مسح شامل للأرشيف',
    message: 'تنبيه خطير: سيتم مسح كافة الأرشيفات بالكامل (أجهزة، صالة، مصروفات، عملاء، مرتبات). هل أنت متأكد تماماً؟',
    type: 'danger'
  });
  if (confirmed) {
    const archives = ['history', 'loungeHistory', 'archivedCustomers', 'archivedExpenses', 'archivedSalaries'];
    archives.forEach(type => store.clearArchiveData(type));
    ui.showToast('تم تصفير الأرشيف الشامل بالكامل بنجاح');
  }
};

const deleteRecord = async (type, record) => {
  const confirmed = await ui.confirm({
    title: 'حذف سجل',
    message: 'هل تريد حذف هذا السجل نهائياً؟',
    type: 'warning'
  });
  if (confirmed) {
    if (type === 'history') store.deleteFromHistory(record.timestamp);
    if (type === 'loungeHistory') store.deleteFromLoungeHistory(record.timestamp);
    if (type === 'archivedCustomers') store.deleteFromArchivedCustomers(record.archivedAt);
    if (type === 'archivedExpenses') store.deleteFromArchivedExpenses(record.id);
    if (type === 'archivedSalaries') store.deleteSalaryTransaction(record.username, record.id);
    ui.showToast('تم حذف السجل بنجاح');
  }
};

const resetFilters = () => {
  globalFilters.user = ''; globalFilters.dept = ''; globalFilters.subDept = ''; globalFilters.from = ''; globalFilters.to = '';
};

// Modal Actions
const viewInvoice = (h) => {
  modalType.value = 'device'; modalTitle.value = `فاتورة جهاز: ${h.deviceName}`;
  activeInvoice.value = h; showModal.value = true;
};
const viewLoungeInvoice = (l) => {
  modalType.value = 'lounge'; modalTitle.value = `فاتورة صالة: ${l.name}`;
  activeInvoice.value = l; showModal.value = true;
};
const viewCustomerArchive = (c) => {
  modalType.value = 'customer'; modalTitle.value = `أرشيف مديونية: ${c.name}`;
  activeInvoice.value = c; showModal.value = true;
};

const calculateBalance = (ledger) => ledger.reduce((sum, l) => l.type === 'debt' ? sum + l.amount : sum - l.amount, 0);

const printActiveInvoice = (isQuick = false) => {
  if (!activeInvoice.value) return;
  const h = activeInvoice.value;
  
  if (modalType.value === 'device') {
    printUnifiedInvoice({
      title: 'فاتورة أرشيف - كلاسيكو',
      dateStr: formatDate(h.timestamp),
      timeStr: formatTime(h.timestamp),
      deviceName: h.deviceName,
      startTimeFormatted: formatTime(h.startTime),
      endTimeFormatted: formatTime(h.endTime),
      usedDuration: formatDuration(h.usedTimeSeconds),
      timeCost: h.timeCost,
      orders: h.orders,
      ordersCost: h.ordersCost,
      totalCost: h.totalCost,
      processedBy: h.processedBy,
      paymentType: h.paymentType || 'cash'
    }, isQuick);
  } else if (modalType.value === 'lounge') {
    printUnifiedInvoice({
      title: 'فاتورة صالة - أرشيف',
      dateStr: formatDate(h.timestamp),
      timeStr: formatTime(h.timestamp),
      deviceName: null,
      loungeName: h.name,
      orders: h.orders,
      ordersCost: h.total,
      timeCost: 0,
      totalCost: h.total,
      processedBy: h.processedBy,
      paymentType: 'cash'
    }, isQuick);
  } else if (modalType.value === 'customer') {
    printUnifiedInvoice({
      title: 'كشف حساب عميل',
      subtitle: 'سجل مديونيات مؤرشف',
      dateStr: formatDate(h.archivedAt),
      customerName: h.name,
      ledger: h.ledger,
      totalCost: h.settledAmount || 0,
      processedBy: h.archivedBy
    }, isQuick);
  }
};

// Helpers
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatDate = (iso) => new Date(iso).toLocaleDateString();
const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDuration = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
};
</script>

<style scoped>
.archive-header {
  margin-bottom: 1.5rem;
}

.archive-header-unified {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1.2rem;
  margin-bottom: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
}

.settings-tabs-bar-integrated {
  display: flex;
  gap: 0.3rem;
  background: rgba(0,0,0,0.3);
  padding: 0.3rem;
  border-radius: 12px;
}

.tab-item-mini {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  font-family: 'Cairo', sans-serif;
  font-size: 0.8rem;
}

.tab-item-mini.active {
  background: rgba(0, 229, 255, 0.1);
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 229, 255, 0.2);
}

.tab-item-mini:hover:not(.active) {
  background: rgba(255,255,255,0.05);
  color: white;
}

.header-summary-card-mini {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-summary-card-mini .summary-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
}

.header-summary-card-mini .summary-value {
  font-size: 1rem;
  font-weight: 900;
  font-family: 'Inter', sans-serif;
}

.neon-gold { border-color: #fbbf24; color: #fbbf24; }
.neon-gold .summary-value { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }

/* Tools Bar */
.archive-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
}
.tab-internal-title {
  margin: 0;
  color: var(--accent-cyan);
  font-weight: 800;
  font-size: 1.2rem;
  width: 250px;
  text-align: left; /* Aligns to far left in RTL */
}

/* Header Summary Card */
.header-summary-card {
  flex: 1;
  display: flex;
  flex-direction: row; /* Horizontal */
  align-items: center;
  justify-content: center;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 180px;
}
.summary-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 700;
}
.summary-value {
  font-size: 1.1rem;
  font-weight: 900;
  font-family: 'Inter', sans-serif;
}

/* Neon Variants */
.neon-cyan { border-color: #00e5ff; color: #00e5ff; }
.neon-cyan .summary-value { color: #00e5ff; text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }

.neon-yellow { border-color: #fbbf24; color: #fbbf24; }
.neon-yellow .summary-value { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }

.neon-green { border-color: #10b981; color: #10b981; }
.neon-green .summary-value { color: #10b981; text-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }

.neon-red { border-color: #ef4444; color: #ef4444; }
.neon-red .summary-value { color: #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }

.neon-purple { border-color: #8b5cf6; color: #8b5cf6; }
.neon-purple .summary-value { color: #8b5cf6; text-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }

.neon-blue { border-color: #3b82f6; color: #3b82f6; }
.neon-blue .summary-value { color: #3b82f6; text-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }

.btn-clear-modern {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  transition: background 0.2s ease, color 0.2s ease;
  font-family: 'Cairo', sans-serif;
  width: 250px;
  justify-content: center;
}
.btn-clear-modern:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.tab-content {
  /* Animation removed for instant transition */
}

.danger-text { color: #ef4444 !important; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}
.modal-content {
  padding: 2.5rem;
  border-radius: 24px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.highlight-row {
  font-weight: bold;
  color: var(--accent-cyan);
}
.grand-total-row {
  margin-top: 1.5rem;
  padding: 1.2rem;
  background: rgba(0,0,0,0.4);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 229, 255, 0.2);
}

.category-badge-neon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 229, 255, 0.4);
  color: #00e5ff;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(0, 229, 255, 0.05);
  min-width: 90px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.filter-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-right: 0.3rem;
}

.premium-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'Cairo', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  cursor: pointer;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.premium-input:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 229, 255, 0.4);
}

.premium-input:focus {
  border-color: #00e5ff;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 2px 4px rgba(0,0,0,0.2);
  background: rgba(15, 23, 42, 0.8);
}

/* Style for the date picker icon in modern browsers */
.premium-input::-webkit-calendar-picker-indicator {
  filter: invert(1) sepia(100%) saturate(500%) hue-rotate(150deg);
  cursor: pointer;
}
</style>
