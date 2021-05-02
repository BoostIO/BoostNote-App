import React from 'react'
import { BreadCrumbTreeItem } from '../../../../lib/mappers/types'
import { useWindow } from '../../../../lib/stores/window'
import styled from '../../../../lib/styled'
import UpDownList from '../../../atoms/UpDownList'
import cc from 'classcat'
import { useSet } from 'react-use'
import { menuZIndex } from '../../../../lib/stores/contextMenu'
import TopbarTreeItem from '../atoms/TopbarTreeItem'
import TopbarActionItem, {
  TopbarActionItemAttrbs,
} from '../atoms/TopbarActionItem'

interface TopbarTreeProps {
  className?: string
  state: {
    bottom: number
    left: number
    id: string
    actions: TopbarActionItemAttrbs[]
  }
  tree?: Map<string, BreadCrumbTreeItem[]>
  close: () => void
}

const TopbarNavigationContext = ({
  tree,
  close,
  className,
  state: { bottom, left, id, actions = [] },
}: TopbarTreeProps) => {
  const { windowSize } = useWindow()
  const [, { has, add, remove, toggle }] = useSet(new Set<string>())

  if (tree == null && actions.length === 0) {
    return null
  }

  return (
    <Container
      className={cc(['topbar__tree', className])}
      style={{
        left,
        top: bottom,
        maxWidth: windowSize.width - left,
        maxHeight:
          400 < windowSize.height - bottom ? 400 : windowSize.height - bottom,
      }}
    >
      <UpDownList className='topbar__tree__list' onBlur={close}>
        {actions.map((action, i) => (
          <TopbarActionItem
            className='topbar__action__item'
            depth={0}
            key={`action-${i}`}
            item={action}
          />
        ))}
        {tree != null && (
          <div className='topbar__tree__navigation'>
            {tree.has(id)
              ? tree
                  .get(id)!
                  .map((item) =>
                    getTreeItemAndItsChildren(
                      item,
                      0,
                      tree,
                      has,
                      remove,
                      add,
                      toggle
                    )
                  )
              : null}
          </div>
        )}
      </UpDownList>
    </Container>
  )
}

const getTreeItemAndItsChildren = (
  item: BreadCrumbTreeItem,
  depth: number,
  tree: Map<string, BreadCrumbTreeItem[]>,
  nodeIsUnfolded: (id: string) => boolean,
  fold: (id: string) => void,
  unfold: (id: string) => void,
  toggle: (id: string) => void
) => {
  const hasChildren = tree.has(item.id)
  return (
    <React.Fragment key={item.id}>
      <TopbarTreeItem
        item={item}
        depth={depth}
        key={item.id}
        folded={hasChildren ? !nodeIsUnfolded(item.id) : undefined}
        folding={
          hasChildren
            ? {
                fold: () => fold(item.id),
                unfold: () => unfold(item.id),
                toggle: () => toggle(item.id),
              }
            : undefined
        }
      />
      {nodeIsUnfolded(item.id) && tree.has(item.id)
        ? tree
            .get(item.id)!
            .map((child) =>
              getTreeItemAndItsChildren(
                child,
                depth + 1,
                tree,
                nodeIsUnfolded,
                fold,
                unfold,
                toggle
              )
            )
        : null}
    </React.Fragment>
  )
}

const Container = styled.div`
  width: 350px;
  height: fit-content;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borders.radius};
  position: fixed;
  z-index: ${menuZIndex};
  overflow: auto;

  .topbar__tree__list {
    overflow: auto;
  }

  .topbar__action__item + .topbar__tree__navigation {
    border-top: 1px solid ${({ theme }) => theme.colors.border.main};
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default TopbarNavigationContext
