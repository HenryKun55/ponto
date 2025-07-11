'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { getAllTimeEntriesFilteredFirebase } from '@/lib/firebase'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateTimeEntries } from '@/lib/mock'
import { saveTimeEntryFirebase } from '@/lib/firebase'
import { usePagination } from '@/hooks/use-pagination'
import { ExportButton } from '@/components/administrador/ExportButton'
import { TimeEntriesTable } from '@/components/administrador/TimeEntriesTable'
import { LocationsTable } from '@/components/administrador/LocationTable'
import { TimeEntriesDetailsTable } from '@/components/administrador/TimeEntriesDetailsTable'
import { TimeEntry } from '@/lib/types'
import { RenderTabContent } from '@/components/administrador/RenderTabComponent'
import { DateRangePicker } from '@/components/date-range-picker'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { TabsContent } from '@radix-ui/react-tabs'
import { DashboardRecords } from '@/components/administrador/Dashboard/DashboardRecords'
import { ModeToggle } from '@/components/mode-toggle'

export default () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMock, setIsLoadingMock] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const entriesPagination = usePagination(timeEntries, itemsPerPage)
  const detailsPagination = usePagination(timeEntries, itemsPerPage)
  const locationsPagination = usePagination(
    timeEntries.filter(
      (entry) =>
        entry.morningClockIn ||
        entry.morningClockOut ||
        entry.afternoonClockIn ||
        entry.afternoonClockOut
    ),
    itemsPerPage
  )

  const fetchData = async () => {
    try {
      const entries = await getAllTimeEntriesFilteredFirebase(
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
      )
      setTimeEntries(entries.reverse())
    } catch (error) {
      console.error('Error fetching time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEntrysMockAndSaveTimeEntries = async () => {
    setIsLoadingMock(true)
    try {
      const entries = generateTimeEntries('2025-01-01', 100)

      for (const entry of entries) {
        await saveTimeEntryFirebase(entry)
      }

      fetchData()
    } catch (error) {
      console.error('Erro ao gerar ou salvar os mocks:', error)
    } finally {
      setIsLoadingMock(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

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
          <div className="flex items-center">
            <div className="mr-auto">
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription className="text-white/90">
                Registros de Ponto
              </CardDescription>
            </div>
            <div className="gap-4 flex">
              <ExportButton entries={timeEntries} />
              <ModeToggle />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="pb-4 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
              {/* Tabs */}
              <TabsList className="flex flex-wrap h-fit">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="registros">Registros</TabsTrigger>
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="localizacao">Localização</TabsTrigger>
              </TabsList>

              {/* Botões e DatePicker */}
              <div className="flex flex-wrap gap-4 items-center justify-start sm:justify-end">
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={generateEntrysMockAndSaveTimeEntries}
                    disabled={loadingMock}
                  >
                    {loadingMock ? 'Gerando...' : 'Gerar mock'}
                  </Button>
                )}
                <DateRangePicker date={dateRange} setDate={setDateRange} />
              </div>
            </div>

            <TabsContent value="dashboard">
              <DashboardRecords dateRange={dateRange} />
            </TabsContent>

            <RenderTabContent
              value="registros"
              Component={TimeEntriesTable}
              pagination={entriesPagination}
              totalCount={timeEntries.length}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />

            <RenderTabContent
              value="detalhes"
              Component={TimeEntriesDetailsTable}
              pagination={detailsPagination}
              totalCount={timeEntries.length}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />

            <RenderTabContent
              value="localizacao"
              Component={LocationsTable}
              pagination={locationsPagination}
              totalCount={
                timeEntries.filter(
                  (entry) =>
                    entry.morningClockIn ||
                    entry.morningClockOut ||
                    entry.afternoonClockIn ||
                    entry.afternoonClockOut
                ).length
              }
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
