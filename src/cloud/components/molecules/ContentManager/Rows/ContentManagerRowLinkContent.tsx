import React from 'react'
import Flexbox from '../../../atoms/Flexbox'
import { getFormattedBoosthubDateTime } from '../../../../lib/date'
import EmojiIcon from '../../../atoms/EmojiIcon'
import { SerializedUser } from '../../../../interfaces/db/user'
import EditorsIcons from '../../../atoms/EditorsIcons'

interface ContentManagerRowLinkContentProps {
  label: string
  emoji?: string
  defaultIcon: string
  date: string
  editors?: SerializedUser[]
  path?: string
}

const ContentManagerRowLinkContent = ({
  defaultIcon,
  label,
  emoji,
  path,
  date,
  editors,
}: ContentManagerRowLinkContentProps) => (
  <Flexbox flex={'1 1 auto'} justifyContent='space-between'>
    <Flexbox flex={'1 1 auto'}>
      <EmojiIcon defaultIcon={defaultIcon} emoji={emoji} size={20} />
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
