import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Search, Shield, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useUsers, useUserMutations } from '@/hooks/use-users'
import type { User, UserRole } from '@/schemas'

const ROLES: UserRole[] = ['USER', 'ORGANIZER', 'ADMIN']

const roleBadgeClass: Record<UserRole, string> = {
  ADMIN: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
  ORGANIZER: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  USER: 'border-border bg-muted/40 text-muted-foreground',
  GUEST: 'border-border bg-muted/20 text-muted-foreground',
}

function getUserDisplayName(user: User): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return name || user.email
}

type UserRowProps = {
  user: User
  currentUserId: number
  onRoleChanged: () => void
  onDeleted: () => void
}

function UserRow({ user, currentUserId, onRoleChanged, onDeleted }: UserRowProps) {
  const { changeRole, deleteUser, isChangingRole, isDeleting, changeRoleError, deleteError } =
    useUserMutations()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isSelf = user.id === currentUserId
  const isBusy = isChangingRole || isDeleting

  const handleRoleChange = async (role: UserRole) => {
    await changeRole({ userId: user.id, role })
    onRoleChanged()
  }

  const handleDelete = async () => {
    await deleteUser(user.id)
    onDeleted()
  }

  return (
    <li className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground truncate">{getUserDisplayName(user)}</p>
          <Badge variant="outline" className={`text-xs ${roleBadgeClass[user.role] ?? ''}`}>
            {user.role}
          </Badge>
          {isSelf ? (
            <Badge variant="outline" className="text-xs">you</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
        {user.phone_number ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{user.phone_number}</p>
        ) : null}
        {(changeRoleError || deleteError) ? (
          <p className="mt-1 text-xs text-destructive">
            {changeRoleError?.detail ?? deleteError?.detail ?? 'Action failed.'}
          </p>
        ) : null}
      </div>

      {!isSelf ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select
            value={user.role}
            onValueChange={(v) => void handleRoleChange(v as UserRole)}
            disabled={isBusy}
          >
            <SelectTrigger className="h-8 w-32 text-xs" aria-label="Change role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Delete?</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isBusy}
                onClick={() => void handleDelete()}
                className="h-8 px-3 text-xs"
              >
                {isDeleting ? <Loader2 className="size-3 animate-spin" aria-hidden /> : null}
                Confirm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
              disabled={isBusy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Delete
            </Button>
          )}
        </div>
      ) : null}
    </li>
  )
}

export function AdminPage() {
  const navigate = useNavigate()
  const { user, isReady } = useAuth()
  const { data: users, isLoading, error, refetch } = useUsers()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isReady && user?.role !== 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [isReady, user, navigate])

  if (!isReady || user?.role !== 'ADMIN') return null

  const filtered = (users ?? []).filter((u) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      u.email.toLowerCase().includes(q) ||
      (u.first_name ?? '').toLowerCase().includes(q) ||
      (u.last_name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-muted-foreground" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin panel</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage user accounts and roles.
        </p>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9"
          type="search"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading users…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-12 text-center">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error.detail || 'Failed to load users.'}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
              {search ? ` matching "${search}"` : ''}
            </p>
          </div>
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No users found.</p>
          ) : (
            <ul>
              {filtered.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  currentUserId={user.id}
                  onRoleChanged={() => void refetch()}
                  onDeleted={() => void refetch()}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  )
}
