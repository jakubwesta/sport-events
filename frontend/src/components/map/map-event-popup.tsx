import { Calendar, MapPin, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  formatEventDateTime,
  formatEventPrice,
  getEventLocationLabel,
  getEventStatusBadgeClass,
  getEventStatusLabel,
  getEventTypeLabel,
} from '@/lib/event-display'
import type { Event } from '@/schemas'

type MapEventPopupProps = {
  event: Event
}

export function MapEventPopup({ event }: MapEventPopupProps) {
  return (
    <div className="w-56 space-y-3 p-3">
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {event.category.name}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${getEventStatusBadgeClass(event.status)}`}
          >
            {getEventStatusLabel(event.status)}
          </Badge>
        </div>
        <p className="text-sm font-semibold leading-snug text-foreground">
          {event.title}
        </p>
      </div>

      <ul className="space-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-start gap-1.5">
          <Tag className="mt-0.5 size-3 shrink-0" aria-hidden />
          <span>
            {getEventTypeLabel(event.event_type)} · {formatEventPrice(event.price)}
          </span>
        </li>
        <li className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
          <span>{getEventLocationLabel(event)}</span>
        </li>
        <li className="flex items-start gap-1.5">
          <Calendar className="mt-0.5 size-3 shrink-0" aria-hidden />
          <span>{formatEventDateTime(event.start_date)}</span>
        </li>
      </ul>

      <Link
        to={`/events/${event.id}`}
        data-slot="button"
        data-variant="default"
        className={cn(
          buttonVariants({ variant: 'default', size: 'sm' }),
          'map-event-popup-link w-full',
        )}
      >
        View details
      </Link>
    </div>
  )
}
