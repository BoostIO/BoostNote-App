import React, { useCallback, useState } from 'react'
import IconMdi from '../../../atoms/IconMdi'
import {
  mdiArchive,
  mdiDotsVertical,
  mdiPlusBoxMultipleOutline,
  mdiStar,
  mdiStarOutline,
} from '@mdi/js'
import { useNav } from '../../../../lib/stores/nav'
import { baseIconStyle } from '../../../../lib/styled/styleFunctions'
import styled from '../../../../lib/styled'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import {
  useContextMenu,
  MenuTypes,
} from '../../../../../lib/v2/stores/contextMenu'
import {
  CreateDocBookmarkResponseBody,
  DestroyDocBookmarkResponseBody,
  createDocBookmark,
  destroyDocBookmark,
} from '../../../../api/teams/docs/bookmarks'
import { usePage } from '../../../../lib/stores/pageStore'
import {
  useCapturingGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../../../lib/keyboard'
import { isDocBookmarkShortcut } from '../../../../lib/shortcuts'
import { saveDocAsTemplate } from '../../../../api/teams/docs/templates'
import { archiveDoc, unarchiveDoc } from '../../../../api/teams/docs'
import { useToast } from '../../../../../lib/v2/stores/toast'

interface SideNavigatorDocControlsProps {
  doc: SerializedDocWithBookmark
  focused: boolean
}

const SideNavigatorDocControls = ({
  doc,
  focused = false,
}: SideNavigatorDocControlsProps) => {
  const { updateDocsMap, updateTemplatesMap } = useNav()
  const { pushMessage } = useToast()
  const { popup } = useContextMenu()
  const [sendingBookmark, setSendingBookmark] = useState<boolean>(false)
  const [sendingTemplate, setSendingTemplate] = useState<boolean>(false)
  const [sendingArchive, setSendingArchive] = useState<boolean>(false)
  const { pageDoc, setPartialPageData } = usePage()

  const toggleBookmark = useCallback(async () => {
    if (sendingBookmark || sendingTemplate) {
      return
    }
    setSendingBookmark(true)
    try {
      let data: CreateDocBookmarkResponseBody | DestroyDocBookmarkResponseBody
      if (doc.bookmarked) {
        data = await destroyDocBookmark(doc.teamId, doc.id)
      } else {
        data = await createDocBookmark(doc.teamId, doc.id)
      }
      updateDocsMap([data.doc.id, data.doc])
      if (pageDoc != null && doc.id === pageDoc.id) {
        setPartialPageData({ pageDoc: data.doc })
      }
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not bookmark this doc',
      })
    }
    setSendingBookmark(false)
  }, [
    doc,
    setSendingBookmark,
    pushMessage,
    updateDocsMap,
    sendingBookmark,
    sendingTemplate,
    setPartialPageData,
    pageDoc,
  ])

  const createTemplate = useCallback(async () => {
    if (sendingTemplate || sendingBookmark) {
      return
    }
    setSendingTemplate(true)
    try {
      const data = await saveDocAsTemplate(doc.teamId, doc.id)
      updateTemplatesMap([data.template.id, data.template])
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Template could not be created',
      })
    }
    setSendingTemplate(false)
  }, [
    doc,
    setSendingTemplate,
    pushMessage,
    updateTemplatesMap,
    sendingBookmark,
    sendingTemplate,
  ])

  const toggleArchived = useCallback(async () => {
    if (sendingTemplate || sendingArchive || doc == null) {
      return
    }
    setSendingArchive(true)
    try {
      const data =
        doc.archivedAt == null
          ? await archiveDoc(doc.teamId, doc.id)
          : await unarchiveDoc(doc.teamId, doc.id)
      updateDocsMap([data.doc.id, data.doc])
      setPartialPageData({ pageDoc: data.doc })
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not archive this doc',
      })
    }
    setSendingArchive(false)
  }, [
    sendingTemplate,
    sendingArchive,
    doc,
    updateDocsMap,
    setPartialPageData,
    pushMessage,
  ])

  const openDotsContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          icon: (
            <IconMdi
              path={doc.bookmarked ? mdiStar : mdiStarOutline}
              size={16}
            />
          ),
          label: sendingBookmark
            ? '...'
            : doc.bookmarked
            ? 'Bookmarked'
            : 'Bookmark Doc',
          onClick: async () => toggleBookmark(),
        },
        {
          type: MenuTypes.Normal,
          icon: <IconMdi path={mdiPlusBoxMultipleOutline} size={16} />,
          label: sendingTemplate ? '...' : 'Save as a Template',
          onClick: async () => createTemplate(),
        },
        {
          type: MenuTypes.Normal,
          icon: <IconMdi path={mdiArchive} size={16} />,
          label: 'Archive',
          onClick: async () => toggleArchived(),
        },
      ])
    },
    [
      popup,
      doc,
      sendingBookmark,
      sendingTemplate,
      toggleBookmark,
      createTemplate,
      toggleArchived,
    ]
  )

  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused) {
        return
      }
      if (isDocBookmarkShortcut(event)) {
        preventKeyboardEventPropagation(event)
        toggleBookmark()
        return
      }
    },
    [focused, toggleBookmark]
  )
  useCapturingGlobalKeyDownHandler(keyDownHandler)

  return (
    <Wrapper>
      <Icon tabIndex={-1} onClick={openDotsContextMenu}>
        <IconMdi path={mdiDotsVertical} />
      </Icon>
    </Wrapper>
  )
}

export default SideNavigatorDocControls

const Wrapper = styled.div`
  vertical-align: middle;
  display: flex;
  text-align: right;
`

const Icon = styled.button`
  background: none;
  ${baseIconStyle}
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  padding: 0;
  cursor: pointer;
  svg {
    display: inline-block;
    position: relative;
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
    vertical-align: sub !important;
  }
`
