import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { SerializedDocWithBookmark } from '../../../../../interfaces/db/doc'
import {
  isFocusLeftSideShortcut,
  isFocusRightSideShortcut,
} from '../../../../../lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useCapturingGlobalKeyDownHandler,
} from '../../../../../lib/keyboard'
import { focusFirstChildFromElement } from '../../../../../lib/dom'
import { SerializedRevision } from '../../../../../interfaces/db/revision'
import { getAllRevisionsFromDoc } from '../../../../../api/teams/docs/revisions'
import { usePage } from '../../../../../lib/stores/pageStore'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../../../design/lib/stores/dialog'
import RevisionModalDetail from './RevisionModalDetail'
import RevisionModalNavigator from './RevisionModalNavigator'
import { compareDateString } from '../../../../../lib/date'
import { trackEvent } from '../../../../../api/track'
import { MixpanelActionTrackTypes } from '../../../../../interfaces/analytics/mixpanel'
import { useModal } from '../../../../../../design/lib/stores/modal'
import useApi from '../../../../../../design/lib/hooks/useApi'
import styled from '../../../../../../design/lib/styled'
import DoublePane from '../../../../../../design/components/atoms/DoublePane'
import { createPatch } from 'diff'

interface RevisionsModalProps {
  currentDoc: SerializedDocWithBookmark
  restoreRevision?: (revision: SerializedRevision) => void
}

const RevisionsModal = ({
  currentDoc,
  restoreRevision,
}: RevisionsModalProps) => {
  const contentSideRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [revisionsMap, setRevisionsMap] = useState<
    Map<number, SerializedRevision>
  >(new Map())
  const { subscription, currentUserPermissions } = usePage()
  const { closeLastModal: closeModal } = useModal()
  const [revisionIndex, setRevisionIndex] = useState<number>()
  const { messageBox } = useDialog()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

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

  const { submit: fetchRevisions, sending: fetching } = useApi({
    api: ({
      nextPage,
      currentDoc,
    }: {
      nextPage: number
      currentDoc: SerializedDocWithBookmark
    }) => getAllRevisionsFromDoc(currentDoc.teamId, currentDoc.id, nextPage),
    cb: ({ revisions, page, totalPages }) => {
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
    },
  })

  useEffectOnce(() => {
    trackEvent(MixpanelActionTrackTypes.DocFeatureRevision)
    fetchRevisions({ nextPage: currentPage, currentDoc })
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
    <RevisionModalContainer>
      <DoublePane
        className='revision__modal__panes'
        leftFlex='0 0 auto'
        rightFlex='1 1 auto'
        right={
          <div className='right' ref={contentSideRef}>
            {preview}
          </div>
        }
      >
        <RevisionModalNavigator
          revisions={orderedRevisions}
          menuRef={menuRef}
          fetching={fetching}
          revisionIndex={revisionIndex}
          subscription={subscription}
          setRevisionIndex={setRevisionIndex}
          currentPage={currentPage}
          totalPages={totalPages}
          fetchRevisions={(page: number) =>
            fetchRevisions({ nextPage: page, currentDoc })
          }
          currentUserPermissions={currentUserPermissions}
        />
      </DoublePane>
    </RevisionModalContainer>
  )
}

const RevisionModalContainer = styled.div`
  height: 80vh;

  .revision__modal__panes,
  .right {
    height: 100%;
  }

  .content--unsubscribed {
    display: flex;
    flex-direction: column;
    text-align: center;
    width: 80%;
    margin: auto;
    height: 100%;
    justify-content: center;
    align-items: center;

    p {
      text-align: center;
    }

    svg {
      color: ${({ theme }) => theme.colors.icon.default};
    }
  }
`

export default RevisionsModal
