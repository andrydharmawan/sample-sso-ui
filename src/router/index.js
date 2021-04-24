import { createRouter, createWebHistory } from 'vue-router'
import { ssoUI } from "../lib"
import store from "../store"
import Cookies from 'js-cookie';

const routes = [
    {
        path: '/authentication/:ssokey',
        name: 'authentication',
        meta: {
            title: "Authentication"
        }
    },
    {
        path: '/',
        name: 'home',
        meta: {
            title: "Home"
        },
        component: () => import('../views/Home.vue')
    },
    {
        path: '/about',
        name: 'about',
        meta: {
            title: "About"
        },
        component: () => import('../views/About.vue')
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(async ({ name, params, meta }, from, next) => {
    document.title = `${meta.title} | Sample Project`;
    
    if (name === "authentication") await ssoUI.generateApiToken({ next, params, name });
    else {
        const { ssotoken, apitoken } = ssoUI.get() || {};
        if (ssotoken && apitoken) {
            if(!store.state.processSSO) ssoUI.checkSession();

            next();
        }
        else if(ssotoken && !apitoken) next(`/authentication/${Cookies.get("auth")}`)
        else await ssoUI.login(name);
    }
});

export default router
