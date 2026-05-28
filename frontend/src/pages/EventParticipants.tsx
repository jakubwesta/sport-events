import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ChevronDown, ChevronRight, CheckCircle, Loader2, Trash2, Users } from 'lucide-react'

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
import { useTeamMembers, useParticipationMutations } from '@/hooks/use-teams'
import { formatEventDateTime } from '@/lib/event-display'
import type { Event, Participation, ParticipationStatus } from '@/schemas'

const statusLabel: Record<ParticipationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

function statusVariant(status: ParticipationStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'accepted') return 'default'
  if (status === 'rejected') return 'destructive'
  return 'secondary'
}

function canManageEvent(event: Event, userId: number | undefined, role: string | undefined) {
  if (!userId) return false
  return event.owner_id === userId || role === 'ADMIN'
}

// ── Team members sub-panel ────────────────────────────────────────────────────

function TeamMembersPanel({ teamId }: { teamId: number }) {
  const { data: members, isLoading } = useTeamMembers(teamId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" aria-hidden />
        Loading members…
      </div>
    )
  }

  const list = members ?? []
  if (list.length === 0) {
    return <p className="px-4 py-3 text-xs text-muted-foreground">No members.</p>
  }

  return (
    <ul className="divide-y divide-border/60">
      {list.map((m) => {
        const fn = m.display_first_name ?? m.first_name
        const ln = m.display_last_name ?? m.last_name
        const name = fn && ln ? `${fn} ${ln}` : fn || ln || m.display_email || `User #${m.user_id ?? m.id}`
        const sub = (fn || ln) && m.display_email ? m.display_email : null
        return (
          <li key={m.id} className="flex items-center gap-2 px-6 py-2 text-sm">
            <Users className="size-3 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0">
              <span className="text-foreground">{name}</span>
              {sub ? <span className="ml-1.5 text-xs text-muted-foreground">{sub}</span> : null}
              {m.is_ghost ? <span className="ml-1.5 text-xs text-muted-foreground">(guest)</span> : null}
            </span>
            <Badge variant="outline" className="ml-auto shrink-0 text-xs capitalize">
              {m.status}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

// ── Team participation row ────────────────────────────────────────────────────

type TeamRowProps = {
  participation: Participation
  canManage: boolean
  processingId: number | null
  onMarkAsPaid: (id: number) => void
  onRemove: (id: number) => void
}

function TeamParticipationRow({
  participation,
  canManage,
  processingId,
  onMarkAsPaid,
  onRemove,
}: TeamRowProps) {
  const [expanded, setExpanded] = useState(false)
  const teamName = participation.team?.name ?? `Team #${participation.team_id}`
  const isProcessing = processingId === participation.id

  return (
    <li className="border-b border-border last:border-0">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-left"
            aria-expanded={expanded}
          >
            {expanded
              ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              : <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            }
            <span className="font-medium text-foreground">{teamName}</span>
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Registered {formatEventDateTime(participation.created_at)}
          </p>
          <Badge variant={statusVariant(participation.status)}>
            {statusLabel[participation.status]}
          </Badge>

          {canManage && participation.status === 'pending' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={processingId !== null}
              onClick={() => onMarkAsPaid(participation.id)}
              className="gap-1.5"
            >
              {isProcessing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <CheckCircle className="size-3.5" aria-hidden />
              )}
              Mark as paid
            </Button>
          )}

          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={processingId !== null}
              onClick={() => onRemove(participation.id)}
              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              {isProcessing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="size-3.5" aria-hidden />
              )}
              Remove
            </Button>
          )}
        </div>
      </div>

      {expanded && participation.team_id != null ? (
        <div className="border-t border-border/60 bg-muted/20">
          <TeamMembersPanel teamId={participation.team_id} />
        </div>
      ) : null}
    </li>
  )
}

// ── Individual participation row ──────────────────────────────────────────────

type IndividualRowProps = {
  participation: Participation
  canManage: boolean
  processingId: number | null
  onMarkAsPaid: (id: number) => void
  onRemove: (id: number) => void
}

function IndividualParticipationRow({
  participation,
  canManage,
  processingId,
  onMarkAsPaid,
  onRemove,
}: IndividualRowProps) {
  const isProcessing = processingId === participation.id
  const u = participation.user
  const label = u
    ? [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
    : participation.user_id != null
      ? `User #${participation.user_id}`
      : `Participant #${participation.id}`
  const sublabel = u && (u.first_name || u.last_name) ? u.email : null

  return (
    <li className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {sublabel ? (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Registered {formatEventDateTime(participation.created_at)}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge variant={statusVariant(participation.status)}>
          {statusLabel[participation.status]}
        </Badge>

        {canManage && participation.status === 'pending' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processingId !== null}
            onClick={() => onMarkAsPaid(participation.id)}
            className="gap-1.5"
          >
            {isProcessing ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <CheckCircle className="size-3.5" aria-hidden />
            )}
            Mark as paid
          </Button>
        )}

        {canManage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processingId !== null}
            onClick={() => onRemove(participation.id)}
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            {isProcessing ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-3.5" aria-hidden />
            )}
            Remove
          </Button>
        )}
      </div>
    </li>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
  const { markAsPaid, withdraw, markAsPaidError, withdrawError } = useParticipationMutations()
  const [processingId, setProcessingId] = useState<number | null>(null)

  const canManage = event ? canManageEvent(event, user?.id, user?.role) : false
  const isLoading = !isReady || eventLoading || participationsLoading

  const handleMarkAsPaid = async (participationId: number) => {
    setProcessingId(participationId)
    try {
      await markAsPaid(participationId)
      await refetch()
    } finally {
      setProcessingId(null)
    }
  }

  const handleRemove = async (participationId: number) => {
    setProcessingId(participationId)
    try {
      await withdraw(participationId)
      await refetch()
    } finally {
      setProcessingId(null)
    }
  }

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

  if (!isLoading && event && !canManage) return null

  const participationList = participations ?? []

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
              {participationList.length}{' '}
              {participationList.length === 1 ? 'registration' : 'registrations'}
              {event?.event_type === 'TEAM' ? ' · click a team row to expand members' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(markAsPaidError || withdrawError) && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                {markAsPaidError?.detail ?? withdrawError?.detail ?? 'Action failed.'}
              </div>
            )}

            {participationList.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                No participants have registered yet.
              </p>
            ) : (
              <ul className="rounded-lg border border-border overflow-hidden">
                {participationList.map((participation) =>
                  participation.team_id != null ? (
                    <TeamParticipationRow
                      key={participation.id}
                      participation={participation}
                      canManage={canManage}
                      processingId={processingId}
                      onMarkAsPaid={(id) => void handleMarkAsPaid(id)}
                      onRemove={(id) => void handleRemove(id)}
                    />
                  ) : (
                    <IndividualParticipationRow
                      key={participation.id}
                      participation={participation}
                      canManage={canManage}
                      processingId={processingId}
                      onMarkAsPaid={(id) => void handleMarkAsPaid(id)}
                      onRemove={(id) => void handleRemove(id)}
                    />
                  ),
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
