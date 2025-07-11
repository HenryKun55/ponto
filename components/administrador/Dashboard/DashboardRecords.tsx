'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFetchAllRecords } from '@/hooks/use-time-record'
import { CustomTooltip } from './CustomTooltip'
import { DateRange } from 'react-day-picker'
import { Clock, Calendar, TrendingUp, User, Target } from 'lucide-react'
import { TimeEntry } from '@/lib/types'

type DashboardRecordsProps = {
  dateRange?: DateRange
}

export const DashboardRecords = ({ dateRange }: DashboardRecordsProps) => {
  const { data, isLoading } = useFetchAllRecords()

  const parseRecordDate = (dateString: string): Date => {
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/')
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      if (dateString.includes('-')) {
        return new Date(dateString)
      }
      return new Date(dateString)
    } catch (error) {
      console.error('Error parsing date:', dateString, error)
      return new Date()
    }
  }

  const parseTimeString = (timeString: string): Date => {
    try {
      if (timeString.includes('T') || timeString.includes('Z')) {
        return new Date(timeString)
      }

      if (timeString.includes(':')) {
        const today = new Date()
        const [hours, minutes] = timeString.split(':').map(Number)
        return new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes
        )
      }

      return new Date(timeString)
    } catch (error) {
      console.error('Error parsing time:', timeString, error)
      return new Date()
    }
  }

  const calculateDayHours = (record: TimeEntry): number => {
    let totalHours = 0

    try {
      if (record.morningClockIn && record.morningClockOut) {
        const morningIn = parseTimeString(record.morningClockIn)
        const morningOut = parseTimeString(record.morningClockOut)
        const morningDiff = morningOut.getTime() - morningIn.getTime()
        if (morningDiff > 0) {
          totalHours += morningDiff / (1000 * 60 * 60)
        }
      }

      if (record.afternoonClockIn && record.afternoonClockOut) {
        const afternoonIn = parseTimeString(record.afternoonClockIn)
        const afternoonOut = parseTimeString(record.afternoonClockOut)
        const afternoonDiff = afternoonOut.getTime() - afternoonIn.getTime()
        if (afternoonDiff > 0) {
          totalHours += afternoonDiff / (1000 * 60 * 60)
        }
      }
    } catch (error) {
      console.error('Error calculating hours for record:', record, error)
    }

    return Math.max(0, totalHours)
  }

  const getFirstClockIn = (record: TimeEntry): string | null => {
    if (record.morningClockIn) return record.morningClockIn
    if (record.afternoonClockIn) return record.afternoonClockIn
    return null
  }

  const getLastClockOut = (record: TimeEntry): string | null => {
    if (record.afternoonClockOut) return record.afternoonClockOut
    if (record.morningClockOut) return record.morningClockOut
    return null
  }

  const getLastValidMonth = () => {
    if (!data || data.length === 0) return null

    const validRecordsForMonth = data
      .filter((record) => {
        return (
          record.date &&
          record.employee === 'thalia' &&
          (record.morningClockIn || record.afternoonClockIn) &&
          (record.morningClockOut || record.afternoonClockOut)
        )
      })
      .map((record) => parseRecordDate(record.date))
      .sort((a, b) => b.getTime() - a.getTime())

    if (validRecordsForMonth.length === 0) return null

    const latestDate = validRecordsForMonth[0]
    const year = latestDate.getFullYear()
    const month = latestDate.getMonth()

    return {
      from: new Date(year, month, 1),
      to: new Date(year, month + 1, 0),
    }
  }

  const effectiveDateRange =
    dateRange?.from || dateRange?.to ? dateRange : getLastValidMonth()

  const filteredData = (data ?? []).filter((record) => {
    if (!record.date) return false
    if (!effectiveDateRange?.from && !effectiveDateRange?.to) return true

    try {
      const recordDate = parseRecordDate(record.date)
      const afterFrom = effectiveDateRange?.from
        ? recordDate >= effectiveDateRange.from
        : true
      const beforeTo = effectiveDateRange?.to
        ? recordDate <= effectiveDateRange.to
        : true

      return afterFrom && beforeTo
    } catch (error) {
      console.error('Error filtering record:', record, error)
      return false
    }
  })

  const validRecords = filteredData
    .filter((record) => {
      const hasEmployee = record.employee === 'thalia'
      const hasClockIn = record.morningClockIn || record.afternoonClockIn
      const hasClockOut = record.morningClockOut || record.afternoonClockOut

      return hasEmployee && hasClockIn && hasClockOut
    })
    .map((record) => {
      const workedHours = calculateDayHours(record)
      const firstClockIn = getFirstClockIn(record)
      const lastClockOut = getLastClockOut(record)
      const recordDate = parseRecordDate(record.date)

      return {
        date: recordDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        fullDate: recordDate,
        hours: parseFloat(workedHours.toFixed(2)),
        clockIn: firstClockIn || '',
        clockOut: lastClockOut || '',
      }
    })
    .filter((record) => record.hours > 0 && record.clockIn && record.clockOut)
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  const stats = {
    totalHours: validRecords.reduce((sum, record) => sum + record.hours, 0),
    averageHours:
      validRecords.length > 0
        ? validRecords.reduce((sum, record) => sum + record.hours, 0) /
          validRecords.length
        : 0,
    totalDays: validRecords.length,
    maxHours:
      validRecords.length > 0
        ? Math.max(...validRecords.map((r) => r.hours))
        : 0,
    minHours:
      validRecords.length > 0
        ? Math.min(...validRecords.map((r) => r.hours))
        : 0,
  }

  const workingHoursDistribution = [
    {
      name: 'Menos de 6h',
      value: validRecords.filter((r) => r.hours < 6).length,
      color: '#ef4444',
    },
    {
      name: '6h - 8h',
      value: validRecords.filter((r) => r.hours >= 6 && r.hours <= 8).length,
      color: '#3b82f6',
    },
    {
      name: 'Mais de 8h',
      value: validRecords.filter((r) => r.hours > 8).length,
      color: '#10b981',
    },
  ]

  const getTitle = () => {
    const currentRange = effectiveDateRange
    if (!currentRange?.from && !currentRange?.to) {
      return 'Dashboard - Thalia'
    }

    const fromDate = currentRange?.from?.toLocaleDateString('pt-BR')
    const toDate = currentRange?.to?.toLocaleDateString('pt-BR')
    const isAutoGenerated = !dateRange?.from && !dateRange?.to
    const prefix = isAutoGenerated ? 'Último mês - ' : ''

    if (fromDate && toDate) {
      return `${prefix}Dashboard - Thalia (${fromDate} - ${toDate})`
    }
    return 'Dashboard - Thalia'
  }

  const getDynamicYAxisDomain = () => {
    if (validRecords.length === 0) return [0, 10]

    const minHours = Math.min(...validRecords.map((r) => r.hours))
    const maxHours = Math.max(...validRecords.map((r) => r.hours))
    const padding = Math.max((maxHours - minHours) * 0.1, 0.5)

    return [Math.max(0, minHours - padding), maxHours + padding]
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Debug: Verificar se não há dados
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Dashboard - Thalia</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Nenhum dado encontrado. Verifique se há registros de ponto para a
              funcionária Thalia.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total de Horas
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalHours.toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Média Diária
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.averageHours.toFixed(1)}h
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Dias Trabalhados
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.totalDays}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Meta 8h/dia
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.averageHours > 0
                    ? ((stats.averageHours / 8) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de barras principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Horas Trabalhadas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {validRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={validRecords}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={getDynamicYAxisDomain()}
                    label={{
                      value: 'Horas',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12 },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="hours"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Horas"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[450px] text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">
                    Nenhum registro encontrado
                  </p>
                  <p className="text-sm">
                    Verifique os filtros de data ou se há registros para o
                    período selecionado
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de pizza */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Horas</CardTitle>
          </CardHeader>
          <CardContent>
            {validRecords.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workingHoursDistribution.filter(
                        (item) => item.value > 0
                      )}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {workingHoursDistribution
                        .filter((item) => item.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} dias`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {workingHoursDistribution
                    .filter((item) => item.value > 0)
                    .map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">
                          {item.name}: {item.value} dias
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de linha para tendência */}
      {validRecords.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Tendência de Horas Trabalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={validRecords}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={getDynamicYAxisDomain()}
                  label={{
                    value: 'Horas',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12 },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
