import React from 'react'
import styled from '../../lib/styled'
import IconMdi from './IconMdi'
import { mdiLinkVariant } from '@mdi/js'

interface LinkableHeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  > {
  id: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const LinkableHeader = ({
  id,
  as = 'h1',
  children,
  ...rest
}: LinkableHeaderProps) => {
  return (
    <StyledLinkableHeader as={as} id={id} {...rest}>
      <StyledHeaderLink href={`#${id}`} className='link-icon'>
        <IconMdi path={mdiLinkVariant} />
      </StyledHeaderLink>
      {children}
    </StyledLinkableHeader>
  )
}

export default LinkableHeader

const StyledLinkableHeader = styled.h1`
  position: relative;

  .link-icon {
    display: none;
  }

  &:hover .link-icon {
    display: block;
  }
`

const StyledHeaderLink = styled.a`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: -30px;
  width: 30px;
  height: 30px;
  z-index: 100;
  color: ${({ theme }) => theme.subtleTextColor} !important;
  text-align: center;

  > svg {
    margin-top: 4px;
  }
`
