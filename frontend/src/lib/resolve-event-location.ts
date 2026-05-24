import { locationsApi } from '@/api'
import { parseApiError } from '@/lib/api-error'
import type { Location, LocationCreate } from '@/schemas'

function coordsMatch(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 1e-6 &&
    Math.abs(a.longitude - b.longitude) < 1e-6
  )
}

function locationDataMatches(existing: Location, data: LocationCreate): boolean {
  return (
    existing.address === data.address &&
    existing.city === data.city &&
    (existing.name ?? '') === (data.name ?? '') &&
    coordsMatch(existing, data)
  )
}

export async function resolveEventLocationId(
  data: LocationCreate,
  existing?: Location | null,
): Promise<number> {
  if (existing && locationDataMatches(existing, data)) {
    return existing.id
  }

  try {
    const created = await locationsApi.create(data)
    return created.id
  } catch (error) {
    const apiError = parseApiError(error)
    const isDuplicate =
      apiError.status === 400 &&
      apiError.detail.toLowerCase().includes('lokalizacja')

    if (isDuplicate) {
      const locations = await locationsApi.list()
      const match = locations.find((location) => coordsMatch(location, data))
      if (match) return match.id
    }

    throw error
  }
}
