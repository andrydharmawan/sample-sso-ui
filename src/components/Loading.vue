<template>
    <div style="width:100%;text-align: center;padding-top:calc(40vh)">
        <img src="../assets/img/logo-ui.png" width="22%" style="min-width:250px"/>
    </div>
    <div class="text-center">
        <loading-outlined v-if="processSSO" type="loading" class="mt-2" style="font-size: 30px;color:#f6db00;" />
        <a-alert type="error" v-show="!processSSO && messageErrorSSO" :message="messageErrorSSO" showIcon style="width:400px;margin:0px auto;" class="mt-3"/>
        <a-button 
            :loading="btnLoading"
            class="mt-3" 
            v-show="!processSSO && messageErrorSSO" 
            @click="relogin"
        >
            re-Login
        </a-button>
    </div>
</template>
<script>
import { LoadingOutlined } from '@ant-design/icons-vue';
import { mapState } from "vuex";
import { ssoUI } from '../lib';

export default {
    components: {
        LoadingOutlined
    },
    data(){
        return {
            btnLoading: false
        }
    },
    computed: mapState(["messageErrorSSO", "loading", "processSSO"]),
    methods: {
        async relogin(){
            this.btnLoading = true;
            await ssoUI.logout();
            ssoUI.clear();
            ssoUI.login();
        }
    }
}

</script>