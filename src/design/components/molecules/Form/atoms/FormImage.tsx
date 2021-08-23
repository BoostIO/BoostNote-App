import React, { useCallback, useState } from 'react'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import Icon from '../../../atoms/Icon'
import { useTranslation } from 'react-i18next'
import { lngKeys } from '../../../../../cloud/lib/i18n/types'

export interface FormImageProps {
  onChange?: (file: File) => void
  defaultUrl?: string
  defaultIcon?: string
  label?: string
  iconSize?: 50 | 100
}

const FormImage: AppComponent<FormImageProps> = ({
  className,
  iconSize = 50,
  defaultIcon,
  defaultUrl,
  label: initialLabel,
  onChange,
}) => {
  const { t } = useTranslation()
  const [label, setLabel] = useState(
    initialLabel == null
      ? defaultUrl == null
        ? `${t(lngKeys.FormSelectImage)}...`
        : `${t(lngKeys.FormChangeImage)}...`
      : initialLabel
  )
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
        if (initialLabel == null) {
          setLabel(`${t(lngKeys.FormChangeImage)}...`)
        }
        if (onChange != null) {
          onChange(file)
        }
      }
    },
    [onChange, initialLabel, t]
  )

  return (
    <Container className={cc(['form__image', className])} iconSize={iconSize}>
      <div className='form__image__wrapper'>
        {fileUrl == null && defaultUrl == null && defaultIcon != null ? (
          <Icon
            path={defaultIcon}
            className='form__image--icon'
            size={iconSize}
          />
        ) : (
          <img
            className='form__image--img'
            src={fileUrl != null ? fileUrl : defaultUrl}
          />
        )}
      </div>
      <label className='form__image__label'>
        <span>{label}</span>
        <input accept='image/*' type='file' onChange={changeHandler} />
      </label>
    </Container>
  )
}

const Container = styled.div<{ iconSize: number }>`
  display: flex;
  align-items: center;

  .form__image__wrapper {
    width: ${({ iconSize }) => (iconSize as number) + 40}px;
    height: ${({ iconSize }) => (iconSize as number) + 40}px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .form__image--img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    border-radius: 50%;
  }

  .form__image__label {
    position: relative;
    margin-left: ${({ theme }) => theme.sizes.spaces.md}px;

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

export default FormImage
