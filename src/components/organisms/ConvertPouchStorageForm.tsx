import React, { useState, useCallback, ChangeEvent } from 'react'
import {
  FormTextInput,
  FormGroup,
  FormLabel,
  FormPrimaryButton,
  FormBlockquote,
  FormSecondaryButton,
  FormHeading,
} from '../atoms/form'
import FormFolderSelector from '../atoms/FormFolderSelector'
import { useDb } from '../../lib/db'
import { excludeNoteIdPrefix } from '../../lib/db/utils'
import { join } from 'path'
import { writeFile, prepareDirectory } from '../../lib/electronOnly'
import { entries } from '../../lib/db/utils'
import { useRouter } from '../../lib/router'
import { usePreferences } from '../../lib/preferences'

interface ConvertPouchStorageProps {
  storageId: string
  storageName: string
}

const ConvertPouchStorage = ({
  storageId,
  storageName,
}: ConvertPouchStorageProps) => {
  const { push } = useRouter()
  const { setClosed } = usePreferences()
  const { storageMap, createStorage } = useDb()
  const [newStorageLocation, setNewStorageLocation] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [newStorageName, setNewStorageName] = useState('')
  const [opened, setOpened] = useState(false)

  const openForm = useCallback(() => {
    setNewStorageName(`${storageName} - Converted`)
    setNewStorageLocation('')
    setErrorMessage(null)
    setOpened(true)
  }, [storageName])

  const closeForm = useCallback(() => {
    setOpened(false)
  }, [])

  const updateNewStorageName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewStorageName(event.target.value)
    },
    []
  )

  const cloneAndConvertStorage = useCallback(async () => {
    try {
      if (newStorageLocation === '') {
        throw new Error('Converted Space Location is not selected')
      }
      const storage = storageMap[storageId]
      if (storage == null) {
        throw new Error(`The space, \`${storageId}\`, does not exist.`)
      }
      if (storage.type === 'fs') {
        throw new Error('The space is not pouch space.')
      }

      const { noteMap, folderMap, tagMap } = await storage.db.getAllDocsMap()
      const attachmentMap = await storage.db.getAttachmentMap()
      const boostNoteJsonObject = {
        folderMap,
        tagMap,
      }

      const boostNoteJsonPath = join(newStorageLocation, 'boostnote.json')
      await prepareDirectory(join(newStorageLocation, 'notes'))
      await prepareDirectory(join(newStorageLocation, 'attachments'))
      await writeFile(boostNoteJsonPath, JSON.stringify(boostNoteJsonObject))

      for (const [noteId, noteDoc] of entries(noteMap)) {
        await writeFile(
          join(
            newStorageLocation,
            'notes',
            `${excludeNoteIdPrefix(noteId)}.json`
          ),
          JSON.stringify(noteDoc)
        )
      }

      for (const [attachmentFileName, attachment] of entries(attachmentMap)) {
        const data = await attachment.getData()
        if (data.type === 'src') {
          continue
        }

        await writeFile(
          join(newStorageLocation, 'attachments', attachmentFileName),
          Buffer.from(await data.blob.arrayBuffer())
        )
      }

      const newStorage = await createStorage(newStorageName, {
        type: 'fs',
        location: newStorageLocation,
      })
      setClosed(true)
      push(`/app/storages/${newStorage.id}`)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }, [
    storageMap,
    storageId,
    newStorageLocation,
    newStorageName,
    createStorage,
    setClosed,
    push,
  ])

  return (
    <>
      <FormHeading depth={2}>Convert File System based Storage</FormHeading>
      {!opened ? (
        <FormGroup>
          <FormSecondaryButton onClick={openForm}>Convert</FormSecondaryButton>
        </FormGroup>
      ) : (
        <>
          <FormBlockquote variant={errorMessage == null ? 'primary' : 'danger'}>
            {errorMessage == null
              ? 'This operation will clone data to File System based Space.'
              : errorMessage}
          </FormBlockquote>

          <FormGroup>
            <FormLabel>Converted Space Name</FormLabel>
            <FormTextInput
              value={newStorageName}
              onChange={updateNewStorageName}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Converted Space Location</FormLabel>
            <FormFolderSelector
              value={newStorageLocation}
              setValue={setNewStorageLocation}
            />
          </FormGroup>
          <FormGroup>
            <FormPrimaryButton onClick={cloneAndConvertStorage}>
              Convert to File System based Space
            </FormPrimaryButton>
            <FormSecondaryButton onClick={closeForm}>
              Cancel
            </FormSecondaryButton>
          </FormGroup>
        </>
      )}
    </>
  )
}

export default ConvertPouchStorage
