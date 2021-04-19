<template>
    <div class="logo" />
    <a-menu theme="dark" @click="menuClick" v-model:selectedKeys="selectedKeys" mode="inline">
        <a-menu-item key="home">
            <home-outlined />
            <span>Home</span>
        </a-menu-item>
        <a-menu-item key="about">
            <info-circle-outlined />
            <span>About</span>
        </a-menu-item>
    </a-menu>
</template>
<script>
import {
    HomeOutlined,
    InfoCircleOutlined
} from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    components: {
        HomeOutlined,
        InfoCircleOutlined
    },
    data() {
        const { name = "home" } = this.$router.currentRoute._value;
        return {
            selectedKeys: ref([name]),
        };
    },
    methods: {
        menuClick({ key }){
            this.$router.push({ name: key })
        }
    }
});
</script>