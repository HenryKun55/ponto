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
  formatDateTime,
  hasSignificantTimeDifference,
} from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { LocationBadge } from '../location-badge'
import { TimeEntry } from '@/lib/types'

type TimeEntriesDetailsTableProps = {
  entries: TimeEntry[]
}

export const TimeEntriesDetailsTable = ({
  entries,
}: TimeEntriesDetailsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário Registrado</TableHead>
            <TableHead>Horário Real</TableHead>
            <TableHead>Localização</TableHead>
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
              .flatMap((entry) =>
                [
                  // Entrada
                  entry.clockIn && (
                    <TableRow key={`${entry.id}-in`}>
                      <TableCell className="font-medium capitalize">
                        {entry.employee}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="w-fit flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Entrada: {formatTime(entry.clockIn)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.realClockInTime && (
                          <Badge
                            variant={
                              hasSignificantTimeDifference(
                                entry.clockIn,
                                entry.realClockInTime
                              )
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-fit flex items-center gap-1"
                          >
                            {formatDateTime(entry.realClockInTime)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <LocationBadge location={entry.clockInLocation} />
                      </TableCell>
                    </TableRow>
                  ),
                  // Saída
                  entry.clockOut && (
                    <TableRow key={`${entry.id}-out`}>
                      <TableCell className="font-medium capitalize">
                        {entry.employee}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="w-fit flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Saída: {formatTime(entry.clockOut)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.realClockOutTime && (
                          <Badge
                            variant={
                              hasSignificantTimeDifference(
                                entry.clockOut,
                                entry.realClockOutTime
                              )
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-fit flex items-center gap-1"
                          >
                            {formatTime(entry.realClockOutTime)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <LocationBadge location={entry.clockOutLocation} />
                      </TableCell>
                    </TableRow>
                  ),
                ].filter(Boolean)
              )
          )}
        </TableBody>
      </Table>
    </div>
  )
}
