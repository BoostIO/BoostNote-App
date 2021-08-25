import React, { useCallback } from 'react'
import TemplatesModal from '../Modal/contents/TemplatesModal'
import { mdiPalette } from '@mdi/js'
import { SerializedTemplate } from '../../interfaces/db/template'
import { useModal } from '../../../design/lib/stores/modal'
import Button from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'

interface EditorTemplateButtonProps {
  onTemplatePickCallback: (template: SerializedTemplate) => void
}

const EditorTemplateButton = ({
  onTemplatePickCallback,
}: EditorTemplateButtonProps) => {
  const { openModal } = useModal()

  const onClick = useCallback(() => {
    openModal(<TemplatesModal callback={onTemplatePickCallback} />, {
      width: 'large',
    })
  }, [openModal, onTemplatePickCallback])

  return (
    <StyledEditorTemplateButton
      style={{
        display: 'inline-block',
        position: 'absolute',
        top: 35,
        left: 35,
      }}
    >
      <Button
        className='use-button'
        variant='transparent'
        onClick={onClick}
        iconPath={mdiPalette}
        iconSize={16}
      >
        <b>Use a Template</b>
      </Button>
    </StyledEditorTemplateButton>
  )
}

const StyledEditorTemplateButton = styled.div`
  .use-button {
    padding: 0px 4px;
    display: flex;
    align-items: center;
  }
`

export default EditorTemplateButton
