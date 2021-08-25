import React from 'react'
import styled from '../../lib/styled'
import ProgressBar from '../../../components/atoms/ProgressBar'
import Spinner from '../atoms/Spinner'

export interface BulkActionState {
  jobCount: number
  jobsCompleted: number
}

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
  <Container className='bulk-action-progress'>
    <div className='bulk-action-progress__wrapper'>
      <div className='bulk-action-progress__items'>
        <Spinner variant='subtle' size={50} />
        <ProgressBar
          className='bulk__move__progress_style'
          progress={
            bulkActionState == null ? 0 : getProgressPercentage(bulkActionState)
          }
        />
        <span className='bulk-action-progress__description'>Moving..</span>
      </div>
    </div>
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

  .bulk-action-progress__wrapper {
    position: relative;
    z-index: 11000;
    margin-left: 10%;
    margin-right: 10%;
    max-width: 900px;
  }

  &::before {
    content: '';
    z-index: 10000;
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
  }

  .bulk-action-progress__ {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
  }

  .bulk-action-progress__items {
    min-width: 600px;
    min-height: 480px;
    height: fit-content;
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
  }
`

export default BulkActionProgress
