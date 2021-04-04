import React from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../../lib/v2/dom'
import { useUpDownNavigationListener } from '../../../lib/v2/keyboard'

interface UpDownListProps {
  className?: string
  onBlur?: () => void
}
const UpDownList: React.FC<UpDownListProps> = ({
  className,
  children,
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
