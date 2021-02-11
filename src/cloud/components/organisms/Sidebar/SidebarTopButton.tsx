import React, { useCallback, useState } from 'react'
import cc from 'classcat'
import styled from '../../../lib/styled'
import Spinner from '../../atoms/CustomSpinner'
import IconMdi from '../../atoms/IconMdi'
import { shortcuts } from '../../../lib/shortcuts'
import {
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEvent,
  preventKeyboardEventPropagation,
} from '../../../lib/keyboard'

interface SidebarTopButtonProps {
  variant: 'blue' | 'transparent' | 'emphasized'
  justify?: 'left' | 'space-between'
  prependIcon: string
  onboardingId?: 'sidebarCreateDocButton'
  active?: boolean
  disabled?: boolean
  sending?: boolean
  label: string | React.ReactNode
  className?: string
  addedNodes?: React.ReactNode
  id: string
  style?: React.CSSProperties
  onClick?: (ev: React.MouseEvent) => void
  tabIndex?: number
  folding?: { fold: () => void; unfold: () => void }
}

const SidebarTopButton = ({
  variant,
  prependIcon,
  active,
  label,
  className,
  sending,
  disabled,
  addedNodes,
  justify,
  id,
  style,
  onClick,
  folding,
  tabIndex,
}: SidebarTopButtonProps) => {
  const [focused, setFocused] = useState<boolean>(false)

  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused || folding == null) {
        return
      }
      if (isSingleKeyEvent(event, shortcuts.unfoldFolder)) {
        preventKeyboardEventPropagation(event)
        folding.unfold()
        return
      }
      if (isSingleKeyEvent(event, shortcuts.foldFolder)) {
        preventKeyboardEventPropagation(event)
        folding.fold()
        return
      }
    },
    [focused, folding]
  )
  useCapturingGlobalKeyDownHandler(keyDownHandler)

  return (
    <StyledSidebarTopButton
      className={cc([`btn-${variant}`, className, active && 'active'])}
      style={style}
      onClick={onClick}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      disabled={disabled || sending}
      id={id}
      tabIndex={tabIndex}
    >
      {sending ? (
        <Spinner className='spinner' />
      ) : (
        <>
          <div className='icon'>
            <IconMdi path={prependIcon} size={20} />
          </div>
          <div className={cc(['flex', justify])}>
            <div className='strict'>{label}</div>
            {addedNodes}
          </div>
        </>
      )}
    </StyledSidebarTopButton>
  )
}

export default SidebarTopButton

const StyledSidebarTopButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  border-radius: 3px;
  min-width: 0;
  width: 100%;
  height: 28px;
  line-height: 28px;
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.space.xxsmall}px;
  .spinner {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }

  .hovered {
    display: none;
    transition: 0.2s;
  }

  &:not(:disabled):hover .hovered {
    display: block;
  }

  .strict {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .icon {
    width: 28px;
    text-align: center;
    flex: 0 0 auto;
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flex {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    overflow: hidden;
    &.space-between {
      justify-content: space-between;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  &.btn-emphasized {
    color: ${({ theme }) => theme.baseTextColor};
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
    &:not(:disabled):hover,
    &:not(:disabled).active,
    &:not(:disabled):focus {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }
    .spinner {
      border-color: ${({ theme }) => theme.baseTextColor};
      border-right-color: transparent;
    }
  }

  &.btn-transparent {
    color: ${({ theme }) => theme.baseTextColor};
    background: none;
    &:not(:disabled):hover {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }
    &:not(:disabled).active,
    &:not(:disabled):focus {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }
    .spinner {
      border-color: ${({ theme }) => theme.baseTextColor};
      border-right-color: transparent;
    }
  }

  &.btn-blue {
    color: #fff;
    background-color: ${({ theme }) => theme.blueBackgroundColor};
    &:not(:disabled):hover,
    &:not(:disabled).active,
    &:not(:disabled):focus {
      background-color: ${({ theme }) => theme.darkBlueBackgroundColor};
    }
    .spinner {
      border-color: #fff;
      border-right-color: transparent;
    }
  }
`
