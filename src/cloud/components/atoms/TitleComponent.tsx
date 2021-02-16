import React from 'react'
import styled from '../../lib/styled'

const TitleComponent = () => (
  <StyledTitle>
    <a href='/'>
      <img
        src='/app/static/images/logo_boostnote_forteams.svg'
        alt='Boost Note for Teams'
      />
    </a>
  </StyledTitle>
)

export default TitleComponent

const StyledTitle = styled.div`
  padding-top: ${({ theme }) => theme.space.small}px;

  img {
    height: 50px;
    vertical-align: middle;
  }
`
