import React, { useState, useCallback, ChangeEvent } from 'react'
import {
  FormGroup,
  FormPrimaryButton,
  FormSecondaryButton,
  FormBlockquote,
  FormCheckItem,
  FormLabel,
  FormTextInput,
  FormHeading,
} from '../atoms/form'
import FormFolderSelector from '../atoms/FormFolderSelector'
import {
  stat,
  readFile,
  readFileAsString,
  readdir,
  parseCSON,
  readFileTypeFromBuffer,
} from '../../lib/electronOnly'
import { join } from 'path'
import { NoteDocImportableProps } from '../../lib/db/types'
import { isFolderPathnameValid } from '../../lib/db/utils'
import { useDb } from '../../lib/db'
import { JsonObject } from 'type-fest'
import { filenamify } from '../../lib/string'

interface ImportLegacyNotesFormProps {
  storageId: string
}

const ImportLegacyNotesForm = ({ storageId }: ImportLegacyNotesFormProps) => {
  const { addAttachments, createFolder, createNote, initialize } = useDb()

  const [location, setLocation] = useState('')
  const [opened, setOpened] = useState(false)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [convertingSnippetNotes, setConvertingSnippetNotes] = useState(true)
  const [destinationFolderPathname, setDestinationFolderPathname] = useState(
    '/imported'
  )
  const [importing, setImporting] = useState(false)
  const openForm = useCallback(() => {
    setOpened(true)
    setDoneMessage(null)
    setErrorMessage(null)
    setConvertingSnippetNotes(true)
    setDestinationFolderPathname('/imported')
  }, [])

  const closeForm = useCallback(() => {
    setOpened(false)
  }, [])

  const importNotes = useCallback(async () => {
    if (importing) {
      return
    }
    setImporting(true)
    try {
      if (!isFolderPathnameValid(destinationFolderPathname)) {
        throw new Error('Destination folder pathname is not valid.')
      }
      const folderStat = await stat(location)
      if (!folderStat.isDirectory()) {
        throw new Error(`\`${location}\` is not a folder.`)
      }
      const boostnoteJsonPathname = join(location, 'boostnote.json')
      const jsonRaw = await readFileAsString(boostnoteJsonPathname)
      const legacyStorageConfig = JSON.parse(jsonRaw)
      const folderMap = new Map<string, string>(
        legacyStorageConfig.folders.map(
          (folder: { key: string; name: string; color: string }) => {
            return [folder.key, filenamify(folder.name)]
          }
        )
      )

      const noteFileNames = (
        await readdir(join(location, 'notes'))
      ).filter((fileName) => fileName.match(/\.cson$/))

      const invalidCsonFilePathnames: string[] = []
      const parsedNotes: [string, JsonObject | null][] = await Promise.all(
        noteFileNames.map(async (noteFileName) => {
          const noteFilePathname = join(location, 'notes', noteFileName)
          try {
            const rawCson = await readFileAsString(noteFilePathname)
            const noteCson = parseCSON(rawCson)
            return [noteFileName, noteCson] as [string, JsonObject]
          } catch (error) {
            console.warn(`Failed to parse ${noteFilePathname}`)
            console.warn(error)
            invalidCsonFilePathnames.push(noteFilePathname)
            return [noteFileName, null] as [string, null]
          }
        })
      )

      const attachmentsFolderPathname = join(location, 'attachments')
      const convertedNotes = await Promise.all(
        parsedNotes.map(async ([noteFileName, note]) => {
          if (note == null) {
            return null
          }
          const folderName = folderMap.get(note.folder as string) || ''
          const folderPathname =
            folderName.trim().length > 0
              ? join(destinationFolderPathname, folderName)
              : destinationFolderPathname
          const title = normalizeString(note.title)
          const tags = normalizeTags(note.tags)
          const data = {}
          const createdAt = normalizeString(note.createdAt)
          const updatedAt = normalizeString(note.updatedAt)
          switch (note.type) {
            case 'MARKDOWN_NOTE': {
              const legacyNoteId = noteFileName.replace(/.cson$/, '')

              const noteAttachmentsFolderPathname = join(
                attachmentsFolderPathname,
                legacyNoteId
              )
              const attachmentFileNames = await readdirOrEmpty(
                noteAttachmentsFolderPathname
              )

              const attachmentNameTupleList: [string, string][] = []
              await Promise.all(
                attachmentFileNames.map(async (fileName) => {
                  const attachmentPathname = join(
                    noteAttachmentsFolderPathname,
                    fileName
                  )
                  try {
                    const result = await readFile(attachmentPathname)

                    const file = await convertBufferToFile(result, fileName)

                    const [attachment] = await addAttachments(storageId, [file])

                    attachmentNameTupleList.push([fileName, attachment.name])
                  } catch (error) {
                    switch (error.code) {
                      case 'EISDIR':
                        break
                      default:
                        console.warn(
                          `Failed to add ${attachmentPathname} attachment`
                        )
                    }
                  }
                })
              )

              let content = normalizeString(note.content)
              for (const [originalName, newName] of attachmentNameTupleList) {
                content = content.replace(
                  `:storage/${legacyNoteId}/${originalName}`,
                  newName
                )
                content = content.replace(
                  `:storage\\${legacyNoteId}\\${originalName}`,
                  newName
                )
              }

              const noteProps: NoteDocImportableProps = {
                folderPathname,
                title,
                content,
                tags,
                data,
                createdAt,
                updatedAt,
              }
              return noteProps
            }
            case 'SNIPPET_NOTE': {
              if (!convertingSnippetNotes) {
                return null
              }

              const description =
                typeof note.description === 'string'
                  ? note.description + '\n\n'
                  : ''
              const content = `${description}${normalizeArray(note.snippets)
                .map(stringifySnippet)
                .join('\n\n')}`

              const noteProps: NoteDocImportableProps = {
                folderPathname,
                title,
                content,
                tags,
                data,
                createdAt,
                updatedAt,
              }
              return noteProps
            }
            default:
              return null
          }
        })
      )
      for (const [, folderName] of folderMap) {
        await createFolder(
          storageId,
          join(destinationFolderPathname, folderName)
        )
      }

      for (const note of convertedNotes) {
        if (note == null) {
          continue
        }
        await createNote(storageId, note)
      }

      setDoneMessage(
        `The notes are imported to ${destinationFolderPathname}${
          invalidCsonFilePathnames.length > 0
            ? ` (${invalidCsonFilePathnames.length} invalid file(s). Please check console in developer tool to know more)`
            : ''
        }`
      )
      initialize().then(() => {
        setOpened(false)
      })
    } catch (error) {
      setErrorMessage(error.message)
      console.error(error)
    }
    setImporting(false)
  }, [
    destinationFolderPathname,
    location,
    convertingSnippetNotes,
    storageId,
    addAttachments,
    createFolder,
    createNote,
    importing,
    initialize,
  ])

  const updateConvertingSnippetNotes = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setConvertingSnippetNotes(event.target.checked)
    },
    []
  )

  const updateDestinationFolderPathname = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDestinationFolderPathname(event.target.value)
    },
    []
  )

  return (
    <>
      <FormHeading depth={2}>Import Notes from Legacy BoostNote</FormHeading>
      {opened ? (
        <>
          {errorMessage != null && (
            <FormBlockquote variant='danger'>{errorMessage}</FormBlockquote>
          )}
          <FormGroup>
            <FormLabel>Legacy Storage Location</FormLabel>
            <FormFolderSelector value={location} setValue={setLocation} />
          </FormGroup>
          <FormGroup>
            <FormLabel>Destination Folder</FormLabel>
            <FormTextInput
              value={destinationFolderPathname}
              onChange={updateDestinationFolderPathname}
            />
          </FormGroup>
          <FormGroup>
            <FormCheckItem
              id='convertingSnippetNotes-checkbox'
              type='checkbox'
              checked={convertingSnippetNotes}
              onChange={updateConvertingSnippetNotes}
            >
              Converting snippet notes
            </FormCheckItem>
          </FormGroup>
          <FormGroup>
            <FormPrimaryButton onClick={importNotes}>Import</FormPrimaryButton>
            <FormSecondaryButton onClick={closeForm}>
              Cancel
            </FormSecondaryButton>
          </FormGroup>
        </>
      ) : (
        <FormGroup>
          {doneMessage != null && (
            <FormBlockquote variant='primary'>{doneMessage}</FormBlockquote>
          )}
          <FormSecondaryButton onClick={openForm}>Import</FormSecondaryButton>
        </FormGroup>
      )}
    </>
  )
}

export default ImportLegacyNotesForm

function stringifySnippet(snippet: any) {
  const description = normalizeString(snippet.description)
  const mode = normalizeString(snippet.mode)
  const content = normalizeString(snippet.content)
  return [description, '', '```' + mode, content, '```'].join('\n')
}

function normalizeString(value: any) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
}

function normalizeArray(value: any) {
  if (!Array.isArray(value)) {
    return []
  }
  return value
}

function normalizeTags(value: any) {
  if (!Array.isArray(value)) {
    return []
  }
  return value.reduce<string[]>((normalizedArray, item) => {
    if (typeof item === 'string' && item.trim().length > 0) {
      normalizedArray.push(item.trim())
    }
    return normalizedArray
  }, [])
}

async function readdirOrEmpty(pathname: string) {
  try {
    return await readdir(pathname)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function convertBufferToFile(
  value: Buffer | string,
  fileName: string
): Promise<File> {
  if (!Buffer.isBuffer(value)) {
    value = Buffer.from(value)
  }

  const type = await readFileTypeFromBuffer(value)

  return new File([value.buffer], fileName, {
    type,
  })
}
