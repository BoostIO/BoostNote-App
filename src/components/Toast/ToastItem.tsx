import styled from '../../lib/styled'
import React, { useState, useEffect } from 'react'
import { ToastMessage } from '../../lib/toast'
import { dateToRelativeString } from '../../lib/utils/time'

const StyledToastContainer = styled.div`
  width: 350px;
  margin: 40px;
  padding: 10px 30px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-radius: 5px;
`
const StyledToastTop = styled.div`
  display: inline-flex;
  border-bottom: 1px solid;
  width: 100%;
`
const StyledToastRight = styled.div`
  position: absolute;
  right: 60px;
  display: inline-flex;
`
const StyledToastTitle = styled.p`
  font-size: 16px;
  font-weight: 600:
`
const StyledToastTime = styled.p`
  font-size: 12px;
  margin-right: 10px;
  line-height: 25px;
`
const StyledToastCloseButton = styled.button`
  background-color: transparent;
  font-size: 14px;
  order: none;
  cursor: pointer;
  border: none;
`
const StyledToastDescription = styled.p`
  font-size: 14px;
`

interface ToastItemProps {
  item: ToastMessage
  onClose: (item: ToastMessage) => void
}

const ToastItem = ({ item, onClose }: ToastItemProps) => {
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
