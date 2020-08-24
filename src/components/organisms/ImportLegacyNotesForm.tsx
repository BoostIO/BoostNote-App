import React, { useState, useCallback, ChangeEvent } from 'react'
import {
  FormGroup,
  FormPrimaryButton,
  FormSecondaryButton,
  FormBlockquote,
  FormCheckItem,
  FormLabel,
  FormTextInput,
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
import { NoteDocEditibleProps } from '../../lib/db/types'
import { isFolderPathnameValid } from '../../lib/db/utils'
import { useDb } from '../../lib/db'
import { JsonObject } from 'type-fest'

interface ImportLegacyNotesFormProps {
  storageId: string
  onCancel: () => void
}

const ImportLegacyNotesForm = ({
  storageId,
  onCancel,
}: ImportLegacyNotesFormProps) => {
  const [location, setLocation] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [convertingSnippetNotes, setConvertingSnippetNotes] = useState(true)
  const [destinationFolderPathname, setDestinationFolderPathname] = useState(
    '/imported'
  )
  const [importing, setImporting] = useState(false)
  const { addAttachments, createFolder, createNote } = useDb()

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
            return [folder.key, folder.name]
          }
        )
      )

      const noteFileNames = await readdir(join(location, 'notes'))
      const parsedNotes: [string, JsonObject | null][] = await Promise.all(
        noteFileNames.map(async (noteFileName) => {
          const noteFilePathname = join(location, 'notes', noteFileName)
          const rawCson = await readFileAsString(noteFilePathname)
          try {
            const noteCson = parseCSON(rawCson)
            return [noteFileName, noteCson] as [string, JsonObject]
          } catch (error) {
            console.error(`Failed to parse ${noteFilePathname}`)
            console.error(error)
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
                  const result = await readFile(
                    join(noteAttachmentsFolderPathname, fileName)
                  )

                  const file = await convertBufferToFile(result, fileName)

                  const [attachment] = await addAttachments(storageId, [file])

                  attachmentNameTupleList.push([fileName, attachment.name])
                })
              )

              let content = normalizeString(note.content)
              for (const [originalName, newName] of attachmentNameTupleList) {
                content = content.replace(
                  `:storage/${legacyNoteId}/${originalName}`,
                  newName
                )
              }

              const noteProps: NoteDocEditibleProps = {
                folderPathname,
                title,
                content,
                tags,
                data,
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

              const noteProps: NoteDocEditibleProps = {
                folderPathname,
                title,
                content,
                tags,
                data,
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
        <FormSecondaryButton onClick={onCancel}>Cancel</FormSecondaryButton>
      </FormGroup>
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
