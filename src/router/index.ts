import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/authGuard';
import { verificationGuard } from './guards/verificationGuard';

const router = createRouter({
  history: createWebHistory('/cohab/'),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/Login.vue'),
      meta: { requiresAuth: false, requiresVerification: false }
    },
    {
      path: '/registration',
      name: 'Registration',
      component: () => import('@/views/Registration/Registration.vue'),
      meta: { requiresAuth: false, requiresVerification: false }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home/Home.vue'),
      meta: { requiresAuth: true, requiresVerification: true }
    },
    {
      path: '/home/family/:familyId/settings',
      name: 'FamilySettingsPage',
      component: () => import('@/views/FamilySettings/FamilySettings.vue'),
      meta: { requiresAuth: true, requiresVerification: true  }
    },
    {
      path: '/verification',
      name: 'Verification',
      component: () => import('@/views/Verification/Verification.vue'),
      meta: { requiresAuth: true, requiresVerification: false}
    }
  ],
})

router.beforeEach(authGuard);
router.beforeEach(verificationGuard);
export default router