import { useState, useMemo, useCallback } from 'react';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  pages: number[];
}

interface PaginationActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * Manages pagination state for lists and tables.
 * Returns both the computed pagination state and action handlers.
 */
export function usePagination(
  totalItems: number,
  options?: { initialPage?: number; initialPageSize?: number; maxVisiblePages?: number },
): PaginationState & PaginationActions {
  const { initialPage = 1, initialPageSize = 10, maxVisiblePages = 5 } = options || {};
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pages = useMemo(() => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(safePage - half, 1);
    const end = Math.min(start + maxVisiblePages - 1, totalPages);
    start = Math.max(end - maxVisiblePages + 1, 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages, maxVisiblePages]);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  return {
    currentPage: safePage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    pages,
    setPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}
