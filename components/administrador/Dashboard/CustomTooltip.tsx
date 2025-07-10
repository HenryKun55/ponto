import type { TooltipProps } from 'recharts'

interface PayloadItem {
  value: number
  payload: {
    clockIn: string
    clockOut: string
    hours: number
    date: string
  }
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString(undefined, {
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
  if (active && payload && payload.length) {
    const data = payload[0] as PayloadItem

    return (
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: 8,
          borderRadius: 4,
        }}
      >
        <p>{`Data: ${label}`}</p>
        <p>{`Entrada: ${formatTime(data.payload.clockIn)}`}</p>
        <p>{`Saída: ${formatTime(data.payload.clockOut)}`}</p>
        <p>{`Horas trabalhadas: ${formatHoursDecimal(data.payload.hours)}`}</p>
      </div>
    )
  }

  return null
}
