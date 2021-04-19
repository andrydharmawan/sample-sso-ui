import { createStore } from 'vuex'
import uuid from "uuid/v1";

export default createStore({
    state: {
        id: uuid(),
        loading: false,
        processSSO: false,
        messageErrorSSO: null,
    },
    mutations: {
        loading(state, isLoad) {
            state.loading = isLoad;
        },
        id(state, isLoad) {
            state.id = isLoad;
        },
        messageErrorSSO(state, value) {
            state.messageErrorSSO = value;
        },
        processSSO(state, value) {
            state.processSSO = value;
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
        }
    }
})
