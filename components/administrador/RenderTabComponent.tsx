import { TimeEntry } from '@/lib/types'
import { PaginationControls } from '../pagination-controls'
import { TabsContent } from '../ui/tabs'

type TabConfig = {
  value: string
  Component: React.ComponentType<{ entries: TimeEntry[] }>
  pagination: {
    paginatedItems: TimeEntry[]
    currentPage: number
    totalPages: number
    goToPage: (page: number) => void
  }
  totalCount?: number
}

export const RenderTabContent = ({
  value,
  Component,
  pagination,
  totalCount,
}: TabConfig) => {
  return (
    <TabsContent value={value}>
      <Component entries={pagination.paginatedItems} />
      <div className="flex justify-between items-center mt-4 px-2">
        <span className="text-sm text-muted-foreground">
          Mostrando {pagination.paginatedItems.length} de{' '}
          {totalCount ?? pagination.paginatedItems.length} registros
        </span>
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChangeAction={pagination.goToPage}
        />
      </div>
    </TabsContent>
  )
}
