import { createRouter, createWebHashHistory } from 'vue-router';
import { watch } from 'vue';
import { useAppStore } from '../stores/appStore';

// Views are lazy-loaded in the routes array

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/subscriptions', name: 'Subscriptions', component: () => import('../views/SubscriptionsView.vue') },
  { path: '/payment', name: 'Payment', component: () => import('../views/PaymentView.vue') },
  { path: '/waiting', name: 'Waiting', component: () => import('../views/WaitingView.vue') },
  { path: '/', name: 'Monitoring', component: () => import('../views/MonitoringView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/lounge', name: 'Lounge', component: () => import('../views/LoungeView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/archive', name: 'Archive', component: () => import('../views/ArchiveView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/customers', name: 'Customers', component: () => import('../views/CustomersView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/expenses', name: 'Expenses', component: () => import('../views/ExpensesView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/menu', name: 'Menu', component: () => import('../views/MenuView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/gamepad', name: 'Gamepad', component: () => import('../views/GamepadView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings/SettingsView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/multi-device', name: 'MultiDevice', component: () => import('../views/Settings/MultiDeviceView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/tournaments', name: 'Tournaments', component: () => import('../views/Tournaments/TournamentsView.vue'), meta: { requiresAuth: true, requiresSubscription: true } },
  { path: '/tournaments/register', name: 'TournamentRegister', component: () => import('../views/Tournaments/PublicRegister.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const store = useAppStore();

  // If store is still loading, wait until it finishes
  if (store.isLoading) {
    await new Promise((resolve) => {
      const unwatch = watch(
        () => store.isLoading,
        (loading) => {
          if (!loading) {
            unwatch();
            resolve();
          }
        },
        { immediate: true }
      );
    });
  }

  // 1. Check Subscription (The Gatekeeper)
  if (to.meta.requiresSubscription) {
    if (store.subscriptionStatus === 'active') {
      // Proceed normally
    } else if (store.subscriptionStatus === 'pending') {
      return next('/waiting');
    } else if (store.subscriptionStatus === 'checking') {
      // Still checking - do online check now to get definitive answer
      await store.checkSubscription();
      if (store.subscriptionStatus !== 'active') {
        if (store.subscriptionStatus === 'pending') return next('/waiting');
        return next('/subscriptions');
      }
    } else {
      return next('/subscriptions'); // expired, none, error etc.
    }
  }

  // 2. Check Auth
  if (to.meta.requiresAuth && !store.session) {
    return next('/login');
  }

  if (to.path === '/login' && store.session) {
    return next('/');
  }

  next();
});

export default router;
