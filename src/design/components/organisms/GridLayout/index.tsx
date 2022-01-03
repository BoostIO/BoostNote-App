import React from 'react'
import RGL, { WidthProvider, Layout } from 'react-grid-layout'
import _ from 'lodash'
import { useCallback } from 'react'
import styled from '../../../lib/styled'

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
      console.log(dataGrid)
      return (
        <GridItem key={item.id} className='grid__item' data-grid={dataGrid}>
          {renderItem(item)}
        </GridItem>
      )
    })
  }, [items, renderItem, layout])

  return (
    <StyledReactGridLayout
      style={{ height: '100%' }}
      className={className}
      onLayoutChange={onLayoutChange}
      isDraggable={true}
      isDroppable={false}
      isResizable={true}
      rows={rows}
      cols={cols}
      rowHeight={rowHeight}
      useCSSTransforms={false}
      resizeHandle={resizeHandle}
    >
      {generateDOM()}
    </StyledReactGridLayout>
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
    background: red;
    opacity: 0.2;
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
  }

  .react-grid-item > .react-resizable-handle::after {
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 5px;
    height: 5px;
    border-right: 2px solid rgba(0, 0, 0, 0.4);
    border-bottom: 2px solid rgba(0, 0, 0, 0.4);
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
    cursor: se-resize;
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
