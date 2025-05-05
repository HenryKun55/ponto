"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { TimeEntry } from "@/lib/types"
import { formatDate, formatTime, calculateDuration } from "@/lib/utils"

interface ExportButtonProps {
  entries: TimeEntry[]
}

export function ExportButton({ entries }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // Dynamically import xlsx
      const XLSX = await import("xlsx")

      // Prepare data for export
      const data = entries.map((entry) => ({
        Funcionário: entry.employee,
        Data: formatDate(entry.date),
        Entrada: entry.clockIn ? formatTime(entry.clockIn) : "-",
        Saída: entry.clockOut ? formatTime(entry.clockOut) : "-",
        Duração: calculateDuration(entry.clockIn, entry.clockOut),
      }))

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data)

      // Create workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Registros de Ponto")

      // Generate file name
      const fileName = `registros_ponto_${new Date().toISOString().split("T")[0]}.xlsx`

      // Export to file
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error("Erro ao exportar:", error)
      alert("Ocorreu um erro ao exportar os dados.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={exportToExcel}
      disabled={isExporting || entries.length === 0}
      variant="secondary"
      className="bg-white text-primary hover:bg-white/90"
    >
      <Download className="mr-2 h-4 w-4" />
      Exportar XLSX
    </Button>
  )
}
