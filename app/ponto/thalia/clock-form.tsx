"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { clockIn, clockOut } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ClockFormProps {
  employee: string
  hasClockIn: boolean
  hasClockOut: boolean
}

export function ClockForm({ employee, hasClockIn, hasClockOut }: ClockFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClockIn = async () => {
    setIsLoading(true)
    try {
      const result = await clockIn(employee)
      toast({
        title: result.success ? "Sucesso!" : "Aviso",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })

      // Recarregar a página se a ação foi bem-sucedida
      if (result.success && result.refresh) {
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar entrada.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    setIsLoading(true)
    try {
      const result = await clockOut(employee)
      toast({
        title: result.success ? "Sucesso!" : "Aviso",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })

      // Recarregar a página se a ação foi bem-sucedida
      if (result.success && result.refresh) {
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar saída.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <Button
          onClick={handleClockIn}
          disabled={isLoading || (hasClockIn && !hasClockOut)}
          className="bg-primary hover:bg-primary/90"
        >
          Registrar Entrada
        </Button>
        <Button
          onClick={handleClockOut}
          disabled={isLoading || !hasClockIn || hasClockOut}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          Registrar Saída
        </Button>
      </div>
      <Toaster />
    </>
  )
}
