/**
 * printSystem.js - Professional Thermal Printing Engine for Classico V3
 * Optimized for 58mm and 80mm thermal printers.
 * Uses a popup window to ensure proper print preview support in Electron.
 */

import { useAppStore } from '../stores/appStore';

export const printUnifiedInvoice = (data, isQuick = false) => {
  const store = useAppStore();
  const appName = store.appSettings?.appName || 'Classico';
  const appLogo = store.appSettings?.appLogo || '/logo1.png';

  // Format orders table rows
  const ordersHtml = (data.orders || []).map(o => `
    <div class="invoice-row">
      <span class="val-bold">${(o.total || 0).toFixed(2)} ج</span>
      <span class="item-name">${o.qty}x ${o.name}</span>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>طباعة فاتورة - ${appName}</title>
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
        <img src="${appLogo}" class="logo" onerror="this.style.display='none'">
        <div class="main-title">${appName}</div>
      </div>

      <div class="line-bold"></div>
      
      <div class="invoice-type">
        ${data.deviceName ? `فاتورة جهاز: ${data.deviceName}` : (data.loungeName ? `فاتورة صالة: ${data.loungeName}` : (data.customerName ? `كشف حساب: ${data.customerName}` : 'فاتورة حساب'))}
      </div>
      
      <div class="line"></div>

      <div class="info-group">
        <span>التاريخ: <span class="val-bold">${data.dateStr || new Date().toLocaleDateString('ar-EG')}</span></span>
        <span>الوقت: <span class="val-bold">${data.timeStr || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></span>
      </div>

      <div class="line-dashed"></div>

      ${data.deviceName ? `
        <div class="section-header">تفاصيل الوقت</div>
        <div class="invoice-row"><span>وقت البدء:</span><span class="val-bold">${data.startTimeFormatted || '--:--'}</span></div>
        <div class="invoice-row"><span>وقت الانتهاء:</span><span class="val-bold">${data.endTimeFormatted || '--:--'}</span></div>
        <div class="line-dashed"></div>
        <div class="invoice-row" style="font-size: 14px;"><span>المدة:</span><span class="val-bold">${data.usedDuration || '00:00:00'}</span></div>
        <div class="invoice-row" style="font-size: 14px;"><span>تكلفة الوقت:</span><span class="val-bold">${(data.timeCost || 0).toFixed(2)} ج</span></div>
        <div class="line-dashed"></div>
      ` : ''}

      ${data.orders && data.orders.length > 0 ? `
        <div class="section-header">الطلبات والمشروبات</div>
        ${ordersHtml}
        <div class="line-dashed"></div>
        <div class="invoice-row"><span>إجمالي الطلبات:</span><span class="val-bold">${(data.ordersCost || 0).toFixed(2)} ج</span></div>
      ` : ''}

      ${data.ledger && data.ledger.length > 0 ? `
        <div class="section-header">سجل مديونية العميل</div>
        ${data.ledger.map(l => `
          <div class="invoice-row">
            <span class="val-bold">${l.type === 'debt' ? '+' : '-'}${l.amount.toFixed(2)}</span>
            <span class="item-name" style="font-size: 11px;">${l.note}</span>
          </div>
        `).join('')}
      ` : ''}

      <div class="total-box">
        <span class="total-value">${(data.totalCost || 0).toFixed(2)} ج</span>
        <span class="total-label">الإجمالي:</span>
      </div>

      <div class="footer">
        شكراً لزيارتكم - ننتظركم دائماً
        <div style="font-size: 11px; margin-top: 5px;">Classico System V3</div>
      </div>
      
      <div class="developer-note">تاريخ الطباعة: ${new Date().toLocaleString()} | المستخدم: ${data.processedBy || 'Admin'}</div>

      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => { window.close(); }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank', 'width=600,height=800');
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();

  // 🚀 Native Electron Print (for better system integration)
  if (window.electronAPI && window.electronAPI.send) {
    window.electronAPI.send('print-html', html);
  }
};

/**
 * Quick Print Order Bon (Kitchen/Bar Ticket)
 */
export const printOrderBon = (deviceName, orderItem) => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap');
        body { font-family: 'Cairo', sans-serif; margin: 0; padding: 5px; width: 72mm; text-align: center; }
        .title { font-size: 22px; font-weight: 900; background: #000; color: #fff; padding: 5px; margin-bottom: 10px; }
        .device { font-size: 28px; font-weight: 900; margin: 10px 0; border: 3px solid #000; display: inline-block; padding: 0 20px; }
        .order { font-size: 24px; font-weight: 700; margin-top: 15px; }
        .time { font-size: 12px; margin-top: 20px; opacity: 0.7; }
      </style>
    </head>
    <body>
      <div class="title">بون طلب</div>
      <div class="device">${deviceName}</div>
      <div class="order">${orderItem.qty}x ${orderItem.name}</div>
      <div class="time">${new Date().toLocaleTimeString('ar-EG')}</div>
      <script>
        window.onload = () => { 
          window.print(); 
          setTimeout(() => { window.close(); }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank', 'width=400,height=500');
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();

  if (window.electronAPI && window.electronAPI.send) {
    window.electronAPI.send('print-html', html);
  }
};
