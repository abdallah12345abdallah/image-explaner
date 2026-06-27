import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import HomeDashboard from '../views/HomeDashboard.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
