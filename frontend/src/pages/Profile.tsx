import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'

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
import { useAuth } from '@/hooks/use-auth'
import { useUserMutations } from '@/hooks/use-users'
import type { UserUpdate } from '@/schemas'

function buildPayload(
  form: HTMLFormElement,
  currentEmail: string,
): { payload: UserUpdate; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const payload: UserUpdate = {}

  const get = (name: string) =>
    (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? ''

  const firstName = get('first_name')
  if (firstName) payload.first_name = firstName

  const lastName = get('last_name')
  if (lastName) payload.last_name = lastName

  const email = get('email')
  if (email && email !== currentEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    } else {
      payload.email = email
    }
  }

  const phone = get('phone_number')
  if (phone) {
    if (!/^[0-9]{9}$/.test(phone)) {
      errors.phone_number = 'Phone number must be exactly 9 digits.'
    } else {
      payload.phone_number = phone
    }
  }

  const birthYearRaw = get('birth_year')
  if (birthYearRaw) {
    const y = Number(birthYearRaw)
    if (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear()) {
      errors.birth_year = 'Enter a valid birth year.'
    } else {
      payload.birth_year = y
    }
  }

  const password = get('password')
  const confirmPassword = get('confirm_password')
  if (password) {
    if (password.length < 1) {
      errors.password = 'Password cannot be empty.'
    } else if (password !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.'
    } else {
      payload.password = password
    }
  }

  return { payload, errors }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isReady, isAuthenticated, refreshUser } = useAuth()
  const { updateUser, isUpdating, updateError } = useUserMutations()

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isReady) return
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isReady, isAuthenticated, navigate])

  if (!isReady || !user) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaved(false)
    setFieldErrors({})

    const { payload, errors } = buildPayload(e.currentTarget, user.email)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (Object.keys(payload).length === 0) {
      setSaved(true)
      return
    }

    try {
      await updateUser({ userId: user.id, data: payload })
      await refreshUser()
      setSaved(true)
      ;(e.target as HTMLFormElement).querySelector<HTMLInputElement>('[name="password"]')!.value = ''
      ;(e.target as HTMLFormElement).querySelector<HTMLInputElement>('[name="confirm_password"]')!.value = ''
    } catch {
      // API error shown via updateError
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-lg">
      <Button variant="ghost" size="sm" className="mb-4 w-fit gap-2" asChild>
        <Link to="/">
          <ArrowLeft className="size-4" aria-hidden />
          Back to events
        </Link>
      </Button>

      <Card className="w-full border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Edit profile</CardTitle>
          <CardDescription>
            Update your personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)} noValidate>
            <AuthFormError message={updateError?.detail ?? null} />

            {saved && !updateError && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Profile updated successfully.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={user.first_name ?? ''}
                  placeholder={user.first_name ?? 'First name'}
                  aria-invalid={Boolean(fieldErrors.first_name)}
                />
                <FormFieldError message={fieldErrors.first_name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={user.last_name ?? ''}
                  placeholder={user.last_name ?? 'Last name'}
                  aria-invalid={Boolean(fieldErrors.last_name)}
                />
                <FormFieldError message={fieldErrors.last_name} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              <FormFieldError message={fieldErrors.email} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  defaultValue={user.phone_number ?? ''}
                  placeholder="9 digits"
                  aria-invalid={Boolean(fieldErrors.phone_number)}
                />
                <FormFieldError message={fieldErrors.phone_number} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birth_year">Birth year</Label>
                <Input
                  id="birth_year"
                  name="birth_year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  defaultValue={user.birth_year ?? ''}
                  placeholder="e.g. 1995"
                  aria-invalid={Boolean(fieldErrors.birth_year)}
                />
                <FormFieldError message={fieldErrors.birth_year} />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Change password
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  aria-invalid={Boolean(fieldErrors.password)}
                  autoComplete="new-password"
                />
                <FormFieldError message={fieldErrors.password} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Repeat new password"
                  aria-invalid={Boolean(fieldErrors.confirm_password)}
                  autoComplete="new-password"
                />
                <FormFieldError message={fieldErrors.confirm_password} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </main>
  )
}
