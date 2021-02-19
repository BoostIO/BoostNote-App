import React, { useState, MouseEvent, useCallback } from 'react'
import cc from 'classcat'
import { ParsedUrlQuery } from 'querystring'
import styled from '../../../lib/styled'
import {
  primaryButtonStyle,
  baseButtonStyle,
} from '../../../lib/styled/styleFunctions'
import { stringifyUrl } from '../../../lib/utils/string'
import { useRouter } from '../../../lib/router'

export interface UrlLike {
  pathname: string
  query?: ParsedUrlQuery
}

type CustomLinkProps = {
  className?: string
  style?: React.CSSProperties
  hoverStyle?: React.CSSProperties
  children: React.ReactNode
  active?: boolean
  block?: boolean
  variant?: 'link' | 'primary'
  disabled?: boolean
  external?: boolean
  decoration?: boolean
  isReactLink?: boolean
  href: string | UrlLike
  id?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

const CustomLink = (props: CustomLinkProps) => {
  const [hovered, toggleHover] = useState(false)
  const { push } = useRouter()

  const {
    external = false,
    className,
    href,
    disabled,
    active,
    children,
    block,
    variant = 'link',
    decoration = false,
    style,
    id,
    onClick,
  } = props

  const navigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      push(href)
    },
    [push, href]
  )

  return (
    <StyledInternalLink
      href={stringifyUrl(href)}
      target={external ? '_blank' : undefined}
      className={cc([
        variant != 'link' && 'btn',
        decoration && 'decorate',
        `type-${variant}`,
        disabled && 'disabled',
        (active || hovered) && 'active',
        block && 'd-block',
        className,
      ])}
      style={style}
      onMouseEnter={() => toggleHover}
      onMouseLeave={() => toggleHover}
      id={id}
      onClick={onClick != null ? onClick : external ? undefined : navigate}
    >
      {children}
    </StyledInternalLink>
  )
}

export default CustomLink

const StyledInternalLink = styled.a`
  &.type-link {
    text-decoration: none;
    cursor: pointer;
  }

  &.btn {
    margin: ${({ theme }) => theme.space.xsmall}px 0;
    padding: 0 ${({ theme }) => theme.space.default}px;
    border-radius: 2px;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    line-height: 40px;
    text-decoration: none;
  }

  &.type-primary {
    ${baseButtonStyle}
    ${primaryButtonStyle}
  }

  &.d-block {
    display: inline-block;
  }
`
