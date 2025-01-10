import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is 401 Unauthorized and there's a refresh token available
        if (error.response.status === 401 && originalRequest.url !== '/oauth/token') {
            // Attempt to refresh the token
            const store = require('@/store').default;
            try {
                await store.dispatch('auth/refreshToken');
                // Retry the original request with the new access token
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout the user
                store.dispatch('auth/logout');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default {
    state: {
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
    },
    mutations: {
        SET_TOKENS(state, tokens) {
            state.accessToken = tokens.access_token;
            state.refreshToken = tokens.refresh_token;
            state.isAuthenticated = true;
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        },
        LOGOUT(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    actions: {
        async login({ commit }, credentials) {
            const response = await axios.post(`${process.env.VUE_APP_API_URL}/oauth/token`, {
                grant_type: 'password',
                client_id: process.env.VUE_APP_CLIENT_ID,
                client_secret: process.env.VUE_APP_CLIENT_SECRET,
                username: credentials.username,
                password: credentials.password,
            });
            // const response = {
            //     data: {
            //         access_token: "test-access" + credentials.password,
            //         refresh_token: "test-refresh"
            //     }
            // }
            commit('SET_TOKENS', response.data);
        },
        async refreshToken({ state, commit }) {
            if (!state.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(`${process.env.VUE_APP_API_URL}/oauth/token`, {
                grant_type: 'refresh_token',
                client_id: process.env.VUE_APP_CLIENT_ID,
                client_secret: process.env.VUE_APP_CLIENT_SECRET,
                refresh_token: state.refreshToken,
            });
            commit('SET_TOKENS', response.data);
        },
        async logout({ commit }) {
            commit('LOGOUT');
        },
    },
};
