import React, { useMemo } from 'react'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import { useModal } from '../../../../lib/v2/stores/modal'
import { isActiveElementAnInput } from '../../../../lib/v2/dom'
import { useGlobalKeyDownHandler } from '../../../../lib/v2/keyboard'
import { usePathnameChangeEffect } from '../../../../cloud/lib/router'
import Icon from '../../atoms/Icon'
import styled from '../../../../lib/v2/styled'
import Button from '../../atoms/Button'

const Modal = () => {
  const { modals, closeAllModals, closeLastModal } = useModal()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape' && !isActiveElementAnInput()) {
        closeLastModal()
      }
    }
  }, [closeLastModal])
  useGlobalKeyDownHandler(keydownHandler)
  usePathnameChangeEffect(closeAllModals)

  if (modals.length === 0) return null

  return (
    <Container className='modal'>
      {modals.map((modal, i) => (
        <React.Fragment key={`modal-${i}`}>
          <div
            className='modal__background'
            onClick={(event) => {
              event.preventDefault()
              closeLastModal()
            }}
          />
          <div
            className={cc([
              'modal__window',
              `modal__window__size--${modal.size}`,
            ])}
          >
            {modal.showCloseIcon && (
              <Button
                variant='icon'
                iconPath={mdiClose}
                onClick={closeLastModal}
                className='modal__window__close'
              >
                <Icon path={mdiClose} />
              </Button>
            )}
          </div>
        </React.Fragment>
      ))}
    </Container>
  )
}

const zIndexModals = 8001
const Container = styled.div`
  z-index: ${zIndexModals};
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .modal__background {
    z-index: ${zIndexModals + 1};
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000;
    opacity: 0.7;
  }

  .modal__window {
    z-index: ${zIndexModals + 2};
    display: flex;
    position: relative;
    width: 96%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
    border-radius: 4px;
    overflow: auto;

    &.modal__window__size--fit {
      height: fit-content;
      width: fit-content;
      min-width: 400px;
    }

    &.modal__window__size--default {
      width: 900px;
      height: 60vh;
    }

    &.modal__window__size--large {
      width: 1100px;
      height: 80vh;
    }

    &.modal__window__size--full {
      width: 100%;
      height: 100%;
    }
  }

  .modal__window__close {
    position: absolute;
    top: 3px;
    right: 3px;
    white-space: nowrap;
    z-index: 1;
  }
`
export default Modal
