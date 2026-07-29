import axios from 'axios'
import { defineStore } from 'pinia'

const API_URL = (process.env.VUE_APP_API_URL || '').replace(/\/$/, '')
const CLIENT_ID = process.env.VUE_APP_CLIENT_ID || 'albedo-client'
const CLIENT_SECRET = process.env.VUE_APP_CLIENT_SECRET || 'albedo-secret'
const TOKEN_ENDPOINT = `${API_URL}/oauth2/token`
const REVOKE_ENDPOINT = `${API_URL}/oauth2/revoke`
const LOGOUT_ENDPOINT = `${API_URL}/user/logout`
const TOKEN_STORAGE_KEY = 'albedo.auth.tokens'
const PUBLISHING_ROLES = ['ROLE_EDITOR', 'ROLE_ADMIN']

function decodeBase64Url (value) {
  if (typeof window === 'undefined') {
    return ''
  }

  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const decoded = window.atob(padded)

  return decodeURIComponent(
    decoded
      .split('')
      .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  )
}

function decodeAccessToken (accessToken) {
  if (!accessToken) {
    return {}
  }

  try {
    return JSON.parse(decodeBase64Url(accessToken.split('.')[1]))
  } catch {
    return {}
  }
}

function normalizeRoles (rawRoles) {
  if (Array.isArray(rawRoles)) {
    return rawRoles.filter(Boolean)
  }

  if (typeof rawRoles === 'string') {
    return rawRoles
      .split(/[,\s]+/)
      .map((role) => role.trim())
      .filter((role) => role.startsWith('ROLE_'))
  }

  return []
}

function buildSession (accessToken) {
  const payload = decodeAccessToken(accessToken)
  const username = payload.sub || null

  return {
    user: username ? { username } : null,
    roles: normalizeRoles(payload.roles || payload.authorities)
  }
}

function getStoredTokens () {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return JSON.parse(window.localStorage.getItem(TOKEN_STORAGE_KEY))
  } catch {
    return null
  }
}

function storeTokens (tokens) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
}

function removeStoredTokens () {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function buildTokenRequestBody (params) {
  const body = new URLSearchParams()

  Object.entries({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    ...params
  }).forEach(([key, value]) => {
    if (value) {
      body.append(key, value)
    }
  })

  return body
}

function applyAuthHeader (accessToken) {
  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    delete axios.defaults.headers.common.Authorization
  }
}

function requestToken (params) {
  return axios.post(TOKEN_ENDPOINT, buildTokenRequestBody(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

function requestLogout (refreshToken) {
  return axios.post(LOGOUT_ENDPOINT, {
    refreshToken
  })
}

function requestTokenRevocation (token, tokenTypeHint) {
  return axios.post(
    REVOKE_ENDPOINT,
    buildTokenRequestBody({
      token,
      token_type_hint: tokenTypeHint
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const storedTokens = getStoredTokens()
    const session = buildSession(storedTokens?.accessToken)

    if (storedTokens?.accessToken) {
      applyAuthHeader(storedTokens.accessToken)
    }

    return {
      accessToken: storedTokens?.accessToken || null,
      refreshTokenValue: storedTokens?.refreshToken || null,
      isAuthenticated: Boolean(storedTokens?.accessToken),
      user: session.user,
      roles: session.roles
    }
  },
  getters: {
    username: (state) => state.user?.username || null,
    hasRole: (state) => (role) => state.roles.includes(role),
    canApprovePromotions: (state) => state.roles.includes('ROLE_ADMIN'),
    canPublishBooks: (state) => state.roles.some((role) => PUBLISHING_ROLES.includes(role))
  },
  actions: {
    setTokens (tokens) {
      const session = buildSession(tokens.access_token)

      this.accessToken = tokens.access_token
      this.refreshTokenValue = tokens.refresh_token || this.refreshTokenValue
      this.isAuthenticated = true
      this.user = session.user
      this.roles = session.roles
      applyAuthHeader(tokens.access_token)
      storeTokens({
        accessToken: this.accessToken,
        refreshToken: this.refreshTokenValue
      })
    },
    clearSession () {
      this.accessToken = null
      this.refreshTokenValue = null
      this.isAuthenticated = false
      this.user = null
      this.roles = []
      applyAuthHeader(null)
      removeStoredTokens()
    },
    async login (credentials) {
      const response = await requestToken({
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password
      })

      this.setTokens(response.data)
    },
    async refreshToken () {
      if (!this.refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await requestToken({
        grant_type: 'refresh_token',
        refresh_token: this.refreshTokenValue
      })

      this.setTokens(response.data)
    },
    async logout () {
      const accessToken = this.accessToken
      const refreshToken = this.refreshTokenValue
      const logoutRequests = []

      if (accessToken) {
        logoutRequests.push(requestLogout(refreshToken))
      }

      if (refreshToken) {
        logoutRequests.push(requestTokenRevocation(refreshToken, 'refresh_token'))
      }

      try {
        await Promise.allSettled(logoutRequests)
      } finally {
        this.clearSession()
      }
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
                !requestUrl.includes('/oauth2/token') &&
                !requestUrl.includes('/oauth2/revoke') &&
                !requestUrl.includes('/user/logout') &&
                !originalRequest._retry
      ) {
        originalRequest._retry = true

        const authStore = useAuthStore(pinia)

        try {
          // Explicitly wait for token refresh before retrying
          await authStore.refreshToken()

          // Re-apply the new access token to the original request headers
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`

          return axios(originalRequest)
        } catch (refreshError) {
          // If refresh fails, clear session and redirect to login (handled by store logout)
          await authStore.logout()
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )
}
