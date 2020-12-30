import React, { useEffect, useState } from 'react'
import styled from '../../lib/styled'

const ClipboardItem = styled.div`
  padding-left: 3px;
  padding-right: 3px;
  padding-top: 5px;
  height: 24px;
  font-size: 12px;
  color: ${({ theme }) => theme.uiTextColor};
  user-select: none;

  max-width: 300px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  background-color: ${({ theme }) => theme.secondaryBackgroundColor};
`

const ClipboardStatus = () => {
  const [clipboardItem, setClipboardItem] = useState('')
  const { clipboard } = window.require('electron')
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!clipboard.readImage().isEmpty()) {
        setClipboardItem('Image Copied')
      } else {
        const clipboardTextRaw = clipboard.readText()
        setClipboardItem(clipboardTextRaw)
      }
    }, 200)
    return () => clearInterval(intervalId)
  }, [clipboard])

  return <ClipboardItem title={clipboardItem}>{clipboardItem}</ClipboardItem>
}

export default ClipboardStatus
