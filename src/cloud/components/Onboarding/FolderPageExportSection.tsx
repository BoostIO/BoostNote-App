import React from 'react'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Flexbox from '../../../design/components/atoms/Flexbox'
import styled from '../../../design/lib/styled'
import Button from '../../../design/components/atoms/Button'
import { mdiExport } from '@mdi/js'
import ExportModal from '../Modal/contents/ExportModal'
import { useModal } from '../../../design/lib/stores/modal'

const FolderPageExportSection = () => {
  const { openModal } = useModal()

  return (
    <FolderPageExportSectionContainer>
      <ColoredBlock variant='danger' className='export__section__block'>
        <Flexbox alignItems='flex-start' justifyContent='space-between'>
          <h5>BoostNote is getting discontinued</h5>

          <Button
            variant='icon'
            iconPath={mdiExport}
            onClick={() => {
              return openModal(<ExportModal />, {
                showCloseIcon: true,
                width: 'large',
              })
            }}
            iconSize={16}
          >
            Learn more
          </Button>
        </Flexbox>
        <p>
          We thank you for your continued support. We regret to inform you that
          the service will end at the end of September. As such we recommend for
          users to export their data to make sure nothing is being lost.
        </p>
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
`

export default FolderPageExportSection
