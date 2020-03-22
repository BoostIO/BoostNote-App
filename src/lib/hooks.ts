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
