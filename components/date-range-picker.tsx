import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { QuickDateRangeSelector } from './ui/quick-date-range-selector'

type DateRangePickerProps = {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export const DateRangePicker = ({ date, setDate }: DateRangePickerProps) => {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<DateRange | undefined>(date)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setDate(internalDate)
    }
  }

  const getDefaultMonth = () => {
    if (date?.from && date?.to) {
      const midTime = (date.from.getTime() + date.to.getTime()) / 2
      return new Date(midTime)
    }
    if (date?.from) {
      return date.from
    }
    return new Date()
  }

  const displayedDate = open ? internalDate : date

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[260px] justify-start text-left font-normal')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayedDate?.from ? (
            displayedDate.to ? (
              <>
                {format(displayedDate.from, 'dd/MM/yyyy')} -{' '}
                {format(displayedDate.to, 'dd/MM/yyyy')}
              </>
            ) : (
              format(displayedDate.from, 'dd/MM/yyyy')
            )
          ) : (
            <span>Selecionar intervalo</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-4">
          <div className="p-2">
            <QuickDateRangeSelector
              onSelectRange={(range) => {
                setInternalDate(range)
                setDate(range)
                setOpen(false)
              }}
            />
          </div>
          <Calendar
            initialFocus
            mode="range"
            selected={internalDate}
            onSelect={setInternalDate}
            numberOfMonths={2}
            toDate={new Date()}
            defaultMonth={getDefaultMonth()}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
