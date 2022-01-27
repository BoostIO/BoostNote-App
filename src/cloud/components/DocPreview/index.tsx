import { mdiArrowExpand, mdiClose, mdiPencil } from '@mdi/js'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../design/components/atoms/Button'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { getDocCollaborationToken } from '../../api/docs/token'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { useEffectOnUnmount } from '../../../lib/hooks'
import { docPreviewCloseEvent } from '../../lib/hooks/useCloudDocPreview'
import { useRouter } from '../../lib/router'
import { useGlobalData } from '../../lib/stores/globalData'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import { ModalEventDetails, modalEventEmitter } from '../../lib/utils/events'
import { getDocTitle } from '../../lib/utils/patterns'
import DocProperties from '../DocProperties'
import { getDocLinkHref } from '../Link/DocLink'
import DocPreviewRealtime from './DocPreviewRealtime'
import Loader from '../../../design/components/atoms/loaders'

interface DocPreviewModalProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
  fallbackUrl: string
}

const DocPreviewModal = ({ doc, team, fallbackUrl }: DocPreviewModalProps) => {
  const { closeLastModal } = useModal()
  const { docsMap } = useNav()
  const { push } = useRouter()
  const { currentUserIsCoreMember } = usePage()
  const [fetching, setFetching] = useState(true)
  const [collabToken, setCollabToken] = useState(
    doc.collaborationToken || doc.id
  )

  const {
    globalData: { currentUser },
  } = useGlobalData()

  useEffectOnce(() => {
    fetchDocCollaborationToken()
  })

  const fetchDocCollaborationToken = useCallback(async () => {
    setFetching(true)
    try {
      const res = await getDocCollaborationToken(doc.id)
      setCollabToken(res.data)
    } catch (err) {
      setCollabToken(doc.collaborationToken || doc.id)
    }

    setFetching(false)
  }, [doc])

  const currentDoc = useMemo(() => {
    return docsMap.get(doc.id)
  }, [docsMap, doc.id])

  const navigateToDoc = useCallback(() => {
    push(getDocLinkHref(doc, team, 'index'))
    return closeLastModal()
  }, [push, closeLastModal, team, doc])

  const manualClosing = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      if (fallbackUrl != null) {
        push(fallbackUrl)
      }
      closeLastModal()
    },
    [closeLastModal, fallbackUrl, push]
  )

  const closePreviewModal = useCallback(
    (event: CustomEvent<ModalEventDetails>) => {
      if (event.detail.type !== docPreviewCloseEvent) {
        return
      }

      closeLastModal()
      if (fallbackUrl != null) {
        push(fallbackUrl)
      }
    },
    [closeLastModal, fallbackUrl, push]
  )

  useEffect(() => {
    modalEventEmitter.listen(closePreviewModal)
    return () => {
      modalEventEmitter.unlisten(closePreviewModal)
    }
  }, [closePreviewModal])

  useEffectOnUnmount(() => {
    modalEventEmitter.dispatch({ type: docPreviewCloseEvent })
  })

  if (currentDoc == null) {
    return (
      <Flexbox direction='column'>
        <Flexbox justifyContent='flex-end'>
          <Button variant='icon' iconPath={mdiClose} onClick={manualClosing} />
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
            onClick={manualClosing}
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
        {fetching ? (
          <Flexbox>
            <Loader variant='doc-editor' />
          </Flexbox>
        ) : (
          <DocPreviewRealtime
            doc={currentDoc}
            token={collabToken}
            user={currentUser}
          />
        )}
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
