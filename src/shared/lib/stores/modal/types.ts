export interface ModalElement {
  title?: React.ReactNode
  content: React.ReactNode
  showCloseIcon?: boolean
  width: 'large' | 'default' | 'small' | 'fit'
  position?: { x: number; y: number }
  onClose?: () => void
}

export type ModalOpeningOptions = {
  showCloseIcon?: boolean
  keepAll?: boolean
  width?: 'large' | 'default' | 'small' | 'fit'
  title?: string
  onClose?: () => void
}

export interface ModalsContext {
  modals: ModalElement[]
  openContextModal: (
    event: React.MouseEvent<Element>,
    modalContent: JSX.Element,
    options?: ModalOpeningOptions
  ) => void
  openModal: (modalContent: JSX.Element, options?: ModalOpeningOptions) => void
  closeModal: (index: number, collapse?: boolean) => void
  closeAllModals: () => void
  closeLastModal: () => void
}
