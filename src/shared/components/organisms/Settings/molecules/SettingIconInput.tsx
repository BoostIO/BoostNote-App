import React, { useState, useCallback } from 'react'
import styled from '../../../../lib/styled'
import SettingIconInputLabel from '../atoms/SettingIconInputLabel'

interface SettingIconInputProps {
  onChange?: (file: File) => void
  defaultUrl?: string
}

const SettingIconInput = ({ onChange, defaultUrl }: SettingIconInputProps) => {
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
    <Container className='setting__icon-input'>
      <div className='setting__icon-input__img'>
        <img
          className='setting__icon-input__img__content'
          src={fileUrl != null ? fileUrl : defaultUrl}
        />
      </div>
      <SettingIconInputLabel>
        <span>Select Image...</span>
        <input accept='image/*' type='file' onChange={changeHandler} />
      </SettingIconInputLabel>
    </Container>
  )
}

export default SettingIconInput

const Container = styled.div`
  display: flex;
  align-items: center;

  .setting__icon-input__img {
    width: 90px;
    height: 90px;
  }

  .setting__icon-input__img__content {
    object-fit: cover;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    border-radius: 50%;
  }
`
