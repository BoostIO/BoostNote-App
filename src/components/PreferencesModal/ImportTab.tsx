import React, { useState, useMemo, useCallback } from 'react'
import {
  Section,
  SectionHeader,
  SectionControl,
  SectionSelect,
  SectionPrimaryButton,
  SectionHeader2
} from './styled'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import FileDropZone from '../atoms/FileDropZone'
import {
  convertCSONFileToNote,
  ParsedNote,
  ParseErrors
} from '../../lib/legacy-import'
import styled from '../../lib/styled'
import {
  secondaryBackgroundColor,
  border,
  textColor
} from '../../lib/styled/styleFunctions'
import { useToast } from '../../lib/toast'
import { useTranslation } from 'react-i18next'

interface Success {
  err: false
  note: ParsedNote
}

interface Failure {
  err: true
  filename: string
  type: ParseErrors
}

type FileImport = Failure | Success

const StyledDropZone = styled.div`
  width: 80%;
  height: 150px;
  ${textColor}
  &.active {
    ${border}
  }
  ${secondaryBackgroundColor}
  overflow-y: scroll;
`

const StyledRemove = styled.span`
  padding-left: 1em;
  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }) => theme.primaryColor};
`

export default () => {
  const { t } = useTranslation()
  const { pushMessage } = useToast()
  const { storageMap, createNote } = useDb()
  const storageEntries = useMemo(() => entries(storageMap), [storageMap])
  const [activeStorage, setActiveStorage] = useState(() => {
    if (storageEntries.length < 1) {
      return
    }
    return storageEntries[0][1]
  })
  const folderEntries = useMemo(() => {
    return activeStorage != null ? entries(activeStorage.folderMap) : []
  }, [activeStorage])
  const [activeFolder, setActiveFolder] = useState(() => {
    return folderEntries.length > 0 ? folderEntries[0][1] : undefined
  })
  const [fileImports, setFileImports] = useState<Map<string, FileImport>>(
    new Map()
  )
  const importEntries = useMemo(() => [...fileImports.entries()], [fileImports])
  const [dragInside, setDragInside] = useState(false)

  const setActiveStorageCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setActiveStorage(storageMap[e.target.value])
    },
    [setActiveStorage, storageMap]
  )

  const setActiveFolderCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeStorage == null) {
        return
      }
      setActiveFolder(activeStorage.folderMap[e.target.value])
    },
    [setActiveFolder, activeStorage]
  )

  const uploadCallback = useCallback(async () => {
    if (activeFolder == null || activeStorage == null) {
      return
    }

    const created = await Promise.all(
      importEntries
        .map(([, entry]) => entry)
        .filter(({ err }) => !err)
        .map(entry =>
          createNote(activeStorage.id, {
            folderPathname: activeFolder.pathname,
            ...(entry as Success).note
          })
        )
    )

    const title = `Successfully imported ${created.length} notes`
    const description = created
      .map(note => (note == null ? '' : note.title))
      .join('\n')

    pushMessage({ title, description })

    setFileImports(new Map())
  }, [
    createNote,
    activeStorage,
    activeFolder,
    importEntries,
    setFileImports,
    pushMessage
  ])

  const draggedInCallback = useCallback(() => setDragInside(true), [
    setDragInside
  ])
  const draggedOutCallback = useCallback(() => setDragInside(false), [
    setDragInside
  ])

  const fileDropCallback = useCallback(
    (files: File[]) => {
      setDragInside(false)
      files.forEach(async file => {
        const result = await convertCSONFileToNote(file)
        if (!result.err) {
          setFileImports(
            new Map(
              fileImports.set(file.name, { err: false, note: result.data })
            )
          )
        } else {
          setFileImports(
            new Map(
              fileImports.set(file.name, {
                err: true,
                filename: file.name,
                type: result.data
              })
            )
          )
        }
      })
    },
    [setFileImports, fileImports, setDragInside]
  )

  const importRemoveCallback = (id: string) => {
    fileImports.delete(id)
    setFileImports(new Map(fileImports))
  }

  return (
    <Section>
      <SectionHeader>{t('preferences.import')}</SectionHeader>
      <p>{t('preferences.description')}</p>
      <p>{t('preferences.importFlow1')}</p>
      <p>{t('preferences.importFlow2')}</p>
      <p>{t('preferences.importFlow3')}</p>
      <p>{t('preferences.importFlow4')}</p>
      <SectionControl>
        <StyledDropZone className={dragInside ? 'active' : ''}>
          <FileDropZone
            style={{ width: '100%', height: '100%' }}
            onDrop={fileDropCallback}
            onDragEnter={draggedInCallback}
            onDragLeave={draggedOutCallback}
          >
            <ul style={{ listStyle: 'none' }}>
              {importEntries.map(([id, entry]) => {
                return (
                  <li key={id}>
                    {entry.err
                      ? `Invalid File: ${entry.filename}`
                      : `Ready to import: ${entry.note.title}`}
                    <StyledRemove onClick={() => importRemoveCallback(id)}>
                      {t('preferences.importRemove')}
                    </StyledRemove>
                  </li>
                )
              })}
            </ul>
          </FileDropZone>
        </StyledDropZone>
      </SectionControl>
      <SectionControl>
        <label>
          <SectionHeader2>Storage:</SectionHeader2>
          <SectionSelect onChange={setActiveStorageCallback}>
            {storageEntries.map(([id, { name }]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </SectionSelect>
        </label>
      </SectionControl>
      <SectionControl>
        <label>
          <SectionHeader2>Folder:</SectionHeader2>
          <SectionSelect onClick={setActiveFolderCallback}>
            {folderEntries.map(([id, { pathname }]) => (
              <option key={id} value={id}>
                {pathname}
              </option>
            ))}
          </SectionSelect>
        </label>
      </SectionControl>
      <SectionPrimaryButton onClick={uploadCallback}>
        {t('preferences.importUpload')}
      </SectionPrimaryButton>
    </Section>
  )
}
