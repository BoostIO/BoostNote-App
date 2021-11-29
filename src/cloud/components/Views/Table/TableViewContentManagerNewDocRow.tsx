import React from 'react'
import { mdiPlus } from '@mdi/js'
import ViewManagerRow from '../ViewManagerRow'
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
    <ViewManagerRow className={className}>
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
    </ViewManagerRow>
  )
}

export default TableViewContentManagerNewDocRow
