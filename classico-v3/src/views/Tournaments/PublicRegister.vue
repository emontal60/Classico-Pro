<template>
  <div class="mobile-registration-wrapper" style="direction: rtl;">
    <!-- Top Glowing Accent -->
    <div class="glow-accent-top"></div>

    <div class="registration-container">
      <!-- Header Area -->
      <header class="reg-header animate-fade-in">
        <div class="trophy-badge">🏆</div>
        <h1 class="glow-text">بطولات كلاسيكو برو</h1>
        <p class="subtitle-text">التسجيل والاشتراك المباشر في البطولة</p>
      </header>

      <!-- Loading State -->
      <div v-if="store.isLoading" class="loading-state animate-pulse">
        <div class="spinner"></div>
        <p>جاري تحميل تفاصيل البطولة...</p>
      </div>

      <!-- No Active Tournament State -->
      <div v-else-if="!activeTournament" class="no-tournament-card glass-panel animate-scale-in">
        <div class="warning-icon">🛑</div>
        <h2>لا توجد بطولات حالياً</h2>
        <p>عذراً، لا توجد أي بطولات مفتوحة للتسجيل في الوقت الحالي.</p>
        <div class="info-footer">يرجى المتابعة مع إدارة الصالة لمعرفة مواعيد البطولات القادمة 🎮</div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Tournament Details Banner -->
        <div class="tournament-banner glass-panel animate-scale-in">
          <div class="banner-header">
            <span class="type-tag" :class="activeTournament.type">
              {{ activeTournament.type === 'cup' ? 'كأس (خروج مغلوب)' : 'دوري (نقاط مواجهات)' }}
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
            <div class="stat-item font-wide" style="width: 100%; border: 1px solid rgba(251, 191, 36, 0.15); background: rgba(251, 191, 36, 0.03) !important; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <span class="label" style="color: #fbbf24; font-weight: bold; font-size: 0.8rem; margin-bottom: 4px;">🏆 جوائز ومكافآت البطولة المرصودة</span>
              
              <div v-if="activeTournament.prizesList && activeTournament.prizesList.length > 0" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                <div v-for="(p, idx) in activeTournament.prizesList" :key="idx" style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.4); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); width: 100%;">
                  <span style="font-weight: bold; color: #fff; font-size: 0.78rem;">{{ p.label }}</span>
                  <span style="font-weight: 900; color: #fbbf24; font-size: 0.82rem; text-shadow: 0 0 5px rgba(251, 191, 36, 0.3);">{{ p.value }}</span>
                </div>
              </div>
              
              <span v-else class="value gold-color" style="font-size: 1rem; font-weight: 900; text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);">
                {{ activeTournament.prizes || 'تحدد لاحقاً للبطولة 🏆' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 1. Registration Form (Only if registration is open) -->
        <div v-if="activeTournament.status === 'registration'" class="form-container glass-panel animate-scale-in" style="margin-top: 1.5rem;">
          <h3 class="panel-title">📝 استمارة الاشتراك بالبطولة</h3>
          
          <div v-if="registrationSuccess" class="success-message-card">
            <div class="success-icon">✅</div>
            <h4>تم تسجيلك بنجاح!</h4>
            <p>الاسم المستعار: <strong class="cyan-color">{{ form.nickname }}</strong></p>
            <p class="paid-hint">يرجى دفع رسوم الاشتراك بقيمة ({{ activeTournament.fee }} ج) لإدارة الصالة لتأكيد اشتراكك في قرعة البطولة 💳.</p>
          </div>

          <form v-else @submit.prevent="submitRegistration" class="registration-form">
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
              >
            </div>

            <div class="input-group">
              <label>رقم الهاتف الخاص بك 📱</label>
              <input 
                type="tel" 
                v-model="form.phone" 
                placeholder="مثال: 010xxxxxxxx"
                required
                class="premium-input"
              >
            </div>

            <!-- Avatar Selection (68 Curated esports team icons) -->
            <div class="input-group">
              <label class="avatar-header">
                <span>اختر شعار فريقك الإلكتروني 🎨</span>
                <span class="selected-badge-preview animate-scale-in" v-if="form.logoId !== null">
                  معاينة الشعار: <span class="logo-preview-icon" :style="getLogoStyle(form.logoId)">{{ getLogoSymbol(form.logoId) }}</span>
                </span>
              </label>
              
              <div class="logo-scroll-grid">
                <button
                  type="button"
                  v-for="(logo, idx) in CURATED_LOGOS"
                  :key="idx"
                  :class="['logo-select-btn', { active: form.logoId === idx }]"
                  :style="getLogoStyle(idx)"
                  @click="form.logoId = idx"
                  title="اختر هذا الشعار"
                >
                  <span class="logo-symbol">{{ logo.symbol }}</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              class="btn btn-submit-neon" 
              :disabled="submitting || activeTournament.players.length >= activeTournament.maxPlayers"
            >
              <span v-if="submitting">جاري تسجيل البيانات... ⌛</span>
              <span v-else-if="activeTournament.players.length >= activeTournament.maxPlayers">عذراً، البطولة مكتملة العدد 🛑</span>
              <span v-else>تأكيد وتسجيل الاشتراك بالبطولة 🏆</span>
            </button>
          </form>
        </div>

        <!-- 2. Live Tournament Bracket View (If Active or Completed) -->
        <div v-if="activeTournament.status !== 'registration'" class="live-bracket-container glass-panel animate-scale-in" style="margin-top: 1.5rem;">
          <h3 class="panel-title">📊 خريطة وجدول مباريات البطولة حياً</h3>
          
          <!-- Cup Bracket Rendering -->
          <div v-if="activeTournament.type === 'cup'" class="bracket-viewer-scroller">
            <div class="bracket-rounds-container">
              <div v-for="round in cupRounds" :key="round.index" class="bracket-round-column">
                <h4 class="round-title-banner">{{ round.name }}</h4>
                
                <div class="round-matches-list">
                  <div v-for="match in round.matches" :key="match.id" class="bracket-match-node">
                    <!-- Player 1 -->
                    <div class="match-player-row" :class="{ winner: match.winnerId === match.player1Id && match.played, lost: match.winnerId !== match.player1Id && match.played }">
                      <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player1Id)">
                        {{ getPlayerLogoSymbol(match.player1Id) }}
                      </span>
                      <span class="player-nick">{{ getPlayerNickname(match.player1Id) }}</span>
                      <span class="player-score">{{ match.played ? match.player1Score : '-' }}</span>
                    </div>

                    <div class="vs-divider">ضد</div>

                    <!-- Player 2 -->
                    <div class="match-player-row" :class="{ winner: match.winnerId === match.player2Id && match.played, lost: match.winnerId !== match.player2Id && match.played }">
                      <span class="player-logo-mini" :style="getPlayerLogoStyle(match.player2Id)">
                        {{ getPlayerLogoSymbol(match.player2Id) }}
                      </span>
                      <span class="player-nick">{{ getPlayerNickname(match.player2Id) }}</span>
                      <span class="player-score">{{ match.played ? match.player2Score : '-' }}</span>
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
                  <tr v-for="(p, rank) in leagueLeaderboard" :key="p.id">
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
          <h3 class="panel-title">👥 اللاعبين المسجلين حالياً ({{ activeTournament.players.length }})</h3>
          
          <div v-if="activeTournament.players.length === 0" class="empty-players-hint">
            لا يوجد لاعبين مسجلين بعد. كن أول من يسجل بالبطولة! 🏆
          </div>
          
          <div v-else class="players-badges-grid">
            <div 
              v-for="p in activeTournament.players" 
              :key="p.id" 
              class="player-badge-card"
            >
              <span class="p-logo" :style="getLogoStyle(p.logoId)">
                {{ getLogoSymbol(p.logoId) }}
              </span>
              <div class="p-info">
                <span class="p-nick">{{ p.nickname }}</span>
                <span class="p-status" :class="{ paid: p.paid }">
                  {{ p.paid ? 'مؤكد السداد' : 'بانتظار الدفع' }}
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
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const submitting = ref(false);
const registrationSuccess = ref(false);

const form = reactive({
  fullName: '',
  nickname: '',
  phone: '',
  logoId: 0
});

// Curated 68 esports gaming logo symbols with distinct neon glowing backgrounds
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
  { symbol: 'Sneakers 👟', name: 'الحذاء الذهبي الكلاسيكي' },
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

// Curated 12 distinct esports neon glowing gradients
const GRADIENTS = [
  'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', // cyan
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', // red/pink
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // purple
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // orange
  'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', // sunset
  'linear-gradient(135deg, #f6d365 0%, #b45309 100%)', // gold
  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // green
  'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', // pink/purple
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // deep blue
  'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', // lava orange/red
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // cyan dark
  'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)'  // violet
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

// Helper styles for logo grids
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
const fullCloudDataPayload = ref(null); // Keep full backup payload to avoid dropping other salon tables

// Fetch current active registration tournament
const activeTournament = computed(() => {
  if (isCloudMode.value) {
    return cloudTournament.value;
  }
  if (!store.tournaments || store.tournaments.length === 0) return null;
  // Get active or registration tournament
  return store.tournaments.find(t => t.status === 'registration' || t.status === 'active') || store.tournaments[store.tournaments.length - 1];
});

const getStatusLabel = (status) => {
  const labels = {
    registration: 'مفتوح للتسجيل 👥',
    active: 'جارية الآن 🎮',
    completed: 'منتهية 🏆'
  };
  return labels[status] || status;
};

// Tournament Bracket rounds for Cup system
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

  // Sort by points (desc)
  return stats.sort((a, b) => b.points - a.points);
});

// Helpers to get player name, nicknames and styles
const getPlayerNickname = (id) => {
  if (id === 'bye' || !id) return 'تأهل تلقائي ⭐️';
  const player = activeTournament.value?.players.find(p => p.id === id);
  return player ? player.nickname : '---';
};

const getPlayerLogoSymbol = (id) => {
  if (id === 'bye' || !id) return '⭐';
  const player = activeTournament.value?.players.find(p => p.id === id);
  return player ? getLogoSymbol(player.logoId) : '❓';
};

const getPlayerLogoStyle = (id) => {
  if (id === 'bye' || !id) {
    return {
      background: 'rgba(255,255,255,0.05)',
      boxShadow: 'none'
    };
  }
  const player = activeTournament.value?.players.find(p => p.id === id);
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
  const dup = activeTournament.value.players.find(p => p.nickname.toLowerCase() === form.nickname.trim().toLowerCase());
  if (dup) {
    alert('هذا الاسم المستعار مسجل بالفعل! يرجى اختيار اسم مستعار آخر.');
    return;
  }

  submitting.value = true;
  try {
    if (isCloudMode.value) {
      // 1. Create new Player object
      const newPlayer = {
        id: 'PLR-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
        fullName: form.fullName.trim(),
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        logoId: Number(form.logoId),
        paid: false,
        paidAt: null,
        joinedAt: new Date().toISOString()
      };

      // 2. Append to tournament player list
      cloudTournament.value.players.push(newPlayer);

      // 3. Update in the array inside full backup state
      const tournamentsList = fullCloudDataPayload.value.classico_tournaments || [];
      const tIdx = tournamentsList.findIndex(t => t.id === cloudTournament.value.id);
      if (tIdx !== -1) {
        tournamentsList[tIdx] = cloudTournament.value;
      } else {
        tournamentsList.push(cloudTournament.value);
      }
      fullCloudDataPayload.value.classico_tournaments = tournamentsList;

      // 4. Update the Supabase cloud table row
      const { supabase } = await import('../../utils/supabase');
      const { error } = await supabase
        .from('cloud_backups')
        .update({
          data: fullCloudDataPayload.value,
          updated_at: new Date().toISOString()
        })
        .eq('machine_id', cloudMachineId.value);

      if (error) throw error;

      registrationSuccess.value = true;
      form.fullName = '';
      form.phone = '';

    } else {
      // WiFi local server mode
      const res = await store.registerPlayer(activeTournament.value.id, {
        fullName: form.fullName.trim(),
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        logoId: Number(form.logoId)
      });

      if (res.success) {
        registrationSuccess.value = true;
        form.fullName = '';
        form.phone = '';
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

onMounted(async () => {
  const route = useRoute();
  let mid = route.query.mid || route.query.MID;

  // Fallback 1: Parse from hash route manually if route.query is not ready
  if (!mid && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.split('?')[1];
    const params = new URLSearchParams(hashQuery);
    mid = params.get('mid') || params.get('MID');
  }

  // Fallback 2: Parse from window.location.search directly
  if (!mid) {
    const params = new URLSearchParams(window.location.search);
    mid = params.get('mid') || params.get('MID');
  }

  if (mid) {
    const uppercaseMid = mid.toUpperCase().trim();
    console.log(`[Registration] Cloud Mode detected for Machine ID: ${uppercaseMid}`);
    isCloudMode.value = true;
    cloudMachineId.value = uppercaseMid;
    store.isLoading = true;

    try {
      const { supabase } = await import('../../utils/supabase');
      const { data, error } = await supabase
        .from('cloud_backups')
        .select('data')
        .eq('machine_id', uppercaseMid)
        .single();

      if (error) throw error;

      if (data && data.data) {
        fullCloudDataPayload.value = data.data;
        const tournamentsList = data.data.classico_tournaments || [];
        // Find active/registration tournament
        const active = tournamentsList.find(t => t.status === 'registration' || t.status === 'active') || tournamentsList[tournamentsList.length - 1];
        cloudTournament.value = active || null;
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
    } catch(e) {}
  }
});
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
</style>
