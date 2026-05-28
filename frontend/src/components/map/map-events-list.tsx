import { Loader2 } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MapEventListItem } from '@/components/map/map-event-list-item'
import type { Event } from '@/schemas'

type MapEventsListProps = {
  events: Event[]
  selectedEventId: number | null
  onSelectEvent: (id: number) => void
  isLoading?: boolean
  className?: string
}

export function MapEventsList({
  events,
  selectedEventId,
  onSelectEvent,
  isLoading = false,
  className,
}: MapEventsListProps) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
    >
      <div className="shrink-0 border-b border-border px-4 py-3.5">
        <h2 className="flex items-baseline gap-1.5 text-base font-semibold tracking-tight text-foreground">
          Events
          {!isLoading && (
            <span className="text-sm font-normal text-muted-foreground">
              ({events.length})
            </span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading…
        </div>
      ) : events.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No events match the current filters.
        </p>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <ul className="space-y-2 px-3 py-3">
            {events.map((event) => (
              <li key={event.id}>
                <MapEventListItem
                  event={event}
                  isSelected={selectedEventId === event.id}
                  onClick={() => onSelectEvent(event.id)}
                />
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}
