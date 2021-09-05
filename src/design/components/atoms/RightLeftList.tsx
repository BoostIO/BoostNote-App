import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../lib/dom'
import { useLeftToRightNavigationListener } from '../../lib/keyboard'

interface LeftRightListProps {
  className?: string
  onBlur?: () => void
  ignoreFocus?: boolean
}
const LeftRightList: React.FC<LeftRightListProps> = ({
  className,
  children,
  ignoreFocus,
  onBlur,
}) => {
  const listRef = useRef<HTMLDivElement>(null)

  const onBlurHandler = (event: any) => {
    if (onBlur == null) {
      return
    }

    if (
      event.relatedTarget == null ||
      listRef.current == null ||
      !listRef.current.contains(event.relatedTarget)
    ) {
      onBlur()
      return
    }
  }

  useEffectOnce(() => {
    if (listRef.current != null) {
      listRef.current.focus()
    }
  })

  useLeftToRightNavigationListener(listRef)

  return (
    <div
      ref={listRef}
      className={className}
      onFocus={(event) => {
        if (ignoreFocus) {
          return
        }

        if (event.target === listRef.current) {
          event.preventDefault()
          focusFirstChildFromElement(event.target)
        }
      }}
      onBlur={onBlurHandler}
      tabIndex={0}
    >
      {children}
    </div>
  )
}

export default LeftRightList
