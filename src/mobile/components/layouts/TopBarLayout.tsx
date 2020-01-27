import React, { CSSProperties } from 'react'
import styled from '../../../lib/styled'
import { borderBottom } from '../../../lib/styled/styleFunctions'

const TopBarLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1d1f21;
`

const TopBar = styled.div`
  height: 44px;
  display: flex;
  align-items: center;
  ${borderBottom}
`

const TopBarTitle = styled.div`
  text-align: center;
`

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`

interface TopBarLayoutProps {
  title?: React.ReactNode
  children?: React.ReactChild
  style?: CSSProperties
  leftControl?: React.ReactNode
}

const TopBarLayout = ({
  title,
  children,
  style,
  leftControl
}: TopBarLayoutProps) => (
  <TopBarLayoutContainer style={style}>
    <TopBar>
      {leftControl}
      <TopBarTitle>{title}</TopBarTitle>
    </TopBar>
    <ContentContainer>{children}</ContentContainer>
  </TopBarLayoutContainer>
)

export default TopBarLayout
