export interface ModalElement {
  id: string
  title?: React.ReactNode
  content: React.ReactNode
  showCloseIcon?: boolean
  width: 'large' | 'default' | 'small' | 'full' | 'fit' | number
  height?: number
  maxHeight?: number
  minHeight?: number
  position?: {
    left: number
    right: number
    top: number
    bottom: number
    alignment: ContextModalAlignment
  }
  hideBackground?: boolean
  removePadding?: boolean
  onBlur?: boolean
  navigation?: ModalNavigationProps
  onClose?: () => void
}

export type ModalNavigationProps = {
  url: string
  fallbackUrl?: string
}

export type ContextModalAlignment =
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'right'

export type ModalOpeningOptions = {
  removePadding?: boolean
  showCloseIcon?: boolean
  keepAll?: boolean
  width?: 'large' | 'default' | 'small' | 'full' | 'fit' | number
  hideBackground?: boolean
  title?: string
  navigation?: ModalNavigationProps
  onClose?: () => void
}

export type ContextModalOpeningOptions = ModalOpeningOptions & {
  alignment?: ContextModalAlignment
  hideBackground?: boolean
  removePadding?: boolean
  onBlur?: boolean
  maxHeight?: number
  height?: number
  minHeight?: number
}

export interface ModalsContext {
  modals: ModalElement[]
  openContextModal: (
    event: React.MouseEvent<Element>,
    modalContent: JSX.Element,
    options?: ContextModalOpeningOptions
  ) => void
  openModal: (modalContent: JSX.Element, options?: ModalOpeningOptions) => void
  closeAllModals: () => void
  closeLastModal: () => void
}
