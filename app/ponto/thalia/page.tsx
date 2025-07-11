'use client'

import { formatDate, formatTime } from '@/lib/utils'
import { ClockForm } from './clock-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useFetchTodayEntry } from '@/hooks/use-time-record'

export default () => {
  const employee = 'thalia'
  const { data: todayEntry, isLoading, error } = useFetchTodayEntry(employee)

  const today = new Date().toLocaleDateString('pt-BR')

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">Carregando...</CardContent>
        </Card>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-red-500">
            Erro ao carregar dados.
          </CardContent>
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

          {/* Período da Manhã */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">
              Período da Manhã
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Entrada</p>
                <p className="text-lg font-medium">
                  {todayEntry?.morningClockIn
                    ? formatTime(todayEntry.morningClockIn)
                    : '-'}
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Saída</p>
                <p className="text-lg font-medium">
                  {todayEntry?.morningClockOut
                    ? formatTime(todayEntry.morningClockOut)
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Período da Tarde */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">
              Período da Tarde
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Entrada</p>
                <p className="text-lg font-medium">
                  {todayEntry?.afternoonClockIn
                    ? formatTime(todayEntry.afternoonClockIn)
                    : '-'}
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Saída</p>
                <p className="text-lg font-medium">
                  {todayEntry?.afternoonClockOut
                    ? formatTime(todayEntry.afternoonClockOut)
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <ClockForm employee={employee} todayEntry={todayEntry} />
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
