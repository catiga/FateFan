import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import Page404Layout from '../layouts/Page404Layout.vue'

import RouteViewComponent from '../layouts/RouterBypass.vue'

import { useGlobalStore } from '../stores/global-store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/admin',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/ff/dashboard/Index.vue'),
      },
      {
        name: 'train',
        path: 'train',
        component: RouteViewComponent,
        children: [
          {
            name: 'train-data',
            path: 'data',
            component: () => import('../pages/admin/ff/train/Index.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Charts',
            },
          },
          {
            name: 'train-setting-character',
            path: 'character',
            component: () => import('../pages/admin/ff/train/Character.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Charts',
            },
          },
          {
            name: 'train-adjust',
            path: 'adjust',
            component: () => import('../pages/admin/ff/train/Lists.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Charts',
            },
          },
          {
            name: 'train-mys-catalog',
            path: 'catalog',
            component: () => import('../pages/admin/ff/train/Catalog.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Charts',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/login/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/signup/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/recover-password/RecoverPassword.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    path: '/404',
    component: Page404Layout,
    children: [
      {
        name: 'not-found-advanced',
        path: 'not-found-advanced',
        component: () => import('../pages/404-pages/VaPageNotFoundSearch.vue'),
      },
      {
        name: 'not-found-simple',
        path: 'not-found-simple',
        component: () => import('../pages/404-pages/VaPageNotFoundSimple.vue'),
      },
      {
        name: 'not-found-custom',
        path: 'not-found-custom',
        component: () => import('../pages/404-pages/VaPageNotFoundCustom.vue'),
      },
      {
        name: 'not-found-large-text',
        path: '/pages/not-found-large-text',
        component: () => import('../pages/404-pages/VaPageNotFoundLargeText.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      document.querySelector('.app-layout__page')?.scrollTo(0, 0)
    }
  },
  routes,
})

router.beforeEach((to, from, next) => {
  const globalStore = useGlobalStore()

  const isAuthenticated = globalStore.$state.loginAdmin // 从某处获取认证状态

  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated?.userToken) {
    next('/auth/login') // 重定向到登录页面
  } else {
    next() // 继续到目标路由
  }
})

export default router
