import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

import { MapFiltersCard } from '@/components/map/map-filters-card'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/** Default center (Warsaw) — replace with data from your API when available. */
const DEFAULT_CENTER: [number, number] = [52.2297, 21.0122]

export function MapPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const venueIcon = useMemo(
    () =>
      L.icon({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    []
  )

  return (
    <main className="map-view flex min-h-0 flex-1 flex-col px-4 pb-6 pt-6 sm:px-6">
      <Card className="mx-auto mb-4 w-full max-w-6xl shrink-0 border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Map</CardTitle>
          <CardDescription>
            Pan, zoom, and tap a marker to open details. Add more markers from
            your events data.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside className="w-full shrink-0 lg:max-w-xs lg:self-start">
          <MapFiltersCard />
        </aside>

        <div className="relative min-h-[min(60dvh,560px)] flex-1 overflow-hidden rounded-xl border border-border lg:min-h-[min(70dvh,640px)]">
          {mounted ? (
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              className="size-full min-h-[min(60dvh,560px)] lg:min-h-[min(70dvh,640px)]"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={DEFAULT_CENTER} icon={venueIcon}>
                <Popup>
                  Example venue — wire this to your sport events backend.
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div
              className="flex size-full min-h-[min(60dvh,560px)] items-center justify-center bg-muted text-sm text-muted-foreground lg:min-h-[min(70dvh,640px)]"
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
