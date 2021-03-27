import React, { useState, useCallback } from 'react'
import styled from '../../lib/styled'
import {
  secondaryButtonStyle,
  baseButtonStyle,
} from '../../lib/styled/styleFunctions'

interface IconInputProps {
  onChange?: (file: File) => void
  defaultUrl?: string
  shape?: 'square' | 'circle'
}

const IconInput = ({
  onChange,
  defaultUrl,
  shape = 'square',
}: IconInputProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (
        event.target != null &&
        event.target.files != null &&
        event.target.files.length > 0
      ) {
        const file = event.target.files[0]
        setFileUrl(URL.createObjectURL(file))
        if (onChange != null) {
          onChange(file)
        }
      }
    },
    [onChange]
  )

  return (
    <StyledIcon>
      <StyledIconImage>
        <StyledIconImageContent
          shape={shape}
          src={fileUrl != null ? fileUrl : defaultUrl}
        />
      </StyledIconImage>
      <StyledIconInputLabel>
        <span>Select Image...</span>
        <input accept='image/*' type='file' onChange={changeHandler} />
      </StyledIconInputLabel>
    </StyledIcon>
  )
}

export default IconInput

const StyledIcon = styled.div`
  display: flex;
  align-items: center;
`

const StyledIconImage = styled.div`
  width: 90px;
  height: 90px;
`

const StyledIconImageContent = styled.img<{ shape: string }>`
  object-fit: cover;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.secondaryBackgroundColor};
  border: 1px solid ${({ theme }) => theme.secondaryBorderColor};
  border-radius: ${(props: any) => (props.shape === 'circle' ? '100%' : '0')};
`

const StyledIconInputLabel = styled.label`
  position: relative;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.space.default}px;

  & > span {
    display: block;
    padding: 8px 16px;
    border-radius: 5px;
    ${baseButtonStyle}
    ${secondaryButtonStyle}
  }

  & > input[type='file'] {
    position: absolute;
    opacity: 0;
    height: 0px;
    width: 0px;
  }
`
