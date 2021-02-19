import React, { useCallback, useEffect } from 'react'
import cc from 'classcat'
import { LayoutMode } from '../layouts/DocEditLayout'
import { mdiEye, mdiPencil, mdiViewSplitVertical } from '@mdi/js'
import IconMdi from '../atoms/IconMdi'
import { MetaKeyText } from '../../lib/keyboard'
import Tooltip from '../atoms/Tooltip'
import styled from '../../lib/styled'
import { usePreferences } from '../../lib/stores/preferences'
import {
  trackAction,
  ActionTrackTypes,
} from '../../lib/analytics/mixpanelFront'
import {
  togglePreviewModeEventEmitter,
  toggleSplitEditModeEventEmitter,
} from '../../lib/utils/events'
import { StyledTopBarIcon } from '../organisms/RightSideTopBar/styled'

interface LayoutSelectProps {
  currentMode: LayoutMode
  teamId: string
  docId: string
  setLayout: (mode: LayoutMode) => void
}

const LayoutSelect = ({
  currentMode,
  teamId,
  docId,
  setLayout,
}: LayoutSelectProps) => {
  const { preferences } = usePreferences()

  const updateLayout = useCallback(
    (mode: LayoutMode) => {
      setLayout(mode)
    },
    [setLayout]
  )

  const toggleViewMode = useCallback(() => {
    if (currentMode === 'preview') {
      trackAction(ActionTrackTypes.DocLayoutEdit, {
        teamId,
        docId,
      })
      updateLayout(preferences.lastUsedLayout)
      return
    }
    updateLayout('preview')
  }, [updateLayout, preferences.lastUsedLayout, currentMode, teamId, docId])

  useEffect(() => {
    togglePreviewModeEventEmitter.listen(toggleViewMode)
    return () => {
      togglePreviewModeEventEmitter.unlisten(toggleViewMode)
    }
  }, [toggleViewMode])

  const toggleSplitEditMode = useCallback(() => {
    updateLayout(currentMode === 'split' ? 'editor' : 'split')
  }, [updateLayout, currentMode])

  useEffect(() => {
    toggleSplitEditModeEventEmitter.listen(toggleSplitEditMode)
    return () => {
      toggleSplitEditModeEventEmitter.unlisten(toggleSplitEditMode)
    }
  }, [toggleSplitEditMode])

  return (
    <StyledLayoutSelect>
      {currentMode !== 'preview' && (
        <Tooltip tooltip={`${MetaKeyText()} + \\`}>
          <StyledTopBarIcon
            onClick={toggleSplitEditMode}
            variant='transparent'
            className={cc(['btn-split', currentMode === 'split' && 'active'])}
          >
            <IconMdi data-tip='out' path={mdiViewSplitVertical} size={24} />
          </StyledTopBarIcon>
        </Tooltip>
      )}
      <Tooltip tooltip={`${MetaKeyText()} + E`}>
        <StyledButtonFLex>
          {currentMode !== 'preview' ? (
            <StyledTopBarIcon onClick={toggleViewMode} className='btn-preview'>
              <IconMdi path={mdiEye} size={24} />
            </StyledTopBarIcon>
          ) : (
            <StyledTopBarIcon onClick={toggleViewMode} className='btn-edit'>
              <IconMdi path={mdiPencil} size={24} />
            </StyledTopBarIcon>
          )}
        </StyledButtonFLex>
      </Tooltip>
    </StyledLayoutSelect>
  )
}

const StyledLayoutSelect = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  margin: 0 ${({ theme }) => theme.space.xxsmall}px;
`
const StyledButtonFLex = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
`

export default LayoutSelect
