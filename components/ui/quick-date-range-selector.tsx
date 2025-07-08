import { Button } from '@/components/ui/button'
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
} from 'date-fns'
import { DateRange } from 'react-day-picker'

type QuickDateRangeSelectorProps = {
  onSelectRange: (range: DateRange) => void
}

export const QuickDateRangeSelector = ({
  onSelectRange,
}: QuickDateRangeSelectorProps) => {
  const today = new Date()

  const quickRanges = [
    {
      label: 'Hoje',
      range: { from: startOfDay(today), to: endOfDay(today) },
    },
    {
      label: 'Ontem',
      range: {
        from: startOfDay(subDays(today, 1)),
        to: endOfDay(subDays(today, 1)),
      },
    },
    {
      label: 'Últimos 7 dias',
      range: { from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
    },
    {
      label: 'Últimos 30 dias',
      range: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
    },
    {
      label: 'Este mês',
      range: {
        from: startOfMonth(today),
        to: endOfMonth(today) > today ? today : endOfMonth(today),
      },
    },
    {
      label: 'Mês passado',
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
    {
      label: 'Este ano',
      range: {
        from: startOfYear(today),
        to: today,
      },
    },
    {
      label: 'Ano passado',
      range: {
        from: startOfYear(subYears(today, 1)),
        to: endOfYear(subYears(today, 1)),
      },
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      {quickRanges.map((q) => (
        <Button
          key={q.label}
          variant="ghost"
          className="justify-start text-left text-sm"
          onClick={() => onSelectRange(q.range)}
        >
          {q.label}
        </Button>
      ))}
    </div>
  )
}
