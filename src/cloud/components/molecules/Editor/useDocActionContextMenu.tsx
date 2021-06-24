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
import { selectV2Theme } from '../../../../shared/lib/styled/styleFunctions'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
export interface DocActionContextMenuParams {
  team: SerializedTeam
  doc: SerializedDocWithBookmark
  currentUserIsCoreMember: boolean
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  toggleBookmarkForDoc: () => void
}

export function useDocActionContextMenu({
  team,
  doc,
  currentUserIsCoreMember,
  editorRef,
  toggleBookmarkForDoc,
}: DocActionContextMenuParams) {
  const { t } = useI18n()
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
      theme: selectV2Theme(settings['general.theme']),
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
        theme: selectV2Theme(settings['general.theme']),
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
      const membersRestrictedMenuItems: MenuItem[] = currentUserIsCoreMember
        ? [
            createMenuItem({
              label: t(lngKeys.DocSaveAsTemplate),
              iconPath: mdiPaletteOutline,
              onClick: createTemplate,
            }),
            createMenuItem({
              label: t(lngKeys.Move),
              iconPath: mdiArrowRight,
              onClick: openMoveForm,
            }),
            createMenuItem({
              label: t(lngKeys.GeneralDelete),
              iconPath: mdiTrashCanOutline,
              onClick: openDeleteDocDialog,
            }),
          ]
        : []

      popup(event, [
        doc.bookmarked
          ? createMenuItem({
              label: t(lngKeys.Bookmarked),
              iconPath: mdiStarRemoveOutline,
              onClick: toggleBookmarkForDoc,
            })
          : createMenuItem({
              label: t(lngKeys.BookmarkVerb),
              iconPath: mdiStarOutline,
              onClick: toggleBookmarkForDoc,
            }),
        createMenuItem({
          label: t(lngKeys.CopyLink),
          iconPath: mdiContentCopy,
          onClick: () => {
            copy(docUrl)
          },
        }),
        ...(usingElectron
          ? [
              createMenuItem({
                label: t(lngKeys.OpenInBrowser),
                iconPath: mdiOpenInNew,
                onClick: () => {
                  sendToHost('open-external-url', docUrl)
                },
              }),
            ]
          : []),
        { type: MenuTypes.Separator },
        createMenuItem({
          label: t(lngKeys.DocExportMarkdown),
          iconPath: mdiLanguageMarkdownOutline,
          onClick: exportAsMarkdown,
        }),
        createMenuItem({
          label: t(lngKeys.DocExportHtml),
          iconPath: mdiFileCodeOutline,
          onClick: exportAsHtml,
        }),
        createMenuItem({
          label: t(lngKeys.DocExportPdf),
          iconPath: mdiFilePdfOutline,
          onClick: exportAsPdf,
        }),
        { type: MenuTypes.Separator },
        ...membersRestrictedMenuItems,
      ])
    },
    [
      t,
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
      currentUserIsCoreMember,
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
