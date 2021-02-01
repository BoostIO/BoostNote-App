import React, { useCallback } from 'react'
import IconMdi from '../../atoms/IconMdi'
import Tooltip from '../../atoms/Tooltip'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import { useSettings } from '../../../lib/stores/settings'
import cc from 'classcat'
import { mdiFlash } from '@mdi/js'

const EditorIntegrationToolButton = () => {
  const { openSettingsTab } = useSettings()

  const settingsOnClickHandler = useCallback(() => {
    openSettingsTab('integrations')
  }, [openSettingsTab])

  return (
    <StyledEditorToolButtonContainer
      className={cc(['editor-tool-integrations'])}
    >
      <Tooltip
        tooltip={
          'Connect 3rd party content to your documents in Boost Note for teams'
        }
        side='top'
      >
        <StyledEditorToolButton onClick={settingsOnClickHandler}>
          <IconMdi path={mdiFlash} />
        </StyledEditorToolButton>
      </Tooltip>
    </StyledEditorToolButtonContainer>
  )
}

export default EditorIntegrationToolButton
