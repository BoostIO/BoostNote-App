export type Position = { x: number; y: number }

export interface EmojiPickerContext {
  callback?: (x?: string) => void
  closed: boolean
  position: Position
  openEmojiPicker(
    event: React.MouseEvent<unknown>,
    cb: (val?: string) => void | ((val?: string) => Promise<void>)
  ): void
  closeEmojiPicker(): void
}
