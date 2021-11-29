import React from 'react'
import TableContentManagerRow from './TableContentManagerRow'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'
import { mdiPlus } from '@mdi/js'

interface TableViewContentManagerNewFolderRowProps {
  team: SerializedTeam
  workspaceId: string
  folderId?: string
  className?: string
}

const TableViewContentManagerNewFolderRow = ({
  team,
  workspaceId,
  folderId,
  className,
}: TableViewContentManagerNewFolderRowProps) => {
  const { translate } = useI18n()
  const { createFolder } = useCloudApi()

  return (
    <TableContentManagerRow className={className}>
      <FormToggableInput
        iconPath={mdiPlus}
        variant='transparent'
        label={translate(lngKeys.ModalsCreateNewFolder)}
        submit={(val: string) =>
          createFolder(
            team,
            {
              folderName: val,
              description: '',
              workspaceId: workspaceId,
              parentFolderId: folderId,
            },
            { skipRedirect: true }
          )
        }
      />
    </TableContentManagerRow>
  )
}

export default TableViewContentManagerNewFolderRow
