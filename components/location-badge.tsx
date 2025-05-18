import { GeoLocation } from '@/lib/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { Badge } from './ui/badge'
import { MapPin } from 'lucide-react'

type LocationBadgeProps = {
  location: GeoLocation | null
}

export const LocationBadge = ({ location }: LocationBadgeProps) => {
  if (!location) {
    return <span className="text-muted-foreground text-sm">Não disponível</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Ver localização
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cidade: {location.city}</p>
          <p>
            {location.region}, {location.country}
          </p>
          <p>CEP: {location.postal}</p>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
