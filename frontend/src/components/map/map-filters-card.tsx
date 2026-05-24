import { useMemo } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Location } from '@/schemas'

type MapFiltersCardProps = {
  locations: Location[]
  cityFilter: string
  onCityFilterChange: (value: string) => void
  disabled?: boolean
}

export function MapFiltersCard({
  locations,
  cityFilter,
  onCityFilterChange,
  disabled = false,
}: MapFiltersCardProps) {
  const cityOptions = useMemo(() => {
    const cities = new Set<string>()
    for (const location of locations) {
      cities.add(location.city.trim())
    }
    return Array.from(cities).sort((a, b) => a.localeCompare(b))
  }, [locations])

  return (
    <Card className="h-fit border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="space-y-2">
          <Label htmlFor="filter-city">City</Label>
          <Select
            value={cityFilter}
            onValueChange={onCityFilterChange}
            disabled={disabled}
          >
            <SelectTrigger id="filter-city" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city.trim().toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {locations.length} location{locations.length === 1 ? '' : 's'} loaded from the API.
        </p>
      </CardContent>
    </Card>
  )
}
