import axios from "axios"

// Token accessor functions
let getAccessToken = () => null
let onTokenRefresh = async () => null

export function setTokenAccessor(fn) {
  getAccessToken = fn
}

export function setRefreshHandler(fn) {
  onTokenRefresh = fn
}

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
})

// Add authorization header to all requests
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 Unauthorized by refreshing token and retrying
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

    throw error
  }
)
