import { mdiArrowLeft, mdiArrowRight } from '@mdi/js'
import React from 'react'
import styled from '../../../lib/v2/styled'
import { AppComponent, ControlButtonProps } from '../../../lib/v2/types'
import Button from '../atoms/Button'

export interface TopbarProps {
  controls?: ControlButtonProps[]
  breadcrumbs?: BreadCrumbs[]
  navigation?: {
    goBack?: () => void
    goForward?: () => void
  }
}

interface BreadCrumbs {
  children: BreadCrumbs[]
  controls?: { label: string; onClick: () => void }
  current: boolean
  defaultIcon?: string
  emoji?: string
  label: string
  navigateTo?: () => void
}

const Topbar: AppComponent<TopbarProps> = ({
  children,
  controls = [],
  navigation,
}) => (
  <Container className='topbar'>
    <div className='topbar__content'>
      <div className='topbar__navigation'>
        <Button
          variant='icon'
          iconSize={22}
          iconPath={mdiArrowLeft}
          disabled={navigation?.goBack == null}
          onClick={navigation?.goBack}
        />
        <Button
          variant='icon'
          iconSize={22}
          size={'sm'}
          iconPath={mdiArrowRight}
          disabled={navigation?.goForward == null}
          onClick={navigation?.goForward}
        />
      </div>
      <div className='topbar__breadcrumbs'></div>
      {children}
    </div>
    {controls.length > 0 && (
      <div className='topbar__controls'>
        {controls.map((control, i) => (
          <Button
            key={`topbar__control__${i}`}
            variant='icon'
            iconSize={22}
            size={'sm'}
            iconPath={control.icon}
            disabled={control.disabled}
            onClick={control.onClick}
          />
        ))}
      </div>
    )}
  </Container>
)

export default Topbar

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 44px;
  background: ${({ theme }) => theme.colors.background.main};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  flex: 0 0 auto;
  -webkit-app-region: drag;
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  padding-right: ${({ theme }) => theme.sizes.spaces.l}px;

  .topbar__content {
    flex: 1 1 0;
  }

  .topbar__controls,
  .topbar__navigation {
    flex: 0 0 auto;
  }

  .topbar__separator {
    height: 24px;
    width: 24px;
    margin: 0 -5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: 14px;
    user-select: none;
    flex-grow: 0;
    flex-basis: auto;
    flex-shrink: 0;
  }

  .topbar__breadcrumbs {
    display: flex;
    flex: 1 1 10px;
    height: 100%;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.subtle};
    overflow-x: hidden;

    .bread-crumb-link {
      display: flex;
      align-items: center;
      padding: 2px 4px;
      border-radius: 3px;
      white-space: nowrap;
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text.main};
      cursor: pointer;
      text-decoration: none !important;

      .label {
        margin-left: 4px;
      }
      .hoverIcon {
        margin-left: 4px;
        opacity: 0;
      }

      &:hover,
      &:focus {
        background-color: ${({ theme }) =>
          theme.colors.background.gradients.first};
        .hoverIcon {
          opacity: 1;
        }
      }
    }
  }
`
