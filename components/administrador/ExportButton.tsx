'use client'

import { Button } from '@/components/ui/button'
import { TimeEntry } from '@/lib/types'
import { Download } from 'lucide-react'

type ExportButtonProps = {
  entries: TimeEntry[]
}

export const ExportButton = ({ entries }: ExportButtonProps) => {
  const handleExport = () => {
    if (entries.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    // Create CSV content
    const headers = [
      'Funcionário',
      'Data',
      'Entrada',
      'Saída',
      'Duração',
      'Entrada Real',
      'Saída Real',
      'Cidade Entrada',
      'Cidade Saída',
    ].join(',')

    const rows = entries.map((entry) => {
      return [
        entry.employee,
        entry.date,
        entry.clockIn,
        entry.clockOut,
        calculateDuration(entry.clockIn, entry.clockOut),
        entry.realClockInTime || '',
        entry.realClockOutTime || '',
        entry.clockInLocation?.city || '',
        entry.clockOutLocation?.city || '',
      ].join(',')
    })

    const csvContent = [headers, ...rows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `registros_ponto_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="bg-white/10 hover:bg-white/20 text-white"
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar
    </Button>
  )
}

export const calculateDuration = (
  startTime: string | null,
  endTime: string | null
) => {
  if (!startTime || !endTime) return '--:--'

  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)

  // If end time is earlier than start time, assume it's the next day
  let diff = end.getTime() - start.getTime()
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
