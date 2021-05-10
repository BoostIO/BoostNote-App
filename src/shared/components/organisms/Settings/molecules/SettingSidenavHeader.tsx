import React from 'react'
import styled from '../../../../lib/styled'
import Icon, { IconSize } from '../../../atoms/Icon'

interface SettingSidenavHeaderProps {
  path: string
  text: string
  size: IconSize
}

const SettingSidenavHeader = ({
  path,
  text,
  size,
}: SettingSidenavHeaderProps) => (
  <Container className='setting__sidenav__header'>
    <Icon path={path} size={size} />
    {text}
  </Container>
)

const Container = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.sizes.spaces.md}px 0
    ${({ theme }) => theme.sizes.spaces.sm}px;
  color: ${({ theme }) => theme.colors.text.subtle};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  svg {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default SettingSidenavHeader
