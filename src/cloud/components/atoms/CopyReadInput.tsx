import React, { useState } from 'react'
import copy from 'copy-to-clipboard'
import styled from '../../lib/styled'
import {
  baseButtonStyle,
  secondaryButtonStyle,
} from '../../lib/styled/styleFunctions'

interface CopyReadInputProps {
  text: string
}

const CopyReadInput = ({ text }: CopyReadInputProps) => {
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>('Copy link')

  const copyButtonHandler = () => {
    copy(text)
    setCopyButtonLabel('✓ Copied')
    setTimeout(() => {
      setCopyButtonLabel('Copy link')
    }, 600)
  }

  return (
    <StyledCopyReadInput className='copy-flex'>
      <input readOnly={true} className='link' value={text} />
      <button className='copy-button' onClick={copyButtonHandler} tabIndex={0}>
        {copyButtonLabel}
      </button>
    </StyledCopyReadInput>
  )
}

const StyledCopyReadInput = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  height: 40px;

  .link {
    max-width: 600px;
    margin-right: ${({ theme }) => theme.space.xsmall}px;
    padding-left: ${({ theme }) => theme.space.xxsmall}px;
    background: ${({ theme }) => theme.boldBackgroundColor};
    color: ${({ theme }) => theme.subtleTextColor};
    flex: 1 1 auto;
    height: 100%;
    line-height: 32px;
    border: 1px solid ${({ theme }) => theme.baseBorderColor};

    &:focus {
      border-color: ${({ theme }) => theme.primaryShadowColor};
    }
  }

  .copy-button {
    ${baseButtonStyle}
    ${secondaryButtonStyle}
  }
`

export default CopyReadInput
