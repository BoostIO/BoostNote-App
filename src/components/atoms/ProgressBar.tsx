import React from 'react'
import styled from '../../design/lib/styled'

interface ProgressBarProps {
  progress: number
  className?: string
}

const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  return <ProgressBarStyled className={className} progress={progress} />
}

const ProgressBarStyled = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  height: 30px;
  position: relative;
  width: 100%;
  margin: 30px 0;

  &:after {
    content: '';
    transition: width 0.5s linear;
    position: absolute;
    top: 0;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    width: ${({ progress }) => progress}%;
  }
`

export default ProgressBar
