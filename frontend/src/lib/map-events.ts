import { DEFAULT_MAP_CENTER } from '@/lib/leaflet'
import type { Event } from '@/schemas'

type MapEventFilters = {
  categoryId?: number
  cityQuery?: string
  nameQuery?: string
  statusFilter?: string
}

export function filterMapEvents(events: Event[], filters: MapEventFilters): Event[] {
  return events.filter((event) => {
    if (!event.location) return false

    const city = filters.cityQuery?.trim().toLowerCase()
    if (city && !event.location.city.toLowerCase().includes(city)) return false

    const name = filters.nameQuery?.trim().toLowerCase()
    if (name && !event.title.toLowerCase().includes(name)) return false

    if (filters.statusFilter && filters.statusFilter !== 'all' && event.status !== filters.statusFilter) return false

    return true
  })
}

export function getMapCenterFromEvents(events: Event[]): [number, number] {
  const located = events.filter((e) => e.location != null)
  if (located.length === 0) return DEFAULT_MAP_CENTER

  const lat = located.reduce((sum, e) => sum + e.location!.latitude, 0) / located.length
  const lng = located.reduce((sum, e) => sum + e.location!.longitude, 0) / located.length

  return [lat, lng]
}
