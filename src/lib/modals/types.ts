export type ModalsContentOptions = 'download-app'

export interface ModalsRenderingOptions {
  closable: boolean
  skippable: boolean
  onClose?(): void
  body: JSX.Element
}

export interface ModalsContext {
  modalsContent: ModalsContentOptions | null
  setModalsContent(options: ModalsContentOptions): void
  closeModals(): void
}
