import React, { CSSProperties, PropsWithChildren } from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'

interface ColoredBlockProps {
  className?: string
  variant: 'danger' | 'warning' | 'success' | 'info'
  style?: CSSProperties
}

const ColoredBlock = ({
  className,
  variant,
  style,
  children,
}: PropsWithChildren<ColoredBlockProps>) => (
  <StyledColoredBlock className={cc([variant, className])} style={style}>
    {children}
  </StyledColoredBlock>
)

const StyledColoredBlock = styled.div`
  position: relative;
  width: 100%;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.default}px;
  border-radius: 3px;
  color: ${({ theme }) => theme.whiteTextColor};

  &.info,
  &.danger,
  &.warning,
  &.success {
    > ul,
    > ol,
    > p {
      margin-bottom: 0;
    }

    button {
      margin-left: ${({ theme }) => theme.space.small}px;
      padding: 0 ${({ theme }) => theme.space.small}px;
      background-color: transparent;
      border: 1px solid ${({ theme }) => theme.whiteBorderColor};
      color: ${({ theme }) => theme.whiteTextColor};
      line-height: 32px;

      &:hover:not(:disabled),
      &:focus:not(:disabled),
      &:active:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: ${({ theme }) => theme.whiteBorderColor};
        box-shadow: none;
      }
    }
  }

  &.info {
    background-color: ${({ theme }) => theme.infoBackgroundColor};
  }

  &.danger {
    background-color: ${({ theme }) => theme.dangerBackgroundColor};
  }

  &.warning {
    background-color: ${({ theme }) => theme.warningBackgroundColor};
  }

  &.success {
    background-color: ${({ theme }) => theme.successBackgroundColor};
  }

  &.float-on-top {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 0;
  }
`

export default ColoredBlock
