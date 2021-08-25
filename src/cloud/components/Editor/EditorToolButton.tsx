import React from 'react'
import Icon from '../../../design/components/atoms/Icon'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
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
    <WithTooltip tooltip={tooltip} side={'bottom'}>
      <StyledEditorToolButton onClick={onClick} style={style}>
        <Icon path={path} />
      </StyledEditorToolButton>
    </WithTooltip>
  </StyledEditorToolButtonContainer>
)

export default EditorToolButton
