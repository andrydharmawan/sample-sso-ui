<template>
    <a-layout style="min-height: 100vh" :key="$store.state.id">
        <a-layout-sider v-model:collapsed="collapsed" collapsible>
            <sidebar/>
        </a-layout-sider>
        <a-layout>
            <navigation />
            <a-layout-content style="margin: 30px 16px 0px">
                <div class="p-4 bg-white rounded" style="min-height:360px">
                    <router-view />
                </div>
            </a-layout-content>
            <a-layout-footer style="text-align: center">
                Sample Project Single Sign-on Universitas Indonesia ©2021
            </a-layout-footer>
        </a-layout>
    </a-layout>
</template>

<script>
import { Navigation, Sidebar } from "../components"
import { defineComponent, ref } from 'vue';
export default defineComponent({
    name: "layout",
    components: {
        Navigation,
        Sidebar
    },
    data() {
        return {
            collapsed: ref(false)
        };
    },
});
</script>
<style>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>