export interface GeneralStatus {
  sideBarWidth: number
  noteListWidth: number
  noteViewMode: ViewModeType
  sideNavOpenedItemList: string[]
}

export type ViewModeType = 'edit' | 'preview' | 'split'
