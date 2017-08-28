namespace Types {
  export interface Location {
    pathname: string
    search: string
    hash: string
  }

  export interface Note {
    content: string
    folder: string
    createdAt: Date
    updatedAt: Date
  }

  export interface Folder {
  }

  export interface Repository {
  }
}

export default Types
