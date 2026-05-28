import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { AuthFormError } from '@/components/auth/auth-form-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEventMutations, useEventParticipations } from '@/hooks/use-events'
import { useParticipationMutations, useTeams } from '@/hooks/use-teams'
import type { Event, Participation, ParticipationStatus } from '@/schemas'

const participationStatusLabels: Record<ParticipationStatus, string> = {
  pending: 'Pending approval',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

type EventParticipationSectionProps = {
  event: Event
  isAuthenticated: boolean
  userId?: number
}

function findExistingParticipation(
  participations: Participation[],
  userId: number,
  ownedTeamIds: number[],
): Participation | undefined {
  return participations.find(
    (participation) =>
      participation.user_id === userId ||
      (participation.team_id != null && ownedTeamIds.includes(participation.team_id)),
  )
}

function canRegisterForEvent(event: Event): boolean {
  if (!event.is_published) return false
  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') return false
  return new Date() <= event.registration_deadline
}

export function EventParticipationSection({
  event,
  isAuthenticated,
  userId,
}: EventParticipationSectionProps) {
  const { data: participations, isLoading, refetch } = useEventParticipations(event.id)
  const { data: teams, isLoading: teamsLoading } = useTeams()
  const { participate, isParticipating, participateError } = useEventMutations()
  const { withdraw, isWithdrawing, withdrawError } = useParticipationMutations()
  const [teamId, setTeamId] = useState('')
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)

  const ownedTeams = useMemo(
    () => (teams ?? []).filter((team) => team.owner_id === userId),
    [teams, userId],
  )

  const existingParticipation = useMemo(() => {
    if (!userId || !participations) return undefined
    return findExistingParticipation(
      participations,
      userId,
      ownedTeams.map((team) => team.id),
    )
  }, [participations, userId, ownedTeams])

  const registrationOpen = canRegisterForEvent(event)

  const handleRegister = async () => {
    if (!userId) return
    const payload =
      event.event_type === 'INDIVIDUAL'
        ? { user_id: userId }
        : { team_id: Number(teamId) }

    try {
      await participate({ eventId: event.id, data: payload })
      await refetch()
    } catch {
      // Error shown via participateError
    }
  }

  const handleWithdraw = async () => {
    if (!existingParticipation) return
    try {
      await withdraw(existingParticipation.id)
      await refetch()
      setConfirmWithdraw(false)
    } catch {
      // Error shown via withdrawError
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="border-t border-border pt-6">
        <Button asChild>
          <Link to="/login" state={{ from: `/events/${event.id}` }}>
            Sign in to register
          </Link>
        </Button>
      </div>
    )
  }

  if (isLoading || (event.event_type === 'TEAM' && teamsLoading)) {
    return (
      <div className="flex items-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Checking registration status...
      </div>
    )
  }

  if (existingParticipation) {
    return (
      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">You are registered for this event</p>
            <Badge variant="secondary">
              {participationStatusLabels[existingParticipation.status]}
            </Badge>
          </div>
        </div>

        {withdrawError ? <AuthFormError message={withdrawError.detail ?? null} /> : null}

        {registrationOpen ? (
          confirmWithdraw ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">Cancel your registration?</p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isWithdrawing}
                onClick={() => void handleWithdraw()}
              >
                {isWithdrawing ? 'Withdrawing…' : 'Yes, withdraw'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmWithdraw(false)}
              >
                Keep registration
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              onClick={() => setConfirmWithdraw(true)}
            >
              Withdraw registration
            </Button>
          )
        ) : null}
      </div>
    )
  }

  if (!registrationOpen) {
    return (
      <div className="border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Registration is closed for this event.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div>
        <p className="text-sm font-medium text-foreground">Register for this event</p>
        <p className="text-xs text-muted-foreground">
          {event.event_type === 'TEAM'
            ? 'Select a team you captain to sign up.'
            : 'Submit your registration for this individual event.'}
        </p>
      </div>

      <AuthFormError message={participateError?.detail ?? null} />

      {event.event_type === 'TEAM' ? (
        <div className="space-y-2">
          <Label htmlFor="participation_team">Team</Label>
          {ownedTeams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You need to create a team before registering for a team event.{' '}
              <Link to="/my-events" className="underline underline-offset-4 hover:text-foreground">
                Create one in My Events.
              </Link>
            </p>
          ) : (
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger id="participation_team" className="max-w-sm">
                <SelectValue placeholder="Select your team" />
              </SelectTrigger>
              <SelectContent>
                {ownedTeams.map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={() => void handleRegister()}
        disabled={
          isParticipating ||
          (event.event_type === 'TEAM' && (ownedTeams.length === 0 || !teamId))
        }
      >
        {isParticipating ? 'Registering…' : 'Register for event'}
      </Button>
    </div>
  )
}
