export interface ModalsOptions {
  closable: boolean
  classNames?: string
  style?: React.CSSProperties
}

export interface ModalsContext {
  modalContent: JSX.Element | null
  modalOptions: ModalsOptions
  openModal: (
    modalContent: JSX.Element,
    options?: Partial<ModalsOptions>
  ) => void
  closeModal: () => void
}
