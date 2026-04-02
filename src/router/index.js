import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home/index.vue'),
  },
  {
    path: '/mosque',
    name: 'mosque',
    component: () => import('@/pages/MosqueFinder/index.vue'),
  },
  {
    path: '/food',
    name: 'food',
    component: () => import('@/pages/HalalFood/index.vue'),
  },
  {
    path: '/prayer',
    name: 'prayer',
    component: () => import('@/pages/PrayerTimes/index.vue'),
  },
  {
    path: '/zikir',
    name: 'zikir',
    component: () => import('@/pages/Zikir/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
