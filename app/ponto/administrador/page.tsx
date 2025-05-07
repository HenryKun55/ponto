"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { getAllTimeEntriesFirebase } from "@/lib/firebase"
import { formatDate, formatDateTime, formatTime, calculateDuration } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportButton } from "./export-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, Clock, AlertCircle, Globe } from "lucide-react"
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

  // Verificar se o horário foi ajustado
  const wasAdjusted = (registeredTime: string | null, realTime: string | null) => {
    if (!registeredTime || !realTime) return false

    const registered = new Date(registeredTime)
    const real = new Date(realTime)

    // Diferença maior que 2 minutos é considerada um ajuste
    return Math.abs(registered.getTime() - real.getTime()) > 2 * 60 * 1000
  }

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
          <Tabs defaultValue="registros" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="registros">Registros</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="localizacao">Localização</TabsTrigger>
            </TabsList>

            <TabsContent value="registros">
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
                            <TableCell>
                              <div className="flex items-center">
                                {formatTime(entry.clockIn)}
                                {entry.realClockInTime && wasAdjusted(entry.clockIn, entry.realClockInTime) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertCircle className="h-4 w-4 ml-1 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Horário ajustado</p>
                                        <p>Registrado em: {formatDateTime(entry.realClockInTime)}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {formatTime(entry.clockOut)}
                                {entry.realClockOutTime && wasAdjusted(entry.clockOut, entry.realClockOutTime) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertCircle className="h-4 w-4 ml-1 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Horário ajustado</p>
                                        <p>Registrado em: {formatTime(entry.realClockOutTime)}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{calculateDuration(entry.clockIn, entry.clockOut)}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="detalhes">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário Registrado</TableHead>
                      <TableHead>Horário Real</TableHead>
                      <TableHead>Localização</TableHead>
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
                        .flatMap((entry) =>
                          [
                            // Entrada
                            entry.clockIn && (
                              <TableRow key={`${entry.id}-in`}>
                                <TableCell className="font-medium capitalize">{entry.employee}</TableCell>
                                <TableCell>{formatDate(entry.date)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="w-fit flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Entrada: {formatTime(entry.clockIn)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {entry.realClockInTime && (
                                    <Badge
                                      variant={
                                        wasAdjusted(entry.clockIn, entry.realClockInTime) ? "destructive" : "outline"
                                      }
                                      className="w-fit flex items-center gap-1"
                                    >
                                      {formatDateTime(entry.realClockInTime)}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {entry.clockInLocation ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="secondary" className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            Ver localização
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Cidade: {entry.clockInLocation.city}</p>
                                          <p>
                                            {entry.clockInLocation.region}, {entry.clockInLocation.country}
                                          </p>
                                          <p>CEP: {entry.clockInLocation.postal}</p>
                                          <p>Latitude: {entry.clockInLocation.latitude}</p>
                                          <p>Longitude: {entry.clockInLocation.longitude}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Não disponível</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ),
                            // Saída
                            entry.clockOut && (
                              <TableRow key={`${entry.id}-out`}>
                                <TableCell className="font-medium capitalize">{entry.employee}</TableCell>
                                <TableCell>{formatDate(entry.date)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="w-fit flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Saída: {formatTime(entry.clockOut)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {entry.realClockOutTime && (
                                    <Badge
                                      variant={
                                        wasAdjusted(entry.clockOut, entry.realClockOutTime) ? "destructive" : "outline"
                                      }
                                      className="w-fit flex items-center gap-1"
                                    >
                                      {formatTime(entry.realClockOutTime)}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {entry.clockOutLocation ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="secondary" className="w-fit flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            Ver localização
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Cidade: {entry.clockOutLocation.city}</p>
                                          <p>
                                            {entry.clockOutLocation.region}, {entry.clockOutLocation.country}
                                          </p>
                                          <p>CEP: {entry.clockOutLocation.postal}</p>
                                          <p>Latitude: {entry.clockOutLocation.latitude}</p>
                                          <p>Longitude: {entry.clockOutLocation.longitude}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Não disponível</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ),
                          ].filter(Boolean),
                        )
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="localizacao">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeEntries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .flatMap((entry) =>
                          [
                            // Entrada
                            entry.clockInLocation && (
                              <TableRow key={`${entry.id}-in-loc`}>
                                <TableCell className="font-medium capitalize">{entry.employee}</TableCell>
                                <TableCell>
                                  {formatDate(entry.date)} {formatTime(entry.clockIn)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">Entrada</Badge>
                                </TableCell>
                                <TableCell>
                                  {entry.clockInLocation.city}, {entry.clockInLocation.region},{" "}
                                  {entry.clockInLocation.country}
                                </TableCell>
                                <TableCell>{entry.clockInLocation.ip}</TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Globe className="h-4 w-4" />
                                      </TooltipTrigger>
                                      <TooltipContent className="w-80">
                                        <div className="space-y-2">
                                          <div className="font-medium">Detalhes da Localização</div>
                                          <div className="grid grid-cols-2 gap-1 text-sm">
                                            <div className="text-muted-foreground">IP:</div>
                                            <div>{entry.clockInLocation.ip}</div>
                                            <div className="text-muted-foreground">País:</div>
                                            <div>
                                              {entry.clockInLocation.country_code} -{" "}
                                              {entry.clockInLocation.country}
                                            </div>
                                            <div className="text-muted-foreground">Região:</div>
                                            <div>
                                              {entry.clockInLocation.region_code} - {entry.clockInLocation.region}
                                            </div>
                                            <div className="text-muted-foreground">Cidade:</div>
                                            <div>{entry.clockInLocation.city}</div>
                                            <div className="text-muted-foreground">CEP:</div>
                                            <div>{entry.clockInLocation.postal}</div>
                                            <div className="text-muted-foreground">Fuso Horário:</div>
                                            <div>{entry.clockInLocation.timezone.id}</div>
                                            <div className="text-muted-foreground">Coordenadas:</div>
                                            <div>
                                              {entry.clockInLocation.latitude.toFixed(6)},{" "}
                                              {entry.clockInLocation.longitude.toFixed(6)}
                                            </div>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                              </TableRow>
                            ),
                            // Saída
                            entry.clockOutLocation && (
                              <TableRow key={`${entry.id}-out-loc`}>
                                <TableCell className="font-medium capitalize">{entry.employee}</TableCell>
                                <TableCell>
                                  {formatDate(entry.date)} {formatTime(entry.clockOut)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">Saída</Badge>
                                </TableCell>
                                <TableCell>
                                  {entry.clockOutLocation.city}, {entry.clockOutLocation.region},{" "}
                                  {entry.clockOutLocation.country}
                                </TableCell>
                                <TableCell>{entry.clockOutLocation.ip}</TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Button variant="ghost" size="sm">
                                          <Globe className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="w-80">
                                        <div className="space-y-2">
                                          <div className="font-medium">Detalhes da Localização</div>
                                          <div className="grid grid-cols-2 gap-1 text-sm">
                                            <div className="text-muted-foreground">IP:</div>
                                            <div>{entry.clockOutLocation.ip}</div>
                                            <div className="text-muted-foreground">País:</div>
                                            <div>
                                              {entry.clockOutLocation.country_code} -{" "}
                                              {entry.clockOutLocation.country}
                                            </div>
                                            <div className="text-muted-foreground">Região:</div>
                                            <div>
                                              {entry.clockOutLocation.region_code} -{" "}
                                              {entry.clockOutLocation.region}
                                            </div>
                                            <div className="text-muted-foreground">Cidade:</div>
                                            <div>{entry.clockOutLocation.city}</div>
                                            <div className="text-muted-foreground">CEP:</div>
                                            <div>{entry.clockOutLocation.postal}</div>
                                            <div className="text-muted-foreground">Fuso Horário:</div>
                                            <div>{entry.clockOutLocation.timezone.id}</div>
                                            <div className="text-muted-foreground">Coordenadas:</div>
                                            <div>
                                              {entry.clockOutLocation.latitude.toFixed(6)},{" "}
                                              {entry.clockOutLocation.longitude.toFixed(6)}
                                            </div>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                              </TableRow>
                            ),
                          ].filter(Boolean),
                        )
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
