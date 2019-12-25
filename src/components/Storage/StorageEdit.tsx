import React, { useCallback, useState, useEffect } from 'react'
import {
  SectionMargin,
  SectionHeader1,
  RightMargin,
  DeleteStorageButton
} from '../PreferencesModal/styled'
import { useDb } from '../../lib/db'
import { NoteStorage } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useDebounce } from 'react-use'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { isCloudStorageData } from '../../lib/db/utils'
import { useToast } from '../../lib/toast'
import { useTranslation } from 'react-i18next'

interface StorageEditProps {
  storage: NoteStorage
}

export default ({ storage }: StorageEditProps) => {
  const db = useDb()
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState(storage.name)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()

  useEffect(() => {
    setName(storage.name)
  }, [storage])

  const removeCallback = useCallback(() => {
    messageBox({
      title: `Remove "${storage.name}" storage`,
      message: t('storage.removeMessage'),
      iconType: DialogIconTypes.Warning,
      buttons: [t('storage.remove'), t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        if (value === 0) {
          try {
            await db.removeStorage(storage.id)
            router.push('/app')
          } catch {
            pushMessage({
              title: t('general.networkError'),
              description: `An error occurred while deleting storage (id: ${storage.id})`
            })
          }
        }
      }
    })
  }, [storage, db, router, messageBox, pushMessage])

  useDebounce(
    () => {
      db.renameStorage(storage.id, name).catch(() => {
        pushMessage({
          title: t('general.networkError'),
          description: `An error occured while updating storage (id:${storage.id}}`
        })
      })
    },
    1000,
    [name]
  )

  return (
    <div>
      <SectionMargin>
        <SectionHeader1>{t('storage.edit')}</SectionHeader1>
        <div>
          <RightMargin>
            <label>
              <RightMargin>{t('storage.name')}</RightMargin>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
              />
            </label>
          </RightMargin>
          <DeleteStorageButton onClick={removeCallback}>
            {t('storage.delete')}
          </DeleteStorageButton>
        </div>
        <div>
          {isCloudStorageData(storage) && (
            <div>
              <p>
                {t('storage.syncDate')}
                {new Date(storage.cloudStorage.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </SectionMargin>
    </div>
  )
}
