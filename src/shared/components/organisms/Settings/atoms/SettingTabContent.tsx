import React from 'react'
import styled from '../../../../lib/styled'

interface SettingTabContentProps {
  title?: React.ReactNode
  description?: React.ReactNode
  body: React.ReactNode
  footer?: React.ReactNode
}

const SettingTabContent = ({
  title,
  description,
  body,
  footer,
}: SettingTabContentProps) => (
  <Container className='tab-content'>
    <div className='tab-content__scrollable'>
      <div className='tab-content__container'>
        <div className='tab-content__header'>
          <h1 className='tab-content__header__title'>{title}</h1>
          <p className='tab-content__header__description'>{description}</p>
        </div>
        <div className='tab-content__body'>{body}</div>
        <div className='tab-content__footer'>{footer}</div>
      </div>
    </div>
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-top: ${({ theme }) => theme.sizes.spaces.xl}px;

  .tab-content__scrollable {
    flex: 1 1 auto;
    width: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.xl}px
      ${({ theme }) => theme.sizes.spaces.md}px;
    overflow: hidden auto;
  }

  .tab-content__container {
    max-width: 700px;
    margin: 0 auto;
  }

  .tab-content__header {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.l}px;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.l}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .tab-content__header__title {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    font-weight: normal;
  }

  .tab-content__header__description {
    margin-bottom: 0;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  .tab-content__body,
  .tab-content__footer {
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

  .tab-content__body {
    section {
      margin: ${({ theme }) => theme.sizes.spaces.md}px 0;
    }
  }
`

export default SettingTabContent
