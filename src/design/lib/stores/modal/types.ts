export interface ModalElement {
  title?: React.ReactNode
  content: React.ReactNode
  showCloseIcon?: boolean
  width: 'large' | 'default' | 'small' | 'full' | number
  height?: number
  maxHeight?: number
  position?: {
    left: number
    right: number
    top: number
    bottom: number
    alignment: ContextModalAlignment
  }
  hideBackground?: boolean
  removePadding?: boolean
  onClose?: () => void
}

export type ContextModalAlignment = 'bottom-left' | 'bottom-right' | 'top-left'
export type ModalOpeningOptions = {
  showCloseIcon?: boolean
  keepAll?: boolean
  width?: 'large' | 'default' | 'small' | 'full' | number
  title?: string
  onClose?: () => void
}

export type ContextModalOpeningOptions = ModalOpeningOptions & {
  alignment?: ContextModalAlignment
  hideBackground?: boolean
  removePadding?: boolean
  maxHeight?: number
  height?: number
}

export interface ModalsContext {
  modals: ModalElement[]
  openContextModal: (
    event: React.MouseEvent<Element>,
    modalContent: JSX.Element,
    options?: ContextModalOpeningOptions
  ) => void
  openModal: (modalContent: JSX.Element, options?: ModalOpeningOptions) => void
  closeModal: (index: number, collapse?: boolean) => void
  closeAllModals: () => void
  closeLastModal: () => void
}
