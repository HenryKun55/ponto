'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TimePicker } from './time-picker'
import { Card } from '@/components/ui/card'
import { getGeoLocation } from '@/lib/geo-service'
import { useClockIn, useClockOut } from '@/hooks/use-time-record'
import { TimeEntry } from '@/lib/types'

type ClockFormProps = {
  employee: string
  todayEntry: TimeEntry | null | undefined
}

const getCurrentPeriod = () => {
  const now = new Date()
  const hour = now.getHours()
  return hour < 13 ? ('morning' as const) : ('afternoon' as const)
}

const canClockIn = (
  todayEntry: TimeEntry | null | undefined,
  period: 'morning' | 'afternoon'
) => {
  if (!todayEntry) return true

  if (period === 'morning') {
    return !todayEntry.morningClockIn
  } else {
    return !todayEntry.afternoonClockIn
  }
}

const canClockOut = (
  todayEntry: TimeEntry | null | undefined,
  period: 'morning' | 'afternoon'
) => {
  if (!todayEntry) return false

  if (period === 'morning') {
    return Boolean(todayEntry.morningClockIn && !todayEntry.morningClockOut)
  } else {
    return Boolean(todayEntry.afternoonClockIn && !todayEntry.afternoonClockOut)
  }
}

export const ClockForm = ({ employee, todayEntry }: ClockFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [actionType, setActionType] = useState<'in' | 'out' | null>(null)

  const { mutateAsync: mutateAsyncClockIn } = useClockIn()
  const { mutateAsync: mutateAsyncClockOut } = useClockOut()

  const currentPeriod = getCurrentPeriod()
  const canRegisterIn = canClockIn(todayEntry, currentPeriod)
  const canRegisterOut = canClockOut(todayEntry, currentPeriod)

  const handleClockIn = async () => {
    setActionType('in')
    setShowTimePicker(true)
  }

  const handleClockOut = async () => {
    setActionType('out')
    setShowTimePicker(true)
  }

  const handleTimeConfirm = async () => {
    if (!selectedTime || !actionType) return

    setIsLoading(true)
    try {
      let location = null
      try {
        location = await getGeoLocation()
      } catch (error) {
        console.error('Erro ao obter localização:', error)
      }

      const today = new Date().toISOString().split('T')[0]
      const [hours, minutes] = selectedTime.split(':')
      const selectedDateTime = new Date(today)
      selectedDateTime.setHours(
        Number.parseInt(hours),
        Number.parseInt(minutes),
        0,
        0
      )

      const input = {
        employee,
        selectedTime: selectedDateTime.toISOString(),
        location,
        period: currentPeriod,
      }

      actionType === 'in'
        ? await mutateAsyncClockIn(input)
        : await mutateAsyncClockOut(input)

      const periodName = currentPeriod === 'morning' ? 'manhã' : 'tarde'
      const actionName = actionType === 'in' ? 'entrada' : 'saída'

      toast.success(
        `Ponto de ${actionName} da ${periodName} registrado para ${employee}`
      )
    } catch (error) {
      console.error('Erro ao registrar ponto', error)
      toast.error('Erro ao registrar ponto. ' + error)
    } finally {
      setIsLoading(false)
      setShowTimePicker(false)
      setActionType(null)
    }
  }

  const handleCancel = () => {
    setShowTimePicker(false)
    setActionType(null)
  }

  const getPeriodLabel = () => {
    return currentPeriod === 'morning' ? 'Manhã' : 'Tarde'
  }

  return (
    <>
      {!showTimePicker ? (
        <div className="flex flex-col space-y-4">
          <div className="text-center mb-2">
            <p className="text-sm text-muted-foreground">
              Período atual:{' '}
              <span className="font-medium">{getPeriodLabel()}</span>
            </p>
          </div>

          <Button
            onClick={handleClockIn}
            disabled={isLoading || !canRegisterIn}
            className="bg-primary hover:bg-primary/90"
          >
            Registrar Entrada - {getPeriodLabel()}
          </Button>

          <Button
            onClick={handleClockOut}
            disabled={isLoading || !canRegisterOut}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            Registrar Saída - {getPeriodLabel()}
          </Button>
        </div>
      ) : (
        <Card className="p-4">
          <TimePicker
            label={`Selecione o horário de ${actionType === 'in' ? 'entrada' : 'saída'} - ${getPeriodLabel()}`}
            isOpen={showTimePicker}
            onChangeAction={setSelectedTime}
          />
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTimeConfirm}
              disabled={isLoading || !selectedTime}
            >
              Confirmar
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
