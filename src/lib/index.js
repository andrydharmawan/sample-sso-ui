import store from '../store';
import uuid from 'uuid/v1';
import moment from 'moment';
import { ssoHelper } from '../helper/sso';
import { SocketService } from "../helper/socket";
import { notification, Modal } from "ant-design-vue";
import Cookies from 'js-cookie';

export function refresh() {
    store.commit("id", uuid())
}

export function isArray(data, length) {
    let result = false;
    if (data) {
        if (typeof data === "object") {
            if (Array.isArray(data)) {
                if (typeof length === "number") {
                    if (data.length > length) {
                        result = true;
                    }
                } else {
                    result = true;
                }
            }
        }
    }
    return result;
}

export var base64 = {
    isBase64: (value = "") => {
        try {
            return btoa(atob(value)) === value;
        } catch (err) {
            return false;
        }
    },
    decode: (value) => {
        return JSON.parse(atob(value));
    },
    encode: (value) => {
        return btoa(JSON.stringify(value))
    }
}

export function isSSOKey(value) {
    try{
        let result = base64.isBase64(value);
        if(result){
            const { sessionresult } = base64.decode(value) || {};
            const { statuscode, userid, ssotoken, applicationname } = sessionresult || {};

            if(!userid || !ssotoken || !applicationname || !statuscode) return false;
            else if(applicationname !== process.env.VUE_APP_NAME) return false;
        }

        return result;
    }
    catch(err){
        return false
    }
}

export var ssoUI = {
    set: (value, isNew = true) => {
        value = isNew ? value : base64.encode({ sessionresult: Object.assign(ssoUI.get(), value) });
        localStorage.setItem("auth", value)
        Cookies.set("auth", value);
    },
    get: (opt) => {
        let { key, ssokey } = opt || {};
        if(!ssokey) ssokey = Cookies.get("auth");

        if(!ssokey) return

        const { sessionresult = {} } = base64.decode(ssokey);
        
        return key ? sessionresult[key] : sessionresult;
    },    
    checkSession: async (options) => {
        const { loading = false } = options || {};
        const { userid, ssotoken, apitoken } = ssoUI.get() || {};
        
        if(userid && ssotoken && apitoken) {
            if(loading) store.commit("loading", true);
            store.commit("processSSO", true)

            const { data } = await ssoHelper.checkSession({
                userid,
                ssotoken,
                apitoken
            });

            if(loading) store.commit("loading", false);

            store.commit("processSSO", false)

            const { sessionstatus  } = data;

            if (!sessionstatus) {
                notification.info({ message: "Info", description: "Your session terminated unexpectedly" });
                setTimeout(e => ssoUI.login(name), 1000)
            }
        }
    },
    generateApiToken: async ({ next, params, name }) => {
        store.commit("loading", true);
        store.commit("processSSO", true);

        const { ssokey } = params;

        if (!isSSOKey(ssokey)) {
            notification.error({ message: "Error", description: "SSO Key not valid" });
            setTimeout(() => ssoUI.login(name), 1000)
        }

        ssoUI.set(ssokey);
        const { applicationrole, ssotoken, apitoken, applicationname, userid, statuscode, statusdesc } = ssoUI.get({ ssokey });

        if (statuscode === "0000") {
            if (ssotoken && apitoken) next("/")
            else if (!ssotoken && !apitoken) await ssoUI.login();

            if (!isArray(applicationrole, 0)) {
                store.commit("messageErrorSSO", "You don't have role in application, try to sign in");
            }
            else {
                const { rolename } = applicationrole[0];
                const { status, data, message } = await ssoHelper.generateApiToken({
                    userid,
                    applicationname,
                    rolename
                })

                store.commit("processSSO", false);

                if (status) {

                    const { apitoken } = data || {};

                    await ssoUI.set({
                        rolename,
                        apitoken
                    }, false)

                    let to = ssoUI.redirect.get();
                    store.commit("loading", false);

                    next({ name: to })
                }
                else store.commit("messageErrorSSO", message);
            }
        }
        else store.commit("messageErrorSSO", statusdesc);
        next();
    },
    login: async (to) => {
        if(to) await ssoUI.redirect.set(to);

        await ssoUI.clear();

        window.location = process.env.VUE_APP_SSO_LOGIN;
    },
    logout: async () => {
        try{
            const { userid, ssotoken, applicationname, rolename, apitoken } = ssoUI.get();

            const { data } = await ssoHelper.logout({ userid, ssotoken, applicationname, rolename, apitoken }) || {};
            const { sessionstatus } = data || {};

            return !sessionstatus;
        }
        catch(err){
            return true;
        }
    },
    clear: async () => {
        Cookies.remove("auth");
        localStorage.removeItem("auth")
    },
    redirect: {
        set: (to) => {
            if(to === "authentication") to = "home";
            Cookies.set("redirect-page", to);
        },
        get: () => {
            return Cookies.get("redirect-page");
        },
        remove: () => {
            Cookies.remove("redirect-page");
        }
    },
    storage: () => {
        const { keys } = sessionStorage || {};
        let { isactive, closedate } = Cookies.get() || {};

        if(!isactive) isactive = [];
        else isactive = JSON.parse(isactive)

        return {
            keys,
            isactive,
            closedate,
            index: isactive.findIndex(x => x.keys === keys)
        }
    },
    use: async () => {
        window.addEventListener('storage', function({ key, newValue }) {
            if(key === "auth") {
                if(newValue) refresh();
                else if(!newValue) ssoUI.login();
            }
        });

        window.onfocus = () => {
            let { keys, isactive, index } = ssoUI.storage();

            if(index !== -1) isactive[index].isactive = true;
            else isactive.push({
                keys,
                isactive: true
            })

            Cookies.set("isactive", JSON.stringify(isactive));
        }
        
        window.onunload = async () => {
            let { keys, isactive, index } = ssoUI.storage();

            if(index !== -1) isactive.splice(index, 1);
            
            Cookies.set("isactive", JSON.stringify(isactive));
            
            if(isactive.find(x => x.isactive)) return
            else {
                const closedate = moment().format("DD/MM/YYYY HH:mm:ss");
                if(ssoUI.get()) Cookies.set("closedate", closedate);
            }
        }
    },
    initialize: {
        created(){
            ssoUI.checkSession({ loading: true });
        },
        async mounted(){
            SocketService.on("logout-sso-ui", async (data) => {
                const { userid } = ssoUI.get() || {};
                if(typeof data === "object"){
                    if(data.userid === userid){
                        setTimeout(() => {
                            notification.info({ message: "Info", description: "Your user password has been changed. Your account will logout automatically in a few minutes" })
                            setTimeout(async () => {
                                store.commit("loading", true);
                                await ssoUI.logout();
                                ssoUI.clear();
                                ssoUI.login();
                            }, 5000)
                        }, 2000)
                    }
                }
            });

            let { keys = uuid(), isactive, index, closedate } = ssoUI.storage();

            sessionStorage.setItem("keys", keys);

            if(index !== -1) isactive[index].isactive = true;
            else isactive.push({
                keys,
                isactive: true
            })

            Cookies.set("isactive", JSON.stringify(isactive));

            if(closedate){
                var now  = moment().format("DD/MM/YYYY HH:mm:ss");
                var ms = moment(now, "DD/MM/YYYY HH:mm:ss").diff(moment(closedate, "DD/MM/YYYY HH:mm:ss"));
                
                const { idleTime } = store.state;
                if(ms > idleTime){
                    await ssoUI.logout();
                    ssoUI.clear();
                    ssoUI.login();
                }
            }
            
            Cookies.remove("closedate")
        },
        watch: {
            isIdle(idle){
                const { onIdle } = this;
                if(idle) onIdle();
            }
        },
        methods: {
            onIdle() {
                let { keys = uuid(), isactive, index } = ssoUI.storage();

                if(index !== -1) isactive[index].isactive = false;
                else isactive.push({
                    keys,
                    isactive: false
                })

                Cookies.set("isactive", JSON.stringify(isactive));

                if(isactive.filter(x => x.isactive).length) return
                else {
                    let secondsToGo = 5,
                        timer,
                        set = true;

                    const modal = Modal.warning({
                        title: 'You are idle',
                        content: `Your application will log out in ${secondsToGo} seconds.`,
                        closable: false,
                        onOk: () => {
                            clearInterval(timer);
                            set = false;
                        }
                    });

                    timer = setInterval(() => {
                        secondsToGo -= 1;
                        modal.update({
                            content: `Your application will log out in ${secondsToGo} seconds.`,
                        });
                    }, 1000);

                    setTimeout(async () => {
                        clearInterval(timer);
                        if(set){
                            await ssoUI.logout();
                            ssoUI.clear();
                            ssoUI.login();
                        }

                        const { onActive } = ssoUI.initialize.methods;
                        onActive();

                        modal.destroy();
                    }, secondsToGo * 1000);
                }
            },
            onActive() {
                let { keys = uuid(), isactive, index } = ssoUI.storage();

                if(index !== -1) isactive[index].isactive = true;
                else isactive.push({
                    keys,
                    isactive: true
                })

                Cookies.set("isactive", JSON.stringify(isactive));
                Cookies.remove("closedate");
            }
        }
    }
}

export var identity = () => {
    const { userid = "public", ssotoken = uuid() } = ssoUI.get() || {};
    
    return {
        apptxnid: uuid(),
        reqtxnid: uuid(),
        reqdate: moment().format("YYYY-MM-DD HH:mm:ss"),
        appid: "application-user-mgmt",
        userid,
        signature: ssotoken,
        seqno: "1"
    }
}