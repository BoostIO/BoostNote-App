import React, { useState } from 'react'
import IconMdi from '../../../atoms/IconMdi'
import { mdiDotsVertical } from '@mdi/js'
import TagContextMenu from './ControlsContextMenu/TagContextMenu'
import { StyledContentControls, StyledContentButton } from './styled'
import { SerializedTag } from '../../../../interfaces/db/tag'
import { SerializedTeam } from '../../../../interfaces/db/team'

interface TagControlsProps {
  currentTag: SerializedTag
  team: SerializedTeam
}

const TagControls = ({ currentTag, team }: TagControlsProps) => {
  const [opened, setOpened] = useState<boolean>(false)

  return (
    <StyledContentControls>
      <StyledContentButton onClick={() => setOpened(true)}>
        <IconMdi path={mdiDotsVertical} />
      </StyledContentButton>
      {opened && (
        <TagContextMenu
          currentTag={currentTag}
          team={team}
          closeContextMenu={() => setOpened(false)}
        />
      )}
    </StyledContentControls>
  )
}

export default TagControls
