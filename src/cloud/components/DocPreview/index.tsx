import { mdiArrowExpand, mdiClose, mdiPencil } from '@mdi/js'
import React from 'react'
import { useCallback } from 'react'
import { useMemo } from 'react'
import Button from '../../../design/components/atoms/Button'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../../lib/router'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import { getDocContent, getDocTitle } from '../../lib/utils/patterns'
import DocProperties from '../DocProperties'
import { getDocLinkHref } from '../Link/DocLink'
import CustomizedMarkdownPreviewer from '../MarkdownView/CustomizedMarkdownPreviewer'

interface DocPreviewModalProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
}

const DocPreviewModal = ({ doc, team }: DocPreviewModalProps) => {
  const { closeLastModal } = useModal()
  const { docsMap } = useNav()
  const { push } = useRouter()
  const { currentUserIsCoreMember } = usePage()

  const currentDoc = useMemo(() => {
    return docsMap.get(doc.id)
  }, [docsMap, doc.id])

  const navigateToDoc = useCallback(() => {
    push(getDocLinkHref(doc, team, 'index'))
    return closeLastModal()
  }, [push, closeLastModal, team, doc])

  if (currentDoc == null) {
    return (
      <Flexbox direction='column'>
        <Flexbox justifyContent='flex-end'>
          <Button
            variant='icon'
            iconPath={mdiClose}
            onClick={() => closeLastModal()}
          />
        </Flexbox>
        <div className='doc-preview__content'>
          <ColoredBlock variant='danger'>
            The document has been deleted
          </ColoredBlock>
        </div>
      </Flexbox>
    )
  }

  return (
    <Container className='doc-preview'>
      <Flexbox className='doc-preview__topbar' justifyContent='space-between'>
        <Button
          variant='transparent'
          onClick={navigateToDoc}
          iconPath={mdiArrowExpand}
          id='doc-preview__expand'
          size='sm'
        >
          Open as full page
        </Button>
        <Flexbox className='doc-preview__actions'>
          <Button
            variant='icon'
            iconPath={mdiPencil}
            onClick={navigateToDoc}
            id='doc-preview__edit'
            size='sm'
          />
          <Button
            variant='icon'
            iconPath={mdiClose}
            onClick={closeLastModal}
            id='doc-preview__close'
            size='sm'
          />
        </Flexbox>
      </Flexbox>
      <div className='doc-preview__content'>
        <Flexbox className='doc-preview__title__wrapper'>
          <span className='doc-preview__title'>
            {getDocTitle(currentDoc, 'Untitled')}
          </span>
        </Flexbox>
        <DocProperties
          doc={currentDoc}
          team={team}
          currentUserIsCoreMember={currentUserIsCoreMember}
          className='doc-props__properties'
        />
        <CustomizedMarkdownPreviewer
          content={getDocContent(currentDoc)}
          className='doc-preview__content__scroller'
        />
      </div>
    </Container>
  )
}

const Container = styled.div`
  .doc-preview__actions > * + * {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc-preview__topbar {
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .doc-preview__content {
    padding: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.xl}px;
  }

  .doc-preview__title__wrapper {
    width: 100%;
    overflow: hidden;
    display: flex;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    color: ${({ theme }) => theme.colors.text.primary};
    justify-content: flex-start;

    .doc-preview__title {
      ${overflowEllipsis()}
    }
  }

  .doc-preview__content__scroller {
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .doc-props__properties {
    margin-left: 0 !important;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc-props__property:not(button) {
    padding-left: 0;
  }
`

export default DocPreviewModal
