import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { BlockPropertyProps } from './types'

interface TextPropProps extends BlockPropertyProps {
  validation?: (value: string) => boolean
}

const TextProp = ({ value, onUpdate, validation }: TextPropProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [internal, setInternal] = useState(value)
  const [hasError, setHasError] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setInternal(value)
  }, [value])

  const onBlur = useCallback(() => {
    if (validation == null || validation(internal)) {
      onUpdate(internal)
      setMode('view')
    } else {
      setHasError(true)
    }
  }, [onUpdate, internal])

  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      setInternal(ev.target.value)
    },
    []
  )

  useEffect(() => {
    if (mode === 'edit' && textAreaRef.current != null) {
      textAreaRef.current.focus()
    }
  }, [mode])

  if (mode === 'view') {
    return (
      <StyledTextCell onClick={() => setMode('edit')}>{value}</StyledTextCell>
    )
  }

  return (
    <StyledTextCell className={hasError ? 'text-cell--error' : ''}>
      <textarea
        ref={textAreaRef}
        onBlur={onBlur}
        onChange={onChange}
        value={internal}
      />
    </StyledTextCell>
  )
}

export default TextProp

const StyledTextCell = styled.div`
  min-height: 20px;
  cursor: pointer;
`
