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
  position: relative;
  ${borderBottom}
  display: flex;
  align-items: center;
  justify-content: center;
`

const TopBarLeftControl = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 44px;
  display: flex;
`
const TopBarRightControl = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 44px;
  display: flex;
`

const TopBarTitle = styled.div`
  height: 44px;
  line-height: 44px;
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
  rightControl?: React.ReactNode
}

const TopBarLayout = ({
  title,
  children,
  style,
  leftControl,
  rightControl
}: TopBarLayoutProps) => (
  <TopBarLayoutContainer style={style}>
    <TopBar>
      <TopBarLeftControl>{leftControl}</TopBarLeftControl>
      <TopBarTitle>{title}</TopBarTitle>
      <TopBarRightControl>{rightControl}</TopBarRightControl>
    </TopBar>
    <ContentContainer>{children}</ContentContainer>
  </TopBarLayoutContainer>
)

export default TopBarLayout
