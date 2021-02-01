import React from 'react'
import {
  StyledImportModalHeader,
  StyledImportStep,
  StyledImportStepSeparator,
} from './styled'
import cc from 'classcat'
import IconMdi from '../../../../atoms/IconMdi'
import { mdiChevronRight } from '@mdi/js'

export type ImportStep = 'destination' | 'source' | 'import' | 'guide'

const ImportStepValues = ['source', 'destination', 'import']

interface ImportModalHeaderProps {
  currentStep: ImportStep
}

const ImportModalHeader = ({ currentStep }: ImportModalHeaderProps) => (
  <StyledImportModalHeader>
    {ImportStepValues.reduce<JSX.Element[]>((acc, value, index) => {
      acc.push(
        <StyledImportStep
          className={cc([currentStep === value && 'active'])}
          key={value}
        >
          {value}
        </StyledImportStep>
      )

      if (index !== ImportStepValues.length - 1) {
        acc.push(
          <StyledImportStepSeparator key={`sep-${index}`}>
            <IconMdi path={mdiChevronRight} size={20} />
          </StyledImportStepSeparator>
        )
      }
      return acc
    }, [])}
  </StyledImportModalHeader>
)

export default ImportModalHeader
