<template>
  <div class="dashboard-wrapper tournaments-admin-wrapper" style="direction: rtl;">
    <main class="main-area glass-panel page-watermark" style="width: 100%; position: relative; height: 100%; overflow-y: auto !important; display: block !important;">
      <div style="position: relative; z-index: 1; padding-bottom: 100px;">
        
        <!-- Header -->
        <div class="archive-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <h1 class="premium-title-main" style="margin: 0;">🏆 إدارة البطولات والمسابقات</h1>
          <span class="lounge-tag">EA sports</span>
        </div>

        <div class="grid-layout">
          <!-- Left side: Sidebar list & forms / links -->
          <div class="side-column">
            <!-- 1. Tournaments Sidebar List -->
            <div class="glass-panel" style="padding: 1rem !important; border-radius: 16px; display: flex; flex-direction: column; gap: 10px; background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255,255,255,0.05); box-sizing: border-box;">
              <h3 style="font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">🎮 البطولات والمسابقات النشطة</h3>
              
              <div class="tournaments-sidebar-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
                <div 
                  v-for="t in store.tournaments" 
                  :key="t.id"
                  :class="['sidebar-tour-item', { active: selectedTournamentId === t.id && !showCreateForm }]"
                  @click="selectedTournamentId = t.id; showCreateForm = false; initAdvancingState();"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">

                    <strong style="font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; color: #fff;">{{ t.name }}</strong>
                    <span class="badge" :class="t.status" style="font-size: 0.65rem; padding: 2px 6px;">
                      {{ t.status === 'registration' ? 'تسجيل' : t.status === 'active' ? 'نشطة' : 'منتهية' }}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">
                    <span>نوع: {{ t.type === 'cup' ? 'كأس' : t.type === 'league' ? 'دوري' : 'مجموعات' }}</span>
                    <span>اللاعبين: {{ t.players?.filter(p => p && !p.isPendingApproval).length || 0 }} / {{ t.maxPlayers }}</span>
                  </div>
                </div>
                <div v-if="store.tournaments.length === 0" style="text-align: center; color: var(--text-muted); font-size: 0.72rem; padding: 15px 0;">لا توجد بطولات بعد.</div>
              </div>
              
              <button @click="triggerCreateFormFocus" class="btn btn-green-v3" style="font-size: 0.8rem; padding: 6px 12px; font-weight: bold; width: 100%; margin-top: 5px;">
                + إنشاء بطولة جديدة 🏆
              </button>
            </div>

            <!-- 2. Create Tournament Panel (If showCreateForm is true or no tournaments exist) -->
            <div v-if="showCreateForm || !activeTournament" class="glass-card-form animate-scale-in">
              <div class="form-header-v3">✨ إنشاء بطولة جديدة</div>
              
              <div class="field-v3">
                <label>اسم البطولة 🏆</label>
                <input type="text" ref="tournamentNameInputRef" v-model="createForm.name" placeholder="مثال: بطولة كلاسيكو الرمضانية الأولى" class="premium-input-v3" :class="{ 'flash-highlight': isNameInputFlashing }">
              </div>


              <div class="field-v3">
                <label>سعر اشتراك اللاعب 💸</label>
                <input type="number" v-model="createForm.fee" placeholder="مثال: 50" class="premium-input-v3">
              </div>

              <div class="field-v3" v-if="createForm.fee > 0">
                <label>وسيلة الدفع المقبولة 💳</label>
                <select v-model="createForm.paymentMethod" class="premium-input-v3">
                  <option value="wallet">محفظه كاش فقط</option>
                  <option value="instapay">انستا باى فقط</option>
                  <option value="both">انستا باى او محفظه كاش</option>
                  <option value="cash">نقدا بالصاله</option>
                </select>
              </div>

              <div class="field-v3" v-if="createForm.fee > 0 && (createForm.paymentMethod === 'instapay' || createForm.paymentMethod === 'both')">
                <label>رقم/عنوان انستا باى ⚡</label>
                <input type="text" v-model="createForm.paymentNumberInstapay" placeholder="مثال: اسم الحساب أو الرقم الهاتفي" class="premium-input-v3">
              </div>

              <div class="field-v3" v-if="createForm.fee > 0 && (createForm.paymentMethod === 'wallet' || createForm.paymentMethod === 'both')">
                <label>رقم محفظة الكاش 📱</label>
                <input type="text" v-model="createForm.paymentNumberWallet" placeholder="مثال: 010xxxxxxxx" class="premium-input-v3">
              </div>

              <div class="field-v3" v-if="createForm.fee > 0 && createForm.paymentMethod === 'cash'">
                <label>تعليمات الدفع نقداً بالصالة 💵</label>
                <input type="text" v-model="createForm.paymentNumberCash" placeholder="مثال: سداد نقدي للموظف المسؤول بالصالة" class="premium-input-v3">
              </div>

              <div class="field-v3">
                <label>نظام البطولة 📊</label>
                <select v-model="createForm.type" class="premium-input-v3" @change="adjustPlayerLimit">
                  <option value="cup">كأس (خروج المغلوب - تصفيات شجرية)</option>
                  <option value="league">دوري (جدول نقاط ومباريات دور واحد)</option>
                  <option value="groups_knockout">مجموعات + تصفيات إقصائية 🏆</option>
                </select>
              </div>

              <!-- Options for Groups + Knockouts -->
              <div v-if="createForm.type === 'groups_knockout'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.4rem;">
                <div class="field-v2">
                  <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; margin-bottom: 4px; display: block;">عدد المجموعات 👥</label>
                  <select v-model="createForm.groupsCount" class="premium-input-v3" @change="adjustPlayerLimit" style="width: 100%;">
                    <option :value="2">مجموعتين (2)</option>
                    <option :value="4">4 مجموعات</option>
                    <option :value="8">8 مجموعات</option>
                  </select>
                </div>
                <div class="field-v2">
                  <label style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; margin-bottom: 4px; display: block;">لاعبين لكل مجموعة 👤</label>
                  <select v-model="createForm.playersPerGroup" class="premium-input-v3" @change="adjustPlayerLimit" style="width: 100%;">
                    <option :value="3">3 لاعبين</option>
                    <option :value="4">4 لاعبين</option>
                    <option :value="5">5 لاعبين</option>
                    <option :value="6">6 لاعبين</option>
                  </select>
                </div>
              </div>

              <div class="field-v3">
                <label>عدد المشاركين المستهدف 👥</label>
                <div v-if="createForm.type === 'groups_knockout'" style="background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); color: #fbbf24; font-weight: 800; font-size: 0.85rem; text-align: center;">
                  العدد الإجمالي المستهدف: {{ createForm.groupsCount * createForm.playersPerGroup }} لاعب
                </div>
                <select v-else-if="createForm.type === 'cup'" v-model="createForm.maxPlayers" class="premium-input-v3">
                  <option :value="4">4 لاعبين (نصف نهائي)</option>
                  <option :value="8">8 لاعبين (ربع نهائي)</option>
                  <option :value="16">16 لاعباً (دور الـ 16)</option>
                  <option :value="32">32 لاعباً (دور الـ 32)</option>
                  <option :value="64">64 لاعباً (دور الـ 64)</option>
                </select>
                <input v-else type="number" v-model="createForm.maxPlayers" placeholder="أدخل أي عدد مشاركين" class="premium-input-v3">
              </div>

              <div class="field-v3">
                <label style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 4px;">
                  <span style="font-weight: bold;">جوائز المراكز والفائزين 🥇</span>
                  <button type="button" @click="addPrizeSlot" class="btn secondary-btn prize-add-btn" style="padding: 2px 8px; font-size: 0.72rem; font-weight: bold; border-radius: 4px; flex-shrink: 0;">+ إضافة جائزة</button>
                </label>
                
                <div class="prizes-builder-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 5px; max-height: 160px; overflow-y: auto; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                  <div v-for="(p, idx) in createForm.prizesList" :key="idx" style="display: flex; gap: 6px; align-items: center; width: 100%;">
                    <input type="text" v-model="p.label" placeholder="الترتيب أو المركز" class="premium-input-mini prize-label" style="flex: 1; font-weight: bold; font-size: 0.75rem; text-align: right; min-width: 0;">
                    <input type="text" v-model="p.value" placeholder="قيمة الجائزة أو المكافأة" class="premium-input-mini prize-value" style="flex: 1.5; font-size: 0.75rem; min-width: 0;">
                    <button type="button" @click="removePrizeSlot(idx)" style="background: rgba(239, 68, 68, 0.2); border: none; border-radius: 4px; color: #ef4444; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">✕</button>
                  </div>
                  <div v-if="createForm.prizesList.length === 0" style="text-align: center; color: var(--text-muted); font-size: 0.7rem; padding: 10px 0;">لا توجد جوائز محددة بعد. اضغط على إضافة جائزة!</div>
                </div>
              </div>

              <button @click="handleCreateTournament" class="btn btn-green-v3" style="width: 100%; margin-top: 1rem; padding: 0.8rem;">
                إنشاء البطولة والبدء فوراً 🏆
              </button>
            </div>

            <!-- 3. Active Tournament QR & Links Panel (If showCreateForm is false and activeTournament exists) -->
            <div v-else-if="activeTournament" class="glass-card-form animate-scale-in">
              <div class="form-header-v3">🔗 روابط الاشتراك والتسويق للبطولة</div>
              
              <div class="active-tour-meta-card">
                <div class="active-tour-title-row" style="align-items: flex-start;">
                  <h3 class="active-tournament-title-highlight" style="margin-top: 4px;">
                    🏆 {{ activeTournament.name }}
                  </h3>
                  <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end; flex-shrink: 0;">
                    <button @click="handleDeleteTournament" class="btn-delete-tour-icon" title="حزف وإلغاء البطولة بالكامل 🗑️">
                      حزف والغاء البطوله 🗑️
                    </button>
                    <button @click="showTournamentDetailsModal = true" class="btn-details-tour-icon" title="تفاصيل البطولة وجوائزها ℹ️">
                      ℹ️ تفاصيل البطوله
                    </button>
                  </div>
                </div>
                <div class="active-tour-badges" style="margin-top: 10px;">
                  <span class="badge" :class="activeTournament.type">
                    {{ activeTournament.type === 'cup' ? 'كأس' : activeTournament.type === 'league' ? 'دوري' : 'مجموعات وتصفيات' }}
                  </span>
                  <span class="badge" :class="activeTournament.status">
                    {{ activeTournament.status === 'registration' ? 'مرحلة التسجيل' : activeTournament.status === 'completed' ? 'منتهية 🏆' : 'نشطة الآن' }}
                  </span>
                </div>
              </div>

              <!-- Quick Navigation Actions -->
              <div v-if="activeTournament && !showCreateForm && activeTournament.status !== 'registration'" class="tour-nav-actions" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem; padding: 12px; background: rgba(0,0,0,0.25); border-radius: 16px; border: 2px solid rgba(0, 242, 254, 0.3); box-shadow: 0 0 15px rgba(0, 242, 254, 0.1);">
                <!-- Show Registered Players button only when NOT in players view -->
                <button 
                  v-if="viewMode === 'matches' || (!viewMode && activeTournament.status !== 'registration')"
                  @click="viewMode = 'players'" 
                  class="btn btn-premium-nav" 
                  style="width: 100%; font-weight: 900; font-size: 1rem; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%) !important; color: white !important; border: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4); transition: all 0.3s ease;"
                >
                  👥 المشتركين المسجلين فى البطوله
                </button>

                <!-- Show Tournament Details button only when NOT in matches view -->
                <button 
                  v-if="viewMode === 'players'"
                  @click="viewMode = 'matches'" 
                  class="btn btn-premium-nav" 
                  style="width: 100%; font-weight: 900; font-size: 1rem; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: white !important; border: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: all 0.3s ease;"
                >
                  🏆 دخول حيثيات ونتائج البطولة
                </button>
              </div>

              <!-- Permanent 24/7 Cloud Registration Link (Zero Server Dependency!) -->
              <div class="link-card glass-panel">
                <span class="link-card-title">🔗 رابط التسجيل السحابي الدائم 24/7:</span>
                <div class="url-copy-row" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; width: 100%;">
                  <input type="text" readonly :value="cloudPagesUrl" ref="cloudPagesUrlInput" class="premium-input-mini cloud-url-input" style="flex: 1; font-family: monospace; font-size: 0.85rem; padding: 6px; min-width: 120px;">
                  <button @click="copyLink('cloudPages')" class="s-copy cloud-copy-btn" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; font-weight: bold; flex-shrink: 0;">نسخ الرابط</button>
                  <button @click="openLink(cloudPagesUrl)" class="s-copy open-url-btn" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; font-weight: bold; flex-shrink: 0;">فتح الرابط 🌐</button>
                </div>

                <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin: 8px 0 0 0;">✨ يعمل هذا الرابط 24 ساعة من أي مكان بالإنترنت لتمكين اللاعبين من التسجيل من هواتفهم دون الحاجة لتشغيل جهاز الكمبيوتر الخاص بك بالصالة!</p>
              </div>

              <!-- QR Code Preview Card -->
              <div class="qr-preview-container animate-fade-in" style="margin-top: 1.5rem; text-align: center;">
                <h4 style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 8px;">امسح الكود للتسجيل بالبطولة فوراً 📸</h4>
                <div class="qr-wrapper" style="background: white; padding: 10px; border-radius: 12px; display: inline-block; box-shadow: 0 0 15px rgba(255,255,255,0.1);">
                  <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cloudPagesUrl)}`" alt="QR Link" style="display: block; width: 140px; height: 140px;">
                </div>
              </div>
            </div>
          </div>

          <!-- Right side: Tournament bracket and players list -->
          <div class="main-column">
            <!-- No active tournament fallback -->
            <div v-if="!activeTournament" class="form-card-v3 animate-scale-in" style="text-align: center; padding: 3rem;">
              <span style="font-size: 3rem;">🏆</span>
              <h2 style="color: #fff; font-size: 1.3rem; margin-top: 10px;">لا توجد أي بطولات مفعلة حالياً</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">قم بإنشاء بطولة كأس، دوري، أو مجموعات جديدة بالضغط على الزر الأخضر في القائمة الجانبية للبدء فوراً في تسجيل المشتركين وإقامة المباريات.</p>
              <button @click="triggerCreateFormFocus" class="btn btn-green-v3" style="padding: 0.6rem 2rem;">+ إنشاء أول بطولة الآن</button>
            </div>

            <!-- 3. Registered Players Management panel -->
            <div v-else-if="activeTournament && (viewMode === 'players' || (!viewMode && activeTournament.status === 'registration'))" class="form-card-v3 animate-scale-in">
              <div class="form-header-v3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span>
                  👤 المشتركين المسجلين حالياً ({{ activeTournament.players.filter(p => p && !p.isPendingApproval).length }} / {{ activeTournament.maxPlayers }})
                  <span v-if="activeTournament.players.filter(p => p && p.isPendingApproval).length > 0" style="margin-right: 8px; background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.25); padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                    {{ activeTournament.players.filter(p => p && p.isPendingApproval).length }} طلبات معلقة ⏳
                  </span>
                </span>
                <div style="display: flex; gap: 8px;">
                  <button @click="showAccountsModal = true" class="btn secondary-btn" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; font-weight: bold; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%) !important; color: white !important; border: none !important;">
                    📊 الحسابات والإيرادات الكلية
                  </button>
                  <button @click="manualSyncCloudPlayers" class="btn secondary-btn" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; font-weight: bold; background: #06b6d4 !important; color: black !important; border: 1px solid rgba(6, 182, 212, 0.2) !important;">
                    🔄 جلب التسجيلات أونلاين
                  </button>
                  <button @click="showAddPlayerModal = true" class="btn secondary-btn btn-manual-player" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; font-weight: bold;">
                    + تسجيل لاعب يدوياً
                  </button>
                </div>
              </div>

              <!-- شريط بحث لتصفية المشتركين -->
              <div style="margin: 1.2rem 0; position: relative; direction: rtl;">
                <input 
                  type="text" 
                  v-model="playerSearchQuery" 
                  placeholder="🔎 ابحث عن لاعب بالاسم، الاسم الحركي، أو رقم الهاتف..." 
                  class="premium-input-v3 player-search-input"
                  style="width: 100%; padding: 10px 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.9rem; direction: rtl; box-sizing: border-box;"
                >
                <span v-if="playerSearchQuery.trim()" @click="playerSearchQuery = ''" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #ef4444; font-size: 0.85rem; font-weight: bold; padding: 2px 6px; z-index: 10;">مسح ✖</span>
              </div>

              <div class="table-container" style="max-height: 50vh; overflow-y: auto; margin-bottom: 1.5rem;">
                <table style="width: 100%;">
                  <thead>
                    <tr>
                      <th style="text-align: right;">اللاعب / الاسم الحركي</th>
                      <th style="text-align: center;">الهاتف</th>
                      <th style="text-align: center;">تفاصيل التحويل</th>
                      <th style="text-align: center;">المدفوع / المتبقي</th>
                      <th style="text-align: center;">الحالة</th>
                      <th style="text-align: center;">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in filteredPlayers" :key="p.id" :style="p && p.isPendingApproval ? 'background: rgba(251, 191, 36, 0.03);' : ''">
                      <td style="text-align: right; padding: 12px 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; direction: rtl;">
                          <span class="player-logo-mini" :style="getLogoStyle(p.logoId)">
                            {{ getLogoSymbol(p.logoId) }}
                          </span>
                          <div style="display: flex; flex-direction: column; gap: 2px; text-align: right; min-width: 0;">
                            <span style="font-weight: 800; font-size: 0.9rem; display: block; line-height: 1.2;">{{ p.fullName }}</span>
                            <span class="player-nickname-sub" style="color: var(--accent-cyan); font-size: 0.72rem; font-weight: bold; display: block; line-height: 1.2;">{{ p.nickname }}</span>
                          </div>
                        </div>
                      </td>
                      <td style="text-align: center; font-family: monospace;">{{ p.phone }}</td>
                      
                      <!-- تفاصيل التحويل المالي للمشتركين -->
                      <td style="text-align: center; font-size: 0.78rem; line-height: 1.4;">
                        <div v-if="p.senderNumber">
                          <strong>من:</strong> {{ p.senderNumber }}<br>
                          <strong>العملية:</strong> <span style="font-family: monospace; color: #fbbf24; font-weight: bold;">{{ p.transactionId }}</span>
                        </div>
                        <span v-else style="color: var(--text-muted);">تسجيل يدوي</span>
                      </td>

                      <!-- المدفوع والمتبقي من الاشتراك -->
                      <td style="text-align: center; font-size: 0.82rem; line-height: 1.4;">
                        <div v-if="p.isPendingApproval">
                          <span style="color: #fbbf24; font-weight: bold;">المرسل: {{ p.amountPaid }} ج</span>
                        </div>
                        <div v-else>
                          <span style="color: #10b981; font-weight: bold;">المدفوع: {{ p.amountConfirmed || 0 }} ج</span><br>
                          <span v-if="p.remainingAmount > 0" style="color: #ef4444; font-weight: bold;">المتبقي: {{ p.remainingAmount }} ج</span>
                          <span v-else style="color: #94a3b8;">كامل الاشتراك ✅</span>
                        </div>
                      </td>

                      <!-- حالة السداد والاشتراك -->
                      <td style="text-align: center;">
                        <span v-if="p.isPendingApproval" class="status-badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.25); font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: bold;">
                          معلق ⏳
                        </span>
                        <span v-else-if="p.paid" class="status-badge status-running" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: bold;">
                          مسجل ومسدد ✅
                        </span>
                        <span v-else class="status-badge" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.25); font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: bold;">
                          مسدد جزئياً 💰
                        </span>
                      </td>

                      <!-- الإجراءات المتاحة للمسؤول -->
                      <td style="text-align: center;">
                        <div v-if="p.isPendingApproval" style="display: flex; gap: 6px; justify-content: center;">
                          <button @click="openConfirmPaymentDialog(p)" class="btn btn-green-v3" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; font-weight: bold;">
                            تأكيد السداد 👍
                          </button>
                          <button @click="handleRejectPendingPlayer(p)" class="btn danger-btn" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
                            رفض ✕
                          </button>
                        </div>
                        <div v-else style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                          <button v-if="p.remainingAmount > 0" @click="openCollectRemainingDialog(p)" class="btn secondary-btn btn-pay-status" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; font-weight: bold;">
                            تحصيل المتبقي 💰
                          </button>
                          <button @click="handleRemovePlayer(p)" class="btn danger-btn" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">إزالة</button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredPlayers.length === 0">
                      <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">
                        {{ playerSearchQuery.trim() ? 'لا توجد نتائج تطابق بحثك عن "' + playerSearchQuery + '" 🔍' : 'لا توجد تسجيلات بعد. قم بنشر رابط الـ QR للبدء في تجميع اللاعبين! 🏆' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Start/Restart Tournament Button -->
              <div v-if="activeTournament.players.filter(p => p && !p.isPendingApproval).length >= 2" class="action-footer" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; width: 100%; margin-top: 1.5rem;">
                <p v-if="activeTournament.type === 'cup' && activeTournament.players.filter(p => p && !p.isPendingApproval).length < activeTournament.maxPlayers" style="font-size: 0.8rem; color: #fbbf24; margin-bottom: 8px; font-weight: bold;">
                  ⚠️ تنبيه: لم يكتمل العدد المطلوب ({{ activeTournament.players.filter(p => p && !p.isPendingApproval).length }} / {{ activeTournament.maxPlayers }}). عند الضغط على "بدء" سيقوم النظام بتوزيع تأهلات تلقائية (Bye Passes) عشوائياً للاعبين المتبقين!
                </p>
                <p v-if="activeTournament.type === 'groups_knockout' && activeTournament.players.filter(p => p && !p.isPendingApproval).length < activeTournament.maxPlayers" style="font-size: 0.8rem; color: #fbbf24; margin-bottom: 8px; font-weight: bold;">
                  ⚠️ تنبيه: لم يكتمل العدد الكلي المستهدف ({{ activeTournament.players.filter(p => p && !p.isPendingApproval).length }} / {{ activeTournament.maxPlayers }}). سيتم ملء المقاعد المتبقية بلاعبي تأهل تلقائي (Bye) لإنشاء قرعة المجموعات!
                </p>
                
                <button @click="handleStartTournament" class="btn btn-green-v3" style="font-size: 1.1rem; padding: 0.8rem 2.5rem; font-weight: bold; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); width: 100%;">
                  {{ activeTournament.status === 'registration' ? '🎲 إغلاق التسجيل وتوليد مواجهات القرعة عشوائياً 🚀' : '🔄 إعادة توليد مواجهات القرعة عشوائياً 🎲' }}
                </button>
                <p v-if="activeTournament.status !== 'registration'" style="font-size: 0.75rem; color: #ef4444; font-weight: bold; margin-top: 5px;">
                  ⚠️ تنبيه: إعادة توليد القرعة سيؤدي لحذف نتائج المباريات الحالية والبدء من جديد!
                </p>
              </div>
            </div>

            <!-- 4. Active Tournament Match Viewer Panel (If in progress or completed) -->
            <div v-else-if="activeTournament && activeTournament.status !== 'registration'" class="form-card-v3 animate-scale-in">
              
              <!-- Winners Ceremony certificate (matching print report design exactly) -->
              <div v-if="activeTournament.status === 'completed'" class="certificate-container glass-panel animate-scale-in" style="margin: 0 auto; max-width: 760px;">

                <!-- Action Buttons at TOP of report (no-print) -->
                <div style="text-align: center; margin-bottom: 1.2rem; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; width: 100%;" class="no-print">
                  <button @click="showShareModal = true" class="btn btn-green-v3" style="font-size: 0.88rem; padding: 8px 18px; font-weight: bold;">
                    🔗 مشاركة / طباعة التقرير
                  </button>
                  <button @click="archiveAndResetTournament" class="btn secondary-btn btn-archive-reset" style="font-weight: bold; font-size: 0.88rem; padding: 8px 18px;">
                    🗄️ إرسال البطولة للأرشيف والبدء من جديد
                  </button>
                </div>

                <div class="header">
                  <div class="lounge-name">🎮 {{ store.appSettings?.appName || 'الصالة' }}</div>
                  <h2 class="report-title">التقرير الرسمي لتتويج أبطال الصالة 🏆</h2>
                  <div class="tournament-title" style="margin-top: 5px;">
                    <span class="tournament-label" style="font-size: 1.1rem; opacity: 0.85;">بطولة</span>
                    <span class="tournament-name-highlight" style="font-size: 1.7rem; font-weight: 900; text-shadow: 0 0 15px rgba(251, 191, 36, 0.4); margin-right: 6px; white-space: nowrap;">"{{ activeTournament.name }}"</span>
                  </div>
                </div>

                <div class="podium-section">
                  <!-- Second Place -->
                  <div v-if="activeTournament.winners?.second" class="podium-card silver animate-scale-in" style="animation-delay: 0.3s;">
                    <div class="winner-logo" :style="getPlayerLogoStyle(activeTournament.winners.second)" style="padding: 6px; display: flex; align-items: center; justify-content: center;">
                      <img :src="getPlayerLogoUrl(activeTournament.winners.second)" style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>
                    <span class="winner-nick">{{ getPlayerNickname(activeTournament.winners.second) }}</span>
                    <span class="rank-text">المركز الثاني</span>
                    <div class="podium-medal" style="font-size: 2.5rem; margin-top: 5px;">🥈</div>
                  </div>

                  <!-- First Place -->
                  <div v-if="activeTournament.winners?.first" class="podium-card gold animate-scale-in" style="animation-delay: 0.1s;">
                    <div class="winner-logo" :style="getPlayerLogoStyle(activeTournament.winners.first)" style="padding: 6px; display: flex; align-items: center; justify-content: center;">
                      <img :src="getPlayerLogoUrl(activeTournament.winners.first)" style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>
                    <span class="winner-nick gold-color">{{ getPlayerNickname(activeTournament.winners.first) }}</span>
                    <span class="rank-text">البطل والمركز الأول 🏆</span>
                    <div class="podium-medal" style="font-size: 3rem; margin-top: 5px; filter: drop-shadow(0 0 8px rgba(251,191,36,0.5));">🏆🥇</div>
                  </div>

                  <!-- Third Place -->
                  <div v-if="activeTournament.winners?.third" class="podium-card bronze animate-scale-in" style="animation-delay: 0.5s;">
                    <div class="winner-logo" :style="getPlayerLogoStyle(activeTournament.winners.third)" style="padding: 6px; display: flex; align-items: center; justify-content: center;">
                      <img :src="getPlayerLogoUrl(activeTournament.winners.third)" style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>
                    <span class="winner-nick">{{ getPlayerNickname(activeTournament.winners.third) }}</span>
                    <span class="rank-text">المركز الثالث</span>
                    <div class="podium-medal" style="font-size: 2.5rem; margin-top: 5px;">🥉</div>
                  </div>
                </div>

                <!-- Prizes Details Table -->
                <div class="winners-table-container" style="margin-top: 15px; width: 100%;">
                  <h3 class="table-title" style="text-align: center; font-size: 1.05rem; margin-bottom: 8px; font-weight: 800;">🏆 تفاصيل الجوائز والتكريم</h3>
                  <table class="winners-report-table" style="width: 100%; border-collapse: collapse; text-align: center; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden;">
                    <thead>
                      <tr style="background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                        <th style="padding: 8px; font-weight: bold; font-size: 0.8rem; width: 25%;">المركز</th>
                        <th style="padding: 8px; font-weight: bold; font-size: 0.8rem; width: 45%;">اللاعب</th>
                        <th style="padding: 8px; font-weight: bold; font-size: 0.8rem; width: 30%;">الجائزة المحددة</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Gold -->
                      <tr v-if="activeTournament.winners?.first" style="border-bottom: 1px solid rgba(255, 255, 255, 0.03);">
                        <td style="padding: 8px; font-weight: bold; color: #fbbf24; font-size: 0.85rem;">🥇 الأول</td>
                        <td style="padding: 8px; font-weight: bold; color: #ffffff; font-size: 0.85rem;">
                          {{ getPlayerNickname(activeTournament.winners.first) }}
                          <span style="font-size: 0.72rem; font-weight: normal;">({{ getPlayerFullName(activeTournament.winners.first) }})</span>
                        </td>
                        <td style="padding: 8px; font-weight: bold; color: #fbbf24; font-size: 0.85rem;">{{ getPrizeForRank(1) || 'ميدالية ذهبية' }}</td>
                      </tr>
                      <!-- Silver -->
                      <tr v-if="activeTournament.winners?.second" style="border-bottom: 1px solid rgba(255, 255, 255, 0.03);">
                        <td style="padding: 8px; font-weight: bold; color: #cbd5e1; font-size: 0.85rem;">🥈 الثاني</td>
                        <td style="padding: 8px; font-weight: bold; color: #ffffff; font-size: 0.85rem;">
                          {{ getPlayerNickname(activeTournament.winners.second) }}
                          <span style="font-size: 0.72rem; font-weight: normal;">({{ getPlayerFullName(activeTournament.winners.second) }})</span>
                        </td>
                        <td style="padding: 8px; font-weight: bold; color: #cbd5e1; font-size: 0.85rem;">{{ getPrizeForRank(2) || 'ميدالية فضية' }}</td>
                      </tr>
                      <!-- Bronze -->
                      <tr v-if="activeTournament.winners?.third">
                        <td style="padding: 8px; font-weight: bold; color: #fb923c; font-size: 0.85rem;">🥉 الثالث</td>
                        <td style="padding: 8px; font-weight: bold; color: #ffffff; font-size: 0.85rem;">
                          {{ getPlayerNickname(activeTournament.winners.third) }}
                          <span style="font-size: 0.72rem; font-weight: normal;">({{ getPlayerFullName(activeTournament.winners.third) }})</span>
                        </td>
                        <td style="padding: 8px; font-weight: bold; color: #fb923c; font-size: 0.85rem;">{{ getPrizeForRank(3) || 'ميدالية برونزية' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="footer-section" style="margin-top: 20px;">
                  <div class="meta-time">تاريخ الإصدار: {{ new Date().toLocaleDateString('ar-EG') }}</div>
                  <div class="stamp-area" style="display: flex; flex-direction: column; align-items: center; margin-top: -10px;">
                    <div class="stamp-title">اعتماد إدارة الصالة</div>
                    <div class="official-stamp">
                      <div class="stamp-outer-ring">
                        <div class="stamp-inner-ring">
                          <div class="stamp-content">
                            <span class="stamp-icon">🏆</span>
                            <span class="stamp-lounge-name">{{ store.appSettings?.appName || 'الصالة' }}</span>
                            <span class="stamp-tagline">اعتماد رسمي</span>
                            <span class="stamp-brand">CLASSICO</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Bracket or League Points table view -->
              <div v-else>
                <div class="form-header-v3" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                  <span>⚔️ مخطط وجدول مباريات البطولة النشطة</span>
                  <button @click="handleForceComplete" class="btn danger-btn" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; background: #fbbf24 !important; color: black; font-weight: bold;">
                    🏁 إنهاء وتتويج الأبطال يدوياً
                  </button>
                </div>

                <!-- Cup Bracket interactive Tree layout (Symmetric Design) -->
                <div v-if="activeTournament.type === 'cup'" class="symmetric-bracket-scroller">
                  <div v-if="symmetricCupRounds" class="symmetric-bracket-container">
                    <!-- Left Wing -->
                    <div class="bracket-wing left-wing" v-if="symmetricCupRounds.leftRounds.length > 0">
                      <div v-for="round in symmetricCupRounds.leftRounds" :key="'l-r-' + round.index" class="bracket-round-column" style="min-width: 230px;">
                        <h4 class="round-title-banner" style="font-size: 0.9rem; padding: 0.5rem;">{{ round.name }}</h4>
                        <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1.2rem;">
                          <div 
                            v-for="match in round.matches" 
                            :key="match.id" 
                            class="bracket-match-node interactive-match-card" 
                            @click="openMatchScoreDialog(match)"
                          >
                            <!-- Player 1 -->
                            <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }">
                              <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)">
                                {{ getPlayerLogoSymbol(match.player1Id) }}
                              </span>
                              <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player1Id) }}</span>
                              <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player1Score : '-' }}</span>
                            </div>
                            <div class="vs-divider" style="margin: 0.3rem 0; font-size: 0.75rem;">VS</div>
                            <!-- Player 2 -->
                            <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }">
                              <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)">
                                {{ getPlayerLogoSymbol(match.player2Id) }}
                              </span>
                              <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player2Id) }}</span>
                              <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player2Score : '-' }}</span>
                            </div>
                            <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Center Wing (Trophy & Final) -->
                    <div class="bracket-center-column" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 250px; gap: 1rem;">
                      <div class="trophy-stage animate-pulse" style="text-align: center; margin-bottom: 0.5rem;">
                        <span class="trophy-glow-icon" style="font-size: 4rem; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));">🏆</span>
                        <div class="trophy-title" style="color: #fbbf24; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; margin-top: 5px;">كأس البطولة</div>
                      </div>
                      
                      <div class="final-round-title" style="color: #fbbf24; font-weight: 800; font-size: 0.95rem; text-align: center; margin-bottom: 0.2rem;">
                        {{ symmetricCupRounds.finalRoundName }}
                      </div>

                      <div v-if="symmetricCupRounds.finalMatch" class="bracket-match-node final-match-node interactive-match-card" style="padding: 0.6rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); display: flex; flex-direction: column; gap: 4px; width: 230px; border: 2px solid #fbbf24 !important; box-shadow: 0 0 20px rgba(251, 191, 36, 0.25) !important;" @click="openMatchScoreDialog(symmetricCupRounds.finalMatch)">
                        <!-- Player 1 -->
                        <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                            {{ getPlayerLogoSymbol(symmetricCupRounds.finalMatch.player1Id) }}
                          </span>
                          <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player1Id) }}</span>
                          <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player1Score : '-' }}</span>
                        </div>
                        <div class="vs-divider" style="color: #fbbf24; font-weight: 900; font-size: 0.8rem; text-align: center; margin: 0.2rem 0;">FINALS</div>
                        <!-- Player 2 -->
                        <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                            {{ getPlayerLogoSymbol(symmetricCupRounds.finalMatch.player2Id) }}
                          </span>
                          <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player2Id) }}</span>
                          <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player2Score : '-' }}</span>
                        </div>
                        <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                      </div>
                    </div>

                    <!-- Right Wing -->
                    <div class="bracket-wing right-wing" v-if="symmetricCupRounds.rightRoundsReversed.length > 0">
                      <div v-for="round in symmetricCupRounds.rightRoundsReversed" :key="'r-r-' + round.index" class="bracket-round-column" style="min-width: 230px;">
                        <h4 class="round-title-banner" style="font-size: 0.9rem; padding: 0.5rem;">{{ round.name }}</h4>
                        <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1.2rem;">
                          <div 
                            v-for="match in round.matches" 
                            :key="match.id" 
                            class="bracket-match-node interactive-match-card" 
                            @click="openMatchScoreDialog(match)"
                          >
                            <!-- Player 1 -->
                            <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }">
                              <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)">
                                {{ getPlayerLogoSymbol(match.player1Id) }}
                              </span>
                              <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player1Id) }}</span>
                              <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player1Score : '-' }}</span>
                            </div>
                            <div class="vs-divider" style="margin: 0.3rem 0; font-size: 0.75rem;">VS</div>
                            <!-- Player 2 -->
                            <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }">
                              <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)">
                                {{ getPlayerLogoSymbol(match.player2Id) }}
                              </span>
                              <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player2Id) }}</span>
                              <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player2Score : '-' }}</span>
                            </div>
                            <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Group Stage + Knockouts Manager Panel -->
                <div v-else-if="activeTournament.type === 'groups_knockout'" class="groups-stage-dashboard-container">
                  <!-- Tabs to toggle display in knockout stage -->
                  <div v-if="activeTournament.stage === 'knockout'" class="groups-tabs-header" style="display: flex; gap: 10px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); width: 300px; margin: 0 auto 1.5rem auto;">
                    <button 
                      @click="groupsStageTab = 'knockout'" 
                      :class="['tab-btn', { active: groupsStageTab === 'knockout' }]"
                      style="flex: 1; padding: 8px; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s; background: none; color: #94a3b8;"
                    >
                      🏆 الأدوار الإقصائية
                    </button>
                    <button 
                      @click="groupsStageTab = 'groups'" 
                      :class="['tab-btn', { active: groupsStageTab === 'groups' }]"
                      style="flex: 1; padding: 8px; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s; background: none; color: #94a3b8;"
                    >
                      📊 دور المجموعات
                    </button>
                  </div>

                  <!-- Group Standings & Matches -->
                  <div v-if="activeTournament.stage === 'groups' || groupsStageTab === 'groups'">
                    <!-- Side-by-side or stacked Group blocks -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                      <div 
                        v-for="(playersInGroup, groupName) in groupStandings" 
                        :key="groupName" 
                        class="glass-panel"
                        style="padding: 1.2rem !important; border-radius: 16px; background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255,255,255,0.05);"
                      >
                        <h3 style="font-size: 1.15rem; color: #fbbf24; text-align: center; margin-bottom: 1rem; margin-top: 0;">🏆 المجموعة {{ groupName }}</h3>
                        
                        <!-- Table of group standings -->
                        <div class="table-container" style="margin-bottom: 1rem; overflow-x: auto;">
                          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                            <thead>
                              <tr style="color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <th style="text-align: center; padding: 4px;">م</th>
                                <th style="text-align: right; padding: 4px;">اللاعب</th>
                                <th style="text-align: center; padding: 4px;">لعب</th>
                                <th style="text-align: center; padding: 4px;">فاز</th>
                                <th style="text-align: center; padding: 4px;">له:عليه</th>
                                <th style="text-align: center; padding: 4px;">نقاط</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(p, rank) in playersInGroup" :key="p.id" style="border-bottom: 1px solid rgba(255,255,255,0.02);">
                                <td style="text-align: center; font-weight: bold; padding: 6px 4px;">
                                  <span :style="rank < 2 ? 'color: #fbbf24;' : 'color: #94a3b8;'">{{ rank + 1 }}</span>
                                </td>
                                <td style="text-align: right; display: flex; align-items: center; gap: 6px; font-weight: bold; padding: 6px 4px;">
                                  <span class="player-logo-mini" :style="getPlayerLogoStyle(p.id)" style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px;">
                                    <img :src="getPlayerLogoUrl(p.id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                  </span>
                                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; color: #fff;">{{ p.nickname }}</span>
                                </td>
                                <td style="text-align: center; padding: 6px 4px; color: #cbd5e1;">{{ p.played }}</td>
                                <td style="text-align: center; color: #10b981; padding: 6px 4px;">{{ p.won }}</td>
                                <td style="text-align: center; font-family: monospace; padding: 6px 4px; color: #94a3b8;">{{ p.goalsFor }}:{{ p.goalsAgainst }}</td>
                                <td style="text-align: center; color: #fbbf24; font-weight: bold; padding: 6px 4px;">{{ p.points }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <!-- Matches list of this group -->
                        <h4 style="font-size: 0.8rem; color: #94a3b8; margin: 12px 0 6px 0; border-right: 2px solid #06b6d4; padding-right: 6px;">📅 مواجهات المجموعة</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                          <div 
                            v-for="match in groupMatchesByGroup[groupName]" 
                            :key="match.id" 
                            class="bracket-match-node interactive-match-card" 
                            style="padding: 6px 10px !important; background: rgba(0,0,0,0.2);"
                            @click="openMatchScoreDialog(match)"
                          >
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                              <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                                <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px;">
                                  <span v-if="match.player1Id === 'bye' || !match.player1Id">⭐</span>
                                  <img v-else :src="getPlayerLogoUrl(match.player1Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                </span>
                                <span style="font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #cbd5e1;">{{ getPlayerNickname(match.player1Id) }}</span>
                              </div>
                              
                              <span style="font-family: monospace; font-size: 0.8rem; font-weight: bold; color: #fbbf24; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 6px;">
                                {{ match.played ? `${match.player1Score} - ${match.player2Score}` : 'VS' }}
                              </span>
                              
                              <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; justify-content: flex-end;">
                                <span style="font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; color: #cbd5e1;">{{ getPlayerNickname(match.player2Id) }}</span>
                                <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px;">
                                  <span v-if="match.player2Id === 'bye' || !match.player2Id">⭐</span>
                                  <img v-else :src="getPlayerLogoUrl(match.player2Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                </span>
                              </div>
                            </div>
                            <div class="click-to-score-hint" style="font-size: 0.6rem; bottom: -20px;">اضغط لتسجيل النتيجة ✍️</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Advancement / Qualifiers panel (Only in groups stage) -->
                    <div v-if="activeTournament.stage === 'groups'" class="glass-panel animate-scale-in" style="margin-top: 2rem; border-color: rgba(251, 191, 36, 0.25) !important; background: radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.03) 0%, rgba(15, 23, 42, 0.6) 100%) !important;">
                      <h3 style="color: #fbbf24; font-size: 1.1rem; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">🚀 تأهيل وتصعيد اللاعبين للأدوار الإقصائية (Knockouts)</h3>
                      <p style="color: var(--text-muted); font-size: 0.8rem; line-height: 1.5; margin-bottom: 1.2rem;">يقوم النظام تلقائياً بتحديد المركز الأول والثاني من كل مجموعة افتراضياً كمتأهلين. يمكنك تعديل الاختيارات يدوياً بالأسفل، مع مراعاة أن يكون العدد الكلي للاعبين المتأهلين من مضاعفات الرقم 2 (2، 4، 8، 16 لاعب) لتكوين شجرة تصفيات متزنة.</p>
                      
                      <!-- Selector grid by groups -->
                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem;">
                        <div v-for="(playersInGroup, groupName) in groupStandings" :key="groupName" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                          <h4 style="margin: 0 0 8px 0; color: #fbbf24; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">المجموعة {{ groupName }}</h4>
                          <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label 
                              v-for="(p, idx) in playersInGroup" 
                              :key="p.id" 
                              style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; cursor: pointer; color: #fff;"
                            >
                              <input type="checkbox" v-model="advancingPlayers[p.id]" style="cursor: pointer; width: 14px; height: 14px;">
                              <span style="font-weight: bold;" :style="idx < 2 ? 'color: #fbbf24;' : ''">{{ p.nickname }} ({{ p.points }} ن)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div style="margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="font-weight: 800; font-size: 0.9rem; color: #fff;">
                          عدد اللاعبين المتأهلين المحددين: <span style="color: #fbbf24; font-size: 1.1rem; text-shadow: 0 0 5px rgba(251,191,36,0.3);">{{ computedAdvancingCount }} لاعب</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <span v-if="![2,4,8,16,32].includes(computedAdvancingCount)" style="color: #ef4444; font-size: 0.78rem; font-weight: bold; background: rgba(239, 68, 68, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.15);">
                            ⚠️ يجب أن يكون العدد 2، 4، 8، أو 16
                          </span>
                          <button 
                            @click="advanceToKnockoutStage" 
                            class="btn btn-green-v3"
                            :disabled="![2,4,8,16,32].includes(computedAdvancingCount)"
                            style="font-size: 0.9rem; font-weight: bold; padding: 0.5rem 1.8rem;"
                            :style="![2,4,8,16,32].includes(computedAdvancingCount) ? 'opacity: 0.4; cursor: not-allowed; background: #334155 !important; border-color: #475569 !important; color: #64748b !important; box-shadow: none !important;' : ''"
                          >
                            توليد أدوار خروج المغلوب وبدء الكأس 🏆
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Knockout Stage Content (Symmetric Bracket) -->
                  <div v-if="activeTournament.stage === 'knockout' && groupsStageTab === 'knockout'" class="symmetric-bracket-scroller">
                    <div v-if="symmetricCupRounds" class="symmetric-bracket-container">
                      <!-- Left Wing -->
                      <div class="bracket-wing left-wing" v-if="symmetricCupRounds.leftRounds.length > 0">
                        <div v-for="round in symmetricCupRounds.leftRounds" :key="'l-r-' + round.index" class="bracket-round-column" style="min-width: 230px;">
                          <h4 class="round-title-banner" style="font-size: 0.9rem; padding: 0.5rem;">{{ round.name }}</h4>
                          <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1.2rem;">
                            <div 
                              v-for="match in round.matches" 
                              :key="match.id" 
                              class="bracket-match-node interactive-match-card" 
                              @click="openMatchScoreDialog(match)"
                            >
                              <!-- Player 1 -->
                              <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }">
                                <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                                  <span v-if="match.player1Id === 'bye' || !match.player1Id" style="font-size: 0.65rem;">⭐</span>
                                  <img v-else :src="getPlayerLogoUrl(match.player1Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                </span>
                                <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player1Id) }}</span>
                                <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player1Score : '-' }}</span>
                              </div>
                              <div class="vs-divider" style="margin: 0.3rem 0; font-size: 0.75rem;">VS</div>
                              <!-- Player 2 -->
                              <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }">
                                <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                                  <span v-if="match.player2Id === 'bye' || !match.player2Id" style="font-size: 0.65rem;">⭐</span>
                                  <img v-else :src="getPlayerLogoUrl(match.player2Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                </span>
                                <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player2Id) }}</span>
                                <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player2Score : '-' }}</span>
                              </div>
                              <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Center Wing (Trophy & Final) -->
                      <div class="bracket-center-column" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 250px; gap: 1rem;">
                        <div class="trophy-stage animate-pulse" style="text-align: center; margin-bottom: 0.5rem;">
                          <span class="trophy-glow-icon" style="font-size: 4rem; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));">🏆</span>
                          <div class="trophy-title" style="color: #fbbf24; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; margin-top: 5px;">كأس البطولة</div>
                        </div>
                        
                        <div class="final-round-title" style="color: #fbbf24; font-weight: 800; font-size: 0.95rem; text-align: center; margin-bottom: 0.2rem;">
                          {{ symmetricCupRounds.finalRoundName }}
                        </div>

                        <div v-if="symmetricCupRounds.finalMatch" class="bracket-match-node final-match-node interactive-match-card" style="padding: 0.6rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); display: flex; flex-direction: column; gap: 4px; width: 230px; border: 2px solid #fbbf24 !important; box-shadow: 0 0 20px rgba(251, 191, 36, 0.25) !important;" @click="openMatchScoreDialog(symmetricCupRounds.finalMatch)">
                          <!-- Player 1 -->
                          <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                              <span v-if="symmetricCupRounds.finalMatch.player1Id === 'bye' || !symmetricCupRounds.finalMatch.player1Id" style="font-size: 0.65rem;">⭐</span>
                              <img :src="getPlayerLogoUrl(symmetricCupRounds.finalMatch.player1Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                            </span>
                            <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player1Id) }}</span>
                            <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player1Score : '-' }}</span>
                          </div>
                          <div class="vs-divider" style="color: #fbbf24; font-weight: 900; font-size: 0.8rem; text-align: center; margin: 0.2rem 0;">FINALS</div>
                          <!-- Player 2 -->
                          <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                              <span v-if="symmetricCupRounds.finalMatch.player2Id === 'bye' || !symmetricCupRounds.finalMatch.player2Id" style="font-size: 0.65rem;">⭐</span>
                              <img :src="getPlayerLogoUrl(symmetricCupRounds.finalMatch.player2Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                            </span>
                            <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player2Id) }}</span>
                            <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player2Score : '-' }}</span>
                          </div>
                          <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                        </div>
                      </div>

                      <!-- Right Wing -->
                      <div class="bracket-wing right-wing" v-if="symmetricCupRounds.rightRoundsReversed.length > 0">
                        <div v-for="round in symmetricCupRounds.rightRoundsReversed" :key="'r-r-' + round.index" class="bracket-round-column" style="min-width: 230px;">
                          <h4 class="round-title-banner" style="font-size: 0.9rem; padding: 0.5rem;">{{ round.name }}</h4>
                          <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1.2rem;">
                            <div 
                              v-for="match in round.matches" 
                              :key="match.id" 
                              class="bracket-match-node interactive-match-card" 
                              @click="openMatchScoreDialog(match)"
                            >
                              <!-- Player 1 -->
                              <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }">
                                <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                                  <span v-if="match.player1Id === 'bye' || !match.player1Id" style="font-size: 0.65rem;">⭐</span>
                                  <img v-else :src="getPlayerLogoUrl(match.player1Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                </span>
                                <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player1Id) }}</span>
                                <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player1Score : '-' }}</span>
                              </div>
                              <div class="vs-divider" style="margin: 0.3rem 0; font-size: 0.75rem;">VS</div>
                              <!-- Player 2 -->
                              <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }">
                                <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                                  <span v-if="match.player2Id === 'bye' || !match.player2Id" style="font-size: 0.65rem;">⭐</span>
                                  <img v-else :src="getPlayerLogoUrl(match.player2Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                                </span>
                                <span class="player-nick" style="font-size: 0.9rem;">{{ getPlayerNickname(match.player2Id) }}</span>
                                <span class="player-score" style="font-size: 1rem;">{{ match.played ? match.player2Score : '-' }}</span>
                              </div>
                              <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- League points table and round matches schedule list -->
                <div v-else class="league-dashboard-layout" style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.5rem; margin-top: 1rem;">
                  <!-- Leaderboard Table -->
                  <div class="table-container league-table-card" style="border-radius: 16px; padding: 1rem; max-height: 70vh; overflow-y: auto;">
                    <h3 class="highlight" style="font-size: 1rem; text-align: center; margin-bottom: 0.8rem;">🏆 جدول ترتيب الدوري</h3>
                    <table style="width: 100%;">
                      <thead>
                        <tr>
                          <th style="text-align: center; width: 40px;">م</th>
                          <th style="text-align: right;">اللاعب</th>
                          <th style="text-align: center;">لعب</th>
                          <th style="text-align: center;">فاز</th>
                          <th style="text-align: center;">تعادل</th>
                          <th style="text-align: center;">نقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(p, rank) in leagueLeaderboard" :key="p.id">
                          <td style="text-align: center; font-weight: bold;">
                            <span v-if="rank === 0" class="crown">👑 1</span>
                            <span v-else-if="rank === 1" class="silver-medal">🥈 2</span>
                            <span v-else-if="rank === 2" class="bronze-medal">🥉 3</span>
                            <span v-else>{{ rank + 1 }}</span>
                          </td>
                          <td style="text-align: right; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(p.id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                              <img :src="getPlayerLogoUrl(p.id)" style="width: 100%; height: 100%; object-fit: contain;" />
                            </span>
                            <span>{{ p.nickname }}</span>
                          </td>
                          <td style="text-align: center;">{{ p.played }}</td>
                          <td style="text-align: center; color: var(--accent-success);">{{ p.won }}</td>
                          <td style="text-align: center; color: var(--text-muted);">{{ p.drawn }}</td>
                          <td style="text-align: center; color: #fbbf24; font-weight: 900;">{{ p.points }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Fixtures Schedule Round-by-Round -->
                  <div class="fixtures-list-container league-fixtures-card" style="border-radius: 16px; padding: 1rem; max-height: 70vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 8px;">
                      <h3 class="highlight" style="font-size: 1.05rem; margin: 0;">📅 جدول المباريات والمواجهات</h3>
                      <select v-model="selectedLeagueRound" class="premium-input-mini league-round-select" style="width: 120px; font-weight: bold; border-radius: 8px; flex-shrink: 0;">
                        <option v-for="r in totalLeagueRoundsCount" :key="r" :value="r - 1">الجولة {{ r }}</option>
                      </select>
                    </div>

                    <div class="fixtures-schedule-round">
                      <div 
                        v-for="match in selectedRoundMatches" 
                        :key="match.id" 
                        class="bracket-match-node interactive-match-card" 
                        style="margin-bottom: 0.8rem;"
                        @click="openMatchScoreDialog(match)"
                      >
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                          <!-- P1 -->
                          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                              <span v-if="match.player1Id === 'bye' || !match.player1Id">⭐</span>
                              <img v-else :src="getPlayerLogoUrl(match.player1Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                            </span>
                            <span class="player-nick" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ getPlayerNickname(match.player1Id) }}</span>
                          </div>
                          
                          <!-- Score -->
                          <div class="score-display-league">
                            {{ match.played ? `${match.player1Score} - ${match.player2Score}` : 'VS' }}
                          </div>

                          <!-- P2 -->
                          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; justify-content: flex-end; text-align: left;">
                            <span class="player-nick" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; order: 1;">{{ getPlayerNickname(match.player2Id) }}</span>
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="order: 2; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; padding: 2px;">
                              <span v-if="match.player2Id === 'bye' || !match.player2Id">⭐</span>
                              <img v-else :src="getPlayerLogoUrl(match.player2Id)" style="width: 100%; height: 100%; object-fit: contain;" />
                            </span>
                          </div>
                        </div>

                        <div class="click-to-score-hint">اضغط لتسجيل النتيجة ✍️</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- 1. Add Player Manually Dialog -->
    <div v-if="showAddPlayerModal" class="modal-overlay" @click.self="showAddPlayerModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content glass-panel" style="max-width: 550px; width: 95%;">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.15rem; color: var(--accent-cyan);">👤 تسجيل لاعب جديد يدوياً</h2>
          <button @click="showAddPlayerModal = false" class="btn-icon">✖</button>
        </div>

        <div class="modal-body-v3" style="display: flex; flex-direction: column; gap: 1.25rem; padding: 1rem 0;">
          
          <!-- Personal Info Group -->
          <div class="modal-inner-box" style="padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
            <h4 style="margin: 0 0 4px 0; font-size: 0.85rem; color: var(--accent-cyan); font-weight: 800;">📝 البيانات الشخصية للاعب</h4>
            
            <div class="field-v3" style="margin-bottom: 0;">
              <label>الاسم رباعي بالكامل 👤</label>
              <input type="text" v-model="manualPlayerForm.fullName" placeholder="أدخل اسم المشترك بالكامل" class="premium-input-v3" style="width: 100%;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="field-v3" style="margin-bottom: 0;">
                <label>الاسم الحركي (Nickname) 👾</label>
                <input type="text" v-model="manualPlayerForm.nickname" placeholder="الاسم على المخطط" class="premium-input-v3" maxLength="16" style="width: 100%;">
              </div>
              <div class="field-v3" style="margin-bottom: 0;">
                <label>رقم الهاتف 📱</label>
                <input type="tel" v-model="manualPlayerForm.phone" placeholder="رقم الموبايل" class="premium-input-v3" style="width: 100%;">
              </div>
            </div>
          </div>

          <!-- Logo Picker Group -->
          <div class="modal-inner-box" style="padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
            <label style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin: 0; background: none !important; border: none !important; padding: 0 !important; box-shadow: none !important; color: inherit !important;">
              <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 800;">🎨 اختر شعار الفريق والرمز</span>
              <span v-if="manualPlayerForm.logoId !== null" style="font-size: 0.75rem; color: var(--accent-success); display: flex; align-items: center; gap: 5px;">
                الشعار المحدد: <span class="text-highlight-yellow" style="margin-left: 5px;">{{ CURATED_LOGOS[manualPlayerForm.logoId]?.name }}</span>
                <span class="logo-preview-icon" :style="getLogoStyle(manualPlayerForm.logoId)" style="overflow: hidden; padding: 3px; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%;">
                  <img :src="'logos/logo_' + manualPlayerForm.logoId + '.svg'" style="width: 100%; height: 100%; object-fit: contain;" />
                </span>
              </span>
            </label>
            <div class="logo-scroll-grid">
              <button
                type="button"
                v-for="(logo, idx) in CURATED_LOGOS"
                :key="idx"
                :class="['logo-select-btn', { active: manualPlayerForm.logoId === idx, 'logo-taken': isLogoTaken(idx) && manualPlayerForm.logoId !== idx }]"
                :style="getLogoStyle(idx)"
                :disabled="isLogoTaken(idx) && manualPlayerForm.logoId !== idx"
                @click="manualPlayerForm.logoId = idx"
                style="width: 36px; height: 36px;"
                :title="isLogoTaken(idx) ? 'هذا الشعار محجوز بالفعل 🔒' : logo.name"
              >
                <span class="logo-symbol" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 4px; overflow: hidden; border-radius: 50%;">
                  <span v-if="isLogoTaken(idx) && manualPlayerForm.logoId !== idx" style="font-size: 0.9rem;">🔒</span>
                  <img v-else :src="'logos/logo_' + idx + '.svg'" style="width: 100%; height: 100%; object-fit: contain;" />
                </span>
              </button>
            </div>
          </div>

          <!-- Payment Section for Manual Registration inside Lounge -->
          <div v-if="activeTournament && activeTournament.fee > 0" class="modal-inner-box payment-inner-box" style="padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
            <h4 style="margin: 0 0 4px 0; font-size: 0.85rem; color: var(--accent-cyan); font-weight: 800;">💸 تفاصيل السداد المالي بالصالة</h4>
            
            <div class="field-v3" style="margin-bottom: 0;">
              <label>حالة السداد للمشترك 💰</label>
              <select v-model="manualPlayerForm.paymentStatus" class="premium-input-v3" style="width: 100%;">
                <option value="unpaid">غير مسدد (معلق بالصالة) ⏳</option>
                <option value="full">مسدد بالكامل ✅</option>
                <option value="partial">مسدد جزئياً (دفعة مقدمة) 💸</option>
              </select>
            </div>

            <!-- Side-by-side if status is partial, otherwise method takes full width -->
            <div v-if="manualPlayerForm.paymentStatus !== 'unpaid'" :style="manualPlayerForm.paymentStatus === 'partial' ? 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' : ''">
              <div class="field-v3" style="margin-bottom: 0;">
                <label>طريقة السداد 💳</label>
                <select v-model="manualPlayerForm.paymentMethod" class="premium-input-v3" style="width: 100%;">
                  <option value="cash">نقداً بالصالة 💵</option>
                  <option value="instapay">انستا باى ⚡</option>
                  <option value="wallet">محفظة كاش 📱</option>
                </select>
              </div>

              <div v-if="manualPlayerForm.paymentStatus === 'partial'" class="field-v3" style="margin-bottom: 0;">
                <label>المبلغ المدفوع حالياً (ج) 💵</label>
                <input type="number" v-model.number="manualPlayerForm.amountPaid" :max="activeTournament.fee" min="1" placeholder="مثال: 20" class="premium-input-v3" style="width: 100%;">
              </div>
            </div>

            <!-- Transaction Details -->
            <div v-if="manualPlayerForm.paymentStatus !== 'unpaid' && (manualPlayerForm.paymentMethod === 'instapay' || manualPlayerForm.paymentMethod === 'wallet')" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="field-v3" style="margin-bottom: 0;">
                <label style="font-size: 0.72rem; padding: 4px 8px;">رقم العملية (TxID) 🔢</label>
                <input type="text" v-model="manualPlayerForm.transactionId" placeholder="اختياري" class="premium-input-v3" style="width: 100%;">
              </div>
              <div class="field-v3" style="margin-bottom: 0;">
                <label style="font-size: 0.72rem; padding: 4px 8px;">الرقم المحول منه 📱</label>
                <input type="text" v-model="manualPlayerForm.senderNumber" placeholder="اختياري" class="premium-input-v3" style="width: 100%;">
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button @click="showAddPlayerModal = false" class="btn secondary-btn" style="flex: 1; border: 1px solid rgba(255,255,255,0.1);">إلغاء ✖</button>
          <button @click="submitManualPlayer" class="btn btn-green-v3 btn-pulse-green" style="flex: 1;">تسجيل المشترك بالبطولة ✅</button>
        </div>
      </div>
    </div>

    <!-- 2. Match Score Update Dialog -->
    <div v-if="showScoreModal" class="modal-overlay" @click.self="showScoreModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content glass-panel" style="max-width: 520px; width: 90%;">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.15rem; color: #fbbf24;">✍️ تسجيل نتيجة وحكم اللقاء</h2>
          <button @click="showScoreModal = false" class="btn-icon">✖</button>
        </div>

        <div class="modal-body-v3" style="padding: 1.5rem 0; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: space-around; gap: 1rem;">
            <!-- Player 1 -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <span class="player-logo-large" :style="getPlayerLogoStyle(activeMatch.player1Id)" style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px;">
                <span v-if="activeMatch.player1Id === 'bye' || !activeMatch.player1Id" style="font-size: 1.5rem;">⭐</span>
                <img v-else :src="getPlayerLogoUrl(activeMatch.player1Id)" style="width: 100%; height: 100%; object-fit: contain;" />
              </span>
              <strong style="font-size: 1rem; color: var(--text-main);">{{ getPlayerNickname(activeMatch.player1Id) }}</strong>
              <input type="number" v-model="matchScore.score1" class="premium-input" style="text-align: center; font-size: 1.8rem; font-weight: 900; width: 80px; padding: 0.5rem; background: rgba(0,0,0,0.4);" min="0">
            </div>

            <div style="font-weight: bold; font-size: 1.5rem; color: var(--text-muted); padding-top: 2rem;">ضد</div>

            <!-- Player 2 -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <span class="player-logo-large" :style="getPlayerLogoStyle(activeMatch.player2Id)" style="width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px;">
                <span v-if="activeMatch.player2Id === 'bye' || !activeMatch.player2Id" style="font-size: 1.5rem;">⭐</span>
                <img v-else :src="getPlayerLogoUrl(activeMatch.player2Id)" style="width: 100%; height: 100%; object-fit: contain;" />
              </span>
              <strong style="font-size: 1rem; color: var(--text-main);">{{ getPlayerNickname(activeMatch.player2Id) }}</strong>
              <input type="number" v-model="matchScore.score2" class="premium-input" style="text-align: center; font-size: 1.8rem; font-weight: 900; width: 80px; padding: 0.5rem; background: rgba(0,0,0,0.4);" min="0">
            </div>
          </div>

          <!-- Tie breaker option if scores are equal (only for Cup knockout matches!) -->
          <div v-if="matchScore.score1 === matchScore.score2 && (activeTournament.type === 'cup' || (activeTournament.type === 'groups_knockout' && !activeMatch.isGroupStage)) && activeMatch.player1Id !== 'bye' && activeMatch.player2Id !== 'bye'" class="tie-breaker-row animate-scale-in" style="margin-top: 1.5rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 12px; width: 100%; box-sizing: border-box;">
            <p style="font-size: 0.8rem; color: #ef4444; font-weight: bold; margin-bottom: 5px; word-break: break-word;">⚠️ تعادل النتيجة في نظام خروج المغلوب! يرجى تحديد الفائز بركلات الترجيح:</p>
            <select v-model="matchScore.winnerId" class="premium-input-mini tie-breaker-select" style="width: 85%; max-width: 100%;">
              <option value="">-- اختر الفائز بركلات الترجيح --</option>
              <option :value="activeMatch.player1Id">{{ getPlayerNickname(activeMatch.player1Id) }} (ركلات الترجيح)</option>
              <option :value="activeMatch.player2Id">{{ getPlayerNickname(activeMatch.player2Id) }} (ركلات الترجيح)</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; gap: 1rem;">
          <button @click="showScoreModal = false" class="btn secondary-btn" style="flex: 1; border: 1px solid rgba(255,255,255,0.1);">إلغاء ✖</button>
          <button @click="submitMatchScore" class="btn btn-green-v3" style="flex: 1;">اعتماد وحفظ النتيجة 🏆</button>
        </div>
      </div>
    </div>

    <!-- 3. Confirm Payment Dialog (Rendered as Centered Popup Modal) -->
    <div v-if="showConfirmPaymentModal" class="modal-overlay" @click.self="showConfirmPaymentModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content glass-panel" style="max-width: 480px; width: 90%;">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.15rem; color: #10b981;">💳 تأكيد سداد قيمة الاشتراك وتفعيل العضوية</h2>
          <button @click="showConfirmPaymentModal = false" class="btn-icon">✖</button>
        </div>

        <div class="modal-body-v3" style="padding: 1rem 0; text-align: right;" v-if="selectedPlayerToConfirm">
          <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 12px; line-height: 1.6;">
            مراجعة وتأكيد تسجيل اللاعب <strong style="color: #06b6d4;">{{ selectedPlayerToConfirm.fullName }}</strong> (الاسم الحركي: <strong>{{ selectedPlayerToConfirm.nickname }}</strong>) بالبطولة.
          </p>

          <div class="modal-info-box" style="background: rgba(0,0,0,0.25); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02); margin-bottom: 1.5rem; font-size: 0.85rem; line-height: 1.6; color: #fff;">
            <div style="margin-bottom: 6px;">💰 <strong>المبلغ المفترض دفعه للبطولة:</strong> <span class="text-highlight-yellow">{{ activeTournament.fee }} ج</span></div>
            <div style="margin-bottom: 6px;">💵 <strong>نوع السداد المرسل من العميل:</strong> <span class="text-highlight-cyan">{{ selectedPlayerToConfirm.paymentType === 'full' ? 'اشتراك كامل' : 'دفعة جزئية (مقدم)' }}</span></div>
            <div style="margin-bottom: 6px;">💸 <strong>المبلغ المرسل (مكتوب بالطلب):</strong> <span class="text-highlight-green">{{ selectedPlayerToConfirm.amountPaid }} ج</span></div>
            <div style="margin-bottom: 6px;">📱 <strong>رقم المحول منه:</strong> <span style="font-family: monospace;">{{ selectedPlayerToConfirm.senderNumber }}</span></div>
            <div>🔢 <strong>رقم العملية المرجعي (TxID):</strong> <span class="text-highlight-yellow" style="font-family: monospace;">{{ selectedPlayerToConfirm.transactionId }}</span></div>
          </div>

          <div class="field-v3" style="margin-bottom: 0;">
            <label>تعديل/تأكيد المبلغ المستلم فعلياً (ج) 💰</label>
            <input type="number" v-model.number="confirmedAmountInput" class="premium-input-v3 modal-amount-input" :max="activeTournament.fee" min="0" placeholder="أدخل القيمة التي وصلت المحفظة بالفعل" style="border: 1px solid rgba(255,255,255,0.08) !important; padding: 8px 12px; border-radius: 8px; width: 100%; box-sizing: border-box; font-size: 1.1rem; font-weight: bold; text-align: center;">
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; display: block; line-height: 1.5;">عند التأكيد، سيتم تفعيل حساب المشترك وتوريد القيمة مباشرة لليومية الحالية.</span>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button @click="showConfirmPaymentModal = false" class="btn secondary-btn" style="flex: 1; border: 1px solid rgba(255,255,255,0.1);">إلغاء ✖</button>
          <button @click="submitConfirmPayment" class="btn btn-green-v3 btn-pulse-green" style="flex: 1;">تأكيد السداد وتفعيل المشترك ✅</button>
        </div>
      </div>
    </div>

    <!-- 4. Collect Remaining Payment Dialog (Rendered as Centered Popup Modal) -->
    <div v-if="showCollectRemainingModal" class="modal-overlay" @click.self="showCollectRemainingModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content glass-panel" style="max-width: 480px; width: 90%;">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.15rem; color: #fbbf24;">💰 تحصيل المبلغ المتبقي من الاشتراك</h2>
          <button @click="showCollectRemainingModal = false" class="btn-icon">✖</button>
        </div>

        <div class="modal-body-v3" style="padding: 1rem 0; text-align: right;" v-if="selectedPlayerToCollect">
          <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 12px; line-height: 1.6;">
            تحصيل المديونية المتبقية وتحديث حالة تسجيل اللاعب <strong style="color: #06b6d4;">{{ selectedPlayerToCollect.fullName }}</strong> (الاسم الحركي: <strong>{{ selectedPlayerToCollect.nickname }}</strong>).
          </p>

          <div class="modal-info-box" style="background: rgba(0,0,0,0.25); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02); margin-bottom: 1.5rem; font-size: 0.85rem; line-height: 1.6; color: #fff;">
            <div style="margin-bottom: 6px;">💰 <strong>رسوم الاشتراك الإجمالية:</strong> <span class="text-highlight-muted">{{ activeTournament.fee }} ج</span></div>
            <div style="margin-bottom: 6px;">💵 <strong>إجمالي المدفوع سابقاً:</strong> <span class="text-highlight-green">{{ selectedPlayerToCollect.amountConfirmed }} ج</span></div>
            <div>🚨 <strong>المبلغ المتبقي المستحق:</strong> <span class="text-highlight-red">{{ selectedPlayerToCollect.remainingAmount }} ج</span></div>
          </div>

          <div class="field-v3" style="margin-bottom: 0;">
            <label>المبلغ المراد سداده حالياً (ج) 💸</label>
            <input type="number" v-model.number="collectAmountInput" class="premium-input-v3 modal-amount-input" :max="selectedPlayerToCollect.remainingAmount" min="1" placeholder="أدخل القيمة المحصلة" style="border: 1px solid rgba(255,255,255,0.08) !important; padding: 8px 12px; border-radius: 8px; width: 100%; box-sizing: border-box; font-size: 1.1rem; font-weight: bold; text-align: center;">
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; display: block; line-height: 1.5;">عند التحصيل، سيتم إدراج هذا المبلغ لليومية الحالية وتخفيض مديونية العضو تلقائياً.</span>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button @click="showCollectRemainingModal = false" class="btn secondary-btn" style="flex: 1; border: 1px solid rgba(255,255,255,0.1);">إلغاء ✖</button>
          <button @click="submitCollectRemaining" class="btn btn-green-v3 btn-pulse-green" style="flex: 1; background: #10b981 !important; color: white !important;">تأكيد التحصيل والسداد 💸✅</button>
        </div>
      </div>
    </div>

    
    <!-- Share Modal -->
    <div v-if="showShareModal && activeTournament" class="modal-overlay" @click.self="showShareModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content share-modal-box" style="max-width: 550px; width: 90%;">
        <div class="modal-header">
          <h2 class="share-modal-title">🔗 خيارات تصدير ومشاركة التقرير</h2>
          <button @click="showShareModal = false" class="btn-icon">✖</button>
        </div>
        <div class="modal-body-v3" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 20px; text-align: center;">
          <p class="share-modal-desc" style="font-size: 0.95rem; margin: 0;">
            اختر أحد الخيارات التالية لمشاركة أو حفظ التقرير الرسمي لتتويج أبطال الصالة:
          </p>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px;">
            <!-- Option 1: PDF -->
            <button @click="handleExportCrowningReportPDF(); showShareModal = false;" class="share-option-card card-pdf">
              <span class="share-icon">📄</span>
              <span class="share-title">تصدير كـ PDF</span>
              <span class="share-desc">حفظ كملف PDF عالي الجودة</span>
            </button>
            
            <!-- Option 2: Image -->
            <button @click="handleExportCrowningReportImage(); showShareModal = false;" class="share-option-card card-image">
              <span class="share-icon">🖼️</span>
              <span class="share-title">تصدير كصورة</span>
              <span class="share-desc">تنزيل صورة PNG بجودة عالية</span>
            </button>
            
            <!-- Option 3: Social Share -->
            <button @click="handleShareSocial(); showShareModal = false;" class="share-option-card card-social">
              <span class="share-icon">🔗</span>
              <span class="share-title">مشاركة اجتماعية</span>
              <span class="share-desc">نسخ التقرير والإرسال للواتساب</span>
            </button>
            
            <!-- Option 4: Print -->
            <button @click="handlePrintCrowningReport(); showShareModal = false;" class="share-option-card card-print">
              <span class="share-icon">🖨️</span>
              <span class="share-title">طباعة التقرير</span>
              <span class="share-desc">إرسال مباشر إلى الطابعة</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tournament Details Modal -->
    <div v-if="showTournamentDetailsModal && activeTournament" class="modal-overlay" @click.self="showTournamentDetailsModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content details-modal-box" style="max-width: 500px; width: 90%;">
        <div class="modal-header">
          <h2 class="details-modal-title">ℹ️ تفاصيل البطولة وجوائزها</h2>
          <button @click="showTournamentDetailsModal = false" class="btn-icon">✖</button>
        </div>
        <div class="modal-body-v3" style="padding: 1rem 0; display: flex; flex-direction: column; gap: 15px;">
          <!-- Financials FIRST -->
          <div v-if="activeTournament.fee > 0" class="details-section">
            <h3 class="details-section-title details-title-green">💰 ملخص الحسابات</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;">
              <div class="stat-card-detail card-green">
                <div class="stat-title">رسوم الاشتراك</div>
                <div class="stat-value">{{ activeTournament.fee }} ج</div>
              </div>
              <div class="stat-card-detail card-blue">
                <div class="stat-title">عدد المشتركين</div>
                <div class="stat-value">{{ activeTournament.players?.filter(p => !p.isPendingApproval).length || 0 }}</div>
              </div>
              <div class="stat-card-detail card-rose">
                <div class="stat-title">إجمالي التحصيلات</div>
                <div class="stat-value">
                  {{ (activeTournament.players || []).reduce((sum, p) => sum + (p.amountConfirmed || 0), 0) }} ج
                </div>
              </div>
              <div class="stat-card-detail card-amber">
                <div class="stat-title">المتبقي للدفع</div>
                <div class="stat-value">
                  {{ (activeTournament.players || []).reduce((sum, p) => sum + (p.remainingAmount || 0), 0) }} ج
                </div>
              </div>
            </div>
          </div>
          <!-- Prizes SECOND -->
          <div v-if="activeTournament.prizesList && activeTournament.prizesList.length" class="details-section">
            <h3 class="details-section-title details-title-cyan">🏆 الجوائز المعتمدة</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="(p, i) in activeTournament.prizesList" :key="i" class="prize-row-detail">
                <span class="prize-label-detail">{{ p.label }}</span>
                <span class="prize-value-detail">{{ p.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- 5. Financial Accounts Summary Modal -->
    <div v-if="showAccountsModal" class="modal-overlay" @click.self="showAccountsModal = false" style="direction: rtl; z-index: 1000000 !important;">
      <div class="modal-content glass-panel" style="max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.2rem; color: #06b6d4; display: flex; align-items: center; gap: 8px; margin: 0;">
            <span>📊 كشف الحساب المالي والتدفقات النقدية للبطولات</span>
          </h2>
          <button @click="showAccountsModal = false" class="btn-icon">✖</button>
        </div>

        <div class="modal-body-v3" style="padding: 1rem 0;">
          <div class="table-container" style="max-height: 45vh; overflow-y: auto; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; background: rgba(0,0,0,0.15);">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
              <thead>
                <tr style="border-bottom: 2px solid rgba(255,255,255,0.08); color: #64748b; background: rgba(0,0,0,0.2);">
                  <th style="text-align: right; padding: 12px 10px;">اسم البطولة</th>
                  <th style="text-align: center; padding: 12px 10px;">الرسوم</th>
                  <th style="text-align: center; padding: 12px 10px;">المشاركين</th>
                  <th style="text-align: center; padding: 12px 10px;">الإيراد المتوقع</th>
                  <th style="text-align: center; padding: 12px 10px;">المؤكد تحصيله</th>
                  <th style="text-align: center; padding: 12px 10px;">قيد المراجعة (معلق)</th>
                  <th style="text-align: center; padding: 12px 10px;">المتبقي غير المحصل</th>
                  <th style="text-align: center; padding: 12px 10px;">تم توريده للخزنة</th>
                  <th style="text-align: center; padding: 12px 10px;">إجراء محاسبي</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in store.tournaments" :key="t.id" class="accounts-table-row">
                  <td style="text-align: right; font-weight: bold; padding: 12px 10px; font-size: 0.88rem;" class="td-tournament-name">{{ t.name }}</td>
                  <td style="text-align: center; font-weight: bold; padding: 12px 10px;" class="text-highlight-yellow">{{ t.fee }} ج</td>
                  <td style="text-align: center; padding: 12px 10px;" class="text-highlight-muted">{{ t.players?.filter(p => !p.isPendingApproval).length || 0 }} / {{ t.maxPlayers }}</td>
                  
                  <!-- المتوقع -->
                  <td style="text-align: center; font-weight: bold; padding: 12px 10px;" class="text-highlight-muted">
                    {{ (t.players?.filter(p => !p.isPendingApproval).length || 0) * t.fee }} ج
                  </td>

                  <!-- المؤكد -->
                  <td style="text-align: center; font-weight: bold; padding: 12px 10px;" class="text-highlight-green">
                    {{ t.players?.reduce((sum, p) => sum + (p.amountConfirmed || 0), 0) || 0 }} ج
                  </td>

                  <!-- المعلق -->
                  <td style="text-align: center; font-weight: bold; padding: 12px 10px;" class="text-highlight-yellow">
                    {{ t.players?.filter(p => p.isPendingApproval).reduce((sum, p) => sum + (p.amountPaid || 0), 0) || 0 }} ج
                  </td>

                  <!-- المتبقي -->
                  <td style="text-align: center; font-weight: bold; padding: 12px 10px;" class="text-highlight-red">
                    {{ t.players?.reduce((sum, p) => sum + (p.remainingAmount || 0), 0) || 0 }} ج
                  </td>

                  <!-- المورد المؤرشف -->
                  <td style="text-align: center; font-weight: bold; padding: 12px 10px;" class="text-highlight-cyan">
                    {{ t.players?.reduce((sum, p) => sum + (p.amountArchived || 0), 0) || 0 }} ج
                  </td>

                  <!-- إجراءات الأرشفة والتوريد -->
                  <td style="text-align: center; padding: 12px 10px; white-space: nowrap;">
                    <button 
                      v-if="hasUnarchivedPayments(t)" 
                      @click="archiveTournamentPayments(t)" 
                      class="btn btn-green-v3" 
                      style="padding: 0.25rem 0.6rem; font-size: 0.72rem; font-weight: bold;"
                    >
                      📥 أرشفة وتوريد
                    </button>
                    <span v-else class="text-highlight-green" style="font-size: 0.75rem; font-weight: bold;">مورد بالكامل ✅</span>
                  </td>
                </tr>
                <tr v-if="store.tournaments.length === 0">
                  <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">لا توجد أي بطولات نشطة حالياً لرصد حساباتها.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- إجماليات عامة -->
          <div v-if="store.tournaments.length > 0" class="modal-summary-footer" style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 15px; border-radius: 12px; text-align: center;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 4px;">إجمالي الإيراد المؤكد</span>
              <span style="font-size: 1.3rem; font-weight: 900;" class="text-highlight-green">{{ totalConfirmedPaidAll }} ج</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 4px;">إجمالي المعلق قيد المراجعة</span>
              <span style="font-size: 1.3rem; font-weight: 900;" class="text-highlight-yellow">{{ totalPendingPaidAll }} ج</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 4px;">إجمالي المتبقي المستحق</span>
              <span style="font-size: 1.3rem; font-weight: 900;" class="text-highlight-red">{{ totalRemainingPaidAll }} ج</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 4px;">إجمالي المورد للخزنة</span>
              <span style="font-size: 1.3rem; font-weight: 900;" class="text-highlight-cyan">{{ totalArchivedPaidAll }} ج</span>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
          <button @click="showAccountsModal = false" class="btn secondary-btn" style="padding: 0.5rem 2.5rem; border: 1px solid rgba(255,255,255,0.1);">إغلاق ✖</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';
import axios from 'axios';
import { printCrowningReport, exportTournamentReportAsPDF, exportTournamentReportAsImage } from '../../utils/printSystem';

const store = useAppStore();
const ui = useUIStore();

const localIp = ref('127.0.0.1');
const tunnelUrl = ref(null);
const startingTunnel = ref(false);

const wifiUrlInput = ref(null);
const cloudUrlInput = ref(null);
const cloudPagesUrlInput = ref(null);

const showAddPlayerModal = ref(false);
const showScoreModal = ref(false);
const viewMode = ref(null);
const selectedLeagueRound = ref(0);

// Selection state for multiple tournaments sidebar
const selectedTournamentId = ref(localStorage.getItem('classico_last_selected_tournament_id') || null);
const showShareModal = ref(false);
const showTournamentDetailsModal = ref(false);
const showCreateForm = ref(false);

// Fetch active tournament
const activeTournament = computed(() => {
  if (!store.tournaments || store.tournaments.length === 0) return null;
  if (selectedTournamentId.value) {
    return store.tournaments.find(t => t && t.id === selectedTournamentId.value) || null;
  }
  return null;
});
const tournamentNameInputRef = ref(null);
const isNameInputFlashing = ref(false);
const groupsStageTab = ref('groups');

const advancingPlayers = ref({});

// Payment Approval & Billing Modal Refs
const showAccountsModal = ref(false);
const showConfirmPaymentModal = ref(false);
const showCollectRemainingModal = ref(false);
const selectedPlayerToConfirm = ref(null);
const selectedPlayerToCollect = ref(null);
const confirmedAmountInput = ref(0);
const collectAmountInput = ref(0);

const playerSearchQuery = ref('');

const filteredPlayers = computed(() => {
  if (!activeTournament.value || !activeTournament.value.players) return [];
  const q = playerSearchQuery.value.trim().toLowerCase();
  if (!q) return activeTournament.value.players;
  return activeTournament.value.players.filter(p => {
    if (!p) return false;
    const fullName = (p.fullName || '').toLowerCase();
    const nickname = (p.nickname || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return fullName.includes(q) || nickname.includes(q) || phone.includes(q);
  });
});

watch(selectedTournamentId, (newId) => {
  playerSearchQuery.value = '';
  viewMode.value = null;
  if (newId) {
    localStorage.setItem('classico_last_selected_tournament_id', newId);
  } else {
    localStorage.removeItem('classico_last_selected_tournament_id');
  }
});

// Handlers for payments
const openConfirmPaymentDialog = (p) => {
  selectedPlayerToConfirm.value = p;
  confirmedAmountInput.value = p.amountPaid || activeTournament.value.fee;
  showConfirmPaymentModal.value = true;
};

const submitConfirmPayment = () => {
  if (!selectedPlayerToConfirm.value) return;
  const amt = Number(confirmedAmountInput.value);
  if (isNaN(amt) || amt < 0 || amt > activeTournament.value.fee) {
    ui.showToast(`يرجى كتابة مبلغ صحيح لا يزيد عن رسوم الاشتراك بالبطولة (${activeTournament.value.fee} ج)!`, 'warning');
    return;
  }
  store.confirmPlayerPayment(activeTournament.value.id, selectedPlayerToConfirm.value.id, amt);
  showConfirmPaymentModal.value = false;
  ui.showToast(`تم تأكيد السداد وتفعيل مشاركة اللاعب ${selectedPlayerToConfirm.value.nickname} بالقرعة بنجاح! 💳🟢`, 'success');
  // sync cloud backup if online mode
  if (typeof syncCloudPlayers === 'function') {
    syncCloudPlayers(true);
  }
};

const handleRejectPendingPlayer = async (p) => {
  const confirmed = await ui.confirm({
    title: 'رفض وإلغاء التسجيل المعلق',
    message: `هل أنت متأكد تماماً من رغبتك في رفض وإزالة طلب العميل المعلق ${p.fullName} لعدم صحة التحويل؟`,
    type: 'danger'
  });
  if (confirmed) {
    store.rejectPendingPlayer(activeTournament.value.id, p.id);
    ui.showToast('تم رفض وإلغاء طلب التسجيل بنجاح.', 'info');
  }
};

const openCollectRemainingDialog = (p) => {
  selectedPlayerToCollect.value = p;
  collectAmountInput.value = p.remainingAmount || 0;
  showCollectRemainingModal.value = true;
};

const submitCollectRemaining = () => {
  if (!selectedPlayerToCollect.value) return;
  const amt = Number(collectAmountInput.value);
  if (isNaN(amt) || amt <= 0 || amt > selectedPlayerToCollect.value.remainingAmount) {
    ui.showToast(`يرجى كتابة مبلغ تحصيل صحيح لا يتجاوز المتبقي المستحق (${selectedPlayerToCollect.value.remainingAmount} ج)!`, 'warning');
    return;
  }
  store.collectRemainingPayment(activeTournament.value.id, selectedPlayerToCollect.value.id, amt);
  showCollectRemainingModal.value = false;
  ui.showToast(`تم تحصيل المتبقي وتوريد القيمة لدفتر اليومية بنجاح! 🎯💰`, 'success');
};

const hasUnarchivedPayments = (t) => {
  return (t.players || []).some(p => p.amountConfirmed > 0 && p.amountConfirmed > (p.amountArchived || 0));
};

const archiveTournamentPayments = async (t) => {
  const confirmed = await ui.confirm({
    title: 'أرشفة وتوريد مقبوضات البطولة',
    message: `هل أنت متأكد من رغبتك في أرشفة وترحيل المبالغ المؤكدة للبطولة "${t.name}" وتوريدها للخزينة الآن؟`,
    type: 'success'
  });
  if (confirmed) {
    const success = store.archiveConfirmedPayments(t.id);
    if (success) {
      ui.showToast('تم أرشفة المبالغ وتوريدها لحسابات الوردية بنجاح! 📥✅', 'success');
    } else {
      ui.showToast('لا توجد دفعات مؤكدة جديدة غير مؤرشفة للبطولة.', 'info');
    }
  }
};

// Sum calculations across all current tournaments
const totalConfirmedPaidAll = computed(() => {
  return store.tournaments.reduce((sum, t) => {
    return sum + (t.players?.reduce((s, p) => s + (p.amountConfirmed || 0), 0) || 0);
  }, 0);
});

const totalPendingPaidAll = computed(() => {
  return store.tournaments.reduce((sum, t) => {
    return sum + (t.players?.filter(p => p.isPendingApproval).reduce((s, p) => s + (p.amountPaid || 0), 0) || 0);
  }, 0);
});

const totalRemainingPaidAll = computed(() => {
  return store.tournaments.reduce((sum, t) => {
    return sum + (t.players?.reduce((s, p) => s + (p.remainingAmount || 0), 0) || 0);
  }, 0);
});

const totalArchivedPaidAll = computed(() => {
  return store.tournaments.reduce((sum, t) => {
    return sum + (t.players?.reduce((s, p) => s + (p.amountArchived || 0), 0) || 0);
  }, 0);
});

const initAdvancingState = () => {
  if (!activeTournament.value || activeTournament.value.type !== 'groups_knockout') return;
  const state = {};
  const standings = groupStandings.value;
  Object.keys(standings).forEach(groupName => {
    const list = standings[groupName] || [];
    list.forEach((p, idx) => {
      state[p.id] = idx < 2;
    });
  });
  advancingPlayers.value = state;
};

const computedAdvancingCount = computed(() => {
  let count = 0;
  Object.keys(advancingPlayers.value).forEach(pId => {
    if (advancingPlayers.value[pId]) count++;
  });
  return count;
});

const createForm = reactive({
  name: '',
  fee: 50,
  maxPlayers: 8,
  type: 'cup',
  groupsCount: 4,
  playersPerGroup: 4,
  paymentNumber: '',
  paymentNumberInstapay: '',
  paymentNumberWallet: '',
  paymentNumberCash: 'الدفع نقداً بالصالة عند الكاونتر',
  paymentMethod: 'both',
  prizesList: [
    { label: 'المركز الأول 🥇', value: '1000 ج + الميدالية الذهبية' },
    { label: 'المركز الثاني 🥈', value: '500 ج' },
    { label: 'المركز الثالث 🥉', value: '250 ج' }
  ]
});

const addPrizeSlot = () => {
  createForm.prizesList.push({ label: `جائزة مركز مخصص`, value: '' });
};

const removePrizeSlot = (idx) => {
  createForm.prizesList.splice(idx, 1);
};

const manualPlayerForm = reactive({
  fullName: '',
  nickname: '',
  phone: '',
  logoId: 0,
  paymentStatus: 'unpaid',
  paymentMethod: 'cash',
  amountPaid: 0,
  senderNumber: '',
  transactionId: ''
});

const activeMatch = ref(null);
const matchScore = reactive({
  score1: 0,
  score2: 0,
  winnerId: ''
});

// Curated 64 professional logo symbols (European clubs, Arab clubs, national teams, esports)
const CURATED_LOGOS = [
  // 1. European Clubs
  { symbol: '🇪🇸👑', name: 'ريال مدريد (Real Madrid)' },
  { symbol: '🇪🇸🔵', name: 'برشلونة (FC Barcelona)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🔴', name: 'ليفربول (Liverpool)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🔵', name: 'مانشستر سيتي (Manchester City)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿😈', name: 'مانشستر يونايتد (Manchester United)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🦁', name: 'تشيلسي (Chelsea)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🔫', name: 'أرسنال (Arsenal)' },
  { symbol: '🇩🇪🦁', name: 'بايرن ميونخ (Bayern Munich)' },
  { symbol: '🇮🇹🔴', name: 'ميلان (AC Milan)' },
  { symbol: '🇮🇹🔵', name: 'إنتر ميلان (Inter Milan)' },
  { symbol: '🇮🇹🦓', name: 'يوفنتوس (Juventus)' },
  { symbol: '🇫🇷🗼', name: 'باريس سان جيرمان (PSG)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🐓', name: 'توتنهام (Tottenham)' },
  { symbol: '🇪🇸🦇', name: 'أتلتيكو مدريد (Atletico Madrid)' },
  { symbol: '🇩🇪🐝', name: 'بوروسيا دورتموند (Dortmund)' },
  { symbol: '🇮🇹🦅', name: 'لاتسيو (Lazio)' },
  { symbol: '🇮🇹🐺', name: 'روما (AS Roma)' },
  { symbol: '🇵🇹🦅', name: 'بنفيكا (Benfica)' },

  // 2. Egyptian & Arab Clubs
  { symbol: '🇪🇬🦅', name: 'الأهلي المصري (Al Ahly)' },
  { symbol: '🇪🇬🏹', name: 'الزمالك المصري (Zamalek)' },
  { symbol: '🇸🇦🔵', name: 'الهلال السعودي (Al Hilal)' },
  { symbol: '🇸🇦🟡', name: 'النصر السعودي (Al Nassr)' },
  { symbol: '🇸🇦🐯', name: 'الاتحاد السعودي (Al Ittihad)' },
  { symbol: '🇦🇪🏰', name: 'العين الإماراتي (Al Ain)' },
  { symbol: '🇪🇬⚽', name: 'بيراميدز (Pyramids FC)' },
  { symbol: '🇸🇦🟢', name: 'الأهلي السعودي (Al Ahli)' },
  { symbol: '🇸🇦🦁', name: 'الشباب السعودي (Al Shabab)' },
  { symbol: '🇲🇦🔴', name: 'الوداد المغربي (Wydad)' },
  { symbol: '🇲🇦🟢', name: 'الرجاء المغربي (Raja)' },
  { symbol: '🇹🇳🔴', name: 'الترجي التونسي (Esperance)' },

  // 3. National Teams
  { symbol: '🇪🇬🏆', name: 'منتخب مصر (Egypt)' },
  { symbol: '🇲🇦🦁', name: 'منتخب المغرب (Morocco)' },
  { symbol: '🇸🇦💚', name: 'منتخب السعودية (Saudi Arabia)' },
  { symbol: '🇧🇷⚽', name: 'منتخب البرازيل (Brazil)' },
  { symbol: '🇦🇷⭐', name: 'منتخب الأرجنتين (Argentina)' },
  { symbol: '🇫🇷🐓', name: 'منتخب فرنسا (France)' },
  { symbol: '🇩🇪⚽', name: 'منتخب ألمانيا (Germany)' },
  { symbol: '🇪🇸🏆', name: 'منتخب إسبانيا (Spain)' },
  { symbol: '🇮🇹🛡️', name: 'منتخب إيطاليا (Italy)' },
  { symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🦁', name: 'منتخب إنجلترا (England)' },
  { symbol: '🇵🇹⚡', name: 'منتخب البرتغال (Portugal)' },
  { symbol: '🇳🇱🇳🇱', name: 'منتخب هولندا (Netherlands)' },
  { symbol: '🇩🇿🦊', name: 'منتخب الجزائر (Algeria)' },
  { symbol: '🇹🇳🦅', name: 'منتخب تونس (Tunisia)' },
  { symbol: '🇸🇪🟡', name: 'منتخب السويد (Sweden)' },
  { symbol: '🇧🇪😈', name: 'منتخب بلجيكا (Belgium)' },
  { symbol: '🇺🇾⭐', name: 'منتخب أوروغواي (Uruguay)' },
  { symbol: '🇭🇷⚡', name: 'منتخب كرواتيا (Croatia)' },
  { symbol: '🇯🇵🇯🇵', name: 'منتخب اليابان (Japan)' },
  { symbol: '🇰🇷🇰🇷', name: 'منتخب كوريا الجنوبية (South Korea)' },
  { symbol: '🇸🇳🦁', name: 'منتخب السنغال (Senegal)' },
  { symbol: '🇨🇲🦁', name: 'منتخب الكاميرون (Cameroon)' },

  // 4. Special Football & eSports Symbols
  { symbol: '⚽🔥', name: 'الكرة النارية' },
  { symbol: '⚽⚡', name: 'كرة البرق' },
  { symbol: '⚽👑', name: 'الكرة الذهبية' },
  { symbol: '🏆✨', name: 'كأس كلاسيكو الذهبي' },
  { symbol: '👟✨', name: 'حذاء الهداف الذهبي' },
  { symbol: '🧤🥅', name: 'قفاز الحارس الذهبي' },
  { symbol: '🎮🔥', name: 'الألعاب النارية' },
  { symbol: '🎮⚡', name: 'الألعاب الصاعقة' },
  { symbol: '👑✨', name: 'تاج البطولة' },
  { symbol: '🐉🔥', name: 'التنين الأحمر' },
  { symbol: '🦅⚡', name: 'الصقر الإلكتروني' },
  { symbol: '🦁👑', name: 'الأسد الملك' }
];


const GRADIENTS = [
  'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  'linear-gradient(135deg, #f6d365 0%, #b45309 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)'
];

const GLOWS = [
  'rgba(0, 242, 254, 0.4)', 'rgba(255, 8, 68, 0.4)', 'rgba(102, 126, 234, 0.4)', 'rgba(246, 211, 101, 0.4)', 'rgba(245, 87, 108, 0.4)', 'rgba(180, 83, 9, 0.4)', 'rgba(16, 185, 129, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(30, 60, 114, 0.4)', 'rgba(249, 115, 22, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(139, 92, 246, 0.4)'
];

const getLogoStyle = (idx) => {
  const gIdx = (idx || 0) % 12;
  const glowColor = GLOWS[gIdx];
  const borderColor = glowColor.replace('0.4', '0.85');
  return {
    background: 'rgba(11, 19, 38, 0.88)',
    border: `2px solid ${borderColor}`,
    boxShadow: `0 0 10px ${glowColor}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
};

const getLogoSymbol = (idx) => {
  if (idx === null || idx === undefined || idx < 0 || idx >= CURATED_LOGOS.length) return '🏆';
  return CURATED_LOGOS[idx].symbol;
};

const isLogoTaken = (logoIdx) => {
  if (!activeTournament.value?.players) return false;
  return activeTournament.value.players.some(p => p && Number(p.logoId) === Number(logoIdx));
};

watch(showAddPlayerModal, (newVal) => {
  if (newVal && activeTournament.value) {
    const takenLogos = new Set((activeTournament.value.players || []).map(p => Number(p.logoId)));
    let firstAvail = 0;
    for (let i = 0; i < CURATED_LOGOS.length; i++) {
      if (!takenLogos.has(i)) {
        firstAvail = i;
        break;
      }
    }
    manualPlayerForm.logoId = firstAvail;
  }
});

// URL endpoints mapping
const API_BASE = window.location.origin && !window.location.origin.includes('file://') 
  ? `${window.location.origin}/api` 
  : 'http://localhost:3000/api';

const localWifiUrl = computed(() => {
  return `http://${localIp.value}:3000/tournaments/register`;
});

const cloudPagesUrl = computed(() => {
  if (!store.machineId || !activeTournament.value) return '';
  return `https://emontal60.github.io/Classico-Pro/#/tournaments/register?mid=${encodeURIComponent(store.machineId.toUpperCase().trim())}&tid=${activeTournament.value.id}`;
});

const getPlayerNickname = (id) => {
  if (id === 'bye') return 'تأهل تلقائي ⭐';
  if (!id) return '---';
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? player.nickname : '---';
};

const getPlayerFullName = (id) => {
  if (id === 'bye' || !id) return '---';
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? player.fullName : '---';
};

const getPlayerLogoSymbol = (id) => {
  if (id === 'bye' || !id) return '⭐';
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? getLogoSymbol(player.logoId) : '❓';
};

const getPlayerLogoUrl = (id) => {
  if (id === 'bye' || !id) return '';
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? `logos/logo_${player.logoId}.svg` : '';
};

const getPlayerLogoStyle = (id) => {
  if (id === 'bye' || !id) return { background: 'rgba(255,255,255,0.05)', boxShadow: 'none' };
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? getLogoStyle(player.logoId) : {};
};

// Cup Brackets rounds
const cupRounds = computed(() => {
  if (!activeTournament.value || !activeTournament.value.matches.length) return [];
  
  const isCup = activeTournament.value.type === 'cup';
  const isGroupsKo = activeTournament.value.type === 'groups_knockout' && activeTournament.value.stage === 'knockout';
  
  if (!isCup && !isGroupsKo) return [];
  
  // Filter matches to only knockout matches
  const matches = activeTournament.value.matches.filter(m => !m.isGroupStage);
  if (matches.length === 0) return [];
  
  const maxRound = Math.max(...matches.map(m => m.roundIndex));
  
  const rounds = [];
  for (let r = 0; r <= maxRound; r++) {
    let name = `دور الـ ${Math.pow(2, maxRound - r + 1)}`;
    if (maxRound - r === 2) name = 'ربع النهائي 🏆';
    if (maxRound - r === 1) name = 'نصف النهائي 🏆';
    if (maxRound - r === 0) name = 'المباراة النهائية 🥇';

    rounds.push({
      index: r,
      name,
      matches: matches.filter(m => m.roundIndex === r)
    });
  }
  return rounds;
});

// Symmetric cup bracket tree structure
const symmetricCupRounds = computed(() => {
  const rounds = cupRounds.value;
  if (rounds.length === 0) return null;
  
  const maxRoundIdx = rounds.length - 1;
  const finalRound = rounds[maxRoundIdx];
  const finalMatch = finalRound?.matches[0] || null;
  
  const leftRounds = [];
  const rightRounds = [];
  
  for (let r = 0; r < maxRoundIdx; r++) {
    const round = rounds[r];
    const totalMatches = round.matches.length;
    
    const leftMatches = round.matches.filter(m => m.matchIndex < totalMatches / 2);
    const rightMatches = round.matches.filter(m => m.matchIndex >= totalMatches / 2);
    
    leftRounds.push({
      index: r,
      name: round.name,
      matches: leftMatches
    });
    
    rightRounds.push({
      index: r,
      name: round.name,
      matches: rightMatches
    });
  }
  
  const rightRoundsReversed = [...rightRounds].reverse();
  
  return {
    leftRounds,
    rightRoundsReversed,
    finalMatch,
    finalRoundName: finalRound?.name || 'المباراة النهائية'
  };
});

// Group stage calculations
const groupStandings = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'groups_knockout') return {};
  
  const groups = activeTournament.value.groups || {};
  const matches = activeTournament.value.matches || [];
  const standings = {};
  
  Object.keys(groups).forEach(groupName => {
    const playersInGroup = groups[groupName];
    
    standings[groupName] = playersInGroup.map(p => {
      const pMatches = matches.filter(m => m.isGroupStage && m.groupName === groupName && m.played && (m.player1Id === p.id || m.player2Id === p.id));
      let won = 0, drawn = 0, lost = 0, points = 0, goalsFor = 0, goalsAgainst = 0;
      
      pMatches.forEach(m => {
        const isPlayer1 = m.player1Id === p.id;
        const pScore = isPlayer1 ? m.player1Score : m.player2Score;
        const oppScore = isPlayer1 ? m.player2Score : m.player1Score;
        
        goalsFor += Number(pScore) || 0;
        goalsAgainst += Number(oppScore) || 0;
        
        if (m.winnerId === 'draw') {
          drawn++;
          points += 1;
        } else if (m.winnerId === p.id) {
          won++;
          points += 3;
        } else {
          lost++;
        }
      });
      
      return {
        ...p,
        played: pMatches.length,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        gd: goalsFor - goalsAgainst,
        points
      };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.goalsFor - a.goalsFor;
    });
  });
  
  return standings;
});

const groupMatchesByGroup = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'groups_knockout') return {};
  
  const matches = activeTournament.value.matches || [];
  const grouped = {};
  
  matches.filter(m => m.isGroupStage).forEach(m => {
    const gn = m.groupName || 'A';
    if (!grouped[gn]) grouped[gn] = [];
    grouped[gn].push(m);
  });
  
  return grouped;
});

// League stats

const leagueLeaderboard = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'league') return [];
  
  const players = activeTournament.value.players.filter(p => p && !p.isPendingApproval);
  const matches = activeTournament.value.matches;

  const stats = players.map(p => {
    const pMatches = matches.filter(m => m.played && (m.player1Id === p.id || m.player2Id === p.id));
    let won = 0, drawn = 0, lost = 0, points = 0;

    pMatches.forEach(m => {
      if (m.winnerId === 'draw') {
        drawn++;
        points += 1;
      } else if (m.winnerId === p.id) {
        won++;
        points += 3;
      } else {
        lost++;
      }
    });

    return {
      ...p,
      played: pMatches.length,
      won,
      drawn,
      lost,
      points
    };
  });

  return stats.sort((a, b) => b.points - a.points);
});

const totalLeagueRoundsCount = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'league' || !activeTournament.value.matches.length) return 0;
  return Math.max(...activeTournament.value.matches.map(m => m.roundIndex)) + 1;
});

const selectedRoundMatches = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'league' || !activeTournament.value.matches.length) return [];
  return activeTournament.value.matches.filter(m => m.roundIndex === selectedLeagueRound.value);
});

// Creation Actions
const adjustPlayerLimit = () => {
  if (createForm.type === 'cup') createForm.maxPlayers = 8;
  else createForm.maxPlayers = 10;
};

const triggerCreateFormFocus = () => {
  showCreateForm.value = true;
  ui.showToast('قم بإنشاء إعدادات البطولة 🏆', 'warning');
  
  setTimeout(() => {
    if (tournamentNameInputRef.value) {
      tournamentNameInputRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tournamentNameInputRef.value.focus();
      isNameInputFlashing.value = true;
      setTimeout(() => {
        isNameInputFlashing.value = false;
      }, 1500);
    }
  }, 100);
};


const handleCreateTournament = () => {
  if (!createForm.name.trim()) {
    ui.showToast('يرجى كتابة اسم للبطولة أولاً!', 'warning');
    return;
  }
  
  // Filter out empty prize values
  const filteredPrizes = createForm.prizesList.filter(p => p.value.trim() !== '');
  // Compile into a readable multi-line text for backward compatibility
  const compiledPrizesText = filteredPrizes.map(p => `${p.label}: ${p.value}`).join('\r\n');

  const legacyPaymentNumber = createForm.paymentMethod === 'instapay' 
    ? createForm.paymentNumberInstapay.trim() 
    : createForm.paymentMethod === 'wallet'
      ? createForm.paymentNumberWallet.trim()
      : createForm.paymentMethod === 'cash' 
        ? createForm.paymentNumberCash.trim() 
        : `${createForm.paymentNumberInstapay.trim()} / ${createForm.paymentNumberWallet.trim()}`;

  const newTournamentId = store.createTournament({
    name: createForm.name.trim(),
    fee: Number(createForm.fee) || 0,
    maxPlayers: Number(createForm.maxPlayers) || 8,
    type: createForm.type,
    prizes: compiledPrizesText,
    prizesList: filteredPrizes,
    paymentNumber: legacyPaymentNumber,
    paymentNumberInstapay: createForm.paymentNumberInstapay.trim(),
    paymentNumberWallet: createForm.paymentNumberWallet.trim(),
    paymentNumberCash: createForm.paymentNumberCash.trim(),
    paymentMethod: createForm.paymentMethod
  });

  if (newTournamentId) {
    selectedTournamentId.value = newTournamentId;
    showCreateForm.value = false;
    viewMode.value = 'players';
    initAdvancingState();
  }

  ui.showToast('تم إنشاء ملف البطولة وتفعيله بنجاح! 🏆', 'success');
};

const handleDeleteTournament = async () => {
  if (!activeTournament.value) return;

  const players = activeTournament.value.players || [];
  const paidPlayers = players.filter(p => p && p.amountConfirmed > 0);
  const unpaidPlayers = players.filter(p => p && p.remainingAmount > 0);
  
  let warningMessage = 'تنبيه خطير: هل أنت متأكد تماماً من رغبتك في إلغاء وحذف هذه البطولة وكافة بيانات اللاعبين المسجلين نهائياً؟';
  let hasPaidPlayers = paidPlayers.length > 0;
  let hasUnpaidPlayers = unpaidPlayers.length > 0;

  if (hasUnpaidPlayers) {
    const totalRemaining = unpaidPlayers.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
    warningMessage = `تنبيه مالي هام ⚠️: يوجد لاعبين لم يكملوا سداد اشتراكهم بعد! المبالغ المتبقية غير المحصلة هي [ ${totalRemaining} ج ] لـ ${unpaidPlayers.length} لاعبين.\r\n\r\n${warningMessage}`;
  }

  if (hasPaidPlayers) {
    const totalRefund = paidPlayers.reduce((sum, p) => sum + (p.amountConfirmed || 0), 0);
    const playersListText = paidPlayers.map(p => `- ${p.nickname} (سدد: ${p.amountConfirmed} ج)`).join('\r\n');
    warningMessage = `تنبيه مالي ⚠️: هذه البطولة تحتوي على مبالغ تم تحصيلها بالفعل بقيمة إجمالية قدرها [ ${totalRefund} ج ] لـ ${paidPlayers.length} لاعبين:\r\n${playersListText}\r\n\r\nهل تريد حذف البطولة وتأكيد ترحيل هذه المبالغ كمرتجع مالي لخصمها من خزينة الوردية الحالية؟ (اختر إلغاء إذا كنت تريد الحذف فقط دون ترحيل المرتجع المالي)`;
  }

  const confirmed = await ui.confirm({
    title: hasPaidPlayers ? 'تنبيه مالي وحذف البطولة' : 'إلغاء وحذف البطولة',
    message: warningMessage,
    type: 'danger'
  });

  if (confirmed) {
    const deletedTournamentId = activeTournament.value.id;
    const deletedTournamentName = activeTournament.value.name;

    // Register refunds to current shift if confirmed and there are paid players
    if (hasPaidPlayers) {
      paidPlayers.forEach(p => {
        if (!store.tournamentsHistory) store.tournamentsHistory = [];
        store.tournamentsHistory.push({
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
          playerName: p.fullName,
          nickname: p.nickname,
          tournamentName: `${deletedTournamentName} (مرتجع حذف البطولة)`,
          amount: -p.amountConfirmed, // Negative amount representing refund!
          timestamp: new Date().toISOString(),
          processedBy: store.session?.username || 'admin'
        });
      });
      store.addActivity('مرتجع حذف بطولة', `تم تسجيل مرتجعات مالية لبطولة ${deletedTournamentName}`);
    }

    // 1. Delete locally first
    store.deleteTournament(deletedTournamentId);
    ui.showToast('تم حذف وإلغاء البطولة وتسجيل المرتجعات محلياً، جاري مزامنة الحذف مع السحابة...', 'info');

    // 2. Push deletion to Supabase immediately (remove ONLY this tournament, keep all others intact)
    if (navigator.onLine !== false && store.machineId) {
      try {
        const { getSupabaseClient } = await import('../../utils/supabase');
        const supabase = getSupabaseClient(store.machineId);
        
        // Fetch current cloud data to get the full payload
        const { data: cloudRow, error: fetchError } = await supabase
          .from('cloud_backups')
          .select('data')
          .eq('machine_id', store.machineId.toUpperCase().trim())
          .single();

        if (!fetchError && cloudRow?.data) {
          const cloudPayload = cloudRow.data;
          
          // Remove ONLY the deleted tournament — all other tournaments are untouched
          const updatedTournaments = (cloudPayload.classico_tournaments || [])
            .filter(t => t && t.id !== deletedTournamentId);

          // Update the cloud with the new tournaments list (other tournaments fully preserved)
          const { error: updateError } = await supabase
            .from('cloud_backups')
            .update({
              data: {
                ...cloudPayload,
                classico_tournaments: updatedTournaments
              },
              updated_at: new Date().toISOString()
            })
            .eq('machine_id', store.machineId.toUpperCase().trim());

          if (!updateError) {
            ui.showToast(`✅ تم حذف بطولة "${deletedTournamentName}" بالكامل من السحابة.`, 'success');
          } else {
            console.error('[Cloud Delete] Supabase update error:', updateError);
            ui.showToast('⚠️ تم الحذف محلياً لكن فشل تحديث السحابة. يرجى المزامنة يدوياً.', 'warning');
          }
        }
      } catch (err) {
        console.error('[Cloud Delete Error]', err);
        ui.showToast('⚠️ تم الحذف محلياً لكن تعذر الاتصال بالسحابة.', 'warning');
      }
    }
  }
};

// Player Management actions
const handleMarkPaid = async (p) => {
  const success = store.markPlayerPaid(activeTournament.value.id, p.id);
  if (success) {
    ui.showToast(`تم تسجيل سداد اشتراك اللاعب ${p.nickname} بقيمة ${activeTournament.value.fee} ج وترحيل المعاملة لليومية والدرج المتوقع بنجاح! 💳`, 'success');
  }
};

const handleRemovePlayer = async (p) => {
  let isPaid = p.amountConfirmed > 0;
  let warningMessage = `هل أنت متأكد من رغبتك في إزالة اللاعب ${p.nickname} من البطولة؟`;
  
  if (isPaid) {
    warningMessage = `تنبيه مالي ⚠️: اللاعب ${p.nickname} قد قام بسداد مبلغ [ ${p.amountConfirmed} ج ].\r\n\r\nهل تريد إلغاء اشتراكه وتسجيل مرتجع مالي لخصم هذا المبلغ من كاش الوردية الحالية؟ (اختر إلغاء إذا كنت تريد إزالته فقط دون خصم المرتجع المالي)`;
  }

  const confirmed = await ui.confirm({
    title: isPaid ? 'إلغاء اشتراك لاعب مدفوع' : 'إلغاء اشتراك لاعب',
    message: warningMessage,
    type: isPaid ? 'danger' : 'warning'
  });

  if (confirmed) {
    if (isPaid) {
      // Add refund to tournamentsHistory for daily safe matching
      if (!store.tournamentsHistory) store.tournamentsHistory = [];
      store.tournamentsHistory.push({
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
        playerName: p.fullName,
        nickname: p.nickname,
        tournamentName: `${activeTournament.value.name} (مرتجع إلغاء لاعب)`,
        amount: -p.amountConfirmed, // Negative amount representing refund!
        timestamp: new Date().toISOString(),
        processedBy: store.session?.username || 'admin'
      });
      store.addActivity('مرتجع لاعب بطولة', `تم تسجيل مرتجع للاعب ${p.nickname} بقيمة ${p.amountConfirmed} ج`);
    }

    store.removePlayer(activeTournament.value.id, p.id);
    ui.showToast(isPaid ? 'تم إلغاء الاشتراك وإزالة اللاعب وتسجيل المرتجع المالي.' : 'تم إلغاء الاشتراك وإزالة اللاعب بنجاح.');
  }
};

const submitManualPlayer = () => {
  if (!manualPlayerForm.fullName.trim() || !manualPlayerForm.nickname.trim() || !manualPlayerForm.phone.trim()) {
    ui.showToast('يرجى استكمال جميع الحقول أولاً!', 'warning');
    return;
  }

  if (manualPlayerForm.logoId === null || isLogoTaken(manualPlayerForm.logoId)) {
    ui.showToast('هذا الشعار محجوز بالفعل في هذه البطولة! يرجى اختيار شعار آخر.', 'warning');
    return;
  }

  const isPending = manualPlayerForm.paymentStatus === 'unpaid';
  const paid = manualPlayerForm.paymentStatus === 'full';
  const fee = activeTournament.value?.fee || 0;
  const amountPaid = manualPlayerForm.paymentStatus === 'partial' 
    ? Number(manualPlayerForm.amountPaid) 
    : (paid ? fee : 0);

  if (manualPlayerForm.paymentStatus === 'partial' && (amountPaid <= 0 || amountPaid > fee)) {
    ui.showToast(`يرجى تحديد قيمة دفعة صحيحة لا تزيد عن قيمة الاشتراك (${fee} ج)`, 'warning');
    return;
  }

  const res = store.registerPlayer(activeTournament.value.id, {
    fullName: manualPlayerForm.fullName.trim(),
    nickname: manualPlayerForm.nickname.trim(),
    phone: manualPlayerForm.phone.trim(),
    logoId: Number(manualPlayerForm.logoId),
    isPendingApproval: isPending,
    paid: paid,
    paymentType: manualPlayerForm.paymentStatus === 'partial' ? 'partial' : 'full',
    paymentMethod: manualPlayerForm.paymentMethod,
    amountPaid: amountPaid,
    amountConfirmed: amountPaid,
    senderNumber: (manualPlayerForm.paymentMethod === 'instapay' || manualPlayerForm.paymentMethod === 'wallet') ? manualPlayerForm.senderNumber.trim() : '',
    transactionId: (manualPlayerForm.paymentMethod === 'instapay' || manualPlayerForm.paymentMethod === 'wallet') ? manualPlayerForm.transactionId.trim() : ''
  });

  if (res.success) {
    ui.showToast(`تم تسجيل اللاعب ${manualPlayerForm.nickname} يدوياً بنجاح! 👥`, 'success');
    showAddPlayerModal.value = false;
    // reset manual form
    manualPlayerForm.fullName = '';
    manualPlayerForm.nickname = '';
    manualPlayerForm.phone = '';
    manualPlayerForm.logoId = 0;
    manualPlayerForm.paymentStatus = 'unpaid';
    manualPlayerForm.paymentMethod = 'cash';
    manualPlayerForm.amountPaid = 0;
    manualPlayerForm.senderNumber = '';
    manualPlayerForm.transactionId = '';
  } else {
    ui.showToast(res.message, 'error');
  }
};

// Cloud Tunnel controls
const fetchTunnelStatus = async () => {
  try {
    const r = await axios.get(`${API_BASE}/system/tunnel-status`);
    tunnelUrl.value = r.data.url;
  } catch(e) {}
};

const startCloudTunnel = async () => {
  startingTunnel.value = true;
  try {
    const r = await axios.post(`${API_BASE}/system/start-tunnel`);
    if (r.data.success) {
      tunnelUrl.value = r.data.url;
      ui.showToast('تم توليد رابط الإنترنت بنجاح! انسخه وشاركه على السوشيال ميديا 🌐', 'success');
    } else {
      ui.showToast(r.data.error || 'فشل الاتصال بخادم التوليد.', 'error');
    }
  } catch(err) {
    ui.showToast('خطأ في الاتصال بالكمبيوتر المضيف لتشغيل النفق.', 'error');
  } finally {
    startingTunnel.value = false;
  }
};

const stopCloudTunnel = async () => {
  try {
    const r = await axios.post(`${API_BASE}/system/stop-tunnel`);
    if (r.data.success) {
      tunnelUrl.value = null;
      ui.showToast('تم إغلاق البث العام وإيقاف النفق السحابي بنجاح 🛑', 'info');
    }
  } catch(e) {}
};

const copyLink = (type) => {
  let inputEl = null;
  if (type === 'wifi') inputEl = wifiUrlInput.value;
  else if (type === 'cloud') inputEl = cloudUrlInput.value;
  else if (type === 'cloudPages') inputEl = cloudPagesUrlInput.value;
  
  if (inputEl) {
    inputEl.select();
    document.execCommand('copy');
    ui.showToast('تم نسخ الرابط الحافظة بنجاح 📋!', 'success');
  }
};

const openLink = (url) => {
  if (url) {
    window.open(url, '_blank');
  }
};


// Bracket Generation & Start logic
const handleStartTournament = async () => {
  const players = activeTournament.value.players.filter(p => p && !p.isPendingApproval);
  if (players.length < 2) {
    ui.showToast('لا يمكن بدء البطولة بعدد لاعبين أقل من لاعبين اثنين!', 'warning');
    return;
  }

  const confirmed = await ui.confirm({
    title: 'توليد القرعة وبدء البطولة',
    message: 'هل تريد إغلاق باب التسجيل الآن وتوليد مواجهات القرعة عشوائياً والانطلاق بالبطولة؟',
    type: 'success'
  });

  if (!confirmed) return;

  const generatedMatches = [];
  const type = activeTournament.value.type;

  if (type === 'cup') {
    // Cup bracket size
    const limit = activeTournament.value.maxPlayers;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    // Fill with Bye slots up to standard limit
    const totalSlots = limit;
    while (shuffled.length < totalSlots) {
      shuffled.push({ id: 'bye', nickname: 'تأهل تلقائي ⭐', logoId: null });
    }

    // Round 1 matches
    const round1MatchCount = totalSlots / 2;
    const roundMatches = [];
    
    for (let i = 0; i < round1MatchCount; i++) {
      const p1 = shuffled[i * 2];
      const p2 = shuffled[i * 2 + 1];
      
      const mId = `c-m-0-${i}`;
      let played = false;
      let winnerId = '';
      let score1 = null;
      let score2 = null;

      // Handle automatic Byes
      if (p1.id === 'bye' && p2.id === 'bye') {
        played = true;
        winnerId = 'bye';
      } else if (p1.id === 'bye') {
        played = true;
        winnerId = p2.id;
        score1 = 0;
        score2 = 3;
      } else if (p2.id === 'bye') {
        played = true;
        winnerId = p1.id;
        score1 = 3;
        score2 = 0;
      }

      roundMatches.push({
        id: mId,
        player1Id: p1.id,
        player2Id: p2.id,
        player1Score: score1,
        player2Score: score2,
        winnerId,
        played,
        roundIndex: 0,
        matchIndex: i
      });
    }

    generatedMatches.push(...roundMatches);

    // Pre-generate subsequent rounds
    let currentR1Count = round1MatchCount;
    let roundIdx = 1;
    
    while (currentR1Count > 1) {
      const nextMatchCount = currentR1Count / 2;
      const roundMatchesNext = [];
      
      for (let i = 0; i < nextMatchCount; i++) {
        const mId = `c-m-${roundIdx}-${i}`;
        
        // Find if any Byes cascade into this round
        let p1Id = '';
        let p2Id = '';
        let played = false;
        let winnerId = '';
        let score1 = null;
        let score2 = null;

        // Pull parents match indices
        const parentMatch1 = generatedMatches.find(m => m && m.roundIndex === roundIdx - 1 && m.matchIndex === i * 2);
        const parentMatch2 = generatedMatches.find(m => m && m.roundIndex === roundIdx - 1 && m.matchIndex === i * 2 + 1);

        if (parentMatch1 && parentMatch1.played) p1Id = parentMatch1.winnerId;
        if (parentMatch2 && parentMatch2.played) p2Id = parentMatch2.winnerId;

        // Auto Bye trigger if any side parent is bye
        if (p1Id === 'bye' || p2Id === 'bye') {
          if (p1Id === 'bye' && p2Id === 'bye') {
            played = true; winnerId = 'bye';
          } else if (p1Id === 'bye' && p2Id) {
            played = true; winnerId = p2Id; score1 = 0; score2 = 3;
          } else if (p2Id === 'bye' && p1Id) {
            played = true; winnerId = p1Id; score1 = 3; score2 = 0;
          }
        }

        roundMatchesNext.push({
          id: mId,
          player1Id: p1Id || null,
          player2Id: p2Id || null,
          player1Score: score1,
          player2Score: score2,
          winnerId,
          played,
          roundIndex: roundIdx,
          matchIndex: i
        });
      }

      generatedMatches.push(...roundMatchesNext);
      currentR1Count = nextMatchCount;
      roundIdx++;
    }

    store.startTournament(activeTournament.value.id, generatedMatches);
    viewMode.value = 'matches';
    ui.showToast('تم إجراء القرعة وبث المواجهات حياً بنجاح! 🎲🔥', 'success');

  } else if (type === 'groups_knockout') {
    // Groups Stage Round-robin Generation
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const groupsCount = activeTournament.value.groupsCount || 4;
    const groups = {};
    
    for (let i = 0; i < groupsCount; i++) {
      const groupName = String.fromCharCode(65 + i); // 'A', 'B', 'C', ...
      groups[`Group ${groupName}`] = [];
    }

    // Distribute shuffled players into groups
    shuffled.forEach((p, idx) => {
      const groupIndex = idx % groupsCount;
      const groupName = String.fromCharCode(65 + groupIndex);
      groups[`Group ${groupName}`].push(p);
    });

    // For each group, schedule round-robin matches
    Object.keys(groups).forEach(groupName => {
      const gPlayers = groups[groupName];
      const n = gPlayers.length;
      const gShuffled = [...gPlayers];

      // Add Dummy Bye if odd
      if (n % 2 !== 0) {
        gShuffled.push({ id: 'bye', nickname: 'راحة 💤', logoId: null });
      }

      const totalRounds = gShuffled.length - 1;
      const matchesPerRound = gShuffled.length / 2;

      for (let r = 0; r < totalRounds; r++) {
        for (let m = 0; m < matchesPerRound; m++) {
          const homeIdx = (r + m) % (gShuffled.length - 1);
          let awayIdx = (gShuffled.length - 1 - m + r) % (gShuffled.length - 1);
          
          if (m === 0) awayIdx = gShuffled.length - 1;

          const home = gShuffled[homeIdx];
          const away = gShuffled[awayIdx];

          let played = false;
          let winnerId = '';
          let score1 = null;
          let score2 = null;

          if (home.id === 'bye' || away.id === 'bye') {
            played = true;
            winnerId = home.id === 'bye' ? away.id : home.id;
            score1 = home.id === 'bye' ? 0 : 3;
            score2 = home.id === 'bye' ? 3 : 0;
          }

          generatedMatches.push({
            id: `g-m-${groupName}-${r}-${m}`,
            player1Id: home.id,
            player2Id: away.id,
            player1Score: score1,
            player2Score: score2,
            winnerId,
            played,
            roundIndex: r,
            matchIndex: m,
            groupName: groupName,
            isGroupStage: true
          });
        }
      }
    });

    store.startTournament(activeTournament.value.id, generatedMatches, groups);
    viewMode.value = 'matches';
    ui.showToast('تم توزيع المجموعات وتوليد جدول مواجهات دور المجموعات بنجاح! 👥🔥', 'success');
  } else {
    // League (Berger Scheduling Circle method)
    const n = players.length;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    // Add Dummy Bye if odd
    if (n % 2 !== 0) {
      shuffled.push({ id: 'bye', nickname: 'راحة 💤', logoId: null });
    }

    const totalRounds = shuffled.length - 1;
    const matchesPerRound = shuffled.length / 2;

    for (let r = 0; r < totalRounds; r++) {
      for (let m = 0; m < matchesPerRound; m++) {
        const homeIdx = (r + m) % (shuffled.length - 1);
        let awayIdx = (shuffled.length - 1 - m + r) % (shuffled.length - 1);
        
        if (m === 0) awayIdx = shuffled.length - 1;

        const home = shuffled[homeIdx];
        const away = shuffled[awayIdx];

        let played = false;
        let winnerId = '';
        let score1 = null;
        let score2 = null;

        // Auto-complete bye matches
        if (home.id === 'bye' || away.id === 'bye') {
          played = true;
          winnerId = home.id === 'bye' ? away.id : home.id;
          score1 = home.id === 'bye' ? 0 : 3;
          score2 = home.id === 'bye' ? 3 : 0;
        }

        generatedMatches.push({
          id: `l-m-${r}-${m}`,
          player1Id: home.id,
          player2Id: away.id,
          player1Score: score1,
          player2Score: score2,
          winnerId,
          played,
          roundIndex: r,
          matchIndex: m
        });
      }
    }
    
    store.startTournament(activeTournament.value.id, generatedMatches);
    viewMode.value = 'matches';
    ui.showToast('تم إجراء القرعة وبث المواجهات حياً بنجاح! 🎲🔥', 'success');
  }
};

const advanceToKnockoutStage = async () => {
  const selectedPlayersIds = Object.keys(advancingPlayers.value).filter(id => advancingPlayers.value[id]);
  const advCount = selectedPlayersIds.length;

  if (![2, 4, 8, 16, 32].includes(advCount)) {
    ui.showToast('⚠️ يجب أن يكون عدد المتأهلين 2، 4، 8، 16، أو 32 لاعباً لتكوين قرعة كأس متناظرة!', 'warning');
    return;
  }

  const confirmed = await ui.confirm({
    title: 'تصعيد للأدوار الإقصائية (خروج المغلوب)',
    message: `هل أنت متأكد من تأهيل ${advCount} لاعب والبدء في تصفيات الكأس؟ سيتم توليد قرعة الكأس الإقصائية مباشرة.`,
    type: 'success'
  });

  if (!confirmed) return;

  // Retrieve actual player objects
  const selectedPlayers = selectedPlayersIds
    .map(id => activeTournament.value.players.find(p => p && p.id === id))
    .filter(Boolean);

  // Shuffle selected players to randomize the seeding
  const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);

  const generatedMatches = [];
  const totalSlots = advCount;
  
  // Round 1 matches
  const round1MatchCount = totalSlots / 2;
  const roundMatches = [];
  
  for (let i = 0; i < round1MatchCount; i++) {
    const p1 = shuffled[i * 2];
    const p2 = shuffled[i * 2 + 1];
    
    const mId = `c-m-0-${i}`;
    let played = false;
    let winnerId = '';
    let score1 = null;
    let score2 = null;

    if (p1.id === 'bye' && p2.id === 'bye') {
      played = true; winnerId = 'bye';
    } else if (p1.id === 'bye') {
      played = true; winnerId = p2.id; score1 = 0; score2 = 3;
    } else if (p2.id === 'bye') {
      played = true; winnerId = p1.id; score1 = 3; score2 = 0;
    }

    roundMatches.push({
      id: mId,
      player1Id: p1.id,
      player2Id: p2.id,
      player1Score: score1,
      player2Score: score2,
      winnerId,
      played,
      roundIndex: 0,
      matchIndex: i
    });
  }

  generatedMatches.push(...roundMatches);

  // Pre-generate subsequent rounds
  let currentR1Count = round1MatchCount;
  let roundIdx = 1;
  
  while (currentR1Count > 1) {
    const nextMatchCount = currentR1Count / 2;
    const roundMatchesNext = [];
    
    for (let i = 0; i < nextMatchCount; i++) {
      const mId = `c-m-${roundIdx}-${i}`;
      
      let p1Id = '';
      let p2Id = '';
      let played = false;
      let winnerId = '';
      let score1 = null;
      let score2 = null;

      // Pull parents match indices
      const parentMatch1 = generatedMatches.find(m => m && m.roundIndex === roundIdx - 1 && m.matchIndex === i * 2);
      const parentMatch2 = generatedMatches.find(m => m && m.roundIndex === roundIdx - 1 && m.matchIndex === i * 2 + 1);

      if (parentMatch1 && parentMatch1.played) p1Id = parentMatch1.winnerId;
      if (parentMatch2 && parentMatch2.played) p2Id = parentMatch2.winnerId;

      if (p1Id === 'bye' || p2Id === 'bye') {
        if (p1Id === 'bye' && p2Id === 'bye') {
          played = true; winnerId = 'bye';
        } else if (p1Id === 'bye' && p2Id) {
          played = true; winnerId = p2Id; score1 = 0; score2 = 3;
        } else if (p2Id === 'bye' && p1Id) {
          played = true; winnerId = p1Id; score1 = 3; score2 = 0;
        }
      }

      roundMatchesNext.push({
        id: mId,
        player1Id: p1Id || null,
        player2Id: p2Id || null,
        player1Score: score1,
        player2Score: score2,
        winnerId,
        played,
        roundIndex: roundIdx,
        matchIndex: i
      });
    }

    generatedMatches.push(...roundMatchesNext);
    currentR1Count = nextMatchCount;
    roundIdx++;
  }

  // Call store action to advance and save
  store.advanceToKnockout(activeTournament.value.id, generatedMatches);
  ui.showToast('🎉 تم تصعيد اللاعبين المتأهلين بنجاح وتوليد قرعة تصفيات الكأس! 🏆🔥', 'success');
};


// Match Play score recorders
const openMatchScoreDialog = (match) => {
  if (match.player1Id === 'bye' || match.player2Id === 'bye') return; // Cannot edit Byes
  
  activeMatch.value = match;
  matchScore.score1 = match.player1Score || 0;
  matchScore.score2 = match.player2Score || 0;
  matchScore.winnerId = match.winnerId || '';
  showScoreModal.value = true;
};

const submitMatchScore = () => {
  if (matchScore.score1 === matchScore.score2 && activeTournament.value.type === 'cup' && !matchScore.winnerId) {
    ui.showToast('يرجى تحديد الفائز بركلات الترجيح للتعادل!', 'warning');
    return;
  }

  let finalWinner = '';
  if (matchScore.score1 > matchScore.score2) {
    finalWinner = activeMatch.value.player1Id;
  } else if (matchScore.score2 > matchScore.score1) {
    finalWinner = activeMatch.value.player2Id;
  } else {
    // Draw
    finalWinner = activeTournament.value.type === 'cup' ? matchScore.winnerId : 'draw';
  }

  const nextRoundUpdates = [];

  if (activeTournament.value.type === 'cup') {
    // Propagate winner to next round match index
    const rIdx = activeMatch.value.roundIndex;
    const mIdx = activeMatch.value.matchIndex;
    const targetRound = rIdx + 1;
    const targetMatchIndex = Math.floor(mIdx / 2);
    const targetSlot = (mIdx % 2 === 0) ? 1 : 2;

    const targetMatchId = `c-m-${targetRound}-${targetMatchIndex}`;
    
    nextRoundUpdates.push({
      matchId: targetMatchId,
      slot: targetSlot,
      playerId: finalWinner
    });

    // Check if next round match has "Bye" as the opposite slot, cascade auto win if so!
    const targetMatch = activeTournament.value.matches.find(m => m && m.id === targetMatchId);
    if (targetMatch) {
      const oppPlayerId = targetSlot === 1 ? targetMatch.player2Id : targetMatch.player1Id;
      if (oppPlayerId === 'bye') {
        // Auto cascade win for this advanced winner!
        nextRoundUpdates.push({
          matchId: `c-m-${targetRound + 1}-${Math.floor(targetMatchIndex / 2)}`,
          slot: (targetMatchIndex % 2 === 0) ? 1 : 2,
          playerId: finalWinner
        });
      }
    }
  }

  store.updateMatchResult(
    activeTournament.value.id,
    activeMatch.value.id,
    Number(matchScore.score1),
    Number(matchScore.score2),
    finalWinner,
    nextRoundUpdates
  );

  showScoreModal.value = false;
  ui.showToast('تم حفظ نتيجة اللقاء بنجاح وتحديث المواجهات! 🎯⚽', 'success');

  // Check if tournament has fully finished to announce award ceremony
  checkTournamentCompletion();
};

const checkTournamentCompletion = () => {
  const matches = activeTournament.value.matches;
  const isFinished = matches.every(m => m.played);

  if (isFinished) {
    let first = '', second = '', third = '';

    if (activeTournament.value.type === 'cup') {
      const maxRound = Math.max(...matches.map(m => m && m.roundIndex));
      const finalMatch = matches.find(m => m && m.roundIndex === maxRound);
      if (finalMatch && finalMatch.played) {
        first = finalMatch.winnerId;
        second = finalMatch.winnerId === finalMatch.player1Id ? finalMatch.player2Id : finalMatch.player1Id;
      }
      
      // Resolve third place from semifinal losers
      const semis = matches.filter(m => m.roundIndex === maxRound - 1);
      if (semis.length === 2) {
        const loser1 = semis[0].winnerId === semis[0].player1Id ? semis[0].player2Id : semis[0].player1Id;
        const loser2 = semis[1].winnerId === semis[1].player1Id ? semis[1].player2Id : semis[1].player1Id;
        third = loser1 === 'bye' ? loser2 : loser1;
      }
    } else {
      // League: Rank top 3
      const board = leagueLeaderboard.value;
      if (board.length >= 1) first = board[0].id;
      if (board.length >= 2) second = board[1].id;
      if (board.length >= 3) third = board[2].id;
    }

    store.completeTournament(activeTournament.value.id, { first, second, third });
    ui.showToast('👑 مبروك! اكتملت مباريات البطولة، وتم إعلان حفل تتويج الأبطال الثلاثة حيا! 🏆', 'success');
  }
};

const handleForceComplete = async () => {
  const confirmed = await ui.confirm({
    title: 'إنهاء البطولة يدوياً',
    message: 'هل تريد إنهاء الفعاليات وتتويج الأبطال الثلاثة الأوائل يدوياً الآن؟',
    type: 'warning'
  });
  if (confirmed) {
    checkTournamentCompletion();
  }
};

const archiveAndResetTournament = async () => {
  const confirmed = await ui.confirm({
    title: 'أرشفة البطولة وبدء دورة جديدة',
    message: 'هل تم تسليم الجوائز وتريد الآن حفظ البطولة في الأرشيف وتصفير لوحة إدارة البطولات لبدء دوري/كأس جديد؟',
    type: 'success'
  });
  if (confirmed) {
    const archivedId = activeTournament.value.id;
    const archivedName = activeTournament.value.name;

    // Delete from active list locally
    store.deleteTournament(archivedId);
    ui.showToast('تمت أرشفة البطولة بنجاح. لوحة التحكم مهيأة لبطولة جديدة! ✨🏆', 'success');

    // Push cloud removal immediately (remove ONLY this tournament from Supabase, keep all others intact)
    if (navigator.onLine !== false && store.machineId) {
      try {
        const { getSupabaseClient } = await import('../../utils/supabase');
        const supabase = getSupabaseClient(store.machineId);
        const { data: cloudRow, error: fetchError } = await supabase
          .from('cloud_backups')
          .select('data')
          .eq('machine_id', store.machineId.toUpperCase().trim())
          .single();

        if (!fetchError && cloudRow?.data) {
          const cloudPayload = cloudRow.data;
          const updatedTournaments = (cloudPayload.classico_tournaments || [])
            .filter(t => t && t.id !== archivedId);

          await supabase
            .from('cloud_backups')
            .update({
              data: { ...cloudPayload, classico_tournaments: updatedTournaments },
              updated_at: new Date().toISOString()
            })
            .eq('machine_id', store.machineId.toUpperCase().trim());
        }
      } catch (err) {
        console.warn('[Archive Cloud Sync]', err);
      }
    }
  }
};

const syncCloudPlayers = async (silent = false) => {
  if (!activeTournament.value || activeTournament.value.status !== 'registration') return;
  
  // If we are offline, skip cloud api request to prevent console spam
  if (navigator.onLine === false) {
    await store.syncFromServer();
    return;
  }

  try {
    const res = await axios.get(`${API_BASE}/system/cloud-restore`);
    if (res.data && Array.isArray(res.data.classico_tournaments)) {
      const cloudTournaments = res.data.classico_tournaments;
      const cloudT = cloudTournaments.find(t => t && t.id === activeTournament.value.id);
      
      if (cloudT && Array.isArray(cloudT.players)) {
        let mergedCount = 0;
        const localPlayers = Array.isArray(activeTournament.value.players) 
          ? [...activeTournament.value.players] 
          : [];
        const localDeletedIds = activeTournament.value.deletedPlayerIds || [];
        
        cloudT.players.forEach(cloudP => {
          if (!cloudP || !cloudP.id) return;
          const existsLocally = localPlayers.some(p => 
            p && (p.id === cloudP.id || 
            p.phone === cloudP.phone || 
            (p.nickname && cloudP.nickname && p.nickname.toLowerCase() === cloudP.nickname.toLowerCase()))
          );
          const isDeletedLocally = localDeletedIds.includes(cloudP.id);
          
          if (!existsLocally && !isDeletedLocally) {
            localPlayers.push(cloudP);
            mergedCount++;
          }
        });
        
        if (mergedCount > 0) {
          activeTournament.value.players = localPlayers;
          await store.saveToDatabase();
          if (!silent) {
            ui.showToast(`تم مزامنة وجلب ${mergedCount} لاعبين جدد من التسجيل السحابي! 👥`, 'success');
          }
        } else {
          await store.syncFromServer();
          if (!silent) {
            ui.showToast('بيانات اللاعبين متزامنة بالفعل.', 'info');
          }
        }
      } else {
        await store.syncFromServer();
        if (!silent) {
          ui.showToast('لا توجد تسجيلات جديدة على السحابة.', 'info');
        }
      }
    } else {
      await store.syncFromServer();
    }
  } catch (err) {
    if (!silent) {
      console.error('[Sync Players Cloud Error]', err);
      ui.showToast('خطأ أثناء جلب التسجيلات من السحابة. تم جلب البيانات المحلية.', 'warning');
    }
    await store.syncFromServer();
  }
};

const manualSyncCloudPlayers = async () => {
  await syncCloudPlayers(false);
};

const getPrizeForRank = (rankNumber) => {
  if (!activeTournament.value || !activeTournament.value.prizesList) return null;
  const p = activeTournament.value.prizesList.find(pr => {
    const title = pr.label || pr.rankTitle || '';
    if (rankNumber === 1 && title.includes('الأول')) return true;
    if (rankNumber === 2 && title.includes('الثاني')) return true;
    if (rankNumber === 3 && title.includes('الثالث')) return true;
    return false;
  });
  return p ? (p.value || p.prizeAmount) : null;
};

const compileWinnersData = () => {
  if (!activeTournament.value || !activeTournament.value.winners) return null;
  
  const getPlayerById = (id) => {
    if (!id || !activeTournament.value.players) return null;
    return activeTournament.value.players.find(p => p && p.id === id) || null;
  };

  const objectToCssString = (obj) => {
    if (!obj) return '';
    return Object.entries(obj).map(([k, v]) => `${k.replace(/[A-Z]/g, match => '-' + match.toLowerCase())}: ${v}`).join('; ');
  };

  const w = activeTournament.value.winners;
  const p1 = w ? getPlayerById(w.first) : null;
  const p2 = w ? getPlayerById(w.second) : null;
  const p3 = w ? getPlayerById(w.third) : null;

  return {
    first: p1 ? { 
      fullName: p1.fullName, 
      nickname: p1.nickname, 
      logoId: p1.logoId, 
      logoSymbol: getPlayerLogoSymbol(w.first), 
      logoUrl: getPlayerLogoUrl(w.first), 
      logoStyle: objectToCssString(getPlayerLogoStyle(w.first)),
      prize: getPrizeForRank(1) 
    } : null,
    second: p2 ? { 
      fullName: p2.fullName, 
      nickname: p2.nickname, 
      logoId: p2.logoId, 
      logoSymbol: getPlayerLogoSymbol(w.second), 
      logoUrl: getPlayerLogoUrl(w.second), 
      logoStyle: objectToCssString(getPlayerLogoStyle(w.second)),
      prize: getPrizeForRank(2) 
    } : null,
    third: p3 ? { 
      fullName: p3.fullName, 
      nickname: p3.nickname, 
      logoId: p3.logoId, 
      logoSymbol: getPlayerLogoSymbol(w.third), 
      logoUrl: getPlayerLogoUrl(w.third), 
      logoStyle: objectToCssString(getPlayerLogoStyle(w.third)),
      prize: getPrizeForRank(3) 
    } : null
  };
};

const handlePrintCrowningReport = () => {
  const winnersData = compileWinnersData();
  if (!winnersData) return;
  printCrowningReport(
    activeTournament.value.name,
    store.appSettings?.appName || 'الصالة',
    winnersData
  );
};

const handleExportCrowningReportPDF = () => {
  const winnersData = compileWinnersData();
  if (!winnersData) return;
  exportTournamentReportAsPDF(
    activeTournament.value.name,
    store.appSettings?.appName || 'الصالة',
    winnersData
  );
};

const handleExportCrowningReportImage = () => {
  const winnersData = compileWinnersData();
  if (!winnersData) return;
  exportTournamentReportAsImage(
    activeTournament.value.name,
    store.appSettings?.appName || 'الصالة',
    winnersData
  );
};

const handleShareSocial = async () => {
  const winnersData = compileWinnersData();
  if (!winnersData) return;

  const tName = activeTournament.value.name;
  const lName = store.appSettings?.appName || 'الصالة';
  
  let text = `🏆 التقرير الرسمي لتتويج أبطال الصالة 🏆\n`;
  text += `بطولة: "${tName}"\n`;
  text += `🎮 صالة: ${lName}\n`;
  text += `تاريخ التتويج: ${new Date().toLocaleDateString('ar-EG')}\n\n`;
  text += `النتائج النهائية والتكريم:\n`;
  
  if (winnersData.first) {
    text += `🥇 الأول: ${winnersData.first.nickname} (${winnersData.first.fullName || ''}) - الجائزة: ${winnersData.first.prize || 'ميدالية ذهبية'}\n`;
  }
  if (winnersData.second) {
    text += `🥈 الثاني: ${winnersData.second.nickname} (${winnersData.second.fullName || ''}) - الجائزة: ${winnersData.second.prize || 'ميدالية فضية'}\n`;
  }
  if (winnersData.third) {
    text += `🥉 الثالث: ${winnersData.third.nickname} (${winnersData.third.fullName || ''}) - الجائزة: ${winnersData.third.prize || 'ميدالية برونزية'}\n`;
  }
  
  text += `\nتهانينا لجميع الأبطال! 🎉🏆`;

  try {
    await navigator.clipboard.writeText(text);
    ui.showToast('تم نسخ تقرير التتويج إلى الحافظة بنجاح! 📋', 'success');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }

  // Check Web Share API support
  if (navigator.share) {
    try {
      await navigator.share({
        title: `تقرير تتويج بطولة ${tName}`,
        text: text
      });
    } catch (err) {
      console.log('Share canceled or failed:', err);
    }
  } else {
    // Open WhatsApp send link
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
};

let syncInterval = null;

onMounted(async () => {
  // Get IP
  try {
    const res = await axios.get(`${API_BASE}/system/local-ip`);
    localIp.value = res.data.ip;
  } catch(e) {}

  // Get status
  await fetchTunnelStatus();

  // Start polling online players if registration is active
  if (activeTournament.value && activeTournament.value.status === 'registration') {
    syncCloudPlayers(true);
    syncInterval = setInterval(() => {
      syncCloudPlayers(true);
    }, 10000);
  }
});

onUnmounted(() => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
});
</script>

<style scoped>
:global(.light-mode) .player-nickname-sub {
  color: #0284c7 !important;
}

/* Modals styling for centered popups */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75) !important;
  backdrop-filter: blur(8px) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 1000000 !important;
}

.modal-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%) !important;
  border: 1px solid rgba(6, 182, 212, 0.25) !important;
  border-radius: 20px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 25px rgba(6, 182, 212, 0.15) !important;
  padding: 2rem !important;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

:global(.light-mode) .modal-content {
  background: #ffffff !important;
  border: 1px solid rgba(15, 23, 42, 0.1) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05) !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}
:global(.light-mode) .modal-header {
  border-bottom-color: rgba(15, 23, 42, 0.08) !important;
}

.modal-header h2 {
  margin: 0;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.btn-icon:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}
:global(.light-mode) .btn-icon {
  background: rgba(15, 23, 42, 0.03) !important;
  border-color: rgba(15, 23, 42, 0.05) !important;
  color: #64748b !important;
}
:global(.light-mode) .btn-icon:hover {
  background: #fee2e2 !important;
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.1) !important;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.logo-scroll-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-select-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.logo-select-btn:hover:not(:disabled) {
  transform: scale(1.15);
}
.logo-select-btn.active {
  border-color: #fff !important;
  transform: scale(1.18);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.6) !important;
}

.tournaments-admin-wrapper {
  padding: 0;
  overflow: hidden !important;
  height: 100%;
}

.lounge-tag {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.35rem 0.9rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 2.3fr;
  gap: 1.5rem;
  align-items: start;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Clouds and tunnel elements styles */
.url-copy-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 5px;
}

/* Active cloud registration link card styles */
.link-card {
  background: rgba(16, 185, 129, 0.05) !important; 
  border: 1px solid rgba(16, 185, 129, 0.15) !important; 
  padding: 12px !important;
  border-radius: 12px;
  transition: all 0.3s ease;
}
.link-card-title {
  font-size: 0.8rem; 
  color: #10b981; 
  font-weight: bold;
}
.cloud-url-input {
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
  background: rgba(16, 185, 129, 0.05) !important;
  font-family: monospace;
}
.cloud-copy-btn {
  background: #10b981 !important; 
  color: #000 !important;
}
.open-url-btn {
  background: #06b6d4 !important;
  color: #000 !important;
}

/* Light mode link-card overrides */
:global(.light-mode) .link-card {
  background: rgba(5, 150, 105, 0.08) !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
}
:global(.light-mode) .link-card-title {
  color: #047857 !important;
}
:global(.light-mode) .cloud-url-input {
  color: #059669 !important;
  border-color: rgba(15, 23, 42, 0.1) !important;
  background: rgba(5, 150, 105, 0.05) !important;
}
:global(.light-mode) .cloud-copy-btn {
  background: #059669 !important;
  color: #ffffff !important;
}
:global(.light-mode) .open-url-btn {
  background: #0284c7 !important;
  color: #ffffff !important;
}


/* Prizes slots inputs styling */
.premium-input-mini {
  background: rgba(15, 23, 42, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
  border-radius: 6px;
  padding: 4px 8px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  min-width: 0;
  box-sizing: border-box;
}
.premium-input-mini.prize-label {
  color: #fff !important;
  font-weight: bold;
}
.premium-input-mini.prize-value {
  color: #fbbf24 !important;
  font-weight: 800;
}
.premium-input-mini:focus {
  border-color: var(--accent-cyan) !important;
  box-shadow: 0 0 5px rgba(6, 182, 212, 0.3) !important;
}
.prize-add-btn {
  background: var(--accent-cyan) !important; 
  color: black !important;
  font-size: 0.78rem !important;
  font-weight: 800 !important;
  padding: 4px 10px !important;
  border-radius: 6px !important;
}

/* Light mode overrides inside scoped style block for inputs */
:global(.light-mode) .premium-input-mini {
  background: #ffffff !important;
  border: 1px solid #94a3b8 !important; /* high-contrast clear slate border */
  color: #0f172a !important;
}
:global(.light-mode) .premium-input-mini.prize-label {
  color: #0f172a !important;
  font-weight: bold !important;
}
:global(.light-mode) .premium-input-mini.prize-value {
  color: #b45309 !important; /* deep high-contrast gold/bronze value */
  font-weight: 800 !important;
}
:global(.light-mode) .premium-input-mini:focus {
  border-color: var(--accent-primary) !important;
  box-shadow: 0 0 5px rgba(37, 99, 235, 0.3) !important;
}
:global(.light-mode) .prize-add-btn {
  background: #1e40af !important; /* Premium Cobalt Blue with superb contrast */
  color: #ffffff !important;
  font-size: 0.78rem !important;
  font-weight: 800 !important;
  padding: 4px 10px !important;
  border-radius: 6px !important;
  border: none !important;
  box-shadow: 0 2px 5px rgba(30, 64, 175, 0.2) !important;
}

/* Select element overrides */
.league-round-select {
  background: rgba(15, 23, 42, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  cursor: pointer;
}
:global(.light-mode) .league-round-select {
  background: #ffffff !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
  color: #0f172a !important;
}

.tie-breaker-select {
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
  color: #fff !important;
}
:global(.light-mode) .tie-breaker-select {
  background: #ffffff !important;
  border-color: rgba(220, 38, 38, 0.3) !important;
  color: #dc2626 !important;
}

/* Score display in league table round view */
.score-display-league {
  background: rgba(0,0,0,0.4); 
  border-radius: 8px; 
  padding: 4px 10px; 
  font-weight: 900; 
  font-family: monospace; 
  font-size: 0.95rem; 
  color: #fbbf24; 
  border: 1px solid rgba(255,255,255,0.05);
}
:global(.light-mode) .score-display-league {
  background: #f1f5f9 !important;
  color: #d97706 !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
}

/* Podiums and Ceremony Awards */
.ceremony-container {
  text-align: center;
  padding: 3rem !important;
  background: radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%) !important;
  border-color: rgba(245, 158, 11, 0.25) !important;
}

.trophy-ceremony {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 18px rgba(245, 158, 11, 0.6));
}

.podium-grid {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1.5rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.podium-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  position: relative;
}

.podium-card.gold {
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 0 25px rgba(245, 158, 11, 0.15);
  padding: 2.2rem 1.2rem;
  transform: translateY(-15px);
}

.podium-card.silver {
  border-color: rgba(203, 213, 225, 0.3);
}

.podium-card.bronze {
  border-color: rgba(180, 83, 9, 0.3);
}

:global(.light-mode) .ceremony-container {
  background: radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%) !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
}
:global(.light-mode) .podium-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
:global(.light-mode) .podium-card.gold {
  border-color: rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 0 25px rgba(217, 119, 6, 0.15);
}

.medal-icon {
  font-size: 2rem;
  position: absolute;
  top: -20px;
}

.medal-icon.glow {
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
}

.player-logo-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.3rem;
  border: 2px solid rgba(255,255,255,0.1);
}

.podium-card.gold .player-logo-large {
  width: 75px;
  height: 75px;
  font-size: 2.8rem;
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

:global(.light-mode) .podium-card.gold .player-logo-large {
  border-color: rgba(217, 119, 6, 0.5);
  box-shadow: 0 0 15px rgba(217, 119, 6, 0.3);
}

.podium-nick {
  font-weight: bold;
  font-size: 1.05rem;
}
:global(.light-mode) .podium-nick {
  color: #0f172a !important;
}
:global(.light-mode) .podium-nick.gold-color {
  color: #b45309 !important;
}

.rank-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: bold;
}

/* Interactive Card scores */
.interactive-match-card {
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.interactive-match-card:hover {
  transform: translateY(-2px);
  border-color: #fbbf24 !important;
  box-shadow: 0 5px 15px rgba(251, 191, 36, 0.25) !important;
}
:global(.light-mode) .interactive-match-card:hover {
  border-color: rgba(15, 23, 42, 0.15) !important;
  box-shadow: 0 5px 15px rgba(15, 23, 42, 0.05) !important;
}

.click-to-score-hint {
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 100%;
  background: #fbbf24;
  color: black;
  font-size: 0.65rem;
  text-align: center;
  font-weight: 800;
  padding: 1px 0;
  transition: bottom 0.25s ease;
}

.interactive-match-card:hover .click-to-score-hint {
  bottom: 0;
}

.badge {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  border: 1px solid transparent;
}
.badge.cup {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.2);
}
.badge.league {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.2);
}
.badge.registration {
  background: rgba(251, 191, 36, 0.15) !important;
  color: #fbbf24 !important;
  border-color: rgba(251, 191, 36, 0.25) !important;
}
.badge.active {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.25) !important;
}
.badge.completed {
  background: rgba(148, 163, 184, 0.15) !important;
  color: #94a3b8 !important;
  border-color: rgba(148, 163, 184, 0.25) !important;
}

/* Live brackets / trees */
.bracket-viewer-scroller {
  overflow-x: auto;
  width: 100%;
  padding: 1rem 0;
}
.bracket-rounds-container {
  display: flex;
  gap: 1.5rem;
}
.bracket-round-column {
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.round-title-banner {
  font-size: 0.8rem;
  font-weight: bold;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
  text-align: center;
  padding: 0.3rem;
  border-radius: 8px;
}
:global(.light-mode) .round-title-banner {
  color: #0891b2;
  background: rgba(8, 145, 178, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
}

.round-matches-list {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
  gap: 1rem;
}
.bracket-match-node {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
:global(.light-mode) .bracket-match-node {
  background: #ffffff !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04) !important;
}

.match-player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.match-player-row.winner {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
}
:global(.light-mode) .match-player-row.winner {
  background: rgba(5, 150, 105, 0.08) !important;
  border-color: rgba(15, 23, 42, 0.05) !important;
}

.match-player-row.winner .player-nick {
  color: #10b981;
  font-weight: bold;
}
:global(.light-mode) .match-player-row.winner .player-nick {
  color: #059669 !important;
}

.match-player-row.lost {
  opacity: 0.45;
}
.player-logo-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.player-nick {
  font-size: 0.85rem;
  color: #e2e8f0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}
:global(.light-mode) .player-nick {
  color: #0f172a !important;
}

.player-score {
  font-weight: 800;
  font-size: 0.9rem;
  color: #fbbf24;
  min-width: 20px;
  text-align: center;
}
:global(.light-mode) .player-score {
  color: #d97706 !important;
}

.vs-divider {
  font-size: 0.65rem;
  text-align: center;
  color: #475569;
  text-transform: uppercase;
  margin: 0.2rem 0;
  font-weight: bold;
}
:global(.light-mode) .vs-divider {
  color: #94a3b8 !important;
}

.crown { color: #fbbf24; font-weight: bold; }
.silver-medal { color: #cbd5e1; font-weight: bold; }
.bronze-medal { color: #b45309; font-weight: bold; }

/* Scrollbar customization for grid */
.logo-scroll-grid::-webkit-scrollbar,
.bracket-viewer-scroller::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.logo-scroll-grid::-webkit-scrollbar-track,
.bracket-viewer-scroller::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
.logo-scroll-grid::-webkit-scrollbar-thumb,
.bracket-viewer-scroller::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.logo-scroll-grid::-webkit-scrollbar-thumb:hover,
.bracket-viewer-scroller::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive grid layout queries */
@media (max-width: 968px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

/* Dynamic buttons contrast overrides */
.btn-green-v3 {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
  transition: all 0.2s ease-in-out !important;
}
.btn-green-v3:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.5) !important;
  transform: translateY(-1px);
}
:global(.light-mode) .btn-green-v3 {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2) !important;
  border: 1px solid rgba(5, 150, 105, 0.2) !important;
}
:global(.light-mode) .btn-green-v3:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%) !important;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3) !important;
}

.btn-manual-player,
.btn-archive-reset {
  background: var(--accent-cyan) !important;
  color: #000000 !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
  transition: all 0.2s ease-in-out !important;
}
.btn-manual-player:hover,
.btn-archive-reset:hover {
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.4) !important;
  transform: translateY(-1px);
}
:global(.light-mode) .btn-manual-player,
:global(.light-mode) .btn-archive-reset {
  background: var(--accent-primary) !important;
  color: #ffffff !important;
  border-color: rgba(37, 99, 235, 0.2) !important;
}
:global(.light-mode) .btn-manual-player:hover,
:global(.light-mode) .btn-archive-reset:hover {
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.3) !important;
}

.btn-pay-status {
  background: #fbbf24 !important;
  color: #000000 !important;
  transition: all 0.2s ease-in-out !important;
}
.btn-pay-status:hover {
  background: #f59e0b !important;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.4) !important;
}
:global(.light-mode) .btn-pay-status {
  background: #d97706 !important;
  color: #ffffff !important;
}
:global(.light-mode) .btn-pay-status:hover {
  background: #b45309 !important;
  box-shadow: 0 0 10px rgba(217, 119, 6, 0.3) !important;
}

.btn-force-complete {
  background: #fbbf24 !important;
  color: #000000 !important;
  transition: all 0.2s ease-in-out !important;
}
.btn-force-complete:hover {
  background: #f59e0b !important;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.4) !important;
}
:global(.light-mode) .btn-force-complete {
  background: #d97706 !important;
  color: #ffffff !important;
}
:global(.light-mode) .btn-force-complete:hover {
  background: #b45309 !important;
  box-shadow: 0 0 12px rgba(217, 119, 6, 0.3) !important;
}

.danger-btn {
  background: #ef4444 !important;
  color: #ffffff !important;
  transition: all 0.2s ease-in-out !important;
}
.danger-btn:hover {
  background: #dc2626 !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4) !important;
}
:global(.light-mode) .danger-btn {
  background: #dc2626 !important;
  color: #ffffff !important;
}
:global(.light-mode) .danger-btn:hover {
  background: #b91c1c !important;
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.3) !important;
}

/* ==========================================================================
   CUSTOM PREMIUM LIGHT MODE STYLE OVERRIDES FOR TOURNAMENTS PAGE
   ========================================================================== */

/* 1. Prizes builder container light mode styling */
:global(.light-mode) .prizes-builder-container {
  background: rgba(37, 99, 235, 0.04) !important; /* premium translucent light blue */
  border: 1px solid rgba(37, 99, 235, 0.18) !important; /* baby blue border */
  box-shadow: inset 0 2px 4px rgba(37, 99, 235, 0.02), 0 2px 8px rgba(37, 99, 235, 0.01) !important;
}
/* Premium X delete button contrast override */
:global(.light-mode) .prizes-builder-container button {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  border: 1px solid rgba(220, 38, 38, 0.15) !important;
}
:global(.light-mode) .prizes-builder-container button:hover {
  background: #fecaca !important;
  color: #991b1b !important;
}

/* 2. Fixtures list container & League cards premium white card layout */
.league-table-card,
.league-fixtures-card {
  background: rgba(15, 23, 42, 0.4) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
}
:global(.light-mode) .league-table-card,
:global(.light-mode) .league-fixtures-card,
:global(.light-mode) .fixtures-list-container {
  background: #ffffff !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02) !important;
}

/* 3. QR code scanner wrapper soft shadow */
:global(.light-mode) .qr-wrapper {
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(15, 23, 42, 0.05) !important;
}

/* 4. Warning alert text readable high-contrast color */
:global(.light-mode) .action-footer p {
  color: #b45309 !important;
}

/* 5. Match Score Modal inputs styling for high-contrast contrast and premium feel */
:global(.light-mode) .modal-content .premium-input {
  background: #f8fafc !important;
  border: 1px solid rgba(15, 23, 42, 0.15) !important;
  color: #0f172a !important;
}
:global(.light-mode) .modal-content .premium-input:focus {
  border-color: var(--accent-primary) !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

/* 6. Rank Crown and Medals premium rich coordination */
:global(.light-mode) .crown {
  color: #b45309 !important; /* Premium rich gold/amber */
}
:global(.light-mode) .silver-medal {
  color: #475569 !important; /* Premium steel slate */
}

/* 7. Soft elegant shadow for player logos instead of harsh glowing neons */
:global(.light-mode) .player-logo-mini,
:global(.light-mode) .player-logo-large {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
  border: 2px solid rgba(255, 255, 255, 0.9) !important;
}

/* 8. Table Empty State Hint and sub-text contrast correction */
:global(.light-mode) .table-container table td[colspan] {
  color: #64748b !important;
}
:global(.light-mode) .ceremony-container .trophy-ceremony {
  filter: drop-shadow(0 4px 10px rgba(217, 119, 6, 0.25)) !important;
}

/* 9. Overall visual touch-up for scrolls inside tournaments view in light mode */
:global(.light-mode) .logo-scroll-grid::-webkit-scrollbar-thumb,
:global(.light-mode) .bracket-viewer-scroller::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.15) !important;
}
:global(.light-mode) .logo-scroll-grid::-webkit-scrollbar-thumb:hover,
:global(.light-mode) .bracket-viewer-scroller::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.25) !important;
}
:global(.light-mode) .logo-scroll-grid::-webkit-scrollbar-track,
:global(.light-mode) .bracket-viewer-scroller::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.03) !important;
}

/* 10. High-contrast improvements for tournaments view in light mode */
:global(.light-mode .side-column .glass-panel h3) {
  color: #0f172a !important;
  border-bottom-color: rgba(15, 23, 42, 0.1) !important;
}

:global(.light-mode .sidebar-tour-item strong) {
  color: #0f172a !important;
}
:global(.light-mode .sidebar-tour-item.active strong) {
  color: #1e3a8a !important; /* Premium rich blue for active title */
}
:global(.light-mode .sidebar-tour-item span) {
  color: #475569 !important;
}
:global(.light-mode .sidebar-tour-item.active span) {
  color: #2563eb !important; /* Premium primary blue for active subtext */
}

/* Cloud registration URL readonly input high-contrast background */
:global(.light-mode .cloud-url-input) {
  background: #ffffff !important;
  color: #059669 !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

/* Player search input light mode overrides */
.player-search-input {
  background: rgba(15, 23, 42, 0.45) !important;
  color: white !important;
}
:global(.light-mode .player-search-input) {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}
:global(.light-mode .player-search-input::placeholder) {
  color: #94a3b8 !important;
}

/* Modal header title contrast fix */
:global(.light-mode .modal-header h2) {
  color: #0f172a !important;
}

/* Modal details/info box high contrast in light mode */
:global(.light-mode .modal-info-box) {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
}
:global(.light-mode .modal-info-box strong) {
  color: #1e293b !important;
}
:global(.light-mode .modal-info-box span) {
  color: #0f172a !important;
}

/* Modal amount input field styling for light mode */
.modal-amount-input {
  background: rgba(15, 23, 42, 0.45) !important;
  color: white !important;
}
:global(.light-mode .modal-amount-input) {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

/* Overlay & Modal containers light mode support */
:global(.light-mode .modal-overlay) {
  background: rgba(15, 23, 42, 0.35) !important;
  backdrop-filter: blur(5px) !important;
}
:global(.light-mode .modal-content),
:global(.light-mode .modal-content.glass-panel) {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  color: #0f172a !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:global(.light-mode .modal-content .modal-body-v3) {
  color: #0f172a !important;
}
:global(.light-mode .modal-content .modal-header) {
  border-bottom-color: #e2e8f0 !important;
}
:global(.light-mode .modal-content .btn-icon) {
  color: #dc2626 !important;
}

/* Inner groups inside modals (manual registration dialog) */
.modal-inner-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.payment-inner-box {
  border: 1px solid rgba(6, 182, 212, 0.15);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%);
  box-shadow: inset 0 0 15px rgba(6, 182, 212, 0.05);
}
:global(.light-mode .modal-inner-box) {
  background: rgba(15, 23, 42, 0.02) !important;
  border: 1px solid rgba(15, 23, 42, 0.06) !important;
}
:global(.light-mode .payment-inner-box) {
  border: 1px solid rgba(37, 99, 235, 0.15) !important;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(30, 41, 59, 0.02) 100%) !important;
  box-shadow: inset 0 0 10px rgba(37, 99, 235, 0.02) !important;
}

/* Highlighted spans in modals */
.text-highlight-yellow { color: #fbbf24; font-weight: bold; }
.text-highlight-cyan { color: #06b6d4; font-weight: bold; }
.text-highlight-green { color: #10b981; font-weight: bold; }
.text-highlight-red { color: #ef4444; font-weight: 900; }
.text-highlight-muted { color: #cbd5e1; }

:global(.light-mode .text-highlight-yellow) { color: #b45309 !important; }
:global(.light-mode .text-highlight-cyan) { color: #0891b2 !important; }
:global(.light-mode .text-highlight-green) { color: #059669 !important; }
:global(.light-mode .text-highlight-red) { color: #dc2626 !important; }
:global(.light-mode .text-highlight-muted) { color: #475569 !important; }

/* Table name cell and row contrast in accounts modal */
.td-tournament-name {
  color: #fff;
}
:global(.light-mode .td-tournament-name) {
  color: #0f172a !important;
}
.accounts-table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}
:global(.light-mode .accounts-table-row) {
  border-bottom: 1px solid rgba(15, 23, 42, 0.06) !important;
}
.modal-summary-footer {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
:global(.light-mode .modal-summary-footer) {
  background: rgba(15, 23, 42, 0.03) !important;
  border: 1px solid rgba(15, 23, 42, 0.06) !important;
}

/* Badge colors for cup, league, registration and statuses in light mode */
:global(.light-mode .badge.cup) {
  background: rgba(37, 99, 235, 0.08) !important;
  color: #2563eb !important;
  border-color: rgba(37, 99, 235, 0.2) !important;
}
:global(.light-mode .badge.league) {
  background: rgba(5, 150, 105, 0.08) !important;
  color: #059669 !important;
  border-color: rgba(5, 150, 105, 0.2) !important;
}
:global(.light-mode .badge.registration) {
  background: rgba(37, 99, 235, 0.08) !important;
  color: #2563eb !important;
}
:global(.light-mode .badge.active) {
  background: rgba(5, 150, 105, 0.08) !important;
  color: #059669 !important;
}
:global(.light-mode .badge.completed) {
  background: rgba(71, 85, 105, 0.08) !important;
  color: #475569 !important;
}

/* ==========================================================================
   PREMIUM FIELD SECTION LABELS STYLING (أقسام مميزة للنموذج)
   ========================================================================== */
.field-v3 {
  margin-bottom: 1.4rem;
}

.field-v3 > label {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  height: 32px !important;
  padding: 6px 12px !important;
  background: rgba(6, 182, 212, 0.07) !important;
  border: none !important;
  border-radius: 8px !important;
  color: var(--accent-cyan) !important;
  font-weight: 800 !important;
  font-size: 0.8rem !important;
  margin-bottom: 10px !important;
  box-sizing: border-box !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

/* Light Mode overrides for premium section labels */
:global(.light-mode) .field-v3 > label {
  background: rgba(37, 99, 235, 0.08) !important; /* slightly darker tint */
  border: none !important;
  color: #1e3a8a !important; /* high-contrast deep navy blue label text */
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02) !important;
}

/* Fix inner spans font inside section label to match perfectly */
.field-v3 > label span {
  font-weight: 800 !important;
  font-size: 0.8rem !important;
  color: inherit !important;
}

/* Sidebar Tournaments list items styling */
.sidebar-tour-item {
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-right: 4px solid transparent;
}
.sidebar-tour-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}
.sidebar-tour-item.active {
  background: rgba(6, 182, 212, 0.15) !important;
  border-color: var(--accent-cyan) !important;
  border-right: 4px solid var(--accent-cyan) !important;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.35) !important;
}

:global(.light-mode) .sidebar-tour-item {
  background: rgba(15, 23, 42, 0.02) !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
  border-right: 4px solid transparent !important;
}
:global(.light-mode) .sidebar-tour-item:hover {
  background: rgba(15, 23, 42, 0.05) !important;
}
:global(.light-mode) .sidebar-tour-item.active {
  background: rgba(37, 99, 235, 0.12) !important;
  border-color: var(--accent-primary) !important;
  border-right: 4px solid var(--accent-primary) !important;
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.2) !important;
}


/* Symmetric Bracket Styling for Dashboard */
.symmetric-bracket-scroller {
  overflow-x: auto;
  width: 100%;
  padding: 1.5rem 0;
  direction: ltr; /* Ensure layout remains left-to-right */
}
.symmetric-bracket-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  min-width: max-content;
  padding: 0 1rem;
}
.bracket-wing {
  display: flex;
  gap: 1.5rem;
}
.left-wing {
  direction: rtl; /* Arabic text alignment */
}
.right-wing {
  direction: rtl; /* Arabic text alignment */
}
.bracket-center-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 240px;
  gap: 1rem;
}
.trophy-stage {
  text-align: center;
  margin-bottom: 0.5rem;
}
.trophy-glow-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));
}
.trophy-title {
  color: #fbbf24;
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-top: 5px;
}
.final-match-node {
  width: 220px;
}

/* Groups stage containers */
.groups-stage-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.groups-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

@keyframes flashGlow {
  0%, 100% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.02);
    border-color: #fbbf24 !important;
    box-shadow: 0 0 25px rgba(251, 191, 36, 0.9) !important;
    background: rgba(251, 191, 36, 0.12) !important;
  }
}
.flash-highlight {
  animation: flashGlow 0.5s ease-in-out 3;
  transition: all 0.3s ease;
}
.logo-select-btn.logo-taken {
  opacity: 0.35;
  cursor: not-allowed;
  border-color: rgba(239, 68, 68, 0.3) !important;
  box-shadow: none !important;
  transform: none !important;
}
.logo-select-btn.logo-taken:hover {
  transform: none !important;
}

/* Side Panel / Drawer for Confirm Payment */
.side-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1000000;
  display: flex;
  justify-content: flex-end; /* Align to the right for RTL flow */
  transition: opacity 0.3s ease;
}

.side-panel-content {
  width: 100%;
  max-width: 480px;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  overflow-y: auto;
  animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Pulsing Confirm Button */
.btn-pulse-green {
  animation: pulse-glow-green 2s infinite !important;
  position: relative;
}

@keyframes pulse-glow-green {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
    transform: scale(1.03);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    transform: scale(1);
  }
}

/* 11. Tournament Highlight Name & Delete icon styles */
.active-tour-meta-card {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  padding: 12px 14px;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(0, 242, 254, 0.2);
  border-radius: 12px;
  box-sizing: border-box;
}

.light-mode .active-tour-meta-card {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.active-tour-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.active-tour-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
}

.active-tournament-title-highlight {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
  flex: 1;
  color: #00f2fe;
}

.light-mode .active-tournament-title-highlight {
  color: #1e3a8a;
}

.btn-delete-tour-icon {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  padding: 6px 12px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  transition: all 0.2s ease;
  box-sizing: border-box;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-delete-tour-icon:hover {
  background: #ef4444;
  color: #ffffff;
  transform: scale(1.05);
}

.light-mode .btn-delete-tour-icon {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.light-mode .btn-delete-tour-icon:hover {
  background: #dc2626;
  color: #ffffff;
}


/* New styles for details modal and prize highlight */
.prize-highlight {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9rem;
}
.prize-highlight.silver {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.4);
  color: #cbd5e1;
}
.prize-highlight.bronze {
  background: rgba(180, 83, 9, 0.2);
  border-color: rgba(180, 83, 9, 0.4);
  color: #fb923c;
}

.btn-details-tour-icon {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #10b981;
  padding: 6px 12px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  transition: all 0.2s ease;
  box-sizing: border-box;
  flex-shrink: 0;
  white-space: nowrap;
}
.btn-details-tour-icon:hover {
  background: #10b981;
  color: #ffffff;
  transform: scale(1.05);
}
:global(.light-mode) .btn-details-tour-icon {
  background: #e6f4ea !important;
  border-color: #a3cfec !important;
  color: #137333 !important;
}
:global(.light-mode) .btn-details-tour-icon:hover {
  background: #137333 !important;
  color: #ffffff !important;
}

.details-section {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 12px;
}
:global(.light-mode .details-modal-box .details-section) {
  background: #faf8f2 !important;
  border: 1px solid #e2ddd5 !important;
}

.prize-row-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.02);
  padding: 8px 12px;
  border-radius: 6px;
}
:global(.light-mode .details-modal-box .prize-row-detail) {
  background: #ffffff !important;
  border: 1px solid #e2ddd5 !important;
}

.prize-label-detail {
  font-weight: 600;
  color: #fbbf24;
}
:global(.light-mode .details-modal-box .prize-label-detail) {
  color: #b45309 !important;
}

.prize-value-detail {
  font-weight: bold;
  color: #fff;
}
:global(.light-mode .details-modal-box .prize-value-detail) {
  color: #0f172a !important;
}

.stat-card-detail {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid transparent;
}
.stat-card-detail .stat-title {
  font-size: 0.82rem;
  margin-bottom: 5px;
}
:global(.light-mode .details-modal-box .stat-card-detail .stat-title) {
  color: #475569 !important;
}
.stat-card-detail .stat-value {
  font-size: 1.15rem;
  font-weight: bold;
  color: #fff;
}
:global(.light-mode .details-modal-box .stat-card-detail .stat-value) {
  color: #0f172a !important;
}

.stat-card-detail.card-green {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
:global(.light-mode .details-modal-box .stat-card-detail.card-green) {
  background: #e6f4ea !important;
  border-color: #34d399 !important;
  color: #137333 !important;
}

.stat-card-detail.card-blue {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
:global(.light-mode .details-modal-box .stat-card-detail.card-blue) {
  background: #e0f2fe !important;
  border-color: #38bdf8 !important;
  color: #0369a1 !important;
}

.stat-card-detail.card-rose {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.2);
  color: #fb7185;
}
:global(.light-mode .details-modal-box .stat-card-detail.card-rose) {
  background: #ffe4e6 !important;
  border-color: #fb7185 !important;
  color: #b91c1c !important;
}

.stat-card-detail.card-amber {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
}
:global(.light-mode .details-modal-box .stat-card-detail.card-amber) {
  background: #fef3c7 !important;
  border-color: #fcd34d !important;
  color: #b45309 !important;
}


/* Details Modal — dedicated box class (bypasses glass-panel global) */
.details-modal-box {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%) !important;
  border: 1px solid rgba(6, 182, 212, 0.25) !important;
  border-radius: 20px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important;
  padding: 2rem !important;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  color: #e2e8f0 !important;
}
:global(.light-mode .details-modal-box) {
  background: #faf9f6 !important;
  border: 1px solid #d1ccc0 !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  color: #1e293b !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:global(.light-mode .details-modal-box .modal-header) {
  border-bottom-color: #e2ddd5 !important;
}
:global(.light-mode .details-modal-box .modal-body-v3) {
  color: #1e293b !important;
}
:global(.light-mode .details-modal-box .btn-icon) {
  color: #dc2626 !important;
}

/* Details Modal Title classes */
.details-modal-title {
  font-weight: 800;
  font-size: 1.15rem;
  color: #fbbf24;
  margin: 0;
}
:global(.light-mode .details-modal-title) {
  color: #b45309 !important;
}

/* Share Modal CSS (same manner as details modal) */
.share-modal-box {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%) !important;
  border: 1px solid rgba(251, 191, 36, 0.25) !important;
  border-radius: 20px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important;
  padding: 2rem !important;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  color: #e2e8f0 !important;
}
:global(.light-mode .share-modal-box) {
  background: #faf9f6 !important;
  border: 1px solid #d1ccc0 !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  color: #1e293b !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:global(.light-mode .share-modal-box .modal-header) {
  border-bottom-color: #e2ddd5 !important;
}
:global(.light-mode .share-modal-box .modal-body-v3) {
  color: #1e293b !important;
}
:global(.light-mode .share-modal-box .btn-icon) {
  color: #dc2626 !important;
}

.share-modal-title {
  font-weight: 800;
  font-size: 1.15rem;
  color: #fbbf24;
  margin: 0;
}
:global(.light-mode .share-modal-title) {
  color: #b45309 !important;
}

.share-modal-desc {
  color: #cbd5e1;
}
:global(.light-mode .share-modal-box .share-modal-desc) {
  color: #475569 !important;
}

.details-section-title {
  font-size: 1rem;
  margin-bottom: 10px;
  padding-bottom: 5px;
  font-weight: 800;
}

.details-title-green {
  color: #10b981;
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
}
:global(.light-mode .details-title-green) {
  color: #047857 !important;
  border-bottom-color: rgba(4, 120, 87, 0.25) !important;
}

.details-title-cyan {
  color: #06b6d4;
  border-bottom: 1px solid rgba(6, 182, 212, 0.2);
}
:global(.light-mode) .details-title-cyan {
  color: #0369a1 !important;
  border-bottom-color: rgba(3, 105, 161, 0.25) !important;
}


/* UI Crowning Certificate Layout Styles */
.certificate-container .tournament-title .tournament-label {
  color: #fbbf24;
}
.certificate-container .tournament-title .tournament-name-highlight {
  color: #fbbf24;
}
.certificate-container .winners-table-container .table-title {
  color: #fbbf24;
}
.certificate-container .winners-report-table th {
  color: #94a3b8;
}
.certificate-container .winners-report-table td span {
  color: #94a3b8;
}

.certificate-container {
  background: radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%) !important;
  border: 1px solid rgba(245, 158, 11, 0.25) !important;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.certificate-container .header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.certificate-container .lounge-name {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
  color: #fff !important;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.35rem 0.9rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
  display: inline-block;
}

.certificate-container .report-title {
  font-size: 1.8rem;
  color: #00f2fe;
  text-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
  margin: 5px 0;
  font-weight: 900;
  text-align: center;
}

.certificate-container .tournament-title {
  font-size: 1.4rem;
  color: #fbbf24;
  font-weight: 800;
  margin-top: 5px;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  white-space: nowrap;
  text-align: center;
  width: 100%;
}

.certificate-container .podium-section {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin: 30px 0 15px 0;
}

.certificate-container .podium-card {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 155px;
  position: relative;
  box-sizing: border-box;
}

.certificate-container .podium-card.gold {
  border-color: rgba(245, 158, 11, 0.4) !important;
  box-shadow: 0 0 25px rgba(245, 158, 11, 0.15) !important;
  padding: 2.2rem 1.2rem;
  transform: translateY(-15px);
  width: 175px;
}

.certificate-container .podium-card.silver {
  border-color: rgba(203, 213, 225, 0.3) !important;
}

.certificate-container .podium-card.bronze {
  border-color: rgba(180, 83, 9, 0.3) !important;
}

.certificate-container .medal-badge {
  font-size: 2rem;
  position: absolute;
  top: -20px;
}

.certificate-container .winner-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  font-size: 2.3rem;
}

.certificate-container .gold .winner-logo {
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
  width: 75px;
  height: 75px;
  font-size: 2.8rem;
}

.certificate-container .winner-nick {
  font-size: 1.05rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.certificate-container .gold .winner-nick {
  color: #fbbf24;
}

.certificate-container .rank-text {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: bold;
}

.certificate-container .footer-section {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.8rem;
  color: #64748b;
}

.certificate-container .stamp-area {
  text-align: right;
}

.certificate-container .stamp-title {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 25px;
}

.certificate-container .stamp-line {
  width: 120px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
}

.certificate-container .meta-time {
  font-size: 0.75rem;
  color: #64748b;
}

/* Light mode overrides for the screen certificate with high contrast */
:global(.light-mode .certificate-container) {
  background: radial-gradient(circle at 50% 30%, rgba(180, 83, 9, 0.03) 0%, #ffffff 100%) !important;
  border: 1px solid rgba(180, 83, 9, 0.2) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}
:global(.light-mode .certificate-container .header) {
  border-bottom-color: rgba(0, 0, 0, 0.08) !important;
}
:global(.light-mode .certificate-container .report-title) {
  color: #0f172a !important;
  text-shadow: none !important;
}
:global(.light-mode .certificate-container .tournament-title .tournament-label) {
  color: #475569 !important;
}
:global(.light-mode .certificate-container .tournament-title .tournament-name-highlight) {
  color: #b45309 !important;
  text-shadow: none !important;
}
:global(.light-mode .certificate-container .winner-nick) {
  color: #0f172a !important;
}
:global(.light-mode .certificate-container .winner-nick.gold-color) {
  color: #b45309 !important;
}
:global(.light-mode .certificate-container .rank-text) {
  color: #475569 !important;
}
:global(.light-mode .certificate-container .podium-card) {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
}
:global(.light-mode .certificate-container .podium-card.gold) {
  border-color: rgba(245, 158, 11, 0.5) !important;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.15) !important;
}
:global(.light-mode .certificate-container .footer-section) {
  border-top-color: rgba(0, 0, 0, 0.08) !important;
  color: #475569 !important;
}
:global(.light-mode .certificate-container .stamp-title) {
  color: #475569 !important;
}
:global(.light-mode .winners-table-container .table-title) {
  color: #b45309 !important;
}
:global(.light-mode .official-stamp) {
  border-color: #dc2626 !important;
  color: #dc2626 !important;
}
:global(.light-mode .official-stamp .stamp-mid) {
  border-color: #dc2626 !important;
}
:global(.light-mode .certificate-container .winners-report-table th) {
  color: #475569 !important;
}
:global(.light-mode .certificate-container .winners-report-table td span) {
  color: #475569 !important;
}



/* UI Crowning Certificate Layout Styles */
.certificate-container .winner-logo, .certificate-container .player-logo-large {
  font-size: 1.6rem !important; /* Scale down so flag emojis with symbols fit nicely */
  white-space: nowrap !important;
  overflow: hidden !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}
.certificate-container .gold .winner-logo {
  font-size: 2rem !important;
}

/* Official red ink stamp styled in CSS */
/* ============================================
   Modern Premium Official Stamp Design
   ============================================ */
.official-stamp {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transform: rotate(-8deg) !important;
  cursor: default !important;
}

.stamp-outer-ring {
  width: 140px !important;
  height: 140px !important;
  border-radius: 50% !important;
  border: 3px solid #ef4444 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  background: rgba(239, 68, 68, 0.04) !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.18) !important;
  will-change: auto !important;
}

.stamp-outer-ring::before {
  content: '' !important;
  position: absolute !important;
  inset: 5px !important;
  border-radius: 50% !important;
  border: 1px dashed rgba(239,68,68,0.5) !important;
}

.stamp-inner-ring {
  width: 110px !important;
  height: 110px !important;
  border-radius: 50% !important;
  border: 2px solid rgba(239,68,68,0.55) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(239, 68, 68, 0.03) !important;
}

.stamp-content {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 1px !important;
  padding: 4px !important;
  text-align: center !important;
  width: 100% !important;
}

.stamp-icon {
  font-size: 1.3rem !important;
  line-height: 1 !important;
  display: block !important;
}

.stamp-lounge-name {
  font-size: 0.72rem !important;
  font-weight: 900 !important;
  color: #ef4444 !important;
  font-family: 'Cairo', sans-serif !important;
  letter-spacing: 0.2px !important;
  padding: 2px 4px !important;
  border-top: 1px solid rgba(239,68,68,0.55) !important;
  border-bottom: 1px solid rgba(239,68,68,0.55) !important;
  max-width: 96px !important;
  word-break: break-word !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  display: block !important;
  text-align: center !important;
  line-height: 1.25 !important;
}

.stamp-tagline {
  font-size: 0.5rem !important;
  font-weight: 700 !important;
  color: #ef4444 !important;
  font-family: 'Cairo', sans-serif !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  display: block !important;
  opacity: 0.85 !important;
}

.stamp-brand {
  font-size: 0.45rem !important;
  font-weight: 800 !important;
  color: rgba(239,68,68,0.7) !important;
  font-family: 'Cairo', sans-serif !important;
  letter-spacing: 1.5px !important;
  text-transform: uppercase !important;
  display: block !important;
}

.stamp-title {
  font-size: 0.7rem !important;
  color: #94a3b8 !important;
  margin-bottom: 6px !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
}

/* Winners table container styles */
.winners-report-table th, .winners-report-table td {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
:global(.light-mode) .winners-report-table {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
}
:global(.light-mode) .winners-report-table th {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-color: #cbd5e1 !important;
}
:global(.light-mode) .winners-report-table td {
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}
:global(.light-mode) .winners-report-table td span {
  color: #64748b !important;
}
:global(.light-mode) .official-stamp .stamp-outer-ring {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 1.5px rgba(220,38,38,0.2), inset 0 0 0 1.5px rgba(220,38,38,0.15), 0 0 18px rgba(220,38,38,0.15) !important;
}
:global(.light-mode) .official-stamp .stamp-outer-ring::before {
  border-color: rgba(220,38,38,0.5) !important;
}
:global(.light-mode) .official-stamp .stamp-inner-ring {
  border-color: rgba(220,38,38,0.6) !important;
}
:global(.light-mode) .official-stamp .stamp-lounge-name {
  color: #dc2626 !important;
  border-color: rgba(220,38,38,0.6) !important;
}
:global(.light-mode) .official-stamp .stamp-tagline,
:global(.light-mode) .official-stamp .stamp-brand {
  color: #dc2626 !important;
}
:global(.light-mode) .stamp-title {
  color: #64748b !important;
}

/* Share Modal Cards */
.share-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 15px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  box-sizing: border-box;
  background: rgba(30, 41, 59, 0.4);
}

.share-option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.share-option-card .share-icon {
  font-size: 2.2rem;
  transition: transform 0.3s ease;
}

.share-option-card:hover .share-icon {
  transform: scale(1.15) rotate(5deg);
}

.share-option-card .share-title {
  font-weight: 800;
  font-size: 1.05rem;
}

.share-option-card .share-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.3;
}

/* Gradients for option hover effects */
.share-option-card.card-pdf:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%);
  border-color: rgba(239, 68, 68, 0.4);
}
.share-option-card.card-pdf .share-title {
  color: #ef4444;
}

.share-option-card.card-image:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-color: rgba(59, 130, 246, 0.4);
}
.share-option-card.card-image .share-title {
  color: #3b82f6;
}

.share-option-card.card-social:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-color: rgba(16, 185, 129, 0.4);
}
.share-option-card.card-social .share-title {
  color: #10b981;
}

.share-option-card.card-print:hover {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%);
  border-color: rgba(6, 182, 212, 0.4);
}
.share-option-card.card-print .share-title {
  color: #06b6d4;
}

/* Light mode support for cards */
:global(.light-mode .share-modal-box .share-option-card) {
  background: #ffffff !important;
  border: 1px solid #e2ddd5 !important;
  color: #1e293b !important;
}
:global(.light-mode .share-modal-box .share-option-card .share-title) {
  color: #1e293b !important;
}
:global(.light-mode .share-modal-box .share-option-card .share-desc) {
  color: #64748b !important;
}
:global(.light-mode .share-modal-box .share-option-card:hover) {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important;
}

/* Gradients for option hover effects in light mode */
:global(.light-mode .share-modal-box .share-option-card.card-pdf:hover) {
  background: #ffebee !important;
  border-color: #ef4444 !important;
}
:global(.light-mode .share-modal-box .share-option-card.card-pdf:hover .share-title) {
  color: #ef4444 !important;
}

:global(.light-mode .share-modal-box .share-option-card.card-image:hover) {
  background: #e3f2fd !important;
  border-color: #3b82f6 !important;
}
:global(.light-mode .share-modal-box .share-option-card.card-image:hover .share-title) {
  color: #3b82f6 !important;
}

:global(.light-mode .share-modal-box .share-option-card.card-social:hover) {
  background: #e8f5e9 !important;
  border-color: #10b981 !important;
}
:global(.light-mode .share-modal-box .share-option-card.card-social:hover .share-title) {
  color: #10b981 !important;
}

:global(.light-mode .share-modal-box .share-option-card.card-print:hover) {
  background: #e0f7fa !important;
  border-color: #06b6d4 !important;
}
:global(.light-mode .share-modal-box .share-option-card.card-print:hover .share-title) {
  color: #06b6d4 !important;
}

</style>

