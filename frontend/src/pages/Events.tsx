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
import { getEventCity } from '@/lib/event-display'
import type { Event } from '@/schemas'

type EventScope = 'all' | 'mine'

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
  const [eventScope, setEventScope] = useState<EventScope>('all')
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

  const cityOptions = useMemo(() => {
    const cities = new Set<string>()

    for (const event of events ?? []) {
      const eventCity = getEventCity(event)
      if (eventCity !== 'Location TBD') {
        cities.add(eventCity)
      }
    }

    return Array.from(cities).sort((a, b) => a.localeCompare(b))
  }, [events])

  const filtered = useMemo(() => {
    const showMine = isOrganizer && eventScope === 'mine' && user != null

    return (events ?? [])
      .filter((event) => (showMine ? event.owner_id === user.id : event.is_published))
      .filter((event) => eventMatchesSearch(event, search))
      .filter((event) => eventMatchesCity(event, city))
  }, [events, search, city, eventScope, isOrganizer, user])

  const isLoading = eventsLoading || categoriesLoading
  const isMyEventsView = isOrganizer && eventScope === 'mine'

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
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            {isOrganizer ? (
              <Select
                value={eventScope}
                onValueChange={(value) => setEventScope(value as EventScope)}
                disabled={isLoading}
              >
                <SelectTrigger
                  className="w-full sm:w-44"
                  aria-label="Event scope"
                >
                  <SelectValue placeholder="Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="mine">My events</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger
                className="w-full sm:w-44"
                aria-label="Filter by category"
              >
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
              <SelectTrigger
                className="w-full sm:w-44"
                aria-label="Filter by city"
              >
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cityOptions.map((item) => (
                  <SelectItem key={item} value={normalizeCity(item)}>
                    {item}
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {isMyEventsView ? 'My events' : 'Upcoming events'}
        </h2>
        {!isLoading && !eventsError ? (
          <p className="text-sm text-muted-foreground">
            Found: {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
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
          {isMyEventsView
            ? 'You have no events yet. Create one to get started.'
            : 'No published events match your filters. Try adjusting search or filters.'}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <li key={event.id} className="min-w-0 list-none">
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
