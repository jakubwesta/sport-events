import { useCallback, useEffect, useRef, useState } from 'react'

import type { ApiError } from '@/lib/api-error'

type AsyncState<T> = {
  data: T | null
  isLoading: boolean
  error: ApiError | null
}

type UseAsyncOptions = {
  enabled?: boolean
  initialData?: null
}

export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseAsyncOptions = {},
) {
  const { enabled = true } = options
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: enabled,
    error: null,
  })

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await fetcherRef.current()
      setState({ data, isLoading: false, error: null })
      return data
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as ApiError })
      throw error
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }
    void refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps passed explicitly by caller
  }, [enabled, refetch, ...deps])

  return { ...state, refetch }
}

export function useMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(
    async (input: TInput) => {
      setIsLoading(true)
      setError(null)
      try {
        return await mutationFn(input)
      } catch (err) {
        setError(err as ApiError)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn],
  )

  const reset = useCallback(() => setError(null), [])

  return { mutate, isLoading, error, reset }
}
