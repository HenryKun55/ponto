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

type DateRangePickerProps = {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  date,
  setDate,
}) => {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<DateRange | undefined>(date)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)

    if (!isOpen) {
      setDate(internalDate)
    }
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
        <Calendar
          initialFocus
          mode="range"
          selected={internalDate}
          onSelect={setInternalDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
