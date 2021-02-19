import React from 'react'
import styled from '../../../lib/styled'
import Icon from '../../atoms/IconMdi'
import { mdiOpenInNew } from '@mdi/js'

interface TabLinkProps {
  label: string
  href: string
  id?: string
  prependIcon: string
}

const TabLink = ({ id, label, href, prependIcon }: TabLinkProps) => {
  return (
    <StyledLink href={href} target='_blank' id={id}>
      <span className='icon'>
        <Icon path={prependIcon} size={20} />
      </span>
      <div className='label'>{label}</div>
      <Icon path={mdiOpenInNew} />
    </StyledLink>
  )
}

export default TabLink

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.subtleTextColor};
  cursor: pointer;
  text-decoration: none !important;

  .icon {
    margin-left: ${({ theme }) => theme.space.small}px;
    margin-right: ${({ theme }) => theme.space.xsmall}px;

    svg {
      vertical-align: sub;
    }
  }

  .label {
    flex: 1;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-align: left;
  }

  &.active,
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.emphasizedTextColor};
  }

  &.active {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
  }

  &:focus {
    outline: none;
  }
`
