import { Calendar, MapPin, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"

export type EventCardData = {
  id: string
  category: string
  title: string
  description: string
  /** Display string, e.g. "15.06.2026 at 09:00" */
  dateTimeLabel: string
  city: string
  participantsCurrent: number
  participantsMax: number
}

type EventCardProps = {
  event: EventCardData
  onViewDetails?: (event: EventCardData) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  return (
    <Card className="flex h-full flex-col border-border shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">{event.category}</Badge>
          <Badge variant="outline">Available spots</Badge>
        </div>

        <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        <ul className="mt-auto space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <Calendar
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>{event.dateTimeLabel}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>{event.city}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Users
              className="mt-0.5 size-4 shrink-0 text-foreground/70"
              aria-hidden
            />
            <span>
              {event.participantsCurrent} / {event.participantsMax} participants
            </span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={() => onViewDetails?.(event)}
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  )
}
