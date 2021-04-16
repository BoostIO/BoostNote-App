import React, { DragEvent, useCallback, useMemo, useRef, useState } from 'react'
import styled from '../../../../../lib/v2/styled'
import SidebarContextList from '../atoms/SidebarContextList'
import SidebarHeader from '../atoms/SidebarHeader'
import SidebarItem from '../atoms/SidebarTreeItem'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import { FoldingProps } from '../../../atoms/FoldingWrapper'
import { ControlButtonProps } from '../../../../../lib/v2/types'
import {
  MenuItem,
  MenuTypes,
  getContextPositionFromDomElement,
} from '../../../../../lib/v2/stores/contextMenu/types'
import SidebarTreeForm from '../atoms/SidebarTreeForm'
import {
  DraggedTo,
  onDragLeaveCb,
  SidebarDragState,
} from '../../../../../lib/v2/dnd'
import { mdiDotsHorizontal } from '@mdi/js'
import { FocusedContextMenu } from '../../../molecules/ContextMenu'
import Checkbox from '../../../molecules/Form/atoms/FormCheckbox'

interface SidebarTreeProps {
  tree: SidebarNavCategory[]
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

const SidebarTree = ({ tree }: SidebarTreeProps) => {
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
            key={`tree__control__categories`}
            iconPath={mdiDotsHorizontal}
            iconSize={22}
            onClick={(event) => {
              if (categoriesContextIsClosed) {
                setCategoriesContextPosition(
                  getContextPositionFromDomElement(event, tree.length)
                )
                setCategoriesContextIsClosed(false)
              } else {
                setCategoriesContextIsClosed(true)
              }
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

  const onScrollHandler: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
    setInScroll(true)
    scrollTimer.current = setTimeout(() => {
      setInScroll(false)
    }, 600)
  }, [])

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
            inScroll && 'sidebar__category__items--scrolling',
          ])}
          onScroll={onScrollHandler}
        >
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
    overflow-y: scroll;
    overflow-y: overlay;

    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: none !important;
      background-color: transparent;
    }
    &::-webkit-scrollbar,
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
    }

    &::-webkit-scrollbar,
    &::-webkit-scrollbar-thumb,
    &::-webkit-scrollbar-track {
      transition: background 0.3s ease;
    }

    &.sidebar__category__items--scrolling {
      scrollbar-width: thin; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
    }

    &.sidebar__category__items--scrolling::-webkit-scrollbar-track {
      -webkit-box-shadow: none !important;
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &.sidebar__category__items--scrolling::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }
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
