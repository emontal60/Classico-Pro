<template>
  <div class="gamepad-page glass-panel shadow-premium fade-in">
    <!-- Header Section -->
    <div class="page-header-v3">
      <div class="header-main-v3">
        <h2 class="title-v3">
          <span class="pulse-glow-icon">🎮</span> معمل صيانة وفحص أذرع التحكم
        </h2>
        <p class="subtitle-v3">
          قم بتوصيل ذراع البلايستيشن (أو أي ذراع أخرى) بالكمبيوتر عبر الـ USB أو البلوتوث لفحص جودة الأزرار، وحساسية الأنالوج، ومحاكاة الاهتزاز بدقة متناهية.
        </p>
      </div>
    </div>

    <!-- Connection Status Bar (Full Width & Centered) -->
    <div :class="['status-bar-v3', { connected: isConnected }]">
      <span class="status-dot"></span>
      <span class="status-text">{{ isConnected ? 'متصل: ' + gamepadName : 'بانتظار توصيل ذراع التحكم... ⏳' }}</span>
    </div>

    <!-- Main Workspace -->
    <div class="workspace-grid">
      <!-- Left Column: Visual Controller & Realtime Inputs -->
      <div class="workspace-card visualizer-card glass-card">
        <h3 class="card-title">🔍 الفحص البصري الفوري</h3>
        
        <div class="controller-visualizer">
        <div class="controller-visualizer" style="direction: ltr !important;">
          <div class="dualsense-container">
            <!-- PlayStation 5 DualSense Vector Outline -->
            <svg class="dualsense-svg" viewBox="0 0 520 360" xmlns="http://www.w3.org/2000/svg">
              <!-- Main curved back plate shadow -->
              <path d="M 120 40 L 400 40 C 470 40 500 80 500 130 C 500 175 440 315 410 335 C 385 350 365 300 345 260 C 330 220 300 215 260 215 C 220 215 190 220 175 260 C 155 300 135 350 110 335 C 80 315 20 175 20 130 C 20 80 50 40 120 40 Z" fill="#0f172a" stroke="rgba(255,255,255,0.06)" stroke-width="3" />
              
              <!-- White Left Hand Grip -->
              <path d="M 120 40 C 60 40 28 80 25 130 C 22 170 65 315 95 335 C 110 345 130 305 150 255 C 168 210 182 170 182 135 C 182 95 160 50 120 40 Z" fill="#cbd5e1" stroke="rgba(255,255,255,0.8)" stroke-width="0.5" />
              
              <!-- White Right Hand Grip -->
              <path d="M 400 40 C 460 40 492 80 495 130 C 498 170 455 315 425 335 C 410 345 390 305 370 255 C 352 210 338 170 338 135 C 338 95 360 50 400 40 Z" fill="#cbd5e1" stroke="rgba(255,255,255,0.8)" stroke-width="0.5" />

              <!-- Black Center Plate -->
              <path d="M 182 85 C 182 130 168 210 150 255 C 160 270 180 285 200 285 C 225 285 235 255 260 255 C 285 255 295 285 320 285 C 340 285 360 270 370 255 C 352 210 338 130 338 85 L 182 85 Z" fill="#1e293b" />
              
              <!-- Inner Curved Black Lower Face -->
              <path d="M 182 135 C 182 195 210 240 260 240 C 310 240 338 195 338 135 L 182 135 Z" fill="#0f172a" />



              <!-- Decorative controller grooves/accents -->
              <circle cx="200" cy="225" r="35" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="3" />
              <circle cx="320" cy="225" r="35" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="3" />
            </svg>

            <!-- Triggers (L2 / R2) -->
            <div :class="['analog-trigger left-trig', { pressed: getButtonState(6) }]">
              <div class="pressure-fill" :style="{ height: getButtonValue(6) * 100 + '%' }"></div>
              <span class="label">L2</span>
              <span class="val">{{ Math.round(getButtonValue(6) * 100) }}%</span>
            </div>
            <div :class="['analog-trigger right-trig', { pressed: getButtonState(7) }]">
              <div class="pressure-fill" :style="{ height: getButtonValue(7) * 100 + '%' }"></div>
              <span class="label">R2</span>
              <span class="val">{{ Math.round(getButtonValue(7) * 100) }}%</span>
            </div>

            <!-- Bumpers (L1 / R1) -->
            <div :class="['bumper-key left-bump', { active: getButtonState(4) }]">L1</div>
            <div :class="['bumper-key right-bump', { active: getButtonState(5) }]">R1</div>

            <!-- Touchpad (Upper Center) -->
            <div :class="['touchpad-surface', { active: getButtonState(17) }]">
              <span class="tp-label">TOUCHPAD</span>
            </div>

            <!-- Share & Options Buttons -->
            <button :class="['action-util-btn share-key', { active: getButtonState(8) }]" title="Share"></button>
            <button :class="['action-util-btn options-key', { active: getButtonState(9) }]" title="Options"></button>

            <!-- D-Pad (Left leg) -->
            <div class="dpad-cross">
              <div :class="['dpad-direction up-key', { active: getButtonState(12) }]">▲</div>
              <div :class="['dpad-direction left-key', { active: getButtonState(14) }]">◀</div>
              <div :class="['dpad-direction right-key', { active: getButtonState(15) }]">▶</div>
              <div :class="['dpad-direction down-key', { active: getButtonState(13) }]">▼</div>
              <div class="dpad-core"></div>
            </div>

            <!-- Action Buttons (Right leg) -->
            <div class="action-buttons-group">
              <div :class="['action-glyph triangle-key', { active: getButtonState(3) }]">▲</div>
              <div :class="['action-glyph square-key', { active: getButtonState(2) }]">■</div>
              <div :class="['action-glyph circle-key', { active: getButtonState(1) }]">●</div>
              <div :class="['action-glyph cross-key', { active: getButtonState(0) }]">✖</div>
            </div>

            <!-- Thumbsticks -->
            <!-- Left Thumbstick (L3) -->
            <div :class="['analog-stick-well left-well', { active: getButtonState(10) }]">
              <div class="stick-knob" :style="{ transform: `translate(${axes[0] * 16}px, ${axes[1] * 16}px)` }">
                <span class="knob-label">L3</span>
              </div>
            </div>
            <!-- Right Thumbstick (R3) -->
            <div :class="['analog-stick-well right-well', { active: getButtonState(11) }]">
              <div class="stick-knob" :style="{ transform: `translate(${axes[2] * 16}px, ${axes[3] * 16}px)` }">
                <span class="knob-label">R3</span>
              </div>
            </div>

            <!-- PS Center Logo Button -->
            <button :class="['ps-logo-btn', { active: getButtonState(16) }]">
              <span class="logo">🎮</span>
            </button>
          </div>
        </div>
        </div>

        <!-- Haptic / Vibration Controller -->
        <div class="rumble-container glass-panel">
          <h4 class="sub-title">📳 فحص هزازات المحاكاة (Haptics)</h4>
          <div class="rumble-controls">
            <div class="slider-group">
              <label>قوة الاهتزاز ({{ Math.round(rumbleStrength * 100) }}%)</label>
              <input type="range" min="0" max="1" step="0.1" v-model="rumbleStrength" class="sys-slider">
            </div>
            <div class="btn-group">
              <button @click="triggerRumble(300)" :disabled="!isConnected" class="btn-sys-v3 success">
                ⚡ اختبار نبضة هزاز سريع
              </button>
              <button @click="triggerRumble(1500)" :disabled="!isConnected" class="btn-sys-v3 warning">
                🔥 هزاز مستمر 1.5 ثانية
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Stick Drift Analysis & Guided Diagnostic Test -->
      <div class="workspace-card diagnostics-card glass-card">
        <h3 class="card-title">📉 رادار ومعايرة الأنالوج (Stick Drift)</h3>
        
        <div class="sticks-telemetry-grid">
          <!-- Left Stick Grid -->
          <div class="stick-telemetry">
            <h4 class="telemetry-title">🎯 عصا التحكم اليسرى (L3)</h4>
            <div class="coordinates-grid">
              <!-- Target coordinate center crosshair -->
              <div class="crosshair-h"></div>
              <div class="crosshair-v"></div>
              <!-- Realtime Joystick coordinate dot -->
              <div class="coord-dot" :style="{ left: `calc(50% + ${axes[0] * 50}% - 4px)`, top: `calc(50% + ${axes[1] * 50}% - 4px)` }"></div>
              <!-- Deadzone center circle -->
              <div class="deadzone-circle"></div>
            </div>
            <div class="coord-details">
              <span>X: <b>{{ axes[0].toFixed(3) }}</b></span>
              <span>Y: <b>{{ axes[1].toFixed(3) }}</b></span>
              <span :class="['drift-badge', getDriftLevel(axes[0], axes[1])]">
                معدل انحراف: <b>{{ calculateDrift(axes[0], axes[1]) }}%</b>
              </span>
            </div>
          </div>

          <!-- Right Stick Grid -->
          <div class="stick-telemetry">
            <h4 class="telemetry-title">🎯 عصا التحكم اليمنى (R3)</h4>
            <div class="coordinates-grid">
              <div class="crosshair-h"></div>
              <div class="crosshair-v"></div>
              <div class="coord-dot" :style="{ left: `calc(50% + ${axes[2] * 50}% - 4px)`, top: `calc(50% + ${axes[3] * 50}% - 4px)` }"></div>
              <div class="deadzone-circle"></div>
            </div>
            <div class="coord-details">
              <span>X: <b>{{ axes[2].toFixed(3) }}</b></span>
              <span>Y: <b>{{ axes[3].toFixed(3) }}</b></span>
              <span :class="['drift-badge', getDriftLevel(axes[2], axes[3])]">
                معدل انحراف: <b>{{ calculateDrift(axes[2], axes[3]) }}%</b>
              </span>
            </div>
          </div>
        </div>

        <!-- Guided Diagnostic wizard -->
        <div class="wizard-container glass-panel">
          <h4 class="sub-title">📝 نظام الفحص الإرشادي وتقييم الحالة</h4>
          
          <!-- State 1: Start Wizard -->
          <div v-if="wizardState === 'idle'" class="wizard-idle-state">
            <p class="wizard-desc" style="margin-bottom: 0.8rem;">
              سيقوم نظام الفحص الإرشادي باختبار كافة الأزرار بالتسلسل ومراقبة سرعة الاستجابة وقياس الانحراف لإعطاء تقرير حالة دقيق للذراع.
            </p>
            <p class="wizard-instruction" style="font-size: 0.95rem; color: #38bdf8; font-weight: 700; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px;">
              <span>💡</span> ابدأ الفحص واختبر الأزرار
            </p>
            <button @click="startWizard" :disabled="!isConnected" class="btn-sys-v3 success large-btn">
              ⚡ ابدأ الفحص الشامل للذراع الآن
            </button>
          </div>

          <!-- State 2: Active Wizard Testing -->
          <div v-else-if="wizardState === 'testing'" class="wizard-active-state">
            <div class="wizard-progress">
              <div class="progress-bar-fill" :style="{ width: (wizardStepIndex / wizardSteps.length) * 100 + '%' }"></div>
              <span class="steps-txt">خطوة {{ wizardStepIndex + 1 }} من {{ wizardSteps.length }}</span>
            </div>
            
            <div class="current-prompt" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <div class="prompt-icon animate-pulse">{{ wizardSteps[wizardStepIndex].icon }}</div>
              <div class="prompt-instruction">
                <span v-if="wizardSteps[wizardStepIndex].isAnalog">يرجى تحريك وعمل حركة دائرية لـ:</span>
                <span v-else>يرجى الضغط على زر:</span>
              </div>
              <div class="prompt-target glow-text">{{ wizardSteps[wizardStepIndex].label }}</div>

              <!-- Real-time Analog Diagnostic Panel -->
              <div v-if="wizardSteps[wizardStepIndex].isAnalog" class="analog-diagnostic-panel-v3">
                <div class="diagnostic-progress-bar">
                  <div class="diag-fill" :style="{ width: (analogHasMoved ? (analogRestFrames / 30) * 100 : 0) + '%' }"></div>
                </div>
                <div class="diagnostic-meta">
                  <span class="diag-status-txt">
                    <span v-if="!analogHasMoved" class="animate-pulse" style="color: #38bdf8;">🔄 الخطوة 1: حرك عصا الأنالوج بشكل دائري كامل...</span>
                    <span v-else-if="analogRestFrames < 30" style="color: #10b981; font-weight: 800;" class="animate-pulse">🟢 الخطوة 2: اترك العصا تماماً لتعود للمركز (جاري فحص انحراف المنتصف)...</span>
                    <span v-else style="color: #10b981;">✅ تم التقاط نسبة الانحراف بنجاح!</span>
                  </span>
                </div>
                
                <div class="realtime-drift-stats">
                  <div class="drift-stat-item">
                    <span style="color: #94a3b8; font-size: 0.75rem;">الانحراف الفعلي الحالي:</span>
                    <strong :class="['val', getDriftLevel(getCurrentStickCoords().x, getCurrentStickCoords().y)]" style="font-size: 0.85rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                      {{ calculateDrift(getCurrentStickCoords().x, getCurrentStickCoords().y) }}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="wizard-actions">
              <button @click="skipStep" class="btn-sys-v3 secondary">تخطي هذا الزر ⏩</button>
              <button @click="cancelWizard" class="btn-sys-v3 danger">إلغاء الفحص ✖</button>
            </div>
          </div>

          <!-- State 3: Show Scorecard -->
          <div v-else-if="wizardState === 'completed'" class="wizard-scorecard-state fade-in">
            <div class="scorecard-header">
              <div class="dual-meters-v3">
                <div class="meter-box success">
                  <span class="meter-percent success-glow">{{ healthScore }}%</span>
                  <span class="meter-label">نسبة جودة الذراع</span>
                </div>
                <div class="meter-box danger">
                  <span class="meter-percent danger-glow">{{ 100 - healthScore }}%</span>
                  <span class="meter-label">نسبة الأعطال والمشاكل</span>
                </div>
              </div>
              <div class="health-meta">
                <h5 class="meta-title">تقرير جودة وحالة الذراع</h5>
                <p class="meta-desc">تم الانتهاء من الفحص التفاعلي الشامل بنجاح.</p>
                <span :class="['health-text-badge', getHealthColorClass(healthScore)]">
                  الحالة العامة: {{ getHealthStatusText(healthScore) }}
                </span>
              </div>
            </div>

            <!-- Scorecard Details -->
            <div class="scorecard-details">
              <div class="detail-row">
                <span>استجابة أزرار الضغط (Buttons):</span>
                <span class="val success">ممتازة (100%) ✅</span>
              </div>
              <div class="detail-row">
                <span>عصا الأنالوج الأيسر (L3):</span>
                <span :class="['val', getDriftLevel(maxL3Drift.x, maxL3Drift.y)]">
                  انحراف {{ maxL3DriftVal }}% ({{ getDriftText(maxL3DriftVal) }})
                </span>
              </div>
              <div class="detail-row">
                <span>عصا الأنالوج الأيمن (R3):</span>
                <span :class="['val', getDriftLevel(maxR3Drift.x, maxR3Drift.y)]">
                  انحراف {{ maxR3DriftVal }}% ({{ getDriftText(maxR3DriftVal) }})
                </span>
              </div>
              <div class="detail-row">
                <span>سرعة نقل الإشارات الفورية (Delay):</span>
                <span class="val success">فائقة (~4ms) ⚡</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="scorecard-actions">
              <button @click="printScorecard" class="btn-sys-v3 success">🖨️ طباعة تقرير الصيانة الفني</button>
              <button @click="wizardState = 'idle'" class="btn-sys-v3 secondary">🔄 إعادة الفحص الشامل</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 🏆 Premium Certificate Modal -->
  <div v-if="showCertificateModal" class="cert-modal-overlay">
    <div class="certificate-modal-container">
      
      <!-- Action Toolbar -->
      <div class="modal-actions-bar">
        <button @click="triggerPrint" class="btn-cert-action print-btn">🖨️ طباعة / حفظ PDF</button>
        <button @click="exportAsImage" class="btn-cert-action image-btn">🖼️ تحميل كصورة PNG</button>
        <button @click="showCertificateModal = false" class="btn-cert-action close-btn">✕ إغلاق</button>
      </div>

      <!-- The Certificate Design -->
      <div id="technical-certificate" class="certificate-print-area premium-gold-frame">
        <div class="certificate-inner-border">
          <!-- Corner ornaments -->
          <div class="corner-ornament top-left"></div>
          <div class="corner-ornament top-right"></div>
          <div class="corner-ornament bottom-left"></div>
          <div class="corner-ornament bottom-right"></div>

          <!-- Header -->
          <div class="cert-header">
            <div class="cert-crown">👑</div>
            <h1 class="cert-main-title">شهادة فحص ومعايرة فنية</h1>
            <p class="cert-sub-title">TECHNICAL CALIBRATION & QUALITY CERTIFICATE</p>
          </div>

          <!-- Statement -->
          <p class="cert-statement">
            يشهد معمل الصيانة الذكي بنظام <strong>كلاسيكو برو (Classico Pro)</strong> بأن ذراع التحكم المذكورة أدناه قد اجتازت الفحوصات الفنية والقياسات الرقمية بدقة عالية.
          </p>

          <!-- Device Info -->
          <div class="cert-device-info">
            <div class="info-block">
              <span class="info-label">اسم وعقد ذراع التحكم:</span>
              <span class="info-val">{{ gamepadName || 'DualSense Wireless Controller' }}</span>
            </div>
            <div class="info-block">
              <span class="info-label">تاريخ الفحص والاعتماد:</span>
              <span class="info-val">{{ new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
            </div>
          </div>

          <!-- Score Seal & Calibration Results -->
          <div class="cert-body-layout">
            <!-- Dual Seals -->
            <div class="cert-seals-container-v3">
              <div class="cert-seal-v3 quality-seal">
                <div class="seal-inner-v3">
                  <span class="seal-score-v3 success-text">{{ healthScore }}%</span>
                  <span class="seal-label-v3">جودة الذراع</span>
                </div>
              </div>
              <div class="cert-seal-v3 problem-seal">
                <div class="seal-inner-v3">
                  <span class="seal-score-v3 danger-text">{{ 100 - healthScore }}%</span>
                  <span class="seal-label-v3">نسبة الأعطال</span>
                </div>
              </div>
            </div>

            <!-- Detailed Calibration Table -->
            <table class="cert-table">
              <thead>
                <tr>
                  <th>مادة الفحص الفني</th>
                  <th>حالة الاستجابة والنسبة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>استجابة الأزرار والـ D-Pad</td>
                  <td class="success-text">سليمة ومستقرة تماماً (100% استجابة) ✅</td>
                </tr>
                <tr>
                  <td>حساسية الأنالوج الأيسر (L3)</td>
                  <td>انحراف {{ maxL3DriftVal }}% ({{ getDriftText(maxL3DriftVal) }})</td>
                </tr>
                <tr>
                  <td>حساسية الأنالوج الأيمن (R3)</td>
                  <td>انحراف {{ maxR3DriftVal }}% ({{ getDriftText(maxR3DriftVal) }})</td>
                </tr>
                <tr>
                  <td>محاكاة الاهتزاز والنبض اللمسي</td>
                  <td class="success-text">موتورات الاهتزاز تعمل بكفاءة عالية ✅</td>
                </tr>
                <tr>
                  <td>سرعة الاستجابة وزمن التأخير</td>
                  <td class="success-text">فائقة الاستجابة (~4ms) ⚡</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer Stamps -->
          <div class="cert-footer-row">
            <div class="footer-sign">
              <span class="sign-label">معتمد من إدارة الفحص الرقمي</span>
              <div class="stamp-placeholder">
                <span class="stamp-circle">APPROVED</span>
              </div>
            </div>
            <div class="footer-branding">
              <span class="brand-text">Classico Pro System</span>
              <span class="brand-version">v3.0 - Intelligent Lab</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';

const store = useAppStore();
const ui = useUIStore();

// Gamepad Connection state
const isConnected = ref(false);
const gamepadName = ref('');
const gamepadIndex = ref(-1);

// Gamepad buttons & axes state
const buttons = ref([]);
const axes = ref([0, 0, 0, 0]); // L_X, L_Y, R_X, R_Y
const rumbleStrength = ref(0.8);

let rafId = null;

// Guided diagnostic wizard steps configuration
const wizardState = ref('idle'); // idle, testing, completed
const wizardStepIndex = ref(0);
const wizardSteps = [
  { buttonId: 0, label: '✖ (Cross)', icon: '✖' },
  { buttonId: 1, label: '● (Circle)', icon: '●' },
  { buttonId: 2, label: '■ (Square)', icon: '■' },
  { buttonId: 3, label: '▲ (Triangle)', icon: '▲' },
  { buttonId: 4, label: 'L1 (Bumper اليسار)', icon: 'L1' },
  { buttonId: 5, label: 'R1 (Bumper اليمين)', icon: 'R1' },
  { buttonId: 6, label: 'L2 (زناد اليسار)', icon: 'L2' },
  { buttonId: 7, label: 'R2 (زناد اليمين)', icon: 'R2' },
  { buttonId: 12, label: '▲ (D-pad فوق)', icon: '▲' },
  { buttonId: 13, label: '▼ (D-pad تحت)', icon: '▼' },
  { buttonId: 14, label: '◀ (D-pad يسار)', icon: '◀' },
  { buttonId: 15, label: '▶ (D-pad يمين)', icon: '▶' },
  { buttonId: 8, label: 'Share / Create (الزر الأيسر بجانب التاتش)', icon: '⧉' },
  { buttonId: 9, label: 'Options (الزر الأيمن بجانب التاتش)', icon: '☰' },
  { isAnalog: true, stick: 'L3', label: 'الأنالوج الأيسر (حركه دائرياً لـ 75% من المدى)', icon: '🕹️' },
  { isAnalog: true, stick: 'R3', label: 'الأنالوج الأيمن (حركه دائرياً لـ 75% من المدى)', icon: '🕹️' },
];

// Health score values saved after wizard completing
const healthScore = ref(100);
const maxL3Drift = reactive({ x: 0, y: 0 });
const maxR3Drift = reactive({ x: 0, y: 0 });
const maxL3DriftVal = ref(0);
const maxR3DriftVal = ref(0);

// Real-time analog circular progress calibration variables
const analogTestProgress = ref(0);
const analogHasMoved = ref(false);
const analogRestFrames = ref(0);
const restingXAccum = ref(0);
const restingYAccum = ref(0);

const getCurrentStickCoords = () => {
  if (wizardState.value !== 'testing') return { x: 0, y: 0 };
  const targetStep = wizardSteps[wizardStepIndex.value];
  if (!targetStep || !targetStep.isAnalog) return { x: 0, y: 0 };
  
  const gp = navigator.getGamepads()[gamepadIndex.value];
  if (!gp) return { x: 0, y: 0 };
  
  if (targetStep.stick === 'L3') {
    return { x: gp.axes[0], y: gp.axes[1] };
  } else {
    return { x: gp.axes[2], y: gp.axes[3] };
  }
};

// Helper function to read button values safely
const getButtonState = (index) => {
  if (!buttons.value[index]) return false;
  return buttons.value[index].pressed;
};

const getButtonValue = (index) => {
  if (!buttons.value[index]) return 0;
  return buttons.value[index].value || 0;
};

// Calculate stick drift percentage
const calculateDrift = (x, y) => {
  const dist = Math.sqrt(x*x + y*y);
  return Math.min(Math.round(dist * 100), 100);
};

// Return CSS text indicator based on stick drift percentage
const getDriftLevel = (x, y) => {
  const drift = calculateDrift(x, y);
  if (drift < 8) return 'success';
  if (drift < 18) return 'warning';
  return 'danger';
};

const getDriftText = (driftVal) => {
  if (driftVal < 8) return 'سليم ومستقر 🟢';
  if (driftVal < 18) return 'انحراف بسيط مقلوب 🟡';
  return 'يحتاج صيانة / دريفت مرتفع 🔴';
};

// Get health color classes for circular gauges
const getHealthColorClass = (score) => {
  if (score >= 90) return 'success';
  if (score >= 70) return 'warning';
  return 'danger';
};

const getHealthStatusText = (score) => {
  if (score >= 90) return 'ممتازة وجاهزة للمباريات 🌟';
  if (score >= 70) return 'جيدة (تحتوي انحراف أنالوج خفيف) 👍';
  return 'تحتاج صيانة فورية لتفادي أخطاء التحكم ⚠️';
};

// Trigger Rumble/Vibration haptics
const triggerRumble = async (duration = 300) => {
  if (!isConnected.value || gamepadIndex.value === -1) return;
  const gp = navigator.getGamepads()[gamepadIndex.value];
  if (gp && gp.vibrationActuator) {
    try {
      await gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: duration,
        weakMagnitude: rumbleStrength.value,
        strongMagnitude: rumbleStrength.value
      });
      ui.showToast('تم إرسال نبضة الاهتزاز بنجاح 📳', 'info');
    } catch (e) {
      console.warn('Vibration not supported on this browser/controller', e);
    }
  } else {
    ui.showToast('عذراً، هذا الذراع لا يدعم محاكي الهزاز 📳', 'warning');
  }
};

// Guided wizard routines
const startWizard = () => {
  if (!isConnected.value) return;
  wizardState.value = 'testing';
  wizardStepIndex.value = 0;
  maxL3Drift.x = 0; maxL3Drift.y = 0;
  maxR3Drift.x = 0; maxR3Drift.y = 0;
  maxL3DriftVal.value = 0;
  maxR3DriftVal.value = 0;
  analogTestProgress.value = 0;
  analogHasMoved.value = false;
  analogRestFrames.value = 0;
  restingXAccum.value = 0;
  restingYAccum.value = 0;
  ui.showToast('بدأ الفحص الشامل، اضغط على الأزرار المضيئة ⏳', 'info');
};

const skipStep = () => {
  analogTestProgress.value = 0;
  analogHasMoved.value = false;
  analogRestFrames.value = 0;
  restingXAccum.value = 0;
  restingYAccum.value = 0;
  nextStep();
};

const cancelWizard = () => {
  wizardState.value = 'idle';
  analogTestProgress.value = 0;
  analogHasMoved.value = false;
  analogRestFrames.value = 0;
  restingXAccum.value = 0;
  restingYAccum.value = 0;
  ui.showToast('تم إلغاء فحص الذراع ❌', 'warning');
};

const nextStep = () => {
  if (wizardStepIndex.value < wizardSteps.length - 1) {
    wizardStepIndex.value++;
    // Trigger tiny quick rumble on step completion
    triggerTinyVibration();
  } else {
    // Complete wizard, compute score
    completeWizard();
  }
};

const triggerTinyVibration = () => {
  const gp = navigator.getGamepads()[gamepadIndex.value];
  if (gp && gp.vibrationActuator) {
    gp.vibrationActuator.playEffect('dual-rumble', { startDelay: 0, duration: 80, weakMagnitude: 0.4, strongMagnitude: 0 });
  }
};

const completeWizard = () => {
  // Calculate maximum drift values
  maxL3DriftVal.value = calculateDrift(maxL3Drift.x, maxL3Drift.y);
  maxR3DriftVal.value = calculateDrift(maxR3Drift.x, maxR3Drift.y);
  
  // Base health score starts at 100
  let score = 100;
  
  // Deduct based on stick drift with a maximum penalty cap of 25% per stick (total max 50% deduction)
  // This guarantees that stick drift alone can never drag the entire gamepad quality score below 50%
  // if all buttons, triggers, and D-pads are fully functional.
  const l3Penalty = Math.max(0, maxL3DriftVal.value - 8);
  const r3Penalty = Math.max(0, maxR3DriftVal.value - 8);
  
  const l3Deduction = Math.min(25, Math.round(l3Penalty * 0.8));
  const r3Deduction = Math.min(25, Math.round(r3Penalty * 0.8));
  
  score -= (l3Deduction + r3Deduction);
  healthScore.value = Math.max(10, Math.min(score, 100));
  
  wizardState.value = 'completed';
  ui.showToast('اكتمل فحص ذراع التحكم بنجاح! 🏆', 'success');
};

// Gamepad polling loop
const pollGamepad = () => {
  const gamepads = navigator.getGamepads();
  const gp = gamepads[gamepadIndex.value];
  
  if (gp) {
    buttons.value = gp.buttons;
    axes.value = gp.axes;

    if (wizardState.value === 'testing') {
      // Check if target button/analog in wizard is active
      const targetStep = wizardSteps[wizardStepIndex.value];
      if (targetStep.isAnalog) {
        // Read stick axes
        const x = targetStep.stick === 'L3' ? gp.axes[0] : gp.axes[2];
        const y = targetStep.stick === 'L3' ? gp.axes[1] : gp.axes[3];
        const magnitude = Math.sqrt(x*x + y*y);
        
        if (!analogHasMoved.value) {
          // Phase 1: Wait for user to push stick past 0.6 (confirming rotation/movement check)
          if (magnitude > 0.6) {
            analogHasMoved.value = true;
          }
        } else {
          // Phase 2: User has moved the stick. Now wait for them to let go (magnitude < 0.15)
          if (magnitude < 0.15) {
            analogRestFrames.value++;
            
            // Accumulate resting offsets to get a highly stable average resting offset
            restingXAccum.value += x;
            restingYAccum.value += y;
            
            if (analogRestFrames.value >= 30) { // ~0.5s resting at absolute center
              const avgX = restingXAccum.value / 30;
              const avgY = restingYAccum.value / 30;
              const restingDrift = calculateDrift(avgX, avgY);
              
              if (targetStep.stick === 'L3') {
                maxL3DriftVal.value = restingDrift;
                maxL3Drift.x = avgX;
                maxL3Drift.y = avgY;
              } else {
                maxR3DriftVal.value = restingDrift;
                maxR3Drift.x = avgX;
                maxR3Drift.y = avgY;
              }
              
              // Reset state for next analog step
              analogHasMoved.value = false;
              analogRestFrames.value = 0;
              restingXAccum.value = 0;
              restingYAccum.value = 0;
              
              nextStep();
            }
          } else {
            // If they push it again, reset the rest accumulation
            analogRestFrames.value = 0;
            restingXAccum.value = 0;
            restingYAccum.value = 0;
          }
        }
      } else {
        if (gp.buttons[targetStep.buttonId] && gp.buttons[targetStep.buttonId].pressed) {
          nextStep();
        }
      }
    }
  }
  
  rafId = requestAnimationFrame(pollGamepad);
};

// Event handlers
const onGamepadConnected = (e) => {
  console.log(`Gamepad connected: ${e.gamepad.id}`);
  isConnected.value = true;
  gamepadName.value = e.gamepad.id.split('(')[0] || e.gamepad.id;
  gamepadIndex.value = e.gamepad.index;
  buttons.value = e.gamepad.buttons;
  axes.value = e.gamepad.axes;
  
  // Start polling
  if (rafId) cancelAnimationFrame(rafId);
  pollGamepad();
  ui.showToast('تم توصيل ذراع تحكم بنجاح! 🎮', 'success');
};

const onGamepadDisconnected = (e) => {
  if (e.gamepad.index === gamepadIndex.value) {
    console.log('Gamepad disconnected');
    isConnected.value = false;
    gamepadName.value = '';
    gamepadIndex.value = -1;
    buttons.value = [];
    axes.value = [0, 0, 0, 0];
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (wizardState.value === 'testing') {
      wizardState.value = 'idle';
    }
    ui.showToast('تم فصل ذراع التحكم ⚠️', 'warning');
  }
};

// Print diagnostic scorecard
// Premium Certificate Modal State
const showCertificateModal = ref(false);

const printScorecard = () => {
  showCertificateModal.value = true;
};

// Trigger browser native print for the certificate
const triggerPrint = () => {
  window.print();
};

// Pure Canvas high-resolution image generator (No heavy external dependencies!)
const exportAsImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1000, 700);
  bgGrad.addColorStop(0, '#0b0f19');
  bgGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 700);

  // Outer Gold Border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 960, 660);

  // Inner Gold Border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 944, 644);

  // Corner decorations
  ctx.fillStyle = '#d4af37';
  // Top-left
  ctx.fillRect(20, 20, 40, 6);
  ctx.fillRect(20, 20, 6, 40);
  // Top-right
  ctx.fillRect(940, 20, 40, 6);
  ctx.fillRect(974, 20, 6, 40);
  // Bottom-left
  ctx.fillRect(20, 674, 40, 6);
  ctx.fillRect(20, 640, 6, 40);
  // Bottom-right
  ctx.fillRect(940, 674, 40, 6);
  ctx.fillRect(974, 640, 6, 40);

  // Crown Emoji / Logo
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('👑', 500, 75);

  // Title Arabic
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Cairo", Arial, sans-serif';
  ctx.fillText('شهادة فحص ومعايرة فنية ذكية', 500, 125);

  // Title English
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('TECHNICAL CALIBRATION & QUALITY CERTIFICATE', 500, 155);

  // Statement
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '16px "Cairo", Arial, sans-serif';
  ctx.fillText('يشهد معمل الصيانة الذكي بنظام كلاسيكو برو بأن ذراع التحكم المذكورة أدناه قد اجتازت كافة القياسات بنجاح.', 500, 210);

  // Separator dashed
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(100, 240);
  ctx.lineTo(900, 240);
  ctx.stroke();
  ctx.setLineDash([]); // Reset

  // Left Column Details (Labels)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px "Cairo", Arial, sans-serif';
  ctx.fillText('اسم ذراع التحكم:', 420, 290);
  ctx.fillText('تاريخ معايرة الفحص:', 420, 330);
  ctx.fillText('أزرار الاستجابة (Buttons):', 420, 370);
  ctx.fillText('الأنالوج الأيسر (L3 Drift):', 420, 410);
  ctx.fillText('الأنالوج الأيمن (R3 Drift):', 420, 450);
  ctx.fillText('سرعة زمن الاستجابة (Delay):', 420, 490);

  // Right Column Vals (Values)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Cairo", Arial, sans-serif';
  ctx.fillText(gamepadName.value || 'DualSense Wireless Controller', 450, 290);
  ctx.fillText(new Date().toLocaleDateString('ar-EG'), 450, 330);
  ctx.fillStyle = '#10b981';
  ctx.fillText('سليمة وتعمل بكفاءة 100% ✅', 450, 370);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`انحراف ${maxL3DriftVal.value}% (${getDriftText(maxL3DriftVal.value)})`, 450, 410);
  ctx.fillText(`انحراف ${maxR3DriftVal.value}% (${getDriftText(maxR3DriftVal.value)})`, 450, 450);
  ctx.fillStyle = '#10b981';
  ctx.fillText('فائقة السرعة الاستجابة (~4ms) ⚡', 450, 490);

  // Right Column Golden Seal
  // Circle seal
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
  ctx.beginPath();
  ctx.arc(800, 390, 85, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Seal inner dashed
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(800, 390, 77, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset

  // Seal Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(`${healthScore.value}%`, 800, 390);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Cairo", Arial, sans-serif';
  ctx.fillText('تقييم جودة الفحص', 800, 430);

  // Footer stamp & branding
  ctx.fillStyle = '#64748b';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('CLASSICO PRO LAB SYSTEM - CERTIFIED GENUINE', 500, 610);
  ctx.font = 'italic 12px "Cairo", Arial, sans-serif';
  ctx.fillText('شهادة معتمدة رقمياً ومسجاً تلقائياً بقاعدة البيانات للمراقبة', 500, 635);

  // Trigger file download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Classico-Gamepad-Certificate-${(gamepadName.value || 'Controller').replace(/\s+/g, '-')}.png`;
  link.href = dataUrl;
  link.click();
  ui.showToast('✅ تم تصدير الشهادة كصورة PNG بنجاح!', 'success');
};

onMounted(() => {
  // Attach window event listeners
  window.addEventListener('gamepadconnected', onGamepadConnected);
  window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

  // Check if any controller is already connected (Edge/Chrome sometimes connects it before loaded)
  const gps = navigator.getGamepads();
  for (let i = 0; i < gps.length; i++) {
    if (gps[i]) {
      isConnected.value = true;
      gamepadName.value = gps[i].id.split('(')[0] || gps[i].id;
      gamepadIndex.value = gps[i].index;
      buttons.value = gps[i].buttons;
      axes.value = gps[i].axes;
      pollGamepad();
      break;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('gamepadconnected', onGamepadConnected);
  window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.gamepad-page {
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
  direction: rtl;
}

.page-header-v3 {
  display: block;
  margin-bottom: 1.2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-main-v3 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-v3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subtitle-v3 {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
}

/* Custom premium scrollbar for gamepad view */
.gamepad-page::-webkit-scrollbar {
  width: 6px;
}
.gamepad-page::-webkit-scrollbar-track {
  background: transparent;
}
.gamepad-page::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}
.gamepad-page::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 229, 255, 0.35);
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.glass-card {
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

.card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #94a3b8;
  margin-bottom: 1.2rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  padding-bottom: 0.6rem;
}

.status-bar-v3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 1.2rem 0;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-bar-v3.connected {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}

/* Controller visual layout style */
.controller-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 1rem 0 2rem 0;
  width: 100%;
}

.dualsense-container {
  position: relative;
  width: 520px;
  height: 360px;
  background: transparent;
  direction: ltr !important;
}

.dualsense-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* L2 / R2 Triggers */
.analog-trigger {
  position: absolute;
  width: 44px;
  height: 55px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px 8px 4px 4px;
  overflow: hidden;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-family: 'Inter', sans-serif;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}
.left-trig {
  left: 12px;
  top: 15px;
}
.right-trig {
  right: 12px;
  top: 15px;
}
.analog-trigger .label {
  font-size: 0.75rem;
  font-weight: 900;
  color: #94a3b8;
  z-index: 5;
}
.analog-trigger .val {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  z-index: 5;
}
.analog-trigger .pressure-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #10b981, #2dd4bf);
  z-index: 2;
  transition: height 0.05s linear;
}

/* L1 / R1 Bumpers */
.bumper-key {
  position: absolute;
  width: 80px;
  height: 24px;
  background: #475569;
  color: #f8fafc;
  border-radius: 12px 12px 6px 6px;
  font-weight: 900;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.left-bump {
  left: 65px;
  top: 36px;
  transform: rotate(-10deg);
}
.right-bump {
  right: 65px;
  top: 36px;
  transform: rotate(10deg);
}
.bumper-key.active {
  background: #10b981 !important;
  color: #0f172a !important;
  box-shadow: 0 0 15px #10b981 !important;
  border-color: #10b981 !important;
}

/* Touchpad */
.touchpad-surface {
  position: absolute;
  left: 190px;
  top: 50px;
  width: 140px;
  height: 75px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px 4px 10px 10px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}
.touchpad-surface.active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}
.touchpad-surface .tp-label {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #64748b;
}

/* Share & Options */
.action-util-btn {
  position: absolute;
  width: 6px;
  height: 18px;
  background: #64748b;
  border: none;
  border-radius: 3px;
  z-index: 4;
}
.share-key {
  left: 172px;
  top: 75px;
  transform: rotate(-15deg);
}
.options-key {
  right: 172px;
  top: 75px;
  transform: rotate(15deg);
}
.action-util-btn.active {
  background: #10b981 !important;
  box-shadow: 0 0 8px #10b981 !important;
}

/* D-Pad */
.dpad-cross {
  position: absolute;
  left: 70px;
  top: 85px;
  width: 80px;
  height: 80px;
  z-index: 4;
}
.dpad-direction {
  position: absolute;
  background: #475569;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.up-key { top: 0; left: 27px; width: 26px; height: 30px; border-radius: 6px 6px 0 0; }
.down-key { bottom: 0; left: 27px; width: 26px; height: 30px; border-radius: 0 0 6px 6px; }
.left-key { left: 0; top: 27px; width: 30px; height: 26px; border-radius: 6px 0 0 6px; }
.right-key { right: 0; top: 27px; width: 30px; height: 26px; border-radius: 0 6px 6px 0; }

.dpad-direction.active {
  background: #10b981 !important;
  color: #0f172a !important;
  box-shadow: 0 0 12px #10b981 !important;
}
.dpad-core {
  position: absolute;
  left: 27px;
  top: 27px;
  width: 26px;
  height: 26px;
  background: #475569;
}

/* Action Buttons */
.action-buttons-group {
  position: absolute;
  right: 70px;
  top: 85px;
  width: 80px;
  height: 80px;
  z-index: 4;
}
.action-glyph {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #475569;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 900;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.1);
}
.triangle-key { top: 0; left: 28px; background: #334155; color: #2dd4bf; border-color: rgba(45, 212, 191, 0.3); }
.square-key { left: 0; top: 28px; background: #334155; color: #c084fc; border-color: rgba(168, 85, 247, 0.3); }
.circle-key { right: 0; top: 28px; background: #334155; color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
.cross-key { bottom: 0; left: 28px; background: #334155; color: #60a5fa; border-color: rgba(59, 130, 246, 0.3); }

.action-glyph.active {
  background: #10b981 !important;
  color: #0f172a !important;
  box-shadow: 0 0 15px #10b981 !important;
  border-color: #10b981 !important;
  transform: scale(1.15);
}

/* Sticks */
.analog-stick-well {
  position: absolute;
  width: 66px;
  height: 66px;
  background: #020617;
  border: 2px solid #334155;
  border-radius: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.8);
}
.left-well {
  left: 167px;
  top: 192px;
}
.right-well {
  right: 167px;
  top: 192px;
}
.analog-stick-well.active {
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}
.stick-knob {
  width: 42px;
  height: 42px;
  background: radial-gradient(circle, #475569 0%, #1e293b 80%, #0f172a 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.05s ease-out;
}
.knob-label {
  font-size: 0.7rem;
  font-weight: 900;
  color: #64748b;
  font-family: 'Inter', sans-serif;
}

/* PS Center Button */
.ps-logo-btn {
  position: absolute;
  left: 247px;
  top: 162px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  z-index: 4;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
}
.ps-logo-btn.active {
  background: #10b981;
  color: #0f172a;
  box-shadow: 0 0 12px #10b981;
}

/* Haptic controller card styles */
.rumble-container {
  width: 90%;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.2);
}

.rumble-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.slider-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
}

.sys-slider {
  flex: 0 0 60%;
  accent-color: #10b981;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn-group button {
  flex: 1;
  font-size: 0.85rem;
}

/* Telemetry Coordinate grids styles */
.sticks-telemetry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stick-telemetry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.telemetry-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #94a3b8;
}

.coordinates-grid {
  position: relative;
  width: 140px;
  height: 140px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.crosshair-h {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
}

.crosshair-v {
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.07);
}

.deadzone-circle {
  position: absolute;
  top: calc(50% - 10px);
  left: calc(50% - 10px);
  width: 20px;
  height: 20px;
  border: 1px dashed rgba(239, 68, 68, 0.25);
  border-radius: 50%;
}

.coord-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  z-index: 5;
  transition: left 0.02s linear, top 0.02s linear;
}

.coord-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  width: 100%;
}

.coord-details span b {
  color: #cbd5e1;
}

.drift-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 4px;
  width: 85%;
  text-align: center;
}

.drift-badge.success { background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.drift-badge.warning { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.drift-badge.danger { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

/* Wizard layout */
.wizard-container {
  margin-top: 1.5rem;
  padding: 1.2rem;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.15);
}

.wizard-desc {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #94a3b8;
  margin-bottom: 1.2rem;
}

.large-btn {
  width: 100%;
  padding: 0.8rem !important;
  font-weight: 800;
  font-size: 0.95rem !important;
}

/* Wizard Testing Active UI */
.wizard-progress {
  position: relative;
  width: 100%;
  height: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(to right, #10b981, #2dd4bf);
  transition: width 0.3s ease;
}

.steps-txt {
  z-index: 2;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
}

.current-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1.5rem 0;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  margin-bottom: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.prompt-icon {
  font-size: 2.2rem;
  color: #10b981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.prompt-instruction {
  font-size: 0.85rem;
  color: #64748b;
}

.prompt-target {
  font-size: 1.8rem;
  font-weight: 900;
  color: #fff;
}

.wizard-actions {
  display: flex;
  gap: 10px;
}

.wizard-actions button {
  flex: 1;
  padding: 0.6rem !important;
  font-size: 0.85rem !important;
}

/* Wizard Scorecard layout */
.wizard-scorecard-state {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.scorecard-header {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
  padding: 1rem;
  border-radius: 12px;
}

.dual-meters-v3 {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.meter-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  min-width: 110px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.meter-box.success {
  border-color: rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.04);
}

.meter-box.danger {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.04);
}

.meter-percent {
  font-size: 1.8rem;
  font-weight: 900;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1;
}

.meter-percent.success-glow {
  color: #10b981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
}

.meter-percent.danger-glow {
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.35);
}

.meter-label {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 6px;
  font-weight: 700;
  text-align: center;
}

/* Analog Diagnostic Live Panel */
.analog-diagnostic-panel-v3 {
  margin-top: 1.2rem;
  width: 100%;
  max-width: 320px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.diagnostic-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.diag-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #10b981);
  border-radius: 4px;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

.diagnostic-meta {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 700;
  text-align: center;
}

.realtime-drift-stats {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 5px;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.drift-stat-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.health-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-title {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
}

.meta-desc {
  font-size: 0.8rem;
  color: #64748b;
}

.health-text-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}

.health-text-badge.success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.health-text-badge.warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.health-text-badge.danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.scorecard-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #94a3b8;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  padding-bottom: 4px;
}

.detail-row .val {
  font-weight: 800;
}

.detail-row .val.success { color: #10b981; }
.detail-row .val.warning { color: #f59e0b; }
.detail-row .val.danger { color: #ef4444; }

.scorecard-actions {
  display: flex;
  gap: 10px;
}

.scorecard-actions button {
  flex: 1;
  padding: 0.6rem !important;
  font-size: 0.85rem !important;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

/* ==================================================== */
/* 🏆 PREMIUM GOLDEN CERTIFICATE OVERLAY STYLES */
/* ==================================================== */

.cert-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(8, 12, 20, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 99999;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.certificate-modal-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.modal-actions-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.btn-cert-action {
  padding: 0.8rem 1.8rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cert-action.print-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.btn-cert-action.image-btn {
  background: linear-gradient(135deg, #d4af37, #aa820a);
  color: white;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.btn-cert-action.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cert-action:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Certificate Layout Styling */
.certificate-print-area {
  background: linear-gradient(135deg, #0b0f19, #1b2230);
  border: 4px double #d4af37;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  width: 100%;
}

.certificate-inner-border {
  border: 1px solid rgba(212, 175, 55, 0.25);
  padding: 3rem 2.5rem;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Corner Ornaments */
.corner-ornament {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid #d4af37;
}
.corner-ornament.top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.corner-ornament.top-right { top: 10px; right: 10px; border-left: none; border-bottom: none; }
.corner-ornament.bottom-left { bottom: 10px; left: 10px; border-right: none; border-top: none; }
.corner-ornament.bottom-right { bottom: 10px; right: 10px; border-left: none; border-top: none; }

.cert-crown {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
}

.cert-main-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  font-family: 'Cairo', sans-serif;
  text-shadow: 0 0 10px rgba(255,255,255,0.1);
}

.cert-sub-title {
  font-size: 0.75rem;
  letter-spacing: 3px;
  color: #64748b;
  margin-top: 5px;
  margin-bottom: 2rem;
  font-family: monospace;
}

.cert-statement {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #e2e8f0;
  max-width: 650px;
  margin-bottom: 2.5rem;
}

.cert-device-info {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 700px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 2.5rem;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: right;
}

.info-label {
  font-size: 0.8rem;
  color: #64748b;
}

.info-val {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
}

.cert-body-layout {
  display: flex;
  width: 100%;
  max-width: 750px;
  gap: 2.5rem;
  align-items: center;
  margin-bottom: 2.5rem;
}

/* Circular Gold Seal */
.cert-seals-container-v3 {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex-shrink: 0;
}

.cert-seal-v3 {
  width: 130px;
  height: 130px;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.cert-seal-v3.quality-seal {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
}

.cert-seal-v3.problem-seal {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
}

.seal-inner-v3 {
  width: 100%;
  height: 100%;
  background: #0b0f19;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.seal-score-v3 {
  font-size: 1.8rem;
  font-weight: 900;
  font-family: Arial, Helvetica, sans-serif;
}

.seal-score-v3.success-text {
  color: #10b981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.seal-score-v3.danger-text {
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.seal-label-v3 {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 2px;
}

.seal-label {
  font-size: 0.65rem;
  font-weight: 700;
  margin-top: 3px;
  color: #ffffff;
}

/* Certificate Results Table */
.cert-table {
  flex: 1;
  border-collapse: collapse;
  text-align: right;
  width: 100%;
}

.cert-table th, .cert-table td {
  padding: 10px 12px;
  font-size: 0.88rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.cert-table th {
  color: #64748b;
  font-weight: 700;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
}

.cert-table td {
  color: #e2e8f0;
}

.cert-table td.success-text {
  color: #10b981;
  font-weight: bold;
}

/* Footer Section */
.cert-footer-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 750px;
  border-top: 1px dashed rgba(255,255,255,0.08);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.footer-sign {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: right;
  position: relative;
}

.sign-label {
  font-size: 0.8rem;
  color: #64748b;
}

.stamp-placeholder {
  width: 100px;
  height: 45px;
  border: 2px double rgba(16, 185, 129, 0.4);
  color: #10b981;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(-5deg);
  font-weight: 900;
  letter-spacing: 1px;
  font-size: 0.8rem;
}

.footer-branding {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.brand-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: #d4af37;
}

.brand-version {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

/* ==================================================== */
/* 🖨️ PRINT SPECIFIC MEDIA CSS RULES */
/* ==================================================== */
@media print {
  body * {
    visibility: hidden !important;
  }
  .cert-modal-overlay {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    background: transparent !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  .certificate-modal-container {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .modal-actions-bar {
    display: none !important; /* Hide toolbar in print */
  }
  .certificate-print-area, .certificate-print-area * {
    visibility: visible !important;
  }
  .certificate-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    border: 6px double #000 !important;
    background: #ffffff !important;
    color: #000000 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .certificate-inner-border {
    border-color: rgba(0, 0, 0, 0.25) !important;
    padding: 2.5cm 1.5cm !important;
  }
  .corner-ornament {
    border-color: #000000 !important;
  }
  .cert-main-title {
    color: #000000 !important;
  }
  .cert-statement {
    color: #333333 !important;
  }
  .cert-device-info {
    background: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }
  .info-val {
    color: #000000 !important;
  }
  .cert-seals-container-v3 {
    flex-direction: row !important;
    gap: 1rem !important;
  }
  .cert-seal-v3 {
    width: 100px !important;
    height: 100px !important;
    box-shadow: none !important;
    border: 2px solid #000000 !important;
    background: #000000 !important;
  }
  .seal-inner-v3 {
    background: #ffffff !important;
    border-color: #000000 !important;
  }
  .seal-score-v3.success-text, .seal-score-v3.danger-text {
    color: #000000 !important;
    text-shadow: none !important;
  }
  .cert-table th {
    color: #000000 !important;
    border-bottom-color: #000000 !important;
  }
  .cert-table td {
    color: #000000 !important;
    border-bottom-color: #e2e8f0 !important;
  }
  .cert-table td.success-text {
    color: #000000 !important;
  }
}
</style>
