import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const DATE_PRESETS = [
  { label: 'Today', value: 0 },
  { label: 'Tomorrow', value: 1 },
  { label: 'In a week', value: 7 },
  { label: 'In 2 weeks', value: 14 },
] as const

const timeInputClassName =
  'h-8 w-14 text-center text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

type DateTimePickerProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  label?: string
  disabled?: boolean
  hasError?: boolean
}

function applyTime(base: Date, hours: number, minutes: number) {
  const next = new Date(base)
  next.setHours(hours, minutes, 0, 0)
  return next
}

export function DateTimePicker({
  value,
  onChange,
  label,
  disabled = false,
  hasError = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const base = value ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const hours = value ? value.getHours() : 0
  const minutes = value ? value.getMinutes() : 0

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      const base = value ?? new Date()
      setCurrentMonth(new Date(base.getFullYear(), base.getMonth(), 1))
    }
  }

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      onChange(undefined)
      return
    }
    onChange(applyTime(day, hours, minutes))
  }

  const handlePreset = (daysFromNow: number) => {
    const next = applyTime(addDays(new Date(), daysFromNow), hours, minutes)
    onChange(next)
    setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  }

  const handleTimeChange = (part: 'hours' | 'minutes', raw: string) => {
    const num = parseInt(raw, 10)
    if (isNaN(num)) return
    const base = value ? new Date(value) : new Date()
    if (part === 'hours') base.setHours(Math.min(23, Math.max(0, num)))
    if (part === 'minutes') base.setMinutes(Math.min(59, Math.max(0, num)))
    base.setSeconds(0, 0)
    onChange(base)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <Label className="text-sm font-medium">{label}</Label> : null}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={hasError}
            className={cn(
              'w-full justify-start gap-2 text-left font-normal',
              !value && 'text-muted-foreground',
              hasError && 'border-destructive',
            )}
          >
            <CalendarIcon className="size-4 shrink-0" aria-hidden />
            {value ? format(value, 'dd MMM yyyy, HH:mm') : 'Pick a date & time'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Card className="w-fit gap-0 border py-0 shadow-sm">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDaySelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                fixedWeeks
                className="p-0 [--cell-size:--spacing(9.5)]"
              />
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 border-t px-3 py-3">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={disabled}
                  onClick={() => handlePreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </CardFooter>
            <CardFooter className="flex-col items-stretch gap-2 border-t px-3 py-3">
              <p className="text-xs font-medium text-muted-foreground">Time</p>
              <div className="flex w-fit items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={String(hours).padStart(2, '0')}
                  onChange={(e) => handleTimeChange('hours', e.target.value)}
                  disabled={disabled}
                  className={timeInputClassName}
                  aria-label="Hours"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={String(minutes).padStart(2, '0')}
                  onChange={(e) => handleTimeChange('minutes', e.target.value)}
                  disabled={disabled}
                  className={timeInputClassName}
                  aria-label="Minutes"
                />
              </div>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}
