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
import { Clock, Sun, Moon } from 'lucide-react'
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
            <TableHead>Período</TableHead>
            <TableHead>Horário Registrado</TableHead>
            <TableHead>Horário Real</TableHead>
            <TableHead>Localização</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
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
                  // Morning Clock In
                  entry.morningClockIn && (
                    <TableRow key={`${entry.id}-morning-in`}>
                      <TableCell className="font-medium capitalize">
                        {entry.employee}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="w-fit flex items-center gap-1"
                        >
                          <Sun className="h-3 w-3" />
                          Manhã
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="w-fit flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Entrada: {formatTime(entry.morningClockIn)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.realMorningClockInTime && (
                          <Badge
                            variant={
                              hasSignificantTimeDifference(
                                entry.morningClockIn,
                                entry.realMorningClockInTime
                              )
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-fit flex items-center gap-1"
                          >
                            {formatDateTime(entry.realMorningClockInTime)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <LocationBadge
                          location={entry.morningClockInLocation}
                        />
                      </TableCell>
                    </TableRow>
                  ),
                  // Morning Clock Out
                  entry.morningClockOut && (
                    <TableRow key={`${entry.id}-morning-out`}>
                      <TableCell className="font-medium capitalize">
                        {entry.employee}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="w-fit flex items-center gap-1"
                        >
                          <Sun className="h-3 w-3" />
                          Manhã
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="w-fit flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Saída: {formatTime(entry.morningClockOut)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.realMorningClockOutTime && (
                          <Badge
                            variant={
                              hasSignificantTimeDifference(
                                entry.morningClockOut,
                                entry.realMorningClockOutTime
                              )
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-fit flex items-center gap-1"
                          >
                            {formatDateTime(entry.realMorningClockOutTime)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <LocationBadge
                          location={entry.morningClockOutLocation}
                        />
                      </TableCell>
                    </TableRow>
                  ),
                  // Afternoon Clock In
                  entry.afternoonClockIn && (
                    <TableRow key={`${entry.id}-afternoon-in`}>
                      <TableCell className="font-medium capitalize">
                        {entry.employee}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="w-fit flex items-center gap-1"
                        >
                          <Moon className="h-3 w-3" />
                          Tarde
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="w-fit flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Entrada: {formatTime(entry.afternoonClockIn)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.realAfternoonClockInTime && (
                          <Badge
                            variant={
                              hasSignificantTimeDifference(
                                entry.afternoonClockIn,
                                entry.realAfternoonClockInTime
                              )
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-fit flex items-center gap-1"
                          >
                            {formatDateTime(entry.realAfternoonClockInTime)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <LocationBadge
                          location={entry.afternoonClockInLocation}
                        />
                      </TableCell>
                    </TableRow>
                  ),
                  // Afternoon Clock Out
                  entry.afternoonClockOut && (
                    <TableRow key={`${entry.id}-afternoon-out`}>
                      <TableCell className="font-medium capitalize">
                        {entry.employee}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="w-fit flex items-center gap-1"
                        >
                          <Moon className="h-3 w-3" />
                          Tarde
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="w-fit flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Saída: {formatTime(entry.afternoonClockOut)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.realAfternoonClockOutTime && (
                          <Badge
                            variant={
                              hasSignificantTimeDifference(
                                entry.afternoonClockOut,
                                entry.realAfternoonClockOutTime
                              )
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-fit flex items-center gap-1"
                          >
                            {formatDateTime(entry.realAfternoonClockOutTime)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <LocationBadge
                          location={entry.afternoonClockOutLocation}
                        />
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
