import React from 'react'
import { mdiPlus } from '@mdi/js'
import TableContentManagerRow from './TableContentManagerRow'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'

interface TableViewContentManagerNewFolderRowProps {
  team: SerializedTeam
  workspaceId: string
  folderId?: string
  className?: string
}

const TableViewContentManagerNewDocRow = ({
  team,
  workspaceId,
  folderId,
  className,
}: TableViewContentManagerNewFolderRowProps) => {
  const { translate } = useI18n()
  const { createDoc } = useCloudApi()

  return (
    <TableContentManagerRow className={className}>
      <FormToggableInput
        label={translate(lngKeys.ModalsCreateNewDocument)}
        variant='transparent'
        iconPath={mdiPlus}
        submit={(val: string) =>
          createDoc(
            team,
            {
              title: val,
              workspaceId,
              parentFolderId: folderId,
            },
            { skipRedirect: true }
          )
        }
      />
    </TableContentManagerRow>
  )
}

export default TableViewContentManagerNewDocRow
