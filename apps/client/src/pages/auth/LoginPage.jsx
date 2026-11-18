import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoginSchema } from '@shared/core'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/utils/errorMessages'

export function LoginPage() {
  const { login, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(LoginSchema) })

  const onSubmit = async (data) => {
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch {
      // Error code mapped via getErrorMessage in render
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5E6D3]">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-[#6B4226]">Welcome back</h1>
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {getErrorMessage(error)}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            register={register('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password}
            register={register('password')}
          />
          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Log in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-[#4A7C59] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}