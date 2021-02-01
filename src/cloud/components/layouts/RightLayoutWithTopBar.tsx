import React, { PropsWithChildren } from 'react'
import RightSideTopBar from '../organisms/RightSideTopBar'
import Flexbox from '../atoms/Flexbox'
import styled from '../../lib/styled'
import cc from 'classcat'

export interface RightLayoutWithTopBarProps {
  topbar?: { left: React.ReactNode; right?: React.ReactNode }
  header?: React.ReactNode
  padded?: boolean
  fullWidth?: boolean
  className?: string
}

const RightLayoutWithTopBar = ({
  topbar = { left: null },
  header,
  padded = true,
  children,
  fullWidth,
  className,
}: PropsWithChildren<RightLayoutWithTopBarProps>) => (
  <Flexbox direction='column' style={{ height: '100%', width: '100%' }}>
    <RightSideTopBar left={topbar.left} right={topbar.right} />
    <Flexbox direction='column' style={{ width: '100%', height: '100%' }}>
      <StyledContent
        className={cc([padded && 'padded', fullWidth && 'full', className])}
      >
        {header != null && <StyledHeader>{header}</StyledHeader>}
        {children}
      </StyledContent>
    </Flexbox>
  </Flexbox>
)

const StyledContent = styled.div`
  margin: 0 auto;
  width: 100%;
  height: 100%;

  .full {
    max-width: 100%;
  }

  &.padded {
    padding: ${({ theme }) => theme.space.default}px
      ${({ theme }) => theme.space.large}px 0
      ${({ theme }) => theme.space.large}px;
  }

  &.flex-column {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }

  &.reduced-width {
    max-width: 920px;
  }
`

const StyledHeader = styled.h1`
  display: flex;
  justify-content: left;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  margin-top: ${({ theme }) => theme.space.large}px;
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge}px;
`

export default RightLayoutWithTopBar
