import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styled from '../../../styled'

type NavLinkProps = LinkProps & { active: boolean }

const NavLink = styled(({ active, ...props }: NavLinkProps) => (
  <Link {...props} />
))`
  width: ${props =>
    props.active &&
    `color: white;
    background-color: #5B99F8;`};
`

export default NavLink
