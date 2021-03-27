import React from 'react'
import styled from '../../../lib/v2/styled'
import cc from 'classcat'

interface HyperLinkProps {
  href: string
  className?: string
}

const HyperLink: React.FC<HyperLinkProps> = ({ href, className, children }) => (
  <Container
    className={cc(['link', className])}
    href={href}
    rel='noopener noreferrer'
    target='_blank'
  >
    {children}
  </Container>
)

const Container = styled.a`
  display: inline;
  transition: 200ms color;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text.link}
  padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    opacity: 0.8;
  }
`

export default HyperLink
