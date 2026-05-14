import { useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SPORT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "running", label: "Running" },
  { value: "cycling", label: "Cycling" },
  { value: "swimming", label: "Swimming" },
] as const

const CITY_OPTIONS = [
  { value: "all", label: "All Cities" },
  { value: "warsaw", label: "Warsaw" },
  { value: "krakow", label: "Krakow" },
  { value: "wroclaw", label: "Wroclaw" },
  { value: "poznan", label: "Poznan" },
  { value: "gdansk", label: "Gdansk" },
] as const

const PROVINCE_OPTIONS = [
  { value: "all", label: "All Provinces" },
  { value: "lower-silesian", label: "Lower Silesian" },
  { value: "kuyavian-pomeranian", label: "Kuyavian-Pomeranian" },
  { value: "lublin", label: "Lublin" },
  { value: "lubusz", label: "Lubusz" },
  { value: "lodz", label: "Lodz" },
  { value: "lesser-poland", label: "Lesser Poland" },
  { value: "mazovia", label: "Mazovia" },
  { value: "opole", label: "Opole" },
  { value: "subcarpathian", label: "Subcarpathian" },
  { value: "podlaskie", label: "Podlaskie" },
  { value: "pomerania", label: "Pomerania" },
  { value: "silesia", label: "Silesia" },
  { value: "holy-cross", label: "Holy Cross" },
  { value: "warmia-masuria", label: "Warmia-Masuria" },
  { value: "greater-poland", label: "Greater Poland" },
  { value: "west-pomerania", label: "West Pomerania" },
] as const

export function MapFiltersCard() {
  const [sportType, setSportType] = useState<string>("all")
  const [city, setCity] = useState<string>("all")
  const [province, setProvince] = useState<string>("all")

  return (
    <Card className="h-fit border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="space-y-2">
          <Label htmlFor="filter-sport-type">Sport Type</Label>
          <Select value={sportType} onValueChange={setSportType}>
            <SelectTrigger id="filter-sport-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-city">City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger id="filter-city" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-province">Province</Label>
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger id="filter-province" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {PROVINCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
