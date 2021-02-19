import React, { useState } from 'react'
import IconMdi from '../../atoms/IconMdi'
import Tooltip from '../../atoms/Tooltip'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import { FormattingTool } from './types'
import EditorHeaderToolDropdown from './EditorHeaderToolDropdown'

interface EditorHeaderToolProps {
  tooltip?: string
  path: string
  style?: React.CSSProperties
  onFormatCallback: (format: FormattingTool) => void
}

const EditorHeaderTool = ({
  path,
  tooltip,
  style,
  onFormatCallback,
}: EditorHeaderToolProps) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false)

  return (
    <StyledEditorToolButtonContainer>
      <Tooltip tooltip={tooltip} side='top'>
        <StyledEditorToolButton
          onClick={() => setOpenDropdown((prev) => !prev)}
          style={style}
        >
          <IconMdi path={path} />
        </StyledEditorToolButton>
      </Tooltip>
      {openDropdown && (
        <EditorHeaderToolDropdown
          onFormatCallback={onFormatCallback}
          closeDropdowndown={() => setOpenDropdown(false)}
        />
      )}
    </StyledEditorToolButtonContainer>
  )
}

export default EditorHeaderTool
