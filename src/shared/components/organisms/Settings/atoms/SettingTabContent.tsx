import React from 'react'
import styled from '../../../../lib/styled'

interface SettingTabContentProps {
  header?: React.ReactNode
  body: React.ReactNode
}

const SettingTabContent = ({ header, body }: SettingTabContentProps) => (
  <Container className='tab-content'>
    <div className='tab-content__scrollable'>
      <div className='tab-content__container'>
        <div className='tab-content__header'>{header}</div>
        <div className='tab-content__body'>{body}</div>
      </div>
    </div>
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

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
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    font-weight: 500;
  }

  .tab-content__body {
    section {
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    }
  }
`

export default SettingTabContent
