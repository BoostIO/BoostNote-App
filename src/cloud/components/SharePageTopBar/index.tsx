import React from 'react'
import styled from '../../../design/lib/styled'

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

const StyledLogo = styled.div`
  margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  img {
    height: 30px;
    vertical-align: middle;
  }
`

const StyledTopbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 40px;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;

  &:not(.alignedLeft) {
    right: 0;
  }
`

const StyledTopbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 75vw;
`

export default SharePageTopbar
