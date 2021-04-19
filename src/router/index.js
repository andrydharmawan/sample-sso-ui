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
        path: '/authentication',
        name: 'authentication-without-key'
    },
    {
        path: '/',
        name: 'home',
        meta: {
            title: "Home",
            breadcrumb: [{
                title: "Home"
            }]
        },
        component: () => import('../views/Home.vue')
    },
    {
        path: '/about',
        name: 'about',
        meta: {
            title: "About",
            breadcrumb: [{
                title: "Home",
                to: "/"
            }, {
                title: "About"
            }]
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
            setTimeout(e => ssoUI.login(name), 1000)
        }
        
        ssoUI.set(ssokey);
        
        next(`/authentication`)
    }
    else if (name === "authentication-without-key") {
        await ssoUI.generateApiToken({ next })
        next();
    }
    else {
        const { ssotoken, apitoken } = await ssoUI.get() || {};
        if (ssotoken && apitoken) {
            if(!store.state.processSSO) ssoUI.checkSession().then(isValid => {
                if (!isValid) {
                    notification.info({ message: "Info", description: "Your session terminated unexpectedly" });
                    setTimeout(e => ssoUI.login(name), 1000)
                }
            });

            next();
        }
        else if (ssotoken && !apitoken) next(`/authentication`)
        else await ssoUI.login(name);
    }
});

export default router
