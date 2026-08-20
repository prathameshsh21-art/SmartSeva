import { useState } from 'react';

export default function usePagination(initialPage = 0, initialSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = () => setPage((prev) => prev + 1);

  const previousPage = () =>
    setPage((prev) => (prev > 0 ? prev - 1 : 0));

  const resetPage = () => setPage(0);

  return {
    page,
    size,
    setPage,
    setSize,
    nextPage,
    previousPage,
    resetPage,
  };
}