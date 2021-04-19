import { createStore } from 'vuex'

export default createStore({
    state: {
        loading: false,
        messageErrorSSO: null,
    },
    mutations: {
        loading(state, isLoad) {
            state.loading = isLoad;
        },
        messageErrorSSO(state, value) {
            state.messageErrorSSO = value;
        }
    },
    getters: {
        loading({ loading }) {
            return loading;
        },
        messageErrorSSO({ messageErrorSSO }) {
            return messageErrorSSO;
        }
    }
})
