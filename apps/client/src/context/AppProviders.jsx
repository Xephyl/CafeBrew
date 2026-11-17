import { AuthProvider } from './AuthContext'
import { UIProvider } from './UIContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <UIProvider>{children}</UIProvider>
    </AuthProvider>
  )
}