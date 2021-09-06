import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../../cloud/lib/dom'
import { useLeftToRightNavigationListener } from '../../lib/keyboard'

interface LeftToRightListProps {
  className?: string
  ignoreFocus?: boolean
}
const LeftRightList: React.FC<LeftToRightListProps> = ({
  className,
  children,
  ignoreFocus,
}) => {
  const listRef = useRef<HTMLDivElement>(null)
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
      tabIndex={0}
    >
      {children}
    </div>
  )
}

export default LeftRightList
