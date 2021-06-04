export interface ModalElement {
  title?: React.ReactNode
  content: React.ReactNode
  showCloseIcon?: boolean
  width: 'large' | 'default' | 'small'
  onClose?: () => void
}

export type ModalOpeningOptions = {
  showCloseIcon?: boolean
  keepAll?: boolean
  width?: 'large' | 'default' | 'small'
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
