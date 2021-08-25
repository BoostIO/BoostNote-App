import React, { useState } from 'react'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import { FormattingTool } from './types'
import EditorAdmonitionToolDropdown from './EditorAdmonitionToolDropdown'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import Icon from '../../../design/components/atoms/Icon'

interface EditorAdmonitionToolProps {
  tooltip?: string
  path: string
  style?: React.CSSProperties
  onFormatCallback: (format: FormattingTool) => void
}

const EditorAdmonitionTool = ({
  path,
  tooltip,
  style,
  onFormatCallback,
}: EditorAdmonitionToolProps) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false)

  return (
    <StyledEditorToolButtonContainer>
      <WithTooltip tooltip={tooltip} side='bottom'>
        <StyledEditorToolButton
          onClick={() => setOpenDropdown((prev) => !prev)}
          style={style}
        >
          <Icon path={path} />
        </StyledEditorToolButton>
      </WithTooltip>
      {openDropdown && (
        <EditorAdmonitionToolDropdown
          onFormatCallback={onFormatCallback}
          closeDropdowndown={() => setOpenDropdown(false)}
        />
      )}
    </StyledEditorToolButtonContainer>
  )
}

export default EditorAdmonitionTool
