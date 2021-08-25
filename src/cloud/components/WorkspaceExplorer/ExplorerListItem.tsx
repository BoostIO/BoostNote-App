import React from 'react'
import cc from 'classcat'
import { StyledExplorerListItemIcon, StyledExplorerListItem } from './styled'
import { mdiMenuRight } from '@mdi/js'
import EmojiIcon from '../EmojiIcon'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'

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
          <EmojiIcon emoji={emoji} defaultIcon={iconPath} size={20} />
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
        <Icon path={mdiMenuRight} size={20} />
      </StyledExplorerListItemIcon>
    )}
  </StyledExplorerListItem>
)

export default ExplorerListItem
