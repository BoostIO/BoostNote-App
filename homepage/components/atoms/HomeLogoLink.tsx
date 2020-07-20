import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const HomeLogoImg = styled.a`
  display: block;

  img {
    vertical-align: middle;
  }
`

const HomeLogoLink = () => {
  return (
    <Link href='/'>
      <HomeLogoImg>
        <img alt='Boost Note Logo' src='/static/logo.svg' />
      </HomeLogoImg>
    </Link>
  )
}

export default HomeLogoLink
