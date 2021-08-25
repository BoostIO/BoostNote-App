import React from 'react'
import { SerializedTeam } from '../../../../../../cloud/interfaces/db/team'
import { StyledTag } from './styled'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import TagLink from '../../../../../../cloud/components/Link/TagLink'
import { SerializedTag } from '../../../../../../cloud/interfaces/db/tag'
import Spinner from '../../../../../../design/components/atoms/Spinner'
import Icon from '../../../../../../design/components/atoms/Icon'

interface DocTagsListItemProps {
  tag: SerializedTag
  team: SerializedTeam
  sending: boolean
  removing: string | undefined
  onDeleteHandler: (tagId: string) => void
  removable?: boolean
}

const DocTagsListItem = ({
  team,
  tag,
  sending,
  onDeleteHandler,
  removing,
  removable = true,
}: DocTagsListItemProps) => {
  return (
    <StyledTag key={tag.id} className='toolbar-tag'>
      <TagLink tag={tag} team={team} className='tag-link' tabIndex={-1}>
        {tag.text}
      </TagLink>
      {removable && (
        <div
          className={cc([sending && 'disabled', 'removeTag'])}
          onClick={() => onDeleteHandler(tag.id)}
        >
          {removing === tag.id ? (
            <Spinner size={12} className='relative  tag-spinner' />
          ) : (
            <Icon path={mdiClose} size={12} />
          )}
        </div>
      )}
    </StyledTag>
  )
}

export default DocTagsListItem
