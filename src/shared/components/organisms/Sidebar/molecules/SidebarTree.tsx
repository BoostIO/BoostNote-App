import React, { DragEvent, useCallback, useMemo, useRef, useState } from 'react'
import styled from '../../../../lib/styled'
import SidebarContextList from '../atoms/SidebarContextList'
import SidebarHeader from '../atoms/SidebarHeader'
import SidebarItem from '../atoms/SidebarTreeItem'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import { FoldingProps } from '../../../atoms/FoldingWrapper'
import { ControlButtonProps } from '../../../../lib/types'
import {
  MenuItem,
  MenuTypes,
  getContextPositionFromDomElement,
} from '../../../../lib/stores/contextMenu/types'
import SidebarTreeForm from '../atoms/SidebarTreeForm'
import { DraggedTo, onDragLeaveCb, SidebarDragState } from '../../../../lib/dnd'
import { mdiDotsHorizontal } from '@mdi/js'
import { FocusedContextMenu } from '../../../molecules/ContextMenu'
import Checkbox from '../../../molecules/Form/atoms/FormCheckbox'
import { scrollbarOverlay } from '../../../../lib/styled/styleFunctions'

interface SidebarTreeProps {
  tree: SidebarNavCategory[]
  topRows?: React.ReactNode
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
  lastCategory?: boolean
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
  dropIn?: boolean
  dropAround?: boolean
  onDragStart?: () => void
  onDrop?: (position?: SidebarDragState) => void
}

export type SidebarNavControls =
  | ControlButtonProps
  | {
      disabled?: boolean
      icon: string
      onClick: undefined
      placeholder: string
      create: (title: string) => Promise<void>
    }

const SidebarTree = ({ tree, topRows }: SidebarTreeProps) => {
  const [categoriesContextIsClosed, setCategoriesContextIsClosed] = useState(
    true
  )
  const [categoriesContextPosition, setCategoriesContextPosition] = useState<
    | {
        x: number
        y: number
      }
    | undefined
  >()

  return (
    <Container className='sidebar__tree'>
      <SidebarHeader label='Explorer'>
        {tree.length > 0 && (
          <Button
            variant='icon'
            size='sm'
            className='sidebar__tree__viewbtn'
            key={`tree__control__categories`}
            iconPath={mdiDotsHorizontal}
            iconSize={20}
            disabled={!categoriesContextIsClosed}
            onClick={async (event) => {
              setCategoriesContextPosition(
                getContextPositionFromDomElement(event, tree.length)
              )
              setCategoriesContextIsClosed(false)
            }}
          />
        )}
        {tree.length > 0 && !categoriesContextIsClosed && (
          <FocusedContextMenu
            menuItems={tree.map((category) => {
              return {
                type: MenuTypes.Normal,
                onClick: category.toggleHidden,
                label: (
                  <span>
                    <Checkbox checked={!category.hidden} />
                    <span style={{ paddingLeft: 6 }}>{category.label}</span>
                  </span>
                ),
              }
            })}
            position={categoriesContextPosition}
            close={() => setCategoriesContextIsClosed(true)}
          />
        )}
      </SidebarHeader>
      <SidebarContextList className='sidebar__tree__wrapper'>
        {topRows != null && (
          <div className='sidebar__tree__rows--top'>{topRows}</div>
        )}
        {tree.map((category, i) => {
          if (category.hidden) {
            return null
          }

          return (
            <SidebarCategory
              category={{ ...category, lastCategory: i === tree.length - 1 }}
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
  const [draggingItem, setDraggingItem] = useState(false)
  const [inScroll, setInScroll] = useState(false)
  const scrollTimer = useRef<any>()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const creationCallbackRef = useRef<((val: string) => Promise<void>) | null>(
    null
  )

  const onScrollHandler: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
    setInScroll(true)
    scrollTimer.current = setTimeout(() => {
      setInScroll(false)
    }, 600)
  }, [])

  const controls = useMemo(
    () =>
      (category.controls || []).map((control) => {
        if (control.onClick != null) {
          return control
        }

        return {
          icon: control.icon,
          disabled: control.disabled,
          onClick: () => {
            if (category.folded) {
              category.folding?.toggle()
            }
            setPlaceholder(control.placeholder)
            setCreationFormIsOpened(true)
            setShowCreateForm(true)
            creationCallbackRef.current = control.create
          },
        }
      }) as ControlButtonProps[],
    [
      category.controls,
      category.folded,
      category.folding,
      creationCallbackRef,
      setCreationFormIsOpened,
    ]
  )

  return (
    <React.Fragment>
      <SidebarItem
        className={cc([
          'sidebar__category',
          category.lastCategory && 'sidebar__category--last',
          !category.folded && 'sidebar__category--open',
        ])}
        id={`category-${category.label}`}
        label={category.label}
        labelClick={category.folding?.toggle}
        folding={category.folding}
        folded={category.folded}
        controls={controls}
        depth={-1}
      />
      {!category.folded && (
        <div
          className={cc([
            'sidebar__category__items',
            `sidebar__category__items__shrink${category.shrink || '1'}`,
            creationFormIsOpened && `sidebar__category__items--silenced`,
            inScroll && 'sidebar__category__items--scrolling',
          ])}
          onScroll={onScrollHandler}
        >
          {showCreateForm && (
            <SidebarTreeForm
              placeholder={placeholder}
              close={() => {
                setCreationFormIsOpened(false)
                setShowCreateForm(false)
              }}
              createCallback={creationCallbackRef.current}
            />
          )}
          {category.rows.map((row, i) => (
            <SidebarNestedTreeRow
              isLastRow={i === category.rows.length - 1}
              row={row}
              key={row.id}
              prefix={category.label}
              setCreationFormIsOpened={setCreationFormIsOpened}
              draggingItem={draggingItem}
              setDraggingItem={setDraggingItem}
            />
          ))}
        </div>
      )}
    </React.Fragment>
  )
}

const SidebarNestedTreeRow = ({
  isLastRow,
  row,
  prefix,
  setCreationFormIsOpened,
  draggingItem,
  setDraggingItem,
}: {
  isLastRow: boolean
  draggingItem: boolean
  setDraggingItem: React.Dispatch<React.SetStateAction<boolean>>
  row: SidebarTreeChildRow
  prefix?: string
  setCreationFormIsOpened: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [draggedOver, setDraggedOver] = useState<SidebarDragState>()
  const dragRef = useRef<HTMLDivElement>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
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
            setPlaceholder(control.placeholder)
            setCreationFormIsOpened(true)
            setShowCreateForm(true)
            creationCallbackRef.current = control.create
          },
        }
      }) as ControlButtonProps[],
    [row.controls, row.folding, creationCallbackRef, setCreationFormIsOpened]
  )

  const onDragStart = useCallback(
    (event: any) => {
      event.stopPropagation()
      if (row.onDragStart != null) {
        row.onDragStart()
      }
      setDraggingItem(true)
    },
    [row, setDraggingItem]
  )

  const onDrop = useCallback(
    (event: React.DragEvent, position: SidebarDragState) => {
      event.preventDefault()
      if (row.onDrop != null) {
        row.onDrop(position)
      }
      setDraggedOver(undefined)
      setDraggingItem(false)
    },
    [row, setDraggingItem]
  )

  return (
    <div className='sidebar__drag__zone__wrapper'>
      {draggingItem && row.dropAround && (
        <div
          draggable={true}
          className={cc([
            'sidebar__drag__zone__border',
            draggedOver === DraggedTo.beforeItem &&
              'sidebar__drag__zone__border--active',
          ])}
          onDragOver={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDraggedOver(DraggedTo.beforeItem)
          }}
          onDragLeave={(event: DragEvent) => {
            event.preventDefault()
            event.stopPropagation()
            setDraggedOver(undefined)
          }}
          onDrop={(event) => {
            event.stopPropagation()
            onDrop(event, DraggedTo.beforeItem)
          }}
        />
      )}
      <div
        ref={dragRef}
        className={cc([
          'sidebar__drag__zone',
          draggedOver === DraggedTo.insideFolder &&
            `sidebar__drag__zone--dragged-over`,
        ])}
        draggable={row.onDragStart != null}
        onDragStart={onDragStart}
        onDrop={(event) => {
          if (!row.dropIn) {
            return
          }
          event.stopPropagation()
          onDrop(event, DraggedTo.insideFolder)
        }}
        onDragLeave={(event) => {
          onDragLeaveCb(event, dragRef, () => {
            setDraggedOver(undefined)
          })
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (!row.dropIn) {
            return
          }
          setDraggedOver(DraggedTo.insideFolder)
        }}
        key={row.id}
      >
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
            placeholder={placeholder}
            close={() => {
              setCreationFormIsOpened(false)
              setShowCreateForm(false)
            }}
            createCallback={creationCallbackRef.current}
          />
        )}
        {!row.folded &&
          (row.rows || []).map((child, i) => (
            <SidebarNestedTreeRow
              isLastRow={i === (row.rows || []).length - 1}
              draggingItem={draggingItem}
              row={child}
              key={`${prefix}-${child.id}`}
              prefix={prefix}
              setCreationFormIsOpened={setCreationFormIsOpened}
              setDraggingItem={setDraggingItem}
            />
          ))}
      </div>
      {draggingItem && row.dropAround && isLastRow && (
        <div
          draggable={true}
          className={cc([
            'sidebar__drag__zone__border sidebar__drag__zone__border--bottom',
            draggedOver === DraggedTo.afterItem &&
              'sidebar__drag__zone__border--active',
          ])}
          onDragOver={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDraggedOver(DraggedTo.afterItem)
          }}
          onDragLeave={(event: DragEvent) => {
            event.preventDefault()
            event.stopPropagation()
            setDraggedOver(undefined)
          }}
          onDrop={(event) => {
            event.stopPropagation()
            onDrop(event, DraggedTo.afterItem)
          }}
        />
      )}
    </div>
  )
}

export default SidebarTree

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .sidebar__tree__rows--top {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px 13px !important;
    > div {
      width: 100%;
    }
  }

  .sidebar__header {
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px 0
      ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .sidebar__tree__viewbtn {
    width: 24px;
  }

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
    padding: 4px 0;
    flex-shrink: 2;
    ${(theme) =>
      scrollbarOverlay(theme, 'y', 'sidebar__category__items--scrolling')}
  }

  .sidebar__category__items__shrink1 {
    flex-shrink: 1;
    min-height: 50px;
  }
  .sidebar__category__items__shrink2 {
    flex-shrink: 2;
    min-height: 50px;
  }
  .sidebar__category__items__shrink3 {
    flex-shrink: 3;
    min-height: 50px;
  }

  .sidebar__category__items--silenced .sidebar__tree__item {
    opacity: 0.4;
  }

  .sidebar__drag__zone__wrapper {
    position: relative;
  }

  .sidebar__drag__zone {
    &.sidebar__drag__zone--dragged-over {
      background-color: rgba(47, 111, 151, 0.6) !important;

      .sidebar__tree__item {
        background: none !important;
      }
    }
  }

  .sidebar__category:not(.sidebar__category--last):not(.sidebar__category--open) {
    border-bottom-color: ${({ theme }) => theme.colors.border.main} !important;
  }

  .sidebar__category__items + .sidebar__category {
    border-top-color: ${({ theme }) => theme.colors.border.main} !important;
  }

  .sidebar__drag__zone__border {
    height: 16px;
    width: 100%;
    position: absolute;
    top: -8px;
    z-index: 20;

    &::after {
      content: '';
      height: 2px;
      background: none;
      width: 100%;
      display: block;
      position: relative;
      top: 7px;
    }

    &.sidebar__drag__zone__border--active::after {
      background-color: rgba(47, 111, 151, 0.6) !important;
    }
  }
`
