import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

export const UIContext = createContext(null)

const initialState = { isCartOpen: false, toasts: [] }
const DEFAULT_TOAST_DURATION = 4000

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_CART':
      return { ...state, isCartOpen: true }
    case 'CLOSE_CART':
      return { ...state, isCartOpen: false }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }
    default:
      return state
  }
}

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const timers = useRef(new Map())

  const removeToast = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  const addToast = useCallback(
    (toast) => {
      const id = toast.id ?? crypto.randomUUID()
      const duration = toast.duration ?? DEFAULT_TOAST_DURATION
      dispatch({
        type: 'ADD_TOAST',
        payload: { id, message: toast.message, type: toast.type ?? 'info', duration },
      })
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => removeToast(id), duration))
      }
      return id
    },
    [removeToast],
  )

  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [])

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer)
      timers.current.clear()
    },
    [],
  )

  const value = useMemo(
    () => ({ ...state, openCart, closeCart, addToast, removeToast }),
    [state, openCart, closeCart, addToast, removeToast],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}