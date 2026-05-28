import { useState } from 'react'
import { Loader2, Plus, Trash2, Users } from 'lucide-react'


import { AuthFormError } from '@/components/auth/auth-form-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTeamMembers, useTeamMutations, useTeams } from '@/hooks/use-teams'
import type { Team } from '@/schemas'

// ── Single team member list ───────────────────────────────────────────────────

type TeamMembersProps = {
  team: Team
  currentUserId: number
}

function TeamMembersPanel({ team, currentUserId }: TeamMembersProps) {
  const { data: members, isLoading, refetch } = useTeamMembers(team.id)
  const { removeMember, isRemovingMember, removeMemberError, addMember, isAddingMember, addMemberError } =
    useTeamMutations()

  const [addMode, setAddMode] = useState<false | 'ghost'>(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleAddGhost = async () => {
    if (!firstName.trim() || !lastName.trim()) return
    await addMember({ teamId: team.id, data: { first_name: firstName.trim(), last_name: lastName.trim() } })
    await refetch()
    setFirstName('')
    setLastName('')
    setAddMode(false)
  }

  const handleRemove = async (memberId: number) => {
    await removeMember({ teamId: team.id, memberId })
    await refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Loading members…
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-3">
      {addMemberError ? <AuthFormError message={addMemberError.detail ?? null} /> : null}
      {removeMemberError ? <AuthFormError message={removeMemberError.detail ?? null} /> : null}

      {(members ?? []).length === 0 ? (
        <p className="text-xs text-muted-foreground">No members yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {(members ?? []).map((m) => {
            const fn = m.display_first_name ?? m.first_name
            const ln = m.display_last_name ?? m.last_name
            const name = fn && ln ? `${fn} ${ln}` : fn || ln || m.display_email || `User #${m.user_id ?? m.id}`
            const isOwner = m.user_id === currentUserId
            return (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
              >
                <span className="truncate text-foreground">
                  {name}
                  {m.is_ghost ? (
                    <span className="ml-1.5 text-xs text-muted-foreground">(guest)</span>
                  ) : null}
                  {isOwner ? (
                    <span className="ml-1.5 text-xs text-muted-foreground">(you — captain)</span>
                  ) : null}
                </span>
                {!isOwner ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={isRemovingMember}
                    onClick={() => void handleRemove(m.id)}
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {addMode === 'ghost' ? (
        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Add guest member</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`fn-${team.id}`} className="text-xs">First name</Label>
              <Input
                id={`fn-${team.id}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jan"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`ln-${team.id}`} className="text-xs">Last name</Label>
              <Input
                id={`ln-${team.id}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kowalski"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleAddGhost()}
              disabled={isAddingMember || !firstName.trim() || !lastName.trim()}
            >
              {isAddingMember ? 'Adding…' : 'Add'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setAddMode(false); setFirstName(''); setLastName('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setAddMode('ghost')}
        >
          <Plus className="size-3.5" aria-hidden />
          Add guest member
        </Button>
      )}
    </div>
  )
}

// ── Single team card ──────────────────────────────────────────────────────────

type TeamCardProps = {
  team: Team
  currentUserId: number
  onDeleted: () => void
}

function TeamCard({ team, currentUserId, onDeleted }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { deleteTeam, isDeletingTeam, deleteTeamError } = useTeamMutations()

  const handleDelete = async () => {
    await deleteTeam(team.id)
    onDeleted()
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate text-sm font-medium text-foreground">{team.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setExpanded((v) => !v); setConfirmDelete(false) }}
          >
            {expanded ? 'Hide' : 'Manage'}
          </Button>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete team ${team.name}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>

      {confirmDelete ? (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {deleteTeamError ? (
            <p className="text-xs text-destructive">{deleteTeamError.detail ?? 'Failed to delete team.'}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">Delete <span className="font-medium text-foreground">{team.name}</span>? This cannot be undone.</p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeletingTeam}
              onClick={() => void handleDelete()}
            >
              {isDeletingTeam ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
              {isDeletingTeam ? 'Deleting…' : 'Yes, delete'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {expanded && !confirmDelete ? (
        <div className="border-t border-border px-4 pb-4">
          <TeamMembersPanel team={team} currentUserId={currentUserId} />
        </div>
      ) : null}
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────

type MyTeamsSectionProps = {
  currentUserId: number
}

export function MyTeamsSection({ currentUserId }: MyTeamsSectionProps) {
  const { data: teams, isLoading, refetch } = useTeams()
  const { createTeam, isCreating, createError } = useTeamMutations()

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  const ownedTeams = (teams ?? []).filter((t) => t.owner_id === currentUserId)

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createTeam({ name: newName.trim() })
    await refetch()
    setNewName('')
    setShowCreate(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          My teams
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({ownedTeams.length})
            </span>
          )}
        </h2>
        {!showCreate ? (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" aria-hidden />
            New team
          </Button>
        ) : null}
      </div>

      {showCreate ? (
        <div className="space-y-3 rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
          {createError ? <AuthFormError message={createError.detail ?? null} /> : null}
          <div className="space-y-1.5">
            <Label htmlFor="new-team-name">Team name</Label>
            <Input
              id="new-team-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Warsaw Eagles"
              className="max-w-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate() }}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void handleCreate()} disabled={isCreating || !newName.trim()}>
              {isCreating ? 'Creating…' : 'Create team'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowCreate(false); setNewName('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading teams…
        </div>
      ) : ownedTeams.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
          <Users className="size-8 text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground">
            You haven't created any teams yet. Create one to register for team events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ownedTeams.map((team) => (
            <TeamCard key={team.id} team={team} currentUserId={currentUserId} onDeleted={() => void refetch()} />
          ))}
        </div>
      )}
    </section>
  )
}
