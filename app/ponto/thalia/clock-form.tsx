"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { clockIn, clockOut } from "@/lib/actions"
import { TimePicker } from "./time-picker"
import { Card } from "@/components/ui/card"
import { getGeoLocation } from "@/lib/geo-service"

interface ClockFormProps {
  employee: string
  hasClockIn: boolean
  hasClockOut: boolean
}

export function ClockForm({ employee, hasClockIn, hasClockOut }: ClockFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState("")
  const [actionType, setActionType] = useState<"in" | "out" | null>(null)

  const handleClockIn = async () => {
    setActionType("in")
    setShowTimePicker(true)
  }

  const handleClockOut = async () => {
    setActionType("out")
    setShowTimePicker(true)
  }

  const handleTimeConfirm = async () => {
    if (!selectedTime || !actionType) return

    setIsLoading(true)
    try {
      // Obter localização da API
      let location = null
      try {
        location = await getGeoLocation()
      } catch (error) {
        console.error("Erro ao obter localização:", error)
      }

      // Criar data completa a partir da data atual e hora selecionada
      const today = new Date().toISOString().split("T")[0]
      const [hours, minutes] = selectedTime.split(":")
      const selectedDateTime = new Date(today)
      selectedDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      // Registrar ponto
      const result =
        actionType === "in"
          ? await clockIn(employee, selectedDateTime.toISOString(), location)
          : await clockOut(employee, selectedDateTime.toISOString(), location)

      // Recarregar a página se a ação foi bem-sucedida
      if (result.success && result.refresh) {
        window.location.reload()
      }
    } catch (error) {
        console.error("Erro ao registrar ponto", error)
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

  return (
    <>
      {!showTimePicker ? (
        <div className="flex flex-col space-y-4">
          <Button onClick={handleClockIn} disabled={isLoading || hasClockIn} className="bg-primary hover:bg-primary/90">
            Registrar Entrada
          </Button>
          <Button
            onClick={handleClockOut}
            disabled={isLoading || hasClockOut}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            Registrar Saída
          </Button>
        </div>
      ) : (
        <Card className="p-4">
          <TimePicker
            label={`Selecione o horário de ${actionType === "in" ? "entrada" : "saída"}`}
            onChange={setSelectedTime}
          />
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleTimeConfirm} disabled={isLoading || !selectedTime}>
              Confirmar
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
