import React from 'react'
import { useEffectOnce } from 'react-use'
import { useUpDownNavigationListener } from '../../../lib/v2/keyboard'

interface UpDownListProps {
  className?: string
}
const UpDownList: React.FC<UpDownListProps> = ({ className, children }) => {
  const listRef = React.createRef<HTMLDivElement>()
  useEffectOnce(() => {
    if (listRef.current != null) {
      listRef.current.focus()
    }
  })

  useUpDownNavigationListener(listRef)

  return (
    <div ref={listRef} className={className} tabIndex={0}>
      {children}
    </div>
  )
}

export default UpDownList
