import axios from 'axios'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  }),
  actions: {
    setTokens (tokens) {
      this.accessToken = tokens.access_token
      this.refreshToken = tokens.refresh_token
      this.isAuthenticated = true
      axios.defaults.headers.common.Authorization = `Bearer ${tokens.access_token}`
    },
    clearSession () {
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      delete axios.defaults.headers.common.Authorization
    },
    async login (credentials) {
      const response = await axios.post(`${process.env.VUE_APP_API_URL}/oauth/token`, {
        grant_type: 'password',
        client_id: process.env.VUE_APP_CLIENT_ID,
        client_secret: process.env.VUE_APP_CLIENT_SECRET,
        username: credentials.username,
        password: credentials.password
      })

      this.setTokens(response.data)
    },
    async refreshToken () {
      if (!this.refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(`${process.env.VUE_APP_API_URL}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: process.env.VUE_APP_CLIENT_ID,
        client_secret: process.env.VUE_APP_CLIENT_SECRET,
        refresh_token: this.refreshToken
      })

      this.setTokens(response.data)
    },
    logout () {
      this.clearSession()
    }
  }
})

let interceptorsRegistered = false

export function setupAuthInterceptors (pinia) {
  if (interceptorsRegistered) {
    return
  }

  interceptorsRegistered = true

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config
      const requestUrl = originalRequest?.url ?? ''

      if (
        error?.response?.status === 401 &&
                originalRequest &&
                !requestUrl.includes('/oauth/token') &&
                !originalRequest._retry
      ) {
        originalRequest._retry = true

        const authStore = useAuthStore(pinia)

        try {
          await authStore.refreshToken()
          return axios(originalRequest)
        } catch (refreshError) {
          authStore.logout()
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )
}
