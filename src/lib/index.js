import store from '../store';
import uuid from 'uuid/v1';
import moment from 'moment';
import { ssoHelper } from '../helper/sso';
import { SocketService } from "../helper/socket";
import { notification, Modal } from "ant-design-vue";

export function refresh() {
    store.commit("id", uuid())
}

export function jsonCopy(data) {
    return data ? JSON.parse(JSON.stringify(data)) : null;
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
    decode: (value) => {
        return JSON.parse(atob(value));
    },
    encode: (value) => {
        return btoa(JSON.stringify(value))
    }
}

export function isBase64(str) {
    if (str ==='' || str.trim() ===''){ return false; }
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

export var ssoUI = {
    set: async (value, isBase64 = true) => {
        localStorage.setItem("auth", isBase64 ? value : base64.encode({ sessionresult: Object.assign(ssoUI.get(), value) }));
    },
    get: (key) => {
        let ssokey = localStorage.getItem("auth");

        if(!ssokey) return;

        const { sessionresult = {} } = base64.decode(ssokey);

        const { userid, ssotoken, applicationname, applicationrole } = sessionresult;
        if(!isArray(applicationrole, 0) || !userid || !ssotoken || !applicationname) return;

        if(key) return sessionresult[key];
        else return sessionresult;
    },    
    checkSession: async (options) => {
        const { loading = false } = options || {};
        try{
            const { userid, ssotoken, apitoken, applicationrole } = ssoUI.get();
            if(!isArray(applicationrole, 0)){
                store.commit("messageErrorSSO", "You don't have role in application, try to sign in");
                return false
            }

            if(!userid || !ssotoken){
                store.commit("messageErrorSSO", "Something went wrong, try to sign in");
                return false
            }
            else {
                if(loading) store.commit("loading", true);
                store.commit("processSSO", true)

                const { data, message, status } = await ssoHelper.checkSession({
                    userid,
                    ssotoken,
                    apitoken
                });

                if(loading) store.commit("loading", false);
                store.commit("processSSO", false)

                const { sessionstatus  } = data;
    
                if(!sessionstatus && !status && message) store.commit("messageErrorSSO", message);
    
                return sessionstatus;
            }
        }
        catch(err){
            return await ssoUI.checkSession(options);
        }
    },
    generateApiToken: async ({ next }) => {
        const { applicationrole, ssotoken, apitoken, applicationname, userid, statuscode, statusdesc } = ssoUI.get();

        store.commit("loading", true);
        store.commit("processSSO", true);

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

                    let to = ssoUI.redirect.get();

                    store.commit("loading", false);
                    store.commit("processSSO", false);

                    next({ name: to })
                }
                else store.commit("messageErrorSSO", message);
            }
        }
        else store.commit("messageErrorSSO", statusdesc);
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
        localStorage.removeItem("auth");
    },
    redirect: {
        set: (to) => {
            if(to === "authentication-without-key" || to === "authentication") to = "home";
            sessionStorage.setItem("redirect-page", to);
        },
        get: () => {
            return sessionStorage.getItem("redirect-page");
        },
        remove: () => {
            sessionStorage.removeItem("redirect-page");
        }
    },
    storage: () => {
        const { keys } = sessionStorage || {};
        let { isactive, closedate } = localStorage || {};

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

            localStorage.setItem("isactive", JSON.stringify(isactive));
        }
        
        window.onunload = async () => {
            let { keys, isactive, index } = ssoUI.storage();

            if(index !== -1) isactive.splice(index, 1);
            
            localStorage.setItem("isactive", JSON.stringify(isactive));
            
            if(isactive.find(x => x.isactive)) return
            else {
                const closedate = moment().format("DD/MM/YYYY HH:mm:ss");
                if(ssoUI.get()) localStorage.setItem("closedate", closedate);
            }
        }
    },
    initialize: {
        created(){
            const { ssotoken, apitoken, applicationrole } = ssoUI.get() || {};
            if(ssotoken && apitoken && isArray(applicationrole, 0)){
                ssoUI.checkSession({ loading: true }).then(isValid => {     
                    if(!isValid) { 
                        notification.info({ message: "Info", description: "Your session terminated unexpectedly" });
                        setTimeout(ssoUI.login, 1000)
                    } 
                });
            }
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

            localStorage.setItem("isactive", JSON.stringify(isactive));

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
            
            localStorage.removeItem("closedate")
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

                localStorage.setItem("isactive", JSON.stringify(isactive));

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

                localStorage.setItem("isactive", JSON.stringify(isactive));
                localStorage.removeItem("closedate");
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