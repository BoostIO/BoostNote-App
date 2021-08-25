import React from 'react'
import Icon, { IconSize } from '../../design/components/atoms/Icon'
import { ExternalLink } from '../../design/components/atoms/Link'
import WithTooltip from '../../design/components/atoms/WithTooltip'
import styled from '../../design/lib/styled'

interface SettingSidenavHeaderProps {
  iconPath: string
  size: IconSize
  tooltipText?: string
  linkHref?: string
}

const HelpLink = ({
  iconPath,
  tooltipText,
  size,
  linkHref,
}: SettingSidenavHeaderProps) => (
  <WithTooltip tooltip={tooltipText} side={'right'}>
    <Container className='help__header'>
      {linkHref ? (
        <ExternalLink href={linkHref}>
          <Icon path={iconPath} size={size} />
        </ExternalLink>
      ) : (
        <Icon path={iconPath} size={size} />
      )}
    </Container>
  </WithTooltip>
)

const Container = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.subtle};
  svg {
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default HelpLink
