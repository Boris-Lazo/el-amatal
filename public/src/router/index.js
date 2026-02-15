import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '@/vistas/Inicio.vue';

// Lazy loading para optimizar el tamaño del paquete inicial
const Eventos = () => import('@/vistas/Eventos.vue');
const Documentos = () => import('@/vistas/Documentos.vue');
const Login = () => import('@/vistas/Login.vue');
const Admin = () => import('@/vistas/Admin.vue');
const RecuperarClave = () => import('@/vistas/RecuperarClave.vue');

const routes = [
  { path: '/', component: Inicio },
  { path: '/eventos', component: Eventos },
  { path: '/documentos', component: Documentos },
  { path: '/entrar', component: Login },
  { path: '/admin', component: Admin, meta: { requiereAutenticacion: true, ocultarNav: true } },
  { path: '/recuperar', component: RecuperarClave },
  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiereAutenticacion && !token) {
    next('/entrar');
  } else {
    next();
  }
});

export default router;
