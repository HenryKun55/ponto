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
      refetchOnWindowFocus: true,
    }),

  useClockIn: () =>
    useMutation({
      mutationFn: async ({
        employee,
        selectedTime,
        location,
        period,
      }: {
        employee: string
        selectedTime: string
        location: GeoLocation | null
        period: 'morning' | 'afternoon'
      }) => {
        const result = await clockIn(employee, selectedTime, location, period)
        if (!result.success) {
          throw new Error(result.message)
        }
        return result
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.fetchTodayEntry(variables.employee),
        })
      },
      onError: (error) => {
        console.error('Erro no clock in:', error)
      },
      retry: 2,
    }),

  useClockOut: () =>
    useMutation({
      mutationFn: async ({
        employee,
        selectedTime,
        location,
        period,
      }: {
        employee: string
        selectedTime: string
        location: GeoLocation | null
        period: 'morning' | 'afternoon'
      }) => {
        const result = await clockOut(employee, selectedTime, location, period)
        if (!result.success) {
          throw new Error(result.message)
        }
        return result
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.fetchTodayEntry(variables.employee),
        })
      },
      onError: (error) => {
        console.error('Erro no clock out:', error)
      },
      retry: 2,
    }),

  useFetchTimeEntriesFiltered: (startDate?: string, endDate?: string) =>
    useQuery({
      queryKey: timeRecordKeys.fetchFiltered(startDate, endDate),
      queryFn: () => getAllTimeEntriesFiltered(startDate, endDate),
    }),

  useFetchEmployeeTimeEntries: (employee: string) =>
    useQuery({
      queryKey: timeRecordKeys.fetchEmployee(employee),
      queryFn: () => getEmployeeTimeEntries(employee),
    }),

  useFetchTodayEntry: (employee: string) =>
    useQuery({
      queryKey: timeRecordKeys.fetchTodayEntry(employee),
      queryFn: () => getTodayEntry(employee),
      refetchOnWindowFocus: true,
    }),

  useSaveTimeEntry: () =>
    useMutation({
      mutationFn: (entry: TimeEntry) => saveTimeEntry(entry),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.all })
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.fetchTodayEntry(variables.employee),
        })
        queryClient.invalidateQueries({
          queryKey: timeRecordKeys.fetchEmployee(variables.employee),
        })
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
