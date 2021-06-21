import React, { useState } from 'react'
import IconMdi from '../../atoms/IconMdi'
import Tooltip from '../../atoms/Tooltip'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import { FormattingTool } from './types'
import EditorAdmonitionToolDropdown from './EditorAdmonitionToolDropdown'

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
      <Tooltip tooltip={tooltip} side='bottom'>
        <StyledEditorToolButton
          onClick={() => setOpenDropdown((prev) => !prev)}
          style={style}
        >
          <IconMdi path={path} />
        </StyledEditorToolButton>
      </Tooltip>
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
