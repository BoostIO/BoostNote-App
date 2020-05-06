import React from 'react'
import Link from 'next/link'

const HomeLogoLink = () => {
  return (
    <Link href='/'>
      <a>
        <img src='/static/logo.svg' />
      </a>
    </Link>
  )
}

export default HomeLogoLink
