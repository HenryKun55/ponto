import { useMutation, useQuery } from '@tanstack/react-query'
import {
  clockIn,
  clockOut,
  getAllTimeEntries,
  getAllTimeEntriesFiltered,
  getEmployeeTimeEntries,
  getTodayEntry,
  saveTimeEntry,
} from '@/lib/actions'
import { queryClient } from '@/components/query-client.provider'
import type { GeoLocation, TimeEntry } from '@/lib/types'

export const timeRecordKeys = {
  all: ['timeRecords'] as const,
  fetchAll: () => [...timeRecordKeys.all, 'fetchAll'] as const,
  clockIn: () => [...timeRecordKeys.all, 'clockIn'] as const,
  clockOut: () => [...timeRecordKeys.all, 'clockOut'] as const,
  fetchFiltered: (startDate?: string, endDate?: string) =>
    [
      ...timeRecordKeys.all,
      'fetchFiltered',
      startDate ?? '',
      endDate ?? '',
    ] as const,
  fetchEmployee: (employee: string) =>
    [...timeRecordKeys.all, 'fetchEmployee', employee] as const,
  fetchTodayEntry: (employee: string) =>
    [...timeRecordKeys.all, 'fetchTodayEntry', employee] as const,
  saveEntry: () => [...timeRecordKeys.all, 'saveEntry'] as const,
}

const timeRecordApi = {
  useFetchAllRecords: () =>
    useQuery({
      queryKey: timeRecordKeys.fetchAll(),
      queryFn: () => getAllTimeEntries(),
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter no cache por 10 minutos mesmo sem usar
      gcTime: 10 * 60 * 1000,
      // Refetch em background quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Retry 3 vezes em caso de erro
      retry: 3,
    }),

  useClockIn: () =>
    useMutation({
      mutationFn: async ({
        employee,
        selectedTime,
        location,
      }: {
        employee: string
        selectedTime: string
        location: GeoLocation | null
      }) => {
        return await clockIn(employee, selectedTime, location)
      },
      onSuccess: (_, variables) => {
        // Invalidar queries específicas
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.fetchTodayEntry(variables.employee),
        })
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.fetchAll() })

        // Invalidar queries filtradas que podem incluir hoje
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.all,
          predicate: (query) => {
            return query.queryKey[1] === 'fetchFiltered'
          },
        })
      },
      // Retry automático em caso de falha
      retry: 2,
    }),

  useClockOut: () =>
    useMutation({
      mutationFn: async ({
        employee,
        selectedTime,
        location,
      }: {
        employee: string
        selectedTime: string
        location: GeoLocation | null
      }) => {
        return await clockOut(employee, selectedTime, location)
      },
      onSuccess: (_, variables) => {
        // Invalidar queries específicas
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.fetchTodayEntry(variables.employee),
        })
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.fetchAll() })

        // Invalidar queries filtradas que podem incluir hoje
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.all,
          predicate: (query) => {
            return query.queryKey[1] === 'fetchFiltered'
          },
        })
      },
      retry: 2,
    }),

  useFetchTimeEntriesFiltered: (startDate?: string, endDate?: string) =>
    useQuery({
      queryKey: timeRecordKeys.fetchFiltered(startDate, endDate),
      queryFn: () => getAllTimeEntriesFiltered(startDate, endDate),
      // Cache por mais tempo para dados históricos
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
      // Não refetch automaticamente para dados históricos
      refetchOnWindowFocus: false,
      // Só executa se tiver as datas
      enabled: !!(startDate && endDate),
      retry: 3,
    }),

  useFetchEmployeeTimeEntries: (employee: string) =>
    useQuery({
      queryKey: timeRecordKeys.fetchEmployee(employee),
      queryFn: () => getEmployeeTimeEntries(employee),
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      // Só executa se tiver o employee
      enabled: !!employee,
      retry: 3,
    }),

  useFetchTodayEntry: (employee: string) =>
    useQuery({
      queryKey: timeRecordKeys.fetchTodayEntry(employee),
      queryFn: () => getTodayEntry(employee),
      // Cache menor para dados do dia atual
      staleTime: 1 * 60 * 1000, // 1 minuto
      gcTime: 5 * 60 * 1000, // 5 minutos
      // Refetch mais frequentemente
      refetchOnWindowFocus: true,
      refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
      enabled: !!employee,
      retry: 3,
    }),

  useSaveTimeEntry: () =>
    useMutation({
      mutationFn: (entry: TimeEntry) => saveTimeEntry(entry),
      onSuccess: (data, variables) => {
        // Invalidar todas as queries relacionadas
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.all })

        // Opcionalmente, você pode fazer um update otimista
        // queryClient.setQueryData(timeRecordKeys.fetchAll(), (old: TimeEntry[] | undefined) => {
        //   if (!old) return [variables]
        //   return [...old, variables]
        // })
      },
      retry: 2,
    }),
}

export const {
  useFetchAllRecords,
  useClockIn,
  useClockOut,
  useFetchTimeEntriesFiltered,
  useFetchEmployeeTimeEntries,
  useFetchTodayEntry,
  useSaveTimeEntry,
} = timeRecordApi
