import { createRouter, createWebHistory } from 'vue-router'
import { isBase64, ssoUI } from "../lib"
import store from "../store"
import { notification } from "ant-design-vue";

const routes = [
    {
        path: '/authentication/:ssokey',
        name: 'authentication'
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
    if (name === "authentication") {
        const { ssokey } = params;
        if (!isBase64(ssokey)) {
            notification.error({ message: "Error", description: "SSO Key not valid" });
            setTimeout(() => ssoUI.login(name), 1000)
        }
        
        await ssoUI.generateApiToken({ next, ssokey })
    }
    else {
        const { ssotoken, apitoken } = ssoUI.get() || {};
        if (ssotoken && apitoken) {
            if(!store.state.processSSO) ssoUI.checkSession();

            document.title = `${meta.title} | Sample Project`
            next();
        }
        else await ssoUI.login(name);
    }
});

export default router
