import React from 'react'
import IconMdi from '../../atoms/IconMdi'
import Tooltip from '../../atoms/Tooltip'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'

interface EditorToolButtonProps {
  tooltip?: string
  path: string
  style?: React.CSSProperties
  dropdown?: React.ReactNode
  onClick?: () => void
  className?: string
}

const EditorToolButton = ({
  path,
  tooltip,
  style,
  onClick,
  className,
}: EditorToolButtonProps) => (
  <StyledEditorToolButtonContainer className={className}>
    <Tooltip tooltip={tooltip} side='bottom'>
      <StyledEditorToolButton onClick={onClick} style={style}>
        <IconMdi path={path} />
      </StyledEditorToolButton>
    </Tooltip>
  </StyledEditorToolButtonContainer>
)

export default EditorToolButton
