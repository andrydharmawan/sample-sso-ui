import { createStore } from 'vuex'
import uuid from "uuid/v1";

export default createStore({
    state: {
        id: uuid(),
        loading: false,
        processSSO: false,
        messageErrorSSO: null,
        idleTime: 15 * 60000
    },
    mutations: {
        id(state, isLoad) {
            state.id = isLoad;
        },
        loading(state, isLoad) {
            state.loading = isLoad;
        },
        processSSO(state, value) {
            state.processSSO = value;
        },
        messageErrorSSO(state, value) {
            state.messageErrorSSO = value;
        },
        idleTime(state, value) {
            state.idleTime = value;
        }
    },
    getters: {
        id({ id }) {
            return id;
        },
        loading({ loading }) {
            return loading;
        },
        messageErrorSSO({ messageErrorSSO }) {
            return messageErrorSSO;
        },
        processSSO({ processSSO }) {
            return processSSO;
        },
        idleTime({ idleTime }) {
            return idleTime;
        }
    }
})
