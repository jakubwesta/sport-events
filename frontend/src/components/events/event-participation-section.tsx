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
import { useTeams } from '@/hooks/use-teams'
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
  const [teamId, setTeamId] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    setSuccessMessage(null)

    const payload =
      event.event_type === 'INDIVIDUAL'
        ? { user_id: userId }
        : { team_id: Number(teamId) }

    try {
      await participate({ eventId: event.id, data: payload })
      await refetch()
      setSuccessMessage('Your registration has been submitted.')
    } catch {
      // Error shown via participateError
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
      <div className="space-y-2 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">You are registered for this event</p>
        <Badge variant="secondary">
          {participationStatusLabels[existingParticipation.status]}
        </Badge>
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

      {successMessage ? (
        <p className="text-sm text-foreground">{successMessage}</p>
      ) : null}

      {event.event_type === 'TEAM' ? (
        <div className="space-y-2">
          <Label htmlFor="participation_team">Team</Label>
          {ownedTeams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You need to create a team before registering for a team event.
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
