import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { BlockPropertyProps } from './types'
import FormTextarea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import { useEffectOnce } from 'react-use'
import { useWindow } from '../../../../design/lib/stores/window'
import { zIndexModalsBackground } from '../../Topbar/Controls/ControlsContextMenu/styled'
import ControlsContextMenuBackground from '../../Topbar/Controls/ControlsContextMenu/ControlsContextMenuBackground'
import InteractableCell from '../views/Table/InteractableCell'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import WithTooltip from '../../../../design/components/atoms/WithTooltip'

interface TextPropProps extends BlockPropertyProps {
  validation?: (value: string) => boolean
  placeholder?: string | React.ReactNode
  controls?: {
    tooltip?: string
    onClick?: () => void
    iconPath: string
    id?: string
    spinning?: boolean
    disabled?: boolean
  }[]
}

const formWidth = 230
const formHeight = 80
const TextProp = ({
  value,
  onUpdate,
  validation,
  placeholder,
  currentUserIsCoreMember,
  controls,
}: TextPropProps) => {
  const [internal, setInternal] = useState(value)
  const [hasError, setHasError] = useState(false)
  const { windowSize } = useWindow()
  const [contextPosition, setContextPosition] = useState<
    { top: number; left: number } | undefined
  >(undefined)

  const onBlur = useCallback(() => {
    setContextPosition(undefined)
    if (validation == null || validation(internal)) {
      onUpdate(internal)
    } else {
      setHasError(true)
    }
  }, [onUpdate, internal, validation])

  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      setInternal(ev.target.value)
    },
    []
  )

  useEffect(() => {
    setInternal(value)
  }, [value])

  return (
    <Container>
      <InteractableCell
        className={hasError ? 'text-cell--error' : ''}
        disabled={!currentUserIsCoreMember}
        onClick={(ev) => {
          const currentTargetRect = ev.currentTarget.getBoundingClientRect()
          setContextPosition({
            left: currentTargetRect.left,
            top: currentTargetRect.top,
          })
        }}
      >
        {value.trim() !== '' ? (
          value
        ) : (
          <span className='text-cell__placeholder'>{placeholder}</span>
        )}
      </InteractableCell>
      {controls != null && (
        <div className='text-cell__controls'>
          {controls.map((control, key) => (
            <WithTooltip side='top' key={key} tooltip={control.tooltip}>
              <LoadingButton
                variant={control.onClick != null ? 'secondary' : 'transparent'}
                iconPath={control.iconPath}
                iconSize={16}
                size='sm'
                spinning={control.spinning}
                onClick={control.onClick}
                disabled={control.disabled}
              />
            </WithTooltip>
          ))}
        </div>
      )}
      {contextPosition != null && (
        <TextCellForm
          contextPosition={{
            left:
              contextPosition.left + formWidth < windowSize.width - 10
                ? contextPosition.left
                : windowSize.width - formWidth - 10,
            top:
              contextPosition.top + formHeight < windowSize.height - 10
                ? contextPosition.top
                : windowSize.height - formHeight - 10,
          }}
          value={internal}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={
            typeof placeholder === 'string' ? placeholder : undefined
          }
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  padding: 0 !important;
  position: relative;

  .text-cell__placeholder {
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .interactable-cell {
    width: 100%;
    height: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    display: flex;
    align-items: center;
  }

  .text-cell__controls {
    position: absolute;
    top: 0;
    right: 0;
  }
`

const TextCellForm = ({
  contextPosition,
  placeholder,
  value,
  onChange,
  onBlur,
}: {
  contextPosition: { top: number; left: number }
  placeholder?: string
  value?: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
  onBlur: () => void
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffectOnce(() => {
    if (textAreaRef.current != null) {
      textAreaRef.current.focus()
      textAreaRef.current.setSelectionRange(
        textAreaRef.current.value.length,
        textAreaRef.current.value.length
      )
    }
  })

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      if (ev.key === 'Enter' && !(ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault()
        ev.stopPropagation()
        onBlur()
        return
      }

      if (ev.key === 'Esc' || ev.key === 'Escape') {
        ev.preventDefault()
        ev.stopPropagation()
        onBlur()
      }
    },
    [onBlur]
  )

  return (
    <>
      <ControlsContextMenuBackground closeContextMenu={onBlur} />
      <StyledTextCellForm style={{ ...contextPosition }}>
        <FormTextarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          ref={textAreaRef}
          onKeyDown={onKeyDown}
        />
      </StyledTextCellForm>
    </>
  )
}

const StyledTextCellForm = styled.div`
  position: fixed;
  z-index: ${zIndexModalsBackground + 1};
  width: auto !important;
  height: fit-content !important;
  padding: 0 !important;

  textarea {
    width: ${formWidth}px;
    height: ${formHeight}px;
    background: ${({ theme }) => theme.colors.background.primary};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default TextProp
