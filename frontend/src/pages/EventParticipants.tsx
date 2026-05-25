import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useEvent, useEventParticipations } from '@/hooks/use-events'
import { formatEventDateTime } from '@/lib/event-display'
import type { Event, Participation, ParticipationStatus } from '@/schemas'

const participationStatusLabels: Record<ParticipationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

function getParticipationStatusVariant(
  status: ParticipationStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'accepted':
      return 'default'
    case 'rejected':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getParticipantLabel(participation: Participation, event: Event): string {
  if (event.event_type === 'TEAM' && participation.team_id != null) {
    return `Team #${participation.team_id}`
  }
  if (participation.user_id != null) {
    return `User #${participation.user_id}`
  }
  return `Participant #${participation.id}`
}

function canManageEvent(event: Event, userId: number | undefined, role: string | undefined) {
  if (!userId) return false
  return event.owner_id === userId || role === 'ADMIN'
}

export function EventParticipantsPage() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const parsedId = Number(eventId)
  const hasValidId = Number.isFinite(parsedId) && parsedId > 0
  const { user, isReady } = useAuth()
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(
    hasValidId ? parsedId : null,
  )
  const {
    data: participations,
    isLoading: participationsLoading,
    error: participationsError,
    refetch,
  } = useEventParticipations(hasValidId ? parsedId : null)

  const canManage = event ? canManageEvent(event, user?.id, user?.role) : false
  const isLoading = !isReady || eventLoading || participationsLoading

  useEffect(() => {
    if (!isLoading && event && !canManage) {
      navigate(`/events/${event.id}`, { replace: true })
    }
  }, [isLoading, event, canManage, navigate])

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

  if (!isLoading && event && !canManage) {
    return null
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4 w-fit gap-2" asChild>
        <Link to={`/events/${parsedId}`}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to event
        </Link>
      </Button>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading participants...
        </div>
      ) : eventError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-12 text-center">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {eventError.detail || 'Failed to load event.'}
          </div>
        </div>
      ) : participationsError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-12 text-center">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {participationsError.detail || 'Failed to load participants.'}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">
              {event?.title ?? 'Event'} — participants
            </CardTitle>
            <CardDescription>
              {(participations ?? []).length}{' '}
              {(participations ?? []).length === 1 ? 'registration' : 'registrations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(participations ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                No participants have registered yet.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {(participations ?? []).map((participation) => (
                  <li
                    key={participation.id}
                    className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {event ? getParticipantLabel(participation, event) : `#${participation.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered {formatEventDateTime(participation.created_at)}
                      </p>
                    </div>
                    <Badge variant={getParticipationStatusVariant(participation.status)}>
                      {participationStatusLabels[participation.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
