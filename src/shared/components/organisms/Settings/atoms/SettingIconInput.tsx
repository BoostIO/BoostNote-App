import React, { useState, useCallback } from 'react'
import styled from '../../../../lib/styled'

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
      <label className='setting__icon-input__label'>
        <span>Select Image...</span>
        <input accept='image/*' type='file' onChange={changeHandler} />
      </label>
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

  .setting__icon-input__label {
    position: relative;
    cursor: pointer;
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;

    & > span {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 ${({ theme }) => theme.sizes.spaces.md}px;
      background-color: ${({ theme }) => theme.colors.variants.secondary.base};
      border-radius: 4px;
      color: ${({ theme }) => theme.colors.variants.secondary.text};
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      transition: 200ms background-color;

      &.focus {
        filter: brightness(103%);
      }
      &:hover {
        filter: brightness(106%);
      }
      &:active,
      &.button__state--active {
        filter: brightness(112%);
      }
    }

    & > input[type='file'] {
      position: absolute;
      opacity: 0;
      height: 0px;
      width: 0px;
    }
  }
`
