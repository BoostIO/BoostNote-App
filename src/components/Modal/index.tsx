import React, { useMemo, useCallback } from 'react'
import { useGlobalKeyDownHandler } from '../../lib/keyboard'
import { useModal } from '../../lib/modal'
import {
  StyledModalsBackground,
  StyledModalsContainer,
  StyledModalsSkipButton,
} from './styled'
import { usePreferences } from '../../lib/preferences'
import DownloadOurAppModal from './contents/DownloadOurAppModal'
import Icon from '../atoms/Icon'
import { mdiArrowRight } from '@mdi/js'
interface ModalsRenderingOptions {
  closable: boolean
  body: JSX.Element
  onSkip?: () => void
}

export default () => {
  const { modalContent, closeModal } = useModal()
  const { setPreferences } = usePreferences()

  const content = useMemo((): ModalsRenderingOptions => {
    const basicModal: ModalsRenderingOptions = {
      closable: true,
      body: <></>,
    }

    switch (modalContent) {
      case 'download-app':
        basicModal.body = <DownloadOurAppModal />
        basicModal.onSkip = () => {
          setPreferences({
            'general.enableDownloadAppModal': false,
          })
          closeModal()
        }
        break
      default:
        break
    }

    return basicModal
  }, [modalContent, setPreferences, closeModal])

  const closeHandler = useCallback(() => {
    if (content.onSkip != null) {
      return content.onSkip()
    }
    return closeModal()
  }, [closeModal, content])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeHandler()
      }
    }
  }, [closeHandler])
  useGlobalKeyDownHandler(keydownHandler)

  const backgroundClickHandler = useMemo(() => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      closeHandler()
    }
  }, [closeHandler])

  if (modalContent == null) return null

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
              Skip <Icon path={mdiArrowRight} />
            </span>
          </StyledModalsSkipButton>
        )}
      </StyledModalsContainer>
    </>
  )
}
