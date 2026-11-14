import axios from "axios"

import { clearAccessToken, getAccessToken, setAccessToken } from "./authToken.js"

// baseURL empty → same-origin requests; Vite dev proxy forwards /api → localhost:3000.
// Override with VITE_API_BASE_URL only if the API lives on another origin.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true, // refresh token travels in the httpOnly cookie
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Single in-flight refresh shared by all concurrent 401s
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.accessToken
        setAccessToken(token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRoute = original?.url?.includes("/auth/")

    if (error.response?.status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true
      try {
        const token = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        clearAccessToken()
      }
    }

    return Promise.reject(error)
  }
)

export default api
