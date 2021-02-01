import React, { useMemo, useCallback } from 'react'
import { StyledImportModalContent, StyledImportModalFooter } from './styled'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import { AllowedDocTypeImports } from '../../../../../api/teams/docs/import'

export type ImportService =
  | 'notion'
  | 'evernote'
  | 'confluence'
  | 'gdocs'
  | 'quip'
  | 'dropbox'

interface ImportModalGuideProps {
  selectedService?: string
  onCancel: () => void
  onContinue: () => void
  setUploadType: (type: AllowedDocTypeImports) => void
}

const ImportModalGuide = ({
  selectedService,
  setUploadType,
  onCancel,
  onContinue,
}: ImportModalGuideProps) => {
  const guideContent = useMemo(() => {
    switch (selectedService) {
      case 'notion':
        return (
          <>
            <h2>Notion</h2>
            <p>
              You can export your content from Notion to Boost Note for Teams
              one doc at a time, or all at once. Here&apos;s how:
            </p>
            <h5>Exporting individual Notion doc into Boost Note for Teams</h5>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://www.notion.so/'
                  target='_blank'
                  rel='noreferrer'
                >
                  Notion
                </a>
                , select the doc you wish to export and click
                &ldquo;Export&rdquo;
              </li>
              <li>Export file as Markdown or HTML</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
            <h5>Exporting Notion docs in bulk into Boost Note for Teams</h5>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://www.notion.so/'
                  target='_blank'
                  rel='noreferrer'
                >
                  Notion
                </a>
                , Go to Settings &amp; Members in the left-hand menu and open
                Settings
              </li>
              <li>
                Scroll down to Export, and click Export all workspace content
              </li>
              <li>Export file as Markdown or HTML</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
          </>
        )
      case 'quip':
        return (
          <>
            <h2>Quip</h2>
            <p>
              Quip doesn&apos;t support mass export so you&apos;ll have to
              import files one by one. Here&apos;s how:
            </p>
            <ol>
              <li>
                In{' '}
                <a href='https://quip.com/' target='_blank' rel='noreferrer'>
                  Quip
                </a>
                , select the document icon at the top left of the screen and
                click &ldquo;Export&rdquo;
              </li>
              <li>Export file as markdown or html</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
          </>
        )
      case 'confluence':
        return (
          <>
            <h2>Confluence</h2>
            <p>
              You can export your content from Confluence to Boost Note for
              Teams one doc at a time, or all at once. Here&apos;s how:
            </p>
            <h5>
              Exporting individual Confluence doc into Boost Note for Teams
            </h5>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://www.atlassian.com/software/confluence'
                  target='_blank'
                  rel='noreferrer'
                >
                  Confluence
                </a>
                , select the doc you wish to export and click the
                &ldquo;...&rdquo; button in the top right
              </li>
              <li>Export File as Word</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
            <h5>Exporting Confluence docs in bulk into Boost Note for Teams</h5>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://www.atlassian.com/software/confluence'
                  target='_blank'
                  rel='noreferrer'
                >
                  Confluence
                </a>
                , , go to Space Settings for the space you&apos;re looking to
                export and select the Content tools section
              </li>
              <li>Click the Export tab</li>
              <li>Export as HTML</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
          </>
        )
      case 'evernote':
        return (
          <>
            <h2>Evernote</h2>
            <p>
              You can export your content from Evernote to Boost Note for Teams
              one doc at a time, or all at once. Here&apos;s how:
            </p>
            <h5>Exporting individual Evernote doc into Boost Note for Teams</h5>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://evernote.com/'
                  target='_blank'
                  rel='noreferrer'
                >
                  Evernote
                </a>
                , select the doc you wish to export and click &ldquo;Export
                Notes...&rdquo;
              </li>
              <li>Export File as HTML</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
            <h5>Exporting Evernote docs in bulk into Boost Note for Teams</h5>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://evernote.com/'
                  target='_blank'
                  rel='noreferrer'
                >
                  Evernote
                </a>
                , Click on &ldquo;Notebooks&rdquo; to enter the notebook view
              </li>
              <li>
                Select <code>File-&gt;Export all Notes...</code>
              </li>
              <li>Export as HTML</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
          </>
        )
      case 'gdocs':
        return (
          <>
            <h2>Google Docs</h2>
            <p>
              Google Docs doesn&apos;t support mass export so you&apos;ll have
              to import files one by one. Here&apos;s how:
            </p>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://www.google.com/intl/en/docs/about/'
                  target='_blank'
                  rel='noreferrer'
                >
                  Google Docs
                </a>
                , select the doc you wish to export and click
                &ldquo;Export&rdquo;
              </li>
              <li>
                Download file as .txt from <code>File-&gt;Download</code>
              </li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
          </>
        )
      case 'dropbox':
        return (
          <>
            <h2>Dropbox Paper</h2>
            <p>
              Dropbox paper doesn&apos;t support mass export so you&apos;ll have
              to import files one by one. Here&apos;s how:
            </p>
            <ol>
              <li>
                In{' '}
                <a
                  href='https://www.dropbox.com/paper'
                  target='_blank'
                  rel='noreferrer'
                >
                  Dropbox Paper
                </a>
                , select the doc you wish to export and click
                &ldquo;Export&rdquo;
              </li>
              <li>Export file as .md</li>
              <li>Upload files in Boost Note for Teams</li>
            </ol>
          </>
        )
      default:
        return null
    }
  }, [selectedService])

  const onSelect = useCallback(() => {
    switch (selectedService) {
      case 'dropbox':
      case 'gdocs':
        setUploadType('md')
        onContinue()
        break
      case 'evernote':
      case 'confluence':
        setUploadType('html')
        onContinue()
        break
      case 'quip':
      case 'notion':
      default:
        setUploadType('md|html')
        onContinue()
        break
    }
  }, [setUploadType, selectedService, onContinue])

  return (
    <>
      <StyledImportModalContent>{guideContent}</StyledImportModalContent>
      <StyledImportModalFooter>
        <CustomButton variant='secondary' onClick={onCancel}>
          Previous
        </CustomButton>
        <CustomButton variant='primary' onClick={onSelect}>
          Continue
        </CustomButton>
      </StyledImportModalFooter>
    </>
  )
}

export default ImportModalGuide
