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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.fetchAll() })
      },
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.fetchAll() })
      },
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
    }),

  useSaveTimeEntry: () =>
    useMutation({
      mutationFn: (entry: TimeEntry) => saveTimeEntry(entry),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: timeRecordKeys.all })
      },
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
