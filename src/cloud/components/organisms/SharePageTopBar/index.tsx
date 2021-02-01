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
          <img
            src='/static/images/apple-icon-180x180.png'
            alt='Boost Note'
            style={{ marginRight: 10 }}
          />
          <span style={{ fontSize: '1.5em' }}>Boost Note</span>
        </a>
      </StyledLogo>
      {children}
    </StyledTopbarContainer>
  </StyledTopbar>
)

export default SharePageTopbar
