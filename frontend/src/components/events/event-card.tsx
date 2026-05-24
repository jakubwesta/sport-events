import { Link } from 'react-router-dom'
import { Calendar, MapPin, Tag, Users } from 'lucide-react'

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
  getEventCapacityLabel,
  getEventLocationLabel,
  getEventStatusBadgeVariant,
  getEventStatusLabel,
  getEventTypeLabel,
} from '@/lib/event-display'
import type { Event } from '@/schemas'

type EventCardProps = {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const statusLabel = getEventStatusLabel(event.status)
  const statusVariant = getEventStatusBadgeVariant(event.status)

  return (
    <Card className="flex h-full flex-col border-border shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{event.category.name}</Badge>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          {!event.is_published ? (
            <Badge variant="outline">Draft</Badge>
          ) : null}
        </div>

        <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {event.description?.trim() || 'No description provided.'}
        </p>

        <ul className="mt-auto space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <Calendar
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>{formatEventDateTime(event.start_date)}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>{getEventLocationLabel(event)}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Users
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>{getEventCapacityLabel(event.max_participants)}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Tag
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>
              {getEventTypeLabel(event.event_type)} · {formatEventPrice(event.price)}
            </span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-2">
        <Button asChild className="w-full" size="lg">
          <Link to={`/events/${event.id}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
