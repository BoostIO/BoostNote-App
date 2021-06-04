import React from 'react'
import { StyledLogo, StyledTopbar, StyledTopbarContainer } from './styled'

const SharePageTopbar = ({ children }: React.PropsWithChildren<{}>) => (
  <StyledTopbar>
    <StyledTopbarContainer>
      <StyledLogo>
        <a
          href='/'
          style={{ color: 'white', display: 'flex', alignItems: 'center' }}
        >
          <img src='/static/images/logo_with_text_white.svg' alt='Boost Note' />
        </a>
      </StyledLogo>
      {children}
    </StyledTopbarContainer>
  </StyledTopbar>
)

export default SharePageTopbar
