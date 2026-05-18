<template>
  <div class="dashboard-wrapper">
    <main class="main-area glass-panel page-watermark" style="width: 100%; position: relative; overflow-y: auto;">
      
      <!-- Page Header -->
      <div class="settings-header-premium" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <h2 class="premium-title-main" style="margin: 0;">⚙️ اعدادات النظام والتقارير والموظفين</h2>
          <span style="font-size: 0.8rem; font-weight: bold; background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2)); border: 1px solid rgba(0, 229, 255, 0.3); color: #00e5ff; padding: 4px 10px; border-radius: 8px; box-shadow: 0 0 10px rgba(6, 182, 212, 0.2); white-space: nowrap; font-family: 'Cairo', sans-serif; direction: ltr; letter-spacing: 1.5px;">{{ appVersion }}</span>
        </div>
        
        <!-- Multi-Branch Controls (Only for multi-device subscription owners) -->
        <div v-if="store.subscriptionData?.max_devices > 1" class="multi-branch-panel glass-panel" style="display: flex; align-items: center; gap: 1rem; padding: 8px 16px; border-radius: 12px; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(0, 229, 255, 0.15);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: bold;">🌐 رؤية الفروع المتعددة:</span>
            <label class="premium-switch">
              <input 
                type="checkbox" 
                :checked="store.multiBranchActive" 
                @change="e => store.setMultiBranchActive(e.target.checked)"
              >
              <span class="premium-slider"></span>
            </label>
          </div>

          <!-- Branch Select Dropdown (Only visible when Multi-Branch is Active) -->
          <div v-if="store.multiBranchActive" class="branch-select-container animate-fade-in" style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85rem; color: #00e5ff; font-weight: bold;">📍 الفرع:</span>
            <select v-model="store.activeBranchFilter" class="premium-input-mini" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(0, 229, 255, 0.2); color: #fff; padding: 4px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; outline: none; cursor: pointer;">
              <option value="all">كل الفروع (شامل) 🌍</option>
              <option value="local">الفرع الحالي فقط (محلي) 🏠</option>
              <option v-for="b in store.multiBranchData" :key="b.machine_id" :value="b.machine_id">{{ b.name }} 🖥️</option>
            </select>
          </div>
        </div>
        
        <!-- Navigation Tabs Grouped -->
        <nav class="settings-tabs-rebuilt">
          <!-- Group 1: Staff -->
          <div class="nav-group">
            <div class="group-header">اعدادات الموظفين</div>
            <div class="group-buttons">
              <button v-if="store.canAccess('settings_staff', 'view')" @click="activeTab = 'staff'" :class="['tab-item', { active: activeTab === 'staff' }]">
                <span class="icon">👤</span> إدارة الموظفين
              </button>
              <button v-if="store.canAccess('settings_salaries', 'view')" @click="activeTab = 'salaries'" :class="['tab-item', { active: activeTab === 'salaries' }]">
                <span class="icon">💰</span> المرتبات والمسحوبات
              </button>
            </div>
          </div>

          <div class="nav-divider-v3"></div>

          <!-- Group 2: Reports -->
          <div class="nav-group">
            <div class="group-header">التقارير واليومية</div>
            <div class="group-buttons">
              <button v-if="store.canAccess('settings_journal', 'view')" @click="activeTab = 'journal'" :class="['tab-item', { active: activeTab === 'journal' }]">
                <span class="icon">📓</span> اليومية ووردية العمل
              </button>
              <button v-if="store.canAccess('settings_reports', 'view')" @click="activeTab = 'reports'" :class="['tab-item', { active: activeTab === 'reports' }]">
                <span class="icon">📊</span> التقارير والأرباح
              </button>
              <button v-if="store.canAccess('settings_analytics', 'none')" @click="activeTab = 'analytics'" :class="['tab-item', { active: activeTab === 'analytics' }]">
                <span class="icon">📈</span> ذكاء الأعمال
              </button>
            </div>
          </div>

          <div class="nav-divider-v3"></div>

          <!-- Group 3: System -->
          <div class="nav-group">
            <div class="group-header">اعدادات النظام والاشتراكات</div>
            <div class="group-buttons">
              <button v-if="store.canAccess('settings_activity', 'view')" @click="activeTab = 'activity'" :class="['tab-item', { active: activeTab === 'activity' }]">
                <span class="icon">📜</span> سجل النشاط
              </button>
              <button v-if="store.canAccess('settings_identity', 'none')" @click="activeTab = 'identity'" :class="['tab-item', { active: activeTab === 'identity' }]">
                <span class="icon">🏷️</span> إعدادات الهوية
              </button>
              <button v-if="store.canAccess('settings_system', 'none')" @click="activeTab = 'system'" :class="['tab-item', { active: activeTab === 'system' }]">
                <span class="icon">⚙️</span> النظام
              </button>
              <button v-if="store.canAccess('settings_subscription', 'none')" @click="activeTab = 'subscription'" :class="['tab-item', { active: activeTab === 'subscription' }]">
                <span class="icon">🛡️</span> إدارة اشتراكي
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div class="settings-content-wrapper">
        
        <!-- 0. Subscription Management Tab -->
        <div v-if="activeTab === 'subscription'" class="tab-content-inner">
           <SubscriptionTab />
        </div>
        
        <!-- 1. Staff Management Tab -->
        <div v-if="activeTab === 'staff'" class="staff-layout">
          <!-- Left: Staff List -->
          <div class="staff-list-section">
            <div class="section-top-bar">
              <h3 class="sub-title">📋 قائمة طاقم العمل</h3>
              <div class="search-box-glass">
                <input type="text" v-model="staffSearch" placeholder="بحث عن موظف...">
                <span class="search-icon">🔍</span>
              </div>
            </div>

            <div class="modern-table-container">
              <table class="staff-table">
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th style="text-align: center;">الصلاحية</th>
                    <th style="text-align: center;">الراتب</th>
                    <th style="text-align: center;">المتبقي حالياً</th>
                    <th style="text-align: center;">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredStaff" :key="user.username">
                    <td>
                      <div class="user-info-cell">
                        <span class="user-name">{{ user.username }}</span>
                        <span class="user-date">تاريخ الانضمام: {{ user.joinedAt || '---' }}</span>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <span :class="['role-badge', user.role]">{{ user.role === 'manager' ? 'مدير' : 'موظف' }}</span>
                    </td>
                    <td style="text-align: center;">
                      <div class="salary-info">
                        <span class="salary-amt">{{ user.baseSalary }} ج</span>
                        <span class="salary-cycle">{{ user.salaryCycle === 'monthly' ? 'شهري' : 'أسبوعي' }}</span>
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <span class="current-due-neon">{{ user.currentBalance || 0 }} ج</span>
                    </td>
                    <td style="text-align: center;">
                      <div v-if="store.canAccess('settings_staff', 'edit') && !isReadOnlyMode" class="actions-group-mini">
                        <button @click="editStaff(user)" class="btn-edit-user" title="تعديل">✏️</button>
                        <button @click="openPermissionsModal(user.username)" class="btn-perms-trigger" title="الصلاحيات">🛡️ الصلاحيات</button>
                        <button v-if="user.username !== 'admin'" @click="deleteStaff(user.username)" class="btn-delete-user" title="حذف">🗑️</button>
                      </div>
                      <span v-else-if="isReadOnlyMode" style="color: var(--text-muted); font-size: 0.85rem;">🔒 مقفل</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right: Add/Edit Staff Form -->
          <div class="staff-form-section">
            <div v-if="isReadOnlyMode" class="glass-card-form" style="border: 1px dashed rgba(0, 229, 255, 0.2); background: rgba(0, 0, 0, 0.4); text-align: center; padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; min-height: 350px;">
              <div style="font-size: 3rem; animation: pulse 2s infinite;">🔒</div>
              <h3 style="color: var(--accent-cyan); font-weight: bold; margin: 0;">وضع الاطلاع فقط نشط</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.6; margin: 0; max-width: 250px;">
                أنت تقوم حالياً باستعراض بيانات الموظفين لفرع آخر. تمت حماية البيانات المحلية وقفل عمليات الإضافة أو التعديل.
              </p>
            </div>
            <div v-else class="glass-card-form" :class="{ 'edit-mode-active': editingStaffMode }">
              <h3 class="form-title" :class="{ 'title-edit': editingStaffMode }">
                <span class="icon">👤</span> 
                {{ editingStaffMode ? 'تعديل بيانات موظف' : 'إضافة/تعديل موظف' }}
                <span v-if="editingStaffMode" class="pulse-indicator"></span>
              </h3>
              
              <div class="form-row-modern">
                <div class="form-group-modern">
                  <label>اسم المستخدم</label>
                  <input type="text" v-model="staffForm.username" placeholder="مثلاً: أحمد محمد" :disabled="editingStaffMode">
                </div>

                <div class="form-group-modern">
                  <label>كلمة السر</label>
                  <input type="password" v-model="staffForm.password" placeholder="****">
                </div>
              </div>

              <div class="form-row-modern">
                <div class="form-group-modern">
                  <label>الراتب الأساسي</label>
                  <input type="number" v-model="staffForm.baseSalary" placeholder="ادخل الراتب الاساسى">
                </div>
                <div class="form-group-modern">
                  <label>دورة الراتب</label>
                  <select v-model="staffForm.salaryCycle">
                    <option value="monthly">شهري 🌙</option>
                    <option value="weekly">أسبوعي 📅</option>
                  </select>
                </div>
              </div>

              <div class="form-group-modern">
                <label>صلاحية الدخول</label>
                <select v-model="staffForm.role" :disabled="staffForm.username === 'admin'">
                  <option value="staff">موظف (Staff)</option>
                  <option value="manager">مدير (Manager)</option>
                </select>
              </div>

              <button v-if="store.canAccess('settings_staff', 'edit')" @click="saveStaff" class="btn-save-staff">
                {{ editingStaffMode ? 'تحديث بيانات الموظف ✨' : 'حفظ بيانات الموظف ✨' }}
              </button>
              <button v-if="editingStaffMode" @click="cancelStaffEdit" class="btn-cancel-edit">إلغاء التعديل</button>
            </div>
          </div>
        </div>

        <!-- 2. Salaries & Withdrawals Tab -->
        <div v-if="activeTab === 'salaries'" class="salaries-rebuilt-container">
          
          <!-- Left: Account Statement -->
          <div class="statement-area">
            <div v-if="!selectedStaffUsername" class="empty-selection-v3">
              <div class="empty-inner">
                <span class="icon">👈</span>
                <h3>يرجى اختيار موظف من القائمة اليمنى لعرض كشف حسابه</h3>
              </div>
            </div>

            <div v-else class="full-statement-v3">
              <div class="metrics-summary-box">
                <div class="metric cyan">
                  <span class="m-label">الراتب الأساسي</span>
                  <span class="m-val">{{ formatCurrency(store.users[selectedStaffUsername]?.baseSalary || 0) }} ج</span>
                </div>
                <div class="metric-divider"></div>
                <div class="metric red">
                  <span class="m-label">إجمالي المسحوبات</span>
                  <span class="m-val">{{ formatCurrency(selectedStaffTotalWithdrawals) }} ج</span>
                </div>
                <div class="metric-divider"></div>
                <div class="metric green">
                  <span class="m-label">صافي المتبقي صرفه</span>
                  <span class="m-val">{{ formatCurrency(selectedStaffNetRemaining) }} ج</span>
                </div>
              </div>

              <div class="statement-info-row">
                 <h3 class="statement-title-v3">سجل معاملات الموظف: {{ selectedStaffUsername }}</h3>
                 <span class="statement-hint-v3">* تظهر هنا العمليات غير المؤرشفة فقط</span>
              </div>

              <div class="table-frame-v3">
                <div class="table-watermark">CLASSICO <span>Playstation & Cafe</span></div>
                <table class="table-v3">
                  <thead>
                    <tr>
                      <th style="width: 50px;"></th>
                      <th style="text-align: right;">التاريخ والوقت</th>
                      <th style="text-align: center;">نوع العملية</th>
                      <th>الملاحظة</th>
                      <th style="text-align: center;">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in selectedStaffTransactions" :key="t.id" class="row-v3">
                      <td style="text-align: center;">
                        <button v-if="store.canAccess('settings_staff', 'edit') && !isReadOnlyMode" @click="deleteTransaction(t.id)" class="btn-x-v3" title="حذف">✕</button>
                      </td>
                      <td style="text-align: right;">
                        <div class="time-v3">
                          <span class="d-v3">{{ formatDate(t.timestamp) }}</span>
                          <span class="t-v3">{{ formatTime(t.timestamp) }}</span>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <span class="type-badge-v3">{{ t.type === 'withdrawal' ? 'مسحوبات' : 'تصفية راتب' }}</span>
                      </td>
                      <td class="note-v3">{{ t.note || '---' }}</td>
                      <td style="text-align: center;" class="amt-v3">
                        {{ formatCurrency(t.amount) }} ج
                      </td>
                    </tr>
                    <tr v-if="selectedStaffTransactions.length === 0">
                      <td colspan="5" class="empty-table-v3">لا توجد حركات مالية مسجلة لهذا الموظف</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right: Transaction Form -->
          <div class="form-area">
            <div v-if="isReadOnlyMode" class="form-card-v3" style="border: 1px dashed rgba(0, 229, 255, 0.2); background: rgba(0, 0, 0, 0.4); text-align: center; padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; min-height: 250px;">
              <div style="font-size: 3rem; animation: pulse 2s infinite;">🔒</div>
              <h3 style="color: var(--accent-cyan); font-weight: bold; margin: 0;">وضع الاطلاع فقط نشط</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.6; margin: 0; max-width: 250px;">
                لا يمكن تسجيل مسحوبات أو تسوية رواتب أثناء الاطلاع على الفروع المتعددة. تمت حماية البيانات المحلية.
              </p>
            </div>
            <div v-else class="form-card-v3">
              <h3 class="form-header-v3">
                <span class="icon">💰</span> تسجيل عملية مالية
              </h3>
              <div class="field-v3">
                <label>اختر الموظف</label>
                <select v-model="selectedStaffUsername">
                  <option value="">اختر الموظف...</option>
                  <option v-for="u in Object.values(store.users || {})" :key="u.username" :value="u.username">
                    {{ u.username }}
                  </option>
                </select>
              </div>
              <div class="field-v3">
                <label>المبلغ (ج)</label>
                <input type="number" v-model="salaryOp.amount" placeholder="ادخل المبلغ">
              </div>
              <div class="field-v3">
                <label>بيان / ملاحظة</label>
                <input type="text" v-model="salaryOp.note" placeholder="مثلاً: سلفة طارئة">
              </div>
              <div v-if="store.canAccess('settings_staff', 'edit')" class="btns-v3">
                <button @click="handleSalaryOp('withdrawal')" class="btn-red-v3" :disabled="!selectedStaffUsername || salaryOp.amount <= 0">
                  تسجيل مسحوبات (خصم) 🔴
                </button>
                <button @click="handleSalaryOp('settlement')" class="btn-green-v3" :disabled="!selectedStaffUsername">
                  صرف الراتب المتبقي وتصفية الحساب 📦
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Journal Tab -->
        <div v-if="activeTab === 'journal'" class="tab-content-inner">
           <div class="journal-integrated-dashboard">
              <div class="journal-status-bar glass-panel">
                 <div class="status-left">
                    <button v-if="store.canAccess('settings_journal', 'edit') && !isReadOnlyMode" @click="closeShift" class="btn-close-shift-neon">⚙️ تقفيل اليومية (الوردية)</button>
                     <button v-else-if="isReadOnlyMode" class="btn-close-shift-neon" style="opacity: 0.6; cursor: not-allowed; border-color: rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: var(--text-muted);" disabled>🔒 تقفيل الوردية مقفل (مشاهدة)</button>
                 </div>
                 <div class="status-right">
                    <div class="shift-title">📓 اليومية الحالية</div>
                    <div class="shift-start">بداية الوردية: {{ formatDate(store.lastJournalClosure) }} , {{ formatTime(store.lastJournalClosure) }}</div>
                 </div>
              </div>

              <div class="journal-cards-grid">
                 <div class="j-card cyan">
                    <div class="j-label">🎮 أجهزة</div>
                    <div class="j-val">{{ formatCurrency(shiftStats.psRevenue) }} ج</div>
                 </div>
                 <div class="j-card green">
                    <div class="j-label">☕ صالة</div>
                    <div class="j-val">{{ formatCurrency(shiftStats.loungeRevenue) }} ج</div>
                 </div>
                 <div class="j-card white">
                    <div class="j-label">🤝 مديونية محصلة</div>
                    <div class="j-val">{{ formatCurrency(shiftStats.customerCollections) }} ج</div>
                 </div>
                 <div class="j-card red">
                    <div class="j-label">📉 مصروفات</div>
                    <div class="j-val">{{ formatCurrency(shiftStats.expenseSum) }} ج</div>
                 </div>
                 <div class="j-card purple">
                    <div class="j-label">👤 رواتب</div>
                    <div class="j-val">{{ formatCurrency(totalShiftSalaries) }} ج</div>
                 </div>
                 <div class="j-card gold">
                    <div class="j-label">⭐ الصافي</div>
                    <div class="j-val">{{ formatCurrency(shiftStats.netProfit - totalShiftSalaries) }} ج</div>
                 </div>
              </div>

              <div class="detailed-journal-section glass-panel">
                 <div class="section-header-row" style="display: flex; align-items: center; justify-content: space-between;">
                    <h3 class="section-title" style="margin-bottom: 0;">📄 كشف اليومية التفصيلي</h3>
                    <button @click="showJournalPopup = true" class="btn-view-journal-v3">📓 عرض اليوميه</button>
                 </div>
                 <div class="table-scroll-area">
                    <table class="premium-table-journal">
                       <thead>
                          <tr>
                             <th>الوقت</th>
                             <th>البيان</th>
                             <th style="text-align: center;">القسم</th>
                             <th style="text-align: center;">داخل (+)</th>
                             <th style="text-align: center;">خارج (-)</th>
                             <th style="text-align: center;">المسؤول</th>
                              <th v-if="store.multiBranchActive" style="text-align: center;">الفرع</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr v-for="(entry, index) in getShiftDetailedData()" :key="index" class="journal-row">
                             <td class="time-cell">
                                <div class="time-wrap">
                                   <span>{{ formatTime(entry.ts) }}</span>
                                   <span class="date-sub">{{ formatDate(entry.ts) }}</span>
                                </div>
                             </td>
                             <td class="desc-cell">{{ entry.name }}</td>
                             <td style="text-align: center;">
                                <div class="dept-badge-container">
                                   <span v-if="entry.dept === 'أجهزة'" class="dept-badge-v3 devices">🎮 أجهزة</span>
                                   <span v-else-if="entry.dept === 'صالة'" class="dept-badge-v3 lounge">☕ صالة</span>
                                   <span v-else-if="entry.dept === 'مديونية'" class="dept-badge-v3 debt">🤝 مديونية</span>
                                   <span v-else-if="entry.dept === 'مصروفات'" class="dept-badge-v3 expenses">📉 مصروفات</span>
                                   <span v-else-if="entry.dept === 'موظف' || entry.dept === 'راتب' || entry.dept === 'مرتبات'" class="dept-badge-v3 staff">👤 موظف</span>
                                   <span v-else class="dept-badge-v3 generic">{{ entry.dept }}</span>
                                </div>
                             </td>
                             <td style="text-align: center;" class="in-cell">
                                {{ entry.in > 0 ? '+' + formatCurrency(entry.in) + ' ج' : '---' }}
                             </td>
                             <td style="text-align: center;" class="out-cell">
                                {{ entry.out > 0 ? '-' + formatCurrency(entry.out) + ' ج' : '---' }}
                             </td>
                             <td style="text-align: center;" class="user-cell">{{ entry.processedBy || '---' }}</td>
                              <td v-if="store.multiBranchActive" style="text-align: center;">
                                 <div class="branch-badge" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); border: 1px solid rgba(0, 229, 255, 0.25); padding: 4px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);">
                                    📍 {{ entry.branchName || 'محلي' }}
                                 </div>
                              </td>
                          </tr>
                       </tbody>
                    </table>
                    <!-- Spacer to prevent cutting off last row -->
                    <div style="height: 80px;"></div>
                 </div>
              </div>
           </div>
        </div>

        <!-- 4. Reports Tab -->
        <div v-if="activeTab === 'reports'" class="reports-rebuilt-container">
           <div class="reports-filter-box-v3">
              <div class="filter-inputs">
                 <div class="integrated-title-v3">
                    <h3 class="reports-main-title">ملخص الأرباح والتقارير</h3>
                 </div>
                 <div class="filter-group margin-left-auto">
                    <label>📅 من تاريخ</label>
                    <input type="date" v-model="reportFilter.start">
                 </div>
                 <div class="filter-group">
                    <label>📅 إلى تاريخ</label>
                    <input type="date" v-model="reportFilter.end">
                 </div>
                 <div class="filter-group">
                    <label>📂 القسم:</label>
                    <select v-model="reportFilter.dept" class="filter-select-v3" @change="reportFilter.subDept = ''">
                       <option value="">الكل</option>
                       <option value="أجهزة">🎮 أجهزة</option>
                       <option value="صالة">☕ صالة</option>
                       <option value="مديونية">🤝 مديونية</option>
                       <option value="مصروفات">📉 مصروفات</option>
                       <option value="موظف">👤 موظف</option>
                    </select>
                 </div>
                 <!-- Smart Sub-Filter for Monitoring -->
                 <div v-if="reportFilter.dept === 'أجهزة' && monitoringGroups.length > 0" class="filter-group animate-fade-in">
                    <label>🔍 التحديد:</label>
                    <select v-model="reportFilter.subDept" class="filter-select-v3">
                       <option value="">كل الأنواع</option>
                       <option v-for="g in monitoringGroups" :key="g" :value="g">{{ g }}</option>
                    </select>
                 </div>
                 <div class="filter-group">
                    <label>👤 المسؤول:</label>
                    <select v-model="reportFilter.user" class="filter-select-v3">
                       <option value="">الكل</option>
                       <option v-for="user in Object.keys(store.users)" :key="user" :value="user">{{ user }}</option>
                    </select>
                 </div>
                 <button @click="applyReportFilter" class="btn-filter-apply">تطبيق الفلتر 🔍</button>
                 <button @click="showAllReports" class="btn-filter-all">الكل</button>
              </div>
           </div>

           <div class="reports-stats-grid-v3">
              <div class="r-card-v3 cyan">
                 <div class="r-card-top">🎮 أرباح الأجهزة</div>
                 <div class="r-card-val">{{ formatCurrency(getReportStats.psRevenue) }} ج</div>
              </div>
              <div class="r-card-v3 green">
                 <div class="r-card-top">☕ أرباح الصالة</div>
                 <div class="r-card-val">{{ formatCurrency(getReportStats.loungeRevenue) }} ج</div>
              </div>
              <div class="r-card-v3 white">
                 <div class="r-card-top">🤝 مديونية محصلة</div>
                 <div class="r-card-val">{{ formatCurrency(getReportStats.collectedDebt) }} ج</div>
              </div>
              <div class="r-card-v3 red">
                 <div class="r-card-top">📉 إجمالي المصاريف</div>
                 <div class="r-card-val">{{ formatCurrency(getReportStats.expenses) }} ج</div>
              </div>
              <div class="r-card-v3 purple">
                 <div class="r-card-top">👤 رواتب ومسحوبات</div>
                 <div class="r-card-val">{{ formatCurrency(getReportStats.salaries) }} ج</div>
              </div>
              <div class="r-card-v3 gold">
                 <div class="r-card-top">⭐ صافي الربح</div>
                 <div class="r-card-val">{{ formatCurrency(getReportStats.net) }} ج</div>
              </div>
           </div>

           <div class="reports-bottom-actions">
              <button v-if="store.canAccess('settings_reports', 'edit')" @click="showExportModal = true" class="btn-export-trigger">تصدير الكشف 📥</button>
              <button v-if="store.canAccess('settings_reports', 'none')" @click="viewDetailedReport" class="btn-detailed-report">كشف حساب تفصيلي 📄</button>
           </div>

           <div v-if="showExportModal" class="export-modal-v3-overlay">
              <div class="export-modal-v3-content glass-panel">
                 <h3 class="modal-title-v3">اختر صيغة التصدير</h3>
                 <p class="modal-desc-v3">سيتم تصدير كشف الحساب بناءً على الفترة المحددة حالياً</p>
                 <div class="export-btns-row">
                    <button @click="exportToPDF" class="btn-export-option pdf">تصدير PDF 📄</button>
                    <button @click="exportToExcel" class="btn-export-option excel">تصدير Excel 📊</button>
                 </div>
                 <button @click="showExportModal = false" class="btn-export-cancel">إلغاء</button>
              </div>
           </div>

           <div v-if="showDetailedReportTable" class="statement-modal-v3-overlay">
              <div class="statement-modal-v3-content glass-panel">
                 <div class="statement-header-v3">
                    <div class="header-right-group">
                       <h3 class="statement-title-cyan">كشف حساب تفصيلي خلال الفترة</h3>
                       <button v-if="store.canAccess('settings_reports', 'edit')" @click="showExportModal = true" class="btn-export-trigger-mini">تصدير الكشف 📥</button>
                    </div>
                    <button @click="showDetailedReportTable = false" class="btn-close-statement-large">إغلاق ✕</button>
                 </div>

                 <div class="statement-table-wrapper-v3">
                    <div class="table-watermark">CLASSICO <span>Playstation & Cafe</span></div>
                    <table class="table-v3">
                       <thead>
                          <tr>
                             <th style="text-align: right;">التاريخ والوقت</th>
                             <th style="text-align: center;">البيان</th>
                             <th style="text-align: center;">الوارد (+)</th>
                             <th style="text-align: center;">المنصرف (-)</th>
                             <th style="text-align: center;">الرصيد التراكمي</th>
                              <th v-if="store.multiBranchActive" style="text-align: center;">الفرع</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr v-for="(row, idx) in detailedReportRows" :key="idx" class="row-v3">
                             <td style="text-align: right;">
                                <div class="time-v3">
                                   <span class="d-v3">{{ formatDate(row.ts) }}</span>
                                   <span class="t-v3">{{ formatTime(row.ts) }}</span>
                                </div>
                             </td>
                             <td style="text-align: center;">
                                <div class="item-desc-v3 centered">
                                   <span :class="['dept-badge-v3-large', row.type]">{{ row.dept }}</span>
                                   <span class="item-name-v3-bold">{{ row.name }}</span>
                                </div>
                             </td>
                             <td style="text-align: center;" class="in-val-v3">
                                {{ row.in > 0 ? formatCurrency(row.in) + ' ج' : '--' }}
                             </td>
                             <td style="text-align: center;" class="out-val-v3">
                                {{ row.out > 0 ? formatCurrency(row.out) + ' ج' : '--' }}
                             </td>
                             <td style="text-align: center;" class="balance-val-v3">
                                {{ formatCurrency(row.runningBalance) }} ج
                              </td>
                              <td v-if="store.multiBranchActive" style="text-align: center;">
                                 <div class="branch-badge" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); border: 1px solid rgba(0, 229, 255, 0.25); padding: 4px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                                    📍 {{ row.branchName || 'محلي' }}
                                 </div>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>

        <!-- 5. Activity Log Tab -->
        <div v-if="activeTab === 'activity'" class="tab-content-inner fadeScale">
          <div class="section-header-premium">
            <h2 class="premium-title-main">📜 سجل النشاط التفصيلي</h2>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <button v-if="!isReadOnlyMode" @click="clearActivityLog" class="btn danger-btn-action" style="background: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important; border: 1px solid rgba(239, 68, 68, 0.3) !important; padding: 0.5rem 1rem;">
                🗑️ تنظيف السجل
              </button>
              <div class="search-wrapper">
                <input type="text" v-model="activitySearchQuery" placeholder="بحث في السجل (مستخدم، إجراء، تفاصيل)..." class="search-input-glass" style="width: 350px;">
              </div>
            </div>
          </div>

          <div class="modern-table-container" style="margin-top: 1.5rem; max-height: 600px;">
            <table class="staff-table">
              <thead>
                <tr>
                  <th style="width: 200px; text-align: right;">التاريخ والوقت</th>
                  <th style="width: 150px; text-align: center;">المستخدم</th>
                  <th v-if="store.multiBranchActive" style="width: 150px; text-align: center;">الفرع</th>
                  <th style="width: 150px; text-align: center;">الإجراء</th>
                  <th style="text-align: right;">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in filteredActivityLog" :key="log.id">
                  <td style="text-align: right;">
                    <div style="font-size: 0.9rem; color: var(--text-main);">{{ formatDate(log.timestamp) }}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">{{ formatTime(log.timestamp) }}</div>
                  </td>
                  <td style="text-align: center;">
                    <span class="user-badge-premium" style="display: inline-flex; margin: 0; padding: 0.3rem 0.8rem;">
                      <span class="user-name-text" style="font-size: 0.9rem;">{{ log.user }}</span>
                    </span>
                  </td>
                  <td v-if="store.multiBranchActive" style="text-align: center;">
                    <div class="branch-badge" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); border: 1px solid rgba(0, 229, 255, 0.25); padding: 4px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                      📍 {{ log.branchName || 'محلي' }}
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <span class="category-badge" :style="{ borderColor: log.action.includes('حذف') || log.action.includes('خروج') ? '#ef4444' : '#00e5ff', color: log.action.includes('حذف') || log.action.includes('خروج') ? '#ef4444' : '#00e5ff' }">
                      {{ log.action }}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 0.95rem; color: var(--text-main);">{{ log.details }}</td>
                </tr>
                <tr v-if="!filteredActivityLog.length">
                  <td :colspan="store.multiBranchActive ? 5 : 4" style="text-align: center; padding: 5rem; color: var(--text-muted);">لا يوجد سجل نشاط مطابق للبحث 🔍</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- BI Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="tab-content-inner fadeScale">
          <div class="section-header-premium" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2rem; margin-bottom: 2rem;">
            <!-- Title & Filters -->
            <div>
              <h2 class="premium-title-main">📈 لوحة تحكم ذكاء الأعمال (BI)</h2>
              <p style="margin: 0; font-size: 0.85rem; color: #94a3b8;">اختر الفترة الزمنية لعرض الإحصائيات (الافتراضي: كل البيانات)</p>
              
              <div style="display: flex; gap: 1rem; align-items: flex-end; margin-top: 1rem;">
                <div class="filter-group">
                  <label style="font-size: 0.75rem; color: var(--text-muted);">من تاريخ</label>
                  <input type="date" v-model="analyticsFilter.from" class="search-input-glass" style="width: 130px; padding: 0.3rem;">
                </div>
                <div class="filter-group">
                  <label style="font-size: 0.75rem; color: var(--text-muted);">إلى تاريخ</label>
                  <input type="date" v-model="analyticsFilter.to" class="search-input-glass" style="width: 130px; padding: 0.3rem;">
                </div>
                <button @click="() => { updateAnalytics(); initCharts(); }" class="btn-sys-v3 success" style="padding: 0.4rem 1.2rem; margin: 0;">
                  تطبيق 🔍
                </button>
              </div>
            </div>

            <!-- KPIs (Compact) -->
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-right: auto; margin-left: auto; justify-content: center;">
              <div class="glass-panel" style="padding: 0.8rem 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; min-width: 130px;">
                <div style="font-size: 0.85rem; color: #10b981; margin-bottom: 0.4rem; font-weight: bold;">الإيرادات</div>
                <div style="font-size: 1.2rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(16,185,129,0.3);">{{ formatCurrency(analyticsData.kpis.revenue) }} ج</div>
              </div>
              <div class="glass-panel" style="padding: 0.8rem 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; min-width: 130px;">
                <div style="font-size: 0.85rem; color: #ef4444; margin-bottom: 0.4rem; font-weight: bold;">المصروفات والرواتب</div>
                <div style="font-size: 1.2rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(239,68,68,0.3);">{{ formatCurrency(analyticsData.kpis.expenses) }} ج</div>
              </div>
              <div class="glass-panel" style="padding: 0.8rem 1.2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; min-width: 130px;">
                <div style="font-size: 0.85rem; color: #f59e0b; margin-bottom: 0.4rem; font-weight: bold;">صافي الربح</div>
                <div style="font-size: 1.2rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(245,158,11,0.3);">{{ formatCurrency(analyticsData.kpis.netProfit) }} ج</div>
              </div>
            </div>
          </div>

          <!-- Branch Comparison Chart (Visible only when All Branches is selected) -->
          <div v-if="store.multiBranchActive && store.activeBranchFilter === 'all'" class="analytics-card glass-panel fadeScale" style="padding: 1.5rem; margin-bottom: 2rem; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(0, 229, 255, 0.15); border-radius: 16px;">
            <h3 style="margin-bottom: 1.5rem; color: #00e5ff; display: flex; align-items: center; gap: 10px;">
              <span>🌐 مقارنة الفروع في المبيعات وصافي الأرباح</span>
              <span style="font-size: 0.8rem; font-weight: normal; color: #94a3b8; margin-right: auto;">(الفترة الزمنية المحددة)</span>
            </h3>
            <div id="branchComparisonChart"></div>
          </div>

          <!-- Row 1: Busy Hours & Top Items -->
          <div class="analytics-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div class="analytics-card glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: var(--accent-cyan);">🕒 أكثر الساعات ازدحاماً (حركة الأجهزة)</h3>
              <div id="hoursChart"></div>
            </div>
            
            <div class="analytics-card glass-panel" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: var(--accent-success);">🏆 الأصناف الأكثر مبيعاً</h3>
                <button @click="toggleItemsChartType" class="btn-sys-v3" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin: 0; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.3s ease;">
                  <span v-if="itemsChartType === 'donut'">📊 كأعمدة</span>
                  <span v-else>🍩 كدائرة</span>
                </button>
              </div>
              <div id="itemsChart"></div>
            </div>
          </div>

          <!-- Row 2: Ratio + Staff -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div class="analytics-card glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: var(--accent-cyan);">⚖️ إيرادات الأجهزة مقابل الصالة</h3>
              <div id="ratioChart"></div>
            </div>
            <div class="analytics-card glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: #8b5cf6;">💼 أداء الموظفين (المبيعات)</h3>
              <div id="staffChart"></div>
            </div>
          </div>

          <!-- Row 3: Income vs Expenses -->
          <div class="analytics-card glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: #fff;">📈 الإيرادات مقابل المصروفات زمنياً</h3>
            <div id="incomeChart"></div>
          </div>

          <!-- Row 4: Debt Analysis & Monthly Profits -->
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; padding-bottom: 3rem;">
            <div class="analytics-card glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: #ec4899;">🤝 تحليل الديون والمديونيات</h3>
              
              <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="flex: 1; background: rgba(16,185,129,0.1); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16,185,129,0.2); text-align: center;">
                  <div style="font-size: 0.8rem; color: #10b981; margin-bottom: 0.5rem;">الديون المحصلة</div>
                  <div style="font-size: 1.2rem; font-weight: bold; color: #10b981;">{{ formatCurrency(analyticsData.debtAnalysis.totalCollected) }} ج</div>
                </div>
                <div style="flex: 1; background: rgba(239,68,68,0.1); padding: 1rem; border-radius: 8px; border: 1px solid rgba(239,68,68,0.2); text-align: center;">
                  <div style="font-size: 0.8rem; color: #ef4444; margin-bottom: 0.5rem;">متبقي في السوق</div>
                  <div style="font-size: 1.2rem; font-weight: bold; color: #ef4444;">{{ formatCurrency(analyticsData.debtAnalysis.totalRemaining) }} ج</div>
                </div>
              </div>

              <h4 style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 0.5rem;">أكثر العملاء استدانة (Top 5)</h4>
              <div v-if="analyticsData.debtAnalysis.topDebtors.length === 0" style="color: #64748b; font-size: 0.85rem; text-align: center; padding: 1rem;">
                لا توجد ديون مسجلة.
              </div>
              <div v-for="d in analyticsData.debtAnalysis.topDebtors" :key="d.name" style="display: flex; justify-content: space-between; padding: 0.8rem; background: rgba(255,255,255,0.02); margin-bottom: 0.5rem; border-radius: 6px;">
                <span style="color: #cbd5e1;">{{ d.name }}</span>
                <span style="color: #ef4444; font-weight: bold;">{{ formatCurrency(d.debt) }} ج</span>
              </div>
            </div>

            <div class="analytics-card glass-panel" style="padding: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: var(--accent-warning);">📊 مقارنة صافي الأرباح بين الشهور</h3>
              <div id="profitChart"></div>
            </div>
          </div>
        </div>

        <!-- Identity Settings Tab -->
        <div v-if="activeTab === 'identity'" class="identity-management-rebuilt">
          <div class="identity-card-premium glass-panel">
            <div class="id-card-header">
              <div class="title-with-icon">
                <span class="id-header-icon">🏷️</span>
                <h3>هوية النظام</h3>
              </div>
              <p>قم بتخصيص اسم وشعار النشاط التجاري الخاص بك</p>
            </div>
            
            <div class="id-card-body">
              <!-- App Name Section -->
              <div class="identity-field-group">
                <label>اسم البرنامج / النشاط التجاري</label>
                <div class="input-with-glow">
                  <input type="text" v-model="identityForm.appName" placeholder="مثلاً: كلاسيكو بلايستيشن" />
                  <span class="glow-border"></span>
                </div>
              </div>

              <!-- Logo Section -->
              <div class="identity-field-group mt-6">
                <label>شعار النظام (اللوجو)</label>
                <div class="professional-logo-section">
                  <!-- Column 1: Modern Save Action -->
                  <div class="logo-actions-container">
                    <button @click="saveIdentitySettings" class="btn-save-identity-square" title="حفظ التغييرات">
                      <span>💾</span>
                    </button>
                  </div>

                  <!-- Column 2: Center Upload Controls -->
                  <div class="logo-upload-controls">
                    <button class="btn-modern-upload" @click="$refs.logoInput.click()">
                      <span class="icon">📁</span> رفع شعار جديد
                    </button>
                    <input type="file" ref="logoInput" @change="handleLogoUpload" accept="image/png, image/jpeg" style="display: none;" />
                    <ul class="upload-requirements">
                      <li>يفضل استخدام PNG شفاف</li>
                      <li>المقاس: 512x512 بكسل</li>
                    </ul>
                  </div>

                  <!-- Column 3: Right Preview -->
                  <div class="logo-display-frame">
                    <img v-if="identityForm.appLogo" :src="identityForm.appLogo" alt="App Logo" />
                    <div v-else class="no-logo-placeholder">
                      <span class="icon">🖼️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. System Tab -->
        <div v-if="activeTab === 'system'" class="system-management-layout">
           <div v-if="isReadOnlyMode" class="system-card-v3 danger" style="grid-column: 1 / -1; border: 1px dashed rgba(255, 76, 76, 0.3); background: rgba(0, 0, 0, 0.4); text-align: center; padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; min-height: 350px;">
              <div style="font-size: 4rem; animation: pulse 2s infinite;">🔒</div>
              <h3 style="color: var(--accent-red); font-weight: bold; margin: 0;">منطقة إعدادات النظام مقفلة</h3>
              <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin: 0; max-width: 400px;">
                أنت تقوم حالياً باستعراض فرع آخر (اطلاع فقط). إعدادات الهوية، التحكم في ظهور الصفحات، النسخ الاحتياطي، والأرشفة وإعادة الضبط هي عمليات محلية بالكامل وتم تأمينها وقفلها لمنع أي تداخل في البيانات.
              </p>
           </div>
           
           
              <!-- 🌟 Innovative Page Visibility Control (Admin Only) -->
              <div v-if="isAdmin && !isReadOnlyMode" class="system-card-v3 info" style="grid-column: 1 / -1; margin-bottom: 2rem;">
               <h3 class="sys-title-v3"><span>👁️</span> مركز التحكم في ظهور الصفحات</h3>
               <p class="sys-desc-v3">بصفتك مديراً للنظام، يمكنك إخفاء أو إظهار أي قسم من البرنامج بالكامل لجميع المستخدمين بضغطة واحدة.</p>
               
               <div class="visibility-control-grid">
                  <!-- Monitoring -->
                  <div @click="togglePageVisibility('monitoring')" :class="['vis-card', { active: store.appSettings.pageVisibility?.monitoring !== false }]">
                     <div class="vis-icon">🎮</div>
                     <div class="vis-label">شاشة الأجهزة</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.monitoring !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>

                  <!-- Lounge -->
                  <div @click="togglePageVisibility('lounge')" :class="['vis-card', { active: store.appSettings.pageVisibility?.lounge !== false }]">
                     <div class="vis-icon">☕</div>
                     <div class="vis-label">شاشة الصالة</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.lounge !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>

                  <!-- Customers -->
                  <div @click="togglePageVisibility('customers')" :class="['vis-card', { active: store.appSettings.pageVisibility?.customers !== false }]">
                     <div class="vis-icon">📒</div>
                     <div class="vis-label">حسابات العملاء</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.customers !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>

                  <!-- Expenses -->
                  <div @click="togglePageVisibility('expenses')" :class="['vis-card', { active: store.appSettings.pageVisibility?.expenses !== false }]">
                     <div class="vis-icon">💸</div>
                     <div class="vis-label">المصروفات</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.expenses !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>

                  <!-- Archive -->
                  <div @click="togglePageVisibility('archive')" :class="['vis-card', { active: store.appSettings.pageVisibility?.archive !== false }]">
                     <div class="vis-icon">📦</div>
                     <div class="vis-label">الأرشيف</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.archive !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>

                  <!-- Price List -->
                  <div @click="togglePageVisibility('menu')" :class="['vis-card', { active: store.appSettings.pageVisibility?.menu !== false }]">
                     <div class="vis-icon">📜</div>
                     <div class="vis-label">قائمة الأسعار</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.menu !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>

                  <!-- Gamepad Diagnostics -->
                  <div @click="togglePageVisibility('gamepad')" :class="['vis-card', { active: store.appSettings.pageVisibility?.gamepad !== false }]">
                     <div class="vis-icon">🎮</div>
                     <div class="vis-label">فحص الأذرع</div>
                     <div class="vis-status">{{ store.appSettings.pageVisibility?.gamepad !== false ? 'ظاهرة ✅' : 'مخفية 🚫' }}</div>
                  </div>
               </div>
           </div>

           <!-- Maintenance Section -->
           <div v-if="!isReadOnlyMode" class="system-card-v3 success">
               <h3 class="sys-title-v3"><span>🧹</span> صيانة النظام والتنظيف</h3>
               <p class="sys-desc-v3">
                  يقوم النظام بتنظيف تلقائي عند التشغيل. يمكنك الضغط هنا لإجبار النظام على إعادة المزامنة وحذف أي بيانات عالقة في البرنامج لتسريع الأداء.
                  <br>
                  <strong style="color: var(--accent-success);">* هذا الإجراء آمن تماماً ولا يؤدي لحذف أي بيانات حالية أو فواتير.</strong>
               </p>
              <div class="sys-actions-row-v3">
                 <button @click="manualSmartClean" class="btn-sys-v3 success">
                    <span>🧹</span> تنظيف الكاش وإعادة المزامنة الآن
                 </button>
              </div>
           </div>

           <!-- Smart Archiving Section -->
           <div v-if="store.canAccess('settings_system', 'edit') && !isReadOnlyMode" class="system-card-v3 info">
              <h3 class="sys-title-v3"><span>📦</span> أرشفة البيانات الذكية (Auto-Maintenance)</h3>
              <p class="sys-desc-v3">
                 للحفاظ على سرعة البرنامج كالبرق، يمكنك نقل السجلات القديمة جداً إلى ملفات أرشيف منفصلة. هذا الإجراء يحافظ على خفة قاعدة البيانات دون حذف أي معلومة.
              </p>
              <div class="sys-actions-row-v3">
                 <button @click="smartArchive" class="btn-sys-v3 info">
                    <span>🚀</span> تشغيل الأرشفة الذكية الآن
                 </button>
                 <select v-model="cleanupMonths" class="purge-select-v3">
                    <option value="3">أرشفة ما هو أقدم من 3 شهور</option>
                    <option value="6">أرشفة ما هو أقدم من 6 شهور</option>
                    <option value="12">أرشفة ما هو أقدم من سنة</option>
                 </select>
              </div>
           </div>

           <!-- Data Backup Section -->
           <div v-if="store.canAccess('settings_system', 'edit') && !isReadOnlyMode" class="system-card-v3 info">
              <h3 class="sys-title-v3"><span>💾</span> إدارة النسخ الاحتياطي</h3>
              <p class="sys-desc-v3">
                 يُنصح دائماً بتحميل نسخة احتياطية من بياناتك بانتظام للحفاظ عليها من الفقدان. يمكنك استعادة بياناتك في أي وقت من ملف خارجي.
              </p>
              <div class="sys-actions-row-v3">
                 <button @click="backupData" class="btn-sys-v3 info">
                    <span>💾</span> تحميل نسخة احتياطية (Backup)
                 </button>
                 <button @click="restoreData" class="btn-sys-v3 success">
                    <span>📂</span> استعادة نسخة احتياطية (Restore)
                 </button>
              </div>
           </div>

           <!-- Factory Reset Section -->
           <div v-if="store.canAccess('settings_system', 'edit') && !isReadOnlyMode" class="system-card-v3 danger">
              <h3 class="sys-title-v3"><span>⚠️</span> منطقة الخطر: إعادة ضبط المصنع</h3>
              <p class="sys-desc-v3">
                 إعادة النظام للحالة الأولى ومسح كافة البيانات بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه ويؤدي لحذف الموظفين، التقارير، والمنيو.
              </p>
              <div class="sys-actions-row-v3">
                 <button @click="handleFactoryReset" class="btn-sys-v3 danger">
                    <span>⚠️</span> استعادة ضبط المصنع بالكامل
                 </button>
              </div>
           </div>
        </div>

      </div>
    </main>
    <!-- 🛡️ Permissions Management Modal -->
    <div v-if="showPermissionsModal" class="perms-modal-overlay">
      <div class="perms-modal-content">
        <div class="perms-modal-header">
          <h3>🛡️ تخصيص صلاحيات الموظف: <span style="color: white;">{{ selectedUserForPerms }}</span></h3>
          <button @click="showPermissionsModal = false" class="btn-x-v3">✕</button>
        </div>

        <div class="perms-tree-area">
          <template v-for="page in APP_PAGES" :key="page.id">
            <!-- Parent Page -->
            <div class="perms-row-v3 is-parent">
              <div class="page-label-box">
                <span class="icon">{{ page.icon }}</span>
                <span class="label">{{ page.label }}</span>
              </div>
              <div class="perms-options-box">
                <label :class="['perm-option', { active: userPermsDraft[page.id] === 'none' }]">
                  <input type="radio" :name="page.id" value="none" :checked="userPermsDraft[page.id] === 'none'" @change="handlePermissionChange(page.id, 'none', true)">
                  <span class="perm-indicator"></span>
                  <span class="perm-label-text red">🚫 مخفي</span>
                </label>
                <label :class="['perm-option', { active: userPermsDraft[page.id] === 'view' }]">
                  <input type="radio" :name="page.id" value="view" :checked="userPermsDraft[page.id] === 'view'" @change="handlePermissionChange(page.id, 'view', true)">
                  <span class="perm-indicator"></span>
                  <span class="perm-label-text blue">👁️ رؤية فقط</span>
                </label>
                <label :class="['perm-option', { active: userPermsDraft[page.id] === 'edit' }]">
                  <input type="radio" :name="page.id" value="edit" :checked="userPermsDraft[page.id] === 'edit'" @change="handlePermissionChange(page.id, 'edit', true)">
                  <span class="perm-indicator"></span>
                  <span class="perm-label-text green">⚡ تحكم كامل</span>
                </label>
              </div>
            </div>

            <!-- Children Pages -->
            <div v-for="child in page.children" :key="child.id" class="perms-row-v3 is-child">
              <div class="page-label-box" style="font-weight: 500; font-size: 0.9rem; padding-right: 15px;">
                <span class="bullet">↳</span>
                <span class="label">{{ child.label }}</span>
              </div>
              <div class="perms-options-box">
                <label :class="['perm-option', { active: userPermsDraft[child.id] === 'none' }]">
                  <input type="radio" :name="child.id" value="none" :checked="userPermsDraft[child.id] === 'none'" @change="handlePermissionChange(child.id, 'none', false)">
                  <span class="perm-indicator"></span>
                  <span class="perm-label-text red">🚫 مخفي</span>
                </label>
                <label :class="['perm-option', { active: userPermsDraft[child.id] === 'view' }]">
                  <input type="radio" :name="child.id" value="view" :checked="userPermsDraft[child.id] === 'view'" @change="handlePermissionChange(child.id, 'view', false)">
                  <span class="perm-indicator"></span>
                  <span class="perm-label-text blue">👁️ رؤية فقط</span>
                </label>
                <label :class="['perm-option', { active: userPermsDraft[child.id] === 'edit' }]">
                  <input type="radio" :name="child.id" value="edit" :checked="userPermsDraft[child.id] === 'edit'" @change="handlePermissionChange(child.id, 'edit', false)">
                  <span class="perm-indicator"></span>
                  <span class="perm-label-text green">⚡ تحكم كامل</span>
                </label>
              </div>
            </div>
          </template>
        </div>

        <div class="perms-modal-footer">
          <button @click="showPermissionsModal = false" class="btn-close-perms">إلغاء ✖</button>
          <button @click="savePermissions" class="btn-save-perms">حفظ الصلاحيات 💾</button>
        </div>
      </div>
    </div>

    <!-- 🔒 Close Shift Elegant Modal -->
    <div v-if="showCloseShiftModal" class="perms-modal-overlay" style="z-index: 9999;">
      <div class="glass-panel" style="width: 500px; max-width: 95%; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); animation: fadeScale 0.3s ease-out;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 1.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative;">
          <button @click="showCloseShiftModal = false" style="position: absolute; left: 1rem; top: 1rem; background: transparent; border: none; color: #ef4444; font-size: 1.2rem; cursor: pointer;">✖</button>
          <div style="font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);">⚙️</div>
          <h2 style="margin: 0; color: #fff; font-weight: 800; font-family: 'Cairo', sans-serif;">تقفيل الوردية الحالية</h2>
          <p style="margin: 0.5rem 0 0 0; color: #94a3b8; font-size: 0.9rem;">ملخص الحركة المالية للوردية</p>
        </div>

        <!-- Body -->
        <div style="padding: 2rem;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 0.8rem;">
            <tbody>
              <!-- Income Row -->
              <tr style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.2);">
                <td style="padding: 1rem; border-radius: 0 8px 8px 0; font-weight: bold; color: #10b981; font-size: 1.1rem; width: 60%;">
                  <span style="margin-left: 0.5rem;">📥</span> إجمالي الداخل
                </td>
                <td style="padding: 1rem; border-radius: 8px 0 0 8px; text-align: left; font-weight: 900; color: #fff; font-size: 1.2rem;">
                  {{ formatCurrency((shiftStats.psRevenue || 0) + (shiftStats.loungeRevenue || 0) + (shiftStats.customerCollections || 0)) }} ج
                </td>
              </tr>

              <!-- Expenses Row -->
              <tr style="background: rgba(239, 68, 68, 0.1); border-radius: 8px; box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.2);">
                <td style="padding: 1rem; border-radius: 0 8px 8px 0; font-weight: bold; color: #ef4444; font-size: 1.1rem;">
                  <span style="margin-left: 0.5rem;">📤</span> إجمالي الخارج
                </td>
                <td style="padding: 1rem; border-radius: 8px 0 0 8px; text-align: left; font-weight: 900; color: #fff; font-size: 1.2rem;">
                  {{ formatCurrency((shiftStats.expenseSum || 0) + (totalShiftSalaries || 0)) }} ج
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td colspan="2" style="padding: 0.5rem 0;">
                  <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);"></div>
                </td>
              </tr>

              <!-- Net Profit Row -->
              <tr style="background: rgba(0, 229, 255, 0.15); border-radius: 12px; box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 0 0 1px rgba(0, 229, 255, 0.3);">
                <td style="padding: 1.2rem 1rem; border-radius: 0 12px 12px 0; font-weight: 900; color: #00e5ff; font-size: 1.3rem;">
                  <span style="margin-left: 0.5rem;">⭐</span> الصافي (المتبقي)
                </td>
                <td style="padding: 1.2rem 1rem; border-radius: 12px 0 12px 12px; text-align: left; font-weight: 900; color: #fff; font-size: 1.5rem; text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);">
                  {{ formatCurrency((shiftStats.netProfit || 0) - (totalShiftSalaries || 0)) }} ج
                </td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 2rem; text-align: center; color: #94a3b8; font-size: 0.85rem; background: rgba(255,255,255,0.02); padding: 0.8rem; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.1);">
            ⚠️ سيتم تصفير الورديه بعد التاكيد , يمكنك التوجه الى الارشيف لمراجعه اى بيانات سابقه
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 1.5rem; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 1rem;">
          <button @click="showCloseShiftModal = false" style="flex: 1; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-weight: bold; cursor: pointer; transition: 0.2s;">
            تراجع ✖
          </button>
          <button @click="confirmCloseShift" style="flex: 2; padding: 0.8rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: 0.2s;">
            تأكيد إغلاق اليومية ✔
          </button>
        </div>
      </div>
    </div>

    <!-- 🔄 Restore Options Modal -->
    <div v-if="showRestoreOptionsModal" class="perms-modal-overlay" style="z-index: 10000;">
      <div class="glass-panel" style="width: 450px; border-radius: 20px; overflow: hidden; animation: fadeScale 0.3s ease-out;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 2rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📂</div>
          <h2 style="margin: 0; color: #fff; font-weight: 800;">استعادة البيانات</h2>
          <p style="color: #94a3b8; margin-top: 0.5rem;">اختر مصدر النسخة الاحتياطية</p>
        </div>
        <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
          <button @click="restoreFromLocal" class="btn-sys-v3 info" style="width: 100%; justify-content: center; padding: 1.2rem; font-size: 1.1rem;">
            <span>💻</span> استعادة من ملف على الجهاز
          </button>
          <button @click="fetchCloudBackupInfo" class="btn-sys-v3 success" style="width: 100%; justify-content: center; padding: 1.2rem; font-size: 1.1rem; background: linear-gradient(135deg, #0ea5e9, #00e5ff); border: none;">
            <span>☁️</span> استعادة من السحابة (Cloud)
          </button>
          <button @click="showRestoreOptionsModal = false" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.8rem; border-radius: 12px; cursor: pointer; margin-top: 1rem;">
            إلغاء
          </button>
        </div>
      </div>
    </div>

    <!-- ☁️ Cloud Restore Confirmation Modal -->
    <div v-if="showCloudRestoreConfirm" class="perms-modal-overlay" style="z-index: 10001;">
      <div class="glass-panel" style="width: 450px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(0, 229, 255, 0.3); animation: fadeScale 0.3s ease-out;">
        <div style="background: rgba(0, 229, 255, 0.1); padding: 2rem; text-align: center; border-bottom: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="font-size: 3.5rem; margin-bottom: 1rem; filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.5));">☁️</div>
          <h2 style="margin: 0; color: #00e5ff; font-weight: 800;">النسخة السحابية المتاحة</h2>
        </div>
        <div style="padding: 2.5rem; text-align: center;">
          <div style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 2rem;">
            <p style="color: #94a3b8; margin: 0 0 0.5rem 0; font-size: 0.9rem;">تاريخ آخر نسخة مسجلة:</p>
            <h3 style="color: #fff; margin: 0; font-size: 1.4rem;">{{ formatDate(cloudBackupInfo?.updated_at) }}</h3>
            <p style="color: #00e5ff; margin: 0.3rem 0 0 0; font-weight: 700;">{{ formatTime(cloudBackupInfo?.updated_at) }}</p>
          </div>
          <div style="display: flex; gap: 1rem;">
            <button @click="showCloudRestoreConfirm = false" style="flex: 1; padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;">
              إلغاء
            </button>
            <button @click="restoreFromCloud" style="flex: 2; padding: 1rem; border-radius: 12px; border: none; background: linear-gradient(135deg, #00e5ff, #0ea5e9); color: #000; font-weight: 800; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 229, 255, 0.3);">
              استعادة الآن ✔
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 📓 Detailed Journal Popup Modal -->
    <div v-if="showJournalPopup" class="perms-modal-overlay" style="z-index: 9998;">
      <div class="glass-panel" style="width: 1100px; max-width: 95%; height: 90vh; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; animation: fadeScale 0.3s ease-out; border: 1px solid rgba(255,255,255,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div>
            <h2 style="margin: 0; color: #fff; font-size: 1.5rem; font-weight: 800;">📓 عرض تفاصيل اليومية الحالية</h2>
            <p style="margin: 0.2rem 0 0 0; color: #94a3b8; font-size: 0.9rem;">بداية الوردية: {{ formatDate(store.lastJournalClosure) }} , {{ formatTime(store.lastJournalClosure) }}</p>
          </div>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button @click="closeShift" class="btn-close-shift-neon" style="margin: 0; padding: 0.6rem 1.5rem;">⚙️ تقفيل اليومية</button>
            <button @click="showJournalPopup = false" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s;">✖</button>
          </div>
        </div>

        <!-- Body -->
        <div style="flex: 1; overflow-y: auto; padding: 2rem; background: rgba(15, 23, 42, 0.3);">
          <!-- Summary Cards in Modal -->
          <div class="journal-cards-grid" style="margin-bottom: 2rem;">
             <div class="j-card cyan">
                <div class="j-label">🎮 أجهزة</div>
                <div class="j-val">{{ formatCurrency(shiftStats.psRevenue) }} ج</div>
             </div>
             <div class="j-card green">
                <div class="j-label">☕ صالة</div>
                <div class="j-val">{{ formatCurrency(shiftStats.loungeRevenue) }} ج</div>
             </div>
             <div class="j-card white">
                <div class="j-label">🤝 مديونية محصلة</div>
                <div class="j-val">{{ formatCurrency(shiftStats.customerCollections) }} ج</div>
             </div>
             <div class="j-card red">
                <div class="j-label">📉 مصروفات</div>
                <div class="j-val">{{ formatCurrency(shiftStats.expenseSum) }} ج</div>
             </div>
             <div class="j-card purple">
                <div class="j-label">👤 رواتب</div>
                <div class="j-val">{{ formatCurrency(totalShiftSalaries) }} ج</div>
             </div>
             <div class="j-card gold">
                <div class="j-label">⭐ الصافي</div>
                <div class="j-val">{{ formatCurrency(shiftStats.netProfit - totalShiftSalaries) }} ج</div>
             </div>
          </div>

          <!-- Table -->
          <div class="glass-panel" style="background: rgba(30, 41, 59, 0.4); border-radius: 16px; padding: 1px; overflow: hidden;">
            <table class="premium-table-journal">
               <thead>
                  <tr>
                     <th>الوقت</th>
                     <th>البيان</th>
                     <th style="text-align: center;">القسم</th>
                     <th style="text-align: center;">داخل (+)</th>
                     <th style="text-align: center;">خارج (-)</th>
                     <th style="text-align: center;">المسؤول</th>
                              <th v-if="store.multiBranchActive" style="text-align: center;">الفرع</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="(entry, index) in getShiftDetailedData()" :key="index" class="journal-row">
                     <td class="time-cell">
                        <div class="time-wrap">
                           <span>{{ formatTime(entry.ts) }}</span>
                           <span class="date-sub">{{ formatDate(entry.ts) }}</span>
                        </div>
                     </td>
                     <td class="desc-cell">{{ entry.name }}</td>
                     <td style="text-align: center;">
                        <div class="dept-badge-container">
                           <span v-if="entry.dept === 'أجهزة'" class="dept-badge-v3 devices">🎮 أجهزة</span>
                           <span v-else-if="entry.dept === 'صالة'" class="dept-badge-v3 lounge">☕ صالة</span>
                           <span v-else-if="entry.dept === 'مديونية'" class="dept-badge-v3 debt">🤝 مديونية</span>
                           <span v-else-if="entry.dept === 'مصروفات'" class="dept-badge-v3 expenses">📉 مصروفات</span>
                           <span v-else-if="entry.dept === 'موظف' || entry.dept === 'راتب' || entry.dept === 'مرتبات'" class="dept-badge-v3 staff">👤 موظف</span>
                           <span v-else class="dept-badge-v3 generic">{{ entry.dept }}</span>
                        </div>
                     </td>
                     <td style="text-align: center;" class="in-cell">
                        {{ entry.in > 0 ? '+' + formatCurrency(entry.in) + ' ج' : '---' }}
                     </td>
                     <td style="text-align: center;" class="out-cell">
                        {{ entry.out > 0 ? '-' + formatCurrency(entry.out) + ' ج' : '---' }}
                     </td>
                     <td style="text-align: center;" class="user-cell">{{ entry.processedBy || '---' }}</td>
                              <td v-if="store.multiBranchActive" style="text-align: center;">
                                 <div class="branch-badge" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); border: 1px solid rgba(0, 229, 255, 0.25); padding: 4px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);">
                                    📍 {{ entry.branchName || 'محلي' }}
                                 </div>
                              </td>
                  </tr>
               </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 1.2rem 2rem; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(255,255,255,0.05); text-align: left;">
          <button @click="showJournalPopup = false" class="btn-sys-v3 info" style="margin: 0; min-width: 120px;">إغلاق النافذة</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useSettingsLogic } from './SettingsLogic';
import SubscriptionTab from './SubscriptionTab.vue';
import ApexCharts from 'apexcharts';
import pkg from '../../../package.json';

const appVersion = `v${pkg.version}-Pro`;

const {
  store, isAdmin, activeTab, staffSearch, editingStaffMode, shiftStats,
  isReadOnlyMode, getShiftDetailedData,
  totalShiftSalaries, reportFilter, getReportStats,
  showDetailedReportTable, detailedReportRows, applyReportFilter, showAllReports, viewDetailedReport,
  showExportModal, exportToExcel, exportToPDF, selectedStaffUsername, salaryOp, selectedStaffTransactions,
  selectedStaffTotalWithdrawals, selectedStaffNetRemaining, staffForm, filteredStaff,
  formatCurrency, formatDate, formatTime, editStaff, cancelStaffEdit, saveStaff, handleSalaryOp,
  deleteStaff, deleteTransaction, closeShift, backupData, restoreData, handleFactoryReset,
  manualSmartClean, smartArchive, cleanupMonths, monitoringGroups,
  showPermissionsModal, selectedUserForPerms, userPermsDraft, APP_PAGES, openPermissionsModal, savePermissions,
  handlePermissionChange, showCloseShiftModal, confirmCloseShift, showJournalPopup,
  identityForm, handleLogoUpload, saveIdentitySettings,
  showRestoreOptionsModal, showCloudRestoreConfirm, cloudBackupInfo,
  restoreFromLocal, fetchCloudBackupInfo, restoreFromCloud, togglePageVisibility,
  activitySearchQuery, filteredActivityLog, clearActivityLog,
  analyticsData, updateAnalytics, analyticsFilter
} = useSettingsLogic();

const charts = { hours: null, items: null, profit: null, income: null, ratio: null, staff: null, branchComparison: null };
const itemsChartType = ref('donut');

const renderItemsChart = () => {
  try {
    const iChart = document.querySelector("#itemsChart");
    if (!iChart) return;
    if (charts.items) charts.items.destroy();

    const itemNames = (analyticsData.topItems || []).map(i => i.name);
    const itemQtys = (analyticsData.topItems || []).map(i => i.qty);
    const isBar = itemsChartType.value === 'bar';
    
    const safeNames = itemNames.length ? itemNames : ['لا توجد بيانات'];
    const safeQtys = itemQtys.length ? itemQtys.map(n => isNaN(Number(n)) ? 0 : Number(n)) : [0];

    let options = {};
    if (isBar) {
      options = {
        series: [{ name: 'الكمية المباعة', data: safeQtys }],
        chart: { type: 'bar', height: 350, foreColor: '#cbd5e1', toolbar: { show: false }, background: 'transparent' },
        xaxis: { categories: safeNames },
        colors: ['#00e5ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6'],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true } },
        dataLabels: { enabled: true, style: { colors: ['#fff'] } },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        tooltip: { theme: 'dark' },
        legend: { show: false }
      };
    } else {
      options = {
        series: safeQtys.reduce((a,b)=>a+b, 0) === 0 ? [1] : safeQtys, // Prevent blank if all 0s
        chart: { type: 'donut', height: 350, foreColor: '#cbd5e1', background: 'transparent' },
        labels: safeNames,
        colors: ['#00e5ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6'],
        stroke: { show: false },
        plotOptions: { pie: { donut: { size: '70%' } } },
        dataLabels: { enabled: true },
        tooltip: { theme: 'dark' },
        legend: { position: 'bottom' }
      };
    }

    charts.items = new ApexCharts(iChart, options);
    charts.items.render();
  } catch (err) {
    console.error('Error rendering itemsChart:', err);
  }
};

const toggleItemsChartType = () => {
  itemsChartType.value = itemsChartType.value === 'donut' ? 'bar' : 'donut';
  renderItemsChart();
};

const initCharts = () => {
  const hChart = document.querySelector("#hoursChart");
  const iChart = document.querySelector("#itemsChart");
  const pChart = document.querySelector("#profitChart");
  const incChart = document.querySelector("#incomeChart");
  const rChart = document.querySelector("#ratioChart");
  const sChart = document.querySelector("#staffChart");

  // Destroy existing
  try {
    if (charts.hours) charts.hours.destroy();
    if (charts.items) charts.items.destroy();
    if (charts.profit) charts.profit.destroy();
    if (charts.income) charts.income.destroy();
    if (charts.ratio) charts.ratio.destroy();
    if (charts.staff) charts.staff.destroy();
    if (charts.branchComparison) charts.branchComparison.destroy();
  } catch (e) {}

  // 1. Busy Hours
  if (hChart) {
    try {
      const safeHours = analyticsData.busyHours && analyticsData.busyHours.length ? analyticsData.busyHours.map(n => Number(n) || 0) : Array(24).fill(0);
      charts.hours = new ApexCharts(hChart, {
        series: [{ name: 'عدد الزيارات', data: safeHours }],
        chart: { type: 'area', height: 300, foreColor: '#cbd5e1', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#00e5ff'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
        dataLabels: { enabled: false },
        xaxis: { categories: Array.from({length: 24}, (_, i) => i + ':00') },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        tooltip: { theme: 'dark' }
      });
      charts.hours.render();
    } catch(e) { console.error('hoursChart error', e); }
  }

  // 2. Top Items
  renderItemsChart();

  // 3. Monthly Profit
  if (pChart) {
    try {
      const pLabels = (analyticsData.monthlyProfits || []).map(m => m.month);
      const pData = (analyticsData.monthlyProfits || []).map(m => Number(m.profit) || 0);

      charts.profit = new ApexCharts(pChart, {
        series: [{ name: 'صافي الربح', data: pData.length ? pData : [0] }],
        chart: { type: 'bar', height: 300, foreColor: '#cbd5e1', toolbar: { show: false }, background: 'transparent' },
        plotOptions: { bar: { borderRadius: 8, columnWidth: '50%', distributed: true } },
        colors: ['#f59e0b', '#10b981', '#00e5ff', '#8b5cf6', '#ec4899'],
        dataLabels: { enabled: false },
        xaxis: { categories: pLabels.length ? pLabels : ['---'] },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        tooltip: { theme: 'dark' }
      });
      charts.profit.render();
    } catch(e) { console.error('profitChart error', e); }
  }

  // 4. Income vs Expenses
  if (incChart) {
    try {
      const iLabels = (analyticsData.incomeVsExpenses || []).map(d => d.date);
      const revData = (analyticsData.incomeVsExpenses || []).map(d => Number(d.rev) || 0);
      const expData = (analyticsData.incomeVsExpenses || []).map(d => Number(d.exp) || 0);
      
      charts.income = new ApexCharts(incChart, {
        series: [
          { name: 'الإيرادات', data: revData.length ? revData : [0] },
          { name: 'المصروفات', data: expData.length ? expData : [0] }
        ],
        chart: { type: 'area', height: 300, foreColor: '#cbd5e1', toolbar: { show: false }, background: 'transparent' },
        colors: ['#10b981', '#ef4444'],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
        dataLabels: { enabled: false },
        xaxis: { categories: iLabels.length ? iLabels : ['---'] },
        yaxis: {
          labels: {
            formatter: (value) => { return Math.round(Number(value) || 0).toLocaleString(); }
          }
        },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        tooltip: { theme: 'dark' }
      });
      charts.income.render();
    } catch(e) { console.error('incomeChart error', e); }
  }

  // 5. Ratio Chart
  if (rChart) {
    try {
      const psVal = Number(analyticsData.ratioData?.ps) || 0;
      const loungeVal = Number(analyticsData.ratioData?.lounge) || 0;
      const isRatioZero = (psVal + loungeVal) === 0;

      charts.ratio = new ApexCharts(rChart, {
        series: isRatioZero ? [1, 1] : [psVal, loungeVal],
        labels: ['الأجهزة 🎮', 'الصالة ☕'],
        chart: { type: 'donut', height: 300, foreColor: '#cbd5e1', background: 'transparent' },
        colors: ['#00e5ff', '#10b981'],
        stroke: { show: false },
        legend: { position: 'bottom' },
        plotOptions: { pie: { donut: { size: '70%' } } },
        dataLabels: { enabled: !isRatioZero, style: { colors: ['#fff'] } },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: (val) => isRatioZero ? '0 ج' : `${Math.round(val).toLocaleString()} ج`
          }
        }
      });
      charts.ratio.render();
    } catch(e) { console.error('ratioChart error', e); }
  }

  // 6. Staff Performance
  if (sChart) {
    try {
      const sLabels = (analyticsData.staffPerformance || []).map(s => s.name || 'غير محدد');
      const sData = (analyticsData.staffPerformance || []).map(s => Number(s.rev) || 0);
      
      charts.staff = new ApexCharts(sChart, {
        series: [{ name: 'إجمالي المبيعات', data: sData.length ? sData : [0] }],
        chart: { type: 'bar', height: 300, foreColor: '#cbd5e1', toolbar: { show: false }, background: 'transparent' },
        plotOptions: { bar: { horizontal: false, borderRadius: 6, distributed: true } },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        dataLabels: { enabled: false },
        xaxis: { categories: sLabels.length ? sLabels : ['لا يوجد بيانات'] },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        legend: { show: false },
        tooltip: { theme: 'dark' }
      });
      charts.staff.render();
    } catch(e) { console.error('staffChart error', e); }
  }

  // 7. Branch Comparison Chart (Sales & Profits)
  const bcChart = document.querySelector("#branchComparisonChart");
  if (bcChart) {
    try {
      const bLabels = (analyticsData.branchComparison || []).map(b => b.name);
      const bSales = (analyticsData.branchComparison || []).map(b => Number(b.revenue) || 0);
      const bProfits = (analyticsData.branchComparison || []).map(b => Number(b.profit) || 0);

      charts.branchComparison = new ApexCharts(bcChart, {
        series: [
          { name: 'إجمالي المبيعات 💸', data: bSales.length ? bSales : [0] },
          { name: 'صافي الأرباح 📈', data: bProfits.length ? bProfits : [0] }
        ],
        chart: { type: 'bar', height: 350, foreColor: '#cbd5e1', toolbar: { show: false }, background: 'transparent' },
        colors: ['#00e5ff', '#10b981'],
        stroke: { show: true, width: 2, colors: ['transparent'] },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 8 } },
        dataLabels: { enabled: false },
        xaxis: { categories: bLabels.length ? bLabels : ['---'] },
        yaxis: {
          labels: {
            formatter: (value) => { return Math.round(Number(value) || 0).toLocaleString() + ' ج'; }
          }
        },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        tooltip: { theme: 'dark' },
        legend: { position: 'top' }
      });
      charts.branchComparison.render();
    } catch(e) { console.error('branchComparisonChart error', e); }
  }
};

onMounted(() => {
  if (activeTab.value === 'analytics') {
    updateAnalytics();
    nextTick(() => {
      setTimeout(initCharts, 300);
    });
  }
});

watch(activeTab, (val) => {
  if (val === 'analytics') {
    updateAnalytics();
    nextTick(() => {
      setTimeout(initCharts, 300);
    });
  }
});

watch([() => store.multiBranchActive, () => store.activeBranchFilter], () => {
  if (activeTab.value === 'analytics') {
    updateAnalytics();
    nextTick(() => {
      setTimeout(initCharts, 300);
    });
  }
});
</script>

<style scoped src="./SettingsStyle.css"></style>
