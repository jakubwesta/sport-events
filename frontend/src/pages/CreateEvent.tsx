import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { FormFieldError } from '@/components/auth/form-field-error'
import { LocationPicker } from '@/components/locations/location-picker'
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
import { useCategories } from '@/hooks/use-categories'
import { useAuth, useIsOrganizer } from '@/hooks/use-auth'
import { useEventMutations } from '@/hooks/use-events'
import { getFormValue } from '@/hooks/use-auth-form'
import { getFieldErrors } from '@/lib/form-errors'
import { parseApiError } from '@/lib/api-error'
import { resolveEventLocationId } from '@/lib/resolve-event-location'
import { cn } from '@/lib/utils'
import {
  emptyLocationPickerValue,
  eventCreateFormSchema,
  hasLocationInput,
  locationFormSchema,
  toEventCreatePayload,
  toLocationCreatePayload,
  toLocationFormValues,
  type EventStatus,
  type EventType,
  type LocationPickerValue,
} from '@/schemas'

const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'TEAM', label: 'Team' },
]

const eventStatusOptions: { value: EventStatus; label: string }[] = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'REGISTRATION', label: 'Registration open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'POSTPONED', label: 'Postponed' },
]

const inputClassName =
  'flex min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30'

export function CreateEventPage() {
  const navigate = useNavigate()
  const { isReady, isAuthenticated } = useAuth()
  const isOrganizer = useIsOrganizer()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { createEvent, isCreating, createError } = useEventMutations()

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [eventType, setEventType] = useState<EventType>('INDIVIDUAL')
  const [status, setStatus] = useState<EventStatus>('PLANNING')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState<LocationPickerValue>(emptyLocationPickerValue())

  useEffect(() => {
    if (!isReady) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (!isOrganizer) {
      navigate('/', { replace: true })
    }
  }, [isReady, isAuthenticated, isOrganizer, navigate])

  const isLoading = categoriesLoading

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setLocationErrors({})
    setFormError(null)

    const form = event.currentTarget
    const parsed = eventCreateFormSchema.safeParse({
      title: getFormValue(form, 'title'),
      description: getFormValue(form, 'description'),
      event_type: eventType,
      status,
      price: getFormValue(form, 'price'),
      start_date: getFormValue(form, 'start_date'),
      duration: getFormValue(form, 'duration'),
      registration_deadline: getFormValue(form, 'registration_deadline'),
      max_participants: getFormValue(form, 'max_participants'),
      min_team_size: getFormValue(form, 'min_team_size'),
      max_team_size: getFormValue(form, 'max_team_size'),
      is_published: true,
      category_id: categoryId,
    })

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      setFormError('Please fix the errors below.')
      return
    }

    let locationId: number | undefined

    if (hasLocationInput(location)) {
      const locationParsed = locationFormSchema.safeParse(toLocationFormValues(location))
      if (!locationParsed.success) {
        setLocationErrors(getFieldErrors(locationParsed.error))
        setFormError('Please fix the location errors below.')
        return
      }

      try {
        locationId = await resolveEventLocationId(toLocationCreatePayload(location))
      } catch (error) {
        setFormError(parseApiError(error).detail || 'Failed to save location.')
        return
      }
    }

    try {
      await createEvent(toEventCreatePayload(parsed.data, locationId))
      navigate('/', { replace: true })
    } catch {
      // API error handled by mutation state
    }
  }

  if (!isReady || !isOrganizer) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4 w-fit gap-2" asChild>
        <Link to="/">
          <ArrowLeft className="size-4" aria-hidden />
          Back to events
        </Link>
      </Button>

      <Card className="w-full border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Create event</CardTitle>
          <CardDescription>
            Fill in the details below. The event will be published and visible to users immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <AuthFormError message={createError?.detail ?? formError} />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Event name" aria-invalid={Boolean(fieldErrors.title)} />
              <FormFieldError message={fieldErrors.title} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the event..."
                className={cn(inputClassName, 'min-h-24 resize-y')}
                aria-invalid={Boolean(fieldErrors.description)}
              />
              <FormFieldError message={fieldErrors.description} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event_type">Event type</Label>
                <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                  <SelectTrigger id="event_type" aria-invalid={Boolean(fieldErrors.event_type)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormFieldError message={fieldErrors.event_type} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                  <SelectTrigger id="status" aria-invalid={Boolean(fieldErrors.status)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormFieldError message={fieldErrors.status} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={isLoading}
              >
                <SelectTrigger id="category_id" aria-invalid={Boolean(fieldErrors.category_id)}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={fieldErrors.category_id} />
            </div>

            <LocationPicker
              value={location}
              onChange={setLocation}
              fieldErrors={locationErrors}
              disabled={isCreating || isLoading}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  aria-invalid={Boolean(fieldErrors.start_date)}
                />
                <FormFieldError message={fieldErrors.start_date} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_deadline">Registration deadline</Label>
                <Input
                  id="registration_deadline"
                  name="registration_deadline"
                  type="datetime-local"
                  aria-invalid={Boolean(fieldErrors.registration_deadline)}
                />
                <FormFieldError message={fieldErrors.registration_deadline} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (PLN)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={0}
                  aria-invalid={Boolean(fieldErrors.price)}
                />
                <FormFieldError message={fieldErrors.price} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min={1}
                  placeholder="Optional"
                  aria-invalid={Boolean(fieldErrors.duration)}
                />
                <FormFieldError message={fieldErrors.duration} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max participants</Label>
                <Input
                  id="max_participants"
                  name="max_participants"
                  type="number"
                  min={1}
                  placeholder="Optional"
                  aria-invalid={Boolean(fieldErrors.max_participants)}
                />
                <FormFieldError message={fieldErrors.max_participants} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min_team_size">Min team size</Label>
                <Input
                  id="min_team_size"
                  name="min_team_size"
                  type="number"
                  min={1}
                  defaultValue={1}
                  aria-invalid={Boolean(fieldErrors.min_team_size)}
                />
                <FormFieldError message={fieldErrors.min_team_size} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_team_size">Max team size</Label>
                <Input
                  id="max_team_size"
                  name="max_team_size"
                  type="number"
                  min={1}
                  defaultValue={1}
                  aria-invalid={Boolean(fieldErrors.max_team_size)}
                />
                <FormFieldError message={fieldErrors.max_team_size} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isCreating || isLoading}>
              {isCreating ? 'Creating…' : 'Create event'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
