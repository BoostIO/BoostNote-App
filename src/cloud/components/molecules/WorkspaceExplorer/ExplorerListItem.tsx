import React from 'react'
import cc from 'classcat'
import IconMdi from '../../atoms/IconMdi'
import { StyledExplorerListItemIcon, StyledExplorerListItem } from './styled'
import Flexbox from '../../atoms/Flexbox'
import { mdiMenuRight } from '@mdi/js'
import EmojiIcon from '../../atoms/EmojiIcon'

interface ExplorerListItemProps {
  emoji?: string
  iconPath?: string
  label: string
  hasChildren: boolean
  isInCurrentTree: boolean
  isLastChildInCurrentTree: boolean
  onClick: () => void
}

const ExplorerListItem = ({
  emoji,
  iconPath,
  label,
  hasChildren,
  isInCurrentTree,
  isLastChildInCurrentTree,
  onClick,
}: ExplorerListItemProps) => (
  <StyledExplorerListItem
    className={cc([
      isInCurrentTree && 'selected',
      isLastChildInCurrentTree && 'current',
    ])}
    onClick={onClick}
  >
    <Flexbox flex='1 1 auto'>
      {iconPath != null && (
        <StyledExplorerListItemIcon>
          <EmojiIcon emoji={emoji} defaultIcon={iconPath} size={22} />
        </StyledExplorerListItemIcon>
      )}
      <span>{label}</span>
    </Flexbox>
    {hasChildren && (
      <StyledExplorerListItemIcon
        className={cc([
          'subtle',
          (isInCurrentTree || isLastChildInCurrentTree) && 'emphasized',
        ])}
      >
        <IconMdi path={mdiMenuRight} size={22} />
      </StyledExplorerListItemIcon>
    )}
  </StyledExplorerListItem>
)

export default ExplorerListItem
