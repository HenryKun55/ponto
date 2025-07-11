import { TimeEntry } from '@/lib/types'
import { PaginationControls } from '../pagination-controls'
import { TabsContent } from '../ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Dispatch, SetStateAction } from 'react'

type TabConfig = {
  value: string
  Component: React.ComponentType<{ entries: TimeEntry[] }>
  pagination: {
    paginatedItems: TimeEntry[]
    currentPage: number
    totalPages: number
    goToPage: (page: number) => void
  }
  itemsPerPage: number
  setItemsPerPage: Dispatch<SetStateAction<number>>
  totalCount?: number
}

export const RenderTabContent = ({
  value,
  Component,
  pagination,
  totalCount,
  itemsPerPage,
  setItemsPerPage,
}: TabConfig) => {
  return (
    <TabsContent value={value}>
      <Component entries={pagination.paginatedItems} />

      <div className="mt-4 px-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex justify-center sm:justify-start">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChangeAction={pagination.goToPage}
          />
        </div>

        <div className="text-sm text-muted-foreground text-center sm:text-right">
          Mostrando {pagination.paginatedItems.length} de{' '}
          {totalCount ?? pagination.paginatedItems.length} registros
        </div>
      </div>
    </TabsContent>
  )
}
