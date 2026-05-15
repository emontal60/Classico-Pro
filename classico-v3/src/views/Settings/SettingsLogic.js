import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';
import * as XLSX from 'xlsx';

export function useSettingsLogic() {
  const store = useAppStore();
  const ui = useUIStore();
  const isAdmin = computed(() => store.session?.role === 'manager' || store.session?.role === 'admin');

  // Persist Active Tab
  const savedTab = localStorage.getItem('classico_settings_tab');
  const activeTab = ref(savedTab || 'journal');

  watch(activeTab, (newTab) => {
    localStorage.setItem('classico_settings_tab', newTab);
  });

  const staffSearch = ref('');
  const editingStaffMode = ref(false);
  const showDetailedJournal = ref(false);
  const showPermissionsModal = ref(false);
  const showJournalPopup = ref(false);
  const selectedUserForPerms = ref(null);
  const userPermsDraft = ref({});
  const activitySearchQuery = ref('');

  // Analytics State
  const analyticsFilter = reactive({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    to: new Date().toISOString().split('T')[0]
  });

  const analyticsData = reactive({
    busyHours: Array(24).fill(0),
    topItems: [],
    monthlyProfits: []
  });

  const updateAnalytics = () => {
    const from = new Date(analyticsFilter.from);
    const to = new Date(analyticsFilter.to);
    to.setHours(23, 59, 59);

    const isMatch = (dateStr) => {
      const d = new Date(dateStr);
      return d >= from && d <= to;
    };

    // 1. Busy Hours
    const hours = Array(24).fill(0);
    (store.history || []).filter(h => isMatch(h.timestamp)).forEach(h => {
      const date = new Date(h.timestamp);
      if (!isNaN(date)) hours[date.getHours()]++;
    });
    analyticsData.busyHours = hours;

    // 2. Top Selling Items
    const itemsMap = {};
    const allOrders = [
      ...(store.history || []).filter(h => isMatch(h.timestamp)).flatMap(h => h.orders || []),
      ...(store.loungeHistory || []).filter(l => isMatch(l.timestamp)).flatMap(l => l.orders || [])
    ];
    
    allOrders.forEach(o => {
      itemsMap[o.name] = (itemsMap[o.name] || 0) + (o.qty || 1);
    });
    
    analyticsData.topItems = Object.entries(itemsMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7);

    // 3. Monthly Profits (Keep Monthly Trends separate or filter too?)
    // User asked for "mizet al BI" filter. Monthly profit usually is for all, 
    // but I'll filter it to show only months within the range.
    const monthlyMap = {};
    const process = (dateStr, amount, type) => {
      if (!isMatch(dateStr)) return;
      const d = new Date(dateStr);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, expenses: 0 };
      if (type === 'rev') monthlyMap[key].revenue += amount;
      else monthlyMap[key].expenses += amount;
    };

    (store.history || []).forEach(h => process(h.timestamp, h.totalCost, 'rev'));
    (store.loungeHistory || []).forEach(l => process(l.timestamp, l.total, 'rev'));
    (store.archivedCustomers || []).forEach(c => process(c.archivedAt, c.settledAmount || 0, 'rev'));
    (store.archivedExpenses || []).forEach(e => process(e.timestamp || e.archivedAt, e.amount, 'exp'));
    (store.archivedSalaries || []).forEach(s => process(s.timestamp, s.amount, 'exp'));

    analyticsData.monthlyProfits = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, profit: data.revenue - data.expenses }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Cloud Backup & Restore State
  const showRestoreOptionsModal = ref(false);
  const showCloudRestoreConfirm = ref(false);
  const cloudBackupInfo = ref(null);

  const APP_PAGES = [
    { id: 'monitoring', label: '🎮 شاشة الأجهزة', icon: '🎮' },
    { id: 'lounge', label: '☕ شاشة الصالة', icon: '☕' },
    { id: 'customers', label: '👥 حسابات العملاء', icon: '👥' },
    { id: 'expenses', label: '💸 المصروفات', icon: '💸' },
    { id: 'menu', label: '📋 قائمة الأسعار', icon: '📋' },
    {
      id: 'archive', label: '🗄️ الأرشيف', icon: '🗄️',
      children: [
        { id: 'archive_devices', label: '🎮 أرشيف الأجهزة' },
        { id: 'archive_lounge', label: '☕ أرشيف الصالة' },
        { id: 'archive_customers', label: '👥 أرشيف العملاء' },
        { id: 'archive_expenses', label: '💸 أرشيف المصروفات' },
        { id: 'archive_salaries', label: '💰 أرشيف المرتبات' },
        { id: 'archive_global', label: '📋 الأرشيف الشامل' },
      ]
    },
    {
      id: 'settings', label: '⚙️ لوحة الإدارة', icon: '⚙️',
      children: [
        { id: 'settings_staff', label: '👤 إدارة الموظفين' },
        { id: 'settings_salaries', label: '💰 المرتبات والمسحوبات' },
        { id: 'settings_journal', label: '📓 اليومية ووردية العمل' },
        { id: 'settings_reports', label: '📊 التقارير والأرباح' },
        { id: 'settings_activity', label: '📜 سجل النشاط' },
        { id: 'settings_analytics', label: '📈 ذكاء الأعمال' },
        { id: 'settings_identity', label: '🏷️ إعدادات الهوية' },
        { id: 'settings_system', label: '🛠️ إعدادات النظام' },
        { id: 'settings_subscription', label: '🛡️ إدارة اشتراكي' },
      ]
    }
  ];

  const shiftStats = computed(() => store.getShiftTotals());

  const totalShiftSalaries = computed(() => {
    const lastClosure = new Date(store.lastJournalClosure);
    return store.archivedSalaries
      .filter(s => new Date(s.timestamp) > lastClosure && !s.isAdjustment)
      .reduce((sum, s) => sum + s.amount, 0);
  });

  const totalHistoricalIncome = computed(() => {
    const ps = store.history.reduce((sum, h) => sum + h.totalCost, 0);
    const lounge = store.loungeHistory.reduce((sum, l) => sum + l.total, 0);
    return ps + lounge;
  });

  const totalHistoricalExpenses = computed(() => {
    return store.archivedExpenses.reduce((sum, e) => sum + e.amount, 0);
  });

  // --- Reports Logic ---
  const reportFilter = reactive({
    start: '',
    end: '',
    dept: '',
    subDept: '', // New smart sub-filter
    user: ''
  });

  const monitoringGroups = computed(() => {
    const groups = new Set();
    (store.history || []).forEach(h => {
      if (h.dept) groups.add(h.dept);
    });
    return Array.from(groups);
  });

  const getReportStats = computed(() => {
    const start = reportFilter.start ? new Date(reportFilter.start) : null;
    const end = reportFilter.end ? new Date(reportFilter.end) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const isWithin = (ts) => {
      if (!ts) return false;
      const d = new Date(ts);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };

    const psRevenue = (store.history || [])
      .filter(h => {
        const matchesMain = isWithin(h.timestamp) && (!reportFilter.dept || reportFilter.dept === 'أجهزة');
        const matchesSub = !reportFilter.subDept || h.dept === reportFilter.subDept;
        const matchesUser = !reportFilter.user || h.processedBy === reportFilter.user;
        return matchesMain && matchesSub && matchesUser;
      })
      .reduce((sum, h) => sum + (h.totalCost || 0), 0);

    const loungeRevenue = (store.loungeHistory || [])
      .filter(l => isWithin(l.timestamp) && (!reportFilter.dept || reportFilter.dept === 'صالة') && (!reportFilter.user || l.createdBy === reportFilter.user))
      .reduce((sum, l) => sum + (l.total || 0), 0);

    const collectedDebt = (store.archivedCustomers || []).reduce((sum, c) => {
      return sum + (c.ledger || [])
        .filter(l => l.type === 'payment' && isWithin(l.timestamp) && (!reportFilter.dept || reportFilter.dept === 'مديونية') && (!reportFilter.user || l.user === reportFilter.user))
        .reduce((acc, l) => acc + (l.amount || 0), 0);
    }, 0);

    const expenses = (store.archivedExpenses || [])
      .filter(e => isWithin(e.timestamp) && (!reportFilter.dept || reportFilter.dept === 'مصروفات') && (!reportFilter.user || e.user === reportFilter.user))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const salaries = (store.archivedSalaries || [])
      .filter(s => isWithin(s.timestamp) && (!reportFilter.dept || reportFilter.dept === 'موظف') && (!reportFilter.user || s.username === reportFilter.user))
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    const net = (psRevenue + loungeRevenue + collectedDebt) - (expenses + salaries);

    return { psRevenue, loungeRevenue, collectedDebt, expenses, salaries, net };
  });

  const showDetailedReportTable = ref(false);

  const detailedReportRows = computed(() => {
    const start = reportFilter.start ? new Date(reportFilter.start) : null;
    const end = reportFilter.end ? new Date(reportFilter.end) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const isWithin = (ts) => {
      if (!ts) return false;
      const d = new Date(ts);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };

    let rows = [];
    (store.history || []).forEach(h => {
      const matchesMain = isWithin(h.timestamp) && (!reportFilter.dept || reportFilter.dept === 'أجهزة');
      const matchesSub = !reportFilter.subDept || h.dept === reportFilter.subDept;
      const matchesUser = !reportFilter.user || h.processedBy === reportFilter.user;

      if (matchesMain && matchesSub && matchesUser) {
        rows.push({ 
          ts: h.timestamp, 
          name: `جهاز: ${h.name || h.deviceName}`, 
          dept: h.dept || 'أجهزة 🎮', 
          type: 'ps', 
          in: h.totalCost || 0, 
          out: 0, 
          user: h.processedBy 
        });
      }
    });
    (store.loungeHistory || []).forEach(l => {
      if (isWithin(l.timestamp) && (!reportFilter.dept || reportFilter.dept === 'صالة') && (!reportFilter.user || l.processedBy === reportFilter.user)) {
        rows.push({ ts: l.timestamp, name: `صالة: ${l.name}`, dept: 'صالة ☕', type: 'lounge', in: l.total || 0, out: 0, user: l.processedBy });
      }
    });
    (store.archivedCustomers || []).forEach(c => {
      (c.ledger || []).forEach(l => {
        if (l.type === 'payment' && isWithin(l.timestamp) && (!reportFilter.dept || reportFilter.dept === 'مديونية') && (!reportFilter.user || l.user === reportFilter.user)) {
          rows.push({ ts: l.timestamp, name: `تحصيل مديونية: ${c.name}`, dept: 'مديونية 🤝', type: 'debt', in: l.amount || 0, out: 0, user: l.user });
        }
      });
    });
    (store.archivedExpenses || []).forEach(e => {
      if (isWithin(e.timestamp) && (!reportFilter.dept || reportFilter.dept === 'مصروفات') && (!reportFilter.user || e.user === reportFilter.user)) {
        rows.push({ ts: e.timestamp, name: e.reason || 'مصروفات', dept: 'مصروف 📉', type: 'expense', in: 0, out: e.amount || 0, user: e.user });
      }
    });
    (store.archivedSalaries || []).forEach(s => {
      if (isWithin(s.timestamp) && (!reportFilter.dept || reportFilter.dept === 'موظف') && (!reportFilter.user || s.username === reportFilter.user)) {
        rows.push({ ts: s.timestamp, name: `موظف: ${s.username} (${s.note || ''})`, dept: 'موظف 👤', type: 'staff', in: 0, out: s.amount || 0, user: s.username });
      }
    });

    rows.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    let currentBalance = 0;
    const processedRows = rows.map(r => {
      currentBalance += (r.in - r.out);
      return { ...r, runningBalance: currentBalance };
    });
    return processedRows.reverse();
  });

  const applyReportFilter = () => {
    if (!reportFilter.start || !reportFilter.end) {
      ui.showToast('يرجى تحديد تاريخ البداية والنهاية', 'warning');
    }
  };

  const showAllReports = () => {
    reportFilter.start = '';
    reportFilter.end = '';
    reportFilter.dept = '';
    reportFilter.subDept = '';
    reportFilter.user = '';
  };

  const viewDetailedReport = () => {
    showDetailedReportTable.value = true;
  };

  const showExportModal = ref(false);

  const exportToExcel = () => {
    const data = detailedReportRows.value.map(r => ({
      'التاريخ': formatDate(r.ts) + ' ' + formatTime(r.ts),
      'البيان': r.name,
      'القسم': r.dept,
      'الوارد (+)': r.in || 0,
      'المنصرف (-)': r.out || 0,
      'الرصيد التراكمي': r.runningBalance
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "كشف حساب");
    XLSX.writeFile(workbook, `Classico_Report_${reportFilter.start || 'all'}_to_${reportFilter.end || 'now'}.xlsx`);
    showExportModal.value = false;
  };

  const exportToPDF = () => {
    window.print();
    showExportModal.value = false;
  };

  const selectedStaffUsername = ref('');
  const salaryOp = reactive({ amount: null, note: '' });

  const selectedStaffTransactions = computed(() => {
    if (!selectedStaffUsername.value) return [];
    return (store.archivedSalaries || [])
      .filter(t => t.username === selectedStaffUsername.value)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });

  const selectedStaffTotalWithdrawals = computed(() => {
    return selectedStaffTransactions.value
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const selectedStaffNetRemaining = computed(() => {
    const user = store.users[selectedStaffUsername.value];
    if (!user) return 0;
    return (user.baseSalary || 0) - selectedStaffTotalWithdrawals.value;
  });

  const staffForm = reactive({ username: '', password: '', baseSalary: 0, salaryCycle: 'monthly', role: 'staff' });

  const filteredStaff = computed(() => {
    const users = Object.values(store.users || {});
    return users.filter(u => u.username.toLowerCase().includes(staffSearch.value.toLowerCase()));
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
  const formatDate = (iso) => new Date(iso).toLocaleDateString();
  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const editStaff = (user) => {
    editingStaffMode.value = true;
    staffForm.username = user.username;
    staffForm.password = user.password;
    staffForm.baseSalary = user.baseSalary;
    staffForm.salaryCycle = user.salaryCycle || 'monthly';
    staffForm.role = user.role;
  };

  const cancelStaffEdit = () => {
    editingStaffMode.value = false;
    staffForm.username = ''; staffForm.password = ''; staffForm.baseSalary = 0; staffForm.salaryCycle = 'monthly'; staffForm.role = 'staff';
  };

  const saveStaff = () => {
    if (!staffForm.username || !staffForm.password) { ui.showToast('يرجى إكمال البيانات الأساسية', 'error'); return; }
    const existingUser = store.users[staffForm.username] || {};
    const newUser = {
      username: staffForm.username,
      password: staffForm.password,
      baseSalary: Number(staffForm.baseSalary),
      salaryCycle: staffForm.salaryCycle,
      role: staffForm.role,
      joinedAt: editingStaffMode.value ? (existingUser.joinedAt || new Date().toLocaleDateString()) : new Date().toLocaleDateString(),
      currentBalance: existingUser.currentBalance || 0
    };
    store.saveStaffData(newUser);
    staffSearch.value = '';
    ui.showToast('تم حفظ بيانات الموظف بنجاح ✅');
    cancelStaffEdit();
  };

  const handleSalaryOp = async (type) => {
    if (!selectedStaffUsername.value) return;
    const amount = Number(salaryOp.amount);
    const user = store.users[selectedStaffUsername.value];
    if (type === 'withdrawal') {
      if (amount <= 0) { ui.showToast('يرجى إدخال مبلغ صحيح', 'error'); return; }
      const confirmed = await ui.confirm({
        title: 'تأكيد مسحوبات',
        message: `هل أنت متأكد من تسجيل سحب مبلغ ${amount} ج للموظف ${selectedStaffUsername.value}؟`,
        type: 'warning'
      });
      if (confirmed) {
        store.addSalaryTransaction({ username: selectedStaffUsername.value, type: 'withdrawal', amount, note: salaryOp.note || 'مسحوبات' });
        salaryOp.amount = null; salaryOp.note = ''; ui.showToast('تم تسجيل المسحوبات بنجاح ✅');
      }
    } else if (type === 'settlement') {
      const balance = user.currentBalance || 0;
      const confirmed = await ui.confirm({
        title: 'تصفية حساب',
        message: `هل أنت متأكد من تصفية حساب الموظف ${selectedStaffUsername.value} وصرف مبلغ ${balance} ج؟`,
        type: 'success'
      });
      if (confirmed) {
        store.addSalaryTransaction({ username: selectedStaffUsername.value, type: 'settlement', amount: balance, note: salaryOp.note || 'تصفية راتب نهائية' });
        salaryOp.amount = null; salaryOp.note = ''; ui.showToast('تمت تصفية الحساب وصرف المستحقات بنجاح ✅');
      }
    }
  };

  const deleteStaff = async (username) => {
    if (username === 'admin') return;
    const confirmed = await ui.confirm({
      title: 'حذف موظف',
      message: `هل أنت متأكد من حذف الموظف "${username}"؟ لا يمكن التراجع.`,
      type: 'danger'
    });
    if (confirmed) {
      delete store.users[username];
      store.saveToServer();
      ui.showToast('تم حذف الموظف بنجاح 🗑️');
    }
  };

  const deleteTransaction = async (id) => {
    const confirmed = await ui.confirm({
      title: 'حذف معاملة',
      message: 'هل أنت متأكد من حذف هذه المعاملة؟ سيتم تعديل الرصيد تلقائياً.',
      type: 'warning'
    });
    if (confirmed) {
      store.deleteSalaryTransaction(selectedStaffUsername.value, id);
      ui.showToast('تم حذف المعاملة بنجاح ✅');
    }
  };

  const showCloseShiftModal = ref(false);

  const closeShift = () => {
    showCloseShiftModal.value = true;
  };

  const confirmCloseShift = () => {
    store.closeDailyJournal();
    ui.showToast('تم إغلاق اليومية بنجاح 🔒');
    showCloseShiftModal.value = false;
  };


  const manualSmartClean = async () => {
    const confirmed = await ui.confirm({
      title: 'تنظيف النظام الذكي',
      message: 'هل تريد إجراء تنظيف عميق للكاش وإعادة مزامنة البيانات؟ سيقوم النظام بحذف السجلات اليتيمة والملفات المؤقتة لضمان أفضل أداء.',
      type: 'warning'
    });

    if (confirmed) {
      ui.showToast('جاري التنظيف الذكي... 🧹', 'info');
      const results = await store.smartClean(false);
      localStorage.clear();

      await ui.alert(`تم الانتهاء! تم تنظيف ${results.cleanedCount} سجل مؤقت وتوفير مساحة تقريبية. سيتم الآن إعادة تشغيل الواجهة.`, 'نجاح التنظيف', 'success');
      window.location.reload();
    }
  };

  // Automatic smart clean in background (silent)
  const runAutoMaintenance = () => {
    setTimeout(() => {
      store.smartClean(true);
      console.log('✨ Smart Maintenance: Background cleanup completed.');
    }, 2000);
  };

  const cleanupMonths = ref('6');
  const smartArchive = async () => {
    const monthsNum = parseInt(cleanupMonths.value);
    const confirmed = await ui.confirm({
      title: 'الأرشفة الذكية والصيانة (Database Auto-Maintenance)',
      message: `هل تريد نقل كافة البيانات والأرشيفات الأقدم من ${monthsNum} شهور إلى ملف أرشيف خارجي؟ هذا سيحافظ على سرعة البرنامج كالبرق دائماً.`,
      type: 'warning'
    });
    if (!confirmed) return;

    ui.showToast('جاري تشغيل نظام الأرشفة الذكية... ⏳', 'info');
    try {
        const response = await fetch('/api/system/archive-maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ monthsThreshold: monthsNum })
        });
        const res = await response.json();
        if (res.success) {
            if (res.archivedCount > 0) {
                await ui.alert(`تمت الأرشفة بنجاح! ✅\nتم نقل ${res.archivedCount} سجل قديم إلى ملف خارجي منفصل في مجلد (archived_files).`, 'نجاح الأرشفة', 'success');
                await store.syncFromServer(); // Refresh local state
            } else {
                ui.showToast('لا توجد بيانات قديمة تحتاج للأرشفة حالياً 👍', 'info');
            }
        } else {
            throw new Error(res.error || 'فشلت عملية الأرشفة');
        }
    } catch (err) {
        ui.showToast('فشل في تنفيذ الأرشفة التلقائية', 'error');
        console.error(err);
    }
  };

  const handleFactoryReset = async () => {
    const step1 = await ui.confirm({
      title: 'إعادة ضبط المصنع',
      message: '⚠️ تحذير شديد: سيتم مسح كافة البيانات بشكل نهائي (الموظفين، المنيو، التقارير، العملاء)! هل تريد الاستمرار؟',
      type: 'danger'
    });
    if (!step1) return;

    const step2 = await ui.confirm({
      title: 'تأكيد أخير',
      message: 'إجراء غير قابل للتراجع! هل أنت متأكد تماماً من رغبتك في تصفير البرنامج بالكامل؟',
      type: 'danger'
    });
    if (!step2) return;

    const confirmationPhrase = await ui.confirm({
      title: 'كود التأكيد',
      message: 'لتأكيد الحذف النهائي، يرجى كتابة كلمة "RESET" بالإنجليزية في الحقل أدناه:',
      showInput: true,
      inputPlaceholder: 'اكتب RESET هنا...'
    });

    if (confirmationPhrase !== 'RESET') {
      ui.showToast('فشل التأكيد، لم يتم مسح البيانات', 'error');
      return;
    }

    ui.showToast('جاري إعادة ضبط المصنع ومسح البيانات...', 'warning');
    localStorage.clear(); 
    await store.resetToDefaults();
    await ui.alert('تمت استعادة ضبط المصنع بنجاح. سيتم إعادة تحميل البرنامج والبيانات الافتراضية.', 'نجاح', 'success');
    window.location.reload();
  };

  const backupData = async () => {
    try {
      // 1. Fetch data from server
      ui.showToast('جاري تحضير البيانات... ⏳', 'info');
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('فشل جلب البيانات من السيرفر');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const fileName = `Classico_Backup_${new Date().toISOString().split('T')[0]}_${new Date().getHours()}-${new Date().getMinutes()}.json`;

      // 2. Open "Save As" Dialog using File System Access API if supported
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'Classico Backup File',
              accept: { 'application/json': ['.json'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          ui.showToast('تم حفظ النسخة الاحتياطية بنجاح في المكان المختار ✅', 'success');
        } catch (pickerErr) {
          if (pickerErr.name === 'AbortError') return; // User cancelled
          throw pickerErr;
        }
      } else {
        // Fallback for browsers not supporting File System Access API
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ui.showToast('بدأ تحميل النسخة الاحتياطية (تلقائياً)... 💾', 'info');
      }

      // 3. Trigger Cloud Sync in background (Silent & Smart)
      console.log('☁️ Manual Backup: Triggering silent cloud sync in background...');
      fetch('/api/system/manual-cloud-backup', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('☁️ Cloud Sync Success');
            ui.showToast('تم تحديث النسخة السحابية بنجاح! ☁️✅', 'success');
          }
        })
        .catch(err => {
            console.error('☁️ Cloud Sync Error:', err);
            ui.showToast('فشل تحديث النسخة السحابية تلقائياً', 'warning');
        });
        
    } catch (err) {
      console.error('❌ Backup failed:', err);
      ui.showToast('فشل بدء عملية النسخ الاحتياطي: ' + err.message, 'error');
    }
  };

  const restoreData = () => {
    showRestoreOptionsModal.value = true;
  };

  const restoreFromLocal = () => {
    showRestoreOptionsModal.value = false;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const confirmed = await ui.confirm({
            title: 'استعادة نسخة احتياطية',
            message: '⚠️ تحذير: استعادة النسخة الاحتياطية سيؤدي لمسح كافة البيانات الحالية واستبدالها ببيانات الملف. هل تريد المتابعة؟',
            type: 'warning'
          });
          if (confirmed) {
            // Mapping keys from classico_ format to store properties
            const mappedData = {
                devices: data.classico_devices || data.devices || [],
                menu: data.classico_menu || data.menu || [],
                history: data.classico_history || data.history || [],
                customers: data.classico_customers || data.customers || [],
                archivedCustomers: data.classico_archived_customers || data.archivedCustomers || [],
                users: data.classico_users || data.users || {},
                archivedSalaries: data.classico_archived_salaries || data.archivedSalaries || [],
                loungeInvoices: data.classico_lounge_invoices || data.loungeInvoices || [],
                loungeHistory: data.classico_lounge_history || data.loungeHistory || [],
                expenses: data.classico_expenses || data.expenses || [],
                archivedExpenses: data.classico_archived_expenses || data.archivedExpenses || [],
                localSubscription: data.classico_subscription || data.localSubscription || null,
                lastJournalClosure: data.classico_last_journal_closure || data.lastJournalClosure || new Date().toISOString(),
                appSettings: data.classico_app_settings || data.appSettings || {}
            };
            store.$patch(mappedData);
            await store.saveToServer();
            await ui.alert('تم استعادة البيانات من الجهاز بنجاح ✅', 'نجاح', 'success');
            window.location.reload();
          }
        } catch (err) { ui.showToast('فشل استعادة البيانات: ملف غير صالح', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const fetchCloudBackupInfo = async () => {
    try {
      showRestoreOptionsModal.value = false;
      ui.showToast('جاري فحص السحابة... ☁️', 'info');
      const response = await fetch('/api/system/cloud-backup-info');
      const info = await response.json();
      if (info) {
        cloudBackupInfo.value = info;
        showCloudRestoreConfirm.value = true;
      } else {
        ui.showToast('عذراً، لا يوجد نسخة احتياطية مسجلة في السحاب لهذا المستخدم', 'warning');
      }
    } catch (err) {
      ui.showToast('فشل الاتصال بالسحابة', 'error');
    }
  };

  const restoreFromCloud = async () => {
    try {
      ui.showToast('جاري جلب البيانات من السحاب... ⏳', 'info');
        console.log('☁️ Cloud Restore: Initiating fetch...');
        
        const response = await fetch('/api/system/cloud-restore');
        
        if (response.status === 404) {
          throw new Error('لم يتم العثور على نسخة احتياطية سحابية لهذا الجهاز');
        }
        
        if (!response.ok) {
            throw new Error(`خطأ في السيرفر: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || Object.keys(data).length === 0) {
            throw new Error('النسخة السحابية فارغة أو غير صالحة');
        }

        // Mapping and Cleaning keys
        const mappedData = {
            devices: (data.classico_devices || data.devices || []).map(d => ({
                ...d,
                status: d.status || 'stopped',
                startTime: d.startTime || null,
                usedTimeSeconds: Number(d.usedTimeSeconds) || 0,
                hourPrice: Number(d.hourPrice) || 50,
                orders: d.orders || []
            })),
            menu: data.classico_menu || data.menu || [],
            history: data.classico_history || data.history || [],
            customers: data.classico_customers || data.customers || [],
            archivedCustomers: data.classico_archived_customers || data.archivedCustomers || [],
            users: data.classico_users || data.users || {},
            archivedSalaries: data.classico_archived_salaries || data.archivedSalaries || [],
            loungeInvoices: data.classico_lounge_invoices || data.loungeInvoices || [],
            loungeHistory: data.classico_lounge_history || data.loungeHistory || [],
            expenses: data.classico_expenses || data.expenses || [],
            archivedExpenses: data.classico_archived_expenses || data.archivedExpenses || [],
            localSubscription: data.classico_subscription || data.localSubscription || null,
            lastJournalClosure: data.classico_last_journal_closure || data.lastJournalClosure || new Date().toISOString(),
            appSettings: data.classico_app_settings || data.appSettings || {}
        };

        store.$patch(mappedData);
        await store.saveToServer();
        showCloudRestoreConfirm.value = false;
        
        await ui.alert('تم استعادة البيانات من السحاب بنجاح ✅', 'استعادة سحابية', 'success');
        window.location.reload();
      } catch (err) {
        console.error('☁️ Cloud Restore Error:', err);
        ui.showToast(err.message, 'error');
      }
  };


  const openPermissionsModal = (username) => {
    const user = store.users[username];
    if (!user) return;
    selectedUserForPerms.value = username;
    // Load existing perms or defaults
    const defaults = {};
    const flatten = (pages) => {
      pages.forEach(p => {
        defaults[p.id] = 'edit'; // Default to full for legacy
        if (p.children) flatten(p.children);
      });
    };
    flatten(APP_PAGES);
    userPermsDraft.value = { ...defaults, ...(user.permissions || {}) };
    showPermissionsModal.value = true;
  };

  const handlePermissionChange = (pageId, level, isParent = false) => {
    userPermsDraft.value[pageId] = level;

    if (isParent) {
      // Rule 1: If parent is none, all children must be none
      if (level === 'none') {
        const parent = APP_PAGES.find(p => p.id === pageId);
        if (parent && parent.children) {
          parent.children.forEach(child => {
            userPermsDraft.value[child.id] = 'none';
          });
        }
      }
    } else {
      // Rule 2: If child is visible, parent must be at least view
      if (level !== 'none') {
        const parent = APP_PAGES.find(p => p.children && p.children.some(c => c.id === pageId));
        if (parent && userPermsDraft.value[parent.id] === 'none') {
          userPermsDraft.value[parent.id] = 'view';
        }
      }
    }
  };

  const savePermissions = () => {
    if (!selectedUserForPerms.value) return;
    const user = store.users[selectedUserForPerms.value];
    user.permissions = { ...userPermsDraft.value };
    store.saveStaffData(user);
    showPermissionsModal.value = false;
    ui.showToast(`تم تحديث صلاحيات الموظف "${selectedUserForPerms.value}" بنجاح 🛡️`);
  };

  onMounted(() => {
    if (isAdmin.value) {
      runAutoMaintenance();
    }
  });

  const identityForm = reactive({
    appName: 'Classico',
    appLogo: null,
    userId: '',
    subscriptionDays: 30
  });

  // Sync identity form when store settings load
  watch(() => store.appSettings, (newSettings) => {
    if (newSettings) {
      identityForm.appName = newSettings.appName || 'Classico';
      identityForm.appLogo = newSettings.appLogo || null;
      identityForm.userId = newSettings.userId || '';
      identityForm.subscriptionDays = newSettings.subscriptionDays || 30;
    }
  }, { immediate: true, deep: true });

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 2MB for safety)
      if (file.size > 2 * 1024 * 1024) {
        return ui.showToast('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجا', 'error');
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        identityForm.appLogo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveIdentitySettings = () => {
    store.updateAppSettings({
      appName: identityForm.appName,
      appLogo: identityForm.appLogo
    });
    ui.showToast('تم حفظ إعدادات الهوية بنجاح', 'success');
  };

  const getPlanLabel = (type) => {
    const plans = { trial: 'تجربة مجانية 🎁', monthly: 'اشتراك شهري 📅', yearly: 'اشتراك سنوي 🌟' };
    return plans[type] || 'بدون اشتراك';
  };

  const calculateRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const diff = new Date(expiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredActivityLog = computed(() => {
    const query = activitySearchQuery.value.toLowerCase();
    return (store.activityLog || []).filter(log => 
      log.user.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query)
    );
  });

  return {
    store, isAdmin, activeTab, staffSearch, editingStaffMode, showDetailedJournal, shiftStats,
    totalShiftSalaries, totalHistoricalIncome, totalHistoricalExpenses, reportFilter, getReportStats,
    showDetailedReportTable, detailedReportRows, applyReportFilter, showAllReports, viewDetailedReport,
    showExportModal, exportToExcel, exportToPDF, selectedStaffUsername, salaryOp, selectedStaffTransactions,
    selectedStaffTotalWithdrawals, selectedStaffNetRemaining, staffForm, filteredStaff,
    formatCurrency, formatDate, formatTime, editStaff, cancelStaffEdit, saveStaff, handleSalaryOp,
    deleteStaff, deleteTransaction, closeShift, backupData, restoreData, handleFactoryReset,
    manualSmartClean, smartArchive, cleanupMonths, monitoringGroups,
    showPermissionsModal, selectedUserForPerms, userPermsDraft, APP_PAGES, openPermissionsModal, savePermissions,
    handlePermissionChange, showCloseShiftModal, confirmCloseShift, showJournalPopup,
    identityForm, handleLogoUpload, saveIdentitySettings,
    getPlanLabel, calculateRemainingDays,
    showRestoreOptionsModal, showCloudRestoreConfirm, cloudBackupInfo,
    restoreFromLocal, fetchCloudBackupInfo, restoreFromCloud,
    activitySearchQuery, filteredActivityLog,
    analyticsData, updateAnalytics, analyticsFilter,
    clearActivityLog: async () => {
      const confirmed = await ui.confirm({
        title: 'تنظيف السجل',
        message: 'هل تريد مسح سجل النشاط بالكامل؟ لا يمكن التراجع عن هذه الخطوة.',
        type: 'danger'
      });
      if (confirmed) {
        store.clearActivityLog();
        ui.showToast('تم تنظيف السجل بنجاح ✅');
      }
    },
    togglePageVisibility: (pageId) => {
      if (!store.appSettings.pageVisibility) {
        store.appSettings.pageVisibility = {
          monitoring: true, lounge: true, customers: true, expenses: true, archive: true, menu: true
        };
      }
      store.appSettings.pageVisibility[pageId] = !store.appSettings.pageVisibility[pageId];
      store.saveToDatabase();
      ui.showToast('تم تحديث إعدادات الرؤية بنجاح ✅');
    }
  };
}
