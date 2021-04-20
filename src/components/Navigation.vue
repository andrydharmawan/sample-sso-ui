<template>
    <a-layout-header class="bg-white p-0 pr-2">
        <a-dropdown :trigger="['click']" class="float-left">
            <fieldset class="p-0 m-0" style="margin-top: -7px !important;">
                <legend class="p-0 m-0 pl-3" style="font-size:12px;height: 14px;">Role :</legend>
                <a-button :loading="loading" class="ant-dropdown-link" type="link" @click="e => e.preventDefault()" color="#108ee9">{{text(rolename)}} <DownCircleOutlined class="icon-role" /></a-button>
            </fieldset>
            <template #overlay>
                <a-menu>
                    <a-menu-item @click="e => choosed(app)" v-for="(app) in applicationrole" :key="app.rolename">
                        <CheckCircleOutlined v-if="rolename === app.rolename" class="icon-list-role text-green float-left" />
                        <SwapOutlined v-else class="icon-list-role text-blue float-left" />
                        {{text(app.rolename)}}
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
        <a-button @click="logout" class="shadow-none border-0 float-right mt-3">
            <PoweroffOutlined />
            Logout
        </a-button>
    </a-layout-header>
</template>
<script>
import {
    PoweroffOutlined,
    DownCircleOutlined,
    SwapOutlined,
    CheckCircleOutlined
} from '@ant-design/icons-vue';
import { Modal, notification } from 'ant-design-vue';
import { ssoUI, refresh } from '../lib';
import { ssoHelper } from "../helper/sso";

export default {
    components: {
        PoweroffOutlined,
        DownCircleOutlined,
        SwapOutlined,
        CheckCircleOutlined
    },
    data(){
        
        const { rolename, applicationrole } = ssoUI.get() || {};
        
        return {
            rolename,
            applicationrole,
            loading: false
        };
    },
    methods: {
        async choosed({ rolename }){
            const ssoData = ssoUI.get() || {};

            const { applicationname, userid } = ssoData;

            this.loading = true;
            if(ssoData.apitoken){
                await ssoHelper.revoke({
                    applicationname,
                    rolename: ssoData.rolename,
                    apitoken: ssoData.apitoken
                })
            }

            ssoHelper.generateApiToken({
                userid,
                applicationname,
                rolename
            }, async (status, data = {}, description) => {
                this.loading = false;
                if(status){
                    const { apitoken } = data;

                    await ssoUI.set({
                        rolename,
                        apitoken
                    }, false)

                    refresh()
                }
                else notification.error({ message: "Error", description });
            })
        },
        text(value){
            if(value.includes(".")) value = value.split(".")[1];
            return value;
        },
        logout(){
            Modal.confirm({
                title: "Confirm",
                content: "Are you sure want logout?",
                okText: "Yes",
                cancelText: "No",
                onOk: async () => {
                    await ssoUI.logout();
                    ssoUI.clear();
                    ssoUI.login();
                }
            });
        }
    }
}
</script>

<style>
    .item {
        box-sizing: border-box;
        padding: 10px 20px 10px 10px;
        margin-bottom: 10px;
        border: 1.8px solid #e6e6e6;
        border-radius: 6px;
        cursor: pointer;
    }
    .item:hover {
        background-color: aliceblue;
    }
    .item:active {
        background-color:#e6e6e6;
    }
    .icon-list-role{
        font-size:15px;
        float:left;
        margin-top:5px !important;
    }
    .text-green{
        color: #00a65a !important;
    }
    .text-blue{
        color: #0073b7 !important;
    }
    .icon-role{
        margin-top: 2px !important;
        float: right;
        margin-left:5px !important;
    }
</style>