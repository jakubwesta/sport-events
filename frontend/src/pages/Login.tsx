import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { FormFieldError } from '@/components/auth/form-field-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthForm, getFormValue } from '@/hooks/use-auth-form'
import { useAuth } from '@/hooks/use-auth'
import { loginRequestSchema } from '@/schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isSubmitting, isReady, error, isAuthenticated, clearError } = useAuth()

  const { formRef, fieldErrors, formError, handleSubmit } = useAuthForm({
    schema: loginRequestSchema,
    getValues: (form) => ({
      email: getFormValue(form, 'email'),
      password: getFormValue(form, 'password'),
    }),
    onSubmit: async (data) => {
      clearError()
      await login(data)
      navigate('/', { replace: true })
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Enter your details to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthFormError message={error ?? formError} />

          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={!isReady || isSubmitting}
            />
            <FormFieldError message={fieldErrors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={!isReady || isSubmitting}
            />
            <FormFieldError message={fieldErrors.password} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isReady || isSubmitting}
          >
            {!isReady ? 'Loading…' : isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
