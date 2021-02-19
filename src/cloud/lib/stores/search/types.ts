import { HistoryItem } from '../../../api/search'

export interface SearchContext {
  history: HistoryItem[]
  searchHistory: string[]
  showGlobalSearch: boolean
  setShowGlobalSearch: (val: boolean) => void
  addToSearchHistory: (val: string) => void
}
