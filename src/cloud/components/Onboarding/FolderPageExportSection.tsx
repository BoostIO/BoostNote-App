import React from 'react'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Flexbox from '../../../design/components/atoms/Flexbox'
import styled from '../../../design/lib/styled'
import Button from '../../../design/components/atoms/Button'
import { mdiExport } from '@mdi/js'
import ExportModal from '../Modal/contents/ExportModal'
import { useModal } from '../../../design/lib/stores/modal'
import { ExternalLink } from '../../../design/components/atoms/Link'

const FolderPageExportSection = () => {
  const { openModal } = useModal()

  return (
    <FolderPageExportSectionContainer>
      <ColoredBlock variant='danger' className='export__section__block'>
        <Flexbox alignItems='baseline' justifyContent='space-between'>
          <h5>BoostNote is getting discontinued</h5>

          <ExternalLink
            href='https://intercom.help/boostnote-for-teams/en/articles/11579215-important-service-termination-notice-for-boost-note'
            showIcon={true}
          >
            Learn more
          </ExternalLink>
        </Flexbox>
        <Flexbox
          style={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <p style={{ marginRight: '10px' }}>
            We thank you for your continued support. We regret to inform you
            that the service will end at the end of September. As such we
            recommend for users to export their data to make sure nothing is
            being lost.
          </p>
          <Button
            variant='secondary'
            iconPath={mdiExport}
            onClick={() => {
              return openModal(<ExportModal />, {
                showCloseIcon: true,
                width: 'large',
              })
            }}
            iconSize={16}
          >
            Download
          </Button>
        </Flexbox>
      </ColoredBlock>
    </FolderPageExportSectionContainer>
  )
}

const FolderPageExportSectionContainer = styled.div`
  margin: ${({ theme }) => theme.sizes.spaces.df}px
    ${({ theme }) => theme.sizes.spaces.sm}px;

  .export__section__block {
    input {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
    h5 {
      color: ${({ theme }) => theme.colors.text.primary};
      margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
      font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    }
    p {
      color: ${({ theme }) => theme.colors.text.primary};
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
    .form__row__items {
      > * {
        margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
      }
      flex-wrap: wrap;
    }
  }

  .link {
    color: ${({ theme }) => theme.colors.text.subtle} !important;
  }
`

export default FolderPageExportSection
