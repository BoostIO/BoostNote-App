export interface ModalElement {
  content: React.ReactNode
  showCloseIcon?: boolean
  size: 'large' | 'default'
}

export interface ModalOpeningOptions {
  showCloseIcon?: boolean
  keepAll?: boolean
  size?: 'large' | 'default'
}

export interface ModalsContext {
  modals: ModalElement[]
  openModal: (modalContent: JSX.Element, options?: ModalOpeningOptions) => void
  closeModal: (index: number, collapse?: boolean) => void
  closeAllModals: () => void
  closeLastModal: () => void
}
