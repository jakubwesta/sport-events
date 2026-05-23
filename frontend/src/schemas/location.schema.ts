import { z } from 'zod'

export const locationSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  address: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
})

export const locationCreateSchema = z.object({
  name: z.string().nullable().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
})

export type Location = z.infer<typeof locationSchema>
export type LocationCreate = z.infer<typeof locationCreateSchema>

export type LocationPickerValue = {
  enabled: boolean
  name: string
  address: string
  city: string
  latitude: number | null
  longitude: number | null
}

export const locationFormSchema = z.object({
  name: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  latitude: z.number({ message: 'Pick a point on the map' }),
  longitude: z.number({ message: 'Pick a point on the map' }),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

export function emptyLocationPickerValue(): LocationPickerValue {
  return {
    enabled: false,
    name: '',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
  }
}

export function hasLocationInput(value: LocationPickerValue): boolean {
  return (
    value.enabled ||
    value.address.trim().length > 0 ||
    value.city.trim().length > 0 ||
    value.name.trim().length > 0 ||
    value.latitude != null ||
    value.longitude != null
  )
}

export function locationToPickerValue(location?: Location | null): LocationPickerValue {
  if (!location) return emptyLocationPickerValue()

  return {
    enabled: true,
    name: location.name ?? '',
    address: location.address,
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
  }
}

export function toLocationCreatePayload(value: LocationPickerValue): LocationCreate {
  return {
    name: value.name.trim() || undefined,
    address: value.address.trim(),
    city: value.city.trim(),
    latitude: value.latitude!,
    longitude: value.longitude!,
  }
}

export function toLocationFormValues(value: LocationPickerValue): LocationFormValues {
  return {
    name: value.name.trim() || undefined,
    address: value.address.trim(),
    city: value.city.trim(),
    latitude: value.latitude ?? Number.NaN,
    longitude: value.longitude ?? Number.NaN,
  }
}
