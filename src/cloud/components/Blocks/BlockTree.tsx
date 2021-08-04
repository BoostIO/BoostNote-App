import React, { useMemo } from 'react'
import {
  mdiCodeTags,
  mdiTable,
  mdiFileDocumentOutline,
  mdiGithub,
  mdiPackageVariantClosed,
  mdiTrashCanOutline,
} from '@mdi/js'
import { Block } from '../../api/blocks'
import styled from '../../../design/lib/styled'
import { capitalize } from '../../lib/utils/string'
import Icon, { IconSize } from '../../../design/components/atoms/Icon'

interface BlockTreeProps {
  root: Block
  onSelect: (block: Block) => void
  onDelete: (block: Block) => void
  active?: Block
  depth?: number
}

const BlockTree = ({
  root,
  onSelect,
  onDelete,
  depth,
  active,
}: BlockTreeProps) => {
  return (
    <StyledBlockTree
      className={active && active.id === root.id && 'block__tree--active'}
      key={root.id}
      depth={depth || 0}
    >
      <div className='block__tree__label'>
        <BlockIcon block={root} size={16} />
        <span onClick={() => onSelect(root)}>{capitalize(root.type)}</span>
        <span onClick={() => onDelete(root)}>
          <Icon
            className='block__tree__action'
            path={mdiTrashCanOutline}
            size={16}
          />
        </span>
      </div>
      <div className='block__tree__children'>
        {root.children.length > 0 &&
          (root.children as Block[]).map((child: Block) => (
            <BlockTree
              key={child.id}
              root={child}
              onSelect={onSelect}
              onDelete={onDelete}
              active={active}
              depth={(depth || 0) + 1}
            />
          ))}
      </div>
    </StyledBlockTree>
  )
}

const StyledBlockTree = styled.div<{ depth: number }>`
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  &.block__tree--active > .block__tree__label {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  & > .block__tree__label {
    padding-left: ${({ depth }) => 18 + (depth as number) * 15}px;
    display: flex;
    width: 100%;
    height: 26px;
    white-space: nowrap;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    cursor: pointer;

    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    margin: 0;
    overflow: hidden;
    & > span:first-of-type {
      flex-grow: 1;
    }
    & svg {
      color: ${({ theme }) => theme.colors.text.subtle};
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    & .block__tree__action {
      display: none;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};

      & .block__tree__action {
        display: block;
      }
    }
  }
`

interface BlockIconProps {
  block: Block
  size: IconSize
}

const BlockIcon = ({ block, size }: BlockIconProps) => {
  const path = useMemo(() => {
    if (block.type.startsWith('github')) {
      return mdiGithub
    }
    switch (block.type) {
      case 'embed':
        return mdiCodeTags
      case 'table':
        return mdiTable
      case 'markdown':
        return mdiFileDocumentOutline
      default:
        return mdiPackageVariantClosed
    }
  }, [block.type])

  return <Icon path={path} size={size} />
}

export default BlockTree
