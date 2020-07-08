import React, { useEffect, useRef } from 'react'
import styled from '../../../lib/styled'
import Icon from '../Icon'
import { mdiContentCopy } from '@mdi/js'
import Clipboard from 'clipboard'

const StyledCopyButton = styled.button`
  color: currentColor;
  background-color: transparent;
  border: none;
  cursor: pointer;
  top: 10px;
  right: 10px;
  position: absolute;

  svg {
    margin-top: 2px;
    vertical-align: top;
  }
`

interface CodeblockCopyButtonProps {
  code: string
}

const CodeblockCopyButton = ({ code }: CodeblockCopyButtonProps) => {
  const buttonRef = useRef(null)
  useEffect(() => {
    new Clipboard(buttonRef.current)
  }, [])
  return (
    <StyledCopyButton data-clipboard-text={code} ref={buttonRef}>
      <Icon path={mdiContentCopy} />
    </StyledCopyButton>
  )
}

export default CodeblockCopyButton
