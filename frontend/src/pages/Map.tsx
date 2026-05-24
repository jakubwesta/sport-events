import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertCircle, Loader2 } from 'lucide-react'

import { useLocations } from '@/hooks/use-locations'
import { formatLocationLabel } from '@/lib/event-display'
import { DEFAULT_MAP_CENTER, createVenueIcon } from '@/lib/leaflet'
import type { Location } from '@/schemas'

function getMapCenter(locations: Location[]): [number, number] {
  if (locations.length === 0) return DEFAULT_MAP_CENTER

  const latitude =
    locations.reduce((sum, location) => sum + location.latitude, 0) / locations.length
  const longitude =
    locations.reduce((sum, location) => sum + location.longitude, 0) / locations.length

  return [latitude, longitude]
}

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

export function MapPage() {
  const [mounted, setMounted] = useState(false)
  const { data: locations, isLoading, error } = useLocations()

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const venueIcon = useMemo(() => createVenueIcon(), [])
  const mapCenter = useMemo(
    () => getMapCenter(locations ?? []),
    [locations],
  )
  const mapLocations = locations ?? []

  return (
    <main className="map-view flex flex-1 flex-col px-4 pb-6 pt-6 sm:px-6">
      <div className="map-page-shell relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-border">
        {isLoading ? (
          <div className="flex size-full items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading locations...
          </div>
        ) : error ? (
          <div className="flex size-full items-center justify-center gap-2 bg-destructive/5 px-4 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error.detail || 'Failed to load locations.'}
          </div>
        ) : mounted ? (
          <MapContainer
            center={mapCenter}
            zoom={mapLocations.length === 1 ? 14 : 12}
            className="absolute inset-0 z-0"
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapResizeHandler />
            {mapLocations.map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={venueIcon}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{formatLocationLabel(location)}</p>
                    <p className="text-muted-foreground">{location.address}</p>
                  </div>
                </Popup>
              </Marker>
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
    </main>
  )
}
