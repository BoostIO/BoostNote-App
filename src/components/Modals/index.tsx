import React, { useMemo, useCallback } from 'react'
import { useGlobalKeyDownHandler } from '../../lib/keyboard'
import { useModals } from '../../lib/modals/store'
import {
  StyledModalsBackground,
  StyledModalsContainer,
  StyledModalsSkipButton
} from './styled'
import Icon from '../atoms/Icon'
import { mdiChevronRightCircleOutline } from '@mdi/js'

interface ModalsRenderingOptions {
  closable: boolean
  body: JSX.Element
  onSkip?: () => void
}

export default () => {
  const { modalsContent, closeModals } = useModals()

  if (modalsContent == null) return null

  const content = useMemo((): ModalsRenderingOptions => {
    let basicModal: ModalsRenderingOptions = {
      closable: true,
      body: <></>
    }

    switch (modalsContent) {
      case 'download-app':
        basicModal.body = <span>hey</span>
        break
      default:
        break
    }

    return basicModal
  }, [modalsContent])

  const closeHandler = useCallback(() => {
    if (content.onSkip != null) {
      return content.onSkip()
    }
    return closeModals()
  }, [content])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (!closed && event.key === 'Escape' && content.closable) {
        closeHandler()
      }
    }
  }, [closeHandler])
  useGlobalKeyDownHandler(keydownHandler)

  const backgroundClickHandler = useMemo(() => {
    if (!content.closable) {
      return null
    }
    return closeHandler()
  }, [closeHandler])

  return (
    <StyledModalsBackground onClick={backgroundClickHandler}>
      <StyledModalsContainer>
        {content.body}

        {content.closable && (
          <StyledModalsSkipButton onClick={closeHandler}>
            Skip <Icon className='icon' path={mdiChevronRightCircleOutline} />
          </StyledModalsSkipButton>
        )}
      </StyledModalsContainer>
    </StyledModalsBackground>
  )
}
