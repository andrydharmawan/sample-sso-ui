<template>
    <layout v-if="!loading && !messageErrorSSO" />
    <loading v-else />
</template>
<script>
import { mapState } from "vuex";
import { Loading } from "./components";
import Layout from "./layouts"
import { ssoUI } from "./lib";

export default {
    components: {
        Loading,
        Layout
    },
	computed: {
        ...mapState(["messageErrorSSO", "loading"]),
        isIdle(){
      	    return this.$store.state.idleVue.isIdle;
        }
    },
    ...ssoUI.initialize
}
</script>
