import React, {
  ChangeEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  useCallback,
} from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import { useEmojiPicker } from '../../../../../cloud/lib/stores/emoji'
import Icon from '../../../atoms/Icon'
import { Emoji } from 'emoji-mart'

export interface FormEmojiProps {
  emoji?: string
  defaultIcon: string
  tooltip?: string
  className?: string
  setEmoji: (value?: string) => void
  onBlur?: FocusEventHandler<HTMLDivElement>
  onChange?: ChangeEventHandler<HTMLDivElement>
  onMouseUp?: MouseEventHandler<HTMLDivElement>
  onMouseDown?: MouseEventHandler<HTMLDivElement>
  onMouseMove?: MouseEventHandler<HTMLDivElement>
  onMouseOver?: MouseEventHandler<HTMLDivElement>
  onMouseOut?: MouseEventHandler<HTMLDivElement>
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onContextMenu?: MouseEventHandler<HTMLDivElement>
  onFocus?: FocusEventHandler<HTMLDivElement>
}

const FormEmoji = React.forwardRef<HTMLDivElement, FormEmojiProps>(
  (
    {
      emoji,
      defaultIcon,
      className,
      setEmoji,
      onBlur,
      onChange,
      onMouseUp,
      onMouseDown,
      onMouseMove,
      onMouseOver,
      onMouseOut,
      onMouseEnter,
      onMouseLeave,
      onDoubleClick,
      onContextMenu,
      onFocus,
    },
    ref
  ) => {
    const { openEmojiPickerWithCallback } = useEmojiPicker()
    const emojiPickerClickHandler = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        openEmojiPickerWithCallback(event, setEmoji)
      },
      [openEmojiPickerWithCallback, setEmoji]
    )

    return (
      <Container
        type='button'
        className={cc(['form__emoji', className])}
        ref={ref}
        onClick={emojiPickerClickHandler}
        onBlur={onBlur}
        onChange={onChange}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onFocus={onFocus}
      >
        {emoji != null ? (
          <Emoji emoji={emoji} set='apple' size={20} />
        ) : (
          <Icon path={defaultIcon} size={20} />
        )}
      </Container>
    )
  }
)

export default FormEmoji

const Container = styled.button`
  padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  height: 32px;
  outline: none;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  color: ${({ theme }) => theme.colors.text.primary};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.variants.info.base};
  }
`
