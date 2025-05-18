'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GeoLocation, TimeEntry } from '@/lib/types'

type LocationsTableProps = {
  entries: TimeEntry[]
}

export const LocationsTable = ({ entries }: LocationsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Detalhes</TableHead>
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
                  // Entrada
                  entry.clockInLocation && (
                    <LocationRow
                      key={`${entry.id}-in-loc`}
                      employee={entry.employee}
                      date={entry.date}
                      time={entry.clockIn}
                      type="Entrada"
                      location={entry.clockInLocation}
                    />
                  ),
                  // Saída
                  entry.clockOutLocation && (
                    <LocationRow
                      key={`${entry.id}-out-loc`}
                      employee={entry.employee}
                      date={entry.date}
                      time={entry.clockOut}
                      type="Saída"
                      location={entry.clockOutLocation}
                    />
                  ),
                ].filter(Boolean)
              )
          )}
        </TableBody>
      </Table>
    </div>
  )
}

type LocationRowProps = {
  employee: string
  date: string
  time: string | null
  type: string
  location: GeoLocation
}

const LocationRow = ({
  employee,
  date,
  time,
  type,
  location,
}: LocationRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{employee}</TableCell>
      <TableCell>
        {formatDate(date)} {formatTime(time)}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{type}</Badge>
      </TableCell>
      <TableCell>
        {location.city}, {location.region}, {location.country}
      </TableCell>
      <TableCell>{location.ip}</TableCell>
      <TableCell>
        <LocationDetailsTooltip type={type} location={location} />
      </TableCell>
    </TableRow>
  )
}

type LocationDetailsTooltipProps = {
  type: string
  location: GeoLocation
}

const LocationDetailsTooltip = ({
  type,
  location,
}: LocationDetailsTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {type === 'Entrada' ? (
            <Globe className="h-4 w-4" />
          ) : (
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent className="w-80">
          <div className="space-y-2">
            <div className="font-medium">Detalhes da Localização</div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="text-muted-foreground">IP:</div>
              <div>{location.ip}</div>
              <div className="text-muted-foreground">País:</div>
              <div>
                {location.country_code} - {location.country}
              </div>
              <div className="text-muted-foreground">Região:</div>
              <div>
                {location.region_code} - {location.region}
              </div>
              <div className="text-muted-foreground">Cidade:</div>
              <div>{location.city}</div>
              <div className="text-muted-foreground">CEP:</div>
              <div>{location.postal}</div>
              <div className="text-muted-foreground">Fuso Horário:</div>
              <div>{location.timezone.id}</div>
              <div className="text-muted-foreground">Coordenadas:</div>
              <div>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
