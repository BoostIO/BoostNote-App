import React from 'react'
import {
  StyledImportModalHeader,
  StyledImportStep,
  StyledImportStepSeparator,
} from './styled'
import cc from 'classcat'
import IconMdi from '../../../../atoms/IconMdi'
import { mdiChevronRight } from '@mdi/js'
import { useI18n } from '../../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../../lib/i18n/types'

export type ImportStep = 'destination' | 'source' | 'import' | 'guide'

const ImportStepValues = ['source', 'destination', 'import']

interface ImportModalHeaderProps {
  currentStep: ImportStep
}

const ImportModalHeader = ({ currentStep }: ImportModalHeaderProps) => {
  const { t } = useI18n()

  const getTranslatedLabel = (step: ImportStep) => {
    switch (step) {
      case 'destination':
        return t(lngKeys.Destination)
      case 'import':
        return t(lngKeys.Import)
      default:
        return t(lngKeys.Source)
    }
  }

  return (
    <StyledImportModalHeader>
      {ImportStepValues.reduce<JSX.Element[]>((acc, value, index) => {
        acc.push(
          <StyledImportStep
            className={cc([currentStep === value && 'active'])}
            key={value}
          >
            {getTranslatedLabel(value as ImportStep)}
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
}

export default ImportModalHeader
