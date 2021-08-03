import { useCallback } from 'react'
import { NoteStorage } from '../../../db/types'
import { useDb } from '../../../db'
import {
  DialogIconTypes,
  useDialog,
} from '../../../../shared/lib/stores/dialog'
import { useTranslation } from 'react-i18next'

export function useLocalUI() {
  const { messageBox } = useDialog()
  const { removeStorage } = useDb()
  const { t } = useTranslation()

  const removeWorkspace = useCallback(
    async (workspace: NoteStorage) => {
      messageBox({
        title: `Remove "${workspace.name}" Space`,
        message:
          workspace.type === 'fs'
            ? "This operation won't delete the actual space folder. You can add it to the app again."
            : t('storage.removeMessage'),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'warning',
            label: t('storage.remove'),
            onClick: () => {
              removeStorage(workspace.id)
            },
          },
          {
            label: t('general.cancel'),
            cancelButton: true,
            defaultButton: true,
            variant: 'secondary',
          },
        ],
      })
    },
    [messageBox, removeStorage, t]
  )

  return {
    removeWorkspace,
  }
}

export interface LocalNewResourceRequestBody {
  workspaceId?: string
  parentFolderPathname?: string
  navigateToFolder?: boolean
}

export interface LocalExportResourceRequestBody {
  folderName: string
  folderPathname: string
  exportingStorage: boolean
}
