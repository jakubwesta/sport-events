import { Link } from 'react-router-dom'
import { Calendar, MapPin, Tag } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import {
  formatEventDateTime,
  formatEventPrice,
  getEventLocationLabel,
  getEventStatusBadgeClass,
  getEventStatusLabel,
  getEventTypeLabel,
} from '@/lib/event-display'
import type { Event } from '@/schemas'

type EventCardProps = {
  event: Event
  canManage?: boolean
}

export function EventCard({ event, canManage = false }: EventCardProps) {
  return (
    <Card className="flex h-full flex-col gap-0 border-border py-0 shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-2 px-4 py-3">
        <CardTitle className="text-base leading-snug">{event.title}</CardTitle>

        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="secondary" className="text-xs">{event.category.name}</Badge>
          <Badge
            variant="outline"
            className={`text-xs ${getEventStatusBadgeClass(event.status)}`}
          >
            {getEventStatusLabel(event.status)}
          </Badge>
          {!event.is_published ? (
            <Badge variant="outline" className="text-xs">Draft</Badge>
          ) : null}
        </div>

        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Calendar className="size-3 shrink-0 text-foreground/60" aria-hidden />
            <span className="truncate">{formatEventDateTime(event.start_date)}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0 text-foreground/60" aria-hidden />
            <span className="truncate">{getEventLocationLabel(event)}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Tag className="size-3 shrink-0 text-foreground/60" aria-hidden />
            <span className="truncate">
              {getEventTypeLabel(event.event_type)} · {formatEventPrice(event.price)}
            </span>
          </li>
        </ul>
      </CardContent>

      <CardFooter className="flex gap-2 px-4 py-3">
        {canManage ? (
          <Button asChild variant="secondary" className="flex-1" size="sm">
            <Link to={`/events/${event.id}/participants`}>Participants</Link>
          </Button>
        ) : null}
        {event.status === 'COMPLETED' ? (
          <Button asChild variant="outline" className="flex-1" size="sm">
            <Link to={`/results?eventId=${event.id}`}>Results</Link>
          </Button>
        ) : null}
        <Button asChild className={canManage || event.status === 'COMPLETED' ? 'flex-1' : 'w-full'} size="sm">
          <Link to={`/events/${event.id}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
