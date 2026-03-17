import React, { useState, useRef, useCallback } from 'react'
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate dropdown position using getBoundingClientRect so it renders
  // correctly at any browser zoom level (fixes #1179)
  const handleButtonClick = useCallback(() => {
    if (!openDropdown && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.top - 4,
        left: rect.left,
        transform: 'translateY(-100%)',
        bottom: 'auto',
      })
    }
    setOpenDropdown((prev) => !prev)
  }, [openDropdown])

  return (
    <StyledEditorToolButtonContainer ref={containerRef}>
      <WithTooltip tooltip={tooltip} side='bottom'>
        <StyledEditorToolButton onClick={handleButtonClick} style={style}>
          <Icon path={path} />
        </StyledEditorToolButton>
      </WithTooltip>
      {openDropdown && (
        <EditorHeaderToolDropdown
          onFormatCallback={onFormatCallback}
          closeDropdowndown={() => setOpenDropdown(false)}
          dropdownStyle={dropdownStyle}
        />
      )}
    </StyledEditorToolButtonContainer>
  )
}

export default EditorHeaderTool
