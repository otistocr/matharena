import { useEffect, useState } from 'react'

/** Charge une valeur asynchrone (IndexedDB) ; `deps` relance le chargement. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [v, setV] = useState<T>()
  useEffect(() => {
    let vivant = true
    fn().then((r) => vivant && setV(r))
    return () => {
      vivant = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return v
}
