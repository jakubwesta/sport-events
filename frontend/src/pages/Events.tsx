import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import {
  type EventCardData,
  EventCard,
} from "@/components/events/event-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "football", label: "Football" },
  { value: "cycling", label: "Cycling" },
] as const

const CITY_FILTER_OPTIONS = [
  { value: "all", label: "All cities" },
  { value: "wroclaw", label: "Wroclaw" },
  { value: "warsaw", label: "Warsaw" },
  { value: "krakow", label: "Krakow" },
  { value: "gdansk", label: "Gdansk" },
  { value: "poznan", label: "Poznan" },
] as const

const MOCK_EVENTS: EventCardData[] = [
  {
    id: "1",
    category: "Running",
    title: "Wroclaw 10K Run",
    description:
      "A popular urban race through the heart of Wroclaw with closed roads, pacers, and finisher medals for all distances.",
    dateTimeLabel: "15.06.2026 at 09:00",
    city: "Wroclaw",
    participantsCurrent: 142,
    participantsMax: 200,
  },
  {
    id: "2",
    category: "Football",
    title: "Amateur Cup — Warsaw",
    description:
      "Knockout tournament for recreational teams. Group stage on Saturday, finals on Sunday evening under floodlights.",
    dateTimeLabel: "22.06.2026 at 10:30",
    city: "Warsaw",
    participantsCurrent: 96,
    participantsMax: 128,
  },
  {
    id: "3",
    category: "Cycling",
    title: "Mazovia Gravel Series",
    description:
      "Scenic gravel loop with feed stations and mechanical support. GPS route published one week before the event.",
    dateTimeLabel: "28.06.2026 at 08:00",
    city: "Warsaw",
    participantsCurrent: 58,
    participantsMax: 80,
  },
  {
    id: "4",
    category: "Running",
    title: "Krakow Night 5K",
    description:
      "Family-friendly evening run around the Old Town. Chip timing and commemorative tech tee for early birds.",
    dateTimeLabel: "04.07.2026 at 20:00",
    city: "Krakow",
    participantsCurrent: 310,
    participantsMax: 400,
  },
  {
    id: "5",
    category: "Football",
    title: "Youth Skills Camp — Gdansk",
    description:
      "Three-day camp focusing on technique and small-sided games for players aged 10–14. Led by licensed coaches.",
    dateTimeLabel: "11.07.2026 at 09:00",
    city: "Gdansk",
    participantsCurrent: 24,
    participantsMax: 30,
  },
  {
    id: "6",
    category: "Cycling",
    title: "Poznan City Crit",
    description:
      "Fast criterium laps on a closed circuit downtown. Categories for beginners through elite, with live commentary.",
    dateTimeLabel: "18.07.2026 at 17:45",
    city: "Poznan",
    participantsCurrent: 75,
    participantsMax: 100,
  },
]

const categoryKey = (label: string) =>
  label.toLowerCase().replace(/\s+/g, "-")

function eventMatchesCategory(event: EventCardData, filter: string) {
  if (filter === "all") return true
  return categoryKey(event.category) === filter
}

function eventMatchesCity(event: EventCardData, filter: string) {
  if (filter === "all") return true
  return event.city.toLowerCase() === filter
}

function eventMatchesSearch(event: EventCardData, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return (
    event.title.toLowerCase().includes(needle) ||
    event.description.toLowerCase().includes(needle) ||
    event.city.toLowerCase().includes(needle)
  )
}

export function EventsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [city, setCity] = useState<string>("all")

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter(
      (e) =>
        eventMatchesSearch(e, search) &&
        eventMatchesCategory(e, category) &&
        eventMatchesCity(e, city)
    )
  }, [search, category, city])

  return (
    <main className="container flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-6">
      <Card className="mb-8 border-border shadow-sm">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              placeholder="Search events..."
              type="search"
              aria-label="Search events"
            />
          </div>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:min-w-40 sm:flex-row">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Filter by category"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger
                className="w-full sm:w-44"
                aria-label="Filter by city"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITY_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Upcoming events
        </h2>
        <p className="text-sm text-muted-foreground">
          Found: {filtered.length}{" "}
          {filtered.length === 1 ? "event" : "events"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
          No events match your filters. Try adjusting search or filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <li key={event.id} className="min-w-0 list-none">
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
