import React from 'react'
import { BreadCrumbTreeItem } from '../../../../../lib/v2/mappers/types'
import { useWindow } from '../../../../../lib/v2/stores/window'
import styled from '../../../../../lib/v2/styled'
import UpDownList from '../../../atoms/UpDownList'
import cc from 'classcat'
import { useSet } from 'react-use'
import { menuZIndex } from '../../../../../lib/v2/stores/contextMenu'
import TopbarTreeItem from '../atoms/TopbarTreeItem'

interface TopbarTreeProps {
  className?: string
  state: {
    bottom: number
    left: number
    id: string
  }
  tree: Map<string, BreadCrumbTreeItem[]>
  close: () => void
}

const TopbarTree = ({
  tree,
  close,
  className,
  state: { bottom, left, id },
}: TopbarTreeProps) => {
  const { windowSize } = useWindow()
  const [, { has, add, remove, toggle }] = useSet(new Set<string>())

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
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borders.radius};
  position: fixed;
  z-index: ${menuZIndex};
  overflow: auto;

  .topbar__tree__list {
    overflow: auto;
  }
`

export default TopbarTree
