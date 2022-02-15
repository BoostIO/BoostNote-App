import React, { useCallback, useRef, useState } from 'react'
import cc from 'classcat'
import styled from '../../../../design/lib/styled'
import { AppComponent } from '../../../../design/lib/types'
import EmojiIcon from '../../EmojiIcon'
import Checkbox from '../../../../design/components/molecules/Form/atoms/FormCheckbox'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../../../../design/components/atoms/Icon'
import { mdiDragVertical } from '@mdi/js'
import { onDragLeaveCb } from '../../../../design/lib/dnd'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'

interface FolderListItemProps {
  id: string
  checked?: boolean
  onSelect: (val: boolean) => void
  label: string | React.ReactNode
  labelHref?: string
  labelOnclick?: () => void
  emoji?: string
  defaultIcon?: string
  showCheckbox: boolean
  onDragStart?: (event: any) => void
  onDragEnd?: (event: any) => void
  onDrop?: (event: any) => void
  hideOrderingHandle?: boolean
}

const ListViewItem: AppComponent<FolderListItemProps> = ({
  id,
  className,
  children,
  checked,
  label,
  labelHref,
  labelOnclick,
  emoji,
  defaultIcon,
  showCheckbox,
  hideOrderingHandle,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const [draggedOver, setDraggedOver] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const LabelTag = labelHref != null || labelOnclick != null ? 'a' : 'div'

  const navigate: React.MouseEventHandler = useCallback(
    (e) => {
      if (isDragging) {
        return
      }
      e.preventDefault()

      if (labelOnclick == null) {
        return
      }

      return labelOnclick()
    },
    [labelOnclick, isDragging]
  )

  return (
    <StyledContainer
      className={cc([
        'list-view-item',
        className,
        draggedOver && 'list-view-item--dragged-over',
      ])}
      ref={setNodeRef}
      style={style}
      {...attributes}
      draggable={true}
      onDrop={(event: any) => {
        event.stopPropagation()
        if (onDrop != null) {
          onDrop(event)
        }
        setDraggedOver(false)
      }}
      onDragStart={(event: any) => {
        event.stopPropagation()
        if (onDragStart != null) {
          onDragStart(event)
        }
      }}
      onDragOver={(event: any) => {
        event.preventDefault()
        event.stopPropagation()
        setDraggedOver(true)
      }}
      onDragLeave={(event: any) => {
        onDragLeaveCb(event, dragRef, () => {
          setDraggedOver(false)
        })
      }}
      onDragEnd={(event: any) => {
        if (onDragEnd != null) {
          onDragEnd(event)
        }
      }}
    >
      {showCheckbox ? (
        <Checkbox
          className={cc([
            'list-view-item__checkbox',
            checked && 'list-view-item__checkbox--checked',
          ])}
          checked={checked}
          toggle={() => onSelect(!checked)}
        />
      ) : (
        <div className='list-view-item__checkbox--placeholder' />
      )}
      {!hideOrderingHandle && (
        <div className='list-view-item__ordering-handle' {...listeners}>
          <Icon path={mdiDragVertical} />
        </div>
      )}
      <LabelTag
        draggable={true}
        className='list-view-item__label'
        onClick={navigate}
        href={labelHref}
      >
        <div className='list-view-item__label__emoji'>
          <EmojiIcon
            className='emoji-icon'
            defaultIcon={defaultIcon}
            emoji={emoji}
            size={16}
          />
        </div>
        {typeof label === 'string' ? (
          <span className='list-view-item__label__line'>{label}</span>
        ) : (
          <div className='list-view-item__label__col'>{label}</div>
        )}
      </LabelTag>
      {children != null && (
        <div className='list-view-item__content'>{children}</div>
      )}
    </StyledContainer>
  )
}

export default ListViewItem

const rowHeight = 40
const StyledContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  min-height: ${rowHeight}px;
  flex: 1 1 auto;
  flex-shrink: 0;
  width: 100%;
  font-size: 13px;
  padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;

  .list-view-item__ordering-handle {
    opacity: 0;
  }

  .list-view-item__status,
  .list-view-item__emoji {
    height: 100%;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};

    .list-view-item__ordering-handle {
      opacity: 1;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
    }

    .list-view-item__checkbox {
      opacity: 1;
    }
  }

  .list-view-item__label__emoji {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;

    .emoji-icon {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  .list-view-item__label {
    white-space: nowrap;
    display: flex;
    flex: 1 2 auto;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    min-height: ${rowHeight}px;
  }

  .item__label__line {
    ${overflowEllipsis()}
  }

  .list-view-item__checkbox--placeholder {
    height: 1px;
    width: ${({ theme }) => theme.sizes.spaces.md - 2}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .list-view-item__checkbox {
    opacity: 0;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;

    &.list-view-item__checkbox--checked {
      opacity: 1;
    }
  }

  &.list-view-item--dragged-over {
    background: ${({ theme }) => theme.colors.background.quaternary};
  }

  .list-view-item__content {
    flex: 0 1 auto;
    overflow: hidden;
    width: min-content;
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`
