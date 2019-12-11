export type ModalsContentOptions = 'download-app'

export interface ModalsRenderingOptions {
  closable: boolean
  skippable: boolean
  onClose?(): void
  body: JSX.Element
}

export interface ModalsContext {
  modalsContent: ModalsContentOptions | null
  openModals: (options: ModalsContentOptions) => void
  closeModals: () => void
}
