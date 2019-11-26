import React, { useState, useEffect } from 'react'
import { ToastMessage } from '../../lib/toast'
import { dateToRelativeString } from '../../lib/utils/time'

interface ToastItemProps {
  item: ToastMessage
  onClose: (item: ToastMessage) => void
}

export default ({ item, onClose }: ToastItemProps) => {
  const [relativeTime, setRelativeTime] = useState(
    dateToRelativeString(item.createdAt)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(dateToRelativeString(item.createdAt))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div>
        {item.title} {relativeTime}{' '}
        <span onClick={() => onClose(item)}>&times;</span>
      </div>
      <div>{item.description}</div>
    </div>
  )
}
