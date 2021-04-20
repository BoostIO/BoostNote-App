export interface ModalElement {
  title?: React.ReactNode
  content: React.ReactNode
  showCloseIcon?: boolean
  size: 'large' | 'default' | 'fit'
  onClose?: () => void
}

export interface ModalOpeningOptions {
  showCloseIcon?: boolean
  keepAll?: boolean
  size?: 'large' | 'default' | 'fit'
  title?: string
  onClose?: () => void
}

export interface ModalsContext {
  modals: ModalElement[]
  openModal: (modalContent: JSX.Element, options?: ModalOpeningOptions) => void
  closeModal: (index: number, collapse?: boolean) => void
  closeAllModals: () => void
  closeLastModal: () => void
}
