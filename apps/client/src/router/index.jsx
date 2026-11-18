import { createBrowserRouter } from 'react-router-dom'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div className="p-8 text-center text-xl font-bold">CafeBrew — coming soon</div>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
])