import React, { useState, useCallback } from 'react'
import { FormHeading, FormFolderSelectorInput } from '../atoms/form'
import { useDb } from '../../lib/db'
import { excludeNoteIdPrefix } from '../../lib/db/utils'
import { join } from 'path'
import { writeFile, prepareDirectory } from '../../lib/electronOnly'
import { entries } from '../../lib/db/utils'
import { useRouter } from '../../lib/router'
import { usePreferences } from '../../lib/preferences'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'
import Form from '../../shared/components/molecules/Form'
import { openDialog } from '../../lib/exports'
import { useTranslation } from 'react-i18next'
import Icon from '../../shared/components/atoms/Icon'

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
  const { t } = useTranslation()
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

  const openDialogAndStoreLocation = useCallback(async () => {
    const location = await openDialog()
    setNewStorageLocation(location)
  }, [setNewStorageLocation])

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

          <Form
            rows={[
              {
                title: 'Choose Location',
                items: [
                  {
                    type: 'node',
                    element: (
                      <FormFolderSelectorInput
                        type='text'
                        onClick={openDialogAndStoreLocation}
                        readOnly
                        value={
                          newStorageLocation.trim().length === 0
                            ? t('folder.noLocationSelected')
                            : newStorageLocation
                        }
                      />
                    ),
                  },
                  {
                    type: 'button',
                    props: {
                      label: 'Select Folder',
                      variant: 'primary',
                      onClick: openDialogAndStoreLocation,
                    },
                  },
                ],
              },
              {
                items: [
                  {
                    type: 'button',
                    props: {
                      label: 'Convert to File System based Space',
                      disabled: newStorageLocation.trim().length === 0,
                      variant: 'primary',
                      onClick: cloneAndConvertStorage,
                    },
                  },
                ],
              },
            ]}
          />
        </>
      )}
    </>
  )
}

export default ConvertPouchStorage
