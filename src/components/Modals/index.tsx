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
import { usePreferences } from '../../lib/preferences'
import DownloadOurAppModal from './contents/DownloadOurAppModal'

interface ModalsRenderingOptions {
  closable: boolean
  body: JSX.Element
  onSkip?: () => void
}

export default () => {
  const { modalsContent, closeModals } = useModals()
  const { setPreferences } = usePreferences()

  const content = useMemo((): ModalsRenderingOptions => {
    const basicModal: ModalsRenderingOptions = {
      closable: true,
      body: <></>
    }

    switch (modalsContent) {
      case 'download-app':
        basicModal.body = <DownloadOurAppModal />
        basicModal.onSkip = () => {
          setPreferences({
            'general.enableDownloadAppModal': false
          })
          closeModals()
        }
        break
      default:
        break
    }

    return basicModal
  }, [modalsContent, setPreferences, closeModals])

  const closeHandler = useCallback(() => {
    if (content.onSkip != null) {
      return content.onSkip()
    }
    return closeModals()
  }, [closeModals, content])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeHandler()
      }
    }
  }, [closeHandler])
  useGlobalKeyDownHandler(keydownHandler)

  const backgroundClickHandler = useMemo(() => {
    return (event: MouseEvent) => {
      event.preventDefault()
      closeHandler()
    }
  }, [closeHandler])

  if (modalsContent == null) return null

  return (
    <>
      <StyledModalsBackground
        onClick={backgroundClickHandler}
      ></StyledModalsBackground>
      <StyledModalsContainer>
        {content.body}

        {content.closable && (
          <StyledModalsSkipButton onClick={closeHandler}>
            <span>
              Skip <Icon className='icon' path={mdiChevronRightCircleOutline} />
            </span>
          </StyledModalsSkipButton>
        )}
      </StyledModalsContainer>
    </>
  )
}
