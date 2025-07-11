import type { TooltipProps } from 'recharts'

type ChartDataItem = {
  date: string
  fullDate: Date
  hours: number
  clockIn: string
  clockOut: string
}

type PayloadItem = {
  value: number
  payload: ChartDataItem
  dataKey: string
  color: string
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatHoursDecimal = (hoursDecimal: number) => {
  const h = Math.floor(hoursDecimal)
  const m = Math.round((hoursDecimal - h) * 60)
  return `${h}h ${m}m`
}

export const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0] as PayloadItem

    // Verificar se temos os dados necessários
    if (!data?.payload) {
      return null
    }

    const { clockIn, clockOut, hours } = data.payload

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{`Data: ${label}`}</p>

        {clockIn && (
          <p className="text-sm text-gray-600 mb-1">
            {`Primeira entrada: ${formatTime(clockIn)}`}
          </p>
        )}

        {clockOut && (
          <p className="text-sm text-gray-600 mb-1">
            {`Última saída: ${formatTime(clockOut)}`}
          </p>
        )}

        <p className="font-semibold text-blue-600 mt-2">
          {`Total trabalhado: ${formatHoursDecimal(hours)}`}
        </p>
      </div>
    )
  }

  return null
}
