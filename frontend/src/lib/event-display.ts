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
