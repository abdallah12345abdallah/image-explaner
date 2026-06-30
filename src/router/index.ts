import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import HomeDashboard from '../views/HomeDashboard.vue';
import { authReady, isLoggedIn } from '../stores/auth';

// Pages reachable without being logged in.
const PUBLIC_ROUTES = ['Login', 'Signup', 'ForgotPassword', 'Privacy'];

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/AuthPage.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/AuthPage.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/AuthPage.vue'),
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/PrivacyPolicyPage.vue'),
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/home' },
      { path: 'home', name: 'Home', component: HomeDashboard },
      { path: 'scan', name: 'Scan', component: () => import('../views/ScanPage.vue') },
      { path: 'reminders', name: 'Reminders', component: () => import('../views/AppointmentsPage.vue') },
      { path: 'history', name: 'History', component: () => import('../views/HistoryPage.vue') },
    ],
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultPage.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsPage.vue'),
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/AccountPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Auth guard: wait until the session is restored, then gate access.
// - logged out + private page  → send to /login
// - logged in  + auth page     → send to /tabs/home
router.beforeEach(async (to) => {
  await authReady;
  const onPublic = PUBLIC_ROUTES.includes(to.name as string);
  if (!isLoggedIn() && !onPublic) {
    return { name: 'Login' };
  }
  // Don't bounce a logged-in user off the Privacy page (they may open it from
  // Settings); only redirect away from the login/signup/forgot screens.
  if (isLoggedIn() && onPublic && to.name !== 'Privacy') {
    return { path: '/tabs/home' };
  }
  return true;
});

export default router;
