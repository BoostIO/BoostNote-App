import { useState, useRef, useEffect } from 'react'

export function useRefState<S>(initialValue: S) {
  const [state, setState] = useState<S>(initialValue)
  const stateRef = useRefEffect(state)

  return [state, stateRef, setState] as [
    S,
    React.MutableRefObject<S>,
    React.Dispatch<React.SetStateAction<S>>
  ]
}

export function useRefEffect<S>(value: S) {
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}

export function useCommittedRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
