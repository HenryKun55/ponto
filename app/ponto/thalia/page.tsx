'use client'

import { useEffect, useState } from 'react'
import { getTodayEntryFirebase } from '@/lib/firebase'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDate, formatTime } from '@/lib/utils'
import { ClockForm } from './clock-form'
import type { TimeEntry } from '@/lib/types'

export default function ThaliaPonto() {
  const employee = 'thalia'
  const [todayEntry, setTodayEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entry = await getTodayEntryFirebase(employee)
        setTodayEntry(entry)
      } catch (error) {
        console.error("Error fetching today's entry:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [employee])

  const today = new Date().toLocaleDateString('pt-BR')

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">Carregando...</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-primary text-white rounded-t-lg">
          <CardTitle className="text-center">Registro de Ponto</CardTitle>
          <CardDescription className="text-center text-white/90">
            Thalia
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-lg font-medium">Hoje: {today}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Entrada</p>
              <p className="text-lg font-medium">
                {todayEntry?.clockIn ? formatTime(todayEntry.clockIn) : '-'}
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Saída</p>
              <p className="text-lg font-medium">
                {todayEntry?.clockOut ? formatTime(todayEntry.clockOut) : '-'}
              </p>
            </div>
          </div>

          <ClockForm
            employee={employee}
            hasClockIn={!!todayEntry?.clockIn}
            hasClockOut={!!todayEntry?.clockOut}
          />
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Ponto Fácil - {formatDate(new Date().toISOString())}
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
