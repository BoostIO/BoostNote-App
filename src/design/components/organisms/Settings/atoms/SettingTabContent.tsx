import React from 'react'
import { useTranslation } from 'react-i18next'
import { lngKeys } from '../../../../../cloud/lib/i18n/types'
import styled from '../../../../lib/styled'
import Button, { ButtonProps } from '../../../atoms/Button'

interface SettingTabContentProps {
  title?: React.ReactNode
  description?: React.ReactNode
  body: React.ReactNode
  footer?: React.ReactNode
  backLink?: ButtonProps
  width?: number
}

const SettingTabContent = ({
  title,
  description,
  body,
  footer,
  backLink,
  width: maxWidth,
}: SettingTabContentProps) => {
  const { t } = useTranslation()
  return (
    <Container className='setting__tab__content'>
      <div className='setting__tab__content__scrollable'>
        <div className='setting__tab__content__container' style={{ maxWidth }}>
          {backLink != null && (
            <Button {...backLink} className='settings__tab__content__backlink'>
              {t(lngKeys.GeneralBack)}
            </Button>
          )}
          <div className='setting__tab__content__header'>
            <h1 className='setting__tab__content__header__title'>{title}</h1>
            <p className='setting__tab__content__header__description'>
              {description}
            </p>
          </div>
          <div className='setting__tab__content__body'>{body}</div>
          {footer != null && (
            <div className='setting__tab__content__footer'>{footer}</div>
          )}
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: block;
  width: 100%;
  padding-top: ${({ theme }) => theme.sizes.spaces.xl}px;
  position: relative;

  .settings__tab__content__backlink {
    position: absolute;
    top: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .setting__tab__content__footer {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px;
    padding-top: ${({ theme }) => theme.sizes.spaces.l}px;
    border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .setting__tab__content__scrollable {
    width: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.xl}px
      ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .setting__tab__content__container {
    max-width: 700px;
    margin: 0 auto;
  }

  .setting__tab__content__header {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.l}px;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.l}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .setting__tab__content__header__title {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    font-weight: normal;
  }

  .setting__tab__content__header__description {
    margin-bottom: 0;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  .setting__tab__content__body,
  .setting__tab__content__footer {
    h2 {
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
      font-weight: normal;
    }

    .text--subtle {
      color: ${({ theme }) => theme.colors.text.subtle};
    }

    .text--small {
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    }
  }

  .setting__tab__content__body {
    section {
      margin: ${({ theme }) => theme.sizes.spaces.md}px 0;
    }
  }

  img {
    max-width: 100%;
  }
`

export default SettingTabContent
