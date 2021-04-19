<template>
    <div style="width:100%;text-align: center;padding-top:calc(40vh)">
        <img src="../assets/img/logo-ui.png" width="22%" style="min-width:250px"/>
    </div>
    <a-row>
        <a-col class="text-center">
            <a-spin :spinning="!messageErrorSSO" class="mt-3" :indicator="indicator"/>
            <a-alert type="error" v-show="messageErrorSSO" :message="messageErrorSSO" showIcon style="width:400px;margin:0px auto;" class="mt-3"/>
            <a-button 
                class="mt-3" 
                v-show="messageErrorSSO" 
                icon="reload" 
            >
                re-Login
            </a-button>
        </a-col>
    </a-row>
</template>
<script>
import Vue from "vue";
import { Icon } from 'ant-design-vue';
import { mapState } from "vuex";
Vue.use(Icon);

export default {
    computed: mapState(["messageErrorSSO", "loading"]),
    data(){
        return {
            indicator: <a-icon slot="indicator" type="loading" style="font-size: 30px;color:#f6db00;" spin />
        }
    }
}
</script>
