import React, { useRef, useEffect, useState } from 'react'
import { useIntersection } from 'react-use'

interface IntersectionActionProps {
  root?: Element
  rootMargin?: string
  threshold?: number
  ratio?: number
  callback: () => void
}

const IntersectionAction = ({
  root,
  rootMargin,
  threshold,
  ratio = 1,
  callback,
}: IntersectionActionProps) => {
  const ref = useRef(null)
  const intersection = useIntersection(ref, {
    root,
    rootMargin,
    threshold,
  })
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (intersection == null) {
      return
    }

    if (intersection.intersectionRatio >= ratio && !entered) {
      setEntered(true)
      callback()
    }

    if (intersection.intersectionRatio < ratio) {
      setEntered(false)
    }
  }, [intersection, callback, ratio, entered])

  return <div ref={ref} />
}

export default IntersectionAction
