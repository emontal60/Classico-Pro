import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    dialog: {
      show: false,
      title: '',
      message: '',
      type: 'info', // info, success, warning, danger
      confirmText: 'موافق',
      cancelText: 'إلغاء',
      onConfirm: null,
      onCancel: null,
      showInput: false,
      inputValue: '',
      inputPlaceholder: '',
      suggestions: []
    },
    fontSize: localStorage.getItem('classico_font_size') || '100',
    theme: localStorage.getItem('classico_theme') || 'dark',
    splashShow: true,
    celebration: {
      show: false,
      message: '',
      plan: ''
    },
    updateInfo: {
      available: false,
      downloaded: false,
      progress: 0
    },
    updateToast: {
      show: false,
      version: ''
    }
  }),

  actions: {
    // Helper: converts % string (e.g. '110') to exact px value based on 16px base
    _sizeToPx(size) {
      const pct = parseFloat(size) || 100;
      return (pct / 100) * 16; // 16px is the browser standard base font size
    },
    setFontSize(size) {
      this.fontSize = size;
      localStorage.setItem('classico_font_size', size);
      const px = this._sizeToPx(size);
      // Use px instead of % so color-scheme changes cannot affect the base
      document.documentElement.style.setProperty('font-size', px + 'px', 'important');
      // Double rAF to ensure this overrides any post-paint browser recalculation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty('font-size', px + 'px', 'important');
        });
      });
    },
    setTheme(theme) {
      this.theme = theme;
      localStorage.setItem('classico_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
      // ✅ Re-apply font size after DOM update to prevent zoom-out effect
      // Use px units (not %) so color-scheme change cannot affect the base value
      const currentSize = this.fontSize || localStorage.getItem('classico_font_size') || '100';
      const px = this._sizeToPx(currentSize);
      document.documentElement.style.setProperty('font-size', px + 'px', 'important');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty('font-size', px + 'px', 'important');
        });
      });
      // ✅ Notify Electron to update titleBarOverlay colors for the new theme
      if (window.electronAPI && typeof window.electronAPI.send === 'function') {
        window.electronAPI.send('theme-changed', theme);
      }
    },
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    },
    // Toast Notifications
    showToast(message, type = 'success', duration = 3000) {
      const id = Date.now();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, duration);
    },

    // Confirm Dialog
    confirm(options) {
      return new Promise((resolve) => {
        this.dialog = {
          show: true,
          title: options.title || 'تنبيه',
          message: options.message || '',
          type: options.type || 'info',
          confirmText: options.confirmText || 'موافق',
          cancelText: options.cancelText || 'إلغاء',
          showInput: options.showInput || false,
          inputValue: options.inputValue || '',
          inputPlaceholder: options.inputPlaceholder || '',
          suggestions: options.suggestions || [],
          onConfirm: () => {
            const val = this.dialog.inputValue;
            this.closeDialog();
            resolve(options.showInput ? val : true);
          },
          onCancel: () => {
            this.closeDialog();
            resolve(false);
          }
        };
      });
    },

    // Simple Alert
    alert(message, title = 'تنبيه', type = 'info') {
      return this.confirm({ message, title, type, cancelText: '' });
    },

    closeDialog() {
      this.dialog.show = false;
    },

    triggerSplash(duration = 1000) {
      this.splashShow = true;
      setTimeout(() => {
        this.splashShow = false;
      }, duration);
    },

    showCelebration(message, plan = '') {
      this.celebration = { show: true, message, plan };
      setTimeout(() => {
        this.celebration.show = false;
      }, 10000);
    }
  }
});
