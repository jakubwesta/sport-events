import type { EventStatus, EventType, Location } from '@/schemas'

const eventStatusLabels: Record<EventStatus, string> = {
  PLANNING: 'Planning',
  REGISTRATION: 'Registration open',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  POSTPONED: 'Postponed',
}

const eventTypeLabels: Record<EventType, string> = {
  INDIVIDUAL: 'Individual',
  TEAM: 'Team',
}

export function getEventStatusLabel(status: EventStatus): string {
  return eventStatusLabels[status]
}

export function getEventTypeLabel(type: EventType): string {
  return eventTypeLabels[type]
}

export function formatEventDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatEventPrice(price: number): string {
  if (price <= 0) return 'Free'
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(price)
}

export function getEventCity(event: { location?: { city: string } | null }): string {
  return event.location?.city ?? 'Location TBD'
}

export function formatLocationLabel(location: Location): string {
  const name = location.name?.trim()
  if (name) {
    return `${name}, ${location.city}`
  }
  return `${location.address}, ${location.city}`
}

export function getEventLocationLabel(
  event: { location?: Location | null },
): string {
  if (!event.location) return 'Location TBD'
  return formatLocationLabel(event.location)
}

export function getEventLocationAddress(
  event: { location?: Location | null },
): string | null {
  if (!event.location) return null
  return event.location.address
}

export function getEventCapacityLabel(maxParticipants: number | null | undefined): string {
  if (maxParticipants == null || maxParticipants <= 0) {
    return 'Unlimited spots'
  }

  return `Up to ${maxParticipants} ${maxParticipants === 1 ? 'spot' : 'spots'}`
}

export function getEventStatusBadgeVariant(
  status: EventStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'REGISTRATION':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    case 'COMPLETED':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function getEventStatusBadgeClass(status: EventStatus): string {
  switch (status) {
    case 'PLANNING':
      return 'border-border bg-muted/60 text-muted-foreground'
    case 'REGISTRATION':
      return 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
    case 'IN_PROGRESS':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400'
    case 'COMPLETED':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400'
    case 'CANCELLED':
      return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
    case 'POSTPONED':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
    default:
      return 'border-border text-foreground'
  }
}
