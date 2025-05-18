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
            <TableHead>Entrada</TableHead>
            <TableHead>Saída</TableHead>
            <TableHead>Duração</TableHead>
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
              .map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium capitalize">
                    {entry.employee}
                  </TableCell>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {formatTime(entry.clockIn)}
                      {entry.realClockInTime &&
                        hasSignificantTimeDifference(
                          entry.clockIn,
                          entry.realClockInTime
                        ) && (
                          <AdjustedTimeTooltip
                            realTime={entry.realClockInTime}
                          />
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {formatTime(entry.clockOut)}
                      {entry.realClockOutTime &&
                        hasSignificantTimeDifference(
                          entry.clockOut,
                          entry.realClockOutTime
                        ) && (
                          <AdjustedTimeTooltip
                            realTime={entry.realClockOutTime}
                          />
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {calculateDuration(entry.clockIn, entry.clockOut)}
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
