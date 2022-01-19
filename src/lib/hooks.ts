import { useEffect, useState, useRef } from 'react'

export function useRefState<S>(initialValue: S) {
  const [state, setState] = useState<S>(initialValue)
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  return [state, stateRef, setState] as [
    S,
    React.MutableRefObject<S>,
    React.Dispatch<React.SetStateAction<S>>
  ]
}

export function useSimpleDebounce<S>(value: S, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

export function usePrevious<S>(value: S) {
  const ref = useRef<S>(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export function useWillUnmountRef() {
  const willUnmountRef = useRef(false)

  useEffect(() => {
    return () => {
      willUnmountRef.current = true
    }
  }, [])

  return {
    willUnmountRef,
  }
}

export function useEffectOnUnmount(
  callback: (() => () => void) | (() => void)
) {
  const { willUnmountRef } = useWillUnmountRef()

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!willUnmountRef.current) {
        return
      }
      callback()
    }
  }, [callback, willUnmountRef])
}
