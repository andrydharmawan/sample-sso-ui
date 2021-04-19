import store from '../store';
import uuid from 'uuid/v1';
import moment from 'moment';
import { ssoHelper } from '../helper/sso';

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

export function distinct(data, field) {
    return Array.from(new Set(data.map(s => s[field]))).map(value => {
        return data.find(x => x[field] === value)
    });
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

                    let to = ssoUI.redirectGet();

                    store.commit("loading", false);
                    store.commit("processSSO", false);

                    next({ name: to })
                }
                else store.commit("messageErrorSSO", message);
            }
        }
        else store.commit("messageErrorSSO", statusdesc);
    },
    redirectSet: (to) => {
        if(to === "authentication-without-key" || to === "authentication") to = "home";
        sessionStorage.setItem("redirect-page", to);
    },
    redirectGet: () => {
        return sessionStorage.getItem("redirect-page");
    },
    redirectRemove: () => {
        sessionStorage.removeItem("redirect-page");
    },
    clear: async () => {
        localStorage.removeItem("auth");
    },
    login: async (to) => {
        if(to) await ssoUI.redirectSet(to);
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