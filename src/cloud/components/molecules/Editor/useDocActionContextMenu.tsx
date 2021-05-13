import React, { useCallback, MouseEvent, useMemo, useState } from 'react'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../shared/lib/stores/contextMenu'
import Icon from '../../../../shared/components/atoms/Icon'
import {
  mdiStarOutline,
  mdiContentCopy,
  mdiOpenInNew,
  mdiPaletteOutline,
  mdiArrowRight,
  mdiStarRemoveOutline,
  mdiFileCodeOutline,
  mdiFilePdfOutline,
  mdiLanguageMarkdownOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import styled from '../../../../shared/lib/styled'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'

import copy from 'copy-to-clipboard'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getDocLinkHref } from '../../atoms/Link/DocLink'
import { boostHubBaseUrl } from '../../../lib/consts'
import {
  usingElectron,
  sendToHost,
  useElectron,
} from '../../../lib/stores/electron'
import { useToast } from '../../../../shared/lib/stores/toast'
import { useSettings } from '../../../lib/stores/settings'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import { defaultPreviewStyle } from '../../atoms/MarkdownView/styles'
import { selectTheme } from '../../../lib/styled'
import { saveDocAsTemplate } from '../../../api/teams/docs/templates'

import {
  exportAsMarkdownFile,
  exportAsHtmlFile,
  convertMarkdownToPdfExportableHtml,
  filenamifyTitle,
} from '../../../lib/export'
import { downloadBlob, printIframe } from '../../../lib/download'
import { useNav } from '../../../lib/stores/nav'
import MoveItemModal from '../../organisms/Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../shared/lib/stores/modal'
export interface DocActionContextMenuParams {
  team: SerializedTeam
  doc: SerializedDocWithBookmark
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  toggleBookmarkForDoc: () => void
}

export function useDocActionContextMenu({
  team,
  doc,
  editorRef,
  toggleBookmarkForDoc,
}: DocActionContextMenuParams) {
  const { popup } = useContextMenu()
  const { updateDocHandler, deleteDocHandler } = useNav()

  const docUrl = useMemo(() => {
    return boostHubBaseUrl + getDocLinkHref(doc, team, 'index')
  }, [team, doc])

  const { settings } = useSettings()
  const { pushMessage, pushApiErrorMessage } = useToast()
  const { convertHtmlStringToPdfBlob } = useElectron()
  const { updateTemplatesMap } = useNav()
  const { openModal } = useModal()

  const getUpdatedDoc = useCallback(() => {
    const updatedDoc = {
      ...doc,
      head: {
        ...(doc.head || { title: '', content: '' }),
      },
    } as SerializedDocWithBookmark

    if (editorRef != null && editorRef.current != null) {
      updatedDoc.head!.content = editorRef.current.getValue()
    }

    return updatedDoc
  }, [doc, editorRef])

  const exportAsMarkdown = useCallback(() => {
    trackEvent(MixpanelActionTrackTypes.ExportMd)
    return exportAsMarkdownFile(getUpdatedDoc(), { includeFrontMatter: true })
  }, [getUpdatedDoc])

  const exportAsHtml = useCallback(() => {
    const previewStyle = defaultPreviewStyle({
      theme: selectTheme(settings['general.theme']),
    })
    try {
      trackEvent(MixpanelActionTrackTypes.ExportHtml)
      exportAsHtmlFile(getUpdatedDoc(), settings, previewStyle)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      pushMessage({
        title: 'Failed to export as HTML',
        description: error.message,
      })
    }
  }, [getUpdatedDoc, settings, pushMessage])

  const exportAsPdf = useCallback(async () => {
    const updatedDoc = getUpdatedDoc()
    if (updatedDoc.head == null) {
      return
    }
    try {
      const previewStyle = defaultPreviewStyle({
        theme: selectTheme(settings['general.theme']),
      })
      const pdfName = `${filenamifyTitle(updatedDoc.title)}.pdf`
      const htmlString = await convertMarkdownToPdfExportableHtml(
        updatedDoc.head.content,
        settings,
        previewStyle
      )
      if (usingElectron) {
        const printOpts = {
          printBackground: true,
          pageSize: 'A4',
        }
        const blob = await convertHtmlStringToPdfBlob(htmlString, printOpts)
        downloadBlob(blob, pdfName)
      } else {
        printIframe(htmlString, pdfName)
      }
      trackEvent(MixpanelActionTrackTypes.ExportPdf)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      pushMessage({
        title: 'Failed to export as PDF',
        description: error.message,
      })
    }
  }, [getUpdatedDoc, settings, pushMessage, convertHtmlStringToPdfBlob])

  const createTemplate = useCallback(async () => {
    try {
      const data = await saveDocAsTemplate(team.id, doc.id)
      updateTemplatesMap([data.template.id, data.template])
    } catch (error) {
      console.error(error)
      pushMessage({
        title: 'Error',
        description: 'Could not save the template',
      })
    }
  }, [team.id, doc.id, updateTemplatesMap, pushMessage])

  const [sendingMove, setSendingMove] = useState(false)

  const moveDoc = useCallback(
    async (
      doc: SerializedDocWithBookmark,
      workspaceId: string,
      parentFolderId?: string
    ) => {
      if (sendingMove) {
        return
      }
      setSendingMove(true)
      try {
        await updateDocHandler(doc, { workspaceId, parentFolderId })
      } catch (error) {
        pushApiErrorMessage(error)
      }
      setSendingMove(false)
    },
    [updateDocHandler, pushApiErrorMessage, sendingMove]
  )

  const openMoveForm = useCallback(() => {
    openModal(
      <MoveItemModal
        onSubmit={(workspaceId, parentFolderId) =>
          moveDoc(doc, workspaceId, parentFolderId)
        }
      />
    )
  }, [doc, openModal, moveDoc])

  const openDeleteDocDialog = useCallback(() => {
    deleteDocHandler(doc)
  }, [deleteDocHandler, doc])

  const open = useCallback(
    (event: MouseEvent) => {
      popup(event, [
        doc.bookmarked
          ? createMenuItem({
              label: 'Remove from Bookmarks',
              iconPath: mdiStarRemoveOutline,
              onClick: toggleBookmarkForDoc,
            })
          : createMenuItem({
              label: 'Add to Bookmarks',
              iconPath: mdiStarOutline,
              onClick: toggleBookmarkForDoc,
            }),
        createMenuItem({
          label: 'Copy Link',
          iconPath: mdiContentCopy,
          onClick: () => {
            copy(docUrl)
          },
        }),
        ...(usingElectron
          ? [
              createMenuItem({
                label: 'Open in Browser',
                iconPath: mdiOpenInNew,
                onClick: () => {
                  sendToHost('open-external-url', docUrl)
                },
              }),
            ]
          : []),
        { type: MenuTypes.Separator },
        createMenuItem({
          label: 'Export as Markdown',
          iconPath: mdiLanguageMarkdownOutline,
          onClick: exportAsMarkdown,
        }),
        createMenuItem({
          label: 'Export as HTML',
          iconPath: mdiFileCodeOutline,
          onClick: exportAsHtml,
        }),
        createMenuItem({
          label: 'Export as PDF',
          iconPath: mdiFilePdfOutline,
          onClick: exportAsPdf,
        }),
        { type: MenuTypes.Separator },
        createMenuItem({
          label: 'Save as Template',
          iconPath: mdiPaletteOutline,
          onClick: createTemplate,
        }),
        createMenuItem({
          label: 'Move to',
          iconPath: mdiArrowRight,
          onClick: openMoveForm,
        }),
        createMenuItem({
          label: 'Delete',
          iconPath: mdiTrashCanOutline,
          onClick: openDeleteDocDialog,
        }),
      ])
    },
    [
      popup,
      doc.bookmarked,
      toggleBookmarkForDoc,
      exportAsMarkdown,
      exportAsHtml,
      exportAsPdf,
      docUrl,
      createTemplate,
      openMoveForm,
      openDeleteDocDialog,
    ]
  )

  return {
    open,
  }
}

interface MenuItemParams {
  label: string
  iconPath: string
  onClick?: () => void
}

function createMenuItem({
  label,
  iconPath,
  onClick,
}: MenuItemParams): MenuItem {
  return {
    type: MenuTypes.Normal,
    label: (
      <MenuItemContainer>
        <Icon className='icon' size={16} path={iconPath} /> {label}
      </MenuItemContainer>
    ),
    onClick,
  }
}

const MenuItemContainer = styled.div`
  display: flex;
  align-items: center;

  .icon {
    margin-right: 4px;
  }
`
