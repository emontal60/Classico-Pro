import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '../stores/appStore';

// Views
import LoginView from '../views/LoginView.vue';
import MonitoringView from '../views/MonitoringView.vue';
import LoungeView from '../views/LoungeView.vue';
import ArchiveView from '../views/ArchiveView.vue';
import CustomersView from '../views/CustomersView.vue';
import ExpensesView from '../views/ExpensesView.vue';
import MenuView from '../views/MenuView.vue';
import SettingsView from '../views/Settings/SettingsView.vue';
import SubscriptionsView from '../views/SubscriptionsView.vue';
import PaymentView from '../views/PaymentView.vue';
import WaitingView from '../views/WaitingView.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/subscriptions', name: 'Subscriptions', component: SubscriptionsView },
  { path: '/payment', name: 'Payment', component: PaymentView },
  { path: '/waiting', name: 'Waiting', component: WaitingView },
  { path: '/', name: 'Monitoring', component: MonitoringView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/lounge', name: 'Lounge', component: LoungeView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/archive', name: 'Archive', component: ArchiveView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/customers', name: 'Customers', component: CustomersView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/expenses', name: 'Expenses', component: ExpensesView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/menu', name: 'Menu', component: MenuView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/settings', name: 'Settings', component: SettingsView, meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/multi-device', name: 'MultiDevice', component: () => import('../views/Settings/MultiDeviceView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const store = useAppStore();

  // CRITICAL: Await store initialization on every route change (handles refresh)
  if (store.isLoading) {
    await store.init();
  }

  // 1. Check Subscription First (The Gatekeeper)
  if (to.meta.requiresSubscription) {
    // If status is still 'checking', wait for store to finish or trigger a check
    if (store.subscriptionStatus === 'checking') {
      await store.checkSubscription();
    }

    if (store.subscriptionStatus === 'active') {
      // Proceed normally
    } else if (store.subscriptionStatus === 'pending') {
      return next('/waiting');
    } else {
      return next('/subscriptions'); // Fail-secure: redirect all expired, none, error or other statuses
    }
  }

  // 2. Check Auth
  if (to.meta.requiresAuth && !store.session) {
    if (store.isLoading) return; // Wait for loading to finish
    return next('/login');
  }

  if (to.path === '/login' && store.session) {
    return next('/');
  }

  next();
});

export default router;
