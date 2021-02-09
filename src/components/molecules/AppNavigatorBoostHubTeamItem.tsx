import React, { useCallback, useState, useRef } from 'react'
import { border, flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { useRouter } from '../../lib/router'
import Icon from '../atoms/Icon'
import { mdiCloudOutline } from '@mdi/js'
import { osName } from '../../lib/platform'

const Container = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  margin-bottom: 4px;
  &:first-child {
    margin-top: 10px;
  }
  ${flexCenter}
  border-radius: 14px;
  border-width: 3px;
  border-style: solid;
  border-color: transparent;
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.borderColor};
  }
  &.active {
    border-color: ${({ theme }) => theme.textColor};
  }

  & > .teamIcon {
    height: 20px;
    width: 20px;
    border-radius: 10px;
    background-color: ${({ theme }) => theme.navBackgroundColor};
    ${border}
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: -5px;
    right: -5px;
    z-index: 1;
  }

  & > .tooltip {
    display: flex;
    align-items: center;
    position: fixed;
    padding: 0 10px;
    border-radius: 4px;
    height: 36px;
    z-index: 1000;
    color: ${({ theme }) => theme.tooltipTextColor};
    background-color: ${({ theme }) => theme.tooltipBackgroundColor};
    user-select: none;

    .tooltip__icon {
      margin-right: 5px;
    }
    .tooltip__name {
      margin-right: 10px;
    }
    .tooltip__key {
    }
  }
`

const MainButton = styled.button`
  height: 36px;
  width: 36px;
  border-radius: 8px;
  ${border}
  cursor: pointer;
  ${flexCenter}
  font-size: 18px;
  border: none;
  background-color: ${({ theme }) => theme.teamSwitcherBackgroundColor};
  border: 1px solid ${({ theme }) => theme.teamSwitcherBorderColor};
  color: ${({ theme }) => theme.teamSwitcherTextColor};
  font-size: 13px;
  & > .icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  &:hover,
  &:active,
  &.active {
    cursor: pointer;
    background-color: ${({ theme }) => theme.teamSwitcherHoverBackgroundColor};
    color: ${({ theme }) => theme.teamSwitcherHoverTextColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

interface AppNavigatorBoostHubTeamItemProps {
  domain: string
  name: string
  active: boolean
  iconUrl?: string
  index: number
}

interface Position {
  top: number
  left: number
}

const AppNavigatorBoostHubTeamItem = ({
  active,
  domain,
  name,
  iconUrl,
  index,
}: AppNavigatorBoostHubTeamItemProps) => {
  const { push } = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState<Position | null>(null)

  const showTooltip = useCallback(() => {
    if (buttonRef.current == null) {
      return
    }
    const rect = buttonRef.current.getBoundingClientRect()
    setTooltipPosition({
      top: rect.top,
      left: rect.left + rect.width + 10,
    })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltipPosition(null)
  }, [])

  const navigateToTeam = useCallback(() => {
    push(`/app/boosthub/teams/${domain}`)
  }, [push, domain])

  return (
    <Container className={active ? 'active' : ''}>
      <MainButton
        ref={buttonRef}
        className={active ? 'active' : ''}
        onClick={navigateToTeam}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {iconUrl == null ? (
          name.slice(0, 1)
        ) : (
          <img className='icon' src={iconUrl} />
        )}
      </MainButton>

      {tooltipPosition != null && (
        <div className='tooltip' style={tooltipPosition}>
          <Icon className='tooltip__icon' path={mdiCloudOutline} />
          <span className='tooltip__name'>{name}</span>
          <span className='tooltip__key'>
            {osName === 'macos' ? '⌘' : 'Ctrl'} {index + 1}
          </span>
        </div>
      )}
    </Container>
  )
}

export default AppNavigatorBoostHubTeamItem
