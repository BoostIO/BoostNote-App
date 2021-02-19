import React from 'react'
import Flexbox from '../atoms/Flexbox'
import IconMdi from '../atoms/IconMdi'
import styled from '../../lib/styled'
import { Spinner } from '../atoms/Spinner'
import Tooltip from '../atoms/Tooltip'

interface RightLayoutHeaderButtonsProps {
  buttons: {
    iconPath: string
    sending?: boolean
    disabled?: boolean
    onClick: () => void
    tooltip?: string
  }[]
}

const RightLayoutHeaderButtons = ({
  buttons,
}: RightLayoutHeaderButtonsProps) => (
  <Flexbox flex='0 0 auto'>
    {buttons.map(({ tooltip, disabled, onClick, sending, iconPath }, i) => {
      if (tooltip != null) {
        return (
          <Tooltip tooltip={tooltip} key={i}>
            <StyledHeaderButton disabled={disabled} onClick={onClick}>
              {sending ? (
                <Spinner
                  className='relative'
                  style={{ position: 'inherit' }}
                  size={24}
                />
              ) : (
                <IconMdi path={iconPath} size={24} />
              )}
            </StyledHeaderButton>
          </Tooltip>
        )
      }

      return (
        <StyledHeaderButton disabled={disabled} onClick={onClick} key={i}>
          {sending ? (
            <Spinner
              className='relative'
              style={{ position: 'inherit' }}
              size={24}
            />
          ) : (
            <IconMdi path={iconPath} size={24} />
          )}
        </StyledHeaderButton>
      )
    })}
  </Flexbox>
)

const StyledHeaderButton = styled.button`
  outline: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.emphasizedTextColor};

  svg {
    color: ${({ theme }) => theme.emphasizedTextColor} !important;
  }

  .spinner-wrapper {
    vertical-align: baseline;
  }
  &:hover,
  &:hover svg {
    color: ${({ theme }) => theme.subtleTextColor} !important;
  }
  &:disabled {
    opacity: 0.8;
    color: ${({ theme }) => theme.subtleTextColor} !important;
  }

  &:disabled svg {
    color: ${({ theme }) => theme.subtleTextColor} !important;
  }
`

export default RightLayoutHeaderButtons
