import React from 'react'
import styled from '../../lib/styled'

interface ProgressBarProps {
  progress: number
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return <ProgressBarStyled progress={progress} />
}

const ProgressBarStyled = styled.div`
  border: 2px solid ${({ theme }) => theme.borderColor};
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
    background-color: ${({ theme }) => theme.primaryColor};
    width: ${({ progress }) => progress}%;
  }
`

export default ProgressBar
