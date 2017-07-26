export interface Note {
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Repository {
  noteMap: {
    [noteId: string]: Note
  }
}

export interface State {
  [name: string]: Repository
}

export const initialState: State = {}
