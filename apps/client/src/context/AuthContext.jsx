import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { API_ROUTES } from '@shared/core'

import { api, setRefreshHandler, setTokenAccessor } from '@/lib/axios'

export const AuthContext = createContext(null)

const initialState = { user: null, accessToken: null, isLoading: false, error: null }

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, isLoading: false, error: null, user: action.payload.user, accessToken: action.payload.accessToken }
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'SET_TOKEN':
      return { ...state, accessToken: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return initialState
    default:
      return state
  }
}

function errorCode(err) {
  return err?.response?.data?.error?.code ?? 'NETWORK_ERROR'
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const tokenRef = useRef(null)
  const refreshInFlight = useRef(null)
  const bootstrapped = useRef(false)

  useEffect(() => {
    tokenRef.current = state.accessToken
  }, [state.accessToken])

  const refresh = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current
    const p = (async () => {
      try {
        const res = await api.post(API_ROUTES.AUTH.REFRESH)
        const token = res.data.data.accessToken
        tokenRef.current = token
        dispatch({ type: 'SET_TOKEN', payload: token })
        return token
      } catch {
        tokenRef.current = null
        dispatch({ type: 'LOGOUT' })
        return null
      } finally {
        refreshInFlight.current = null
      }
    })()
    refreshInFlight.current = p
    return p
  }, [])

  useEffect(() => {
    setTokenAccessor(() => tokenRef.current)
    setRefreshHandler(refresh)
  }, [refresh])

  const fetchMe = useCallback(async () => {
    const res = await api.get(API_ROUTES.AUTH.ME)
    dispatch({ type: 'SET_USER', payload: res.data.data.user })
    return res.data.data.user
  }, [])

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    ;(async () => {
      const token = tokenRef.current ?? (await refresh())
      if (token) await fetchMe().catch(() => {})
    })()
  }, [refresh, fetchMe])

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const res = await api.post(API_ROUTES.AUTH.LOGIN, credentials)
      tokenRef.current = res.data.data.accessToken
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data })
      return res.data.data.user
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: errorCode(err) })
      throw err
    }
  }, [])

  const register = useCallback(async (payload) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const res = await api.post(API_ROUTES.AUTH.REGISTER, payload)
      tokenRef.current = res.data.data.accessToken
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data })
      return res.data.data.user
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: errorCode(err) })
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT)
    } catch {
      // server cookie clear failed; client state still resets below
    } finally {
      tokenRef.current = null
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  const value = useMemo(
    () => ({ ...state, login, register, logout, fetchMe }),
    [state, login, register, logout, fetchMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}