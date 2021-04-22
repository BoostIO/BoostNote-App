import React from 'react'
import styled from '../../lib/styled'
import GlobalStyle from '../atoms/GlobalStyle'

interface ApplicationLayoutProps {
  sidebar: React.ReactNode
  pageBody: React.ReactNode
}

const ApplicationLayout = ({ sidebar, pageBody }: ApplicationLayoutProps) => (
  <Container className='application__layout'>
    <div className='application__wrapper'>
      <div className='application__sidebar'>{sidebar}</div>
      <div className='application__content'>{pageBody}</div>
    </div>
    <GlobalStyle />
  </Container>
)

const Container = styled.div`
  display: block;
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.primary};

  .application__wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    overflow: initial;
    align-items: flex-start;
    flex-wrap: nowrap;
  }

  .application__sidebar {
    flex: 0 0 auto;
    min-width: 0;
  }

  .application__content {
    flex: 1 1 100%;
    min-width: 0;
  }
`

export default ApplicationLayout
