import { createStore } from 'vuex'

export default createStore({
    state: {
        loading: false,
        processSSO: false,
        messageErrorSSO: null,
    },
    mutations: {
        loading(state, isLoad) {
            state.loading = isLoad;
        },
        messageErrorSSO(state, value) {
            state.messageErrorSSO = value;
        },
        processSSO(state, value) {
            state.processSSO = value;
        }
    },
    getters: {
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
