import React from 'react'
import Icon, { IconSize } from '../../../../shared/components/atoms/Icon'
import styled from '../../../../shared/lib/styled'
import { ExternalLink } from '../../../../shared/components/atoms/Link'
import WithTooltip from '../../../../shared/components/atoms/WithTooltip'

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
