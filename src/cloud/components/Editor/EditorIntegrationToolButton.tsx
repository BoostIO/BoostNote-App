import React, { useCallback } from 'react'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import { useSettings } from '../../lib/stores/settings'
import cc from 'classcat'
import { mdiFlash } from '@mdi/js'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import Icon from '../../../design/components/atoms/Icon'

const EditorIntegrationToolButton = () => {
  const { openSettingsTab } = useSettings()

  const settingsOnClickHandler = useCallback(() => {
    openSettingsTab('integrations')
  }, [openSettingsTab])

  return (
    <StyledEditorToolButtonContainer
      className={cc(['editor-tool-integrations'])}
    >
      <WithTooltip
        tooltip={'Connect 3rd party content to your documents in Boost Note'}
        side='bottom'
      >
        <StyledEditorToolButton onClick={settingsOnClickHandler}>
          <Icon path={mdiFlash} />
        </StyledEditorToolButton>
      </WithTooltip>
    </StyledEditorToolButtonContainer>
  )
}

export default EditorIntegrationToolButton
