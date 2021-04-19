import { createRouter, createWebHistory } from 'vue-router'

import { isArray, isBase64, ssoUI } from "../lib"
import { ssoHelper } from "../helper/sso"
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
        component: () => import('../views/Home.vue')
    },
    {
        path: '/about',
        name: 'about',
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
        const { applicationrole, ssotoken, apitoken, applicationname, userid, statuscode, statusdesc } = ssoUI.get();

        store.commit("loading", true);

        if (!userid) ssoUI.login(name);

        if (statuscode === "0000") {
            if (ssotoken && apitoken) next("/")
            else if (!ssotoken && !apitoken) await ssoUI.login();

            if (!isArray(applicationrole, 0)) {
                store.commit("messageErrorSSO", "You don't have role in application, try to sign in");
            }
            else {
                const { rolename } = applicationrole[0];
                const { status, data = {}, message } = await ssoHelper.generateApiToken({
                    userid,
                    applicationname,
                    rolename
                })

                if (status) {

                    const { apitoken } = data;

                    await ssoUI.set({
                        rolename,
                        apitoken
                    }, false)

                    let to = ssoUI.redirectGet();

                    store.commit("loading", false);

                    next({ name: to })
                }
                else store.commit("messageErrorSSO", message);
            }
        }
        else store.commit("messageErrorSSO", statusdesc);

        next();
    }
    else {
        const { ssotoken, apitoken } = await ssoUI.get() || {};
        if (ssotoken && apitoken) {
            ssoUI.checkSession().then(isValid => {
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
