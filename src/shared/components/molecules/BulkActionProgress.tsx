import React from 'react'
import styled from '../../lib/styled'
import ProgressBar from '../../../components/atoms/ProgressBar'
import { keyframes } from 'styled-components'
import { BulkActionState } from '../../../cloud/components/molecules/ContentManager/ContentManagerToolbar'

interface BulkActionProgressProps {
  bulkActionState: BulkActionState | null
}

function getProgressPercentage(progress: BulkActionState) {
  return Math.max(
    Math.min((progress.jobsCompleted / progress.jobCount) * 100, 100),
    0
  )
}

const BulkActionProgress = ({ bulkActionState }: BulkActionProgressProps) => (
  <Container>
    <ProgressBarContainer>
      <ProgressItems>
        <Spinner />
        <ProgressBar
          className='bulk__move__progress_style'
          progress={
            bulkActionState == null ? 0 : getProgressPercentage(bulkActionState)
          }
        />
        <MoveProgressDescription>Moving..</MoveProgressDescription>
      </ProgressItems>
    </ProgressBarContainer>
    <DimBackground />
  </Container>
)

const Container = styled.div`
  position: fixed;
  z-index: 11000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
`

const MoveProgressDescription = styled.span`
  font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
`

const ProgressItems = styled.div`
  min-width: 600px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;

  .bulk__move__progress_style {
    background-color: ${({ theme }) =>
      theme.colors.background.secondary} !important;
    height: 15px;
    border-radius: 4px;

    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .bulk__move__progress_style:after {
    background-color: ${({ theme }) =>
      theme.colors.background.quaternary} !important;
  }
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  border-style: solid;
  border-color: white;
  border-right-color: transparent;
  border-width: 2px;
  width: 5em;
  height: 5em;
  display: inline-block;
  border-radius: 50%;
  animation: ${rotate} 0.75s linear infinite;
`

const ProgressBarContainer = styled.div`
  position: relative;
  z-index: 11000;
  margin-left: 10%;
  margin-right: 10%;

  max-width: 900px;
`

const DimBackground = styled.div`
  position: absolute;
  z-index: 10000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.65);
`

export default BulkActionProgress
