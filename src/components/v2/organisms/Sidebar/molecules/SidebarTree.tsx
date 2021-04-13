import React, { useMemo, useRef, useState } from 'react'
import styled from '../../../../../lib/v2/styled'
import SidebarContextList from '../atoms/SidebarContextList'
import SidebarHeader from '../atoms/SidebarHeader'
import SidebarItem from '../atoms/SidebarTreeItem'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import { FoldingProps } from '../../../atoms/FoldingWrapper'
import { ControlButtonProps } from '../../../../../lib/v2/types'
import { MenuItem } from '../../../../../lib/v2/stores/contextMenu'
import SidebarTreeForm from '../atoms/SidebarTreeForm'

interface SidebarTreeProps {
  tree: SidebarNavCategory[]
  treeControls?: SidebarTreeControl[]
}

export type SidebarTreeControl = {
  icon: string
  disabled?: boolean
  onClick: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
}
export type SidebarTreeChildRow = SidebarNavRow & Partial<SidebarFoldingNavRow>

export interface SidebarNavCategory {
  label: string
  folded: boolean
  controls?: SidebarNavControls[]
  hidden: boolean
  toggleHidden: () => void
  folding?: FoldingProps
  rows: SidebarTreeChildRow[]
  shrink?: 1 | 2 | 3
}

type SidebarFoldingNavRow = SidebarNavRow & {
  folded: boolean
  folding: FoldingProps
  rows: SidebarTreeChildRow[]
}

interface SidebarNavRow {
  id: string
  emoji?: string
  defaultIcon?: string
  label: string
  depth: number
  href?: string
  active?: boolean
  navigateTo?: () => void
  controls?: SidebarNavControls[]
  contextControls?: MenuItem[]
}

export type SidebarNavControls =
  | ControlButtonProps
  | {
      disabled?: boolean
      icon: string
      onClick: undefined
      create: (title: string) => Promise<void>
    }

const SidebarTree = ({ tree, treeControls }: SidebarTreeProps) => {
  return (
    <Container className='sidebar__tree'>
      <SidebarHeader label='Explorer'>
        {treeControls != null &&
          treeControls.map((control, i) => (
            <Button
              variant='icon'
              key={`tree__control__${i}`}
              iconPath={control.icon}
              iconSize={22}
              disabled={control.disabled}
              onClick={control.onClick}
              onContextMenu={control.onContextMenu}
            />
          ))}
      </SidebarHeader>
      <SidebarContextList className='sidebar__tree__wrapper'>
        {tree.map((category, i) => {
          if (category.hidden) {
            return null
          }

          return (
            <SidebarCategory
              category={category}
              key={`sidebar__category__${i}`}
            />
          )
        })}
      </SidebarContextList>
    </Container>
  )
}

const SidebarCategory = ({ category }: { category: SidebarNavCategory }) => {
  const [creationFormIsOpened, setCreationFormIsOpened] = useState(false)
  return (
    <React.Fragment>
      <SidebarItem
        className={cc(['sidebar__category'])}
        id={`category-${category.label}`}
        label={category.label}
        labelClick={category.folding?.toggle}
        folding={category.folding}
        folded={category.folded}
        controls={
          (category.controls || []).filter(
            (c) => c.onClick != null
          ) as ControlButtonProps[]
        }
        depth={-1}
      />
      {!category.folded && (
        <div
          className={cc([
            'sidebar__category__items',
            `sidebar__category__items__shrink${category.shrink || '1'}`,
            creationFormIsOpened && `sidebar__category__items--silenced`,
          ])}
        >
          {category.rows.map((row) => (
            <SidebarNestedTreeRow
              row={row}
              key={row.id}
              prefix={category.label}
              setCreationFormIsOpened={setCreationFormIsOpened}
            />
          ))}
        </div>
      )}
    </React.Fragment>
  )
}

const SidebarNestedTreeRow = ({
  row,
  prefix,
  setCreationFormIsOpened,
}: {
  row: SidebarTreeChildRow
  prefix?: string
  setCreationFormIsOpened: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const creationCallbackRef = useRef<((val: string) => Promise<void>) | null>(
    null
  )

  const controls = useMemo(
    () =>
      (row.controls || []).map((control) => {
        if (control.onClick != null) {
          return control
        }

        return {
          icon: control.icon,
          disabled: control.disabled,
          onClick: () => {
            if (row.folding != null) {
              row.folding.unfold()
            }
            setCreationFormIsOpened(true)
            setShowCreateForm(true)
            creationCallbackRef.current = control.create
          },
        }
      }) as ControlButtonProps[],
    [row.controls, row.folding, creationCallbackRef, setCreationFormIsOpened]
  )

  return (
    <div className={cc(['sidebar__drag__zone'])} key={row.id}>
      <SidebarItem
        key={row.id}
        id={`${prefix}-tree-item-${row.id}`}
        label={row.label}
        labelHref={row.href}
        labelClick={row.navigateTo}
        folding={row.folding}
        folded={row.folded}
        depth={row.depth}
        emoji={row.emoji}
        defaultIcon={row.defaultIcon}
        controls={controls}
        contextControls={row.contextControls}
        active={row.active}
      />
      {showCreateForm && (
        <SidebarTreeForm
          close={() => {
            setCreationFormIsOpened(false)
            setShowCreateForm(false)
          }}
          createCallback={creationCallbackRef.current}
        />
      )}
      {!row.folded &&
        (row.rows || []).map((child) => (
          <SidebarNestedTreeRow
            row={child}
            key={`${prefix}-${child.id}`}
            prefix={prefix}
            setCreationFormIsOpened={setCreationFormIsOpened}
          />
        ))}
    </div>
  )
}

export default SidebarTree

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .sidebar__tree__wrapper {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sidebar__category {
    flex: 0 0 auto;
  }

  .sidebar__category + .sidebar__category {
    border-top: none;
  }

  .sidebar__category__items {
    flex-shrink: 2;
    overflow: auto;
  }

  .sidebar__category__items__shrink1 {
    flex-shrink: 1;
  }
  .sidebar__category__items__shrink2 {
    flex-shrink: 2;
  }
  .sidebar__category__items__shrink3 {
    flex-shrink: 3;
  }

  .sidebar__category__items--silenced .sidebar__tree__item {
    opacity: 0.4;
  }
`
