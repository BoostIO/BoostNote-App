import React from 'react'
import styled from '../../design/lib/styled'

const TitleComponent = () => (
  <StyledTitle>
    <a href='/'>
      <img src='/static/images/logo_with_text_white.svg' alt='Boost Note' />
    </a>
  </StyledTitle>
)

export default TitleComponent

const StyledTitle = styled.div`
  padding-top: ${({ theme }) => theme.sizes.spaces.sm}px;

  img {
    height: 50px;
    vertical-align: middle;
  }
`
