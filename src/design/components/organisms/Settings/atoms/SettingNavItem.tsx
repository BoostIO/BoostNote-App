import React, { MouseEventHandler, useState } from 'react'
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

type SettingsNavSubMenuProps = React.PropsWithChildren<{
  className?: string
  label: string
}>

export const SettingsNavSubMenu = ({
  children,
  className,
  label,
}: SettingsNavSubMenuProps) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <StyledSettingNavSubMenu
      className={cc([className, isOpen && 'setting__nav__dropdown--active'])}
    >
      <SettingNavButtonItem
        className='setting__nav__dropdown__button'
        label={label}
        onClick={() => setOpen((prev) => !prev)}
      />
      <div className='setting__nav__dropdown__content'>
        {isOpen && children}
      </div>
    </StyledSettingNavSubMenu>
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

const StyledSettingNavSubMenu = styled.div`
  & .setting__nav__dropdown__content {
    padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .setting__nav__dropdown__button {
    position: relative;
    &:after {
      position: absolute;
      top: 50%;
      left: ${({ theme }) => theme.sizes.spaces.md / 2}px;
      transform: translate3d(-50%, -50%, 0) rotate(-90deg);
      content: '';
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 3px 0 3px;
      border-color: ${({ theme }) => theme.colors.text.primary} transparent
        transparent transparent;
    }
  }

  &.setting__nav__dropdown--active {
    & .setting__nav__dropdown__button:after {
      transform: translate3d(-50%, -50%, 0);
    }
  }
`

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
