import React from 'react'
import styled from '../../../../../lib/styled'
import cc from 'classcat'
import { HelpModalType } from './HelpModal'

interface HelpModalNavButtonProps {
  label: string
  active: boolean
  tab: HelpModalType
  onClickHandler: (tab: HelpModalType) => void
  id: string
}

const HelpModalNavButton = ({
  label,
  tab,
  active,
  id,
  onClickHandler,
}: HelpModalNavButtonProps) => {
  return (
    <StyledButton
      onClick={() => onClickHandler(tab)}
      className={cc([active && 'active'])}
      id={id}
    >
      <div className='border' />
      <div className='label'>{label}</div>
    </StyledButton>
  )
}

export default HelpModalNavButton

const StyledButton = styled.button`
  display: flex;
  width: 100%;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  background-color: transparent;
  border: none;
  cursor: pointer;

  .border {
    width: 2px;
    height: 21px;
    background-color: transparent;
    border: none !important;
  }

  .label {
    flex: 1;
    margin-left: ${({ theme }) => theme.space.xsmall}px;
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-align: left;
  }

  &.active,
  &:hover,
  &:focus {
    .label {
      color: ${({ theme }) => theme.emphasizedTextColor};
    }
  }

  &.active {
    .border {
      background-color: ${({ theme }) => theme.primaryBackgroundColor};
    }
  }
`
