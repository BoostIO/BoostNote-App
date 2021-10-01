import React, { useMemo, useRef, useState } from 'react'
import {
  isFocusLeftSideShortcut,
  isFocusRightSideShortcut,
} from '../../../../lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useCapturingGlobalKeyDownHandler,
} from '../../../../lib/keyboard'
import { focusFirstChildFromElement } from '../../../../lib/dom'
import { usePage } from '../../../../lib/stores/pageStore'
import LabelsManagementModalDetail from './LabelsManagementModalDetail'
import LabelsManagementModalNavigator from './LabelsManagementModalNavigator'
import styled from '../../../../../design/lib/styled'
import DoublePane from '../../../../../design/components/atoms/DoublePane'
import { useNav } from '../../../../lib/stores/nav'
import { getMapValues } from '../../../../../design/lib/utils/array'
import { SerializedDoc } from '../../../../interfaces/db/doc'
import { useCloudApi } from '../../../../lib/hooks/useCloudApi'

const LabelsManagementModal = () => {
  const contentSideRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { currentUserPermissions, team } = usePage()
  const { docsMap, tagsMap, initialLoadDone } = useNav()
  const [selectedTagId, setSelectedTagId] = useState<string>()

  const docsPerTagIdMap = [...docsMap.values()].reduce((acc, doc) => {
    const docTags = doc.tags || []
    docTags.forEach((tag) => {
      let docIds = acc.get(tag.id)
      if (docIds == null) {
        docIds = []
        acc.set(tag.id, docIds)
      }
      docIds.push(doc.id)
    })
    return acc
  }, new Map<string, string[]>())

  const orderedTags = useMemo(() => {
    return getMapValues(tagsMap)
      .sort((a, b) => {
        if (a.text < b.text) {
          return -1
        } else {
          return 1
        }
      })
      .map((tag) => {
        return { ...tag, docsIds: docsPerTagIdMap.get(tag.id) || [] }
      })
  }, [tagsMap, docsPerTagIdMap])

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

  const selectedTagDocs = useMemo(() => {
    if (selectedTagId == null) return []

    const docsIds = docsPerTagIdMap.get(selectedTagId)
    if (docsIds == null || docsIds.length === 0) return []

    return docsIds.reduce((acc, val) => {
      const doc = docsMap.get(val)
      if (doc != null) acc.push(doc)
      return acc
    }, [] as SerializedDoc[])
  }, [selectedTagId, docsPerTagIdMap, docsMap])

  const { sendingMap, deleteTagApi, updateTagApi } = useCloudApi()

  return (
    <LabelsManagementModalContainer>
      <DoublePane
        className='labels__modal__pane'
        leftFlex='0 0 auto'
        rightFlex='1 1 auto'
        right={
          team != null ? (
            <LabelsManagementModalDetail
              ref={contentSideRef}
              tag={
                selectedTagId != null ? tagsMap.get(selectedTagId) : undefined
              }
              docs={selectedTagDocs}
              deleteTag={deleteTagApi}
              updateTag={updateTagApi}
              sending={
                selectedTagId == null
                  ? undefined
                  : sendingMap.get(selectedTagId)
              }
              team={team}
            />
          ) : null
        }
      >
        <LabelsManagementModalNavigator
          menuRef={menuRef}
          selectedTagId={selectedTagId}
          selectTag={setSelectedTagId}
          fetching={!initialLoadDone}
          tags={orderedTags}
          currentUserPermissions={currentUserPermissions}
        />
      </DoublePane>
    </LabelsManagementModalContainer>
  )
}

const LabelsManagementModalContainer = styled.div`
  height: 80vh;

  .labels__modal__pane,
  .right {
    height: 100%;
  }
`

export default LabelsManagementModal
