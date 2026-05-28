import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CalendarDays, Loader2, Plus } from 'lucide-react'

import { EventCard } from '@/components/events/event-card'
import { MyTeamsSection } from '@/components/teams/my-teams-section'
import { Button } from '@/components/ui/button'
import { useAuth, useIsOrganizer } from '@/hooks/use-auth'
import { useEvents, useMyEvents } from '@/hooks/use-events'

function SectionEmptyState({ isOrganizer }: { isOrganizer: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <CalendarDays className="size-8 text-muted-foreground/50" aria-hidden />
      <p className="text-sm text-muted-foreground">
        {isOrganizer
          ? "You haven't created any events yet."
          : "You haven't registered for any events yet."}
      </p>
      {isOrganizer ? (
        <Button asChild size="sm" variant="outline">
          <Link to="/events/new">
            <Plus className="size-4" aria-hidden />
            Create event
          </Link>
        </Button>
      ) : (
        <Button asChild size="sm" variant="outline">
          <Link to="/">Browse events</Link>
        </Button>
      )}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-10 text-center">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        {message}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Loading…
    </div>
  )
}

export function MyEventsPage() {
  const { user } = useAuth()
  const isOrganizer = useIsOrganizer()

  const {
    data: allEvents,
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useEvents()

  const {
    data: registeredEvents,
    isLoading: registeredLoading,
    error: registeredError,
    refetch: refetchRegistered,
  } = useMyEvents()

  const ownedEvents = useMemo(
    () => (allEvents ?? []).filter((e) => e.owner_id === user?.id),
    [allEvents, user?.id],
  )

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Events you organize and events you have registered for.
        </p>
      </div>

      {isOrganizer && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Events I organize
              {!allLoading && !allError && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({ownedEvents.length})
                </span>
              )}
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link to="/events/new">
                <Plus className="size-4" aria-hidden />
                New event
              </Link>
            </Button>
          </div>

          {allLoading ? (
            <LoadingState />
          ) : allError ? (
            <ErrorState
              message={allError.detail || 'Failed to load events.'}
              onRetry={() => void refetchAll()}
            />
          ) : ownedEvents.length === 0 ? (
            <SectionEmptyState isOrganizer />
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ownedEvents.map((event) => (
                <li key={event.id} className="list-none">
                  <EventCard event={event} canManage />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <MyTeamsSection currentUserId={user!.id} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Events I've registered for
          {!registeredLoading && !registeredError && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({(registeredEvents ?? []).length})
            </span>
          )}
        </h2>

        {registeredLoading ? (
          <LoadingState />
        ) : registeredError ? (
          <ErrorState
            message={registeredError.detail || 'Failed to load your registrations.'}
            onRetry={() => void refetchRegistered()}
          />
        ) : (registeredEvents ?? []).length === 0 ? (
          <SectionEmptyState isOrganizer={false} />
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(registeredEvents ?? []).map((event) => (
              <li key={event.id} className="list-none">
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
