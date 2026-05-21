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
      inputPlaceholder: ''
    },
    fontSize: localStorage.getItem('classico_font_size') || '100',
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
    setFontSize(size) {
      this.fontSize = size;
      localStorage.setItem('classico_font_size', size);
      document.documentElement.style.fontSize = size + '%';
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
