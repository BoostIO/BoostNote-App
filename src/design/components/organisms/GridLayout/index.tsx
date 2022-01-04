import React from 'react'
import RGL, { WidthProvider, Layout } from 'react-grid-layout'
import _ from 'lodash'
import { useCallback } from 'react'
import styled from '../../../lib/styled'
import Scroller from '../../atoms/Scroller'

const ReactGridLayout = WidthProvider(RGL)

export const defaultGridRows = 5
export const defaultGridCols = 8

interface GridLayoutProps<T extends { id: string }> {
  className?: string
  layout?: Layout[]
  rowHeight?: number
  items: T[]
  rows?: number
  cols?: number
  defaultGridItemProperties?: Partial<Layout>
  draggableCancel?: string
  resizeHandle?: React.ReactNode | ((resizeHandle: string) => React.ReactNode)
  renderItem: (item: T) => React.ReactNode
  updateLayout: (layouts: Layout[]) => void
}

const GridLayout = <T extends { id: string }>({
  className,
  layout = [],
  rowHeight = 20,
  rows = defaultGridRows,
  cols = defaultGridCols,
  items,
  resizeHandle,
  draggableCancel,
  renderItem,
  updateLayout,
}: GridLayoutProps<T>) => {
  const onLayoutChange = useCallback(
    (currentLayout: Layout[]) => {
      updateLayout(currentLayout)
    },
    [updateLayout]
  )

  const generateDOM = useCallback(() => {
    const layoutMap = layout.reduce((acc, val) => {
      acc.set(val.i, val)
      return acc
    }, new Map<string, Layout>())
    return items.map((item) => {
      const dataGrid = layoutMap.get(item.id)
      return (
        <GridItem key={item.id} className='grid__item' data-grid={dataGrid}>
          {renderItem(item)}
        </GridItem>
      )
    })
  }, [items, renderItem, layout])

  return (
    <Scroller style={{ height: '100%' }}>
      <StyledReactGridLayout
        style={{ minHeight: '100%' }}
        className={className}
        onLayoutChange={onLayoutChange}
        isDraggable={true}
        isDroppable={false}
        isResizable={true}
        rows={rows}
        cols={cols}
        rowHeight={rowHeight}
        resizeHandle={resizeHandle}
        draggableCancel={draggableCancel}
        useCSSTransforms={false}
      >
        {generateDOM()}
      </StyledReactGridLayout>
    </Scroller>
  )
}

const StyledReactGridLayout = styled(ReactGridLayout)`
  .react-grid-layout {
    position: relative;
    transition: height 200ms ease;
  }
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
  }
  .react-grid-item img {
    pointer-events: none;
    user-select: none;
  }
  .react-grid-item.cssTransforms {
    transition-property: transform;
  }
  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }

  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }

  .react-grid-item.dropping {
    visibility: hidden;
  }

  .react-grid-item.react-grid-placeholder {
    background: ${({ theme }) => theme.colors.variants.danger.base};
    opacity: 0.1;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: 0;
  }

  .react-grid-item:hover > .react-resizable-handle {
    opacity: 1;
  }

  .react-grid-item > .react-resizable-handle::after {
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 0px;
    height: 0px;
    border-style: solid;
    border-width: 0 0 10px 10px;
    border-color: transparent transparent
      ${({ theme }) => theme.colors.icon.default} transparent;
  }

  .react-grid-item > .react-resizable-handle:hover::after {
    border-color: transparent transparent
      ${({ theme }) => theme.colors.variants.primary.base} transparent;
  }

  .react-resizable-hide > .react-resizable-handle {
    display: none;
  }

  .react-grid-item > .react-resizable-handle.react-resizable-handle-sw {
    bottom: 0;
    left: 0;
    cursor: sw-resize;
    transform: rotate(90deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-se {
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-nw {
    top: 0;
    left: 0;
    cursor: nw-resize;
    transform: rotate(180deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-ne {
    top: 0;
    right: 0;
    cursor: ne-resize;
    transform: rotate(270deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-w,
  .react-grid-item > .react-resizable-handle.react-resizable-handle-e {
    top: 50%;
    margin-top: -10px;
    cursor: ew-resize;
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-w {
    left: 0;
    transform: rotate(135deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-e {
    right: 0;
    transform: rotate(315deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-n,
  .react-grid-item > .react-resizable-handle.react-resizable-handle-s {
    left: 50%;
    margin-left: -10px;
    cursor: ns-resize;
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-n {
    top: 0;
    transform: rotate(225deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-s {
    bottom: 0;
    transform: rotate(45deg);
  }
`

export default GridLayout

const GridItem = styled.div``
