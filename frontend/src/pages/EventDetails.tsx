import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Loader2,
  MapPin,
  Tag,
  Trash2,
  Users,
} from 'lucide-react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { FormFieldError } from '@/components/auth/form-field-error'
import { LocationPicker } from '@/components/locations/location-picker'
import { EventParticipationSection } from '@/components/events/event-participation-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
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
import { useAuth } from '@/hooks/use-auth'
import { useEvent, useEventMutations } from '@/hooks/use-events'
import { getFormValue } from '@/hooks/use-auth-form'
import {
  formatEventDateTime,
  formatEventPrice,
  getEventCapacityLabel,
  getEventLocationAddress,
  getEventLocationLabel,
  getEventStatusBadgeClass,
  getEventStatusLabel,
  getEventTypeLabel,
} from '@/lib/event-display'
import { getFieldErrors } from '@/lib/form-errors'
import { parseApiError } from '@/lib/api-error'
import { resolveEventLocationId } from '@/lib/resolve-event-location'
import { cn } from '@/lib/utils'
import {
  eventUpdateFormSchema,
  hasLocationInput,
  locationFormSchema,
  locationToPickerValue,
  toDatetimeLocalValue,
  toEventUpdatePayload,
  toLocationCreatePayload,
  toLocationFormValues,
  type Event,
  type EventStatus,
  type LocationPickerValue,
} from '@/schemas'

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

function canManageEvent(event: Event, userId: number | undefined, role: string | undefined) {
  if (!userId) return false
  return event.owner_id === userId || role === 'ADMIN'
}

function EventOverview({ event }: { event: Event }) {
  const locationAddress = getEventLocationAddress(event)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{event.category.name}</Badge>
        <Badge variant="outline" className={getEventStatusBadgeClass(event.status)}>
          {getEventStatusLabel(event.status)}
        </Badge>
        <Badge variant="outline">{getEventTypeLabel(event.event_type)}</Badge>
        {!event.is_published ? <Badge variant="outline">Draft</Badge> : null}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {event.description?.trim() || 'No description provided.'}
      </p>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3 rounded-lg border border-border p-4">
          <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start date
            </dt>
            <dd className="mt-1 text-sm">{formatEventDateTime(event.start_date)}</dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-border p-4">
          <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Registration deadline
            </dt>
            <dd className="mt-1 text-sm">
              {formatEventDateTime(event.registration_deadline)}
            </dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-border p-4">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Location
            </dt>
            <dd className="mt-1 text-sm">{getEventLocationLabel(event)}</dd>
            {locationAddress ? (
              <dd className="mt-0.5 text-xs text-muted-foreground">{locationAddress}</dd>
            ) : null}
            {event.location ? (
              <dd className="mt-1 text-xs text-muted-foreground">
                {event.location.latitude.toFixed(5)}, {event.location.longitude.toFixed(5)}
              </dd>
            ) : null}
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-border p-4">
          <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Capacity
            </dt>
            <dd className="mt-1 text-sm">
              {getEventCapacityLabel(event.max_participants)}
            </dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-border p-4">
          <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Price
            </dt>
            <dd className="mt-1 text-sm">{formatEventPrice(event.price)}</dd>
          </div>
        </div>
        {event.duration != null ? (
          <div className="flex gap-3 rounded-lg border border-border p-4">
            <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </dt>
              <dd className="mt-1 text-sm">{event.duration} min</dd>
            </div>
          </div>
        ) : null}
        {event.event_type === 'TEAM' ? (
          <div className="flex gap-3 rounded-lg border border-border p-4">
            <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Team size
              </dt>
              <dd className="mt-1 text-sm">
                {event.min_team_size}–{event.max_team_size} members
              </dd>
            </div>
          </div>
        ) : null}
      </dl>
    </div>
  )
}

type EventEditFormProps = {
  event: Event
  onSaved: () => Promise<unknown>
  onDeleted: () => void
}

function EventEditForm({ event, onSaved, onDeleted }: EventEditFormProps) {
  const { updateEvent, deleteEvent, isUpdating, isDeleting, updateError } = useEventMutations()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<EventStatus>(event.status)
  const [location, setLocation] = useState<LocationPickerValue>(
    locationToPickerValue(event.location),
  )
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(event.start_date))
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(
    new Date(event.registration_deadline),
  )
  useEffect(() => {
    setStatus(event.status)
    setLocation(locationToPickerValue(event.location))
    setStartDate(new Date(event.start_date))
    setDeadlineDate(new Date(event.registration_deadline))
  }, [event])

  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    setFieldErrors({})
    setLocationErrors({})
    setFormError(null)

    const form = formEvent.currentTarget
    const parsed = eventUpdateFormSchema.safeParse({
      title: getFormValue(form, 'title'),
      description: getFormValue(form, 'description'),
      status,
      price: getFormValue(form, 'price'),
      start_date: startDate ? toDatetimeLocalValue(startDate) : '',
      registration_deadline: deadlineDate ? toDatetimeLocalValue(deadlineDate) : '',
      is_published: true,
    })

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      setFormError('Please fix the errors below.')
      return
    }

    let locationId: number | null | undefined

    if (hasLocationInput(location)) {
      const locationParsed = locationFormSchema.safeParse(toLocationFormValues(location))
      if (!locationParsed.success) {
        setLocationErrors(getFieldErrors(locationParsed.error))
        setFormError('Please fix the location errors below.')
        return
      }

      try {
        locationId = await resolveEventLocationId(
          toLocationCreatePayload(location),
          event.location,
        )
      } catch (error) {
        setFormError(parseApiError(error).detail || 'Failed to save location.')
        return
      }
    } else {
      locationId = null
    }

    try {
      await updateEvent({
        eventId: event.id,
        data: toEventUpdatePayload(parsed.data, locationId),
      })
      await onSaved()
    } catch {
      // API error handled by mutation state
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <AuthFormError message={updateError?.detail ?? formError} />

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={event.title}
          aria-invalid={Boolean(fieldErrors.title)}
        />
        <FormFieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event.description ?? ''}
          className={cn(inputClassName, 'min-h-24 resize-y')}
          aria-invalid={Boolean(fieldErrors.description)}
        />
        <FormFieldError message={fieldErrors.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as EventStatus)}>
          <SelectTrigger id="status" aria-invalid={Boolean(fieldErrors.status)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormFieldError message={fieldErrors.status} />
      </div>

      <LocationPicker
        value={location}
        onChange={setLocation}
        fieldErrors={locationErrors}
        disabled={isUpdating}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <DateTimePicker
            label="Start date"
            value={startDate}
            onChange={setStartDate}
            disabled={isUpdating}
            hasError={Boolean(fieldErrors.start_date)}
          />
          <FormFieldError message={fieldErrors.start_date} />
        </div>
        <div className="space-y-1">
          <DateTimePicker
            label="Registration deadline"
            value={deadlineDate}
            onChange={setDeadlineDate}
            disabled={isUpdating}
            hasError={Boolean(fieldErrors.registration_deadline)}
          />
          <FormFieldError message={fieldErrors.registration_deadline} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (PLN)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={event.price}
          aria-invalid={Boolean(fieldErrors.price)}
        />
        <FormFieldError message={fieldErrors.price} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            size="lg"
            className="sm:flex-none"
            disabled={isUpdating || isDeleting}
          >
            {isUpdating ? 'Saving…' : 'Save changes'}
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 sm:flex-none">
            <Link to={`/results?eventId=${event.id}`}>
              <ExternalLink className="size-4" aria-hidden />
              View results
            </Link>
          </Button>
        </div>
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Delete this event?</span>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={isDeleting}
              onClick={async () => {
                await deleteEvent(event.id)
                onDeleted()
              }}
            >
              {isDeleting ? 'Deleting…' : 'Yes, delete'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isDeleting}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            disabled={isUpdating || isDeleting}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            Delete event
          </Button>
        )}
      </div>
    </form>
  )
}

export function EventDetailsPage() {
  const { eventId } = useParams()
  const parsedId = Number(eventId)
  const hasValidId = Number.isFinite(parsedId) && parsedId > 0
  const { user, isReady, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { data: event, isLoading, error, refetch } = useEvent(hasValidId ? parsedId : null)

  const canManage = event ? canManageEvent(event, user?.id, user?.role) : false
  const canView = event ? event.is_published || canManage : false

  if (!hasValidId) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
        <p className="text-sm text-muted-foreground">Invalid event id.</p>
        <Button variant="link" className="mt-2 w-fit px-0" asChild>
          <Link to="/">Back to events</Link>
        </Button>
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

      {isLoading || !isReady ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading event...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-12 text-center">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error.detail || 'Failed to load event.'}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : !event || !canView ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">This event is not available.</p>
          <Button variant="link" className="mt-2" asChild>
            <Link to="/">Back to events</Link>
          </Button>
        </div>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">{event.title}</CardTitle>
            <CardDescription>
              {canManage
                ? 'Manage event configuration below. Changes are saved to the server.'
                : 'Event details and location information.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {canManage ? (
              <>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p>
                    Category: <span className="text-foreground">{event.category.name}</span>
                  </p>
                  <p className="mt-1">
                    Type:{' '}
                    <span className="text-foreground">
                      {getEventTypeLabel(event.event_type)}
                    </span>
                  </p>
                  {event.duration != null ? (
                    <p className="mt-1">
                      Duration:{' '}
                      <span className="text-foreground">{event.duration} min</span>
                    </p>
                  ) : null}
                  {event.max_participants != null ? (
                    <p className="mt-1">
                      Max participants:{' '}
                      <span className="text-foreground">{event.max_participants}</span>
                    </p>
                  ) : null}
                </div>
                <EventEditForm
                  event={event}
                  onSaved={refetch}
                  onDeleted={() => navigate('/')}
                />
              </>
            ) : (
              <>
                <EventOverview event={event} />
                <Button asChild variant="outline" className="gap-2 w-fit">
                  <Link to={`/results?eventId=${event.id}`}>
                    <ExternalLink className="size-4" aria-hidden />
                    View results
                  </Link>
                </Button>
              </>
            )}

            {!canManage ? (
              <EventParticipationSection
                event={event}
                isAuthenticated={isAuthenticated}
                userId={user?.id}
              />
            ) : null}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
