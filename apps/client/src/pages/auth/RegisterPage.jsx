import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { RegisterSchema } from '@shared/core'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/utils/errorMessages'

const ExtendedRegisterSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export function RegisterPage() {
  const { register: registerUser, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(ExtendedRegisterSchema) })

  const onSubmit = async (data) => {
    try {
      const { firstName, lastName, email, password } = data
      await registerUser({ firstName, lastName, email, password })
      navigate('/', { replace: true })
    } catch {
      // Error code mapped via getErrorMessage in render
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5E6D3]">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-[#6B4226]">Create an account</h1>
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {getErrorMessage(error)}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First name"
              placeholder="Jane"
              error={errors.firstName}
              register={register('firstName')}
            />
            <FormField
              label="Last name"
              placeholder="Doe"
              error={errors.lastName}
              register={register('lastName')}
            />
          </div>
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
          <PasswordInput
            label="Confirm password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            register={register('confirmPassword')}
          />
          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Sign up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#4A7C59] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}