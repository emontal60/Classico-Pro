import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Global Styles (copied from old project)
import './assets/css/variables.css';
import './assets/css/layout.css';
import './assets/css/components.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Mount immediately so the splash screen appears instantly (no black screen)
// Then initialize the store in the background
import { useAppStore } from './stores/appStore';
const store = useAppStore();

app.mount('#app');
store.init();
