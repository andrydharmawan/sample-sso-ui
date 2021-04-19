import { createApp } from "vue"
import Antd from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import "./registerServiceWorker"
import router from "./router"
import store from "./store"
import App from "./App.vue"

createApp(App).use(store).use(router).use(Antd).mount("#app")