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
import { Globe, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GeoLocation, TimeEntry } from '@/lib/types'
import { useState } from 'react'

type LocationsTableProps = {
  entries: TimeEntry[]
}

export const LocationsTable = ({ entries }: LocationsTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getLocationCount = (entry: TimeEntry) => {
    let count = 0
    if (entry.morningClockInLocation) count++
    if (entry.morningClockOutLocation) count++
    if (entry.afternoonClockInLocation) count++
    if (entry.afternoonClockOutLocation) count++
    return count
  }

  const getLocationSummary = (entry: TimeEntry) => {
    const locations = []
    if (entry.morningClockInLocation)
      locations.push(entry.morningClockInLocation)
    if (entry.morningClockOutLocation)
      locations.push(entry.morningClockOutLocation)
    if (entry.afternoonClockInLocation)
      locations.push(entry.afternoonClockInLocation)
    if (entry.afternoonClockOutLocation)
      locations.push(entry.afternoonClockOutLocation)

    const uniqueCities = [...new Set(locations.map((loc) => loc.city))]
    return uniqueCities.join(', ')
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Registros</TableHead>
            <TableHead>Localização Principal</TableHead>
            <TableHead>Ações</TableHead>
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
              .map((entry) => (
                <ExpandableRow
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedRows.has(entry.id)}
                  onToggle={() => toggleRow(entry.id)}
                  locationCount={getLocationCount(entry)}
                  locationSummary={getLocationSummary(entry)}
                />
              ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

type ExpandableRowProps = {
  entry: TimeEntry
  isExpanded: boolean
  onToggle: () => void
  locationCount: number
  locationSummary: string
}

const ExpandableRow = ({
  entry,
  isExpanded,
  onToggle,
  locationCount,
  locationSummary,
}: ExpandableRowProps) => {
  const locationEntries = [
    {
      period: 'Manhã',
      type: 'Entrada',
      time: entry.morningClockIn,
      location: entry.morningClockInLocation,
    },
    {
      period: 'Manhã',
      type: 'Saída',
      time: entry.morningClockOut,
      location: entry.morningClockOutLocation,
    },
    {
      period: 'Tarde',
      type: 'Entrada',
      time: entry.afternoonClockIn,
      location: entry.afternoonClockInLocation,
    },
    {
      period: 'Tarde',
      type: 'Saída',
      time: entry.afternoonClockOut,
      location: entry.afternoonClockOutLocation,
    },
  ].filter((item) => item.location)

  return (
    <>
      {/* Linha principal */}
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-medium capitalize">
          {entry.employee}
        </TableCell>
        <TableCell>{formatDate(entry.date)}</TableCell>
        <TableCell>
          <Badge variant="secondary">
            {locationCount} {locationCount === 1 ? 'registro' : 'registros'}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {locationSummary}
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Linhas expandidas */}
      {isExpanded &&
        locationEntries.map((item) => (
          <TableRow
            key={`${entry.id}-${item.period}-${item.type}`}
            className="bg-muted/25"
          >
            <TableCell></TableCell>
            <TableCell className="pl-8 text-sm text-muted-foreground">
              {item.period} - {item.type}
            </TableCell>
            <TableCell className="text-sm">{formatTime(item.time)}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {item.period}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {item.location!.city}, {item.location!.region},{' '}
              {item.location!.country}
            </TableCell>
            <TableCell>
              <LocationDetailsTooltip
                type={item.type}
                location={item.location!}
              />
            </TableCell>
          </TableRow>
        ))}
    </>
  )
}

type LocationDetailsTooltipProps = {
  type: string
  location: GeoLocation
}

const LocationDetailsTooltip = ({ location }: LocationDetailsTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm">
            <Globe className="h-4 w-4" />
          </Button>
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
