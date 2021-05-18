import React, { MouseEventHandler } from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import { StyledProps } from '../../../../lib/styled/styleFunctions'
import Icon from '../../../atoms/Icon'
import { mdiOpenInNew } from '@mdi/js'

interface SideNavItemProps {
  label: string
  id?: string
  className?: string
}

type SettingNavButtonItemProps = SideNavItemProps & {
  active?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

const SettingNavButtonItem = ({
  label,
  active,
  id,
  className,
  onClick,
}: SettingNavButtonItemProps) => {
  return (
    <Button
      className={cc([active && 'setting__nav__item--active', className])}
      id={id}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

type SettingNavLinkItemProps = SideNavItemProps & {
  href: string
}

export const SettingNavLinkItem = ({
  label,
  id,
  href,
}: SettingNavLinkItemProps) => {
  return (
    <Link id={id} rel='noopener noreferrer' target='_blank' href={href}>
      {label} <Icon path={mdiOpenInNew} size={16} />
    </Link>
  )
}

const settingNavItemStyle = ({ theme }: StyledProps) => `
display: flex;
align-items: center;
width: 100%;
margin-bottom: ${theme.sizes.spaces.xsm}px;
padding: ${theme.sizes.spaces.xsm}px
  ${theme.sizes.spaces.md}px;
background-color: transparent;
border: none;
border-radius: 2px;
color: ${theme.colors.text.primary};
cursor: pointer;
font-size: ${theme.sizes.fonts.df}px;
text-align: left;

&:hover,
&:focus {
  background-color: ${theme.colors.background.tertiary};
}

&.setting__nav__item--active {
  background-color: ${theme.colors.background.quaternary};
}`

const Button = styled.button`
  ${settingNavItemStyle}
`

const Link = styled.a`
  ${settingNavItemStyle}
  text-decoration: none;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`

export default SettingNavButtonItem
