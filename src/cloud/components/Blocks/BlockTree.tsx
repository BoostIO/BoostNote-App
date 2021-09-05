import React from 'react'
import { mdiTrashCan } from '@mdi/js'
import { Block } from '../../api/blocks'
import styled from '../../../design/lib/styled'
import { capitalize } from '../../lib/utils/string'
import BlockIcon from './BlockIcon'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import { min } from 'ramda'
import cc from 'classcat'
import { FoldingProps } from '../../../design/components/atoms/FoldingWrapper'

interface BlockTreeProps {
  idPrefix?: string
  root: Block & { folding?: FoldingProps; folded?: boolean }
  onSelect: (block: Block) => void
  onDelete?: (block: Block) => void
  active?: Block
  depth?: number
  className?: string
}

const BlockTree = ({
  idPrefix,
  root,
  onSelect,
  onDelete,
  depth,
  active,
  className,
}: BlockTreeProps) => {
  const parentDepth = min(depth || 1, 6)
  return (
    <StyledBlockTree
      className={cc([
        'block__tree',
        root.children.length > 0 && 'block__editor__nav--tree',
        parentDepth === 1 && `block__editor__nav--tree-root`,
        className,
      ])}
      depth={parentDepth}
    >
      <NavigationItem
        className='block__editor__nav--item'
        folded={root.folded}
        folding={root.folding}
        id={`${idPrefix}-block-${root.id}`}
        label={blockTitle(root)}
        active={active && root.id === active.id}
        depth={parentDepth}
        icon={{ type: 'node', icon: <BlockIcon block={root} size={16} /> }}
        labelClick={() => onSelect(root)}
        controls={
          onDelete == null || depth === 0
            ? []
            : [{ icon: mdiTrashCan, onClick: () => onDelete(root) }]
        }
      />
      {!root.folded &&
        root.children.length > 0 &&
        (root.children as Block[]).map((child: Block) => (
          <BlockTree
            idPrefix={idPrefix}
            key={child.id}
            root={child}
            onSelect={onSelect}
            onDelete={onDelete}
            active={active}
            depth={parentDepth + 1}
          />
        ))}
    </StyledBlockTree>
  )
}

function blockTitle(block: Block) {
  switch (block.type) {
    case 'github.issue':
      try {
        return `${block.data.title}`
      } catch (err) {
        return 'Github Issue'
      }
    case 'embed':
    case 'table':
      return block.name.trim() === '' ? capitalize(block.type) : block.name
    default:
      return capitalize(block.type)
  }
}

const StyledBlockTree = styled.div<{ depth: number }>`
  position: relative;
  width: 100%;

  &.block__editor__nav--tree {
    &::before {
      content: '';
      position: absolute;
      width: 1px;
      bottom: 13px;
      left: ${({ depth }) => (depth as number) * 8 + 4}px;
      background: ${({ theme }) => theme.colors.border.second};
      height: calc(100% - 26px);
      z-index: 1;
      pointer-events: none;
      filter: brightness(120%);
    }
  }

  .block__editor__nav--item:first-of-type {
    &::before {
      content: '';
      position: absolute;
      width: 8px;
      height: 1px;
      background: ${({ theme }) => theme.colors.border.second};
      top: 13px;
      left: ${({ depth }) => (depth as number) * 8 - 4}px;
      z-index: 1;
      pointer-events: none;
      filter: brightness(120%);
    }
  }
`

export default BlockTree
