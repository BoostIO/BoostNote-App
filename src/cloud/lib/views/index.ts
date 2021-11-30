export type ViewMoveType =
  | 'before'
  | 'after'
  | {
      target: number
      type: 'before' | 'after'
    }
