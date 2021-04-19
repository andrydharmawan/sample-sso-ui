<template>
    <a-layout-header class="bg-white p-0 text-right pr-3">
        <a-dropdown :trigger="['click']" class="p-1 pl-3 pr-3">
            <a-tag class="ant-dropdown-link" @click="e => e.preventDefault()" color="#108ee9">{{text(rolename)}} <DownOutlined /></a-tag>
            <template #overlay>
                <a-menu>
                    <a-menu-item @click="e => choosed(app)" v-for="(app, index) in applicationrole" :key="app.rolename">
                        <CheckCircleOutlined v-if="rolename === app.rolename" class="icon-role text-green" />
                        <SwapOutlined v-else class="icon-role text-blue" />
                        {{text(app.rolename)}}
                        <hr class="m-0 p-0 mt-2" v-show="index < applicationrole.length - 1"/>
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
        <a-button @click="logout" class="border-0">
            <PoweroffOutlined />
            Logout
        </a-button>
    </a-layout-header>
</template>
<script>
import {
    PoweroffOutlined,
    DownOutlined,
    SwapOutlined,
    CheckCircleOutlined
} from '@ant-design/icons-vue';
import { Modal, notification } from 'ant-design-vue';
import { ssoUI, refresh } from '../lib';
import { ssoHelper } from "../helper/sso";

export default {
    components: {
        PoweroffOutlined,
        DownOutlined,
        SwapOutlined,
        CheckCircleOutlined
    },
    data(){
        
        const { userid, rolename, applicationrole } = ssoUI.get() || {};
        
        return {
            userid,
            rolename,
            applicationrole,
            menu: [],
            spinning: false,
            options: {
                height: "100vh",
                size: 0
            }
        };
    },
    methods: {
        async choosed({ rolename }){
            const ssoData = ssoUI.get() || {};

            const { applicationname, userid } = ssoData;

            this.spinning = true;

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
                this.spinning = false;

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
    .icon-role{
        font-size:15px;
        float:left;
        margin-top:3px;
    }
    .text-green{
        color: #00a65a !important;
    }
    .text-blue{
        color: #0073b7 !important;
    }
</style>