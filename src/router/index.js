import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import pinia from '@/store';
import { useAuthStore } from '@/store/auth';

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const authStore = useAuthStore(pinia);

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return {
            name: 'Login',
            query: {
                redirect: to.fullPath,
            },
        };
    }

    if (to.name === 'Login' && authStore.isAuthenticated) {
        return { name: 'Dashboard' };
    }

    return true;
});

export default router;
