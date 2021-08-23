import React, { useState } from 'react'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import { FormattingTool } from './types'
import EditorHeaderToolDropdown from './EditorHeaderToolDropdown'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import Icon from '../../../design/components/atoms/Icon'

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
      <WithTooltip tooltip={tooltip} side='bottom'>
        <StyledEditorToolButton
          onClick={() => setOpenDropdown((prev) => !prev)}
          style={style}
        >
          <Icon path={path} />
        </StyledEditorToolButton>
      </WithTooltip>
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
