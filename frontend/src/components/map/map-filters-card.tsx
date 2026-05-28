import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getEventStatusLabel } from '@/lib/event-display'
import type { Category, EventStatus } from '@/schemas'

const EVENT_STATUSES: EventStatus[] = [
  'PLANNING', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED',
]

type MapFiltersCardProps = {
  categories: Category[]
  nameFilter: string
  onNameFilterChange: (value: string) => void
  sportTypeFilter: string
  onSportTypeFilterChange: (value: string) => void
  cityFilter: string
  onCityFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  disabled?: boolean
}

export function MapFiltersCard({
  categories,
  nameFilter,
  onNameFilterChange,
  sportTypeFilter,
  onSportTypeFilterChange,
  cityFilter,
  onCityFilterChange,
  statusFilter,
  onStatusFilterChange,
  disabled = false,
}: MapFiltersCardProps) {
  return (
    <div className="shrink-0 rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Filters</h2>
      </div>

      <div className="space-y-2.5 p-3">
        <Select
          value={sportTypeFilter}
          onValueChange={onSportTypeFilterChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-full text-sm">
            <SelectValue placeholder="All sport types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sport types</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-full text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {EVENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {getEventStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          placeholder="Search by name…"
          disabled={disabled}
          type="search"
          className="h-8 text-sm"
          aria-label="Filter by event name"
        />

        <Input
          value={cityFilter}
          onChange={(e) => onCityFilterChange(e.target.value)}
          placeholder="Filter by city…"
          disabled={disabled}
          type="search"
          className="h-8 text-sm"
          aria-label="Filter by city"
        />
      </div>
    </div>
  )
}
