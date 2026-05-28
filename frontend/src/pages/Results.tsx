import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Calendar, Loader2, Plus, Search, Trash2, Trophy } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth, useIsOrganizer } from '@/hooks/use-auth'
import { useEventParticipations, useEvents } from '@/hooks/use-events'
import { useMatchMutations, useMatchesForEvent } from '@/hooks/use-matches'
import { useResultMutations, useResultsForEvent } from '@/hooks/use-results'
import { cn } from '@/lib/utils'
import {
  formatEventDateTime,
  getEventStatusBadgeClass,
  getEventStatusLabel,
  getEventTypeLabel,
} from '@/lib/event-display'
import type {
  AnyResult,
  Event,
  IndividualScoreResultCreate,
  MatchCreate,
  MatchStatus,
  MatchUpdateScore,
  MatchWithParticipations,
  Participation,
  TeamScoreResult,
  TeamScoreResultCreate,
  TimedResultCreate,
} from '@/schemas'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  const rest = ms % 1000
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(rest).padStart(3, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(rest).padStart(3, '0')}`
}

function participantLabel(p: Participation): string {
  if (p.team_id != null) return `Team #${p.team_id}`
  if (p.user_id != null) return `User #${p.user_id}`
  return `#${p.id}`
}

function participantLabelById(participationId: number, participations: Participation[]): string {
  const p = participations.find((x) => x.id === participationId)
  if (!p) return `Participant #${participationId}`
  return participantLabel(p)
}

const matchStatusLabels: Record<MatchStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function matchStatusVariant(status: MatchStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'COMPLETED': return 'default'
    case 'IN_PROGRESS': return 'secondary'
    case 'CANCELLED': return 'destructive'
    default: return 'outline'
  }
}

// ─── Add Match Dialog ────────────────────────────────────────────────────────

type AddMatchDialogProps = {
  event: Event
  participations: Participation[]
  onCreated: () => void
}

function AddMatchDialog({ event, participations, onCreated }: AddMatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [partA, setPartA] = useState('')
  const [partB, setPartB] = useState('')
  const [startTime, setStartTime] = useState('')
  const { createMatch, isCreating, createError, resetCreate } = useMatchMutations()

  const accepted = participations.filter((p) => p.status === 'accepted')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partA || !partB || partA === partB) return
    const data: MatchCreate = {
      event_id: event.id,
      participation_a_id: Number(partA),
      participation_b_id: Number(partB),
      ...(startTime ? { start_time: new Date(startTime) } : {}),
    }
    await createMatch(data)
    setOpen(false)
    setPartA('')
    setPartB('')
    setStartTime('')
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetCreate() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Add match
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add match</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="match-part-a">Team / Participant A</Label>
            <Select value={partA} onValueChange={setPartA} required>
              <SelectTrigger id="match-part-a" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {accepted.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {participantLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="match-part-b">Team / Participant B</Label>
            <Select value={partB} onValueChange={setPartB} required>
              <SelectTrigger id="match-part-b" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {accepted
                  .filter((p) => String(p.id) !== partA)
                  .map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {participantLabel(p)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="match-start">Start time (optional)</Label>
            <Input
              id="match-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          {createError && (
            <p className="text-sm text-destructive">{createError.detail || 'Failed to create match.'}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isCreating || !partA || !partB || partA === partB}>
              {isCreating && <Loader2 className="mr-1 size-4 animate-spin" />}
              Create match
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Update Score Dialog ──────────────────────────────────────────────────────

type UpdateScoreDialogProps = {
  match: MatchWithParticipations
  onUpdated: () => void
}

function UpdateScoreDialog({ match, onUpdated }: UpdateScoreDialogProps) {
  const [open, setOpen] = useState(false)
  const [scoreA, setScoreA] = useState(String(match.team_a_score ?? ''))
  const [scoreB, setScoreB] = useState(String(match.team_b_score ?? ''))
  const [status, setStatus] = useState<MatchStatus>(match.status)
  const { updateScore, isUpdating, updateError, resetUpdate } = useMatchMutations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: MatchUpdateScore = {
      status,
      ...(scoreA !== '' ? { team_a_score: Number(scoreA) } : {}),
      ...(scoreB !== '' ? { team_b_score: Number(scoreB) } : {}),
    }
    await updateScore({ matchId: match.id, data })
    setOpen(false)
    onUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetUpdate() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          Update score
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update match score</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="score-a">
                Score — {participantLabel(match.participation_a)}
              </Label>
              <Input
                id="score-a"
                type="number"
                min={0}
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="score-b">
                Score — {participantLabel(match.participation_b)}
              </Label>
              <Input
                id="score-b"
                type="number"
                min={0}
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="match-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as MatchStatus)}>
              <SelectTrigger id="match-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(matchStatusLabels) as MatchStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{matchStatusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {updateError && (
            <p className="text-sm text-destructive">{updateError.detail || 'Failed to update score.'}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-1 size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Result Dialog ────────────────────────────────────────────────────────

type ResultKind = 'timed' | 'score'

type AddResultDialogProps = {
  event: Event
  participations: Participation[]
  onCreated: () => void
}

function AddResultDialog({ participations, onCreated }: AddResultDialogProps) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<ResultKind>('timed')
  const [participationId, setParticipationId] = useState('')
  const [score, setScore] = useState('')
  const [unit, setUnit] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [ms, setMs] = useState('')
  const [place, setPlace] = useState('')

  const { createIndividualScore, createTimed, isCreating, createError, resetCreate } = useResultMutations()

  const accepted = participations.filter((p) => p.status === 'accepted')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const placeNum = place ? Number(place) : undefined

    if (kind === 'timed') {
      const totalMs =
        (Number(minutes) || 0) * 60_000 +
        (Number(seconds) || 0) * 1_000 +
        (Number(ms) || 0)
      const data: TimedResultCreate = {
        participation_id: Number(participationId),
        total_time_ms: totalMs,
        ...(placeNum ? { place: placeNum } : {}),
      }
      await createTimed(data)
    } else {
      const data: IndividualScoreResultCreate = {
        participation_id: Number(participationId),
        score: Number(score),
        unit: unit.trim(),
        ...(placeNum ? { place: placeNum } : {}),
      }
      await createIndividualScore(data)
    }

    setOpen(false)
    setParticipationId('')
    setScore('')
    setUnit('')
    setMinutes('')
    setSeconds('')
    setMs('')
    setPlace('')
    onCreated()
  }

  const isValid = participationId &&
    (kind === 'timed'
      ? (Number(minutes) || 0) + (Number(seconds) || 0) + (Number(ms) || 0) > 0
      : score && unit)

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetCreate() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Add result
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add result</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-participant">Participant</Label>
            <Select value={participationId} onValueChange={setParticipationId}>
              <SelectTrigger id="res-participant" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {accepted.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {participantLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Result type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as ResultKind)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timed">Timed (mm:ss.ms)</SelectItem>
                <SelectItem value="score">Score (numeric)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {kind === 'timed' ? (
            <div className="space-y-1.5">
              <Label>Time</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number" min={0} placeholder="mm"
                    value={minutes} onChange={(e) => setMinutes(e.target.value)}
                    aria-label="Minutes"
                  />
                  <p className="mt-0.5 text-center text-xs text-muted-foreground">min</p>
                </div>
                <div>
                  <Input
                    type="number" min={0} max={59} placeholder="ss"
                    value={seconds} onChange={(e) => setSeconds(e.target.value)}
                    aria-label="Seconds"
                  />
                  <p className="mt-0.5 text-center text-xs text-muted-foreground">sec</p>
                </div>
                <div>
                  <Input
                    type="number" min={0} max={999} placeholder="000"
                    value={ms} onChange={(e) => setMs(e.target.value)}
                    aria-label="Milliseconds"
                  />
                  <p className="mt-0.5 text-center text-xs text-muted-foreground">ms</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="res-score">Score</Label>
                <Input
                  id="res-score" type="number" step="any"
                  value={score} onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 24.87"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-unit">Unit</Label>
                <Input
                  id="res-unit" type="text"
                  value={unit} onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. pts, s, m"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="res-place">Place (optional)</Label>
            <Input
              id="res-place" type="number" min={1}
              value={place} onChange={(e) => setPlace(e.target.value)}
              placeholder="1"
            />
          </div>

          {createError && (
            <p className="text-sm text-destructive">{createError.detail || 'Failed to add result.'}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isCreating || !isValid}>
              {isCreating && <Loader2 className="mr-1 size-4 animate-spin" />}
              Save result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Team Score Dialog ────────────────────────────────────────────────────

type AddTeamScoreDialogProps = {
  participations: Participation[]
  onCreated: () => void
}

function AddTeamScoreDialog({ participations, onCreated }: AddTeamScoreDialogProps) {
  const [open, setOpen] = useState(false)
  const [participationId, setParticipationId] = useState('')
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win')
  const [goalsScored, setGoalsScored] = useState('')
  const [goalsConceded, setGoalsConceded] = useState('')
  const [place, setPlace] = useState('')

  const { createTeamScore, isCreating, createError, resetCreate } = useResultMutations()

  const accepted = participations.filter((p) => p.status === 'accepted')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: TeamScoreResultCreate = {
      participation_id: Number(participationId),
      result,
      goals_scored: Number(goalsScored) || 0,
      goals_conceded: Number(goalsConceded) || 0,
      ...(place ? { place: Number(place) } : {}),
    }
    await createTeamScore(data)
    setOpen(false)
    setParticipationId('')
    setResult('win')
    setGoalsScored('')
    setGoalsConceded('')
    setPlace('')
    onCreated()
  }

  const isValid = participationId && goalsScored !== '' && goalsConceded !== ''

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetCreate() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Add standing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team standing</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ts-participant">Team</Label>
            <Select value={participationId} onValueChange={setParticipationId}>
              <SelectTrigger id="ts-participant" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {accepted.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {participantLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ts-result">Result</Label>
            <Select value={result} onValueChange={(v) => setResult(v as typeof result)}>
              <SelectTrigger id="ts-result" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="draw">Draw</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ts-scored">Goals scored</Label>
              <Input
                id="ts-scored"
                type="number"
                min={0}
                value={goalsScored}
                onChange={(e) => setGoalsScored(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ts-conceded">Goals conceded</Label>
              <Input
                id="ts-conceded"
                type="number"
                min={0}
                value={goalsConceded}
                onChange={(e) => setGoalsConceded(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ts-place">Overall place (optional)</Label>
            <Input
              id="ts-place"
              type="number"
              min={1}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="1"
            />
          </div>

          {createError && (
            <p className="text-sm text-destructive">{createError.detail || 'Failed to add standing.'}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isCreating || !isValid}>
              {isCreating && <Loader2 className="mr-1 size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Team Standings Panel ─────────────────────────────────────────────────────

type TeamStandingsPanelProps = {
  event: Event
  participations: Participation[]
  canManage: boolean
  onRefetch: () => void
}

function TeamStandingsPanel({ event, participations, canManage, onRefetch }: TeamStandingsPanelProps) {
  const { data: results, isLoading, error, refetch } = useResultsForEvent(event.id)
  const { deleteResult, isDeleting } = useResultMutations()

  const standings = useMemo(() => {
    const teamResults = (results ?? []).filter((r): r is TeamScoreResult => r.type === 'team_score')
    return [...teamResults].sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity))
  }, [results])

  const handleDelete = async (resultId: number) => {
    await deleteResult(resultId)
    void refetch()
    onRefetch()
  }

  const handleCreated = () => {
    void refetch()
    onRefetch()
  }

  if (isLoading) return (
    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Loading standings…
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {error.detail || 'Failed to load standings.'}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Standings ({standings.length})
        </h3>
        {canManage && (
          <AddTeamScoreDialog participations={participations} onCreated={handleCreated} />
        )}
      </div>

      {standings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No standings recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {standings.map((standing, idx) => {
            const rank = standing.place ?? idx + 1
            return (
              <li key={standing.id} className="flex items-center gap-4 px-4 py-3">
                <span className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  rank === 1 && 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
                  rank === 2 && 'bg-zinc-300/30 text-zinc-600 dark:text-zinc-300',
                  rank === 3 && 'bg-amber-700/20 text-amber-700 dark:text-amber-500',
                  rank > 3 && 'bg-muted text-muted-foreground',
                )}>
                  {rank}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {participantLabelById(standing.participation_id, participations)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTeamScore(standing)}</p>
                </div>

                {canManage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={isDeleting}
                    onClick={() => void handleDelete(standing.id)}
                    aria-label="Delete standing"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Matches Panel ────────────────────────────────────────────────────────────

type MatchesPanelProps = {
  event: Event
  canManage: boolean
  participations: Participation[]
  onRefetchParticipations: () => void
}

function MatchesPanel({ event, canManage, participations, onRefetchParticipations }: MatchesPanelProps) {
  const {
    data: matches,
    isLoading,
    error,
    refetch,
  } = useMatchesForEvent(event.id)
  const { deleteMatch, isDeleting } = useMatchMutations()

  const handleRefetch = () => {
    void refetch()
    onRefetchParticipations()
  }

  const handleDelete = async (matchId: number) => {
    await deleteMatch(matchId)
    void refetch()
  }

  if (isLoading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Loading matches…
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {error.detail || 'Failed to load matches.'}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Matches ({(matches ?? []).length})
        </h3>
        {canManage && (
          <AddMatchDialog
            event={event}
            participations={participations}
            onCreated={handleRefetch}
          />
        )}
      </div>

      {(matches ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          No matches yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(matches ?? []).map((match) => (
            <li key={match.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">
                  {participantLabel(match.participation_a)}
                  <span className="mx-2 font-bold text-muted-foreground">
                    {match.team_a_score != null && match.team_b_score != null
                      ? `${match.team_a_score} : ${match.team_b_score}`
                      : 'vs'}
                  </span>
                  {participantLabel(match.participation_b)}
                </p>
                {match.start_time && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" aria-hidden />
                    {formatEventDateTime(match.start_time)}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={matchStatusVariant(match.status)}>
                  {matchStatusLabels[match.status]}
                </Badge>
                {canManage && (
                  <>
                    <UpdateScoreDialog match={match} onUpdated={() => void refetch()} />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isDeleting}
                      onClick={() => void handleDelete(match.id)}
                      aria-label="Delete match"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Individual Results Panel ─────────────────────────────────────────────────

const UNIT_TO_MS: Record<string, number> = {
  ms: 1, milliseconds: 1,
  s: 1000, sec: 1000, secs: 1000, seconds: 1000,
  sekundy: 1000, sekunda: 1000, sekund: 1000,
  min: 60_000, mins: 60_000, minutes: 60_000,
  minuty: 60_000, minuta: 60_000,
  h: 3_600_000, hr: 3_600_000, hrs: 3_600_000, hours: 3_600_000,
}

const RESULT_LABELS: Record<string, string> = { win: 'W', loss: 'L', draw: 'D' }

function formatTeamScore(result: TeamScoreResult): string {
  const label = RESULT_LABELS[result.result.toLowerCase()] ?? result.result.toUpperCase()
  return `${label}  ${result.goals_scored}–${result.goals_conceded}`
}

function formatResultValue(result: AnyResult): string {
  if (result.type === 'timed') return formatMs(result.total_time_ms)
  if (result.type === 'individual_score') {
    const factor = UNIT_TO_MS[result.unit.toLowerCase().trim()]
    if (factor != null) return formatMs(Math.round(result.score * factor))
    return `${result.score} ${result.unit}`
  }
  if (result.type === 'team_score') return formatTeamScore(result)
  return ''
}

type IndividualResultsPanelProps = {
  event: Event
  canManage: boolean
}

function IndividualResultsPanel({ event, canManage }: IndividualResultsPanelProps) {
  const { data: participationsData, refetch: refetchParticipations } = useEventParticipations(event.id)
  const participations = participationsData ?? []
  const { data: results, isLoading, error, refetch } = useResultsForEvent(event.id)
  const { deleteResult, isDeleting } = useResultMutations()

  const sorted = useMemo(() => {
    if (!results) return []
    return [...results].sort((a, b) => {
      const pa = a.place ?? Infinity
      const pb = b.place ?? Infinity
      if (pa !== pb) return pa - pb
      // secondary sort: lower timed or score wins
      if (a.type === 'timed' && b.type === 'timed') return a.total_time_ms - b.total_time_ms
      if (a.type === 'individual_score' && b.type === 'individual_score') return a.score - b.score
      return 0
    })
  }, [results])

  const handleRefetch = () => {
    void refetch()
    void refetchParticipations()
  }

  const handleDelete = async (resultId: number) => {
    await deleteResult(resultId)
    void refetch()
  }

  if (isLoading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Loading results…
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {error.detail || 'Failed to load results.'}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Results ({sorted.length})
        </h3>
        {canManage && (
          <AddResultDialog
            event={event}
            participations={participations}
            onCreated={handleRefetch}
          />
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          No results recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {sorted.map((result, idx) => (
            <li
              key={result.id}
              className="flex items-center gap-4 px-4 py-3"
            >
              <span className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                (result.place ?? idx + 1) === 1 && 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
                (result.place ?? idx + 1) === 2 && 'bg-zinc-300/30 text-zinc-600 dark:text-zinc-300',
                (result.place ?? idx + 1) === 3 && 'bg-amber-700/20 text-amber-700 dark:text-amber-500',
                (result.place ?? idx + 1) > 3 && 'bg-muted text-muted-foreground',
              )}>
                {result.place ?? idx + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {participantLabelById(result.participation_id, participations)}
                </p>
                <p className="text-xs text-muted-foreground">{formatResultValue(result)}</p>
              </div>

              {canManage && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                  onClick={() => void handleDelete(result.id)}
                  aria-label="Delete result"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Team Event Panels (matches + standings) ──────────────────────────────────

type TeamEventPanelsProps = {
  event: Event
  canManage: boolean
}

function TeamEventPanels({ event, canManage }: TeamEventPanelsProps) {
  const { data: participationsData, refetch: refetchParticipations } = useEventParticipations(event.id)
  const participations = participationsData ?? []

  return (
    <>
      <MatchesPanel event={event} canManage={canManage} participations={participations} onRefetchParticipations={refetchParticipations} />
      <div className="border-t border-border pt-5">
        <TeamStandingsPanel
          event={event}
          participations={participations}
          canManage={canManage}
          onRefetch={refetchParticipations}
        />
      </div>
    </>
  )
}

// ─── Results Panel (event detail) ────────────────────────────────────────────

type ResultsPanelProps = {
  event: Event
  canManage: boolean
}

function ResultsPanel({ event, canManage }: ResultsPanelProps) {
  return (
    <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border bg-card shadow-sm">
    <div className="flex flex-col gap-5 px-5 py-5">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{event.category.name}</Badge>
          <Badge variant="outline">{getEventTypeLabel(event.event_type)}</Badge>
          <Badge variant="outline" className={getEventStatusBadgeClass(event.status)}>
            {getEventStatusLabel(event.status)}
          </Badge>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">{event.title}</h2>
        {event.location && (
          <p className="text-sm text-muted-foreground">
            {event.location.city} · {formatEventDateTime(event.start_date)}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-6">
        {event.event_type === 'TEAM' ? (
          <TeamEventPanels event={event} canManage={canManage} />
        ) : (
          <IndividualResultsPanel event={event} canManage={canManage} />
        )}
      </div>
    </div>
    </ScrollArea>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ResultsPage() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const isOrganizer = useIsOrganizer()

  const [searchParams] = useSearchParams()
  const initialEventId = Number(searchParams.get('eventId')) || null
  const [selectedId, setSelectedId] = useState<number | null>(initialEventId)

  const { data: eventsData, isLoading } = useEvents()

  const filtered = useMemo(() => {
    const events = eventsData ?? []
    const q = search.trim().toLowerCase()
    return events.filter((e) =>
      e.is_published &&
      (!q ||
        e.title.toLowerCase().includes(q) ||
        e.category.name.toLowerCase().includes(q) ||
        (e.location?.city ?? '').toLowerCase().includes(q)),
    )
  }, [eventsData, search])

  const selectedEvent = useMemo(
    () => filtered.find((e) => e.id === selectedId) ?? null,
    [filtered, selectedId],
  )

  const canManage = (event: Event) =>
    isOrganizer && user != null && (event.owner_id === user.id || user.role === 'ADMIN')

  return (
    <main className="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col gap-4 overflow-hidden px-4 py-6 sm:px-6">
      <h1 className="shrink-0 text-2xl font-bold tracking-tight text-foreground">Results</h1>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        {/* Event list */}
        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-3 lg:h-full lg:w-80 lg:max-w-xs">
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              type="search"
              className="pl-9"
              disabled={isLoading}
              aria-label="Search events"
            />
          </div>

          <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border bg-card shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No events found.</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(event.id === selectedId ? null : event.id)}
                      className={cn(
                        'w-full px-4 py-3 text-left transition-colors',
                        selectedId === event.id
                          ? 'bg-primary/5 text-foreground'
                          : 'hover:bg-accent',
                      )}
                    >
                      <p className="truncate text-sm font-medium leading-snug text-foreground">
                        {event.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{event.category.name}</span>
                        <span>·</span>
                        <span>{getEventTypeLabel(event.event_type)}</span>
                        {event.location && (
                          <>
                            <span>·</span>
                            <span>{event.location.city}</span>
                          </>
                        )}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </aside>

        {/* Results panel */}
        {selectedEvent ? (
          <ResultsPanel event={selectedEvent} canManage={canManage(selectedEvent)} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 text-center">
            <Trophy className="size-10 text-muted-foreground/30" aria-hidden />
            <p className="text-sm text-muted-foreground">Select an event to view its results.</p>
          </div>
        )}
      </div>
    </main>
  )
}
