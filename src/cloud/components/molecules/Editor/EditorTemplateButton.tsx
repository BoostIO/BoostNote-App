import React, { useCallback } from 'react'
import CustomButton from '../../atoms/buttons/CustomButton'
import { useModal } from '../../../lib/stores/modal'
import TemplatesModal from '../../organisms/Modal/contents/TemplatesModal'
import { mdiPalette } from '@mdi/js'
import IconMdi from '../../atoms/IconMdi'
import styled from '../../../lib/styled'
import { SerializedTemplate } from '../../../interfaces/db/template'

interface EditorTemplateButtonProps {
  onTemplatePickCallback: (template: SerializedTemplate) => void
}

const EditorTemplateButton = ({
  onTemplatePickCallback,
}: EditorTemplateButtonProps) => {
  const { openModal } = useModal()

  const onClick = useCallback(() => {
    openModal(<TemplatesModal callback={onTemplatePickCallback} />, {
      classNames: 'size-XL',
      closable: false,
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
      <CustomButton
        variant='transparent'
        style={{
          padding: '0px 4px',
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={onClick}
      >
        <IconMdi path={mdiPalette} size={16} />
        <b>Use a Template</b>
      </CustomButton>
    </StyledEditorTemplateButton>
  )
}

const StyledEditorTemplateButton = styled.div``

export default EditorTemplateButton
