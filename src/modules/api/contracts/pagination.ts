import type { TPagination } from './defineContract'

const pageCountHeader = 'X-Pagination-Page-Count'
const totalCountHeader = 'X-Pagination-Total-Count'
const currentPageHeader = 'X-Pagination-Current-Page'

const readIntHeader = (headers: Headers, name: string, fallback: number) => {
    const value = headers.get(name)
    if (value === null) return fallback
    const parsed = parseInt(value, 10)
    return Number.isNaN(parsed) ? fallback : parsed
}

export const readPaginationHeaders = (headers: Headers): TPagination => ({
    currentPage: readIntHeader(headers, currentPageHeader, 1),
    totalPages: readIntHeader(headers, pageCountHeader, 1),
    totalItems: readIntHeader(headers, totalCountHeader, 0),
})
