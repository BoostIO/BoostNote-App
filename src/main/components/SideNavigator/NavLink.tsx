import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styled from 'styled-components'

type NavLinkProps = LinkProps & { active: boolean }

const NavLink = styled(({ active, ...props }: NavLinkProps) => (
  <Link {...props} />
))`
  ${props =>
    props.active &&
    `color: white;
    background-color: blue;`}
`

export default NavLink
