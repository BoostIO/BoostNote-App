import React from 'react'
import { StyledProgressBarWrapper, StyledProgressBar } from './styled'
import { Spinner } from '../../../../atoms/Spinner'

interface ImportProgressBarProps {
  uploadProgress: number
}

const ImportProgressBar = ({ uploadProgress }: ImportProgressBarProps) => (
  <>
    <p>Importing your files</p>
    <StyledProgressBarWrapper>
      <StyledProgressBar style={{ width: `${uploadProgress}%` }} />
      <Spinner
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
          margin: 'auto',
        }}
      />
    </StyledProgressBarWrapper>
  </>
)

export default ImportProgressBar
