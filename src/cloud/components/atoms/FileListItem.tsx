import React from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { buildTeamFileUrl } from '../../api/teams/files'
import { mdiClose } from '@mdi/js'
import IconMdi from './IconMdi'
import { getFormattedBoosthubDate } from '../../lib/date'
import cc from 'classcat'
import { SerializedFileInfo } from '../../interfaces/db/storage'

interface FileListItemProps {
  file: SerializedFileInfo
  team: SerializedTeam
  className?: string
  onDeleteHandler?: (team: SerializedTeam, file: SerializedFileInfo) => void
}

const FileListItem = ({
  file,
  team,
  className,
  onDeleteHandler,
}: FileListItemProps) => {
  return (
    <div className={cc(['file-list-item', className])}>
      {onDeleteHandler != null && (
        <div
          className='delete-icon'
          onClick={() => onDeleteHandler(team, file)}
        >
          <IconMdi path={mdiClose} size={20} />
        </div>
      )}
      <div className='wrapper'>
        <img src={buildTeamFileUrl(team, file.name)} />
        {file.createdAt != null && (
          <span className='date'>
            Uploaded: {getFormattedBoosthubDate(file.createdAt.toString())}{' '}
          </span>
        )}
      </div>
    </div>
  )
}
export default FileListItem
