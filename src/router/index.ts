import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import BooksView from '@/views/BooksView.vue'
import LibraryView from '@/views/LibraryView.vue'
import NovelReaderView from '@/views/NovelReaderView.vue'
import PromotionApprovalsView from '@/views/PromotionApprovalsView.vue'
import ForbiddenView from '@/views/ForbiddenView.vue'
import pinia from '@/store'
import { useAuthStore } from '@/store/auth'

/* eslint-disable no-unused-vars */
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
  }
}
/* eslint-enable no-unused-vars */

const routes = [
  { path: '/', redirect: '/books' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/books', name: 'Books', component: BooksView, meta: { requiresAuth: true } },
  { path: '/library', name: 'Library', component: LibraryView, meta: { requiresAuth: true } },
  { path: '/books/:novelId', name: 'NovelReader', component: NovelReaderView, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  {
    path: '/promotions',
    name: 'PromotionApprovals',
    component: PromotionApprovalsView,
    meta: { requiresAuth: true, roles: ['ROLE_ADMIN'] }
  },
  { path: '/forbidden', name: 'Forbidden', component: ForbiddenView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'Login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.meta.roles?.length && !to.meta.roles.some((role) => authStore.hasRole(role))) {
    return { name: 'Forbidden' }
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    return { name: 'Books' }
  }

  return true
})

export default router
