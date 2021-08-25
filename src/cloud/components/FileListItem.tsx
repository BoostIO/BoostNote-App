import React from 'react'
import { SerializedTeam } from '../interfaces/db/team'
import { buildTeamFileUrl } from '../api/teams/files'
import { mdiClose } from '@mdi/js'
import { getFormattedBoosthubDate } from '../lib/date'
import cc from 'classcat'
import { SerializedFileInfo } from '../interfaces/db/storage'
import Button from '../../design/components/atoms/Button'

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
        <Button
          variant='icon'
          iconPath={mdiClose}
          iconSize={20}
          className='delete-icon'
          onClick={() => onDeleteHandler(team, file)}
        />
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
