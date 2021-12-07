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

interface ViewManagerContentRowProps {
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
}

const ViewManagerContentRow: AppComponent<ViewManagerContentRowProps> = ({
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
    <StyledContentManagerRow
      className={cc([
        'cm__row',
        className,
        draggedOver && 'content__manager__row--draggedOver',
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
      {showCheckbox && (
        <Checkbox
          className={cc(['row__checkbox', checked && 'row__checkbox--checked'])}
          checked={checked}
          toggle={() => onSelect(!checked)}
        />
      )}
      <div className='cm__row__orderingHandle' {...listeners}>
        <Icon path={mdiDragVertical} />
      </div>
      <LabelTag
        draggable={true}
        className='cm__row__label'
        onClick={navigate}
        href={labelHref}
      >
        <div className='cm__row__emoji'>
          <EmojiIcon
            className='emoji-icon'
            defaultIcon={defaultIcon}
            emoji={emoji}
            size={16}
          />
        </div>
        {typeof label === 'string' ? (
          <span className='cm__row__label--line'>{label}</span>
        ) : (
          <div className='cm__row__label--col'>{label}</div>
        )}
      </LabelTag>
      {children != null && <div className='cm__row__content'>{children}</div>}
    </StyledContentManagerRow>
  )
}

export default ViewManagerContentRow

const rowHeight = 40
const StyledContentManagerRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  min-height: ${rowHeight}px;
  flex: 1 1 auto;
  flex-shrink: 0;
  width: 100%;
  font-size: 13px;
  padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;

  .cm__row__orderingHandle {
    opacity: 0;
  }

  .cm__row__status,
  .cm__row__emoji {
    height: 100%;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    .custom-check::before {
      border-color: ${({ theme }) => theme.colors.text.secondary};
    }

    .row__checkbox {
      opacity: 1;
    }
    .cm__row__orderingHandle {
      opacity: 1;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
    }
  }

  .cm__row__emoji {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
  .emoji-icon {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .cm__row__label {
    width: 100%;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    min-height: ${rowHeight}px;
  }

  .row__checkbox {
    opacity: 0;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;

    &.row__checkbox--checked {
      opacity: 1;
    }
  }

  &.content__manager__row--draggedOver {
    background: ${({ theme }) => theme.colors.background.quaternary};
  }
`
