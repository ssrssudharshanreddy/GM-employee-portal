import { useMemo } from 'react';

export function useQuery() {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return useMemo(() => new URLSearchParams(search), [search]);
}
