export type ModalsContentOptions = 'download-app'

export interface ModalsRenderingOptions {
  closable: boolean
  skippable: boolean
  onClose?(): void
  body: JSX.Element
}

export interface ModalsContext {
  modalContent: ModalsContentOptions | null
  openModal: (options: ModalsContentOptions) => void
  closeModal: () => void
}
