import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import { ModalElement, useModal } from '../../../lib/stores/modal'
import { isActiveElementAnInput } from '../../../lib/dom'
import { useGlobalKeyDownHandler } from '../../../lib/keyboard'
import styled from '../../../lib/styled'
import Button from '../../atoms/Button'
import Scroller from '../../atoms/Scroller'
import { useWindow } from '../../../lib/stores/window'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useEffectOnce } from 'react-use'
import { useRouter } from '../../../../cloud/lib/router'
import { useEffectOnUnmount } from '../../../../lib/hooks'
import {
  ModalEventDetails,
  modalEventEmitter,
} from '../../../../cloud/lib/utils/events'

const Modal = () => {
  const { modals, closeLastModal } = useModal()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape' && !isActiveElementAnInput()) {
        modalEventEmitter.dispatch({ type: `modal-${modals.length - 1}-close` })
      }
    }
  }, [modals.length])
  useGlobalKeyDownHandler(keydownHandler)

  if (modals.length === 0) return null

  return (
    <Container
      className={cc([
        'modal',
        modals.length === 1 && modals[0].position != null && 'modal--context',
      ])}
    >
      {modals.map((modal, i) => {
        if (modal.position != null) {
          return (
            <ContextModalItem
              key={`modal-${i}`}
              modal={modal}
              id={i}
              closeModal={closeLastModal}
            />
          )
        }

        return (
          <ModalItem
            key={`modal-${i}`}
            modal={modal}
            id={i}
            closeModal={closeLastModal}
          />
        )
      })}
    </Container>
  )
}

const ContextModalItem = ({
  closeModal,
  modal,
  id,
}: {
  closeModal: () => void
  modal: ModalElement
  id: number
}) => {
  const {
    windowSize: { width: windowWidth, height: windowHeight },
  } = useWindow()
  const modalWidth = typeof modal.width === 'string' ? 400 : modal.width
  const contentScrollerRef = useRef<OverlayScrollbarsComponent>(null)
  const manualClosing = useRef(false)

  const style: CSSProperties | undefined = useMemo(() => {
    const properties: CSSProperties = {
      width: modalWidth,
      height: modal.height,
      maxHeight:
        modal.position?.alignment === 'bottom-left' ||
        modal.position?.alignment === 'bottom-right' ||
        modal.position?.alignment === 'right'
          ? windowHeight - (modal.position?.bottom || 0) - 10
          : modal.maxHeight != null
          ? modal.maxHeight
          : (modal.position?.top || 0) -
            ((modal.position?.bottom || 0) - (modal.position?.top || 0)) -
            10,
    }

    if (modal.position != null) {
      switch (modal.position.alignment) {
        case 'bottom-right':
          properties.left =
            modal.position.right < windowWidth - 10
              ? modal.position.right - modalWidth
              : windowWidth - modalWidth - 10
          properties.top = modal.position.bottom + 6
          break
        case 'bottom-left':
          properties.left =
            modal.position.left + modalWidth < windowWidth - 10
              ? modal.position.left
              : windowWidth - modalWidth - 10
          properties.top = modal.position.bottom + 6
          break
        case 'top-left':
          properties.left =
            modal.position.left + modalWidth < windowWidth - 10
              ? modal.position.left
              : windowWidth - modalWidth - 10
          properties.bottom = windowHeight - modal.position.top + 10
          break
        case 'right':
          properties.left =
            modal.position.right + modalWidth < windowWidth - 10
              ? modal.position.right + 10
              : windowWidth - modalWidth - 10
          properties.top = modal.position.top
          break
        default:
          break
      }
    }

    if (properties.maxHeight! < 80) {
      properties.minHeight = modal.minHeight != null ? modal.minHeight : 100
      properties.maxHeight = 200
      properties.top = undefined
      properties.bottom = 6
    }

    return properties
  }, [
    modal.minHeight,
    modal.position,
    windowWidth,
    modalWidth,
    windowHeight,
    modal.height,
    modal.maxHeight,
  ])

  useEffectOnce(() => {
    if (contentScrollerRef.current != null) {
      const instance = contentScrollerRef.current.osInstance()
      if (instance != null) {
        instance.scroll({ top: 0 })
      }
    }
  })

  const closing = useCallback(() => {
    manualClosing.current = true
    closeModal()
  }, [closeModal])

  const closeModalOnEscape = useCallback(
    (event: CustomEvent<ModalEventDetails>) => {
      if (event.detail.type !== `modal-${id}-close`) {
        return
      }
      closing()
    },
    [closing, id]
  )

  useEffect(() => {
    modalEventEmitter.listen(closeModalOnEscape)
    return () => {
      modalEventEmitter.unlisten(closeModalOnEscape)
    }
  }, [closeModalOnEscape])

  useModalNavigationHistory(modal, manualClosing)

  if (modal.onBlur != null) {
    return (
      <>
        <div className='modal__window__anchor' />
        <Scroller
          ref={contentScrollerRef}
          className={cc([
            'modal__window',
            `modal__window__width--${modal.width}`,
            modal.position != null && `modal__window--context`,
            modal.hideBackground && 'modal__window--no-bg',
            modal.removePadding && 'modal__window--no-padding',
          ])}
          style={style}
        >
          <div className='modal__wrapper'>
            {modal.title != null && (
              <h3 className='modal__title'>{modal.title}</h3>
            )}
            <div className='modal__content'>{modal.content}</div>
          </div>
        </Scroller>
      </>
    )
  }

  return (
    <>
      <div className='modal__window__scroller'>
        <div className='modal__bg__hidden' onClick={closeModal}></div>
        <div className='modal__window__anchor' />
        <Scroller
          ref={contentScrollerRef}
          className={cc([
            'modal__window',
            `modal__window__width--${modal.width}`,
            modal.position != null && `modal__window--context`,
            modal.hideBackground && 'modal__window--no-bg',
            modal.removePadding && 'modal__window--no-padding',
          ])}
          style={style}
        >
          <div className='modal__wrapper'>
            {modal.title != null && (
              <h3 className='modal__title'>{modal.title}</h3>
            )}
            <div className='modal__content'>{modal.content}</div>
          </div>
        </Scroller>
      </div>
    </>
  )
}

const ModalItem = ({
  closeModal,
  modal,
  id,
}: {
  closeModal: () => void
  modal: ModalElement
  id: number
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const manualClosing = useRef(false)

  const closing = useCallback(() => {
    manualClosing.current = true
    closeModal()
  }, [closeModal])

  const onScrollClickHandler: React.MouseEventHandler = useCallback(
    (event) => {
      if (
        contentRef.current != null &&
        contentRef.current.contains(event.target as Node)
      ) {
        return
      }
      closing()
    },
    [closing]
  )

  const closeModalOnEscape = useCallback(
    (event: CustomEvent<ModalEventDetails>) => {
      if (event.detail.type !== `modal-${id}-close`) {
        return
      }
      closing()
    },
    [closing, id]
  )

  useEffect(() => {
    modalEventEmitter.listen(closeModalOnEscape)
    return () => {
      modalEventEmitter.unlisten(closeModalOnEscape)
    }
  }, [closeModalOnEscape])

  useModalNavigationHistory(modal, manualClosing)

  return (
    <Scroller
      className='modal__window__scroller'
      onClick={onScrollClickHandler}
    >
      <div
        ref={contentRef}
        className={cc([
          'modal__window',
          `modal__window__width--${modal.width}`,
          modal.hideBackground && 'modal__window--no-bg',
          modal.position != null && `modal__window--context`,
          modal.removePadding && 'modal__window--no-padding',
        ])}
      >
        {modal.showCloseIcon && (
          <Button
            variant='icon'
            iconPath={mdiClose}
            onClick={closing}
            className='modal__window__close'
            iconSize={26}
          />
        )}
        <div className='modal__wrapper'>
          {modal.title != null && (
            <h3 className='modal__title'>{modal.title}</h3>
          )}
          <div className='modal__content'>{modal.content}</div>
        </div>
      </div>
    </Scroller>
  )
}

function useModalNavigationHistory(
  modal: ModalElement,
  manualClosing: React.MutableRefObject<boolean>
) {
  const { push, goBack } = useRouter()
  const previousModalRef = useRef({
    id: modal.id,
    navigation: modal.navigation,
  })

  //push modal's url to history on load
  useEffectOnce(() => {
    if (modal.navigation == null) {
      return
    }
    push(modal.navigation.url)
  })

  //on modals change ( no unmount ), triggers the navigation for the replaced modal
  useEffect(() => {
    if (modal.id !== previousModalRef.current.id) {
      if (previousModalRef.current.navigation == null) {
        previousModalRef.current = {
          id: modal.id,
          navigation: modal.navigation,
        }
        return
      }

      if (previousModalRef.current.navigation.fallbackUrl != null) {
        push(previousModalRef.current.navigation.fallbackUrl)
      } else if (goBack != null) {
        goBack()
      }
      previousModalRef.current = { id: modal.id, navigation: modal.navigation }
    }
  }, [modal, push, goBack])

  //on modal's closure, goes back to wanted URL
  useEffectOnUnmount(() => {
    if (!manualClosing.current || modal.navigation == null) {
      return
    }

    if (modal.navigation.fallbackUrl != null) {
      push(modal.navigation.fallbackUrl)
    } else if (goBack != null) {
      goBack()
    }
  })
}

export const zIndexModals = 8001
const Container = styled.div`
  z-index: ${zIndexModals};

  &:not(.modal--context)::before {
    content: '';
    z-index: ${zIndexModals + 1};
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    background-color: #000;
    opacity: 0.7;
  }

  .modal__window--no-bg {
    background: none !important;
  }

  .modal__window--no-padding,
  .modal__window--no-padding .modal__wrapper {
    padding: 0 !important;
  }

  .modal__bg__hidden {
    z-index: ${zIndexModals + 1};
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
  }

  .modal__window__anchor {
    position: relative;
    z-index: ${zIndexModals + 3};
  }

  .modal__window__scroller {
    z-index: ${zIndexModals + 2};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
  }

  .modal__window--context {
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    height: auto !important;
    position: fixed !important;
    margin: 0 !important;
    right: 0;
    left: 0;
    background-color: ${({ theme }) =>
      theme.colors.background.primary} !important;
  }

  .modal__window {
    z-index: ${zIndexModals + 2};
    position: relative;
    width: 900px;
    max-width: 96%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
    border-radius: 4px;
    height: fit-content;
    margin: 1.75rem auto;
    display: block;
    float: center;

    &.modal__window__width--fit {
      width: fit-content;
    }

    &.modal__window__width--small {
      width: 600px;
    }

    &.modal__window__width--large {
      width: 1100px;
    }

    &.modal__window__width--full {
      width: 96%;
    }
  }

  .modal__window__close {
    position: absolute;
    top: ${({ theme }) => theme.sizes.spaces.sm}px;
    right: ${({ theme }) => theme.sizes.spaces.df}px;
    white-space: nowrap;
    z-index: 1;
  }

  .modal__wrapper {
    display: flex;
    margin: 0;
    min-width: 0;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    padding: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .modal__title {
    flex: 0 0 auto;
    margin: 0 0 ${({ theme }) => theme.sizes.spaces.md}px 0;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
  }

  .modal__content {
    flex: 1 1 10px;
  }
`
export default React.memo(Modal)
