'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  onPageChangeAction: (page: number) => void
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChangeAction,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null
  const showEndPages = true

  const getPageNumbers = () => {
    const pages = []
    pages.push(currentPage)

    if (currentPage > 1) pages.unshift(currentPage - 1)
    if (currentPage < totalPages) pages.push(currentPage + 1)
    if (currentPage > 2 && currentPage === totalPages)
      pages.unshift(currentPage - 2)
    if (currentPage < totalPages - 1 && currentPage === 1)
      pages.push(currentPage + 2)

    return pages
  }

  const pageNumbers = getPageNumbers()
  const showStartEllipsis = showEndPages && Math.min(...pageNumbers) > 1
  const showEndEllipsis = showEndPages && Math.max(...pageNumbers) < totalPages

  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) onPageChangeAction(currentPage - 1)
            }}
            className={
              currentPage === 1 ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>

        {showEndPages && showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChangeAction(1)
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onPageChangeAction(page)
              }}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showEndPages && showEndEllipsis && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChangeAction(totalPages)
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) onPageChangeAction(currentPage + 1)
            }}
            className={
              currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
