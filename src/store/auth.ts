import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { defineStore } from 'pinia'

interface StoredTokens {
  accessToken: string
  refreshToken?: string | null
}

interface TokenResponse {
  'access_token': string
  'refresh_token'?: string
}

interface TokenPayload {
  sub?: string
  roles?: unknown
  authorities?: unknown
}

interface Session {
  user: { username: string } | null
  roles: string[]
}

interface Credentials {
  username: string
  password: string
}

const AUTH_API_URL = (process.env.VUE_AUTH_API_URL || '').replace(/\/$/, '')
const CLIENT_ID = process.env.VUE_APP_CLIENT_ID || 'albedo-client'
const CLIENT_SECRET = process.env.VUE_APP_CLIENT_SECRET || 'albedo-secret'
const TOKEN_ENDPOINT = `${AUTH_API_URL}/oauth2/token`
const REVOKE_ENDPOINT = `${AUTH_API_URL}/oauth2/revoke`
const LOGOUT_ENDPOINT = `${AUTH_API_URL}/user/logout`
const TOKEN_STORAGE_KEY = 'albedo.auth.tokens'
const PUBLISHING_ROLES = ['ROLE_EDITOR', 'ROLE_ADMIN']

function decodeBase64Url (value: string): string {
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

function decodeAccessToken (accessToken?: string | null): TokenPayload {
  if (!accessToken) {
    return {}
  }

  try {
    return JSON.parse(decodeBase64Url(accessToken.split('.')[1]))
  } catch {
    return {}
  }
}

function normalizeRoles (rawRoles: unknown): string[] {
  if (Array.isArray(rawRoles)) {
    return rawRoles.filter((role): role is string => typeof role === 'string' && Boolean(role))
  }

  if (typeof rawRoles === 'string') {
    return rawRoles
      .split(/[,\s]+/)
      .map((role) => role.trim())
      .filter((role) => role.startsWith('ROLE_'))
  }

  return []
}

function buildSession (accessToken?: string | null): Session {
  const payload = decodeAccessToken(accessToken)
  const username = payload.sub || null

  return {
    user: username ? { username } : null,
    roles: normalizeRoles(payload.roles || payload.authorities)
  }
}

function getStoredTokens (): StoredTokens | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedTokens = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    return storedTokens ? JSON.parse(storedTokens) as StoredTokens : null
  } catch {
    return null
  }
}

function storeTokens (tokens: StoredTokens): void {
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

function buildTokenRequestBody (params: Record<string, string>): URLSearchParams {
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

function applyAuthHeader (accessToken: string | null): void {
  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    delete axios.defaults.headers.common.Authorization
  }
}

function requestToken (params: Record<string, string>): Promise<AxiosResponse<TokenResponse>> {
  return axios.post<TokenResponse>(TOKEN_ENDPOINT, buildTokenRequestBody(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

function requestLogout (refreshToken: string | null): Promise<AxiosResponse> {
  return axios.post(LOGOUT_ENDPOINT, {
    refreshToken
  })
}

function requestTokenRevocation (token: string, tokenTypeHint: string): Promise<AxiosResponse> {
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
    hasRole: (state) => (role: string) => state.roles.includes(role),
    canApprovePromotions: (state) => state.roles.includes('ROLE_ADMIN'),
    canPublishBooks: (state) => state.roles.some((role) => PUBLISHING_ROLES.includes(role))
  },
  actions: {
    setTokens (tokens: TokenResponse): void {
      const accessToken = tokens.access_token
      const session = buildSession(accessToken)

      this.accessToken = accessToken
      this.refreshTokenValue = tokens.refresh_token || this.refreshTokenValue
      this.isAuthenticated = true
      this.user = session.user
      this.roles = session.roles
      applyAuthHeader(accessToken)
      storeTokens({
        accessToken,
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
    async login (credentials: Credentials): Promise<void> {
      const response = await requestToken({
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password
      })

      this.setTokens(response.data)
    },
    async refreshToken (): Promise<void> {
      if (!this.refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await requestToken({
        grant_type: 'refresh_token',
        refresh_token: this.refreshTokenValue
      })

      this.setTokens(response.data)
    },
    async logout (): Promise<void> {
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

export function setupAuthInterceptors (pinia: Parameters<typeof useAuthStore>[0]): void {
  if (interceptorsRegistered) {
    return
  }

  interceptorsRegistered = true

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
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
