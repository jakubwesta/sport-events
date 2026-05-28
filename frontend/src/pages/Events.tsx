import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Loader2, Plus, Search } from 'lucide-react'

import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/use-categories'
import { useAuth, useIsOrganizer } from '@/hooks/use-auth'
import { useEvents } from '@/hooks/use-events'
import { getEventCity, getEventStatusLabel } from '@/lib/event-display'
import type { Event, EventStatus } from '@/schemas'

const POLISH_CITIES = [
  'Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań',
  'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok',
]

const EVENT_STATUSES: EventStatus[] = [
  'PLANNING', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED',
]

function normalizeCity(city: string): string {
  return city.trim().toLowerCase()
}

function eventMatchesSearch(event: Event, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    event.title.toLowerCase().includes(needle) ||
    (event.description ?? '').toLowerCase().includes(needle) ||
    event.category.name.toLowerCase().includes(needle) ||
    getEventCity(event).toLowerCase().includes(needle)
  )
}

function eventMatchesCity(event: Event, cityFilter: string): boolean {
  if (cityFilter === 'all') return true
  return normalizeCity(getEventCity(event)) === cityFilter
}

export function EventsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [city, setCity] = useState('all')
  const [status, setStatus] = useState('all')
  const { user } = useAuth()
  const isOrganizer = useIsOrganizer()

  const categoryId = category === 'all' ? undefined : Number(category)
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch,
  } = useEvents(categoryId != null ? { category_id: categoryId } : undefined)
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const filtered = useMemo(() => {
    return (events ?? [])
      .filter((event) => event.is_published)
      .filter((event) => eventMatchesSearch(event, search))
      .filter((event) => eventMatchesCity(event, city))
      .filter((event) => status === 'all' || event.status === status)
  }, [events, search, city, status])

  const isLoading = eventsLoading || categoriesLoading

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Card className="mb-8 border-border py-0 shadow-sm">
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              placeholder="Search events..."
              type="search"
              aria-label="Search events"
              disabled={isLoading}
            />
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:items-center">
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categories ?? []).map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-36" aria-label="Filter by city">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {POLISH_CITIES.map((c) => (
                  <SelectItem key={c} value={normalizeCity(c)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {EVENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {getEventStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isOrganizer ? (
              <Button asChild className="w-full shrink-0 sm:w-auto">
                <Link to="/events/new">
                  <Plus className="size-4" aria-hidden />
                  Create event
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Events</h2>
        {!isLoading && !eventsError ? (
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'event' : 'events'} found
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading events...
        </div>
      ) : eventsError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-12 text-center">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {eventsError.detail || 'Failed to load events.'}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
          No events match your filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <li key={event.id} className="min-w-0 list-none">
              <EventCard
                event={event}
                canManage={
                  isOrganizer &&
                  user != null &&
                  (event.owner_id === user.id || user.role === 'ADMIN')
                }
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
