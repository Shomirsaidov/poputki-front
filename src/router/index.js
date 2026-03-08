import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RideSeatSelectionView from '../views/RideSeatSelectionView.vue';
import BusAdminView from '../views/BusAdminView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        // ... other routes
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue'),
            meta: { hideBottomNav: true }
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        // always scroll to top
        return { top: 0 }
    }
})

router.beforeEach(async (to, from, next) => {
    // 1. Initialize Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
    }

    const user = JSON.parse(localStorage.getItem('user'));

    // 2. Auto-login or Sync via Telegram if data is available
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser && (!user || !user.telegram_id)) {
        try {
            // Sync with backend to ensure telegram_id is saved
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/telegram-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: tgUser.id,
                    first_name: tgUser.first_name,
                    last_name: tgUser.last_name,
                    username: tgUser.username,
                    photo_url: tgUser.photo_url
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                const updatedUser = data.user;

                // Handle forced redirect to auth if phone is missing
                if (updatedUser.isNew || !updatedUser.phone) {
                    if (to.name !== 'auth' || to.query.tg_complete !== '1') {
                        return next({ name: 'auth', query: { tg_complete: 1 } });
                    }
                    return next();
                }

                // If they were trying to go to auth but are now fully synced, redirect to home
                if (to.name === 'auth') {
                    return next({ name: 'home' });
                }
            }
        } catch (error) {
            console.error("Telegram Sync/Login Failed:", error);
        }
    }

    // 3. Standard Navigation Guard
    const isAuthenticated = !!localStorage.getItem('token');

    if (to.name !== 'auth' && to.name !== 'admin' && to.name !== 'bus-admin' && !isAuthenticated) {
        next({ name: 'auth' });
    } else {
        next();
    }
});

export default router
