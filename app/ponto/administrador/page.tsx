'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {
  getAllTimeEntriesFilteredFirebase,
  getAllTimeEntriesFirebase,
} from '@/lib/firebase'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
      (entry) => entry.clockInLocation || entry.clockOutLocation
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription className="text-white/90">
                Registros de Ponto
              </CardDescription>
            </div>
            <ExportButton entries={timeEntries} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="registros" className="w-full">
            <div className="w-full flex justify-between">
              <TabsList className="mb-4">
                <TabsTrigger value="registros">Registros</TabsTrigger>
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="localizacao">Localização</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Itens por página:
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

            <RenderTabContent
              value="registros"
              Component={TimeEntriesTable}
              pagination={entriesPagination}
              totalCount={timeEntries.length}
            />

            <RenderTabContent
              value="detalhes"
              Component={TimeEntriesDetailsTable}
              pagination={detailsPagination}
              totalCount={timeEntries.length}
            />

            <RenderTabContent
              value="localizacao"
              Component={LocationsTable}
              pagination={locationsPagination}
              totalCount={
                timeEntries.filter(
                  (entry) => entry.clockInLocation || entry.clockOutLocation
                ).length
              }
            />
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
