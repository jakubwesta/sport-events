import { Calendar, MapPin, Tag } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  formatEventDateTime,
  getEventLocationLabel,
  getEventTypeLabel,
} from '@/lib/event-display'
import type { Event } from '@/schemas'

type MapEventListItemProps = {
  event: Event
  isSelected: boolean
  onClick: () => void
}

export function MapEventListItem({ event, isSelected, onClick }: MapEventListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:bg-accent',
      )}
    >
      <p className="truncate text-sm font-medium leading-snug text-foreground">
        {event.title}
      </p>

      <ul className="mt-2 space-y-1">
        <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {event.category.name} · {getEventTypeLabel(event.event_type)}
          </span>
        </li>
        <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{getEventLocationLabel(event)}</span>
        </li>
        <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{formatEventDateTime(event.start_date)}</span>
        </li>
      </ul>
    </button>
  )
}
