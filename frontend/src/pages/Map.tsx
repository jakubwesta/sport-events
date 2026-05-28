import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { CircleMarker as LeafletCircleMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertCircle, Loader2 } from 'lucide-react'

import { MapEventPopup } from '@/components/map/map-event-popup'
import { MapEventsList } from '@/components/map/map-events-list'
import { MapFiltersCard } from '@/components/map/map-filters-card'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/hooks/use-categories'
import { useEvents } from '@/hooks/use-events'
import {
  useThemeMarkerColors,
  type ThemeMarkerColors,
} from '@/hooks/use-theme-colors'
import { filterMapEvents, getMapCenterFromEvents } from '@/lib/map-events'
import type { Event } from '@/schemas'

function MapResizeHandler() {
  const map = useMap()

  useEffect(() => {
    const refresh = () => map.invalidateSize()
    const timeout = window.setTimeout(refresh, 0)
    window.addEventListener('resize', refresh)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('resize', refresh)
    }
  }, [map])

  return null
}

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [map, center, zoom])

  return null
}

function MapFocusSelected({ event }: { event: Event | null }) {
  const map = useMap()

  useEffect(() => {
    if (!event?.location) return
    map.flyTo(
      [event.location.latitude, event.location.longitude],
      Math.max(map.getZoom(), 14),
      { animate: true },
    )
  }, [event?.id, map, event?.location])

  return null
}

type EventMapMarkerProps = {
  event: Event
  colors: ThemeMarkerColors
  isSelected: boolean
  onSelect: () => void
}

function EventMapMarker({ event, colors, isSelected, onSelect }: EventMapMarkerProps) {
  const markerRef = useRef<LeafletCircleMarker>(null)
  const location = event.location!

  useEffect(() => {
    if (!isSelected) return
    markerRef.current?.openPopup()
  }, [isSelected])

  return (
    <CircleMarker
      ref={markerRef}
      center={[location.latitude, location.longitude]}
      radius={9}
      pathOptions={{
        color: colors.background,
        fillColor: colors.primary,
        fillOpacity: 1,
        weight: 2,
      }}
      eventHandlers={{
        click: () => {
          onSelect()
          markerRef.current?.openPopup()
        },
      }}
    >
      <Popup className="rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
        <MapEventPopup event={event} />
      </Popup>
    </CircleMarker>
  )
}

export function MapPage() {
  const [mounted, setMounted] = useState(false)
  const [nameFilter, setNameFilter] = useState('')
  const [sportTypeFilter, setSportTypeFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const markerColors = useThemeMarkerColors()

  const categoryId =
    sportTypeFilter === 'all' ? undefined : Number(sportTypeFilter)
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch,
  } = useEvents(categoryId != null ? { category_id: categoryId } : undefined)
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const filteredEvents = useMemo(
    () => filterMapEvents(events ?? [], { categoryId, cityQuery: cityFilter, nameQuery: nameFilter, statusFilter }),
    [events, categoryId, cityFilter, nameFilter, statusFilter],
  )

  const mapCenter = useMemo(
    () => getMapCenterFromEvents(filteredEvents),
    [filteredEvents],
  )

  const mapZoom = filteredEvents.length === 1 ? 14 : filteredEvents.length > 0 ? 12 : 11

  const selectedEvent = useMemo(
    () => filteredEvents.find((event) => event.id === selectedEventId) ?? null,
    [filteredEvents, selectedEventId],
  )

  const isLoading = eventsLoading || categoriesLoading

  return (
    <main className="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col gap-4 overflow-hidden px-4 py-6 sm:px-6">
      <h1 className="shrink-0 text-2xl font-bold tracking-tight text-foreground">
        Events map
      </h1>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-4 lg:h-full lg:w-80 lg:max-w-xs">
          <MapFiltersCard
            categories={categories ?? []}
            nameFilter={nameFilter}
            onNameFilterChange={setNameFilter}
            sportTypeFilter={sportTypeFilter}
            onSportTypeFilterChange={setSportTypeFilter}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            disabled={isLoading}
          />
          <MapEventsList
            className="min-h-0 flex-1"
            events={filteredEvents}
            selectedEventId={selectedEvent?.id ?? null}
            onSelectEvent={setSelectedEventId}
            isLoading={isLoading}
          />
        </aside>

        <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-xl border border-border lg:min-h-0">
          {isLoading ? (
            <div className="flex size-full items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading events...
            </div>
          ) : eventsError ? (
            <div className="flex size-full flex-col items-center justify-center gap-3 bg-destructive/5 px-4 text-center">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                {eventsError.detail || 'Failed to load events.'}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          ) : mounted ? (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="absolute inset-0 z-0 size-full"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizeHandler />
              <MapRecenter center={mapCenter} zoom={mapZoom} />
              <MapFocusSelected event={selectedEvent} />
              {filteredEvents.map((event) => (
                <EventMapMarker
                  key={event.id}
                  event={event}
                  colors={markerColors}
                  isSelected={selectedEvent?.id === event.id}
                  onSelect={() => setSelectedEventId(event.id)}
                />
              ))}
            </MapContainer>
          ) : (
            <div
              className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground"
              aria-busy="true"
              aria-live="polite"
            >
              Loading map…
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
