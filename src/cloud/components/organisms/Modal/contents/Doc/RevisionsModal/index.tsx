import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ModalContainer } from '../../styled'
import { useEffectOnce } from 'react-use'
import { SerializedDocWithBookmark } from '../../../../../../interfaces/db/doc'
import {
  isFocusLeftSideShortcut,
  isFocusRightSideShortcut,
} from '../../../../../../lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useCapturingGlobalKeyDownHandler,
} from '../../../../../../lib/keyboard'
import { focusFirstChildFromElement } from '../../../../../../lib/dom'
import Spinner from '../../../../../atoms/CustomSpinner'
import { SerializedRevision } from '../../../../../../interfaces/db/revision'
import { getAllRevisionsFromDoc } from '../../../../../../api/teams/docs/revisions'
import { usePage } from '../../../../../../lib/stores/pageStore'
import ErrorBlock from '../../../../../atoms/ErrorBlock'
import IconMdi from '../../../../../atoms/IconMdi'
import { mdiBackupRestore } from '@mdi/js'
import CustomButton from '../../../../../atoms/buttons/CustomButton'
import { useModal } from '../../../../../../lib/stores/modal'
import { useSettings } from '../../../../../../lib/stores/settings'
import { useDialog, DialogIconTypes } from '../../../../../../lib/stores/dialog'
import { useTranslation } from 'react-i18next'
import RevisionModalDetail from './RevisionModalDetail'
import {
  StyledNoSubContent,
  StyledContent,
  StyledRevisionsModal,
} from './styled'
import RevisionModalNavigator from './RevisionModalNavigator'
import { compareDateString } from '../../../../../../lib/date'

interface RevisionsModalProps {
  currentDoc: SerializedDocWithBookmark
  restoreRevision?: (revision: SerializedRevision) => void
}

const RevisionsModal = ({
  currentDoc,
  restoreRevision,
}: RevisionsModalProps) => {
  const [fetching, setFetching] = useState<boolean>(false)
  const contentSideRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [revisionsMap, setRevisionsMap] = useState<
    Map<number, SerializedRevision>
  >(new Map())
  const [error, setError] = useState<unknown>()
  const { subscription, currentUserPermissions } = usePage()
  const { closeModal } = useModal()
  const { openSettingsTab } = useSettings()
  const [revisionIndex, setRevisionIndex] = useState<number>()
  const { messageBox } = useDialog()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const { t } = useTranslation()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (closed) {
        return
      }
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(menuRef.current)
        return
      }

      if (isFocusRightSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(contentSideRef.current)
        return
      }
    }
  }, [menuRef, contentSideRef])
  useCapturingGlobalKeyDownHandler(keydownHandler)

  const onRestoreClick = useCallback(
    async (rev: SerializedRevision) => {
      if (restoreRevision == null) {
        return
      }

      messageBox({
        title: `Restore this revision?`,
        message: `Are you sure to restore this revision?`,
        iconType: DialogIconTypes.Warning,
        buttons: ['Restore', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              restoreRevision(rev)
              closeModal()
              return
            default:
              return
          }
        },
      })
    },
    [messageBox, t, restoreRevision, closeModal]
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
    fetchRevisions(currentPage)
  })

  const preview = useMemo(() => {
    if (revisionIndex == null || !revisionsMap.has(revisionIndex)) {
      return null
    }

    try {
      return (
        <RevisionModalDetail
          rev={revisionsMap.get(revisionIndex)!}
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
        <StyledNoSubContent>
          <ErrorBlock error={error} style={{ marginBottom: 20 }} />
          <CustomButton
            variant='secondary'
            disabled={fetching}
            onClick={() => fetchRevisions(currentPage)}
          >
            {fetching ? <Spinner /> : 'Try again'}
          </CustomButton>
        </StyledNoSubContent>
      )
    }

    if (subscription == null && currentUserPermissions != null) {
      return (
        <StyledNoSubContent>
          <IconMdi
            path={mdiBackupRestore}
            size={60}
            style={{ marginBottom: 20 }}
          />
          <p>
            Let&apos;s upgrade to the Pro plan now and protect your shared
            documents with a password.
            <br /> You can try a two-week trial for free!
          </p>
          <CustomButton
            variant='primary'
            onClick={() => {
              openSettingsTab('teamUpgrade')
              closeModal()
            }}
          >
            Start Free Trial
          </CustomButton>
        </StyledNoSubContent>
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
    <ModalContainer style={{ padding: 0 }}>
      <StyledRevisionsModal>
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
      </StyledRevisionsModal>
    </ModalContainer>
  )
}

export default RevisionsModal
