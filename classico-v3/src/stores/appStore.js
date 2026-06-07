import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE = window.location.origin && !window.location.origin.includes('file://') && !window.location.origin.includes('vscode-webview')
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

// Short timeout for all API calls to avoid long black screen waits on slow/no internet
const api = axios.create({ baseURL: API_BASE, timeout: 5000 });

export const useAppStore = defineStore('app', {
  state: () => ({
    devices: [],
    menu: [],
    history: [],
    customers: [],
    archivedCustomers: [],
    clientsDir: [],
    users: {},
    session: null,
    archivedSalaries: [],
    loungeInvoices: [],
    loungeHistory: [],
    expenses: [],
    archivedExpenses: [],
    tournaments: [],
    tournamentsHistory: [],
    lastJournalClosure: "2024-01-01T00:00:00.000Z",
    appSettings: {
      appName: 'Classico',
      appLogo: null,
      userId: '',
      subscriptionDays: 30,
      pageVisibility: {
        monitoring: true,
        lounge: true,
        customers: true,
        expenses: true,
        archive: true,
        menu: true,
        gamepad: true
      }
    },
    machineId: null,
    subscriptionStatus: 'checking',
    subscriptionData: null,
    subscriptionHistory: [],
    localSubscription: null,
    isLoading: true,
    notifiedExpiry: false,
    error: null,
    activityLog: [],
    multiBranchActive: localStorage.getItem('classico_multi_branch_active') === 'true',
    multiBranchData: [],
    activeBranchFilter: 'all'
  }),

  getters: {
    isLoggedIn: (state) => !!state.session,
    isAdmin: (state) => state.session?.role === 'manager' || state.session?.role === 'admin',
    getDeviceById: (state) => (id) => state.devices.find(d => d.id === id),
    canAccess: (state) => (pageId, requiredLevel = 'view') => {
      if (!state.session) return false;
      if (state.session.role === 'manager' || state.session.role === 'admin') return true;

      const user = state.users[state.session.username];
      const currentLevel = user?.permissions?.[pageId] || 'edit';

      if (currentLevel === 'none') return false;
      if (requiredLevel === 'none') return currentLevel !== 'none';

      const levels = { 'none': 0, 'view': 1, 'edit': 2 };
      return levels[currentLevel] >= levels[requiredLevel];
    },

    getShiftDetailedData: (state) => () => {
      const lastClosure = new Date(state.lastJournalClosure);
      const entries = [];

      // 1. Devices History
      state.history.filter(h => new Date(h.timestamp) > lastClosure).forEach(h => {
        const isDebt = h.paymentType === 'debt';
        entries.push({ 
          ts: h.timestamp, 
          name: `جهاز: ${h.name || h.deviceName}${isDebt ? ' (آجل 🤝)' : ''}`, 
          dept: 'أجهزة', 
          in: h.timeCost || 0, 
          out: 0, 
          processedBy: h.processedBy,
          isDebt
        });
      });

      // 2. Lounge History
      state.loungeHistory.filter(l => new Date(l.timestamp) > lastClosure).forEach(l => {
        const isDebt = l.paymentType === 'debt';
        entries.push({ 
          ts: l.timestamp, 
          name: `صالة: ${l.name}${isDebt ? ' (آجل 🤝)' : ''}`, 
          dept: 'صالة', 
          in: l.total || 0, 
          out: 0, 
          processedBy: l.processedBy,
          isDebt
        });
      });

      // 3. Customer Payments (Deduplicated across active and archived customers to prevent double-counting)
      const seenPaymentKeys = new Set();
      
      const processCustomerLedger = (c) => {
        (c.ledger || []).forEach(l => {
          if (l.type === 'payment') {
            const paymentKey = l.id || l.timestamp;
            if (paymentKey && !seenPaymentKeys.has(paymentKey)) {
              seenPaymentKeys.add(paymentKey);
              if (new Date(l.timestamp) > lastClosure) {
                entries.push({ 
                  ts: l.timestamp, 
                  name: `تحصيل مديونية: ${c.name}`, 
                  dept: 'مديونية', 
                  in: l.amount || 0, 
                  out: 0, 
                  processedBy: l.user || 'System' 
                });
              }
            }
          }
        });
      };
      
      (state.customers || []).forEach(processCustomerLedger);
      (state.archivedCustomers || []).forEach(processCustomerLedger);

      // 4. Expenses
      state.archivedExpenses.filter(e => new Date(e.timestamp) > lastClosure).forEach(e => {
        entries.push({ 
          ts: e.timestamp, 
          name: e.reason || `${e.category}${e.note ? ' - ' + e.note : ''}`, 
          dept: 'مصروفات', 
          in: 0, 
          out: e.amount || 0, 
          processedBy: e.user || e.processedBy || e.archivedBy || 'System' 
        });
      });

      // 5. Salaries (Exclude adjustments as they don't affect cash drawer)
      state.archivedSalaries.filter(s => new Date(s.timestamp) > lastClosure && !s.isAdjustment).forEach(s => {
        entries.push({ ts: s.timestamp, name: `موظف: ${s.username} (${s.note || ''})`, dept: 'موظف', in: 0, out: s.amount || 0, processedBy: s.processedBy || s.username });
      });

      // 6. Tournament Payments
      (state.tournamentsHistory || []).filter(t => new Date(t.timestamp) > lastClosure).forEach(t => {
        entries.push({ 
          ts: t.timestamp, 
          name: `اشتراك بطولة: ${t.playerName} (${t.tournamentName})${t.nickname ? ' [' + t.nickname + ']' : ''}`, 
          dept: 'بطولات', 
          in: t.amount || 0, 
          out: 0, 
          processedBy: t.processedBy || 'System' 
        });
      });

      return entries.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    },

    getShiftTotals: (state) => () => {
      const data = state.getShiftDetailedData();
      let psRevenue = 0, loungeRevenue = 0, customerCollections = 0, expenseSum = 0, salarySum = 0, tournamentsRevenue = 0;
      let psDebt = 0, loungeDebt = 0;

      data.forEach(e => {
        if (e.dept === 'أجهزة') {
          if (e.isDebt) psDebt += e.in;
          else psRevenue += e.in;
        }
        else if (e.dept === 'صالة') {
          if (e.isDebt) loungeDebt += e.in;
          else loungeRevenue += e.in;
        }
        else if (e.dept === 'مديونية') {
          customerCollections += e.in;
        }
        else if (e.dept === 'مصروفات') {
          expenseSum += e.out;
        }
        else if (e.dept === 'موظف') {
          salarySum += e.out;
        }
        else if (e.dept === 'بطولات') {
          tournamentsRevenue += e.in;
        }
      });

      // Expected Cash in Drawer = Cash from Devices + Cash from Lounge + Collected Debt + Tournaments - Expenses
      // To prevent double-counting, expectedCash counts only the actual cash transactions!
      const expectedCash = (psRevenue + loungeRevenue + customerCollections + tournamentsRevenue) - expenseSum;

      return { 
        psRevenue: psRevenue + psDebt, // backward compatibility
        loungeRevenue: loungeRevenue + loungeDebt, // backward compatibility
        customerCollections, 
        expenseSum, 
        salarySum, 
        tournamentsRevenue,
        netProfit: expectedCash, // Bind netProfit to expectedCash for backward compatibility so the closed shift receipt displays the correct expected cash in the drawer!
        expectedCash,
        psDebt,
        loungeDebt,
        totalSales: psRevenue + psDebt + loungeRevenue + loungeDebt + tournamentsRevenue
      };
    }
  },

  actions: {
    async init() {
      this.isLoading = true;
      try {
        // If running on GitHub Pages (or any static cloud host), skip local server initialization
        if (window.location.hostname && window.location.hostname.includes('github.io')) {
          console.log('[Init] Running on GitHub Pages, skipping local server API calls.');
          this.isLoading = false;
          return;
        }

        // Step 1: Verify local subscription IMMEDIATELY from cached data (offline-safe)
        this.verifyLocalSubscription();

        // Step 2: Get machine ID from local server (fast, no internet needed)
        try {
          const res = await api.get('/system/machine-id');
          this.machineId = res.data.id.trim();
        } catch (e) {
          console.warn('[Init] Could not get machine-id:', e.message);
        }

        // Step 3: Load data from local server (fast, no internet needed)
        await this.syncFromServer();

        // Step 4: Re-verify after loading fresh data from local DB
        this.verifyLocalSubscription();

        // Step 5: Restore session from localStorage
        const savedSession = localStorage.getItem('classico_session');
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            if (Date.now() - session.loginTime < 21600000) {
              this.session = session;
            }
          } catch(e) { localStorage.removeItem('classico_session'); }
        }

        // Step 6: Ensure admin user exists
        if (!this.users || Object.keys(this.users).length === 0 || !this.users['admin']) {
          this.users = {
            ...this.users,
            'admin': { username: 'admin', password: 'admin', role: 'manager', permissions: {} }
          };
          await this.saveToDatabase(true);
        }

        // Step 7: Online verification in background (non-blocking)
        if (this.machineId) {
          this.checkSubscription().catch(() => {});
          this.startSubscriptionPolling();
          if (this.multiBranchActive) {
            this.fetchMultiBranchData().catch(() => {});
          }
        }

        // Step 8: Self-Healing Automatic background cleanup (runs 3s after startup)
        setTimeout(() => {
          this.smartClean(true).catch(() => {});
          console.log('✨ Self-Healing: Startup background database sanitization completed.');
        }, 3000);

      } catch (err) {
        console.error("Critical Init Error:", err);
      } finally {
        this.isLoading = false;
      }
    },

    async refreshStatus() {
      return await this.checkSubscription();
    },

    async checkSubscription() {
      try {
        const res = await api.get('/system/subscription-verify');
        const data = res.data;

        if (data.success) {
          const oldStatus = this.subscriptionStatus;
          const oldExpiry = this.localSubscription?.expires_at;
          const newExpiry = data.expires_at;

          this.subscriptionData = data;
          this.subscriptionStatus = (data.status || 'none').toLowerCase().trim();
          this.localSubscription = data;

          // Detect any change: new activation, renewal (new expiry), plan change
          const statusChanged = oldStatus !== this.subscriptionStatus;
          const expiryExtended = newExpiry && oldExpiry && new Date(newExpiry) > new Date(oldExpiry);
          const freshActivation = oldStatus !== 'active' && this.subscriptionStatus === 'active';

          if (statusChanged || expiryExtended || freshActivation) {
            console.log(`[SubSync] Subscription changed → status: ${this.subscriptionStatus}, expiry: ${newExpiry}`);
            // Use lightweight sync endpoint (no subscription middleware needed)
            api.post('/system/sync-subscription', data).catch(() => {});
            // Also do full save for activation
            if (freshActivation) {
              await this.saveToDatabase(true);
            }
          }
          
          if (data.device_name && this.appSettings.appName !== data.device_name) {
            this.appSettings.appName = data.device_name;
            await this.saveToDatabase();
          }

          if (this.subscriptionStatus === 'tampered') {
             const ui = (await import('./uiStore')).useUIStore();
             ui.showToast(data.message || 'تنبيه أمني: تم اكتشاف تلاعب في الوقت!', 'error');
          }
        } else {
          // Online confirmed non-active (expired/cancelled/none)
          const wasActive = this.subscriptionStatus === 'active';
          const newStatus = data.status || 'none';

          if (wasActive && newStatus !== 'active') {
            // Subscription was just cancelled or expired online — sync immediately
            console.log(`[SubSync] Subscription deactivated online → status: ${newStatus}`);
            const deactivatedSub = { ...this.localSubscription, status: newStatus, success: false };
            this.localSubscription = deactivatedSub;
            // Use lightweight endpoint (works even without active subscription)
            api.post('/system/sync-subscription', deactivatedSub).catch(() => {});
          }
          this.subscriptionStatus = newStatus;
          this.subscriptionData = data;
        }

        // Fetch History in background
        api.get('/system/subscription-history')
          .then(r => { this.subscriptionHistory = r.data || []; })
          .catch(() => {});

        // Smart Expiry Notifications
        if (this.subscriptionStatus === 'active' && this.subscriptionData?.expires_at && !this.notifiedExpiry) {
          const expiry = new Date(this.subscriptionData.expires_at);
          const now = new Date();
          const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

          const ui = (await import('./uiStore')).useUIStore();

          if (diffDays <= 3 && diffDays > 0) {
            ui.showToast(`تنبيه هام جداً 🚨: متبقي ${diffDays} أيام فقط! سيتم إغلاق النظام تلقائياً إذا لم يتم التجديد.`, 'error');
            this.notifiedExpiry = true;
          } else if (diffDays <= 7 && diffDays > 0) {
            ui.showToast(`نظام كلاسيكو ينبهك ⚠️: متبقي ${diffDays} أيام على انتهاء اشتراكك. يرجى التجديد لضمان استمرار الخدمة.`, 'warning');
            this.notifiedExpiry = true;
          }
        }

        return this.subscriptionStatus;
      } catch (err) {
        // Network error: fall back to local subscription check (never deactivate on network error)
        console.warn('[Subscription] Online check failed, using local fallback:', err.message);
        this.verifyLocalSubscription();
        return this.subscriptionStatus;
      }
    },

    async saveToDatabase(isActivation = false, isReset = false) {
      try {
        const payload = {
          classico_devices: this.devices,
          classico_menu: this.menu,
          classico_history: this.history,
          classico_customers: this.customers,
          classico_archived_customers: this.archivedCustomers,
          classico_clients_dir: this.clientsDir,
          classico_users: this.users,
          classico_archived_salaries: this.archivedSalaries,
          classico_lounge_invoices: this.loungeInvoices,
          classico_lounge_history: this.loungeHistory,
          classico_expenses: this.expenses,
          classico_archived_expenses: this.archivedExpenses,
          classico_tournaments: this.tournaments,
          classico_tournaments_history: this.tournamentsHistory,
          classico_subscription: this.localSubscription || this.subscriptionData,
          classico_last_journal_closure: this.lastJournalClosure,
          classico_app_settings: this.appSettings,
          classico_activity_log: this.activityLog,
          is_activation: isActivation,
          is_reset: isReset
        };

        await api.post('/save', payload);
      } catch (err) {
        if (err.response?.status === 401) return;
        console.error("Save failed", err);
      }
    },

    async syncFromServer() {
      try {
        const res = await api.get('/data');
        if (res.data) {
          const data = res.data;
          this.devices = data.classico_devices || [];
          this.menu = data.classico_menu || [];
          this.history = data.classico_history || [];
          this.customers = data.classico_customers || [];
          this.archivedCustomers = data.classico_archived_customers || [];
          this.clientsDir = data.classico_clients_dir || [];
          this.users = data.classico_users || {};
          this.archivedSalaries = data.classico_archived_salaries || [];
          this.loungeInvoices = data.classico_lounge_invoices || [];
          this.loungeHistory = data.classico_lounge_history || [];
          this.expenses = data.classico_expenses || [];
          this.archivedExpenses = data.classico_archived_expenses || [];
          this.tournaments = data.classico_tournaments || [];
          this.tournamentsHistory = data.classico_tournaments_history || [];
          // Only update localSubscription if server returned one (preserve cached value otherwise)
          if (data.classico_subscription) {
            this.localSubscription = data.classico_subscription;
          }
          this.lastJournalClosure = data.classico_last_journal_closure || "2024-01-01T00:00:00.000Z";
          this.appSettings = data.classico_app_settings || { appName: 'Classico', userId: 'USR-' + Math.random().toString(36).substr(2, 6).toUpperCase() };
          this.activityLog = data.classico_activity_log || [];
          this.recalculateAllCurrentBalances();
        }
      } catch (err) {
        console.warn('[Sync] Local server unreachable, continuing with cached data:', err.message);
      }
    },

    recalculateAllCurrentBalances() {
      Object.keys(this.users || {}).forEach(username => {
        const user = this.users[username];
        if (user) {
          const activeTxs = (this.archivedSalaries || []).filter(t => t.username === username && !t.isSettled);
          user.currentBalance = activeTxs
            .filter(t => t.type === 'withdrawal' || t.type === 'settlement')
            .reduce((sum, t) => sum + t.amount, 0);
        }
      });
    },

    // --- Actions for UI ---
    updateDevice(dev) {
      const idx = this.devices.findIndex(d => d.id === dev.id);
      if (idx !== -1) {
        this.devices[idx] = dev;
        this.saveToDatabase();
      }
    },
    addDevice(dev) {
      this.devices.push(dev);
      this.addActivity('إضافة جهاز', `تم إضافة جهاز جديد باسم ${dev.name}`);
      this.saveToDatabase();
    },
    deleteDevice(id) {
      const dev = this.devices.find(d => d.id === id);
      this.devices = this.devices.filter(d => d.id !== id);
      this.addActivity('حذف جهاز', `تم حذف الجهاز ${dev?.name || id}`);
      this.saveToDatabase();
    },
    resetDevice(id) {
      const dev = this.devices.find(d => d.id === id);
      if (dev) {
        dev.status = 'stopped';
        dev.startTime = null;
        dev.usedTimeSeconds = 0;
        dev.prepaidSeconds = 0;
        dev.orders = [];
        this.saveToDatabase();
      }
    },

    saveStaffData(user) {
      const isNew = !this.users[user.username];
      this.users[user.username] = user;
      this.addActivity(isNew ? 'إضافة موظف' : 'تعديل موظف', `تم ${isNew ? 'إضافة' : 'تعديل'} بيانات الموظف ${user.username}`);
      this.saveToDatabase();
    },

    addSalaryTransaction(tx) {
      const id = Date.now();
      const transaction = { 
        processedBy: this.session?.username || 'admin',
        ...tx, 
        id, 
        timestamp: new Date().toISOString() 
      };
      this.archivedSalaries.push(transaction);

      // Dynamically recalculate all balances to ensure absolute consistency
      this.recalculateAllCurrentBalances();

      this.addActivity('عملية مادية (مرتبات)', `تم تسجيل ${tx.type === 'withdrawal' ? 'سحب' : 'تصفية'} مبلغ ${tx.amount} ج للموظف ${tx.username}`);
      this.saveToDatabase();
    },

    deleteSalaryTransaction(username, id) {
      const tx = this.archivedSalaries.find(t => t.id === id);
      this.archivedSalaries = this.archivedSalaries.filter(t => t.id !== id);

      // Dynamically recalculate all balances to ensure absolute consistency
      this.recalculateAllCurrentBalances();

      this.addActivity('حذف معاملة مالية', `تم حذف معاملة للموظف ${username} بقيمة ${tx?.amount} ج`);
      this.saveToDatabase();
    },

    addHistoryRecord(record) {
      this.history.push({ ...record, timestamp: new Date().toISOString() });
      this.saveToDatabase();
    },

    addLoungeHistoryRecord(record) {
      this.loungeHistory.push({ ...record, timestamp: new Date().toISOString() });
      this.saveToDatabase();
    },

    updateCustomer(customer) {
      const idx = this.customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) this.customers[idx] = customer;
      else this.customers.push(customer);
      this.saveToDatabase();
    },

    deleteCustomer(id) {
      const cust = this.customers.find(c => c.id === id);
      this.customers = this.customers.filter(c => c.id !== id);
      this.addActivity('حذف عميل', `تم حذف حساب العميل ${cust?.name || id}`);
      this.saveToDatabase();
    },

    addLoungeInvoice(inv) {
      this.loungeInvoices.push(inv);
      this.saveToDatabase();
    },

    updateLoungeInvoice(inv) {
      const idx = this.loungeInvoices.findIndex(i => i.id === inv.id);
      if (idx !== -1) {
        this.loungeInvoices[idx] = inv;
        this.saveToDatabase();
      }
    },

    deleteLoungeInvoice(id) {
      const inv = this.loungeInvoices.find(i => i.id === id);
      this.loungeInvoices = this.loungeInvoices.filter(i => i.id !== id);
      this.addActivity('حذف فاتورة صالة', `تم حذف فاتورة صالة باسم ${inv?.name || id} بقيمة ${inv?.total} ج`);
      this.saveToDatabase();
    },

    closeDailyJournal() {
      const totals = this.getShiftTotals();
      this.lastJournalClosure = new Date().toISOString();
      this.addActivity('تقفيل اليومية', `تم تقفيل اليومية بنجاح. صافي الربح: ${totals.netProfit} ج`);
      
      // Automatically clear and reset current active expenses
      this.expenses = [];
      
      // Find all employees whose total active withdrawals (withdrawal + settlement) equal or exceed their base salary
      const settledUsernames = [];
      Object.keys(this.users || {}).forEach(username => {
        const user = this.users[username];
        if (user) {
          // Sum up all active (unsettled) transactions for this employee
          const activeTxs = this.archivedSalaries.filter(t => t.username === username && !t.isSettled);
          const totalActiveWithdrawals = activeTxs
            .filter(t => t.type === 'withdrawal' || t.type === 'settlement')
            .reduce((sum, t) => sum + t.amount, 0);

          // If the total active withdrawals matches their base salary, settle them!
          if (totalActiveWithdrawals >= (user.baseSalary || 0) && (user.baseSalary || 0) > 0) {
            settledUsernames.push(username);
          }
        }
      });

      // Settle all transactions and reset balances for these employees
      if (settledUsernames.length > 0) {
        settledUsernames.forEach(username => {
          const user = this.users[username];
          if (user) {
            user.currentBalance = 0;
          }
          this.archivedSalaries.forEach(t => {
            if (t.username === username && !t.isSettled) {
              t.isSettled = true;
            }
          });
        });
      }
      
      // Re-evaluate all balances to ensure perfect consistency
      this.recalculateAllCurrentBalances();
      
      this.saveToDatabase();
    },

    updateAppSettings(settings) {
      this.appSettings = { ...this.appSettings, ...settings };
      this.saveToDatabase();
    },

    ignoreSuggestion(name) {
      if (!this.appSettings.ignoredSuggestions) {
        this.appSettings.ignoredSuggestions = [];
      }
      if (!this.appSettings.ignoredSuggestions.includes(name)) {
        this.appSettings.ignoredSuggestions.push(name);
        this.saveToDatabase();
      }
    },

    async login(username, password) {
      const user = this.users[username];
      if (!user) return false;

      // Professional security: support both plain (for migration) and hashed passwords
      // The server will hash any plain passwords on the next 'save'
      const encoder = new TextEncoder();
      const keyData = encoder.encode('CLASSICO_SECURE_v3_#99');
      const msgData = encoder.encode(password);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const hashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (user.password === password || user.password === hashHex) {
        this.session = {
          username,
          role: user.role,
          loginTime: Date.now()
        };
        localStorage.setItem('classico_session', JSON.stringify(this.session));
        this.addActivity('تسجيل دخول', `تم تسجيل دخول المستخدم ${username}`);
        return true;
      }
      return false;
    },

    logout() {
      if (this.session) {
        this.addActivity('تسجيل خروج', `المستخدم ${this.session.username} قام بتسجيل الخروج`);
      }
      this.session = null;
      localStorage.removeItem('classico_session');
    },

    addActivity(action, details) {
      const entry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        user: this.session?.username || 'System',
        action,
        details
      };
      this.activityLog.unshift(entry);
      // Keep last 500 entries for performance
      if (this.activityLog.length > 500) this.activityLog = this.activityLog.slice(0, 500);
      this.saveToDatabase();
    },

    deleteFromHistory(timestamp) {
      const record = this.history.find(h => h.timestamp === timestamp);
      this.history = this.history.filter(h => h.timestamp !== timestamp);
      this.addActivity('حذف من أرشيف الأجهزة', `تم حذف سجل جهاز ${record?.deviceName} بتاريخ ${new Date(timestamp).toLocaleDateString()} بقيمة ${record?.totalCost} ج`);
      this.saveToDatabase();
    },

    deleteFromLoungeHistory(timestamp) {
      const record = this.loungeHistory.find(h => h.timestamp === timestamp);
      this.loungeHistory = this.loungeHistory.filter(h => h.timestamp !== timestamp);
      this.addActivity('حذف من أرشيف الصالة', `تم حذف سجل صالة ${record?.name} بتاريخ ${new Date(timestamp).toLocaleDateString()} بقيمة ${record?.total} ج`);
      this.saveToDatabase();
    },

    deleteFromArchivedCustomers(archivedAt) {
      const record = this.archivedCustomers.find(c => c.archivedAt === archivedAt);
      this.archivedCustomers = this.archivedCustomers.filter(c => c.archivedAt !== archivedAt);
      this.addActivity('حذف من أرشيف العملاء', `تم حذف سجل مؤرشف للعميل ${record?.name} بتاريخ ${new Date(archivedAt).toLocaleDateString()}`);
      this.saveToDatabase();
    },

    deleteFromArchivedExpenses(id) {
      const record = this.archivedExpenses.find(e => e.id === id);
      this.archivedExpenses = this.archivedExpenses.filter(e => e.id !== id);
      this.addActivity('حذف من أرشيف المصروفات', `تم حذف مصروف (${record?.category}) بقيمة ${record?.amount} ج`);
      this.saveToDatabase();
    },

    clearArchiveData(type) {
      const titles = { history: 'أجهزة', loungeHistory: 'صالة', archivedCustomers: 'عملاء', archivedExpenses: 'مصروفات', archivedSalaries: 'مرتبات' };
      this[type] = [];
      this.addActivity('تفريغ أرشيف', `تم مسح ${titles[type] || type} بالكامل`);
      this.saveToDatabase();
    },

    clearActivityLog() {
      this.activityLog = [];
      this.addActivity('نظام', 'تم تنظيف سجل النشاط بالكامل');
      this.saveToDatabase();
    },

    setExpenses(expenses) {
      this.expenses = expenses;
      this.saveToDatabase();
    },

    deleteExpense(id) {
      const exp = this.expenses.find(e => e.id === id);
      this.expenses = this.expenses.filter(e => e.id !== id);
      this.addActivity('حذف مصروف', `تم حذف مصروف (${exp?.reason || exp?.category}) بقيمة ${exp?.amount} ج`);
      this.saveToDatabase();
    },

    setArchivedExpenses(archives) {
      this.archivedExpenses = archives;
      this.saveToDatabase();
    },

    setCustomers(customers) {
      this.customers = customers;
      this.saveToDatabase();
    },

    setArchivedCustomers(archives) {
      this.archivedCustomers = archives;
      this.saveToDatabase();
    },

    setClientsDirectory(dir) {
      this.clientsDir = dir;
      this.saveToDatabase();
    },

    setHistory(history) {
      this.history = history;
      this.saveToDatabase();
    },

    setLoungeHistory(history) {
      this.loungeHistory = history;
      this.saveToDatabase();
    },

    setMenu(menu) {
      this.menu = menu;
      this.saveToDatabase();
    },

    setDevices(devices) {
      this.devices = devices;
      this.saveToDatabase();
    },

    setArchivedSalaries(archives) {
      this.archivedSalaries = archives;
      this.saveToDatabase();
    },

    setUsers(users) {
      this.users = users;
      this.saveToDatabase();
    },

    verifyLocalSubscription() {
      if (this.localSubscription && this.localSubscription.status === 'active') {
        const expiry = new Date(this.localSubscription.expires_at);
        if (expiry > new Date()) {
          // Check 7-day offline connection limit
          const lastOnlineStr = this.localSubscription.last_online_check;
          if (lastOnlineStr) {
            const diffMs = new Date() - new Date(lastOnlineStr);
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays > 7) {
              this.subscriptionStatus = 'expired_offline_limit';
              console.warn('[LocalSub] Offline limit exceeded (more than 7 days offline).');
              return;
            }
          } else {
            this.subscriptionStatus = 'expired_offline_limit';
            console.warn('[LocalSub] No last_online_check timestamp found in active local subscription.');
            return;
          }

          // Local subscription is valid - set active immediately
          this.subscriptionStatus = 'active';
          console.log('[LocalSub] Active subscription verified locally until:', this.localSubscription.expires_at);
        } else {
          this.subscriptionStatus = 'expired';
        }
      }
      // If no local subscription found, keep status as 'checking' to avoid
      // premature redirect to subscription page before online check finishes
    },

    startSubscriptionPolling() {
      if (window._subInterval) clearInterval(window._subInterval);
      window._subInterval = setInterval(() => {
        this.checkSubscription();
      }, 60000);

    },

    setMultiBranchActive(active) {
      this.multiBranchActive = active;
      localStorage.setItem('classico_multi_branch_active', active ? 'true' : 'false');
      if (active) {
        this.fetchMultiBranchData();
      } else {
        this.multiBranchData = [];
      }
    },

    async fetchMultiBranchData() {
      if (!this.multiBranchActive || !this.subscriptionData || this.subscriptionData.max_devices <= 1) return;
      try {
        const res = await axios.get(`${API_BASE}/admin/multi-branch-data`);
        if (res.data && res.data.success) {
          this.multiBranchData = res.data.branches || [];
        }
      } catch (err) {
        console.warn("Failed to fetch multi-branch data:", err.message);
      }
    },

    // --- Missing Methods for SettingsLogic.js ---

    saveToServer() {
      return this.saveToDatabase();
    },

    async smartClean(isSilent = true) {
      let cleanedCount = 0;

      const cleanArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        const originalLen = arr.length;
        const filtered = arr.filter(item => item !== null && typeof item === 'object');
        cleanedCount += (originalLen - filtered.length);
        return filtered;
      };

      this.devices = cleanArray(this.devices);
      this.menu = cleanArray(this.menu);
      this.history = cleanArray(this.history);
      this.customers = cleanArray(this.customers);
      this.archivedCustomers = cleanArray(this.archivedCustomers);
      this.archivedSalaries = cleanArray(this.archivedSalaries);
      this.loungeInvoices = cleanArray(this.loungeInvoices);
      this.loungeHistory = cleanArray(this.loungeHistory);
      this.expenses = cleanArray(this.expenses);
      this.archivedExpenses = cleanArray(this.archivedExpenses);

      // Self-Healing: Mark older salary transactions as settled if they are before or equal to a settlement transaction
      const usersList = Object.keys(this.users || {});
      usersList.forEach(username => {
        const userTxs = (this.archivedSalaries || []).filter(t => t.username === username);
        const settlements = userTxs.filter(t => t.type === 'settlement' && t.isSettled);
        if (settlements.length > 0) {
          const latestSettlementTime = new Date(Math.max(...settlements.map(t => new Date(t.timestamp))));
          this.archivedSalaries.forEach(t => {
            if (t.username === username && new Date(t.timestamp) <= latestSettlementTime) {
              t.isSettled = true;
            }
          });
        }
      });

      // If we actually cleaned something, save it to persist the cleanup!
      if (cleanedCount > 0 || !isSilent) {
        await this.saveToDatabase();
      }

      return { cleanedCount };
    },

    async resetToDefaults() {
      // Standard Classico Default Devices
      this.devices = [
        { id: 1, name: "PlayStation 1", status: "stopped", hourPrice: 50, orders: [] },
        { id: 2, name: "PlayStation 2", status: "stopped", hourPrice: 50, orders: [] },
        { id: 3, name: "PlayStation 3", status: "stopped", hourPrice: 50, orders: [] },
        { id: 4, name: "PlayStation 4", status: "stopped", hourPrice: 50, orders: [] },
        { id: 5, name: "PlayStation 5", status: "stopped", hourPrice: 50, orders: [] },
        { id: 6, name: "بلياردو 1", status: "stopped", hourPrice: 50, orders: [] },
        { id: 7, name: "تنس طاولة 1", status: "stopped", hourPrice: 50, orders: [] }
      ];

      this.menu = []; // Will be auto-filled from database.json by the server on reload
      this.history = [];
      this.customers = [];
      this.archivedCustomers = [];
      this.users = {
        'admin': {
          username: 'admin',
          password: 'admin',
          role: 'manager',
          permissions: {}
        }
      };
      this.archivedSalaries = [];
      this.loungeInvoices = [];
      this.loungeHistory = [];
      this.expenses = [];
      this.archivedExpenses = [];
      this.lastJournalClosure = new Date().toISOString();
      this.appSettings = {
        appName: 'Classico',
        userId: 'USR-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        pageVisibility: {
          monitoring: true,
          lounge: true,
          customers: true,
          expenses: true,
          archive: true,
          menu: true,
          gamepad: true
        }
      };

      // Use the dedicated factory reset endpoint for maximum reliability
      try {
        await axios.post(`${API_BASE}/system/factory-reset`, {
          classico_devices: this.devices,
          classico_menu: [],
          classico_history: [],
          classico_customers: [],
          classico_archived_customers: [],
          classico_users: this.users,
          classico_archived_salaries: [],
          classico_lounge_invoices: [],
          classico_lounge_history: [],
          classico_expenses: [],
          classico_archived_expenses: [],
          classico_last_journal_closure: this.lastJournalClosure,
          classico_app_settings: this.appSettings
        });
        this.addActivity('إعادة ضبط المصنع', 'تم إجراء إعادة ضبط كاملة للمصنع ومسح كافة البيانات');
        return true;
      } catch (err) {
        console.error("Factory Reset API failed:", err);
        return this.saveToDatabase(false, true); // Fallback
      }
    },

    // --- PLAYSTATION TOURNAMENTS OPERATIONS ---
    createTournament(t) {
      const type = t.type || 'cup';
      const maxPlayers = type === 'groups_knockout'
        ? (Number(t.groupsCount) || 4) * (Number(t.playersPerGroup) || 4)
        : (Number(t.maxPlayers) || 8);

      const id = Date.now().toString();
      this.tournaments.push({
        id: id,
        name: t.name,
        fee: Number(t.fee) || 0,
        maxPlayers: maxPlayers,
        type: type, // 'cup', 'league', or 'groups_knockout'
        groupsCount: Number(t.groupsCount) || 4,
        playersPerGroup: Number(t.playersPerGroup) || 4,
        stage: type === 'groups_knockout' ? 'groups' : '',
        groups: {},
        prizes: t.prizes || '',
        prizesList: t.prizesList || [],
        paymentNumber: t.paymentNumber || '',
        paymentNumberInstapay: t.paymentNumberInstapay || '',
        paymentNumberWallet: t.paymentNumberWallet || '',
        paymentNumberCash: t.paymentNumberCash || '',
        paymentMethod: t.paymentMethod || 'both', // 'cash', 'instapay', 'both'
        status: 'registration',
        players: [],
        matches: [],
        createdAt: new Date().toISOString()
      });
      this.addActivity('بطولة جديدة', `تم إنشاء بطولة جديدة باسم ${t.name}`);
      this.saveToDatabase();
      return id;
    },

    deleteTournament(id) {
      const idx = this.tournaments.findIndex(t => t.id === id);
      if (idx !== -1) {
        const name = this.tournaments[idx].name;
        this.tournaments.splice(idx, 1);
        this.addActivity('حذف بطولة', `تم حذف البطولة ${name}`);
        this.saveToDatabase();
      }
    },

    registerPlayer(tournamentId, player) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        if (t.players.length >= t.maxPlayers) {
          return { success: false, message: 'البطولة مكتملة العدد بالفعل!' };
        }
        const alreadyExists = t.players.some(p => 
          (p.phone && player.phone && p.phone.trim() === player.phone.trim()) || 
          (p.nickname && player.nickname && p.nickname.trim().toLowerCase() === player.nickname.trim().toLowerCase())
        );
        if (alreadyExists) return { success: false, message: 'رقم الهاتف أو الاسم الحركي مسجل بالفعل!' };

        const isPending = player.isPendingApproval || false;
        const amtPaid = Number(player.amountPaid) || 0;
        const amtConfirmed = !isPending ? (player.paymentType === 'partial' ? amtPaid : (player.paid ? t.fee : 0)) : 0;
        const remaining = Math.max(0, t.fee - amtConfirmed);

        t.players.push({
          id: 'PLR-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
          fullName: player.fullName,
          phone: player.phone,
          nickname: player.nickname,
          logoId: Number(player.logoId) || 0,
          paid: !isPending && (player.paid || (player.paymentType === 'partial' && amtConfirmed >= t.fee)),
          paidAt: !isPending && (player.paid || player.paymentType === 'partial') ? new Date().toISOString() : null,
          isPendingApproval: isPending,
          paymentType: player.paymentType || 'full',
          amountPaid: amtPaid,
          senderNumber: player.senderNumber || '',
          transactionId: player.transactionId || '',
          amountConfirmed: amtConfirmed,
          amountArchived: 0,
          remainingAmount: remaining
        });

        // Record confirmed cash in hand right away to Daily Journal if not pending
        if (!isPending && amtConfirmed > 0) {
          this.tournamentsHistory.push({
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
            playerName: player.fullName,
            nickname: player.nickname,
            tournamentName: t.name,
            amount: amtConfirmed,
            timestamp: new Date().toISOString(),
            processedBy: this.session?.username || 'admin'
          });
        }

        this.addActivity('تسجيل لاعب', `تم تسجيل اللاعب ${player.nickname} (${isPending ? 'معلق ومحجوز مؤقتاً' : 'مؤكد'}) في بطولة ${t.name}`);
        this.saveToDatabase();
        return { success: true };
      }
      return { success: false, message: 'البطولة غير موجودة!' };
    },

    confirmPlayerPayment(tournamentId, playerId, confirmedAmount) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        const player = t.players.find(p => p.id === playerId);
        if (player) {
          const amt = Number(confirmedAmount) || 0;
          player.isPendingApproval = false;
          player.amountConfirmed = amt;
          player.remainingAmount = Math.max(0, t.fee - amt);
          player.paid = (player.amountConfirmed >= t.fee);
          player.paidAt = new Date().toISOString();

          // Add to tournamentsHistory to feed the Daily Journal/Safe account in Classico App
          this.tournamentsHistory.push({
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
            playerName: player.fullName,
            nickname: player.nickname,
            tournamentName: t.name,
            amount: amt,
            timestamp: new Date().toISOString(),
            processedBy: this.session?.username || 'admin'
          });

          this.addActivity('تأكيد سداد لاعب', `تم تأكيد سداد اللاعب ${player.nickname} بقيمة ${amt} ج لبطولة ${t.name}`);
          this.saveToDatabase();
          return true;
        }
      }
      return false;
    },

    collectRemainingPayment(tournamentId, playerId, amount) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        const player = t.players.find(p => p.id === playerId);
        if (player) {
          const amt = Number(amount) || 0;
          player.amountConfirmed = (player.amountConfirmed || 0) + amt;
          player.remainingAmount = Math.max(0, t.fee - player.amountConfirmed);
          player.paid = (player.amountConfirmed >= t.fee);
          player.paidAt = new Date().toISOString();

          // Feed additional incoming funds to tournamentsHistory Daily Shift Ledger
          this.tournamentsHistory.push({
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
            playerName: player.fullName,
            nickname: player.nickname,
            tournamentName: t.name,
            amount: amt,
            timestamp: new Date().toISOString(),
            processedBy: this.session?.username || 'admin'
          });

          this.addActivity('سداد متبقي لاعب', `تم سداد متبقي اشتراك اللاعب ${player.nickname} بقيمة ${amt} ج لبطولة ${t.name}`);
          this.saveToDatabase();
          return true;
        }
      }
      return false;
    },

    rejectPendingPlayer(tournamentId, playerId) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        const idx = t.players.findIndex(p => p.id === playerId);
        if (idx !== -1) {
          const nickname = t.players[idx].nickname;
          t.players.splice(idx, 1);
          this.addActivity('رفض تسجيل لاعب', `تم رفض وإلغاء تسجيل العميل المعلق ${nickname} في بطولة ${t.name}`);
          this.saveToDatabase();
          return true;
        }
      }
      return false;
    },

    archiveConfirmedPayments(tournamentId) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        let archivedCount = 0;
        t.players.forEach(p => {
          if (p.amountConfirmed > 0 && p.amountConfirmed > (p.amountArchived || 0)) {
            p.amountArchived = p.amountConfirmed;
            archivedCount++;
          }
        });
        if (archivedCount > 0) {
          this.addActivity('أرشفة حسابات البطولة', `تم أرشفة وتثبيت مبالغ البطولة المؤكدة لـ ${archivedCount} لاعب في بطولة ${t.name}`);
          this.saveToDatabase();
          return true;
        }
      }
      return false;
    },

    removePlayer(tournamentId, playerId) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        const idx = t.players.findIndex(p => p.id === playerId);
        if (idx !== -1) {
          const name = t.players[idx].nickname;
          t.players.splice(idx, 1);
          
          if (!t.deletedPlayerIds) t.deletedPlayerIds = [];
          t.deletedPlayerIds.push(playerId);
          
          this.addActivity('إلغاء تسجيل لاعب', `تم إلغاء تسجيل اللاعب ${name} من بطولة ${t.name}`);
          this.saveToDatabase();
        }
      }
    },

    markPlayerPaid(tournamentId, playerId) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        const player = t.players.find(p => p.id === playerId);
        if (player && !player.paid) {
          player.paid = true;
          player.paidAt = new Date().toISOString();

          // Add to Tournaments history for financial auditing
          this.tournamentsHistory.push({
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
            playerName: player.fullName,
            nickname: player.nickname,
            tournamentName: t.name,
            amount: t.fee,
            timestamp: new Date().toISOString(),
            processedBy: this.session?.username || 'admin'
          });

          this.addActivity('سداد اشتراك بطولة', `تم سداد اشتراك اللاعب ${player.nickname} بقيمة ${t.fee} ج لبطولة ${t.name}`);
          this.saveToDatabase();
          return true;
        }
      }
      return false;
    },

    startTournament(tournamentId, generatedMatches, groups = null) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        t.status = 'active';
        t.matches = generatedMatches;
        if (groups) {
          t.groups = groups;
        }
        this.addActivity('بدء بطولة', `تم بدء فعاليات بطولة ${t.name} وجدولة المواجهات`);
        this.saveToDatabase();
      }
    },

    advanceToKnockout(tournamentId, generatedKoMatches) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        t.stage = 'knockout';
        t.matches = [
          ...t.matches,
          ...generatedKoMatches
        ];
        this.addActivity('تصعيد للأدوار الإقصائية', `تم توليد مواجهات خروج المغلوب لبطولة ${t.name}`);
        this.saveToDatabase();
      }
    },

    updateMatchResult(tournamentId, matchId, score1, score2, winnerId, nextMatchesUpdates = []) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        const match = t.matches.find(m => m.id === matchId);
        if (match) {
          match.player1Score = score1;
          match.player2Score = score2;
          match.winnerId = winnerId;
          match.played = true;

          // Apply any cascaded updates for next round slots
          if (nextMatchesUpdates && nextMatchesUpdates.length > 0) {
            nextMatchesUpdates.forEach(update => {
              const target = t.matches.find(m => m.id === update.matchId);
              if (target) {
                if (update.slot === 1) {
                  target.player1Id = update.playerId;
                } else if (update.slot === 2) {
                  target.player2Id = update.playerId;
                }
              }
            });
          }

          this.addActivity('تحديث نتيجة مباراة', `تم تحديث مباراة في بطولة ${t.name}`);
          this.saveToDatabase();
        }
      }
    },

    completeTournament(tournamentId, winners) {
      const t = this.tournaments.find(x => x.id === tournamentId);
      if (t) {
        t.status = 'completed';
        t.winners = winners; // { first: id, second: id, third: id }
        this.addActivity('انتهاء بطولة', `تم انتهاء بطولة ${t.name} وتتويج الأبطال`);
        this.saveToDatabase();
      }
    }
  }
});
