import { createRouter, createWebHistory } from "vue-router";
import SignInComponent from "../iam/pages/sign-in.component.vue";
import SignUpComponent from "../iam/pages/sign-up.component.vue";
import { authenticationGuard } from "../iam/services/authentication.guard.js";
import { authorizationGuard } from "../iam/services/authentication.authorization.js";

export function createAppRouter() {
    const router = createRouter({
        history: createWebHistory(),
        routes: [
            {   
                path: '/home', 
                name: 'home', 
                component: () => import('../home/pages/home.component.vue'), 
                meta: { 
                    title: 'Home',
                    requiresAuth: true
                }
            },
            {
                path: '/headquarters',
                name: 'reservation',
                component: () => import('@/booking/pages/headquarter-principal.vue'),
                meta: {
                    title: 'Reservas',
                    requiresAuth: true,
                }
            },
            {
                path: '/headquarters/:id/tables',
                name: 'headquarter-tables',
                component: () => import('@/booking/pages/headquarter-tables.vue'),
                meta: {
                    title: 'Mesas de la Sede',
                    requiresAuth: true,
                }
            },
            { 
                path: '/sign-in', 
                name: 'sign-in', 
                component: SignInComponent, 
                meta: { title: 'Sign In' }
            },
            { 
                path: '/sign-up', 
                name: 'sign-up', 
                component: SignUpComponent, 
                meta: { title: 'Sign Up' }
            },
            { 
                path: '/access-denied', 
                name: 'access-denied',
                component: () => import('../public/pages/access-denied.component.vue'),
                meta: { title: 'Acceso Denegado' }
            },
            { 
                path: '/', 
                redirect: '/sign-in' 
            }
        ]
    });

    // Configurar los guards de forma sincrónica
    router.beforeEach((to, from, next) => {
        // Actualizar el título
        let baseTitle = 'Tavolo';
        document.title = `${baseTitle} | ${to.meta.title || 'App'}`;
        
        // Primero verificar autenticación
        authenticationGuard(to, from, (guardNext) => {
            if (guardNext && typeof guardNext === 'object') {
                // Si el guard de autenticación redirige, respetarlo
                return next(guardNext);
            }
            
            // Después verificar autorización (roles)
            authorizationGuard(to, from, next);
        });
    });

    return router;
}