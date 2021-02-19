import { EmojiResource } from '../../../components/organisms/Sidebar/SideNavigator/SideNavIcon'

export type Position = { x: number; y: number }

export interface EmojiPickerContext {
  closed: boolean
  callback?: (x?: string) => void
  position: Position
  resource?: EmojiResource
  openEmojiPicker(
    event: React.MouseEvent<unknown>,
    resource: EmojiResource
  ): void
  openEmojiPickerWithCallback(
    event: React.MouseEvent<unknown>,
    callback: (val?: string) => void
  ): void
  closeEmojiPicker(): void
}
