'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatDate,
  formatTime,
  calculateDuration,
  hasSignificantTimeDifference,
} from '@/lib/utils'
import { TimeEntry } from '@/lib/types'
import { AdjustedTimeTooltip } from '../adjusted-time-tooltip'

type TimeEntriesTableProps = {
  entries: TimeEntry[]
}

export const TimeEntriesTable = ({ entries }: TimeEntriesTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Manhã</TableHead>
            <TableHead>Tarde</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                Nenhum registro encontrado
              </TableCell>
            </TableRow>
          ) : (
            entries
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((entry) => {
                const morningDuration =
                  entry.morningClockIn && entry.morningClockOut
                    ? calculateDuration(
                        entry.morningClockIn,
                        entry.morningClockOut
                      )
                    : null

                const afternoonDuration =
                  entry.afternoonClockIn && entry.afternoonClockOut
                    ? calculateDuration(
                        entry.afternoonClockIn,
                        entry.afternoonClockOut
                      )
                    : null

                const totalDuration = calculateTotalDuration(
                  entry.morningClockIn,
                  entry.morningClockOut,
                  entry.afternoonClockIn,
                  entry.afternoonClockOut
                )

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium capitalize">
                      {entry.employee}
                    </TableCell>
                    <TableCell>{formatDate(entry.date)}</TableCell>

                    {/* Morning Period */}
                    <TableCell>
                      {entry.morningClockIn && entry.morningClockOut ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-1">
                              Entrada:
                            </span>
                            <span>{formatTime(entry.morningClockIn)}</span>
                            {entry.realMorningClockInTime &&
                              hasSignificantTimeDifference(
                                entry.morningClockIn,
                                entry.realMorningClockInTime
                              ) && (
                                <AdjustedTimeTooltip
                                  realTime={entry.realMorningClockInTime}
                                />
                              )}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-1">
                              Saída:
                            </span>
                            <span>{formatTime(entry.morningClockOut)}</span>
                            {entry.realMorningClockOutTime &&
                              hasSignificantTimeDifference(
                                entry.morningClockOut,
                                entry.realMorningClockOutTime
                              ) && (
                                <AdjustedTimeTooltip
                                  realTime={entry.realMorningClockOutTime}
                                />
                              )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {morningDuration}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    {/* Afternoon Period */}
                    <TableCell>
                      {entry.afternoonClockIn && entry.afternoonClockOut ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-1">
                              Entrada:
                            </span>
                            <span>{formatTime(entry.afternoonClockIn)}</span>
                            {entry.realAfternoonClockInTime &&
                              hasSignificantTimeDifference(
                                entry.afternoonClockIn,
                                entry.realAfternoonClockInTime
                              ) && (
                                <AdjustedTimeTooltip
                                  realTime={entry.realAfternoonClockInTime}
                                />
                              )}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-1">
                              Saída:
                            </span>
                            <span>{formatTime(entry.afternoonClockOut)}</span>
                            {entry.realAfternoonClockOutTime &&
                              hasSignificantTimeDifference(
                                entry.afternoonClockOut,
                                entry.realAfternoonClockOutTime
                              ) && (
                                <AdjustedTimeTooltip
                                  realTime={entry.realAfternoonClockOutTime}
                                />
                              )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {afternoonDuration}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    {/* Total Duration */}
                    <TableCell className="font-medium">
                      {totalDuration}
                    </TableCell>
                  </TableRow>
                )
              })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Helper function to calculate total duration across both periods
function calculateTotalDuration(
  morningClockIn: string | null,
  morningClockOut: string | null,
  afternoonClockIn: string | null,
  afternoonClockOut: string | null
): string {
  let totalMinutes = 0

  // Add morning duration
  if (morningClockIn && morningClockOut) {
    const morningStart = new Date(morningClockIn)
    const morningEnd = new Date(morningClockOut)
    totalMinutes +=
      (morningEnd.getTime() - morningStart.getTime()) / (1000 * 60)
  }

  // Add afternoon duration
  if (afternoonClockIn && afternoonClockOut) {
    const afternoonStart = new Date(afternoonClockIn)
    const afternoonEnd = new Date(afternoonClockOut)
    totalMinutes +=
      (afternoonEnd.getTime() - afternoonStart.getTime()) / (1000 * 60)
  }

  if (totalMinutes === 0) {
    return '-'
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours === 0) {
    return `${minutes}min`
  }

  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
}
