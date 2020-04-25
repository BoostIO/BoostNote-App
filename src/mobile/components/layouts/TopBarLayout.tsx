import React, { CSSProperties } from 'react'
import styled from '../../../lib/styled'
import {
  borderBottom,
  textOverflow,
  flexCenter,
} from '../../../lib/styled/styleFunctions'
import Icon from '../../../components/atoms/Icon'

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
  ${flexCenter}
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
  flex: 1;
  padding: 0 88px;
  overflow: hidden;
  ${flexCenter}
`

const TopBarTitleIcon = styled.div`
  padding-right: 0.25em;
  ${flexCenter}
`

const TopBarTitleLabel = styled.div`
  ${textOverflow}
`

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`

interface TopBarLayoutProps {
  titleLabel?: React.ReactNode
  titleIconPath?: string
  style?: CSSProperties
  leftControl?: React.ReactNode
  rightControl?: React.ReactNode
}

const TopBarLayout: React.FC<TopBarLayoutProps> = ({
  titleLabel,
  titleIconPath,
  children,
  style,
  leftControl,
  rightControl,
}) => (
  <TopBarLayoutContainer style={style}>
    <TopBar>
      <TopBarLeftControl>{leftControl}</TopBarLeftControl>
      <TopBarTitle>
        {titleIconPath != null && (
          <TopBarTitleIcon>
            <Icon path={titleIconPath} />
          </TopBarTitleIcon>
        )}
        <TopBarTitleLabel>{titleLabel}</TopBarTitleLabel>
      </TopBarTitle>
      <TopBarRightControl>{rightControl}</TopBarRightControl>
    </TopBar>
    <ContentContainer>{children}</ContentContainer>
  </TopBarLayoutContainer>
)

export default TopBarLayout
