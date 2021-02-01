import React, { useCallback, useMemo } from 'react'
import {
  mdiFileCodeOutline,
  mdiLanguageHtml5,
  mdiFilePdfOutline,
} from '@mdi/js'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../../../../../interfaces/db/doc'
import { SerializedTeam } from '../../../../../../interfaces/db/team'
import {
  exportAsMarkdownFile,
  exportAsHtmlFile,
  convertMarkdownToPdfExportableHtml,
  filenamifyTitle,
} from '../../../../../../lib/export'
import { ModalsOptions } from '../../../../../../lib/stores/modal/types'
import { defaultPreviewStyle } from '../../../../../atoms/MarkdownView/styles'
import { useSettings } from '../../../../../../lib/stores/settings'
import { useToast } from '../../../../../../lib/stores/toast'
import { useElectron } from '../../../../../../lib/stores/electron'
import { downloadBlob, printIframe } from '../../../../../../lib/download'
import Icon from '../../../../../atoms/Icon'
import { trackEvent } from '../../../../../../api/track'
import { MixpanelActionTrackTypes } from '../../../../../../interfaces/analytics/mixpanel'
import { selectTheme } from '../../../../../../lib/styled'

interface DocContextMenuProps {
  currentDoc: SerializedDocWithBookmark
  team: SerializedTeam
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  openModal: (
    modalContent: JSX.Element,
    options?: Partial<ModalsOptions>
  ) => void
}

const DynamicExports = ({ currentDoc, editorRef }: DocContextMenuProps) => {
  const { settings } = useSettings()
  const { pushMessage } = useToast()
  const { usingElectron, convertHtmlStringToPdfBlob } = useElectron()

  const updatedDoc = useMemo(() => {
    const updatedDoc = {
      ...currentDoc,
      head: {
        ...(currentDoc.head || { title: '', content: '' }),
      },
    } as SerializedDoc

    if (editorRef != null && editorRef.current != null) {
      updatedDoc.head!.content = editorRef.current.getValue()
    }

    return updatedDoc
  }, [currentDoc, editorRef])

  const onMarkdownExport = useCallback(() => {
    trackEvent(MixpanelActionTrackTypes.ExportMd)
    return exportAsMarkdownFile(updatedDoc, { includeFrontMatter: true })
  }, [updatedDoc])

  const exportAsHtml = useCallback(() => {
    const previewStyle = defaultPreviewStyle({
      theme: selectTheme(settings['general.theme']),
    })
    try {
      trackEvent(MixpanelActionTrackTypes.ExportHtml)
      exportAsHtmlFile(updatedDoc, settings, previewStyle)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      pushMessage({
        title: 'Failed to export as HTML',
        description: error.message,
      })
    }
  }, [updatedDoc, settings, pushMessage])

  const exportAsPdf = useCallback(async () => {
    if (updatedDoc.head == null) {
      return
    }
    try {
      const previewStyle = defaultPreviewStyle({
        theme: selectTheme(settings['general.theme']),
      })
      const pdfName = `${filenamifyTitle(updatedDoc.head.title)}.pdf`
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
  }, [
    updatedDoc,
    settings,
    pushMessage,
    usingElectron,
    convertHtmlStringToPdfBlob,
  ])

  return (
    <>
      <button
        className='context__row context__button'
        id='dc-context-top-markdownexport'
        onClick={onMarkdownExport}
      >
        <Icon path={mdiFileCodeOutline} size={18} className='context__icon' />
        <span>Markdown export</span>
      </button>
      <button
        className='context__row context__button'
        id='dc-context-top-htmlexport'
        onClick={exportAsHtml}
      >
        <Icon path={mdiLanguageHtml5} size={18} className='context__icon' />
        <span>HTML export</span>
      </button>
      <button
        className='context__row context__button'
        id='dc-context-top-pdfexport'
        onClick={exportAsPdf}
      >
        <Icon path={mdiFilePdfOutline} size={18} className='context__icon' />
        <span>Print (Save as PDF)</span>
      </button>
    </>
  )
}

export default DynamicExports
