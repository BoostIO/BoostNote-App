import React from 'react'
import styled from '../../../lib/styled'

interface SettingsProps {
  sidebar: React.ReactNode
  content: React.ReactNode
}

const Settings = ({ sidebar, content }: SettingsProps) => (
  <Container className='settings__layout'>
    <div className='settings__wrapper'>
      <div className='settings__sidebar'>{sidebar}</div>
      <div className='settings__divider'></div>
      <div className='settings__content'>{content}</div>
    </div>
  </Container>
)

const zIndexModals = 8000

const Container = styled.div`
  z-index: ${zIndexModals};
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 40px;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background.primary};
  overflow: hidden;

  .settings__wrapper {
    z-index: ${zIndexModals + 2};
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
  }

  .settings__divider {
    width: 1px;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.border.main};
  }

  .settings__content {
    flex: 1 1 100%;
    min-width: 0;
    overflow: auto;
  }
`

export default Settings
