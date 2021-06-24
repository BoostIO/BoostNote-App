import React from 'react'
import {
  StyledImportModalContent,
  StyledImportModalFooter,
  StyledSourceRow,
} from './styled'
import SourceButton from './SourceButton'
import IconMdi from '../../../../atoms/IconMdi'
import {
  mdiLanguageHtml5,
  mdiLanguageMarkdownOutline,
  mdiGoogle,
} from '@mdi/js'
import { ImportService } from './ImportModalGuide'
import { AllowedDocTypeImports } from '../../../../../api/teams/docs/import'
import { ImportStep } from './ImportModalHeader'
import { useI18n } from '../../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../../lib/i18n/types'
import Button from '../../../../../../shared/components/atoms/Button'

interface ImportModalSelectSourceProps {
  selectedService?: ImportService
  onCancel: () => void
  showGuide: (service: ImportService) => void
  setUploadType: (type: AllowedDocTypeImports) => void
  setStep: (step: ImportStep) => void
  sending: boolean
}

const ImportModalSelectSource = ({
  sending,
  setStep,
  onCancel,
  showGuide,
  setUploadType,
}: ImportModalSelectSourceProps) => {
  const { translate } = useI18n()
  return (
    <>
      <StyledImportModalContent tabIndex={-1}>
        <h2 style={{ margin: 0 }}>{translate(lngKeys.GeneralSource)}</h2>
        {!sending ? (
          <>
            <p>{translate(lngKeys.ModalsImportDisclaimer)}</p>
            <StyledSourceRow>
              <SourceButton
                title={'Markdown or text'}
                description={'Import .txt or .md files'}
                logo={<IconMdi path={mdiLanguageMarkdownOutline} size={48} />}
                onClick={() => {
                  setUploadType('md')
                  setStep('destination')
                }}
              />
              <SourceButton
                title={'Html'}
                description={'Import .html files'}
                logo={<IconMdi path={mdiLanguageHtml5} size={48} />}
                onClick={() => {
                  setUploadType('html')
                  setStep('destination')
                }}
              />
            </StyledSourceRow>
            <StyledSourceRow>
              <SourceButton
                title={'Notion'}
                description={'Follow our migration guide in the next page'}
                logo={<img src='/app/static/logos/notion.svg' />}
                onClick={() => showGuide('notion')}
              />
              <SourceButton
                title={'Evernote'}
                description={'Follow our migration guide in the next page'}
                logo={<img src='/app/static/logos/evernote.svg' />}
                onClick={() => showGuide('evernote')}
              />
            </StyledSourceRow>
            <StyledSourceRow>
              <SourceButton
                title={'Confluence'}
                description={'Follow our migration guide in the next page'}
                logo={<img src='/app/static/logos/confluence.svg' />}
                onClick={() => showGuide('confluence')}
              />
              <SourceButton
                title={'Google Docs'}
                description={'Follow our migration guide in the next page'}
                logo={<IconMdi path={mdiGoogle} size={48} />}
                onClick={() => showGuide('gdocs')}
              />
            </StyledSourceRow>
            <StyledSourceRow>
              <SourceButton
                title={'Dropbox'}
                description={'Follow our migration guide in the next page'}
                logo={<img src='/app/static/logos/dropboxpaper.svg' />}
                onClick={() => showGuide('dropbox')}
              />
              <SourceButton
                title={'Quip'}
                description={'Follow our migration guide in the next page'}
                logo={<img src='/app/static/logos/quip.svg' />}
                onClick={() => showGuide('quip')}
              />
            </StyledSourceRow>
          </>
        ) : (
          'Uploading...'
        )}
      </StyledImportModalContent>
      <StyledImportModalFooter>
        <Button variant='secondary' onClick={onCancel} disabled={sending}>
          {translate(lngKeys.GeneralCancel)}
        </Button>
      </StyledImportModalFooter>
    </>
  )
}

export default ImportModalSelectSource
