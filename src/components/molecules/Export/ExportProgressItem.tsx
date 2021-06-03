import React, { useCallback, useRef, useState } from 'react'
import ProgressBar from '../../atoms/ProgressBar'
import { usePreferences } from '../../../lib/preferences'
import { usePreviewStyle } from '../../../lib/preview'
import {
  getPathByName,
  mkdir,
  openPath,
  showOpenDialog,
  writeFile,
} from '../../../lib/electronOnly'
import {
  convertNoteDocToMarkdownString,
  convertNoteDocToPdfBuffer,
  exportNoteAsHtmlFile,
  getValidNoteTitle,
} from '../../../lib/exports'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../../lib/db'
import { useEffectOnce, useSetState } from 'react-use'
import {
  AllDocsMap,
  Attachment,
  FolderDoc,
  NoteDoc,
  ObjectMap,
} from '../../../lib/db/types'
import { entries, keys, values } from '../../../lib/db/utils'
import { join } from 'path'
import { filenamify } from '../../../lib/string'
import { useToast } from '../../../shared/lib/stores/toast'
import styled from '../../../shared/lib/styled'
import { border } from '../../../shared/lib/styled/styleFunctions'

export interface ExportProcedureData {
  folderName: string
  folderPathname: string
  exportType: string
  recursive: boolean
  exportingStorage: boolean
  exportLocation?: string
}

interface ExportProgressItemProps {
  workspaceId: string
  exportProcedureData: ExportProcedureData
  onFinish: () => void
}

interface ExportOperationState {
  exportOperation: string
  exportSubOperationTitle: string
  exportSubOperationContent: string
  exportProgressValue: number
}

const exportProgressMaxValue = 100
function convertValueToPercentage(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Value '${value}' cannot be converted to percentage.`)
  }
  return Math.floor(value * 100)
}

const ExportProgressItem = ({
  workspaceId,
  exportProcedureData,
  onFinish,
}: ExportProgressItemProps) => {
  const { preferences } = usePreferences()
  const includeFrontMatter = preferences['markdown.includeFrontMatter']
  const { previewStyle } = usePreviewStyle()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const { storageMap } = useDb()

  const [showExportProgress, setShowExportProgress] = useState(false)
  const [exportErrors, setExportErrors] = useState<string[]>([])
  const [exportState, setExportState] = useSetState<ExportOperationState>({
    exportOperation: '',
    exportSubOperationTitle: '',
    exportSubOperationContent: '',
    exportProgressValue: 0,
  })
  const canceledRef = useRef<boolean>(false)

  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const openDialog = useCallback(async () => {
    if (dialogIsOpen) {
      return
    }
    setDialogIsOpen(true)
    try {
      const result = await showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: t('folder.select'),
        defaultPath: getPathByName('home'),
      })
      if (result.canceled) {
        return
      }
      if (result.filePaths == null) {
        return
      }

      return result.filePaths[0]
    } catch (error) {
      throw error
    } finally {
      setDialogIsOpen(false)
    }
  }, [dialogIsOpen, t])

  const resetExportingStates = useCallback(() => {
    setShowExportProgress(false)
    setExportState({
      exportOperation: '',
      exportSubOperationTitle: '',
      exportSubOperationContent: '',
      exportProgressValue: 0,
    })
    setExportErrors([])
  }, [setExportState])

  const addExportError = useCallback((error: string) => {
    setExportErrors((state) => [...state, error])
  }, [])

  const cancelExporting = useCallback(() => {
    canceledRef.current = true
    resetExportingStates()
  }, [resetExportingStates])

  const isExportingCanceled = useCallback(() => {
    return canceledRef.current
  }, [])

  const createExportDirectories = useCallback(
    async (folderMap: ObjectMap<FolderDoc>, rootDir: string) => {
      for (const folderPath of keys(folderMap)) {
        if (isExportingCanceled()) {
          return
        }

        if (folderPath == '/' && !exportProcedureData.exportingStorage) {
          continue
        }

        if (!exportProcedureData.exportingStorage) {
          if (
            exportProcedureData.recursive &&
            folderPath != exportProcedureData.folderPathname &&
            !folderPath.startsWith(exportProcedureData.folderPathname + '/')
          ) {
            continue
          }
          if (
            !exportProcedureData.recursive &&
            folderPath != exportProcedureData.folderPathname
          ) {
            continue
          }
        }

        const fullPath = join(
          rootDir,
          folderPath.substring(
            folderPath.indexOf(exportProcedureData.folderName)
          )
        )

        setExportState({
          exportSubOperationTitle: `Creating directory: ${fullPath.replace(
            rootDir,
            '.'
          )}`,
        })
        await mkdir(fullPath)
      }
    },
    [
      exportProcedureData.exportingStorage,
      exportProcedureData.folderName,
      exportProcedureData.folderPathname,
      exportProcedureData.recursive,
      isExportingCanceled,
      setExportState,
    ]
  )

  const getNotesForExport = useCallback(
    (noteMap: ObjectMap<NoteDoc>): NoteDoc[] => {
      if (exportProcedureData.exportingStorage) {
        return values(noteMap)
      }

      const notesToExport: NoteDoc[] = []
      for (const [, noteDoc] of entries(noteMap)) {
        if (noteDoc.trashed) {
          continue
        }
        if (
          exportProcedureData.recursive &&
          noteDoc.folderPathname != exportProcedureData.folderPathname &&
          !noteDoc.folderPathname.startsWith(
            exportProcedureData.folderPathname + '/'
          )
        ) {
          continue
        }
        if (
          !exportProcedureData.recursive &&
          noteDoc.folderPathname != exportProcedureData.folderPathname
        ) {
          continue
        }

        notesToExport.push(noteDoc)
      }
      return notesToExport
    },
    [
      exportProcedureData.exportingStorage,
      exportProcedureData.folderPathname,
      exportProcedureData.recursive,
    ]
  )

  const exportNotes = useCallback(
    async (
      noteMap: ObjectMap<NoteDoc>,
      attachmentMap: ObjectMap<Attachment>,
      rootDir: string
    ): Promise<number> => {
      const notesToExport: NoteDoc[] = getNotesForExport(noteMap)

      let exportingNoteIndex = 0
      for (const noteDoc of notesToExport) {
        if (isExportingCanceled()) {
          return exportingNoteIndex
        }

        const noteExportFolder = exportProcedureData.recursive
          ? noteDoc.folderPathname.substring(
              exportProcedureData.folderPathname.indexOf(
                exportProcedureData.folderName
              )
            )
          : exportProcedureData.folderName

        const exportNoteFilenameWithoutExtension = `${filenamify(
          getValidNoteTitle(noteDoc)
        )}`
        const exportNotePathname = join(
          join(rootDir, noteExportFolder),
          `${exportNoteFilenameWithoutExtension}.${exportProcedureData.exportType}`
        )
        setExportState({
          exportProgressValue: convertValueToPercentage(
            exportingNoteIndex / notesToExport.length
          ),
          exportSubOperationTitle: `Exporting note: ${
            noteDoc.title ? noteDoc.title : 'No title'
          } (${exportingNoteIndex}/${notesToExport.length})`,
          exportSubOperationContent: `Location: ${exportNotePathname.replace(
            rootDir,
            '.'
          )}`,
        })

        switch (exportProcedureData.exportType) {
          case 'html':
            await exportNoteAsHtmlFile(
              join(rootDir, noteExportFolder),
              exportNoteFilenameWithoutExtension,
              noteDoc as NoteDoc,
              preferences['markdown.codeBlockTheme'],
              preferences['general.theme'],
              pushMessage,
              attachmentMap,
              previewStyle,
              true
            ).catch((err) => {
              addExportError(
                `Cannot export: '${exportNotePathname.substring(
                  exportNotePathname.lastIndexOf('/')
                )}', reason: ${err}`
              )
            })
            break
          case 'md':
            const mdString = await convertNoteDocToMarkdownString(
              noteDoc as NoteDoc,
              includeFrontMatter
            )
            try {
              await writeFile(exportNotePathname, mdString)
            } catch (err) {
              addExportError(
                `Cannot export: '${exportNotePathname.substring(
                  exportNotePathname.lastIndexOf('/')
                )}', reason: ${err}`
              )
            }
            break
          case 'pdf':
          default:
            try {
              const pdfBuffer = await convertNoteDocToPdfBuffer(
                noteDoc as NoteDoc,
                preferences['markdown.codeBlockTheme'],
                preferences['general.theme'],
                pushMessage,
                attachmentMap,
                preferences['export.printOptions'],
                previewStyle
              )
              await writeFile(exportNotePathname, pdfBuffer)
            } catch (err) {
              addExportError(
                `Cannot export: '${exportNotePathname.substring(
                  exportNotePathname.lastIndexOf('/')
                )}', reason: ${err}`
              )
            }
            break
        }
        exportingNoteIndex++
      }

      return exportingNoteIndex
    },
    [
      getNotesForExport,
      isExportingCanceled,
      exportProcedureData.recursive,
      exportProcedureData.folderPathname,
      exportProcedureData.folderName,
      exportProcedureData.exportType,
      setExportState,
      preferences,
      pushMessage,
      previewStyle,
      includeFrontMatter,
      addExportError,
    ]
  )

  const startExportingNotes = useCallback(async () => {
    const savePathname =
      exportProcedureData.exportLocation != null &&
      exportProcedureData.exportLocation != ''
        ? exportProcedureData.exportLocation
        : await openDialog()
    if (!savePathname) {
      return
    }

    const storage = storageMap[workspaceId]
    if (!storage) {
      pushMessage({
        title: 'Cannot find workspace',
        description: 'Please check workspace exists and try again later.',
      })
      console.warn('Workspace ID cannot be found: ' + workspaceId)
      return
    }

    setShowExportProgress(true)
    try {
      const rootDir = exportProcedureData.exportingStorage
        ? join(savePathname, storage.name)
        : savePathname
      const allDocsMap: AllDocsMap = await storage.db.getAllDocsMap()
      const { noteMap, folderMap } = allDocsMap

      setExportState({ exportOperation: 'Creating directories' })
      try {
        if (exportProcedureData.recursive) {
          await createExportDirectories(folderMap, rootDir)
        } else {
          await mkdir(join(rootDir, exportProcedureData.folderName))
        }
      } catch (err) {
        addExportError('Cannot make directories: ' + err)
        console.warn('Please check write access for destination directories: ')
      }

      if (exportErrors.length === 0) {
        setExportState({ exportOperation: 'Exporting notes' })

        try {
          const exportedNotesCount = await exportNotes(
            noteMap,
            storage.attachmentMap,
            rootDir
          )
          if (isExportingCanceled()) {
            pushMessage({
              title: 'Export canceled',
              description: `Exported ${exportedNotesCount} notes.`,
            })
          } else {
            pushMessage({
              onClick: () => {
                if (rootDir) {
                  openPath(rootDir)
                }
              },
              type: 'success',
              title: 'Export finished',
              description: `Exported ${exportedNotesCount} notes successfully.`,
            })
          }
        } catch (err) {
          addExportError('Exporting notes error: ' + err)
          console.warn('Unknown failure while exporting notes, reason: ' + err)
        }
      }

      if (exportErrors.length > 0) {
        pushMessage({
          title: 'Export errors',
          description: `Status: [${exportErrors.join(', ')}].`,
        })
        console.warn('Errors during export: ', exportErrors)
      }
    } catch (error) {
      pushMessage({
        title: 'Export failed',
        description: 'Reason: ' + error,
      })
      console.warn('Export failed with: ', error)
      console.warn('Errors during export: ', exportErrors)
    }
  }, [
    exportProcedureData.exportLocation,
    exportProcedureData.exportingStorage,
    exportProcedureData.recursive,
    exportProcedureData.folderName,
    openDialog,
    storageMap,
    workspaceId,
    pushMessage,
    setExportState,
    exportErrors,
    createExportDirectories,
    addExportError,
    exportNotes,
    isExportingCanceled,
  ])

  useEffectOnce(() => {
    startExportingNotes().finally(onFinish)
  })

  return (
    <ExportProgressBarItem>
      {showExportProgress && (
        <ProgressContainerItem className='progressContainer'>
          <ExportInfoItem>
            <OperationInfoItem
              title={exportState.exportOperation}
              content={exportState.exportOperation}
            />
            {exportState.exportSubOperationTitle && (
              <SubOperationInfoItem
                title={exportState.exportSubOperationTitle}
                content={exportState.exportSubOperationTitle}
              />
            )}
            {exportState.exportSubOperationContent && (
              <SubOperationInfoItem
                title={exportState.exportSubOperationContent}
                content={exportState.exportSubOperationContent}
              />
            )}
          </ExportInfoItem>
          <ProgressStatusContainer>
            <ProgressBar
              className='batchExportProgressStyle'
              progress={exportState.exportProgressValue}
            />
            <Button onClick={cancelExporting}>
              {exportState.exportProgressValue == exportProgressMaxValue
                ? 'Ok'
                : 'Cancel'}
            </Button>
          </ProgressStatusContainer>
        </ProgressContainerItem>
      )}
      {showExportProgress && <DimBackground />}
    </ExportProgressBarItem>
  )
}

const ExportInfoItem = styled.div`
  margin-bottom: 1em;
  max-width: 600px;
`

const OperationInfoItem = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 750px;
  &:before {
    content: attr(content);
  }
`

const SubOperationInfoItem = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 750px;
  word-wrap: break-word;

  &:before {
    content: attr(content);
  }
`

const ProgressStatusContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;

  & > .batchExportProgressStyle {
    margin-right: 5px;
    margin-top: 8px;
    margin-bottom: 0;
  }
`

const Button = styled.button`
  align-self: flex-end;

  background-color: black;
  color: white;
  height: 25px;
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  border: none;

  min-width: 60px;
`

const ProgressContainerItem = styled.div`
  width: 600px;
  position: absolute;
  left: 50%;
  margin-left: -240px;
  margin-top: 300px;

  background-color: ${({ theme }) => theme.colors.background.primary};
  max-width: 750px;
  max-height: 480px;
  z-index: 6002;
  ${border};
  border-radius: 10px;
  padding: 10px;

  progress[value] {
    /* Reset the default appearance */
    -webkit-appearance: none;
    appearance: none;
    height: 15px;
  }

  progress[value]::-webkit-progress-bar {
    border-radius: 2px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
  }

  progress[value]::-webkit-progress-value {
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    border-radius: 2px;
  }
`

const ExportProgressBarItem = styled.div`
  z-index: 6000;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

const DimBackground = styled.div`
  position: absolute;
  z-index: 6001;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
`

export default ExportProgressItem
