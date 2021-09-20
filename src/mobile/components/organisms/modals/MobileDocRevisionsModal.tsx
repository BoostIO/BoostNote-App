import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { SerializedDocWithBookmark } from '../../../../cloud/interfaces/db/doc'
import { SerializedRevision } from '../../../../cloud/interfaces/db/revision'
import { getAllRevisionsFromDoc } from '../../../../cloud/api/teams/docs/revisions'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { mdiBackupRestore } from '@mdi/js'
import { useSettings } from '../../../../cloud/lib/stores/settings'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../design/lib/stores/dialog'
import styled from '../../../../design/lib/styled'
import { compareDateString } from '../../../../cloud/lib/date'
import { trackEvent } from '../../../../cloud/api/track'
import { MixpanelActionTrackTypes } from '../../../../cloud/interfaces/analytics/mixpanel'
import { useModal } from '../../../../design/lib/stores/modal'
import ModalContainer from './atoms/ModalContainer'
import RevisionModalNavigator from '../../../../cloud/components/Modal/contents/Doc/RevisionsModal/RevisionModalNavigator'
import Spinner from '../../../../design/components/atoms/Spinner'
import ErrorBlock from '../../../../cloud/components/ErrorBlock'
import Button from '../../../../design/components/atoms/Button'
import RevisionModalDetail from '../../../../cloud/components/Modal/contents/Doc/RevisionsModal/RevisionModalDetail'
import { focusFirstChildFromElement } from '../../../../design/lib/dom'
import Icon from '../../../../design/components/atoms/Icon'
import { createPatch } from 'diff'

interface MobileDocRevisionsModalProps {
  currentDoc: SerializedDocWithBookmark
  restoreRevision?: (revision: SerializedRevision) => void
}

const MobileDocRevisionsModal = ({
  currentDoc,
  restoreRevision,
}: MobileDocRevisionsModalProps) => {
  const [fetching, setFetching] = useState<boolean>(false)
  const contentSideRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [revisionsMap, setRevisionsMap] = useState<
    Map<number, SerializedRevision>
  >(new Map())
  const [error, setError] = useState<unknown>()
  const { subscription, currentUserPermissions } = usePage()
  const { closeLastModal: closeModal } = useModal()
  const { openSettingsTab } = useSettings()
  const [revisionIndex, setRevisionIndex] = useState<number>()
  const { messageBox } = useDialog()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  const onRestoreClick = useCallback(
    async (rev: SerializedRevision) => {
      if (restoreRevision == null) {
        return
      }

      messageBox({
        title: `Restore this revision?`,
        message: `Are you sure to restore this revision?`,
        iconType: DialogIconTypes.Warning,

        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'primary',
            label: 'Restore',
            onClick: async () => {
              restoreRevision(rev)
              closeModal()
              return
            },
          },
        ],
      })
    },
    [messageBox, restoreRevision, closeModal]
  )

  const updateRevisionsMap = useCallback(
    (...mappedRevisions: [number, SerializedRevision][]) =>
      setRevisionsMap((prevMap) => {
        return new Map([...prevMap, ...mappedRevisions])
      }),
    []
  )

  const fetchRevisions = useCallback(
    async (nextPage: number) => {
      if (fetching) {
        return
      }

      setFetching(true)
      try {
        const { revisions, page, totalPages } = await getAllRevisionsFromDoc(
          currentDoc.teamId,
          currentDoc.id,
          nextPage
        )

        const mappedRevisions = revisions.reduce((acc, val) => {
          acc.set(val.id, val)
          return acc
        }, new Map<number, SerializedRevision>())

        setCurrentPage(page)
        setTotalPages(totalPages)
        updateRevisionsMap(...mappedRevisions)
        if (page === 1 && revisions.length > 0) {
          focusFirstChildFromElement(menuRef.current)
          setRevisionIndex(revisions[0].id)
        }
      } catch (error) {
        setError(error)
      }

      setFetching(false)
    },
    [fetching, currentDoc.teamId, currentDoc.id, updateRevisionsMap]
  )

  useEffectOnce(() => {
    trackEvent(MixpanelActionTrackTypes.DocFeatureRevision)
    fetchRevisions(currentPage)
  })

  const preview = useMemo(() => {
    if (revisionIndex == null) {
      return null
    }
    const revisions: SerializedRevision[] = [...revisionsMap.values()]
    const revisionIds: number[] = [...revisionsMap.values()].map(
      (rev) => rev.id
    )
    const currentRevisionIndex = revisionIds.indexOf(revisionIndex)
    const previousRevisionIndex = currentRevisionIndex + 1
    if (previousRevisionIndex > revisions.length || previousRevisionIndex < 0) {
      return null
    }

    try {
      const currentRevision = revisions[currentRevisionIndex]!
      const previousRevision = revisions[previousRevisionIndex]!
      if (previousRevision == null) {
        const currentDocumentRevisionDiff = currentRevision.content
          .split('\n')
          .map((line) => ` ${line}`)
          .join('\n')
        return (
          <RevisionModalDetail
            revisionDiff={currentDocumentRevisionDiff}
            revision={currentRevision}
            onRestoreClick={onRestoreClick}
            restoreRevision={restoreRevision}
          />
        )
      }

      const numberOfRevisionLines = previousRevision.content.split('\n').length
      const revisionDiff = createPatch(
        currentRevision.doc != null
          ? currentRevision.doc.title
          : 'Revision Diff',
        previousRevision.content,
        currentRevision.content,
        undefined,
        undefined,
        {
          context: numberOfRevisionLines,
        }
      )
        .split('\n')
        .filter((line) => !line.startsWith('\\ No newline at end of file'))
        .slice(5) // removes headers from diff (revision title, number of deletions and additions)
        .join('\n')

      return (
        <RevisionModalDetail
          revision={currentRevision}
          revisionDiff={revisionDiff}
          onRestoreClick={onRestoreClick}
          restoreRevision={restoreRevision}
        />
      )
    } catch (err) {
      return null
    }
  }, [revisionsMap, revisionIndex, onRestoreClick, restoreRevision])

  const rightSideContent = useMemo(() => {
    if (error != null) {
      return (
        <div>
          <ErrorBlock error={error} style={{ marginBottom: 20 }} />
          <Button
            variant='secondary'
            disabled={fetching}
            onClick={() => fetchRevisions(currentPage)}
          >
            {fetching ? <Spinner /> : 'Try again'}
          </Button>
        </div>
      )
    }

    if (subscription == null && currentUserPermissions != null) {
      return (
        <div>
          <Icon path={mdiBackupRestore} size={50} className='backup_icon' />
          <p>
            Let&apos;s upgrade to the Pro plan now and protect your shared
            documents with a password.
            <br /> You can try a two-week trial for free!
          </p>
          <Button
            variant='primary'
            onClick={() => {
              openSettingsTab('teamUpgrade')
              closeModal()
            }}
          >
            Start Free Trial
          </Button>
        </div>
      )
    }

    return <StyledContent>{preview}</StyledContent>
  }, [
    currentUserPermissions,
    error,
    subscription,
    closeModal,
    openSettingsTab,
    preview,
    fetching,
    fetchRevisions,
    currentPage,
  ])

  const orderedRevisions = useMemo(() => {
    return [...revisionsMap.values()].sort((a, b) => {
      return compareDateString(b.created, a.created)
    })
  }, [revisionsMap])

  useEffect(() => {
    if (orderedRevisions.length === 0) {
      setRevisionIndex(undefined)
      return
    }

    focusFirstChildFromElement(menuRef.current)
    setRevisionIndex(orderedRevisions[0].id)
  }, [orderedRevisions, menuRef])

  return (
    <ModalContainer title={'Revisions'}>
      <RevisionModalNavigator
        revisions={orderedRevisions}
        menuRef={menuRef}
        fetching={fetching}
        revisionIndex={revisionIndex}
        subscription={subscription}
        setRevisionIndex={setRevisionIndex}
        currentPage={currentPage}
        totalPages={totalPages}
        fetchRevisions={fetchRevisions}
        currentUserPermissions={currentUserPermissions}
      />
      <div className='right' ref={contentSideRef}>
        {rightSideContent}
      </div>
    </ModalContainer>
  )
}

export default MobileDocRevisionsModal

const StyledContent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .backup_icon {
    margin-bottom: 20px;
  }
`
