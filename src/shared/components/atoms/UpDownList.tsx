import React from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../lib/dom'
import { useUpDownNavigationListener } from '../../lib/keyboard'

interface UpDownListProps {
  className?: string
  onBlur?: () => void
  ignoreFocus?: boolean
}
const UpDownList: React.FC<UpDownListProps> = ({
  className,
  children,
  ignoreFocus,
  onBlur,
}) => {
  const listRef = React.createRef<HTMLDivElement>()

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

  useUpDownNavigationListener(listRef)

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

export default UpDownList
