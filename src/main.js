import { createApp } from "vue"
import Antd from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import "./registerServiceWorker"
import router from "./router"
import store from "./store"
import App from "./App.vue"
import { ssoUI } from "./lib"
import IdleVue from 'idle-vue-3'

ssoUI.use();

createApp(App).use(store).use(router).use(Antd).use(IdleVue, { store, idleTime: store.state.idleTime }).mount("#app")