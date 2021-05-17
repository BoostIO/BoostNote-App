import React, { useState, useMemo } from 'react'
import cc from 'classcat'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
  SideNavIconStyle,
} from './styled'
import styled from '../../../../lib/styled'
import IconMdi from '../../../atoms/IconMdi'
import CloudLink from '../../../atoms/Link/CloudLink'
import { Url } from '../../../../lib/router'

type SideNavNextLink = {
  href: Url
  onClick?: undefined
}

type SideNavButton = {
  href?: undefined
  onClick: () => void
}

type SideNavigatorType = SideNavButton | SideNavNextLink

type SideNavigatorItemProps = {
  id?: string
  label: string | React.ReactNode
  depth?: number
  active?: boolean
  hasChildren?: boolean
  iconNode?: string | React.ReactNode
  iconSize?: number
  controls?: React.ReactNode
} & SideNavigatorType

const SideNavigatorItem = ({
  id,
  label,
  depth = 0,
  hasChildren,
  active,
  controls,
  href,
  iconNode,
  iconSize = 16,
  onClick,
}: SideNavigatorItemProps) => {
  const [elementId] = useState(() =>
    id != null ? id : btoa(Math.random().toString()).slice(0, 8)
  )
  const [focused, setFocused] = useState(false)

  const onBlurHandler = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  const labelContent = useMemo(() => {
    if (href != null) {
      return (
        <CloudLink
          className='itemLink'
          onFocus={() => setFocused(true)}
          id={`tree-${elementId}`}
          draggable={false}
          href={href}
        >
          <SideNavLabelStyle>{label}</SideNavLabelStyle>
        </CloudLink>
      )
    }

    return (
      <StyledButton
        className='itemLink'
        onFocus={() => setFocused(true)}
        onClick={onClick}
        draggable={false}
        id={`tree-${elementId}`}
      >
        <SideNavLabelStyle>{label}</SideNavLabelStyle>
      </StyledButton>
    )
  }, [label, href, elementId, onClick])

  return (
    <div onBlur={onBlurHandler}>
      <SideNavItemStyle
        className={cc([`d-${depth}`, active && 'active', focused && 'focused'])}
      >
        <div className={cc(['sideNavWrapper', !hasChildren && 'empty'])}>
          <SideNavClickableButtonStyle
            style={{ paddingLeft: `${12 * (depth - 1) + 26}px` }}
          >
            {typeof iconNode === 'string' ? (
              <SideNavIconStyle
                className={cc(['emoji-icon'])}
                style={{ width: iconSize + 4 }}
              >
                <IconMdi path={iconNode} size={iconSize} />
              </SideNavIconStyle>
            ) : (
              iconNode
            )}
            {labelContent}
          </SideNavClickableButtonStyle>
        </div>
        {controls != null && (
          <SideNavControlStyle className='controls'>
            {controls}
          </SideNavControlStyle>
        )}
      </SideNavItemStyle>
    </div>
  )
}

const StyledButton = styled.button`
  padding: 0;
  margin: 0;
  background: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
`

export default SideNavigatorItem
