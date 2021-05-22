import React from 'react'
import Flexbox from '../../../atoms/Flexbox'
import { getFormattedBoosthubDateTime } from '../../../../lib/date'
import EmojiIcon from '../../../atoms/EmojiIcon'
import { SerializedUser } from '../../../../interfaces/db/user'
import EditorsIcons from '../../../atoms/EditorsIcons'
import { DocStatus } from '../../../../interfaces/db/doc'
import DocStatusIcon from '../../../atoms/DocStatusIcon'

interface ContentManagerRowLinkContentProps {
  status?: DocStatus
  label: string
  emoji?: string
  defaultIcon?: string
  date: string
  editors?: SerializedUser[]
  path?: string
}

const ContentManagerRowLinkContent = ({
  status,
  defaultIcon,
  label,
  emoji,
  path,
  date,
  editors,
}: ContentManagerRowLinkContentProps) => (
  <Flexbox
    flex={'1 1 auto'}
    justifyContent='space-between'
    className='cm-row-link-content'
  >
    <Flexbox flex={'1 1 auto'}>
      {status && <DocStatusIcon status={status} className='status-icon' />}
      <EmojiIcon
        className='emoji-icon'
        defaultIcon={defaultIcon}
        emoji={emoji}
        size={16}
      />
      {path != null ? (
        <Flexbox
          className='label'
          direction='column'
          alignItems='baseline'
          justifyContent='center'
        >
          <span className='subtle'>{path}</span>
          <span>{label}</span>
        </Flexbox>
      ) : (
        <span className='label'>{label}</span>
      )}
    </Flexbox>

    <Flexbox flex='0 2 auto' className='date'>
      {getFormattedBoosthubDateTime(date)}
      {editors != null && editors.length > 0 && (
        <EditorsIcons editors={editors} />
      )}
    </Flexbox>
  </Flexbox>
)

export default ContentManagerRowLinkContent
