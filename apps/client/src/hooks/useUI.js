import { useContext } from 'react'

import { UIContext } from '@/context/UIContext'

export function useUI() {
  const ctx = useContext(UIContext)
  if (ctx === null) throw new Error('useUI must be used within <AppProviders>')
  return ctx
}