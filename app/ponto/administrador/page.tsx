"use client"

import { useEffect, useState } from "react"
import { getAllTimeEntriesFirebase } from "@/lib/firebase"
import { formatDate, formatTime, calculateDuration } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportButton } from "./export-button"
import type { TimeEntry } from "@/lib/types"

export default function AdminPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entries = await getAllTimeEntriesFirebase()
        setTimeEntries(entries)
      } catch (error) {
        console.error("Error fetching time entries:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col p-6 bg-secondary">
        <Card className="w-full">
          <CardContent className="p-6 text-center">Carregando...</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-6 bg-secondary">
      <Card className="w-full">
        <CardHeader className="bg-primary text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription className="text-white/90">Registros de Ponto</CardDescription>
            </div>
            <ExportButton entries={timeEntries} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  timeEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium capitalize">{entry.employee}</TableCell>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>{formatTime(entry.clockIn)}</TableCell>
                        <TableCell>{formatTime(entry.clockOut)}</TableCell>
                        <TableCell>{calculateDuration(entry.clockIn, entry.clockOut)}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
