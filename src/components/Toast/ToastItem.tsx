import React, { useState, useEffect } from 'react'
import { ToastMessage } from '../../lib/toast'
import { dateToRelativeString } from '../../lib/utils/time'
import {
  StyledToastContainer,
  StyledToastTop,
  StyledToastRight,
  StyledToastTitle,
  StyledToastTime,
  StyledToastCloseButton,
  StyledToastDescription
} from './styled'
import { selectTheme } from '../App'
import { usePreferences } from '../../lib/preferences/store'

interface ToastItemProps {
  item: ToastMessage
  onClose: (item: ToastMessage) => void
}

const ToastItem = ({ item, onClose }: ToastItemProps) => {

  const { preferences } = usePreferences()
  console.log(selectTheme(preferences['general.theme']))

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
    <StyledToastContainer>
      <StyledToastTop>
        <StyledToastTitle>{item.title}</StyledToastTitle>
        <StyledToastRight>
          <StyledToastTime>{relativeTime}</StyledToastTime>
          <StyledToastCloseButton>
            <span onClick={() => onClose(item)}>&times;</span>
          </StyledToastCloseButton>
        </StyledToastRight>
      </StyledToastTop>
      <StyledToastDescription>{item.description}</StyledToastDescription>
    </StyledToastContainer>
  )
}
export default ToastItem