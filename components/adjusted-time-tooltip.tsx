import { AlertCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { formatTime } from '@/lib/utils'

type AdjustedTimeTooltipProps = {
  realTime: string
}

export const AdjustedTimeTooltip = ({ realTime }: AdjustedTimeTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AlertCircle className="h-4 w-4 ml-1 text-amber-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Horário ajustado</p>
          <p>Registrado em: {formatTime(realTime)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
