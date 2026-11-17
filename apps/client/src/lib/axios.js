import axios from "axios"

// Token accessor — a module-level getter/setter, NOT a React import.
// The interceptor below runs outside the React tree, so it can't call a
// hook directly. AuthContext (Task 2-02) calls setTokenAccessor() once
// it exists, wiring this up to its real access-token state. Until then,
// getAccessToken() correctly returns null — there is no token yet.
let getAccessToken = () => null
let onTokenRefresh = async () => null

export function setTokenAccessor(fn) {
  getAccessToken = fn
}

export function setRefreshHandler(fn) {
  onTokenRefresh = fn
}

export const api = axios.create({
  // API_ROUTES constants already include the /api prefix — baseURL must not.
  // Empty fallback keeps requests same-origin so the Vite /api proxy applies.
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh-and-retry-once on 401 — a _retry flag on the original request
// prevents an infinite loop if the refreshed token is also rejected.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const newToken = await onTokenRefresh()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)
