"use client"

import { useState, useEffect } from "react"

export function useMockDelay<T>(
  data: T,
  ms = 800
): { data: T | null; isLoading: boolean } {
  const [state, setState] = useState<{ data: T | null; isLoading: boolean }>({
    data: null,
    isLoading: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({ data, isLoading: false })
    }, ms)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
