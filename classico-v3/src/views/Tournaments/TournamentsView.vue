<template>
  <div class="dashboard-wrapper tournaments-admin-wrapper" style="direction: rtl;">
    <main class="main-area glass-panel page-watermark" style="width: 100%; position: relative; overflow-y: auto;">
      <div style="position: relative; z-index: 1;">
        
        <!-- Header -->
        <div class="archive-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <h1 class="premium-title-main" style="margin: 0;">🏆 إدارة البطولات والمسابقات</h1>
          <span class="lounge-tag">Classico Pro eSports</span>
        </div>

        <div class="grid-layout">
          <!-- Left side: Creation form & QR Cloud panel -->
          <div class="side-column">
            <!-- 1. Create Tournament Panel -->
            <div v-if="!activeTournament" class="glass-card-form animate-scale-in">
              <div class="form-header-v3">✨ إنشاء بطولة جديدة</div>
              
              <div class="field-v3">
                <label>اسم البطولة 🏆</label>
                <input type="text" v-model="createForm.name" placeholder="مثال: بطولة كلاسيكو الرمضانية الأولى" class="premium-input-v3">
              </div>

              <div class="field-v3">
                <label>سعر اشتراك اللاعب 💸</label>
                <input type="number" v-model="createForm.fee" placeholder="مثال: 50" class="premium-input-v3">
              </div>

              <div class="field-v3">
                <label>نظام البطولة 📊</label>
                <select v-model="createForm.type" class="premium-input-v3" @change="adjustPlayerLimit">
                  <option value="cup">كأس (خروج المغلوب - تصفيات شجرية)</option>
                  <option value="league">دوري (جدول نقاط ومباريات دور واحد)</option>
                </select>
              </div>

              <div class="field-v3">
                <label>عدد المشاركين المستهدف 👥</label>
                <select v-if="createForm.type === 'cup'" v-model="createForm.maxPlayers" class="premium-input-v3">
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

            <!-- 2. Active Tournament QR & Links Panel -->
            <div v-else class="glass-card-form animate-scale-in">
              <div class="form-header-v3">🔗 روابط الاشتراك والتسويق للبطولة</div>
              
              <div class="active-tour-meta" style="margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
                <h3 class="highlight" style="font-size: 1.15rem; margin: 0; word-break: break-word; line-height: 1.4;">{{ activeTournament.name }}</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                  <span class="badge" :class="activeTournament.type">
                    {{ activeTournament.type === 'cup' ? 'كأس' : 'دوري' }}
                  </span>
                  <span class="badge" :class="activeTournament.status">
                    {{ activeTournament.status === 'registration' ? 'مرحلة التسجيل' : 'نشطة الآن' }}
                  </span>
                </div>
              </div>

              <!-- Permanent 24/7 Cloud Registration Link (Zero Server Dependency!) -->
              <div class="link-card glass-panel">
                <span class="link-card-title">🔗 رابط التسجيل السحابي الدائم 24/7:</span>
                <div class="url-copy-row" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; width: 100%;">
                  <input type="text" readonly :value="cloudPagesUrl" ref="cloudPagesUrlInput" class="premium-input-mini cloud-url-input" style="flex: 1; font-family: monospace; font-size: 0.85rem; padding: 6px; min-width: 120px;">
                  <button @click="copyLink('cloudPages')" class="s-copy cloud-copy-btn" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; font-weight: bold; flex-shrink: 0;">نسخ الرابط</button>
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

              <button @click="handleDeleteTournament" class="btn danger-btn" style="width: 100%; margin-top: 1.5rem;">
                حذف وإلغاء البطولة بالكامل 🗑️
              </button>
            </div>
          </div>

          <!-- Right side: Tournament bracket and players list -->
          <div class="main-column">
            <!-- 3. Registered Players Management panel -->
            <div v-if="activeTournament && activeTournament.status === 'registration'" class="form-card-v3 animate-scale-in">
              <div class="form-header-v3" style="display: flex; justify-content: space-between; align-items: center;">
                <span>👤 المشتركين المسجلين حالياً ({{ activeTournament.players.length }} / {{ activeTournament.maxPlayers }})</span>
                <button @click="showAddPlayerModal = true" class="btn secondary-btn btn-manual-player" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; font-weight: bold;">
                  + تسجيل لاعب يدوياً
                </button>
              </div>

              <div class="table-container" style="max-height: 40vh; overflow-y: auto; margin-bottom: 1.5rem;">
                <table style="width: 100%;">
                  <thead>
                    <tr>
                      <th style="text-align: right;">اللاعب</th>
                      <th style="text-align: center;">الاسم الحركي</th>
                      <th style="text-align: center;">الهاتف</th>
                      <th style="text-align: center;">الحساب مالياً</th>
                      <th style="text-align: center;">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in activeTournament.players" :key="p.id">
                      <td style="text-align: right; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                        <span class="player-logo-mini" :style="getLogoStyle(p.logoId)">
                          {{ getLogoSymbol(p.logoId) }}
                        </span>
                        <span>{{ p.fullName }}</span>
                      </td>
                      <td style="text-align: center; color: var(--accent-cyan); font-weight: bold;">{{ p.nickname }}</td>
                      <td style="text-align: center; font-family: monospace;">{{ p.phone }}</td>
                      <td style="text-align: center;">
                        <span v-if="p.paid" class="status-badge status-running" style="font-size: 0.75rem;">مدفوع ✅</span>
                        <button v-else @click="handleMarkPaid(p)" class="btn secondary-btn btn-pay-status" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; font-weight: bold;">
                          تسجيل السداد 💳
                        </button>
                      </td>
                      <td style="text-align: center;">
                        <button @click="handleRemovePlayer(p)" class="btn danger-btn" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">إزالة</button>
                      </td>
                    </tr>
                    <tr v-if="activeTournament.players.length === 0">
                      <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">لا توجد تسجيلات بعد. قم بنشر رابط الـ QR للبدء في تجميع اللاعبين! 🏆</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Start Tournament Button -->
              <div v-if="activeTournament.players.length >= 2" class="action-footer" style="text-align: center;">
                <p v-if="activeTournament.type === 'cup' && activeTournament.players.length < activeTournament.maxPlayers" style="font-size: 0.8rem; color: #fbbf24; margin-bottom: 8px; font-weight: bold;">
                  ⚠️ تنبيه: لم يكتمل العدد المطلوب ({{ activeTournament.players.length }} / {{ activeTournament.maxPlayers }}). عند الضغط على "بدء" سيقوم النظام بتوزيع تأهلات تلقائية (Bye Passes) عشوائياً للاعبين المتبقين!
                </p>
                <button @click="handleStartTournament" class="btn btn-green-v3" style="font-size: 1.1rem; padding: 0.8rem 2.5rem; font-weight: bold; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
                  🎲 إغلاق التسجيل وتوليد مواجهات القرعة عشوائياً 🚀
                </button>
              </div>
            </div>

            <!-- 4. Active Tournament Match Viewer Panel (If in progress or completed) -->
            <div v-if="activeTournament && activeTournament.status !== 'registration'" class="form-card-v3 animate-scale-in">
              
              <!-- Winners Ceremony card if completed -->
              <div v-if="activeTournament.status === 'completed'" class="ceremony-container glass-panel animate-scale-in">
                <div class="trophy-ceremony">👑🏆👑</div>
                <h2 class="glow-text gold-color">حفل تتويج أبطال الصالة</h2>
                <p style="color: var(--text-muted); font-weight: bold; font-size: 0.95rem;">تهانينا الحارة لجميع المشاركين ومحترفي البطولة!</p>
                
                <div class="podium-grid">
                  <!-- Second Place -->
                  <div class="podium-card silver animate-scale-in" style="animation-delay: 0.3s;">
                    <span class="medal-icon">🥈</span>
                    <span class="player-logo-large" :style="getPlayerLogoStyle(activeTournament.winners?.second)">
                      {{ getPlayerLogoSymbol(activeTournament.winners?.second) }}
                    </span>
                    <span class="podium-nick">{{ getPlayerNickname(activeTournament.winners?.second) }}</span>
                    <span class="rank-title">المركز الثاني</span>
                  </div>

                  <!-- First Place -->
                  <div class="podium-card gold animate-scale-in" style="animation-delay: 0.1s;">
                    <span class="medal-icon glow">👑🥇</span>
                    <span class="player-logo-large" :style="getPlayerLogoStyle(activeTournament.winners?.first)">
                      {{ getPlayerLogoSymbol(activeTournament.winners?.first) }}
                    </span>
                    <span class="podium-nick gold-color">{{ getPlayerNickname(activeTournament.winners?.first) }}</span>
                    <span class="rank-title">البطل والمركز الأول 🏆</span>
                  </div>

                  <!-- Third Place -->
                  <div class="podium-card bronze animate-scale-in" style="animation-delay: 0.5s;">
                    <span class="medal-icon">🥉</span>
                    <span class="player-logo-large" :style="getPlayerLogoStyle(activeTournament.winners?.third)">
                      {{ getPlayerLogoSymbol(activeTournament.winners?.third) }}
                    </span>
                    <span class="podium-nick">{{ getPlayerNickname(activeTournament.winners?.third) }}</span>
                    <span class="rank-title">المركز الثالث</span>
                  </div>
                </div>

                <button @click="archiveAndResetTournament" class="btn secondary-btn btn-archive-reset" style="font-weight: bold; margin-top: 1.5rem; padding: 0.6rem 2rem;">
                  🗄️ إرسال البطولة للأرشيف والبدء من جديد
                </button>
              </div>

              <!-- Bracket or League Points table view -->
              <div v-else>
                <div class="form-header-v3" style="display: flex; justify-content: space-between; align-items: center;">
                  <span>⚔️ مخطط وجدول مباريات البطولة النشطة</span>
                  <button @click="handleForceComplete" class="btn danger-btn" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; background: #fbbf24 !important; color: black; font-weight: bold;">
                    🏁 إنهاء وتتويج الأبطال يدوياً
                  </button>
                </div>

                <!-- Cup Bracket interactive Tree layout -->
                <div v-if="activeTournament.type === 'cup'" class="bracket-viewer-scroller">
                  <div class="bracket-rounds-container" style="padding: 1.5rem 0;">
                    <div v-for="round in cupRounds" :key="round.index" class="bracket-round-column" style="min-width: 250px;">
                      <h4 class="round-title-banner" style="font-size: 0.9rem; padding: 0.5rem;">{{ round.name }}</h4>
                      
                      <div class="round-matches-list">
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
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(p.id)">
                              {{ getPlayerLogoSymbol(p.id) }}
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
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)">
                              {{ getPlayerLogoSymbol(match.player1Id) }}
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
                            <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)" style="order: 2;">
                              {{ getPlayerLogoSymbol(match.player2Id) }}
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
      <div class="modal-content glass-panel" style="max-width: 500px; width: 90%;">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.15rem; color: var(--accent-cyan);">👤 تسجيل لاعب جديد يدوياً</h2>
          <button @click="showAddPlayerModal = false" class="btn-icon">✖</button>
        </div>

        <div class="modal-body-v3" style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem 0;">
          <div class="field-v3">
            <label>الاسم رباعي بالكامل 👤</label>
            <input type="text" v-model="manualPlayerForm.fullName" placeholder="أدخل اسم المشترك بالكامل" class="premium-input-v3">
          </div>
          <div class="field-v3">
            <label>الاسم الحركي / المستعار (Nickname) 👾</label>
            <input type="text" v-model="manualPlayerForm.nickname" placeholder="الاسم الذي سيظهر على مخطط المواجهات" class="premium-input-v3" maxLength="16">
          </div>
          <div class="field-v3">
            <label>رقم الهاتف 📱</label>
            <input type="tel" v-model="manualPlayerForm.phone" placeholder="أدخل رقم الموبايل" class="premium-input-v3">
          </div>

          <div class="field-v3">
            <label style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <span>اختر شعار الفريق والرمز 🎨</span>
              <span v-if="manualPlayerForm.logoId !== null" style="font-size: 0.75rem; color: var(--accent-success); display: flex; align-items: center; gap: 5px;">
                معاينة الشعار: <span class="logo-preview-icon" :style="getLogoStyle(manualPlayerForm.logoId)">{{ getLogoSymbol(manualPlayerForm.logoId) }}</span>
              </span>
            </label>
            <div class="logo-scroll-grid" style="grid-template-columns: repeat(8, 1fr); max-height: 120px;">
              <button
                type="button"
                v-for="(logo, idx) in CURATED_LOGOS"
                :key="idx"
                :class="['logo-select-btn', { active: manualPlayerForm.logoId === idx }]"
                :style="getLogoStyle(idx)"
                @click="manualPlayerForm.logoId = idx"
                style="width: 32px; height: 32px; font-size: 1.1rem;"
              >
                {{ logo.symbol }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button @click="showAddPlayerModal = false" class="btn secondary-btn" style="flex: 1; border: 1px solid rgba(255,255,255,0.1);">إلغاء ✖</button>
          <button @click="submitManualPlayer" class="btn btn-green-v3" style="flex: 1;">تسجيل المشترك بالبطولة ✅</button>
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
              <span class="player-logo-large" :style="getPlayerLogoStyle(activeMatch.player1Id)">
                {{ getPlayerLogoSymbol(activeMatch.player1Id) }}
              </span>
              <strong style="font-size: 1rem; color: var(--text-main);">{{ getPlayerNickname(activeMatch.player1Id) }}</strong>
              <input type="number" v-model="matchScore.score1" class="premium-input" style="text-align: center; font-size: 1.8rem; font-weight: 900; width: 80px; padding: 0.5rem; background: rgba(0,0,0,0.4);" min="0">
            </div>

            <div style="font-weight: bold; font-size: 1.5rem; color: var(--text-muted); padding-top: 2rem;">ضد</div>

            <!-- Player 2 -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <span class="player-logo-large" :style="getPlayerLogoStyle(activeMatch.player2Id)">
                {{ getPlayerLogoSymbol(activeMatch.player2Id) }}
              </span>
              <strong style="font-size: 1rem; color: var(--text-main);">{{ getPlayerNickname(activeMatch.player2Id) }}</strong>
              <input type="number" v-model="matchScore.score2" class="premium-input" style="text-align: center; font-size: 1.8rem; font-weight: 900; width: 80px; padding: 0.5rem; background: rgba(0,0,0,0.4);" min="0">
            </div>
          </div>

          <!-- Tie breaker option if scores are equal (only for Cup knockout matches!) -->
          <div v-if="matchScore.score1 === matchScore.score2 && activeTournament.type === 'cup' && activeMatch.player1Id !== 'bye' && activeMatch.player2Id !== 'bye'" class="tie-breaker-row animate-scale-in" style="margin-top: 1.5rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 12px; width: 100%; box-sizing: border-box;">
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

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';
import axios from 'axios';

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
const selectedLeagueRound = ref(0);

const createForm = reactive({
  name: '',
  fee: 50,
  maxPlayers: 8,
  type: 'cup',
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
  logoId: 0
});

const activeMatch = ref(null);
const matchScore = reactive({
  score1: 0,
  score2: 0,
  winnerId: ''
});

// 68 Modern Football / Soccer themed club logos with professional gradients
const CURATED_LOGOS = [
  { symbol: '⚽', name: 'الكرة المشتعلة 🔥' },
  { symbol: '👑', name: 'الملكي المدريدي ⚪' },
  { symbol: '🔴🔵', name: 'البلوغرانا الكتالوني 🏟️' },
  { symbol: '🔴🦁', name: 'المارد الأحمر (الأهلي) 🦅' },
  { symbol: '⚪🏹', name: 'الفارس الأبيض (الزمالك) 🏹' },
  { symbol: '🔴🦅', name: 'الريدز الإنجليزي (ليفربول) 🔴' },
  { symbol: '🔵🦁', name: 'البلوز اللندني (تشيلسي) 🦁' },
  { symbol: '🔴😈', name: 'الشياطين الحمر (مانشستر) 😈' },
  { symbol: '🔵⚡', name: 'السيتي السماوي (مانشستر سيتي) ⚡' },
  { symbol: '🔴⚪🦁', name: 'البافاري الألماني (بايرن ميونخ) 🦁' },
  { symbol: '⚪⚫🦓', name: 'اليوفي الإيطالي (يوفنتوس) 🦓' },
  { symbol: '🔵🔴🗼', name: 'سان جيرمان الباريسي (باريس) 🗼' },
  { symbol: '🟡⚫🐯', name: 'النمور الاتحادية (الاتحاد) 🐯' },
  { symbol: '🟡🔵🌍', name: 'العالمي النصراوي (النصر) 🟡🔵' },
  { symbol: '🔵👑🦁', name: 'الزعيم الهلالي (الهلال) 🦁' },
  { symbol: '🔴🦁⚔️', name: 'الليث الشبابي (الشباب) ⚔️' },
  { symbol: '🟢🦅💚', name: 'الكواسر الخضراء (المصري) 💚' },
  { symbol: '🟡🐊💛', name: 'الدراويش الصفراء (الإسماعيلي) 🐊' },
  { symbol: '👟', name: 'الحذاء الذهبي الكلاسيكي' },
  { symbol: '🥅', name: 'شباك المرمى التكتيكية' },
  { symbol: '🏟️', name: 'ملعب الأبطال النيون' },
  { symbol: '📋', name: 'الخطط التكتيكية للمدرب' },
  { symbol: '📢', name: 'صافرة الحكم النارية' },
  { symbol: '🚩', name: 'راية الركنية المشتعلة' },
  { symbol: '🧤', name: 'قفاز الحارس الأخطبوط' },
  { symbol: '🏆', name: 'كأس دوري أبطال أوروبا' },
  { symbol: '🥇', name: 'ميدالية المركز الأول' },
  { symbol: '🥈', name: 'ميدالية المركز الثاني' },
  { symbol: '🥉', name: 'ميدالية المركز الثالث' },
  { symbol: '⚽⚡', name: 'كرة البرق الصاعقة' },
  { symbol: '⚽🔥', name: 'الكرة المشتعلة بالنار' },
  { symbol: '⚽❄️', name: 'كرة الصقيع الجليدية' },
  { symbol: '⚽💫', name: 'الكرة الذهبية الفلكية' },
  { symbol: '🔵⚪🐺', name: 'ذئاب الملاعب الزرقاء' },
  { symbol: '🔴⚪🦅', name: 'النسور الحمراء الكاسرة' },
  { symbol: '🟢⚪🐉', name: 'تنين كلاسيكو الأخضر' },
  { symbol: '🟡🔴☄️', name: 'النيزك الذهبي الساقط' },
  { symbol: '🏆🔥', name: 'الكأس الملتهب بالأمجاد' },
  { symbol: '🛡️', name: 'درع دفاع الأبطال' },
  { symbol: '⚔️', name: 'دربي الغضب الأبدي' },
  { symbol: '⭐', name: 'نجم الكلاسيكو الخماسي' },
  { symbol: '💎', name: 'الماسة الكروية المتوهجة' },
  { symbol: '🚀', name: 'صاروخ المهاجم السريع' },
  { symbol: '🎴🔴', name: 'البطاقة الحمراء (الطرد)' },
  { symbol: '🎴🟡', name: 'البطاقة الصفراء (الإنذار)' },
  { symbol: '🏁', name: 'راية النصر البيضاء والسوداء' },
  { symbol: '🔵⚫', name: 'الإنتر نيراتزوري الإيطالي' },
  { symbol: '🔴⚫', name: 'الروسونيري الإيطالي (ميلان)' },
  { symbol: '🟡🔴🐺', name: 'ذئاب العاصمة (روما)' },
  { symbol: '🔵⚪⭐', name: 'راقصي التانجو (الأرجنتين)' },
  { symbol: '🟡🟢🏆', name: 'سحرة السامبا (البرازيل)' },
  { symbol: '🔴⚪🐂', name: 'ثيران الماتادور (إسبانيا)' },
  { symbol: '🔵⚪ Rooster 🐓', name: 'الديوك الفرنسية الزرقاء' },
  { symbol: '⚪⚫🦅', name: 'الماكينات الألمانية القوية' },
  { symbol: '🔴🟢🦅', name: 'أسود الأطلس المغربية 🇲🇦' },
  { symbol: '🟢⚪🦅', name: 'محاربي الصحراء الجزائرية 🇩🇿' },
  { symbol: '🔴⚪🦅', name: 'نسور قرطاج التونسية 🇹🇳' },
  { symbol: '🟢⚪⭐', name: 'الصقور الخضراء السعودية 🇸🇦' },
  { symbol: '⚽🎯', name: 'التسديدة القاتلة في الزاوية' },
  { symbol: '🧤🥅', name: 'السد المنيع وحارس العمر' },
  { symbol: '🔀', name: 'مهندس اللعب وصانع الألعاب' },
  { symbol: '⏱️', name: 'دقيقة الوقت القاتل (90+)' },
  { symbol: '🥅⚡', name: 'شبكة المرمى الصاعقة' },
  { symbol: '🔥⚽', name: 'هجوم النيران الكاسح' },
  { symbol: '🟢⚪🛡️', name: 'صخرة الدفاع الأخضر' },
  { symbol: '🔵⚪🥅', name: 'عرين الأسد الحصين' },
  { symbol: '🟡⚫⚡', name: 'الهجوم المرتد الصاعق' },
  { symbol: '🏆👑', name: 'تاج أبطال الكلاسيكو' }
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
  return {
    background: GRADIENTS[gIdx],
    boxShadow: `0 0 10px ${GLOWS[gIdx]}`
  };
};

const getLogoSymbol = (idx) => {
  if (idx === null || idx === undefined || idx < 0 || idx >= CURATED_LOGOS.length) return '🏆';
  return CURATED_LOGOS[idx].symbol;
};

// URL endpoints mapping
const API_BASE = window.location.origin && !window.location.origin.includes('file://') 
  ? `${window.location.origin}/api` 
  : 'http://localhost:3000/api';

const localWifiUrl = computed(() => {
  return `http://${localIp.value}:3000/tournaments/register`;
});

const cloudPagesUrl = computed(() => {
  if (!store.machineId) return '';
  return `https://emontal60.github.io/Classico-Pro/#/tournaments/register?mid=${encodeURIComponent(store.machineId.toUpperCase().trim())}`;
});

// Fetch active tournament
const activeTournament = computed(() => {
  if (!store.tournaments || store.tournaments.length === 0) return null;
  return store.tournaments.find(t => t.status === 'registration' || t.status === 'active') || store.tournaments[store.tournaments.length - 1];
});

const getPlayerNickname = (id) => {
  if (id === 'bye') return 'تأهل تلقائي ⭐';
  if (!id) return '---';
  const player = activeTournament.value?.players.find(p => p.id === id);
  return player ? player.nickname : '---';
};

const getPlayerLogoSymbol = (id) => {
  if (id === 'bye' || !id) return '⭐';
  const player = activeTournament.value?.players.find(p => p.id === id);
  return player ? getLogoSymbol(player.logoId) : '❓';
};

const getPlayerLogoStyle = (id) => {
  if (id === 'bye' || !id) return { background: 'rgba(255,255,255,0.05)', boxShadow: 'none' };
  const player = activeTournament.value?.players.find(p => p.id === id);
  return player ? getLogoStyle(player.logoId) : {};
};

// Cup Brackets rounds
const cupRounds = computed(() => {
  if (!activeTournament.value || activeTournament.value.type !== 'cup' || !activeTournament.value.matches.length) return [];
  
  const matches = activeTournament.value.matches;
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

// League stats
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

const handleCreateTournament = () => {
  if (!createForm.name.trim()) {
    ui.showToast('يرجى كتابة اسم للبطولة أولاً!', 'warning');
    return;
  }
  
  // Filter out empty prize values
  const filteredPrizes = createForm.prizesList.filter(p => p.value.trim() !== '');
  // Compile into a readable multi-line text for backward compatibility
  const compiledPrizesText = filteredPrizes.map(p => `${p.label}: ${p.value}`).join('\n');

  store.createTournament({
    name: createForm.name.trim(),
    fee: Number(createForm.fee) || 0,
    maxPlayers: Number(createForm.maxPlayers) || 8,
    type: createForm.type,
    prizes: compiledPrizesText,
    prizesList: filteredPrizes
  });
  ui.showToast('تم إنشاء ملف البطولة وتفعيله بنجاح! 🏆', 'success');
};

const handleDeleteTournament = async () => {
  const confirmed = await ui.confirm({
    title: 'إلغاء وحذف البطولة',
    message: 'تنبيه خطير: هل أنت متأكد تماماً من رغبتك في إلغاء وحذف هذه البطولة وكافة بيانات اللاعبين المسجلين نهائياً؟',
    type: 'danger'
  });
  if (confirmed) {
    store.deleteTournament(activeTournament.value.id);
    ui.showToast('تم حذف وإلغاء البطولة بالكامل.', 'info');
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
  const confirmed = await ui.confirm({
    title: 'إلغاء اشتراك لاعب',
    message: `هل أنت متأكد من رغبتك في إزالة اللاعب ${p.nickname} من البطولة؟`,
    type: 'warning'
  });
  if (confirmed) {
    store.removePlayer(activeTournament.value.id, p.id);
    ui.showToast('تم إلغاء الاشتراك وإزالة اللاعب بنجاح.');
  }
};

const submitManualPlayer = () => {
  if (!manualPlayerForm.fullName.trim() || !manualPlayerForm.nickname.trim() || !manualPlayerForm.phone.trim()) {
    ui.showToast('يرجى استكمال جميع الحقول أولاً!', 'warning');
    return;
  }

  const res = store.registerPlayer(activeTournament.value.id, {
    fullName: manualPlayerForm.fullName.trim(),
    nickname: manualPlayerForm.nickname.trim(),
    phone: manualPlayerForm.phone.trim(),
    logoId: Number(manualPlayerForm.logoId)
  });

  if (res.success) {
    ui.showToast(`تم تسجيل اللاعب ${manualPlayerForm.nickname} يدوياً بنجاح! 👥`, 'success');
    showAddPlayerModal.value = false;
    // reset manual form
    manualPlayerForm.fullName = '';
    manualPlayerForm.nickname = '';
    manualPlayerForm.phone = '';
    manualPlayerForm.logoId = 0;
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

// Bracket Generation & Start logic
const handleStartTournament = async () => {
  const players = activeTournament.value.players;
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
        const parentMatch1 = generatedMatches.find(m => m.roundIndex === roundIdx - 1 && m.matchIndex === i * 2);
        const parentMatch2 = generatedMatches.find(m => m.roundIndex === roundIdx - 1 && m.matchIndex === i * 2 + 1);

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
  }

  store.startTournament(activeTournament.value.id, generatedMatches);
  ui.showToast('تم إجراء القرعة وبث المواجهات حياً بنجاح! 🎲🔥', 'success');
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
    const targetMatch = activeTournament.value.matches.find(m => m.id === targetMatchId);
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
      const maxRound = Math.max(...matches.map(m => m.roundIndex));
      const finalMatch = matches.find(m => m.roundIndex === maxRound);
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
    // Delete from active list
    store.deleteTournament(activeTournament.value.id);
    ui.showToast('تمت أرشفة البطولة بنجاح. لوحة التحكم مهيأة لبطولة جديدة! ✨🏆', 'success');
  }
};

onMounted(async () => {
  // Get IP
  try {
    const res = await axios.get(`${API_BASE}/system/local-ip`);
    localIp.value = res.data.ip;
  } catch(e) {}

  // Get status
  await fetchTunnelStatus();
});
</script>

<style scoped>
.tournaments-admin-wrapper {
  padding: 0;
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

</style>
