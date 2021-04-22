import React from 'react'
import { useEffectOnce } from 'react-use'
import { useLeftToRightNavigationListener } from '../../../shared/lib/keyboard'

interface LeftToRightListProps {
  className?: string
}
const LeftToRightList: React.FC<LeftToRightListProps> = ({
  className,
  children,
}) => {
  const listRef = React.createRef<HTMLDivElement>()
  useEffectOnce(() => {
    if (listRef.current != null) {
      listRef.current.focus()
    }
  })

  useLeftToRightNavigationListener(listRef)

  return (
    <div ref={listRef} className={className} tabIndex={0}>
      {children}
    </div>
  )
}

export default LeftToRightList
