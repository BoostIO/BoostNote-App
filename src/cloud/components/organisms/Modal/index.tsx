import React, { useMemo, useCallback } from 'react'
import { useModal } from '../../../lib/stores/modal'
import {
  StyledModals,
  StyledModalsBackground,
  StyledModalsContainer,
  StyledModalsCloseButton,
} from './styled'
import { useGlobalKeyDownHandler } from '../../../lib/keyboard'
import Icon from '../../atoms/IconMdi'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import { isActiveElementAnInput } from '../../../lib/dom'
import { usePathnameChangeEffect } from '../../../lib/router'

const Modal = () => {
  const { modalContent, modalOptions, closeModal } = useModal()

  const closeHandler = useCallback(() => {
    return closeModal()
  }, [closeModal])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape' && !isActiveElementAnInput()) {
        closeHandler()
      }
    }
  }, [closeHandler])
  useGlobalKeyDownHandler(keydownHandler)

  usePathnameChangeEffect(closeModal)

  const backgroundClickHandler = useMemo(() => {
    return (event: MouseEvent) => {
      event.preventDefault()
      closeHandler()
    }
  }, [closeHandler])

  if (modalContent == null) return null

  return (
    <StyledModals>
      <StyledModalsBackground onClick={backgroundClickHandler} />
      <StyledModalsContainer
        className={cc([modalOptions.classNames])}
        style={modalOptions.style}
      >
        {modalOptions.closable && (
          <StyledModalsCloseButton onClick={closeHandler}>
            <Icon path={mdiClose} />
          </StyledModalsCloseButton>
        )}
        {modalContent}
      </StyledModalsContainer>
    </StyledModals>
  )
}

export default Modal
