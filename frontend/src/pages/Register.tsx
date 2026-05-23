import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthForm, getFormValue } from '@/hooks/use-auth-form'
import { useAuth } from '@/hooks/use-auth'
import {
  registerFormSchema,
  registerRequestSchema,
  type RegisterRole,
} from '@/schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, login, isSubmitting, isReady, error, isAuthenticated, clearError } =
    useAuth()
  const [role, setRole] = useState<RegisterRole>('USER')

  const { formRef, fieldErrors, formError, handleSubmit } = useAuthForm({
    schema: registerFormSchema,
    getValues: (form) => ({
      first_name: getFormValue(form, 'first_name'),
      last_name: getFormValue(form, 'last_name'),
      email: getFormValue(form, 'email'),
      password: getFormValue(form, 'password'),
      passwordRepeat: getFormValue(form, 'passwordRepeat'),
      birth_year:
        getFormValue(form, 'birth_year') === ''
          ? NaN
          : Number(getFormValue(form, 'birth_year')),
      phone_number: getFormValue(form, 'phone_number'),
      role,
    }),
    onSubmit: async (data) => {
      clearError()
      const registerData = registerRequestSchema.parse(data)
      await register(registerData)
      await login({ email: registerData.email, password: registerData.password })
      navigate('/', { replace: true })
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const fieldsDisabled = !isReady || isSubmitting

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Fill out the form to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthFormError message={error ?? formError} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="register-first-name">First name</Label>
              <Input
                id="register-first-name"
                name="first_name"
                autoComplete="given-name"
                placeholder="John"
                aria-invalid={Boolean(fieldErrors.first_name)}
                disabled={fieldsDisabled}
              />
              <FormFieldError message={fieldErrors.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-last-name">Last name</Label>
              <Input
                id="register-last-name"
                name="last_name"
                autoComplete="family-name"
                placeholder="Smith"
                aria-invalid={Boolean(fieldErrors.last_name)}
                disabled={fieldsDisabled}
              />
              <FormFieldError message={fieldErrors.last_name} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={fieldsDisabled}
            />
            <FormFieldError message={fieldErrors.email} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="register-birth-year">Birth year</Label>
              <Input
                id="register-birth-year"
                name="birth_year"
                type="number"
                inputMode="numeric"
                min={1901}
                max={2025}
                placeholder="1995"
                aria-invalid={Boolean(fieldErrors.birth_year)}
                disabled={fieldsDisabled}
              />
              <FormFieldError message={fieldErrors.birth_year} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-phone">Phone number</Label>
              <Input
                id="register-phone"
                name="phone_number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="123456789"
                aria-invalid={Boolean(fieldErrors.phone_number)}
                disabled={fieldsDisabled}
              />
              <FormFieldError message={fieldErrors.phone_number} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={fieldsDisabled}
            />
            <FormFieldError message={fieldErrors.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password-repeat">Repeat password</Label>
            <Input
              id="register-password-repeat"
              name="passwordRepeat"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.passwordRepeat)}
              disabled={fieldsDisabled}
            />
            <FormFieldError message={fieldErrors.passwordRepeat} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RegisterRole)}
              disabled={fieldsDisabled}
            >
              <SelectTrigger
                id="register-role"
                className="w-full"
                aria-label="Role"
                aria-invalid={Boolean(fieldErrors.role)}
              >
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ORGANIZER">Organizer</SelectItem>
              </SelectContent>
            </Select>
            <FormFieldError message={fieldErrors.role} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Choose Organizer if you want to create events
            </p>
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={fieldsDisabled}>
            {!isReady ? 'Loading…' : isSubmitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
