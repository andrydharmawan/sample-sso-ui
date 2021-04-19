<template>
    <div>
        <div id="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link>
        </div>
        <router-view />
    </div>
    <loading />
</template>
<script>
import { mapState } from "vuex";
import Loading from "./components/Loading";

export default {
    components: {
        Loading
    },
    computed: mapState(["messageErrorSSO", "loading"]),
}
</script>
