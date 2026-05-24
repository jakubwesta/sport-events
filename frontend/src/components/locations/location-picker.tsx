import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { FormFieldError } from '@/components/auth/form-field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_MAP_CENTER, createVenueIcon } from '@/lib/leaflet'
import type { LocationPickerValue } from '@/schemas'

type LocationPickerProps = {
  value: LocationPickerValue
  onChange: (value: LocationPickerValue) => void
  fieldErrors?: Partial<Record<'name' | 'address' | 'city' | 'latitude' | 'longitude', string>>
  disabled?: boolean
}

function MapClickHandler({
  disabled,
  onSelect,
}: {
  disabled?: boolean
  onSelect: (latitude: number, longitude: number) => void
}) {
  useMapEvents({
    click(event) {
      if (disabled) return
      onSelect(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function MapRecenter({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])

  return null
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

function formatCoordinate(value: number | null): string {
  return value == null ? '' : String(value)
}

function parseCoordinate(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function LocationPicker({
  value,
  onChange,
  fieldErrors = {},
  disabled = false,
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const venueIcon = useMemo(() => createVenueIcon(), [])
  const hasCoordinates = value.latitude != null && value.longitude != null
  const mapCenter: [number, number] = hasCoordinates
    ? [value.latitude!, value.longitude!]
    : DEFAULT_MAP_CENTER
  const mapZoom = hasCoordinates ? 14 : 12

  const update = (patch: Partial<LocationPickerValue>) => {
    onChange({ ...value, enabled: true, ...patch })
  }

  const clearLocation = () => {
    onChange({
      enabled: false,
      name: '',
      address: '',
      city: '',
      latitude: null,
      longitude: null,
    })
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-base">Location</Label>
          <p className="text-xs text-muted-foreground">
            Fill in the address on the left, then click the map to pin coordinates.
          </p>
        </div>
        {value.enabled && (hasCoordinates || value.address || value.city || value.name) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearLocation}
            disabled={disabled}
          >
            Clear location
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,42%)] lg:items-stretch">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_name">Venue name (optional)</Label>
            <Input
              id="location_name"
              value={value.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="e.g. National Stadium"
              disabled={disabled}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            <FormFieldError message={fieldErrors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Address</Label>
            <Input
              id="location_address"
              value={value.address}
              onChange={(event) => update({ address: event.target.value })}
              placeholder="Street and number"
              disabled={disabled}
              aria-invalid={Boolean(fieldErrors.address)}
            />
            <FormFieldError message={fieldErrors.address} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_city">City</Label>
            <Input
              id="location_city"
              value={value.city}
              onChange={(event) => update({ city: event.target.value })}
              placeholder="City"
              disabled={disabled}
              aria-invalid={Boolean(fieldErrors.city)}
            />
            <FormFieldError message={fieldErrors.city} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location_latitude">Latitude</Label>
              <Input
                id="location_latitude"
                value={formatCoordinate(value.latitude)}
                onChange={(event) => update({ latitude: parseCoordinate(event.target.value) })}
                placeholder="Set by clicking the map"
                disabled={disabled}
                aria-invalid={Boolean(fieldErrors.latitude)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_longitude">Longitude</Label>
              <Input
                id="location_longitude"
                value={formatCoordinate(value.longitude)}
                onChange={(event) => update({ longitude: parseCoordinate(event.target.value) })}
                placeholder="Set by clicking the map"
                disabled={disabled}
                aria-invalid={Boolean(fieldErrors.longitude)}
              />
            </div>
          </div>
          <FormFieldError message={fieldErrors.latitude ?? fieldErrors.longitude} />
        </div>

        <div className="location-picker-map relative min-h-[280px] overflow-hidden rounded-lg border border-border lg:min-h-full">
          {mounted ? (
            <MapContainer
              center={DEFAULT_MAP_CENTER}
              zoom={12}
              className="absolute inset-0 z-0"
              style={{ height: '100%', width: '100%', minHeight: 280 }}
              scrollWheelZoom={!disabled}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizeHandler />
              <MapRecenter center={mapCenter} zoom={mapZoom} />
              <MapClickHandler
                disabled={disabled}
                onSelect={(latitude, longitude) => update({ latitude, longitude, enabled: true })}
              />
              {hasCoordinates ? (
                <Marker
                  position={[value.latitude!, value.longitude!]}
                  icon={venueIcon}
                />
              ) : null}
            </MapContainer>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground"
              aria-busy="true"
            >
              Loading map…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
