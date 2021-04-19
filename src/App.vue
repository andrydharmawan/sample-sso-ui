<template>
    <layout v-if="!loading && !messageErrorSSO" />
    <loading v-else />
</template>
<script>
import { mapState } from "vuex";
import { Loading } from "./components";
import Layout from "./layouts"
import { ssoUI, isArray } from "./lib";
import { notification } from "ant-design-vue";
import store from "./store";
import { SocketService } from "./helper/socket";

export default {
    components: {
        Loading,
        Layout
    },
    computed: mapState(["messageErrorSSO", "loading"]),
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
    },
    async created() {
        const { ssotoken, apitoken, applicationrole } = await ssoUI.get() || {};
        if(ssotoken && apitoken && isArray(applicationrole, 0)){
            ssoUI.checkSession({ loading: true }).then(isValid => {     
                if(!isValid) { 
                    notification.info({ message: "Info", description: "Your session terminated unexpectedly" });
                    setTimeout(ssoUI.login, 1000)
                } 
            });
        }
    }
}
</script>
