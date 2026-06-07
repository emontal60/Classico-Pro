<template>
  <div class="mobile-registration-wrapper" style="direction: rtl;">
    <!-- Top Glowing Accent -->
    <div class="glow-accent-top"></div>

    <div class="registration-container">
      <!-- Header Area -->
      <header class="reg-header animate-fade-in">
        <div class="modern-trophy-wrapper">
          <div class="trophy-glow-halo"></div>
          <svg class="modern-trophy-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffe066" />
                <stop offset="50%" stop-color="#fbbf24" />
                <stop offset="100%" stop-color="#d97706" />
              </linearGradient>
            </defs>
            <path d="M5 9c0-2.5 2-4.5 4.5-4.5h5C17 4.5 19 6.5 19 9v1.5c0 3-2.5 5.5-5.5 5.5h-3C7.5 16 5 13.5 5 10.5V9z" fill="url(#goldGrad)" />
            <path d="M5 8c-1.5 0-2.5 1-2.5 2.5s1 2.5 2.5 2.5M19 8c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5" stroke="url(#goldGrad)" stroke-width="2" stroke-linecap="round" />
            <path d="M12 16v3M8 19h8M6 21h12" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />
            <path d="M9 6.5C9 5.5 10 5 11 5" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.6" />
            <path d="M12 8l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" fill="#fff" />
          </svg>
        </div>
        <h1 class="glow-text">بطولات {{ currentAppName }}</h1>
        <p class="subtitle-text">التسجيل والاشتراك المباشر في البطولة</p>
      </header>

      <!-- Loading State -->
      <div v-if="store.isLoading" class="loading-state animate-pulse">
        <div class="spinner"></div>
        <p>جاري تحميل تفاصيل البطولة...</p>
      </div>

      <!-- Landing Page (Multiple Tournaments List) -->
      <div v-else-if="!activeTournament && availableTournaments.length > 0" class="tournaments-landing-page animate-fade-in">
        <div class="landing-hero glass-panel animate-scale-in" style="margin-bottom: 1.5rem; text-align: center; padding: 2rem 1.5rem;">
          <div class="trophy-badge" style="font-size: 3.5rem; margin-bottom: 0.5rem;">🏆</div>
          <h2 class="glow-text" style="font-size: 1.6rem; font-weight: 900; color: #fff;">البطولات والمسابقات النشطة</h2>
          <p style="color: #94a3b8; font-size: 0.88rem; margin-top: 0.3rem;">اختر إحدى البطولات الجارية للتسجيل أو لمتابعة النتائج حياً 🎮</p>
        </div>

        <div class="tournaments-grid" style="display: flex; flex-direction: column; gap: 1.2rem;">
          <div 
            v-for="t in availableTournaments" 
            :key="t.id" 
            class="tournament-card glass-panel interactive-match-card animate-scale-in" 
            style="padding: 1.2rem !important; cursor: pointer; transition: all 0.3s ease; position: relative;"
            @click="selectTournament(t.id)"
          >
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
              <span class="type-tag" :class="t.type">
                {{ getTournamentTypeLabel(t.type) }}
              </span>
              <span class="status-tag" :class="t.status" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 12px;">
                {{ getStatusLabel(t.status) }}
              </span>
            </div>
            
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0 0 10px 0; text-align: right; text-shadow: 0 0 8px rgba(6,182,212,0.15);">{{ t.name }}</h3>
            
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.18); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02);">
              <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span style="font-size: 0.68rem; color: #64748b;">سعر الاشتراك</span>
                <span style="font-size: 0.9rem; font-weight: 900; color: #10b981;">{{ t.fee }} ج</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="font-size: 0.68rem; color: #64748b;">المشتركين</span>
                <span style="font-size: 0.9rem; font-weight: 900; color: #06b6d4;">{{ t.players?.length || 0 }} / {{ t.maxPlayers }}</span>
              </div>
            </div>

            <div style="margin-top: 1rem; display: flex; justify-content: center;">
              <button class="btn-submit-neon" style="margin: 0; padding: 0.6rem 1.5rem; font-size: 0.85rem; width: auto; border-radius: 10px;">
                {{ t.status === 'registration' ? 'التسجيل في البطولة 📝' : 'عرض جدول الترتيب والمباريات 📊' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tournament Not Found State (tid was specified but not found in cloud) -->
      <div v-else-if="tournamentNotFound" class="no-tournament-card glass-panel animate-scale-in" style="border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.05);">
        <div class="warning-icon">⚠️</div>
        <h2 style="color: #ef4444;">البطولة غير متاحة</h2>
        <p style="color: #94a3b8;">البيانات لم تصل بعد إلى السحابة، يرجى الانتظار دقيقة ثم تحديث الصفحة.</p>
        <button @click="window.location.reload()" style="margin-top: 1rem; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #ef4444; padding: 0.6rem 1.5rem; border-radius: 10px; cursor: pointer; font-size: 0.9rem; font-weight: bold;">
          🔄 تحديث الصفحة
        </button>
      </div>

      <!-- No Tournaments State -->
      <div v-else-if="!activeTournament" class="no-tournament-card glass-panel animate-scale-in">
        <div class="warning-icon">🛑</div>
        <h2>لا توجد بطولات حالياً</h2>
        <p>عذراً، لا توجد أي بطولات مفتوحة للتسجيل في الوقت الحالي.</p>
        <div class="info-footer">يرجى المتابعة مع إدارة الصالة لمعرفة مواعيد البطولات القادمة 🎮</div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Back button if multiple tournaments exist -->
        <div v-if="availableTournaments.length > 1" style="margin-bottom: 1.2rem; display: flex; justify-content: flex-start;">
          <button @click="backToLanding" class="btn secondary-btn" style="padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: bold; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #94a3b8; display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <span>← العودة لقائمة البطولات</span>
          </button>
        </div>

        <!-- Tournament Details Banner -->
        <div class="tournament-banner glass-panel animate-scale-in">
          <div class="banner-header">
            <span class="type-tag" :class="activeTournament.type">
              {{ getTournamentTypeLabel(activeTournament.type) }}
            </span>
            <span class="status-tag" :class="activeTournament.status">
              {{ getStatusLabel(activeTournament.status) }}
            </span>
          </div>
          <h2 class="tournament-title">{{ activeTournament.name }}</h2>
          
          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">سعر الاشتراك</span>
              <span class="value success-color">{{ activeTournament.fee }} ج</span>
            </div>
            <div class="stat-item">
              <span class="label">المشتركين</span>
              <span class="value cyan-color">{{ activeTournament.players.length }} / {{ activeTournament.maxPlayers }}</span>
            </div>
            
            <div class="prizes-container-card">
              <h4 class="prizes-title">🏆 جوائز ومكافآت البطولة المرصودة</h4>
              
              <div v-if="activeTournament.prizesList && activeTournament.prizesList.length > 0" class="prizes-list">
                <div 
                  v-for="(p, idx) in activeTournament.prizesList" 
                  :key="idx" 
                  class="prize-item-row"
                  :class="['rank-' + idx]"
                >
                  <div class="prize-rank-info">
                    <span class="prize-medal">{{ getMedalEmoji(idx, p.label) }}</span>
                    <span class="prize-label">{{ p.label }}</span>
                  </div>
                  <span class="prize-value">{{ p.value }}</span>
                </div>
              </div>
              
              <div v-else class="no-prizes-hint">
                {{ activeTournament.prizes || 'تحدد لاحقاً للبطولة 🏆' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation tabs: Register vs Follow Tournament -->
        <div v-if="activeTournament" class="view-mode-tabs animate-fade-in" style="display: flex; gap: 10px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <button 
            type="button"
            @click="viewMode = 'register'" 
            :class="['tab-btn', { active: viewMode === 'register' }]"
            style="flex: 1; padding: 10px; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s; background: none; color: #94a3b8;"
          >
            📝 تسجيل لاعب جديد
          </button>
          <button 
            type="button"
            @click="viewMode = 'dashboard'" 
            :class="['tab-btn', { active: viewMode === 'dashboard' }]"
            style="flex: 1; padding: 10px; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s; background: none; color: #94a3b8;"
          >
            📊 متابعة البطولة (لوحة اللاعب)
          </button>
        </div>

        <div v-if="viewMode === 'register'">
          <!-- 1. Registration Form (Only if registration is open) -->
          <div v-if="activeTournament.status === 'registration'" class="form-container glass-panel animate-scale-in" style="margin-top: 1.5rem;">
            <h3 class="panel-title">📝 استمارة الاشتراك بالبطولة</h3>
            
            <div v-if="registrationSuccess" class="success-message-card">
              <div class="success-icon">✅</div>
              <h4>تم تسجيل البيانات بنجاح!</h4>
              <p v-if="activeTournament.fee > 0" class="paid-hint" style="font-size: 0.9rem; border: 1px solid rgba(251, 191, 36, 0.25); background: rgba(251, 191, 36, 0.05); padding: 12px; border-radius: 12px; color: #fbbf24; line-height: 1.6; text-align: center; margin-top: 10px;">
                ⏳ <strong>حالة الطلب: معلق بانتظار موافقة الإدارة</strong><br>
                تم استلام تفاصيل سداد الاشتراك بنجاح (رقم العملية: <strong>{{ lastTxId }}</strong>).<br>
                سيتم تأكيد وتفعيل اسمك بالبطولة فور مراجعة الإدارة للتحويل ومطابقته.
              </p>
              <p v-else class="paid-hint">🎉 تم تسجيلك وتأكيد اشتراكك بالبطولة مجاناً بنجاح!</p>
            </div>

            <!-- If tournament is full -->
            <div v-else-if="activeTournament.players.length >= activeTournament.maxPlayers" class="success-message-card" style="padding: 1.5rem 0.5rem; text-align: center;">
              <div class="success-icon" style="font-size: 3.5rem; margin-bottom: 0.8rem; filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4));">🛑</div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: #ef4444; margin-bottom: 10px;">عذراً، اكتمل العدد المطلوب للتسجيل!</h4>
              <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">لقد اكتمل العدد المطلوب للتسجيل في هذه البطولة ({{ activeTournament.players.length }} / {{ activeTournament.maxPlayers }}). يرجى الانتظار والمتابعة مع إدارة الصالة للمشاركة في بطولة أخرى قريباً! 🏆</p>
            </div>

            <form v-else @submit.prevent="openSummaryModal" class="registration-form">
              <div class="input-group">
                <label>الاسم رباعي بالكامل 👤</label>
                <input 
                  type="text" 
                  v-model="form.fullName" 
                  placeholder="أدخل اسمك رباعي كما هو في البطاقة"
                  required
                  class="premium-input"
                >
              </div>

              <div class="input-group">
                <label>الاسم الحركي / المستعار (Nickname) 👾</label>
                <input 
                  type="text" 
                  v-model="form.nickname" 
                  placeholder="مثال: Neo, Shadow, Sniper"
                  required
                  class="premium-input"
                  maxLength="16"
                  :class="{ 'input-error': isNicknameTaken }"
                >
                <span v-if="isNicknameTaken" class="error-msg-text animate-fade-in">⚠️ هذا الاسم المستعار محجوز بالفعل في هذه البطولة!</span>
              </div>

              <!-- Render phone field here ONLY if free tournament. If paid, it's rendered inside payment section -->
              <div v-if="activeTournament.fee === 0" class="input-group">
                <label>رقم الهاتف الخاص بك 📱</label>
                <input 
                  type="tel" 
                  v-model="form.phone" 
                  placeholder="مثال: 010xxxxxxxx"
                  required
                  class="premium-input"
                >
              </div>

              <!-- Avatar Selection -->
              <div class="input-group">
                <label class="avatar-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>اختر شعار فريقك (أندية ومنتخبات) ⚽</span>
                  <span class="selected-badge-preview animate-scale-in" v-if="form.logoId !== null" style="font-size: 0.78rem;">
                    الشعار المحدد: <span style="color: #fbbf24; font-weight: bold;">{{ CURATED_LOGOS[form.logoId]?.name }}</span>
                    <span class="logo-preview-icon" :style="getLogoStyle(form.logoId)">{{ getLogoSymbol(form.logoId) }}</span>
                  </span>
                </label>
                
                <div class="logo-scroll-grid">
                  <button
                    type="button"
                    v-for="(logo, idx) in CURATED_LOGOS"
                    :key="idx"
                    :class="['logo-select-btn', { active: form.logoId === idx, 'logo-taken': isLogoTaken(idx) && form.logoId !== idx }]"
                    :style="getLogoStyle(idx)"
                    :disabled="isLogoTaken(idx) && form.logoId !== idx"
                    @click="form.logoId = idx"
                    :title="isLogoTaken(idx) ? 'هذا الشعار محجوز بالفعل 🔒' : logo.name"
                  >
                    <span class="logo-symbol">{{ isLogoTaken(idx) && form.logoId !== idx ? '🔒' : logo.symbol }}</span>
                  </button>
                </div>
              </div>

              <!-- قسم السداد والدفع المالي للبطولة -->
              <div v-if="activeTournament.fee > 0" class="payment-section-form glass-panel animate-scale-in" style="margin-top: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(6, 182, 212, 0.25); background: rgba(6, 182, 212, 0.03); padding: 15px !important; border-radius: 14px; text-align: right;">
                <h4 style="color: #06b6d4; font-weight: 800; font-size: 0.95rem; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                  <span>💸 معلومات سداد قيمة الاشتراك</span>
                </h4>
                
                <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02); margin-bottom: 1rem; font-size: 0.8rem; line-height: 1.6; color: #e2e8f0;">
                  <div>💰 <strong>رسوم الاشتراك:</strong> <span style="color: #10b981; font-weight: 900;">{{ activeTournament.fee }} ج</span></div>
                  
                  <!-- Display Instapay number if supported and selected -->
                  <div v-if="form.paymentMethod === 'instapay' && activeTournament.paymentNumberInstapay" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                    <div>
                      ⚡ <strong>رقم/عنوان حساب انستا باي:</strong> 
                      <span style="color: #fbbf24; font-weight: bold; font-family: monospace; letter-spacing: 0.5px; margin-right: 5px;">{{ activeTournament.paymentNumberInstapay }}</span>
                    </div>
                    <button type="button" @click="copyPaymentNumber(activeTournament.paymentNumberInstapay)" class="copy-btn-small">نسخ 📋</button>
                  </div>
                  <!-- Display Wallet number if supported and selected -->
                  <div v-if="form.paymentMethod === 'wallet' && activeTournament.paymentNumberWallet" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                    <div>
                      📱 <strong>رقم محفظة الكاش:</strong> 
                      <span style="color: #fbbf24; font-weight: bold; font-family: monospace; letter-spacing: 0.5px; margin-right: 5px;">{{ activeTournament.paymentNumberWallet }}</span>
                    </div>
                    <button type="button" @click="copyPaymentNumber(activeTournament.paymentNumberWallet)" class="copy-btn-small">نسخ الرقم 📋</button>
                  </div>
                  <!-- Display Cash instructions if supported and selected -->
                  <div v-if="form.paymentMethod === 'cash' && activeTournament.paymentNumberCash">
                    🏟️ <strong>تعليمات الدفع كاش:</strong> 
                    <span style="color: #fbbf24; font-weight: bold;">{{ activeTournament.paymentNumberCash }}</span>
                  </div>
                </div>

                <div class="input-group" style="margin-bottom: 1rem;" v-if="activeTournament.paymentMethod === 'both'">
                  <label>وسيلة الدفع المفضلة 💳</label>
                  <select v-model="form.paymentMethod" class="premium-input" style="width: 100%; background: rgba(0,0,0,0.3); color: #fff;">
                    <option value="instapay">انستا باى ⚡</option>
                    <option value="wallet">محفظه كاش 📱</option>
                  </select>
                </div>

                <!-- خيارات السداد كامل / جزئي -->
                <div class="input-group" style="margin-bottom: 1rem;">
                  <label>خيار السداد المفضل 💸</label>
                  <div class="payment-type-selector" style="display: flex; gap: 10px;">
                    <button
                      type="button"
                      class="pay-type-btn"
                      :class="{ active: form.paymentType === 'full' }"
                      @click="setPaymentType('full')"
                      style="flex: 1; padding: 10px; font-weight: bold; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #fff; cursor: pointer; transition: all 0.25s;"
                    >
                      💵 سداد كامل الاشتراك
                    </button>
                    <button
                      type="button"
                      class="pay-type-btn"
                      :class="{ active: form.paymentType === 'partial' }"
                      @click="setPaymentType('partial')"
                      style="flex: 1; padding: 10px; font-weight: bold; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #fff; cursor: pointer; transition: all 0.25s;"
                    >
                      💸 سداد دفعة جزئية
                    </button>
                  </div>
                </div>

                <!-- حقل إدخال المبلغ المحوّل -->
                <div class="input-group" style="margin-bottom: 1rem;">
                  <label>المبلغ الذي قمت بتحويله (ج) 💸</label>
                  <input 
                    type="number" 
                    v-model.number="form.amountPaid" 
                    :min="1" 
                    :max="activeTournament.fee" 
                    placeholder="اكتب المبلغ الذي قمت بتحويله بالكامل أو جزء منه" 
                    required
                    class="premium-input"
                    style="border-color: rgba(251, 191, 36, 0.4) !important;"
                    :readonly="form.paymentType === 'full'"
                  >
                  <span style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px; display: block;">سداد قيمة الاشتراك صحيحة لا تزيد عن قيمة الاشتراك الكاملة ({{ activeTournament.fee }} ج).</span>
                </div>

                <!-- حقل رقم الهاتف داخل قسم الدفع مع التنبيه -->
                <div class="input-group" style="margin-bottom: 1.2rem;">
                  <label>رقم الهاتف الخاص بك (رقم الدفع والمحفظة) 📱</label>
                  <input 
                    type="tel" 
                    v-model="form.phone" 
                    placeholder="مثال: 010xxxxxxxx"
                    required
                    class="premium-input"
                    style="border-color: rgba(251, 191, 36, 0.4) !important;"
                  >
                  <span style="font-size: 0.76rem; color: #fbbf24; line-height: 1.5; margin-top: 6px; display: block; border: 1px solid rgba(251, 191, 36, 0.2); background: rgba(251, 191, 36, 0.04); padding: 8px 12px; border-radius: 8px;">
                    ⚠️ <strong>تنبيه هام:</strong> يجب أن يكون رقم الهاتف المدخل هنا هو نفس الرقم الذي قمت بالتحويل منه لضمان مطابقة وإثبات عملية الدفع بنجاح.
                  </span>
                </div>

                <!-- حقول انستاباي الخاصة -->
                <div v-if="form.paymentMethod === 'instapay' || form.paymentMethod === 'wallet'" class="animate-scale-in" style="display: flex; flex-direction: column; gap: 1rem;">
                  <!-- حقل رقم العملية -->
                  <div class="input-group" style="margin-bottom: 0;">
                    <label>رقم العملية المرجعي للتحويل (Reference / TxID) 🔢</label>
                    <input 
                      type="text" 
                      v-model="form.transactionId" 
                      placeholder="أدخل كود تأكيد التحويل من رسالة المحول" 
                      required
                      class="premium-input"
                    >
                  </div>
                </div>
                
                <!-- رسالة توضيحية لدفعة الكاش بالصالة -->
                <div v-else class="animate-scale-in" style="font-size: 0.8rem; color: #94a3b8; line-height: 1.5; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); text-align: center;">
                  📣 يرجى التوجه لموظف الكاونتر بالصالة لسداد الرسوم نقداً وتأكيد اشتراكك في أقرب وقت. طلبك سيكون معلقاً ⏳ حتى إتمام الدفع.
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-submit-neon" 
                :disabled="submitting || activeTournament.players.length >= activeTournament.maxPlayers"
              >
                <span v-if="submitting">جاري تسجيل البيانات... ⌛</span>
                <span v-else-if="activeTournament.players.length >= activeTournament.maxPlayers">عذراً، البطولة مكتملة العدد 🛑</span>
                <span v-else-if="activeTournament.fee > 0">تأكيد تفاصيل الدفع والتسجيل المعلق 🏆</span>
                <span v-else>تأكيد وتسجيل الاشتراك بالبطولة 🏆</span>
              </button>
            </form>
          </div>
        </div>

        <div v-else-if="viewMode === 'dashboard'">
          <!-- Follow Portal Login Form -->
          <div v-if="!loggedInPlayer" class="login-container glass-panel animate-scale-in" style="margin-top: 1rem; text-align: right;">
            <h3 class="panel-title" style="color: #06b6d4;">📊 متابعة البطولة ودخول اللاعبين</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem; line-height: 1.5;">
              الرجاء إدخال بيانات التسجيل الخاصة بك للدخول إلى لوحة التحكم الشخصية لمتابعة مباراتك القادمة وترتيبك حياً:
            </p>

            <form @submit.prevent="handleFollowLogin" style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="input-group">
                <label>الاسم الحركي / المستعار (Nickname) 👾</label>
                <input 
                  type="text" 
                  v-model="followForm.nickname" 
                  placeholder="أدخل اسمك المستعار المسجل بدقة"
                  required
                  class="premium-input"
                >
              </div>
              
              <div class="input-group">
                <label>رقم الهاتف الخاص بك 📱</label>
                <input 
                  type="tel" 
                  v-model="followForm.phone" 
                  placeholder="أدخل رقم الهاتف المسجل"
                  required
                  class="premium-input"
                >
              </div>

              <div v-if="followLoginError" class="error-msg-text" style="text-align: center; margin-bottom: 5px;">
                {{ followLoginError }}
              </div>

              <button type="submit" class="btn btn-submit-neon">
                🔑 دخول إلى لوحة المتابعة
              </button>
            </form>
          </div>

          <!-- Follow Portal Dashboard Mode -->
          <div v-else class="player-dashboard-container animate-scale-in" style="display: flex; flex-direction: column; gap: 1.5rem; text-align: right; margin-top: 1rem;">
            <!-- Player Welcome Card -->
            <div class="player-welcome-card glass-panel" style="border-right: 4px solid #fbbf24; background: linear-gradient(90deg, rgba(251, 191, 36, 0.05) 0%, rgba(30, 41, 59, 0.45) 100%) !important;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="player-logo-large" :style="getLogoStyle(loggedInPlayer.logoId)" style="width: 50px; height: 50px; font-size: 1.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    {{ getLogoSymbol(loggedInPlayer.logoId) }}
                  </span>
                  <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.15rem;">أهلاً بك، {{ loggedInPlayer.nickname }} 👋</h3>
                    <span style="color: #fbbf24; font-size: 0.76rem; font-weight: bold;">{{ CURATED_LOGOS[loggedInPlayer.logoId]?.name }}</span>
                  </div>
                </div>
                <button @click="handleFollowLogout" class="copy-btn-small" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">خروج ➔</button>
              </div>
              
              <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px; font-size: 0.8rem;">
                <div>💰 <strong>حالة الاشتراك:</strong> <span style="color: #10b981; font-weight: bold;">مؤكد ومفعل ✅</span></div>
                <div>💵 <strong>المدفوع:</strong> <span style="color: #fbbf24; font-weight: bold;">{{ loggedInPlayer.amountConfirmed || loggedInPlayer.amountPaid || activeTournament.fee }} ج</span></div>
              </div>
            </div>

            <!-- Player Next Match Highlight -->
            <div v-if="playerNextMatch" class="player-match-highlight-card glass-panel" style="border: 2px solid #00f2fe !important; box-shadow: 0 0 20px rgba(0, 242, 254, 0.2) !important;">
              <h4 style="margin: 0 0 10px 0; color: #00f2fe; text-align: center; font-size: 0.95rem; font-weight: 800;">⚔️ مباراتك القادمة في البطولة</h4>
              
              <div style="display: flex; align-items: center; justify-content: space-around; gap: 10px; margin: 15px 0;">
                <!-- Current Player -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                  <span class="player-logo-large" :style="getLogoStyle(loggedInPlayer.logoId)" style="width: 45px; height: 45px; font-size: 1.6rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    {{ getLogoSymbol(loggedInPlayer.logoId) }}
                  </span>
                  <span style="font-size: 0.85rem; font-weight: bold; color: #fff; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">{{ loggedInPlayer.nickname }}</span>
                </div>

                <div style="font-weight: 900; font-size: 1.2rem; color: #cbd5e1; font-family: monospace;">VS</div>

                <!-- Opponent -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                  <span class="player-logo-large" :style="getPlayerLogoStyle(playerNextMatch.opponentId)" style="width: 45px; height: 45px; font-size: 1.6rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    {{ getPlayerLogoSymbol(playerNextMatch.opponentId) }}
                  </span>
                  <span style="font-size: 0.85rem; font-weight: bold; color: #fbbf24; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">{{ getPlayerNickname(playerNextMatch.opponentId) }}</span>
                </div>
              </div>

              <div style="text-align: center; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                🏆 <span>{{ playerNextMatch.roundName }}</span>
              </div>
            </div>
            <div v-else class="player-match-highlight-card glass-panel" style="text-align: center; padding: 1.5rem;">
              <span style="font-size: 2rem;">🎮</span>
              <h4 style="margin: 8px 0 4px 0; color: #fff;">لا توجد مباراة مجدولة حالياً</h4>
              <p v-if="activeTournament.status === 'registration'" style="color: #94a3b8; font-size: 0.8rem; margin: 0;">بانتظار توليد مواجهات وقرعة البطولة من قبل الإدارة ⏳</p>
              <p v-else style="color: #94a3b8; font-size: 0.8rem; margin: 0;">انتهت مواجهاتك بالبطولة أو تم إقصاؤك. حظاً موفقاً! 🏆</p>
            </div>
          </div>
        </div>

        <!-- 2. Live Tournament View (If Active or Completed) -->
        <div v-if="activeTournament.status !== 'registration'" class="live-bracket-container glass-panel animate-scale-in" style="margin-top: 1.5rem;">
          <h3 class="panel-title">📊 خريطة وجدول مباريات البطولة حياً</h3>
          
          <!-- Cup Bracket Rendering (Symmetric Layout) -->
          <div v-if="activeTournament.type === 'cup'" class="symmetric-bracket-scroller">
            <div v-if="symmetricCupRounds" class="symmetric-bracket-container">
              <!-- Left Wing -->
              <div class="bracket-wing left-wing" v-if="symmetricCupRounds.leftRounds.length > 0">
                <div v-for="round in symmetricCupRounds.leftRounds" :key="'l-r-' + round.index" class="bracket-round-column" style="min-width: 180px;">
                  <h4 class="round-title-banner">{{ round.name }}</h4>
                  <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1rem;">
                    <div 
                      v-for="match in round.matches" 
                      :key="match.id" 
                      class="bracket-match-node" 
                      :class="{ 'player-highlight-node': loggedInPlayer && (match.player1Id === loggedInPlayer.id || match.player2Id === loggedInPlayer.id) }"
                      style="padding: 0.5rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;"
                    >
                      <!-- Player 1 -->
                      <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                        <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                          {{ getPlayerLogoSymbol(match.player1Id) }}
                        </span>
                        <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player1Id) }}</span>
                        <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player1Score : '-' }}</span>
                      </div>
                      <div class="vs-divider" style="font-size: 0.65rem; text-align: center; color: #475569; font-weight: bold; margin: 0.2rem 0;">ضد</div>
                      <!-- Player 2 -->
                      <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                        <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                          {{ getPlayerLogoSymbol(match.player2Id) }}
                        </span>
                        <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player2Id) }}</span>
                        <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player2Score : '-' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
 
              <!-- Center Wing (Trophy & Final) -->
              <div class="bracket-center-column" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 230px; gap: 1rem;">
                <div class="trophy-stage animate-pulse" style="text-align: center; margin-bottom: 0.5rem;">
                  <span class="trophy-glow-icon" style="font-size: 4rem; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));">🏆</span>
                  <div class="trophy-title" style="color: #fbbf24; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; margin-top: 5px;">كأس البطولة</div>
                </div>
                
                <div class="final-round-title" style="color: #fbbf24; font-weight: 800; font-size: 0.9rem; text-align: center; margin-bottom: 0.2rem;">
                  {{ symmetricCupRounds.finalRoundName }}
                </div>
 
                <div 
                  v-if="symmetricCupRounds.finalMatch" 
                  class="bracket-match-node final-match-node" 
                  :class="{ 'player-highlight-node': loggedInPlayer && (symmetricCupRounds.finalMatch.player1Id === loggedInPlayer.id || symmetricCupRounds.finalMatch.player2Id === loggedInPlayer.id) }"
                  style="padding: 0.5rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); display: flex; flex-direction: column; gap: 4px; width: 220px; border: 2px solid #fbbf24 !important; box-shadow: 0 0 20px rgba(251, 191, 36, 0.25) !important;"
                >
                  <!-- Player 1 -->
                  <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                    <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                      {{ getPlayerLogoSymbol(symmetricCupRounds.finalMatch.player1Id) }}
                    </span>
                    <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player1Id) }}</span>
                    <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player1Score : '-' }}</span>
                  </div>
                  <div class="vs-divider" style="color: #fbbf24; font-weight: 900; font-size: 0.75rem; text-align: center; margin: 0.2rem 0;">FINALS</div>
                  <!-- Player 2 -->
                  <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                    <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                      {{ getPlayerLogoSymbol(symmetricCupRounds.finalMatch.player2Id) }}
                    </span>
                    <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player2Id) }}</span>
                    <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player2Score : '-' }}</span>
                  </div>
                </div>
              </div>
 
              <!-- Right Wing -->
              <div class="bracket-wing right-wing" v-if="symmetricCupRounds.rightRoundsReversed.length > 0">
                <div v-for="round in symmetricCupRounds.rightRoundsReversed" :key="'r-r-' + round.index" class="bracket-round-column" style="min-width: 180px;">
                  <h4 class="round-title-banner">{{ round.name }}</h4>
                  <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1rem;">
                    <div 
                      v-for="match in round.matches" 
                      :key="match.id" 
                      class="bracket-match-node" 
                      :class="{ 'player-highlight-node': loggedInPlayer && (match.player1Id === loggedInPlayer.id || match.player2Id === loggedInPlayer.id) }"
                      style="padding: 0.5rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;"
                    >
                      <!-- Player 1 -->
                      <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                        <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                          {{ getPlayerLogoSymbol(match.player1Id) }}
                        </span>
                        <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player1Id) }}</span>
                        <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player1Score : '-' }}</span>
                      </div>
                      <div class="vs-divider" style="font-size: 0.65rem; text-align: center; color: #475569; font-weight: bold; margin: 0.2rem 0;">ضد</div>
                      <!-- Player 2 -->
                      <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                        <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                          {{ getPlayerLogoSymbol(match.player2Id) }}
                        </span>
                        <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player2Id) }}</span>
                        <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player2Score : '-' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          <!-- Group Stage + Knockouts Rendering -->
          <div v-else-if="activeTournament.type === 'groups_knockout'" class="groups-stage-container">
            <!-- Tabs Header if Knockout has started -->
            <div v-if="activeTournament.stage === 'knockout'" class="groups-tabs-header" style="display: flex; gap: 10px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
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
 
            <!-- Group Stage Content -->
            <div v-if="activeTournament.stage === 'groups' || groupsStageTab === 'groups'" class="groups-grid-layout" style="display: flex; flex-direction: column; gap: 2rem;">
              <div 
                v-for="(playersInGroup, groupName) in groupStandings" 
                :key="groupName" 
                class="group-section glass-panel"
                style="padding: 1rem !important; border-radius: 16px; background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255,255,255,0.05);"
              >
                <h3 class="highlight" style="font-size: 1.1rem; text-align: center; margin-bottom: 1rem; color: #fbbf24; margin-top: 0;">🏆 المجموعة {{ groupName }}</h3>
                
                <!-- Group Table -->
                <div class="table-frame-v3" style="width: 100%; overflow-x: auto; margin-bottom: 1rem;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                    <thead>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #64748b;">
                        <th style="text-align: center; padding: 6px 4px;">م</th>
                        <th style="text-align: right; padding: 6px 4px;">اللاعب</th>
                        <th style="text-align: center; padding: 6px 4px;">لعب</th>
                        <th style="text-align: center; padding: 6px 4px;">فاز</th>
                        <th style="text-align: center; padding: 6px 4px;">تعادل</th>
                        <th style="text-align: center; padding: 6px 4px;">أهداف</th>
                        <th style="text-align: center; padding: 6px 4px;">نقاط</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="(p, rank) in playersInGroup" 
                        :key="p.id" 
                        :class="{ 'player-highlight-row': loggedInPlayer && p.id === loggedInPlayer.id }"
                        style="border-bottom: 1px solid rgba(255,255,255,0.02);"
                      >
                        <td style="text-align: center; font-weight: bold; padding: 8px 4px;">
                          <span :style="rank < 2 ? 'color: #fbbf24;' : 'color: #94a3b8;'">{{ rank + 1 }}</span>
                        </td>
                        <td style="text-align: right; display: flex; align-items: center; gap: 6px; font-weight: bold; padding: 8px 4px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(p.id)" style="width: 18px; height: 18px; font-size: 0.65rem;">
                            {{ getPlayerLogoSymbol(p.id) }}
                          </span>
                          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; color: #fff;">{{ p.nickname }}</span>
                        </td>
                        <td style="text-align: center; padding: 8px 4px; color: #e2e8f0;">{{ p.played }}</td>
                        <td style="text-align: center; color: #10b981; padding: 8px 4px;">{{ p.won }}</td>
                        <td style="text-align: center; color: #94a3b8; padding: 8px 4px;">{{ p.drawn }}</td>
                        <td style="text-align: center; font-family: monospace; padding: 8px 4px; color: #cbd5e1;">{{ p.goalsFor }}:{{ p.goalsAgainst }}</td>
                        <td style="text-align: center; color: #fbbf24; font-weight: bold; padding: 8px 4px;">{{ p.points }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
 
                <!-- Group Matches -->
                <h4 style="font-size: 0.8rem; color: #94a3b8; margin: 12px 0 6px 0; border-right: 2px solid #06b6d4; padding-right: 6px;">📅 مواجهات المجموعة</h4>
                <div class="group-matches-list" style="display: flex; flex-direction: column; gap: 8px;">
                  <div 
                    v-for="match in groupMatchesByGroup[groupName]" 
                    :key="match.id" 
                    class="bracket-match-node" 
                    :class="{ 'player-highlight-node': loggedInPlayer && (match.player1Id === loggedInPlayer.id || match.player2Id === loggedInPlayer.id) }"
                    style="padding: 6px 10px !important; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.02);"
                  >
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                        <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 16px; height: 16px; font-size: 0.6rem;">
                          {{ getPlayerLogoSymbol(match.player1Id) }}
                        </span>
                        <span style="font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #cbd5e1;">{{ getPlayerNickname(match.player1Id) }}</span>
                      </div>
                      
                      <span style="font-family: monospace; font-size: 0.8rem; font-weight: bold; color: #fbbf24; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 6px;">
                        {{ match.played ? `${match.player1Score} - ${match.player2Score}` : 'VS' }}
                      </span>
                      
                      <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; justify-content: flex-end;">
                        <span style="font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; color: #cbd5e1;">{{ getPlayerNickname(match.player2Id) }}</span>
                        <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 16px; height: 16px; font-size: 0.6rem;">
                          {{ getPlayerLogoSymbol(match.player2Id) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
 
            <!-- Group Stage Knockout Content (Symmetric Bracket) -->
            <div v-if="activeTournament.stage === 'knockout' && groupsStageTab === 'knockout'" class="knockout-bracket-wrapper">
              <div v-if="symmetricCupRounds" class="symmetric-bracket-container">
                <!-- Left Wing -->
                <div class="bracket-wing left-wing" v-if="symmetricCupRounds.leftRounds.length > 0">
                  <div v-for="round in symmetricCupRounds.leftRounds" :key="'l-r-' + round.index" class="bracket-round-column" style="min-width: 180px;">
                    <h4 class="round-title-banner">{{ round.name }}</h4>
                    <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1rem;">
                      <div 
                        v-for="match in round.matches" 
                        :key="match.id" 
                        class="bracket-match-node" 
                        :class="{ 'player-highlight-node': loggedInPlayer && (match.player1Id === loggedInPlayer.id || match.player2Id === loggedInPlayer.id) }"
                        style="padding: 0.5rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;"
                      >
                        <!-- Player 1 -->
                        <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                            {{ getPlayerLogoSymbol(match.player1Id) }}
                          </span>
                          <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player1Id) }}</span>
                          <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player1Score : '-' }}</span>
                        </div>
                        <div class="vs-divider" style="font-size: 0.65rem; text-align: center; color: #475569; font-weight: bold; margin: 0.2rem 0;">ضد</div>
                        <!-- Player 2 -->
                        <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                            {{ getPlayerLogoSymbol(match.player2Id) }}
                          </span>
                          <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player2Id) }}</span>
                          <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player2Score : '-' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
 
                <!-- Center Wing (Trophy & Final) -->
                <div class="bracket-center-column" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 230px; gap: 1rem;">
                  <div class="trophy-stage animate-pulse" style="text-align: center; margin-bottom: 0.5rem;">
                    <span class="trophy-glow-icon" style="font-size: 4rem; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));">🏆</span>
                    <div class="trophy-title" style="color: #fbbf24; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; margin-top: 5px;">كأس البطولة</div>
                  </div>
                  
                  <div class="final-round-title" style="color: #fbbf24; font-weight: 800; font-size: 0.9rem; text-align: center; margin-bottom: 0.2rem;">
                    {{ symmetricCupRounds.finalRoundName }}
                  </div>
 
                  <div 
                    v-if="symmetricCupRounds.finalMatch" 
                    class="bracket-match-node final-match-node" 
                    :class="{ 'player-highlight-node': loggedInPlayer && (symmetricCupRounds.finalMatch.player1Id === loggedInPlayer.id || symmetricCupRounds.finalMatch.player2Id === loggedInPlayer.id) }"
                    style="padding: 0.5rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); display: flex; flex-direction: column; gap: 4px; width: 220px; border: 2px solid #fbbf24 !important; box-shadow: 0 0 20px rgba(251, 191, 36, 0.25) !important;"
                  >
                    <!-- Player 1 -->
                    <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player1Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                      <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                        {{ getPlayerLogoSymbol(symmetricCupRounds.finalMatch.player1Id) }}
                      </span>
                      <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player1Id) }}</span>
                      <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player1Score : '-' }}</span>
                    </div>
                    <div class="vs-divider" style="color: #fbbf24; font-weight: 900; font-size: 0.75rem; text-align: center; margin: 0.2rem 0;">FINALS</div>
                    <!-- Player 2 -->
                    <div class="match-player-row" :class="{ winner: symmetricCupRounds.finalMatch.winnerId === symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played, lost: symmetricCupRounds.finalMatch.winnerId !== symmetricCupRounds.finalMatch.player2Id && symmetricCupRounds.finalMatch.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                      <span class="player-logo-mini" :style="getPlayerLogoStyle(symmetricCupRounds.finalMatch.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                        {{ getPlayerLogoSymbol(symmetricCupRounds.finalMatch.player2Id) }}
                      </span>
                      <span class="player-nick" style="font-weight: bold; font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(symmetricCupRounds.finalMatch.player2Id) }}</span>
                      <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center; font-size: 1.05rem;">{{ symmetricCupRounds.finalMatch.played ? symmetricCupRounds.finalMatch.player2Score : '-' }}</span>
                    </div>
                  </div>
                </div>
 
                <!-- Right Wing -->
                <div class="bracket-wing right-wing" v-if="symmetricCupRounds.rightRoundsReversed.length > 0">
                  <div v-for="round in symmetricCupRounds.rightRoundsReversed" :key="'r-r-' + round.index" class="bracket-round-column" style="min-width: 180px;">
                    <h4 class="round-title-banner">{{ round.name }}</h4>
                    <div class="round-matches-list" style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; gap: 1rem;">
                      <div 
                        v-for="match in round.matches" 
                        :key="match.id" 
                        class="bracket-match-node" 
                        :class="{ 'player-highlight-node': loggedInPlayer && (match.player1Id === loggedInPlayer.id || match.player2Id === loggedInPlayer.id) }"
                        style="padding: 0.5rem; border-radius: 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;"
                      >
                        <!-- Player 1 -->
                        <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                            {{ getPlayerLogoSymbol(match.player1Id) }}
                          </span>
                          <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player1Id) }}</span>
                          <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player1Score : '-' }}</span>
                        </div>
                        <div class="vs-divider" style="font-size: 0.65rem; text-align: center; color: #475569; font-weight: bold; margin: 0.2rem 0;">ضد</div>
                        <!-- Player 2 -->
                        <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }" style="display: flex; align-items: center; gap: 8px; padding: 0.35rem 0.5rem; border-radius: 6px;">
                          <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                            {{ getPlayerLogoSymbol(match.player2Id) }}
                          </span>
                          <span class="player-nick" style="font-size: 0.85rem; color: #e2e8f0; flex: 1; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getPlayerNickname(match.player2Id) }}</span>
                          <span class="player-score" style="font-weight: 800; color: #fbbf24; min-width: 20px; text-align: center;">{{ match.played ? match.player2Score : '-' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          <!-- League Leaderboard Rendering -->
          <div v-else class="league-table-container">
            <div class="table-frame-v3" style="width: 100%; overflow-x: auto;">
              <table style="width: 100%;">
                <thead>
                  <tr>
                    <th style="text-align: center;">الترتيب</th>
                    <th style="text-align: right;">اللاعب</th>
                    <th style="text-align: center;">لعب</th>
                    <th style="text-align: center;">فاز</th>
                    <th style="text-align: center;">تعادل</th>
                    <th style="text-align: center;">خسر</th>
                    <th style="text-align: center;">النقاط</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(p, rank) in leagueLeaderboard" 
                    :key="p.id"
                    :class="{ 'player-highlight-row': loggedInPlayer && p.id === loggedInPlayer.id }"
                  >
                    <td style="text-align: center;">
                      <span v-if="rank === 0" class="crown">👑 1</span>
                      <span v-else-if="rank === 1" class="silver-medal">🥈 2</span>
                      <span v-else-if="rank === 2" class="bronze-medal">🥉 3</span>
                      <span v-else>{{ rank + 1 }}</span>
                    </td>
                    <td style="text-align: right; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                      <span class="player-logo-mini" :style="getPlayerLogoStyle(p.id)">
                        {{ getPlayerLogoSymbol(p.id) }}
                      </span>
                      <span>{{ p.nickname }}</span>
                    </td>
                    <td style="text-align: center;">{{ p.played }}</td>
                    <td style="text-align: center; color: var(--accent-success);">{{ p.won }}</td>
                    <td style="text-align: center; color: var(--text-muted);">{{ p.drawn }}</td>
                    <td style="text-align: center; color: var(--accent-danger);">{{ p.lost }}</td>
                    <td style="text-align: center; color: #fbbf24; font-weight: 900;">{{ p.points }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
 
        <!-- 3. Registered Players Board -->
        <div class="registered-players-board glass-panel animate-scale-in" style="margin-top: 1.5rem; margin-bottom: 2rem;">
          <h3 class="panel-title">👥 اللاعبين المسجلين حالياً ({{ activeTournament.players.filter(p => !p.isPendingApproval).length }})</h3>
          
          <div v-if="activeTournament.players.filter(p => !p.isPendingApproval).length === 0" class="empty-players-hint">
            لا يوجد لاعبين مسجلين بعد. كن أول من يسجل بالبطولة! 🏆
          </div>
          
          <div v-else class="players-badges-grid">
            <div 
              v-for="p in activeTournament.players.filter(p => !p.isPendingApproval)" 
              :key="p.id" 
              class="player-badge-card"
              :class="{ 'player-highlight-card-border': loggedInPlayer && p.id === loggedInPlayer.id }"
            >
              <span class="p-logo" :style="getLogoStyle(p.logoId)">
                {{ getLogoSymbol(p.logoId) }}
              </span>
              <div class="p-info">
                <span class="p-nick">{{ p.nickname }}</span>
                <span class="p-status" :class="{ paid: p.paid }">
                  {{ p.paid ? 'مؤكد السداد ✅' : (p.amountConfirmed > 0 ? `تم دفع ${p.amountConfirmed} ج 💰` : 'بانتظار الدفع 💳') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
const route = useRoute();

const submitting = ref(false);
const registrationSuccess = ref(false);
const lastTxId = ref('');
const viewMode = ref('register');

const form = reactive({
  fullName: '',
  nickname: '',
  phone: '',
  logoId: 0,
  paymentType: 'full',
  amountPaid: 0,
  paymentMethod: 'cash',
  senderNumber: '',
  transactionId: ''
});


// landing page state
const selectedTid = ref(null);
const groupsStageTab = ref('groups');
const tournamentNotFound = ref(false);

const backToLanding = () => {
  selectedTid.value = null;
  cloudTournament.value = null;
};

// Curated 68 esports gaming logo symbols
// 36 highly curated football clubs, national teams and soccer elements
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


// Curated 12 distinct esports neon glowing gradients
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
  'rgba(0, 242, 254, 0.45)',
  'rgba(255, 8, 68, 0.45)',
  'rgba(102, 126, 234, 0.45)',
  'rgba(246, 211, 101, 0.45)',
  'rgba(245, 87, 108, 0.45)',
  'rgba(180, 83, 9, 0.45)',
  'rgba(16, 185, 129, 0.45)',
  'rgba(168, 85, 247, 0.45)',
  'rgba(30, 60, 114, 0.45)',
  'rgba(249, 115, 22, 0.45)',
  'rgba(6, 182, 212, 0.45)',
  'rgba(139, 92, 246, 0.45)'
];

const getLogoStyle = (idx) => {
  const gIdx = idx % 12;
  return {
    background: GRADIENTS[gIdx],
    boxShadow: `0 0 12px ${GLOWS[gIdx]}`
  };
};

const getLogoSymbol = (idx) => {
  if (idx === null || idx === undefined || idx < 0 || idx >= CURATED_LOGOS.length) return '🏆';
  return CURATED_LOGOS[idx].symbol;
};

// Cloud Mode State
const isCloudMode = ref(false);
const cloudMachineId = ref(null);
const cloudTournament = ref(null);
const fullCloudDataPayload = ref(null);

const availableTournaments = computed(() => {
  const list = isCloudMode.value
    ? (fullCloudDataPayload.value?.classico_tournaments || [])
    : (store.tournaments || []);
  
  const statusOrder = { 'registration': 0, 'active': 1, 'completed': 2 };
  return [...list].sort((a, b) => {
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });
});

const activeTournament = computed(() => {
  const list = isCloudMode.value
    ? (fullCloudDataPayload.value?.classico_tournaments || [])
    : (store.tournaments || []);

  if (list.length === 0) return null;

  if (selectedTid.value) {
    return list.find(t => t && t.id === selectedTid.value) || null;
  }
  
  if (list.length === 1) {
    // Auto-select if there is only 1 tournament
    return list[0];
  }

  return null;
});

watch(activeTournament, (newVal) => {
  if (newVal) {
    if (newVal.paymentMethod === 'instapay') {
      form.paymentMethod = 'instapay';
    } else if (newVal.paymentMethod === 'wallet') {
      form.paymentMethod = 'wallet';
    } else if (newVal.paymentMethod === 'both') {
      form.paymentMethod = 'instapay';
    } else {
      form.paymentMethod = 'cash';
    }
    form.amountPaid = newVal.fee || 0;
  }
}, { immediate: true });

const getMedalEmoji = (idx, label = '') => {
  const lbl = String(label || '');
  if (idx === 0 || lbl.includes('الأول') || lbl.includes('الاول')) return '🥇';
  if (idx === 1 || lbl.includes('الثاني') || lbl.includes('الثانى')) return '🥈';
  if (idx === 2 || lbl.includes('الثالث')) return '🥉';
  return '🏆';
};

const isLogoTaken = (logoIdx) => {
  if (!activeTournament.value?.players) return false;
  return activeTournament.value.players.some(p => p && Number(p.logoId) === Number(logoIdx));
};

const selectTournament = (id) => {
  selectedTid.value = id;
  if (isCloudMode.value && fullCloudDataPayload.value) {
    const list = fullCloudDataPayload.value.classico_tournaments || [];
    cloudTournament.value = list.find(t => t && t.id === id) || null;
  }
  // Reset tab to default stage phase
  if (activeTournament.value) {
    groupsStageTab.value = activeTournament.value.stage === 'knockout' ? 'knockout' : 'groups';
  }
};

const getStatusLabel = (status) => {
  const labels = {
    registration: 'مفتوح للتسجيل 👥',
    active: 'جارية الآن 🎮',
    completed: 'منتهية 🏆'
  };
  return labels[status] || status;
};

const getTournamentTypeLabel = (type) => {
  const labels = {
    cup: 'كأس (تصفيات خروج المغلوب)',
    league: 'دوري (نقاط مواجهات)',
    groups_knockout: 'مجموعات + تصفيات إقصائية 🏆'
  };
  return labels[type] || type;
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

// Symmetric bracket tree structure
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

// League Leaderboard calculation
const leagueLeaderboard = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'league') return [];
  
  const players = activeTournament.value.players;
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

// Helpers to get player nickname, logo symbols and styles
const getPlayerNickname = (id) => {
  if (id === 'bye' || !id) return 'تأهل تلقائي ⭐';
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? player.nickname : '---';
};

const getPlayerLogoSymbol = (id) => {
  if (id === 'bye' || !id) return '⭐';
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? getLogoSymbol(player.logoId) : '❓';
};

const getPlayerLogoStyle = (id) => {
  if (id === 'bye' || !id) {
    return {
      background: 'rgba(255,255,255,0.05)',
      boxShadow: 'none'
    };
  }
  const player = activeTournament.value?.players.find(p => p && p.id === id);
  return player ? getLogoStyle(player.logoId) : {};
};

// Form submit action
const submitRegistration = async () => {
  if (!activeTournament.value || activeTournament.value.status !== 'registration') return;
  
  if (activeTournament.value.players.length >= activeTournament.value.maxPlayers) {
    alert('عذراً، البطولة مكتملة العدد بالفعل ولا يمكن قبول تسجيل إضافي.');
    return;
  }

  // Duplicate Check
  const dup = activeTournament.value.players.find(p => p && p.nickname && p.nickname.toLowerCase() === form.nickname.trim().toLowerCase());
  if (dup) {
    alert('هذا الاسم المستعار مسجل بالفعل! يرجى اختيار اسم مستعار آخر.');
    return;
  }

  const dupPhone = activeTournament.value.players.find(p => p && p.phone && p.phone.trim() === form.phone.trim());
  if (dupPhone) {
    alert('رقم الهاتف هذا مسجل بالفعل في هذه البطولة!');
    return;
  }

  const fee = activeTournament.value.fee || 0;
  const isPending = fee > 0;
  let finalAmountPaid = 0;

  if (isPending) {
    if (form.paymentMethod === 'instapay' || form.paymentMethod === 'wallet') {
      if (!form.phone || !form.phone.trim()) {
        alert('يرجى إدخال رقم الهاتف الخاص بك أولاً!');
        return;
      }
      if (!form.transactionId || !form.transactionId.trim()) {
        alert('يرجى إدخال رقم العملية/التحويل المرجعي لتأكيد سداد الرسوم!');
        return;
      }
      lastTxId.value = form.transactionId.trim();
    } else {
      // Cash payment
      lastTxId.value = 'CASH-' + Date.now().toString().slice(-6);
    }
    
    finalAmountPaid = Number(form.amountPaid);
    if (isNaN(finalAmountPaid) || finalAmountPaid <= 0 || finalAmountPaid > fee) {
      alert(`يرجى كتابة سداد قيمة اشتراك صحيحة لا تزيد عن قيمة الاشتراك (${fee} ج)!`);
      return;
    }
  }

  const finalPaymentType = isPending ? (finalAmountPaid >= fee ? 'full' : 'partial') : 'full';

  submitting.value = true;
  try {
    if (isCloudMode.value) {
      // 1. Build new player object
      const newPlayer = {
        id: 'PLR-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
        fullName: form.fullName.trim(),
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        logoId: Number(form.logoId),
        paid: !isPending,
        paidAt: !isPending ? new Date().toISOString() : null,
        isPendingApproval: isPending,
        paymentType: finalPaymentType,
        paymentMethod: form.paymentMethod || 'cash',
        amountPaid: finalAmountPaid,
        senderNumber: isPending && (form.paymentMethod === 'instapay' || form.paymentMethod === 'wallet') ? form.phone.trim() : 'الدفع كاش بالصالة',
        transactionId: isPending ? lastTxId.value : '',
        amountConfirmed: 0,
        amountArchived: 0,
        remainingAmount: fee,
        joinedAt: new Date().toISOString()
      };

      const { supabase } = await import('../../utils/supabase');

      // Call the safe, transactional database function to register
      const { data, error } = await supabase.rpc('register_public_player', {
        target_machine_id: cloudMachineId.value,
        target_tournament_id: cloudTournament.value.id,
        new_player: newPlayer
      });

      if (error) throw error;

      if (data && data.success) {
        // Sync local display state with the fresh server data returned by RPC
        cloudTournament.value = data.tournament;
        fullCloudDataPayload.value = {
          classico_tournaments: [data.tournament]
        };
        registrationSuccess.value = true;
      } else {
        alert(data?.message || 'فشل التسجيل بالبطولة.');
        submitting.value = false;
        return;
      }

      registrationSuccess.value = true;
      form.fullName = '';
      form.phone = '';
      form.nickname = '';
      form.logoId = 0;
      form.paymentType = 'full';
      form.amountPaid = 0;
      form.senderNumber = '';
      form.transactionId = '';

    } else {
      // WiFi local server mode
      const res = await store.registerPlayer(activeTournament.value.id, {
        fullName: form.fullName.trim(),
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        logoId: Number(form.logoId),
        isPendingApproval: isPending,
        paymentType: finalPaymentType,
        paymentMethod: form.paymentMethod,
        amountPaid: finalAmountPaid,
        senderNumber: isPending && (form.paymentMethod === 'instapay' || form.paymentMethod === 'wallet') ? form.phone.trim() : 'الدفع كاش بالصالة',
        transactionId: isPending ? lastTxId.value : ''
      });

      if (res.success) {
        registrationSuccess.value = true;
        form.fullName = '';
        form.phone = '';
        form.nickname = '';
        form.logoId = 0;
        form.paymentType = 'full';
        form.amountPaid = 0;
        form.senderNumber = '';
        form.transactionId = '';
      } else {
        alert(res.message || 'فشل التسجيل بالبطولة.');
      }
    }
  } catch (err) {
    console.error('[Registration Cloud Error]', err);
    alert('حدث خطأ في الاتصال بالخادم السحابي، يرجى التحقق من جودة الإنترنت والمحاولة مجدداً.');
  } finally {
    submitting.value = false;
  }
};

watch(
  () => [route.query.mid, route.query.tid],
  async ([newMid, newTid]) => {
    // Reset state on every route param change to prevent stale data from previous tournament
    selectedTid.value = null;
    cloudTournament.value = null;
    fullCloudDataPayload.value = null;
    tournamentNotFound.value = false;

    let mid = newMid || route.query.MID;
    let tid = newTid || route.query.TID;

    // Fallback 1: Parse from hash route manually if route.query is not ready
    if ((!mid || !tid) && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const params = new URLSearchParams(hashQuery);
      if (!mid) mid = params.get('mid') || params.get('MID');
      if (!tid) tid = params.get('tid') || params.get('TID');
    }

    // Fallback 2: Parse from window.location.search directly
    if (!mid || !tid) {
      const params = new URLSearchParams(window.location.search);
      if (!mid) mid = params.get('mid') || params.get('MID');
      if (!tid) tid = params.get('tid') || params.get('TID');
    }

    if (mid) {
      const uppercaseMid = mid.toUpperCase().trim();
      console.log(`[Registration] Cloud Mode detected for Machine ID: ${uppercaseMid}`);
      isCloudMode.value = true;
      cloudMachineId.value = uppercaseMid;
      store.isLoading = true;

      try {
        const { supabase } = await import('../../utils/supabase');
        
        // Fetch only the sanitized tournament details securely via RPC
        const { data, error } = await supabase.rpc('get_public_tournament', {
          target_machine_id: uppercaseMid,
          target_tournament_id: tid || ''
        });

        if (error) throw error;

        if (data) {
          selectedTid.value = data.id;
          cloudTournament.value = data;
          // Set fullCloudDataPayload to mock containing this tournament so that existing list references won't break
          fullCloudDataPayload.value = {
            classico_tournaments: [data]
          };
        } else {
          tournamentNotFound.value = true;
        }
      } catch (err) {
        console.error('[Cloud Load Error]', err.message);
        alert('حدث خطأ أثناء تحميل بيانات البطولة من السحابة. تأكد من صحة الرابط أو جودة الاتصال.');
      } finally {
        store.isLoading = false;
      }
    } else {
      // WiFi Local server mode
      try {
        await store.syncFromServer();
        if (tid) {
          const selected = store.tournaments.find(t => t && t.id && t.id.toString() === tid.toString());
          if (selected) {
            selectedTid.value = selected.id;
          } else {
            tournamentNotFound.value = true;
          }
        }
      } catch(e) {}
    }
  },
  { immediate: true }
);

</script>

<style>
/* CSS Variables & Layout Overrides */
.mobile-registration-wrapper {
  background: radial-gradient(circle at 50% 10%, #080f1e 0%, #03060f 100%) !important;
  color: #f8fafc !important;
  min-height: 100vh !important;
  padding: 1.5rem 1rem !important;
  overflow-y: auto !important;
  direction: rtl;
  font-family: 'Cairo', sans-serif !important;
}

.glow-accent-top {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 100px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
  z-index: 1;
}

.registration-container {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Glassmorphism Panels */
.glass-panel {
  background: rgba(30, 41, 59, 0.45) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 20px !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45) !important;
  padding: 1.5rem !important;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}
.animate-scale-in {
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Header Area */
.reg-header {
  text-align: center;
  margin-bottom: 2rem;
}
.trophy-badge {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.5));
}
.glow-text {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
  margin: 0;
}
.subtitle-text {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

/* Warnings and Empty cards */
.no-tournament-card {
  text-align: center;
  padding: 2.5rem 1.5rem !important;
}
.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.info-footer {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #06b6d4;
  font-weight: bold;
}

/* Banner Stats Card */
.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.type-tag {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.status-tag {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.status-tag.active {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.25);
}
.tournament-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  text-align: center;
  color: #06f2fe;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}
.stat-item {
  background: rgba(15, 23, 42, 0.3);
  padding: 0.8rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.02);
}
.stat-item.font-wide {
  grid-column: span 2;
}
.stat-item .label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}
.stat-item .value {
  font-size: 1.1rem;
  font-weight: 900;
}

/* Colors styling */
.success-color { color: #10b981; }
.cyan-color { color: #06b6d4; }
.gold-color { color: #fbbf24; }

/* Inputs and Forms */
.panel-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.5rem;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.input-group label {
  font-size: 0.8rem;
  color: #cbd5e1;
  font-weight: bold;
}
.premium-input {
  background: rgba(15, 23, 42, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  padding: 0.8rem 1rem !important;
  border-radius: 12px !important;
  font-size: 0.9rem !important;
  width: 100% !important;
  outline: none !important;
  transition: all 0.3s ease !important;
}
.premium-input:focus {
  border-color: #06b6d4 !important;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.25) !important;
}

/* Logo Scroller */
.avatar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.selected-badge-preview {
  font-size: 0.75rem;
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 5px;
}
.logo-preview-icon {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  box-shadow: 0 0 5px rgba(255,255,255,0.2);
}
.logo-scroll-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.6rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.logo-select-btn {
  background: none;
  border: 2px solid transparent;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.logo-select-btn:hover {
  transform: scale(1.1);
}
.logo-select-btn.active {
  border-color: #fff !important;
  transform: scale(1.18);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.8) !important;
}

/* Submit neon button */
.btn-submit-neon {
  width: 100%;
  background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%) !important;
  color: white !important;
  border: none !important;
  padding: 0.9rem !important;
  border-radius: 12px !important;
  font-weight: 800 !important;
  font-size: 1rem !important;
  cursor: pointer !important;
  margin-top: 1rem !important;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.btn-submit-neon:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5) !important;
  filter: brightness(1.1);
}
.btn-submit-neon:disabled {
  background: #334155 !important;
  color: #64748b !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

/* Success Card */
.success-message-card {
  text-align: center;
  padding: 1.5rem 0.5rem;
}
.success-icon {
  font-size: 3.5rem;
  margin-bottom: 0.8rem;
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4));
}
.paid-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 1rem;
  line-height: 1.6;
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
  min-width: 200px;
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
}
.match-player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.3rem;
  border-radius: 6px;
}
.match-player-row.winner {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
}
.match-player-row.winner .player-nick {
  color: #10b981;
  font-weight: bold;
}
.match-player-row.lost {
  opacity: 0.4;
}
.player-logo-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
.player-nick {
  font-size: 0.8rem;
  color: #e2e8f0;
  flex: 1;
}
.player-score {
  font-weight: 800;
  font-size: 0.85rem;
  color: #fbbf24;
  min-width: 15px;
  text-align: center;
}
.vs-divider {
  font-size: 0.65rem;
  text-align: center;
  color: #475569;
  text-transform: uppercase;
  margin: 0.2rem 0;
  font-weight: bold;
}

/* Registered Players Badges list */
.players-badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}
.player-badge-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 0.6rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.player-badge-card .p-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.player-badge-card .p-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.player-badge-card .p-nick {
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-badge-card .p-status {
  font-size: 0.65rem;
  color: #f59e0b;
}
.player-badge-card .p-status.paid {
  color: #10b981;
}
.empty-players-hint {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  padding: 2rem 0;
}

/* Medal icons classes */
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

/* Symmetric Bracket Styling */
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

/* Group Tabs Styling */
.groups-tabs-header .tab-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}
.groups-tabs-header .tab-btn.active {
  background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%);
  color: white !important;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}

/* Type tag overrides for groups_knockout */
.type-tag.groups_knockout {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

/* Interactive Landing cards */
.tournaments-landing-page {
  padding: 0.5rem 0;
}
.tournament-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.tournament-card:hover {
  transform: translateY(-4px);
  border-color: #06b6d4 !important;
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.25) !important;
}

/* Modern Trophy SVG Header styles */
.modern-trophy-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.5rem auto 1rem auto;
  width: 90px;
  height: 90px;
}
.modern-trophy-svg {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));
  z-index: 2;
  position: relative;
}
.trophy-glow-halo {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, transparent 70%);
  filter: blur(10px);
  z-index: 1;
}

/* Navigation tabs styling */
.view-mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 5px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.view-mode-tabs .tab-btn {
  flex: 1;
  padding: 10px;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  background: none;
  color: #94a3b8;
}
.view-mode-tabs .tab-btn.active {
  background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}
</style>
