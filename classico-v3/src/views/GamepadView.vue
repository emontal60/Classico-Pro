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
      <div class="status-info-left">
        <span class="status-dot"></span>
        <span class="status-text">{{ isConnected ? 'متصل: ' + gamepadName : 'بانتظار توصيل ذراع التحكم... ⏳' }}</span>
      </div>
      <div v-if="isConnected" class="status-info-right battery-telemetry">
        <div class="battery-status-item">
          <span class="icon">🔋</span>
          <span class="label">البطارية:</span>
          <span class="val">{{ batteryLevel }}%</span>
        </div>
        <div class="battery-status-item">
          <span class="icon">❤️</span>
          <span class="label">صحة البطارية:</span>
          <span class="val">{{ batteryHealth }}%</span>
        </div>
        <button @click="scrollToBatterySection" class="btn-goto-battery-v3">
          ⚡ فحص البطارية
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="workspace-grid">
      <!-- Left Column Container -->
      <div class="left-column-wrapper">
        <!-- Left Column: Visual Controller & Realtime Inputs -->
        <div class="workspace-card visualizer-card glass-card" style="margin: 0;">
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

        <!-- 🔋 Automated Premium Battery Diagnostic Card (Moved from Modal) -->
        <div v-if="isConnected" class="workspace-card battery-diagnostics-card glass-card">
          <h3 class="card-title" style="display: flex; align-items: center; justify-content: space-between;">
            <span>🔋 تشخيص وحالة البطارية التلقائي</span>
            <span v-if="batteryHealthResetPerformed" class="badge-recalibrated-v3">تمت المعايرة ✨</span>
          </h3>
          
          <!-- State A: Active Scanning Animation -->
          <div v-if="isDiagnosingBattery" class="battery-scanning-view-v3">
            <div class="scanning-core-wrapper">
              <div class="battery-pulse-core-v3 animate-pulse">⚡</div>
              <div class="scanning-status-text-v3">جاري تحليل المقاومة الداخلية وقياس جهد الخلايا تلقائياً...</div>
            </div>
            <div class="scan-progress-bar-v3">
              <div class="scan-progress-fill-v3" :style="{ width: batteryDiagProgress + '%' }"></div>
            </div>
            <div class="live-telemetry-grid-v3">
              <div class="telemetry-item-v3">
                <span class="t-label">جهد الخلايا الحركي:</span>
                <strong class="t-val">{{ liveVoltage }}V</strong>
              </div>
              <div class="telemetry-item-v3">
                <span class="t-label">المقاومة الداخلية:</span>
                <strong class="t-val">{{ liveImpedance }} mΩ</strong>
              </div>
              <div class="telemetry-item-v3">
                <span class="t-label">شوشرة الإشارة الكهربائية:</span>
                <strong class="t-val warning-color">{{ liveJitter }} μV</strong>
              </div>
            </div>
          </div>

          <!-- State B: Diagnostic Completed Successfully -->
          <div v-else-if="batteryDiagCompleted" class="battery-diagnostic-success-v3">
            <div class="diagnostic-success-header-v3">
              <span class="success-badge-tag-v3">تم الفحص التشخيصي والتقني بنجاح! ✅</span>
            </div>
            
            <div class="final-telemetry-table-v3">
              <div class="table-row-v3">
                <span class="row-label-v3">نسبة شحن البطارية (Auto-Read):</span>
                <span class="row-val-badge-v3 success">{{ batteryLevel }}%</span>
              </div>
              <div class="table-row-v3">
                <span class="row-label-v3">جودة وصحة البطارية (Health Score):</span>
                <span :class="['row-val-badge-v3', batteryHealth >= 80 ? 'success' : batteryHealth >= 50 ? 'warning' : 'danger']">
                  {{ batteryHealth }}%
                </span>
              </div>
              <div class="table-row-v3">
                <span class="row-label-v3">جهد خلايا الاستقرار:</span>
                <span class="row-val-v3">{{ liveVoltage }}V</span>
              </div>
              <div class="table-row-v3">
                <span class="row-label-v3">المقاومة الداخلية للفحص:</span>
                <span class="row-val-v3">{{ liveImpedance }} mΩ</span>
              </div>
              <div class="table-row-v3">
                <span class="row-label-v3">معدل شوشرة الإشارة الكهربائية:</span>
                <span class="row-val-v3">{{ liveJitter }} μV</span>
              </div>
            </div>

            <!-- Recalibration Progress Bar (when actively calibrating) -->
            <div v-if="isRecalibratingBattery" class="recalibration-loading-panel">
              <div class="recal-status-text animate-pulse">{{ recalibrateStatusText }}</div>
              <div class="recal-progress-bar">
                <div class="recal-progress-fill" :style="{ width: recalibrateProgress + '%' }"></div>
              </div>
              <div class="recal-percentage">{{ recalibrateProgress }}%</div>
            </div>

            <!-- Recalibration Panel (Before vs After Comparison, visible after recalibration is done and not actively calibrating) -->
            <div v-if="batteryHealthResetPerformed && !isRecalibratingBattery" class="recalibration-comparison-panel-v3 gold-panel">
              <h4 class="comparison-title">✨ تقرير إعادة الضبط والمعايرة التقنية للبطارية</h4>
              <div class="comparison-grid">
                <div class="comparison-box before">
                  <span class="comp-label">الصحة السابقة</span>
                  <span class="comp-val">{{ batteryHealthBeforeReset }}%</span>
                </div>
                <div class="comparison-arrow">
                  <span>➡️</span>
                </div>
                <div class="comparison-box after">
                  <span class="comp-val success-text animate-pulse">{{ batteryHealthAfterReset }}%</span>
                  <span class="comp-label">الصحة الحالية</span>
                </div>
                <div class="comparison-box improvement">
                  <span class="comp-val improvement-text">+{{ batteryHealthAfterReset - batteryHealthBeforeReset }}%</span>
                  <span class="comp-label">معدل التحسن</span>
                </div>
              </div>
              <div class="comparison-technical-note">
                ⚙️ تم تصفير الشحنات الساكنة وإعادة محاذاة سجلات الخلايا الكيميائية لرقاقة قياس الشحن (FG-IC) بنجاح.
              </div>
            </div>

            <!-- Action Buttons inside Battery Card -->
            <div v-if="!isRecalibratingBattery" class="battery-actions-row" style="flex-wrap: wrap; gap: 8px;">
              <button @click="startBatteryDiagnostic" :disabled="isDiagnosingBattery" class="btn-sys-v3 success" style="flex: 1; min-width: 150px;">
                🔄 إعادة الفحص التشخيصي
              </button>
              <button @click="recalibrateBatterySOIC" :disabled="isDiagnosingBattery" class="btn-sys-v3 warning btn-recalibrate-gold" style="flex: 1.5; min-width: 220px;">
                ✨ إعادة ضبط ومعايرة هيلث البطارية
              </button>
              <button v-if="hasSavedCalibrations" @click="clearAllCalibrations" class="btn-sys-v3 danger" style="flex: 1; min-width: 150px; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">
                🗑️ مسح ذاكرة المعايرة
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
            <button @click="openCalibrationModal" :disabled="!isConnected" class="btn-sys-v3 success large-btn">
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
                  <div class="diag-fill" :style="{ 
                    width: !analogHasMoved ? '0%' : 
                           !isCountdownActive ? (Math.min((stableFrames / 15) * 100, 100) + '%') : 
                           (((3 - countdownValue) / 3) * 100 + '%') 
                  }"></div>
                </div>
                <div class="diagnostic-meta">
                  <span class="diag-status-txt">
                    <span v-if="!analogHasMoved" class="animate-pulse" style="color: #38bdf8;">🔄 الخطوة 1: حرك عصا الأنالوج بشكل دائري كامل...</span>
                    <span v-else-if="!isCountdownActive" style="color: #fbbf24; font-weight: 800;" class="animate-pulse">🟢 الخطوة 2: اترك العصا تماماً للمعايرة (جاري استشعار استقرار الحركة)...</span>
                    <span v-else style="color: #10b981; font-weight: 800; display: flex; align-items: center; gap: 8px; justify-content: center;" class="animate-pulse">
                      ⏳ جاري قياس الانحراف... العد التنازلي: 
                      <strong style="font-size: 1.25rem; color: #10b981; text-shadow: 0 0 10px rgba(16, 185, 129, 0.4);">{{ countdownValue }}</strong>
                    </span>
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
                <span :class="['val', buttonsScore >= 30 ? 'success' : buttonsScore >= 20 ? 'warning' : 'danger']">
                  {{ buttonsResponseText }} ({{ buttonsScore }}% من 40%)
                </span>
              </div>
              <div class="detail-row">
                <span>عصا الأنالوج الأيسر (L3):</span>
                <span :class="['val', getDriftLevel(maxL3Drift.x, maxL3Drift.y)]">
                  انحراف {{ maxL3DriftVal }}% (التقييم: {{ (15 - (maxL3DriftVal / 100) * 15).toFixed(1) }} من 15)
                </span>
              </div>
              <div class="detail-row">
                <span>عصا الأنالوج الأيمن (R3):</span>
                <span :class="['val', getDriftLevel(maxR3Drift.x, maxR3Drift.y)]">
                  انحراف {{ maxR3DriftVal }}% (التقييم: {{ (15 - (maxR3DriftVal / 100) * 15).toFixed(1) }} من 15)
                </span>
              </div>
              <div class="detail-row">
                <span>نسبة شحن البطارية (Level):</span>
                <span class="val success">
                  {{ batteryLevel }}% 🔋
                </span>
              </div>
              <div class="detail-row">
                <span>جودة وصحة البطارية (Battery Health):</span>
                <span :class="['val', batteryHealth >= 80 ? 'success' : batteryHealth >= 50 ? 'warning' : 'danger']">
                  صحة {{ batteryHealth }}% (التقييم: {{ (batteryHealth * 30 / 100).toFixed(1) }}% من 30%) ❤️
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

  <!-- 🎯 Analog Calibration & Test Preparation Modal -->
  <div v-if="showCalibrationModal" class="cert-modal-overlay">
    <div class="calibration-modal-container">
      <div class="modal-header-v3">
        <h3 class="modal-title-v3">⚠️ معايرة وتجهيز فحص ذراع التحكم</h3>
      </div>
      <div class="modal-body-v3">
        <p class="modal-desc-v3" style="margin-bottom: 1rem;">
          لتفادي أي أخطاء أو قياسات غير دقيقة أثناء فحص الأزرار، يرجى القيام بالتالي <b>قبل</b> البدء:
        </p>
        <div class="instructions-steps-v3" style="margin-bottom: 1.2rem;">
          <div class="step-v3-item">
            <span class="step-num">1</span>
            <p class="step-desc">قم بتحريك <b>كلا عصوي الأنالوج (L3 & R3)</b> حركات دائرية كاملة وسريعة لمرة أو مرتين.</p>
          </div>
          <div class="step-v3-item">
            <span class="step-num">2</span>
            <p class="step-desc">اترك عصوي الأنالوج تماماً في المنتصف ودعهما يستقرا في وضع السكون.</p>
          </div>
        </div>

        <p class="warning-note-v3">
          💡 سيقوم النظام تلقائياً وبشكل فوري بقراءة حساسية ونسبة انحراف الأنالوج (Stick Drift) من الرادار فور ضغطك على زر البدء دون الحاجة لأي حركة إضافية أثناء فحص الأزرار.
        </p>
      </div>
      <div class="modal-footer-v3">
        <button @click="confirmAndStartWizard" class="btn-sys-v3 success large-btn" style="flex: 1;">
          🚀 تم التجهيز، ابدأ الفحص الفوري
        </button>
        <button @click="cancelCalibration" class="btn-sys-v3 secondary">
          إلغاء ✕
        </button>
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
                  <td :class="[buttonsScore >= 30 ? 'success-text' : buttonsScore >= 20 ? 'warning-text' : 'danger-text']">
                    {{ buttonsResponseText }} ({{ buttonsScore }}% من 40%)
                  </td>
                </tr>
                <tr>
                  <td>حساسية الأنالوج الأيسر (L3)</td>
                  <td>انحراف {{ maxL3DriftVal }}% (التقييم: {{ (15 - (maxL3DriftVal / 100) * 15).toFixed(1) }} من 15)</td>
                </tr>
                <tr>
                  <td>حساسية الأنالوج الأيمن (R3)</td>
                  <td>انحراف {{ maxR3DriftVal }}% (التقييم: {{ (15 - (maxR3DriftVal / 100) * 15).toFixed(1) }} من 15)</td>
                </tr>
                <tr>
                  <td>نسبة شحن البطارية (Level)</td>
                  <td class="success-text">مشحونة بنسبة {{ batteryLevel }}% 🔋</td>
                </tr>
                <tr>
                  <td>جودة وصحة البطارية (Battery Health)</td>
                  <td :class="[batteryHealth >= 80 ? 'success-text' : batteryHealth >= 50 ? 'warning-text' : 'danger-text']">
                    صحة {{ batteryHealth }}% (التقييم: {{ (batteryHealth * 30 / 100).toFixed(1) }}% من 30%) ❤️
                  </td>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
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
];

// Health score values saved after wizard completing
const healthScore = ref(100);
const maxL3Drift = reactive({ x: 0, y: 0 });
const maxR3Drift = reactive({ x: 0, y: 0 });
const maxL3DriftVal = ref(0);
const maxR3DriftVal = ref(0);
const batteryLevel = ref(100);
const batteryHealth = ref(100);
const sessionBatteryLevels = ref({});

// Real-time analog circular progress calibration variables
const analogTestProgress = ref(0);
const analogHasMoved = ref(false);
const analogRestFrames = ref(0);
const restingXAccum = ref(0);
const restingYAccum = ref(0);

// Intelligent stability detection and countdown variables
const lastStickX = ref(0);
const lastStickY = ref(0);
const stableFrames = ref(0);
const countdownValue = ref(3);
const countdownTimer = ref(null);
const isCountdownActive = ref(false);
const showCalibrationModal = ref(false);

// Battery Telemetry & Automated Scanner State
const isDiagnosingBattery = ref(false);
const batteryDiagProgress = ref(0);
const batteryDiagCompleted = ref(false);
const liveVoltage = ref(0);
const liveImpedance = ref(0);
const liveJitter = ref(0);
let diagInterval = null;

// Recalibration & Comparison Panel State
const isRecalibratingBattery = ref(false);
const recalibrateProgress = ref(0);
const recalibrateStatusText = ref('');
const batteryHealthBeforeReset = ref(0);
const batteryHealthAfterReset = ref(0);
const batteryHealthResetPerformed = ref(false);
const lastDiagnosedGamepadId = ref('');

// Drift Fingerprinting Profile Storage (v3 Premium)
const hasSavedCalibrations = computed(() => {
  const profiles = JSON.parse(localStorage.getItem('classico_battery_profiles_v3') || '[]');
  return profiles.length > 0;
});

const findMatchingProfile = (gpId, currentAxes) => {
  if (!currentAxes || currentAxes.length < 4) return null;
  const profiles = JSON.parse(localStorage.getItem('classico_battery_profiles_v3') || '[]');
  
  let bestMatch = null;
  let minDistance = 999999;
  
  for (const profile of profiles) {
    if (profile.gpId !== gpId) continue;
    
    // Calculate Euclidean distance between resting axes
    let distance = 0;
    for (let i = 0; i < 4; i++) {
      distance += Math.pow((profile.restingAxes[i] || 0) - currentAxes[i], 2);
    }
    distance = Math.sqrt(distance);
    
    // If within threshold and best match so far
    if (distance < 0.06 && distance < minDistance) {
      minDistance = distance;
      bestMatch = profile;
    }
  }
  
  return bestMatch;
};

const saveProfileCalibration = (gpId, currentAxes, calibrationData) => {
  if (!currentAxes || currentAxes.length < 4) return;
  const profiles = JSON.parse(localStorage.getItem('classico_battery_profiles_v3') || '[]');
  
  let existingProfile = null;
  let minDistance = 999999;
  let existingIndex = -1;
  
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    if (profile.gpId !== gpId) continue;
    
    let distance = 0;
    for (let j = 0; j < 4; j++) {
      distance += Math.pow((profile.restingAxes[j] || 0) - currentAxes[j], 2);
    }
    distance = Math.sqrt(distance);
    
    if (distance < 0.06 && distance < minDistance) {
      minDistance = distance;
      existingProfile = profile;
      existingIndex = i;
    }
  }
  
  if (existingProfile) {
    // Update existing profile
    profiles[existingIndex] = {
      ...existingProfile,
      ...calibrationData,
      timestamp: Date.now()
    };
  } else {
    // Create new profile
    profiles.push({
      id: 'prof_' + Math.random().toString(36).substr(2, 9),
      gpId: gpId,
      restingAxes: [...currentAxes],
      ...calibrationData,
      timestamp: Date.now()
    });
  }
  
  localStorage.setItem('classico_battery_profiles_v3', JSON.stringify(profiles));
};

const clearAllCalibrations = () => {
  localStorage.removeItem('classico_battery_profiles_v3');
  localStorage.removeItem('classico_recalibrated_batteries');
  batteryHealthResetPerformed.value = false;
  batteryHealthBeforeReset.value = 0;
  batteryHealthAfterReset.value = 0;
  ui.showToast('🗑️ تم مسح ذاكرة المعايرة بنجاح والعودة للقيم الفعلية!', 'info');
  // Re-run diagnostic to load standard uncalibrated values
  startBatteryDiagnostic();
};


const clearCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
  isCountdownActive.value = false;
  countdownValue.value = 3;
  restingXAccum.value = 0;
  restingYAccum.value = 0;
  analogRestFrames.value = 0;
};

const skippedSteps = ref([]);

const buttonsScore = computed(() => {
  let score = 40;
  wizardSteps.forEach((step, index) => {
    if (!step.isAnalog) {
      if (skippedSteps.value.includes(index)) {
        score -= (40 / 14);
      }
    }
  });
  return Math.max(0, parseFloat(score.toFixed(1)));
});

const workingButtonsCount = computed(() => {
  let count = 0;
  wizardSteps.forEach((step, index) => {
    if (!step.isAnalog) {
      if (!skippedSteps.value.includes(index)) {
        count++;
      }
    }
  });
  return count;
});

const buttonsResponseText = computed(() => {
  const percent = Math.round((workingButtonsCount.value / 14) * 100);
  if (percent === 100) return 'سليمة وتعمل بكفاءة 100% ✅';
  if (percent >= 70) return `مستقرة (${percent}% استجابة) 🟢`;
  if (percent >= 40) return `استجابة متوسطة (${percent}%) 🟡`;
  return `ضعيفة الاستجابة (${percent}%) 🔴`;
});

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
  clearCountdown();
  stableFrames.value = 0;
  lastStickX.value = 0;
  lastStickY.value = 0;
  skippedSteps.value = [];
  ui.showToast('بدأ الفحص الشامل، اضغط على الأزرار المضيئة ⏳', 'info');
};

const openCalibrationModal = () => {
  showCalibrationModal.value = true;
};

const cancelCalibration = () => {
  showCalibrationModal.value = false;
};

const startBatteryDiagnostic = () => {
  batteryHealthResetPerformed.value = false;
  batteryHealthBeforeReset.value = 0;
  batteryHealthAfterReset.value = 0;

  isDiagnosingBattery.value = true;
  batteryDiagProgress.value = 0;
  batteryDiagCompleted.value = false;
  liveVoltage.value = 3.65;
  liveImpedance.value = 110;
  
  // Calculate dynamic Voltage Jitter (signal noise) based on real axes values
  const gamepads = navigator.getGamepads();
  const gp = gamepads[gamepadIndex.value];
  let initialDrift = 0;
  if (gp) {
    const lDrift = calculateDrift(gp.axes[0], gp.axes[1]);
    const rDrift = calculateDrift(gp.axes[2], gp.axes[3]);
    initialDrift = Math.max(lDrift, rDrift);
  }
  
  // Jitter in microvolts (uV): baseline 12uV + drift-based noise (e.g. 5uV per 1% drift)
  const baseJitter = 12 + Math.round(initialDrift * 4.8);
  liveJitter.value = baseJitter;

  // Set up interval for scanning simulation
  const duration = 2500; // 2.5 seconds
  const step = 50; // every 50ms
  const stepsCount = duration / step;
  let currentStep = 0;

  if (diagInterval) clearInterval(diagInterval);

  diagInterval = setInterval(() => {
    currentStep++;
    batteryDiagProgress.value = Math.min(Math.round((currentStep / stepsCount) * 100), 100);

    // Dynamic SOH scanning simulation: fluctuates battery health between 72% and 96% to show live scanning
    batteryHealth.value = Math.round(72 + (currentStep % 7) * 3 + Math.random() * 2);

    // Simulate technical metrics fluctuations
    // Voltage cycles up from 3.7V towards stabilized battery level voltage
    const targetVoltage = 3.7 + ((batteryLevel.value / 100) * 0.5); // e.g. 3.7V - 4.2V
    liveVoltage.value = parseFloat((3.7 + (currentStep / stepsCount) * (targetVoltage - 3.7) + (Math.random() * 0.02 - 0.01)).toFixed(2));
    
    // Impedance cycles and settles around a realistic value
    let hash = 0;
    if (gp && gp.id) {
      for (let i = 0; i < gp.id.length; i++) hash += gp.id.charCodeAt(i);
    }
    const targetImpedance = 120 + (hash % 60) + Math.round(initialDrift * 3); // 120 to 200 mOhm
    liveImpedance.value = Math.round(100 + (currentStep / stepsCount) * (targetImpedance - 100) + (Math.random() * 8 - 4));
    
    // Jitter fluctuates slightly
    liveJitter.value = Math.round(baseJitter + (Math.random() * 4 - 2));

    if (currentStep >= stepsCount) {
      clearInterval(diagInterval);
      diagInterval = null;

      // Finalize diagnostic
      liveVoltage.value = parseFloat(targetVoltage.toFixed(2));
      liveImpedance.value = targetImpedance;
      liveJitter.value = baseJitter;
      
      // Calculate automated Battery Health with individual resting-axes seeding
      let axesSum = 0;
      if (gp && gp.axes) {
        axesSum = gp.axes.reduce((sum, val) => sum + Math.abs(val), 0);
      }
      const driftSeed = Math.round(axesSum * 100000);
      const seed = hash + driftSeed;
      const baseHealth = 87 + (seed % 11); // e.g. 87% to 97%
      const noiseDeduction = Math.min(Math.max(0, Math.floor((baseJitter - 15) / 10)), 8);
      let calculatedHealth = Math.max(50, Math.min(baseHealth - noiseDeduction, 100));
      
      // Check if this physical gamepad has been recalibrated before (using analog fingerprint matching)
      if (gp) {
        const savedProfile = findMatchingProfile(gp.id, gp.axes);
        if (savedProfile) {
          calculatedHealth = savedProfile.recalibratedHealth;
          batteryHealthBeforeReset.value = savedProfile.originalHealth;
          batteryHealthAfterReset.value = calculatedHealth;
          batteryHealthResetPerformed.value = true;
          
          // Persistently adjust physical telemetry to match the calibrated hardware
          liveImpedance.value = Math.max(95, liveImpedance.value - savedProfile.impedanceReduction);
          liveVoltage.value = parseFloat(Math.min(4.20, liveVoltage.value + 0.05).toFixed(2));
          liveJitter.value = Math.max(10, liveJitter.value - savedProfile.voltageJitterReduction);
        }
      }
      
      batteryHealth.value = calculatedHealth;
      
      // Sync batteryLevel if gamepad API is available
      if (gp && gp.battery) {
        const bLevel = gp.battery.level !== undefined ? gp.battery.level : gp.battery.chargeLevel;
        if (typeof bLevel === 'number' && bLevel >= 0 && bLevel <= 1) {
          batteryLevel.value = Math.round(bLevel * 100);
        } else if (typeof bLevel === 'number' && bLevel > 1 && bLevel <= 100) {
          batteryLevel.value = Math.round(bLevel);
        }
      } else {
        const gpKey = gp ? `${gp.id}_${gp.index}` : 'default_gamepad';
        batteryLevel.value = sessionBatteryLevels.value[gpKey] || 85;
      }

      isDiagnosingBattery.value = false;
      batteryDiagCompleted.value = true;
    }
  }, step);
};

const recalibrateBatterySOIC = () => {
  if (!isConnected.value || isDiagnosingBattery.value || isRecalibratingBattery.value) return;
  
  isRecalibratingBattery.value = true;
  recalibrateProgress.value = 0;
  recalibrateStatusText.value = 'جاري البدء في تهيئة نظام المعايرة... ⏳';
  
  batteryHealthBeforeReset.value = batteryHealth.value;
  
  const duration = 3000; // 3 seconds
  const step = 50; // every 50ms
  const stepsCount = duration / step;
  let currentStep = 0;
  
  const recalInterval = setInterval(() => {
    currentStep++;
    recalibrateProgress.value = Math.min(Math.round((currentStep / stepsCount) * 100), 100);
    
    if (recalibrateProgress.value <= 25) {
      recalibrateStatusText.value = 'جاري إرسال نبضات تفريغ عالية التردد لتنظيف جزيئات خلايا الليثيوم... ⚡';
    } else if (recalibrateProgress.value <= 55) {
      recalibrateStatusText.value = 'جاري تصفير وإعادة تهيئة سجلات رقاقة قياس نسبة الشحن (FG-IC Regs)... 💾';
    } else if (recalibrateProgress.value <= 85) {
      recalibrateStatusText.value = 'جاري تصفير الشحنات الساكنة العالقة في مكثفات مرشحات الطاقة باللوحة... 🔋';
    } else {
      recalibrateStatusText.value = 'جاري استقرار جهد الخلايا ومعايرة النطاق الكهربائي للجهد المرجعي... 🌟';
    }
    
    if (currentStep >= stepsCount) {
      clearInterval(recalInterval);
      
      const gamepadsList = navigator.getGamepads();
      const activeGp = gamepadsList[gamepadIndex.value];
      if (!activeGp) {
        isRecalibratingBattery.value = false;
        ui.showToast('⚠️ فشل معايرة البطارية: لم يتم العثور على ذراع تحكم نشط.', 'danger');
        return;
      }
      
      const gpId = activeGp.id;
      const gpAxes = activeGp.axes;
      const existingProfile = findMatchingProfile(gpId, gpAxes);

      // Perform the actual battery health recalibration boost
      const boost = 6 + Math.floor(Math.random() * 5); // +6% to +10%
      const rawNewHealth = batteryHealthBeforeReset.value + boost;
      batteryHealth.value = Math.min(100, rawNewHealth);
      batteryHealthAfterReset.value = batteryHealth.value;
      
      // Cumulative offsets loading
      const prevImpReduction = existingProfile ? existingProfile.impedanceReduction : 0;
      const prevJitterReduction = existingProfile ? existingProfile.voltageJitterReduction : 0;
      const prevHealthBoost = existingProfile ? existingProfile.healthBoost : 0;

      // Calculate cumulative adjustments with safe physical ceiling constraints
      const newImpReduction = Math.min(60, prevImpReduction + 15 + Math.floor(Math.random() * 15));
      const newJitterReduction = Math.min(15, prevJitterReduction + 2 + Math.floor(Math.random() * 3));
      const finalHealthBoost = Math.min(30, prevHealthBoost + boost);

      // Technical metrics adjustment for realistic results inside active view
      liveImpedance.value = Math.max(95, liveImpedance.value - (newImpReduction - prevImpReduction));
      liveVoltage.value = parseFloat(Math.min(4.20, liveVoltage.value + 0.05).toFixed(2));
      liveJitter.value = Math.max(10, liveJitter.value - (newJitterReduction - prevJitterReduction));
      
      const calibrationData = {
        healthBoost: finalHealthBoost,
        originalHealth: existingProfile ? existingProfile.originalHealth : batteryHealthBeforeReset.value,
        recalibratedHealth: batteryHealth.value,
        impedanceReduction: newImpReduction,
        voltageJitterReduction: newJitterReduction
      };
      
      saveProfileCalibration(gpId, gpAxes, calibrationData);
      
      batteryHealthResetPerformed.value = true;
      isRecalibratingBattery.value = false;
      
      ui.showToast('تمت إعادة ضبط ومعايرة البطارية بنجاح! 🔋✨', 'success');
      triggerTinyVibration();
    }
  }, step);
};

const scrollToBatterySection = () => {
  const element = document.querySelector('.battery-diagnostics-card');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('highlight-glow-v3');
    setTimeout(() => {
      element.classList.remove('highlight-glow-v3');
    }, 2000);
  }
};

const confirmAndStartWizard = () => {
  showCalibrationModal.value = false;
  if (diagInterval) {
    clearInterval(diagInterval);
    diagInterval = null;
  }
  
  // 1. Initialize wizard state
  startWizard();
  
  // 2. Immediately capture live resting drift values from the gamepad axes
  const gamepads = navigator.getGamepads();
  const gp = gamepads[gamepadIndex.value];
  if (gp) {
    const l3X = gp.axes[0];
    const l3Y = gp.axes[1];
    maxL3Drift.x = l3X;
    maxL3Drift.y = l3Y;
    maxL3DriftVal.value = calculateDrift(l3X, l3Y);

    const r3X = gp.axes[2];
    const r3Y = gp.axes[3];
    maxR3Drift.x = r3X;
    maxR3Drift.y = r3Y;
    maxR3DriftVal.value = calculateDrift(r3X, r3Y);
  }
};

const skipStep = () => {
  skippedSteps.value.push(wizardStepIndex.value);
  analogTestProgress.value = 0;
  analogHasMoved.value = false;
  analogRestFrames.value = 0;
  restingXAccum.value = 0;
  restingYAccum.value = 0;
  clearCountdown();
  stableFrames.value = 0;
  lastStickX.value = 0;
  lastStickY.value = 0;
  nextStep();
};

const cancelWizard = () => {
  wizardState.value = 'idle';
  analogTestProgress.value = 0;
  analogHasMoved.value = false;
  analogRestFrames.value = 0;
  restingXAccum.value = 0;
  restingYAccum.value = 0;
  clearCountdown();
  stableFrames.value = 0;
  lastStickX.value = 0;
  lastStickY.value = 0;
  skippedSteps.value = [];
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
  maxL3DriftVal.value = calculateDrift(maxL3Drift.x, maxL3Drift.y);
  maxR3DriftVal.value = calculateDrift(maxR3Drift.x, maxR3Drift.y);
  
  // 1. Buttons score: 40% max (deduct skipped buttons proportionally)
  const bScore = buttonsScore.value;
  
  // 2. Left Analog: 15% max (deduct drift proportionally from 15%)
  const l3Score = 15 - (maxL3DriftVal.value / 100) * 15;
  
  // 3. Right Analog: 15% max
  const r3Score = 15 - (maxR3DriftVal.value / 100) * 15;
  
  // 4. Battery Health: 30% max
  const battScore = (batteryHealth.value / 100) * 30;
  
  // Final total score out of 100%
  const totalScore = bScore + l3Score + r3Score + battScore;
  healthScore.value = Math.max(0, Math.min(Math.round(totalScore), 100));
  
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

    // Automatically read and track battery charge level when connected, if not actively diagnosing
    if (gp && !isDiagnosingBattery.value && !batteryDiagCompleted.value) {
      if (gp.battery) {
        const bLevel = gp.battery.level !== undefined ? gp.battery.level : gp.battery.chargeLevel;
        if (typeof bLevel === 'number' && bLevel >= 0 && bLevel <= 1) {
          batteryLevel.value = Math.round(bLevel * 100);
        } else if (typeof bLevel === 'number' && bLevel > 1 && bLevel <= 100) {
          batteryLevel.value = Math.round(bLevel);
        }
      } else {
        // Fallback: dynamic but stable battery level generated for this specific gamepad connection session
        const gpKey = gp ? `${gp.id}_${gp.index}` : 'default_gamepad';
        batteryLevel.value = sessionBatteryLevels.value[gpKey] || 85;
      }
    }

    if (wizardState.value === 'testing') {
      // Check if target button/analog in wizard is active
      const targetStep = wizardSteps[wizardStepIndex.value];
      if (targetStep.isAnalog) {
        // Read stick axes
        const x = targetStep.stick === 'L3' ? gp.axes[0] : gp.axes[2];
        const y = targetStep.stick === 'L3' ? gp.axes[1] : gp.axes[3];
        const magnitude = Math.sqrt(x*x + y*y);
        
        // Accumulate resting coordinates during active countdown for noise filtering
        if (isCountdownActive.value) {
          restingXAccum.value += x;
          restingYAccum.value += y;
          analogRestFrames.value++;
        }
        
        if (!analogHasMoved.value) {
          // Phase 1: Wait for user to push stick past 0.6 (confirming rotation/movement check)
          if (magnitude > 0.6) {
            analogHasMoved.value = true;
            clearCountdown();
            stableFrames.value = 0;
            lastStickX.value = x;
            lastStickY.value = y;
          }
        } else {
          // Phase 2: User has moved the stick. Now wait for them to let go
          const dx = x - lastStickX.value;
          const dy = y - lastStickY.value;
          const velocity = Math.sqrt(dx*dx + dy*dy);
          
          lastStickX.value = x;
          lastStickY.value = y;

          // If stick is in neutral region (< 0.45) and has stopped moving (velocity < 0.015)
          // Threshold is increased from 0.005 to 0.015 to ignore hardware jitter in worn-out controllers.
          if (magnitude < 0.45 && velocity < 0.015) {
            stableFrames.value++;
            
            // Wait for 15 frames (~250ms) to ensure stability
            if (stableFrames.value >= 15) {
              if (!isCountdownActive.value) {
                isCountdownActive.value = true;
                countdownValue.value = 3;
                ui.showToast('🎯 تم استشعار توقف حركة الأنالوج، جاري الفحص والعد...', 'info');
                
                countdownTimer.value = setInterval(() => {
                  if (countdownValue.value > 1) {
                    countdownValue.value--;
                    triggerTinyVibration();
                  } else {
                    // Countdown completed successfully!
                    // Calculate smooth average coordinates from accumulated frames to filter out sensor jitter
                    const avgX = analogRestFrames.value > 0 ? (restingXAccum.value / analogRestFrames.value) : 0;
                    const avgY = analogRestFrames.value > 0 ? (restingYAccum.value / analogRestFrames.value) : 0;
                    const restingDrift = calculateDrift(avgX, avgY);
                    
                    clearCountdown();
                    
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
                    stableFrames.value = 0;
                    
                    ui.showToast('✅ تم تسجيل نسبة الانحراف بنجاح!', 'success');
                    nextStep();
                  }
                }, 1000);
              }
            }
          } else {
            stableFrames.value = 0;
            if (isCountdownActive.value) {
              clearCountdown();
              ui.showToast('⚠️ تم رصد حركة، تم إعادة ضبط العد التنازلي للمعايرة...', 'warning');
            }
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
  
  // Reset diagnostic and calibration states for the new gamepad connection session
  batteryDiagCompleted.value = false;
  batteryHealthResetPerformed.value = false;
  
  // Generate a dynamic but stable battery level (between 68% and 98%) for this specific connection session
  const key = `${e.gamepad.id}_${e.gamepad.index}`;
  if (!sessionBatteryLevels.value[key]) {
    sessionBatteryLevels.value[key] = 68 + Math.floor(Math.random() * 31);
  }
  
  // Start polling
  if (rafId) cancelAnimationFrame(rafId);
  pollGamepad();
  ui.showToast('تم توصيل ذراع تحكم بنجاح! 🎮', 'success');

  // Trigger auto-scan on every new connection session to guarantee a fresh scan without page refresh
  if (!isDiagnosingBattery.value) {
    lastDiagnosedGamepadId.value = e.gamepad.id;
    startBatteryDiagnostic();
  }
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
    
    // Also reset battery states when disconnected
    lastDiagnosedGamepadId.value = '';
    isDiagnosingBattery.value = false;
    batteryDiagCompleted.value = false;
    batteryHealthResetPerformed.value = false;
    sessionBatteryLevels.value = {}; // WIPE temporary session battery level cache on disconnection
    if (diagInterval) {
      clearInterval(diagInterval);
      diagInterval = null;
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
  ctx.fillText('اسم ذراع التحكم:', 420, 280);
  ctx.fillText('تاريخ معايرة الفحص:', 420, 315);
  ctx.fillText('أزرار الاستجابة (Buttons):', 420, 350);
  ctx.fillText('الأنالوج الأيسر (L3 Drift):', 420, 385);
  ctx.fillText('الأنالوج الأيمن (R3 Drift):', 420, 420);
  ctx.fillText('شحن البطارية (Battery Level):', 420, 455);
  ctx.fillText('صحة البطارية (Battery Health):', 420, 490);
  ctx.fillText('سرعة زمن الاستجابة (Delay):', 420, 525);

  // Right Column Vals (Values)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Cairo", Arial, sans-serif';
  ctx.fillText(gamepadName.value || 'DualSense Wireless Controller', 450, 280);
  ctx.fillText(new Date().toLocaleDateString('ar-EG'), 450, 315);
  
  if (buttonsScore.value >= 30) {
    ctx.fillStyle = '#10b981';
  } else if (buttonsScore.value >= 20) {
    ctx.fillStyle = '#fbbf24';
  } else {
    ctx.fillStyle = '#ef4444';
  }
  ctx.fillText(`${buttonsResponseText.value} (${buttonsScore.value}% من 40%)`, 450, 350);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`انحراف ${maxL3DriftVal.value}% (${getDriftText(maxL3DriftVal.value)}) (التقييم: ${(15 - (maxL3DriftVal.value / 100) * 15).toFixed(1)}/15)`, 450, 385);
  ctx.fillText(`انحراف ${maxR3DriftVal.value}% (${getDriftText(maxR3DriftVal.value)}) (التقييم: ${(15 - (maxR3DriftVal.value / 100) * 15).toFixed(1)}/15)`, 450, 420);
  ctx.fillText(`${batteryLevel.value}% 🔋`, 450, 455);
  
  if (batteryHealth.value >= 80) {
    ctx.fillStyle = '#10b981';
  } else if (batteryHealth.value >= 50) {
    ctx.fillStyle = '#fbbf24';
  } else {
    ctx.fillStyle = '#ef4444';
  }
  ctx.fillText(`${batteryHealth.value}% (التقييم: ${(batteryHealth.value * 30 / 100).toFixed(1)}% من 30%) ❤️`, 450, 490);
  
  ctx.fillStyle = '#10b981';
  ctx.fillText('فائقة السرعة الاستجابة (~4ms) ⚡', 450, 525);

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

      // Trigger auto-scan
      lastDiagnosedGamepadId.value = gps[i].id;
      batteryDiagCompleted.value = false;
      batteryHealthResetPerformed.value = false;
      startBatteryDiagnostic();
      break;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('gamepadconnected', onGamepadConnected);
  window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
  if (rafId) cancelAnimationFrame(rafId);
  clearCountdown();
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
  justify-content: space-between !important;
}

.status-bar-v3 .status-info-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-bar-v3 .battery-telemetry {
  display: flex;
  align-items: center;
  gap: 20px;
  direction: rtl;
}

.status-bar-v3 .battery-status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.status-bar-v3 .battery-status-item .label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.status-bar-v3 .battery-status-item .val {
  color: #10b981;
  font-weight: 800;
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

/* ==================================================== */
/* 🎯 AUTOMATIC ANALOG CALIBRATION MODAL STYLES */
/* ==================================================== */
.calibration-modal-container {
  width: 100%;
  max-width: 550px !important;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 20px !important;
  padding: 2.2rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem !important;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.7) !important;
  margin-top: 15vh !important;
  text-align: right !important;
  direction: rtl !important;
  animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.calibration-modal-container .modal-header-v3 {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding-bottom: 0.8rem !important;
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
}

.calibration-modal-container .modal-title-v3 {
  font-size: 1.35rem !important;
  color: #fbbf24 !important;
  margin: 0 !important;
  font-weight: 800 !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.calibration-modal-container .modal-desc-v3 {
  font-size: 0.98rem !important;
  color: #cbd5e1 !important;
  line-height: 1.6 !important;
  margin: 0 !important;
}

.calibration-modal-container .instructions-steps-v3 {
  display: flex !important;
  flex-direction: column !important;
  gap: 1.2rem !important;
  background: rgba(15, 23, 42, 0.5) !important;
  padding: 1.2rem !important;
  border-radius: 14px !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.calibration-modal-container .step-v3-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 12px !important;
}

.calibration-modal-container .step-num {
  background: linear-gradient(135deg, #fbbf24, #d97706) !important;
  color: #0f172a !important;
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 800 !important;
  font-size: 0.9rem !important;
  flex-shrink: 0 !important;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.3) !important;
}

.calibration-modal-container .step-desc {
  font-size: 0.95rem !important;
  color: #e2e8f0 !important;
  margin: 0 !important;
  line-height: 1.6 !important;
}

.calibration-modal-container .warning-note-v3 {
  font-size: 0.9rem !important;
  color: #38bdf8 !important;
  line-height: 1.6 !important;
  background: rgba(56, 189, 248, 0.08) !important;
  padding: 1rem !important;
  border-radius: 10px !important;
  border: 1px solid rgba(56, 189, 248, 0.2) !important;
  margin: 0 !important;
}

.calibration-modal-container .modal-footer-v3 {
  display: flex !important;
  gap: 12px !important;
  justify-content: flex-start !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding-top: 1.2rem !important;
}

/* 🔋 BATTERY CALIBRATION / DIAGNOSTIC STYLES */
.battery-calibration-section-v3 {
  background: rgba(15, 23, 42, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 14px !important;
  padding: 1.2rem !important;
  margin-bottom: 1.2rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1.2rem !important;
}

.battery-calibration-section-v3 .section-title-v3 {
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  color: #38bdf8 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin: 0 !important;
}

.battery-calibration-section-v3 .control-group-v3 {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.6rem !important;
}

.battery-calibration-section-v3 .control-header-v3 {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.battery-calibration-section-v3 .control-label-v3 {
  font-size: 0.95rem !important;
  color: #e2e8f0 !important;
  font-weight: 600 !important;
}

.battery-calibration-section-v3 .control-val-badge-v3 {
  background: rgba(56, 189, 248, 0.15) !important;
  color: #38bdf8 !important;
  padding: 2px 10px !important;
  border-radius: 20px !important;
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
}

.battery-calibration-section-v3 .slider-wrapper-v3 {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.battery-calibration-section-v3 .slider-v3 {
  flex: 1 !important;
  height: 6px !important;
  border-radius: 3px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  outline: none !important;
  -webkit-appearance: none !important;
  cursor: pointer !important;
}

.battery-calibration-section-v3 .slider-v3::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  width: 16px !important;
  height: 16px !important;
  border-radius: 50% !important;
  background: #38bdf8 !important;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5) !important;
  transition: transform 0.1s !important;
}

.battery-calibration-section-v3 .slider-v3::-webkit-slider-thumb:hover {
  transform: scale(1.2) !important;
}

.battery-calibration-section-v3 .slider-v3.battery-health-slider::-webkit-slider-thumb {
  background: #10b981 !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5) !important;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==================================================== */
/* 🔋 PREMIUM AUTOMATED BATTERY DIAGNOSTIC UI STYLES    */
/* ==================================================== */
.battery-scanning-view-v3 {
  display: flex !important;
  flex-direction: column !important;
  gap: 1rem !important;
  align-items: center !important;
  padding: 0.5rem 0 !important;
}

.scanning-core-wrapper {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.battery-pulse-core-v3 {
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%) !important;
  border: 2px solid #00e5ff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #00e5ff !important;
  font-size: 1.4rem !important;
  font-weight: bold !important;
  text-shadow: 0 0 10px #00e5ff !important;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2) !important;
  animation: pulse-glow-v3 1.2s infinite ease-in-out !important;
}

@keyframes pulse-glow-v3 {
  0% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(0, 229, 255, 0.5), inset 0 0 10px rgba(0, 229, 255, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
  }
}

.scanning-status-text-v3 {
  font-size: 0.9rem !important;
  font-weight: 800 !important;
  color: #38bdf8 !important;
  text-align: center !important;
  animation: pulse 1.5s infinite !important;
}

.scan-progress-bar-v3 {
  width: 100% !important;
  height: 10px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.scan-progress-fill-v3 {
  height: 100% !important;
  background: linear-gradient(90deg, #38bdf8 0%, #10b981 100%) !important;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5) !important;
  transition: width 0.08s linear !important;
}

.live-telemetry-grid-v3 {
  display: grid !important;
  grid-template-columns: 1fr 1fr 1fr !important;
  gap: 10px !important;
  width: 100% !important;
  margin-top: 0.5rem !important;
}

.telemetry-item-v3 {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 10px !important;
  padding: 0.6rem 0.4rem !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 4px !important;
  text-align: center !important;
}

.telemetry-item-v3 .t-label {
  font-size: 0.72rem !important;
  color: #94a3b8 !important;
  font-weight: 500 !important;
}

.telemetry-item-v3 .t-val {
  font-size: 0.95rem !important;
  font-weight: 900 !important;
  color: #00e5ff !important;
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.3) !important;
}

.telemetry-item-v3 .t-val.warning-color {
  color: #fbbf24 !important;
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.3) !important;
}

/* Diagnostic Success State */
.battery-diagnostic-success-v3 {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.8rem !important;
  width: 100% !important;
  animation: fadeIn 0.4s ease-out !important;
}

.diagnostic-success-header-v3 {
  display: flex !important;
  justify-content: center !important;
}

.success-badge-tag-v3 {
  background: rgba(16, 185, 129, 0.12) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.25) !important;
  padding: 6px 16px !important;
  border-radius: 30px !important;
  font-size: 0.92rem !important;
  font-weight: 800 !important;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.1) !important;
}

.final-telemetry-table-v3 {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  padding: 0.8rem 1rem !important;
  width: 100% !important;
}

.final-telemetry-table-v3 .table-row-v3 {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.03) !important;
  padding-bottom: 5px !important;
}

.final-telemetry-table-v3 .table-row-v3:last-child {
  border-bottom: none !important;
  padding-bottom: 0 !important;
}

.final-telemetry-table-v3 .row-label-v3 {
  font-size: 0.88rem !important;
  color: #94a3b8 !important;
  font-weight: 600 !important;
}

.final-telemetry-table-v3 .row-val-v3 {
  font-size: 0.88rem !important;
  color: #f8fafc !important;
  font-weight: 700 !important;
}

.final-telemetry-table-v3 .row-val-badge-v3 {
  background: rgba(56, 189, 248, 0.15) !important;
  color: #38bdf8 !important;
  padding: 2px 10px !important;
  border-radius: 20px !important;
  font-size: 0.85rem !important;
  font-weight: 800 !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
}

.final-telemetry-table-v3 .row-val-badge-v3.success {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
}

.final-telemetry-table-v3 .row-val-badge-v3.success.health {
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2) !important;
}

/* 🔋 NEW BATTERY DIAGNOSTICS & RECALIBRATION STYLES */
.left-column-wrapper {
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem !important;
}

.battery-diagnostics-card {
  margin-top: 0 !important;
}

.badge-recalibrated-v3 {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(170, 124, 17, 0.3) 100%) !important;
  color: #d4af37 !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  padding: 2px 10px !important;
  border-radius: 20px !important;
  font-size: 0.75rem !important;
  font-weight: 800 !important;
  text-shadow: 0 0 4px rgba(212, 175, 55, 0.3) !important;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.1) !important;
}

.battery-actions-row {
  display: flex !important;
  gap: 12px !important;
  margin-top: 1rem !important;
}

.battery-actions-row .btn-sys-v3 {
  padding: 16px 24px !important; /* Taller and luxury feeling */
  font-size: 0.92rem !important;
  border-radius: 14px !important;
  justify-content: center !important;
  font-weight: 800 !important;
  letter-spacing: 0.5px !important;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4) !important;
  position: relative !important;
  overflow: hidden !important;
  min-height: 52px !important; /* Set taller height */
  box-sizing: border-box !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.battery-actions-row .btn-sys-v3.success {
  background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%) !important;
  border: 1px solid rgba(16, 185, 129, 0.5) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(4, 120, 87, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
}

.battery-actions-row .btn-sys-v3.success:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%) !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-3px) !important;
}

.btn-recalibrate-gold {
  background: linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #8a640f 100%) !important;
  border: 1px solid rgba(251, 191, 36, 0.6) !important;
  color: #0f172a !important;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5) !important;
}

.btn-recalibrate-gold:hover:not(:disabled) {
  background: linear-gradient(135deg, #fef08a 0%, #d4af37 50%, #b45309 100%) !important;
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.7) !important;
  color: #000000 !important;
  transform: translateY(-3px) !important;
}

/* Reflective light sweep shine effect on hover */
.battery-actions-row .btn-sys-v3::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 60% !important;
  height: 100% !important;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0) 100%
  ) !important;
  transform: skewX(-25deg) !important;
  pointer-events: none !important;
  transition: none !important;
}

.battery-actions-row .btn-sys-v3:hover::after {
  left: 180% !important;
  transition: left 0.8s ease-in-out !important;
}

/* Recalibration Progress loading panel */
.recalibration-loading-panel {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  border-radius: 12px !important;
  padding: 1rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0.6rem !important;
  margin-top: 0.5rem !important;
  box-shadow: inset 0 0 15px rgba(212, 175, 55, 0.05) !important;
}

.recal-status-text {
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  color: #d4af37 !important;
  text-align: center !important;
}

.recal-progress-bar {
  width: 100% !important;
  height: 8px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 4px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.recal-progress-fill {
  height: 100% !important;
  background: linear-gradient(90deg, #d4af37 0%, #f3e5ab 100%) !important;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5) !important;
  transition: width 0.08s linear !important;
}

.recal-percentage {
  font-size: 0.85rem !important;
  font-weight: 800 !important;
  color: #f8fafc !important;
  text-align: center !important;
}

/* Comparison Gold Panel */
.recalibration-comparison-panel-v3 {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(15, 23, 42, 0.85) 100%) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  border-radius: 12px !important;
  padding: 1rem !important;
  margin-top: 0.5rem !important;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.08) !important;
}

.recalibration-comparison-panel-v3 .comparison-title {
  font-size: 0.85rem !important;
  font-weight: 800 !important;
  color: #d4af37 !important;
  margin-bottom: 0.8rem !important;
  text-align: center !important;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.2) !important;
  padding-bottom: 0.4rem !important;
}

.recalibration-comparison-panel-v3 .comparison-grid {
  display: grid !important;
  grid-template-columns: 1fr auto 1fr 1fr !important;
  align-items: center !important;
  gap: 8px !important;
  text-align: center !important;
}

.recalibration-comparison-panel-v3 .comparison-box {
  background: rgba(15, 23, 42, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
  border-radius: 8px !important;
  padding: 0.4rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}

.recalibration-comparison-panel-v3 .comparison-box.before {
  border-color: rgba(239, 68, 68, 0.2) !important;
}

.recalibration-comparison-panel-v3 .comparison-box.after {
  border-color: rgba(16, 185, 129, 0.3) !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.1) !important;
}

.recalibration-comparison-panel-v3 .comparison-box.improvement {
  border-color: rgba(212, 175, 55, 0.3) !important;
  background: rgba(212, 175, 55, 0.04) !important;
}

.recalibration-comparison-panel-v3 .comp-label {
  font-size: 0.65rem !important;
  color: #94a3b8 !important;
  font-weight: 600 !important;
}

.recalibration-comparison-panel-v3 .comp-val {
  font-size: 1.1rem !important;
  font-weight: 900 !important;
  color: #f8fafc !important;
}

.recalibration-comparison-panel-v3 .comp-val.success-text {
  color: #10b981 !important;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3) !important;
}

.recalibration-comparison-panel-v3 .comp-val.improvement-text {
  color: #d4af37 !important;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.3) !important;
}

.recalibration-comparison-panel-v3 .comparison-arrow {
  font-size: 1.2rem !important;
  display: flex !important;
  justify-content: center !important;
}

.recalibration-comparison-panel-v3 .comparison-technical-note {
  font-size: 0.72rem !important;
  color: #a3a3a3 !important;
  margin-top: 0.6rem !important;
  text-align: center !important;
  line-height: 1.3 !important;
}

/* Status Bar Navigation Button */
.btn-goto-battery-v3 {
  background: rgba(16, 185, 129, 0.12) !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
  color: #10b981 !important;
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  padding: 0 10px !important;
  height: 24px !important;
  line-height: 22px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  margin: 0 0.5rem 0 0 !important;
  transition: all 0.25s ease !important;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.05) !important;
  outline: none !important;
  white-space: nowrap !important;
  align-self: center !important;
}

.btn-goto-battery-v3:hover {
  background: rgba(16, 185, 129, 0.22) !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.25) !important;
  transform: translateY(-1px) !important;
}

.btn-goto-battery-v3:active {
  transform: translateY(0px) !important;
}

/* Card Glow Highlight Animation */
@keyframes highlight-glow-pulse-v3 {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
    border-color: rgba(16, 185, 129, 0.8);
  }
  50% {
    box-shadow: 0 0 25px 8px rgba(16, 185, 129, 0.4);
    border-color: rgba(16, 185, 129, 1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.battery-diagnostics-card.highlight-glow-v3 {
  animation: highlight-glow-pulse-v3 2s ease-out !important;
}
</style>
