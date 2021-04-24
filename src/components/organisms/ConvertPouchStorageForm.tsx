import React, { useState, useCallback } from 'react'
import {
  FormPrimaryButton,
  FormSecondaryButton,
  FormHeading,
  FormLabelGroup,
  FormLabelGroupLabel,
  FormLabelGroupContent,
  FormControlGroup,
} from '../atoms/form'
import FormFolderSelector from '../atoms/FormFolderSelector'
import { useDb } from '../../lib/db'
import { excludeNoteIdPrefix } from '../../lib/db/utils'
import { join } from 'path'
import { writeFile, prepareDirectory } from '../../lib/electronOnly'
import { entries } from '../../lib/db/utils'
import { useRouter } from '../../lib/router'
import { usePreferences } from '../../lib/preferences'
import Icon from '../atoms/Icon'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'

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
      <FormHeading depth={2}>
        <a
          onClick={() => {
            if (opened) {
              closeForm()
            } else {
              openForm()
            }
          }}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon path={opened ? mdiChevronDown : mdiChevronRight} />
          <span>Convert Into File System based Local Space</span>
        </a>
      </FormHeading>
      {opened && (
        <>
          <p>
            {errorMessage == null
              ? 'This operation will clone data to File System based Space.'
              : errorMessage}
          </p>

          <FormLabelGroup>
            <FormLabelGroupLabel>Choose Location</FormLabelGroupLabel>
            <FormLabelGroupContent>
              <FormFolderSelector
                value={newStorageLocation}
                setValue={setNewStorageLocation}
              />
            </FormLabelGroupContent>
          </FormLabelGroup>
          <FormControlGroup>
            <FormSecondaryButton onClick={closeForm}>
              Cancel
            </FormSecondaryButton>
            <FormPrimaryButton onClick={cloneAndConvertStorage}>
              Convert to File System based Space
            </FormPrimaryButton>
          </FormControlGroup>
        </>
      )}
    </>
  )
}

export default ConvertPouchStorage
