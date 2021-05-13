import React, { useCallback, MouseEvent, useMemo } from 'react'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../shared/lib/stores/contextMenu'
import Icon from '../../../../shared/components/atoms/Icon'
import {
  mdiStarOutline,
  mdiEarth,
  mdiAccountMultiplePlus,
  mdiContentCopy,
  mdiOpenInNew,
  mdiPaletteOutline,
  mdiArrowRight,
  mdiArchiveOutline,
  mdiStarRemoveOutline,
  mdiEarthRemove,
  mdiFileCodeOutline,
  mdiFilePdfOutline,
  mdiLanguageMarkdownOutline,
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

import {
  exportAsMarkdownFile,
  exportAsHtmlFile,
  convertMarkdownToPdfExportableHtml,
  filenamifyTitle,
} from '../../../lib/export'
import { downloadBlob, printIframe } from '../../../lib/download'
export interface DocActionContextMenuParams {
  team: SerializedTeam
  doc: SerializedDocWithBookmark
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  toggleBookmarkForDoc: () => void
  togglePublicSharing: () => void
  openGuestsModal: () => void
}

export function useDocActionContextMenu({
  team,
  doc,
  editorRef,
  toggleBookmarkForDoc,
  togglePublicSharing,
  openGuestsModal,
}: DocActionContextMenuParams) {
  const { popup } = useContextMenu()

  const docUrl = useMemo(() => {
    return boostHubBaseUrl + getDocLinkHref(doc, team, 'index')
  }, [team, doc])

  const { settings } = useSettings()
  const { pushMessage } = useToast()
  const { convertHtmlStringToPdfBlob } = useElectron()

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
        doc.shareLink == null
          ? createMenuItem({
              label: 'Share to Web',
              iconPath: mdiEarth,
              onClick: togglePublicSharing,
            })
          : createMenuItem({
              label: 'Stop Sharing to Web',
              iconPath: mdiEarthRemove,
              onClick: togglePublicSharing,
            }),
        createMenuItem({
          label: 'Invite Guest',
          iconPath: mdiAccountMultiplePlus,
          onClick: openGuestsModal,
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
        createMenuItem({
          label: 'Save as Template',
          iconPath: mdiPaletteOutline,
        }),
        createMenuItem({
          label: 'Move to',
          iconPath: mdiArrowRight,
        }),
        createMenuItem({
          label: 'Archive',
          iconPath: mdiArchiveOutline,
        }),
      ])
    },
    [
      popup,
      doc.bookmarked,
      doc.shareLink,
      toggleBookmarkForDoc,
      togglePublicSharing,
      openGuestsModal,
      exportAsMarkdown,
      exportAsHtml,
      exportAsPdf,
      docUrl,
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
