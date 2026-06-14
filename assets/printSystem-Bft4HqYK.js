import{t as e}from"./appStore-DqM9iLGi.js";var t=(t,n=!1)=>{let r=e(),i=r.appSettings?.appName||`Classico`,a=r.appSettings?.appLogo||`/logo1.png`,o=(t.orders||[]).map(e=>`
    <div class="invoice-row">
      <span class="val-bold">${(e.total||0).toFixed(2)} ج</span>
      <span class="item-name">${e.qty}x ${e.name}</span>
    </div>
  `).join(``),s=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>طباعة فاتورة - ${i}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        * { box-sizing: border-box; }
        body {
          font-family: 'Cairo', 'Segoe UI', 'Arial', sans-serif;
          margin: 0;
          padding: 2mm 5mm; 
          background: #fff;
          color: #000;
          width: 100%;
          max-width: 80mm; 
          font-size: 14px;
        }
        .header { text-align: center; margin-bottom: 8px; }
        .logo { max-width: 100px; margin-bottom: 3px; }
        .main-title { font-size: 22px; font-weight: 900; margin: 0; }
        
        .line { border-top: 1px solid #000; margin: 4px 0; }
        .line-bold { border-top: 3px solid #000; margin: 6px 0; }
        .line-dashed { border-top: 1px dashed #000; margin: 4px 0; }
        
        .invoice-type { text-align: center; font-size: 16px; font-weight: 800; margin: 4px 0; border: 1px solid #000; padding: 2px; }
        
        .info-group { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
        .section-header { text-align: center; font-weight: 800; font-size: 14px; margin: 8px 0 2px 0; text-decoration: underline; }
        
        .invoice-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; gap: 5px; }
        .item-name { flex: 1; text-align: right; line-height: 1.2; }
        .val-bold { font-weight: bold; white-space: nowrap; text-align: left; }
        
        .total-box {
          margin-top: 8px;
          border: 3px solid #000;
          padding: 8px 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label { font-size: 20px; font-weight: 900; }
        .total-value { font-size: 22px; font-weight: 900; }
        
        .footer { text-align: center; margin-top: 12px; font-size: 15px; font-weight: 800; }
        .developer-note { text-align: center; margin-top: 8px; font-size: 9px; opacity: 0.7; font-weight: normal; }

        @media print {
          body { width: 80mm; padding: 2mm; margin: 0; }
          @page { margin: 0; size: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${a}" class="logo" onerror="this.style.display='none'">
        <div class="main-title">${i}</div>
      </div>

      <div class="line-bold"></div>
      
      <div class="invoice-type">
        ${t.deviceName?`فاتورة جهاز: ${t.deviceName}`:t.loungeName?`فاتورة صالة: ${t.loungeName}`:t.customerName?`كشف حساب: ${t.customerName}`:`فاتورة حساب`}
      </div>
      
      <div class="line"></div>

      <div class="info-group">
        <span>التاريخ: <span class="val-bold">${t.dateStr||new Date().toLocaleDateString(`ar-EG`)}</span></span>
        <span>الوقت: <span class="val-bold">${t.timeStr||new Date().toLocaleTimeString(`ar-EG`,{hour:`2-digit`,minute:`2-digit`})}</span></span>
      </div>

      <div class="line-dashed"></div>

      ${t.deviceName?`
        <div class="section-header">تفاصيل الوقت</div>
        <div class="invoice-row"><span>وقت البدء:</span><span class="val-bold">${t.startTimeFormatted||`--:--`}</span></div>
        <div class="invoice-row"><span>وقت الانتهاء:</span><span class="val-bold">${t.endTimeFormatted||`--:--`}</span></div>
        <div class="line-dashed"></div>
        <div class="invoice-row" style="font-size: 14px;"><span>المدة:</span><span class="val-bold">${t.usedDuration||`00:00:00`}</span></div>
        <div class="invoice-row" style="font-size: 14px;"><span>تكلفة الوقت:</span><span class="val-bold">${(t.timeCost||0).toFixed(2)} ج</span></div>
        <div class="line-dashed"></div>
      `:``}

      ${t.orders&&t.orders.length>0?`
        <div class="section-header">الطلبات والمشروبات</div>
        ${o}
        <div class="line-dashed"></div>
        <div class="invoice-row"><span>إجمالي الطلبات:</span><span class="val-bold">${(t.ordersCost||0).toFixed(2)} ج</span></div>
      `:``}

      ${t.ledger&&t.ledger.length>0?`
        <div class="section-header">سجل مديونية العميل</div>
        ${t.ledger.map(e=>`
          <div class="invoice-row">
            <span class="val-bold">${e.type===`debt`?`+`:`-`}${e.amount.toFixed(2)}</span>
            <span class="item-name" style="font-size: 11px;">${e.note}</span>
          </div>
        `).join(``)}
      `:``}

      <div class="total-box">
        <span class="total-value">${(t.totalCost||0).toFixed(2)} ج</span>
        <span class="total-label">الإجمالي:</span>
      </div>

      <div class="footer">
        شكراً لزيارتكم - ننتظركم دائماً
        <div style="font-size: 11px; margin-top: 5px;">Classico System V3</div>
      </div>
      
      <div class="developer-note">تاريخ الطباعة: ${new Date().toLocaleString()} | المستخدم: ${t.processedBy||`Admin`}</div>

      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => { window.close(); }, 1000);
        };
      <\/script>
    </body>
    </html>
  `,c=window.open(``,`_blank`,`width=600,height=800`);c.document.open(),c.document.write(s),c.document.close(),window.electronAPI&&window.electronAPI.send&&window.electronAPI.send(`print-html`,s)},n=(e,t,n,r=`print`)=>{let i=r===`pdf`,a=r===`image`,o=i?`<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
       <script>
        window.onload = () => {
          const btn = document.getElementById('save-pdf-btn');
          btn.style.display = 'block';
          btn.addEventListener('click', () => {
            const element = document.querySelector('.certificate-container');
            const opt = {
              margin: 0,
              filename: 'تقرير-تتويج-${e.replace(/'/g,``)}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0b0f19' },
              jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
          });
        };
      <\/script>`:a?`<script>
        window.onload = () => {
          const btn = document.getElementById('save-img-btn');
          btn.style.display = 'block';
          btn.addEventListener('click', () => {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            document.head.appendChild(script);
            script.onload = () => {
              html2canvas(document.querySelector('.certificate-container'), {
                backgroundColor: '#0b0f19', scale: 2, useCORS: true
              }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'تقرير-البطولة.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
              });
            };
          });
        };
      <\/script>`:`<script>
        window.onload = () => { window.print(); setTimeout(() => { window.close(); }, 1500); };
      <\/script>`;return`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>التقرير الرسمي لتتويج أبطال الصالة 🏆</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        * { box-sizing: border-box; }
        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0b0f19;
          color: #f8fafc;
          direction: rtl;
          margin: 0;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 90vh;
          box-sizing: border-box;
          overflow: hidden;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .certificate-container {
          background: radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%) !important;
          border: 1px solid rgba(245, 158, 11, 0.25) !important;
          border-radius: 20px;
          padding: 30px 40px;
          width: 100%;
          max-width: 760px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          position: relative;
          box-sizing: border-box;
          page-break-inside: avoid;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .header {
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .lounge-name {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
          color: #fff !important;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 0.35rem 0.9rem;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
          display: inline-block;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .report-title {
          font-size: 1.8rem;
          color: #00f2fe;
          text-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
          margin: 5px 0;
          font-weight: 900;
        }
        
        .tournament-title {
          font-size: 1.25rem;
          color: #fbbf24;
          font-weight: 800;
          margin-top: 2px;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
        }
        
        .podium-section {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 20px;
          margin: 30px 0 15px 0;
        }
        
        .podium-card {
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
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .podium-card.gold {
          border-color: rgba(245, 158, 11, 0.4) !important;
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.15) !important;
          padding: 2.2rem 1.2rem;
          transform: translateY(-15px);
          width: 175px;
        }
        
        .podium-card.silver {
          border-color: rgba(203, 213, 225, 0.3) !important;
        }
        
        .podium-card.bronze {
          border-color: rgba(180, 83, 9, 0.3) !important;
        }
        
        .medal-badge {
          font-size: 2rem;
          position: absolute;
          top: -20px;
        }
        
        .winner-logo {
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
        
        .gold .winner-logo {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
          width: 75px;
          height: 75px;
          font-size: 2.8rem;
        }
        
        .winner-nick {
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
        
        .gold .winner-nick {
          color: #fbbf24;
        }
        
        .rank-text {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: bold;
        }
        
        .prize-highlight {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          background: rgba(251, 191, 36, 0.2) !important;
          border: 1px solid rgba(251, 191, 36, 0.4) !important;
          color: #fbbf24;
          border-radius: 12px;
          font-weight: bold;
          font-size: 0.82rem;
          white-space: nowrap;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .prize-highlight.silver {
          background: rgba(148, 163, 184, 0.2) !important;
          border-color: rgba(148, 163, 184, 0.4) !important;
          color: #cbd5e1;
        }
        .prize-highlight.bronze {
          background: rgba(180, 83, 9, 0.2) !important;
          border-color: rgba(180, 83, 9, 0.4) !important;
          color: #fb923c;
        }
        
        .footer-section {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .stamp-area {
          text-align: right;
        }
        
        .stamp-title {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 25px;
        }
        
        .stamp-line {
          width: 120px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
        }
        
        .meta-time {
          font-size: 0.75rem;
          color: #64748b;
        }
    
        @media print {
          body {
            background-color: #0b0f19 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0;
            margin: 0;
          }
          .certificate-container {
            box-shadow: none !important;
            border: 1px solid rgba(245, 158, 11, 0.25) !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
          }
          #save-img-btn, #save-pdf-btn, .pdf-hint, .no-print {
            display: none !important;
          }
        }
      
        /* Official red ink stamp styled in CSS */
        .official-stamp {
          border: 4px double #ef4444 !important;
          border-radius: 50% !important;
          color: #ef4444 !important;
          text-align: center !important;
          font-weight: 900 !important;
          width: 95px !important;
          height: 95px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          transform: rotate(-10deg) !important;
          opacity: 0.85 !important;
          box-shadow: 0 0 5px rgba(239, 68, 68, 0.15) !important;
          background: rgba(239, 68, 68, 0.03) !important;
          font-family: 'Cairo', sans-serif !important;
          line-height: 1.2 !important;
          text-transform: uppercase !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .official-stamp .stamp-top {
          font-size: 0.55rem !important;
          letter-spacing: 0.5px !important;
          font-weight: 800 !important;
        }

        .official-stamp .stamp-mid {
          font-size: 0.85rem !important;
          font-weight: 900 !important;
          border-top: 1.5px solid #ef4444 !important;
          border-bottom: 1.5px solid #ef4444 !important;
          padding: 2px 4px !important;
          margin: 2px 0 !important;
          width: 80px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          text-align: center !important;
        }

        .official-stamp .stamp-bot {
          font-size: 0.5rem !important;
          letter-spacing: 0.5px !important;
          font-weight: bold !important;
        }

        .winners-report-table th, .winners-report-table td {
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Ensure logo symbols fit in one line */
        .winner-logo {
          font-size: 1.6rem !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
        }
        .gold .winner-logo {
          font-size: 2rem !important;
        }
      </style>
    </head>
    <body>
      ${i?`<div style="text-align:center;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px;margin:10px auto;max-width:600px;font-family:Cairo,sans-serif;color:#10b981;font-size:0.85rem;font-weight:600;" class="no-print">
        💡 اضغط <strong>Ctrl + P</strong> ثم اختر «حفظ كـ PDF» من قائمة الطابعة
       </div>`:``}
      ${a?`<div style="text-align:center;margin:20px 0;" class="no-print">
        <button id="save-img-btn" style="display:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;padding:12px 32px;font-size:1rem;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;">
          🖼️ حفظ كصورة PNG
        </button>
       </div>`:``}
      ${i?`<div style="text-align:center;margin:20px 0;" class="no-print">
        <button id="save-pdf-btn" style="display:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;padding:12px 32px;font-size:1rem;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif;">
          📄 تنزيل ملف PDF الآن
        </button>
       </div>`:``}
      <div class="certificate-container">
        <div class="header">
          <div class="lounge-name">🎮 ${t}</div>
          <h2 class="report-title">التقرير الرسمي لتتويج أبطال الصالة 🏆</h2>
          <div class="tournament-title" style="margin-top: 5px;">
            <span class="tournament-label" style="font-size: 1.1rem; opacity: 0.85; color: #fbbf24;">بطولة</span>
            <span class="tournament-name-highlight" style="font-size: 1.7rem; font-weight: 900; color: #fbbf24; text-shadow: 0 0 15px rgba(251, 191, 36, 0.4); margin-right: 6px; white-space: nowrap;">"${e}"</span>
          </div>
        </div>
        
        <div class="podium-section">
          <!-- Silver -->
          ${n.second?`
          <div class="podium-card silver">
            <div class="winner-logo" style="${n.second.logoStyle||``}; padding: 6px; display: flex; align-items: center; justify-content: center;">
              ${n.second.logoUrl?`<img src="${n.second.logoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`:`🏆`}
            </div>
            <span class="winner-nick">${n.second.nickname}</span>
            <span class="rank-text">المركز الثاني</span>
            <div class="podium-medal" style="font-size: 2.5rem; margin-top: 5px;">🥈</div>
          </div>
          `:``}
          
          <!-- Gold -->
          ${n.first?`
          <div class="podium-card gold">
            <div class="winner-logo" style="${n.first.logoStyle||``}; padding: 6px; display: flex; align-items: center; justify-content: center;">
              ${n.first.logoUrl?`<img src="${n.first.logoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`:`🏆`}
            </div>
            <span class="winner-nick gold-color">${n.first.nickname}</span>
            <span class="rank-text">البطل والمركز الأول 🏆</span>
            <div class="podium-medal" style="font-size: 3rem; margin-top: 5px; filter: drop-shadow(0 0 8px rgba(251,191,36,0.5));">🏆🥇</div>
          </div>
          `:``}
          
          <!-- Bronze -->
          ${n.third?`
          <div class="podium-card bronze">
            <div class="winner-logo" style="${n.third.logoStyle||``}; padding: 6px; display: flex; align-items: center; justify-content: center;">
              ${n.third.logoUrl?`<img src="${n.third.logoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`:`🏆`}
            </div>
            <span class="winner-nick">${n.third.nickname}</span>
            <span class="rank-text">المركز الثالث</span>
            <div class="podium-medal" style="font-size: 2.5rem; margin-top: 5px;">🥉</div>
          </div>
          `:``}
        </div>

        <!-- Prizes Details Table -->
        <div class="winners-table-container" style="margin-top: 15px; width: 100%;">
          <h3 class="table-title" style="text-align: center; color: #fbbf24; font-size: 1.05rem; margin-bottom: 8px; font-weight: 800;">🏆 تفاصيل الجوائز والتكريم</h3>
          <table class="winners-report-table" style="width: 100%; border-collapse: collapse; text-align: center; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden;">
            <thead>
              <tr style="background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <th style="padding: 8px; font-weight: bold; color: #94a3b8; font-size: 0.8rem; width: 25%;">المركز</th>
                <th style="padding: 8px; font-weight: bold; color: #94a3b8; font-size: 0.8rem; width: 45%;">اللاعب</th>
                <th style="padding: 8px; font-weight: bold; color: #94a3b8; font-size: 0.8rem; width: 30%;">الجائزة المحددة</th>
              </tr>
            </thead>
            <tbody>
              <!-- Gold -->
              ${n.first?`
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.03);">
                <td style="padding: 8px; font-weight: bold; color: #fbbf24; font-size: 0.85rem;">🥇 الأول</td>
                <td style="padding: 8px; font-weight: bold; color: #ffffff; font-size: 0.85rem;">
                  ${n.first.nickname}
                  <span style="font-size: 0.72rem; color: #94a3b8; font-weight: normal;">(${n.first.fullName||``})</span>
                </td>
                <td style="padding: 8px; font-weight: bold; color: #fbbf24; font-size: 0.85rem;">${n.first.prize||`ميدالية ذهبية`}</td>
              </tr>
              `:``}
              <!-- Silver -->
              ${n.second?`
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.03);">
                <td style="padding: 8px; font-weight: bold; color: #cbd5e1; font-size: 0.85rem;">🥈 الثاني</td>
                <td style="padding: 8px; font-weight: bold; color: #ffffff; font-size: 0.85rem;">
                  ${n.second.nickname}
                  <span style="font-size: 0.72rem; color: #94a3b8; font-weight: normal;">(${n.second.fullName||``})</span>
                </td>
                <td style="padding: 8px; font-weight: bold; color: #cbd5e1; font-size: 0.85rem;">${n.second.prize||`ميدالية فضية`}</td>
              </tr>
              `:``}
              <!-- Bronze -->
              ${n.third?`
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #fb923c; font-size: 0.85rem;">🥉 الثالث</td>
                <td style="padding: 8px; font-weight: bold; color: #ffffff; font-size: 0.85rem;">
                  ${n.third.nickname}
                  <span style="font-size: 0.72rem; color: #94a3b8; font-weight: normal;">(${n.third.fullName||``})</span>
                </td>
                <td style="padding: 8px; font-weight: bold; color: #fb923c; font-size: 0.85rem;">${n.third.prize||`ميدالية برونزية`}</td>
              </tr>
              `:``}
            </tbody>
          </table>
        </div>

        <div class="footer-section" style="margin-top: 15px;">
          <div class="meta-time">تاريخ الإصدار: ${new Date().toLocaleDateString(`ar-EG`)}</div>
          <div class="stamp-area" style="display: flex; flex-direction: column; align-items: center; margin-top: -10px;">
            <div class="stamp-title" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">اعتماد إدارة الصالة</div>
            <div class="official-stamp">
              <span class="stamp-top">🏆 CLASSICO 🏆</span>
              <span class="stamp-mid">${t}</span>
              <span class="stamp-bot">اعتماد رسمي</span>
            </div>
          </div>
        </div>
      </div>
      
      ${o}
    </body>
    </html>
  `},r=(e,t,r)=>{let i=n(e,t,r,`print`),a=window.open(``,`_blank`,`width=850,height=900`);a.document.open(),a.document.write(i),a.document.close(),window.electronAPI&&window.electronAPI.send&&window.electronAPI.send(`print-html`,i)},i=(e,t,r)=>{let i=n(e,t,r,`pdf`),a=window.open(``,`_blank`,`width=850,height=900`);a.document.open(),a.document.write(i),a.document.close()},a=(e,t,r)=>{let i=n(e,t,r,`image`),a=window.open(``,`_blank`,`width=850,height=900`);a.document.open(),a.document.write(i),a.document.close()};export{t as i,i as n,r,a as t};