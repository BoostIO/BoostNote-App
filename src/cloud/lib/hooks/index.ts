import { useState, useRef, useEffect, useCallback } from 'react'

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

export function useRefCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
) {
  const cb = useCallback(callback, deps)

  const callbackRef = useRef(cb)

  useEffect(() => {
    callbackRef.current = cb
  }, [cb])

  return [cb, callbackRef] as [T, React.MutableRefObject<T>]
}

export function useCommittedRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
