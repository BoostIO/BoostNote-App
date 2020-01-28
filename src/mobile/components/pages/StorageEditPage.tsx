import React, { useCallback, useState, useEffect } from 'react'
import styled from '../../../lib/styled'
import { DeleteStorageButton } from '../../../components/PreferencesModal/styled'
import { useDb } from '../../../lib/db'
import { NoteStorage } from '../../../lib/db/types'
import { useRouter } from '../../../lib/router'
import { useDebounce } from 'react-use'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { isCloudStorageData } from '../../../lib/db/utils'
import { useToast } from '../../../lib/toast'
import { useTranslation } from 'react-i18next'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarToggleNavButton from '../atoms/TopBarToggleNavButton'

const StorageEditPageContainer = styled.div`
  padding: 15px;
`

const FormSection = styled.section`
  margin-bottom: 15px;
`

interface StorageEditPageProps {
  storage: NoteStorage
}

const StorageEditPage = ({ storage }: StorageEditPageProps) => {
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
  }, [storage, db, router, messageBox, pushMessage, t])

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
    <TopBarLayout
      leftControl={<TopBarToggleNavButton />}
      title={t('storage.edit')}
    >
      <StorageEditPageContainer>
        <FormSection>
          <label>
            {t('storage.name')}
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
              />
            </div>
          </label>
        </FormSection>
        <FormSection>
          <DeleteStorageButton onClick={removeCallback}>
            {t('storage.delete')}
          </DeleteStorageButton>
        </FormSection>
        {isCloudStorageData(storage) && (
          <FormSection>
            <p>
              {t('storage.syncDate')}
              {new Date(storage.cloudStorage.updatedAt).toLocaleString()}
            </p>
          </FormSection>
        )}
      </StorageEditPageContainer>
    </TopBarLayout>
  )
}

export default StorageEditPage
