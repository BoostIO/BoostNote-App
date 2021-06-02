import React, { MouseEventHandler } from 'react'
import cc from 'classcat'
import Link, { HyperLinkProps } from '../../shared/components/atoms/Link'
import styled from '../../shared/lib/styled'

const InlineLink: React.FC<HyperLinkProps & { onClick: MouseEventHandler }> = ({
  className,
  children,
  ...props
}) => {
  return (
    <InlineLinkContainer>
      <Link className={cc(['storage__link_style', className])} {...props}>
        {children}
      </Link>
    </InlineLinkContainer>
  )
}

export default InlineLink

const InlineLinkContainer = styled.span`
  .storage__link_style {
    padding: 0 !important;
  }
`
