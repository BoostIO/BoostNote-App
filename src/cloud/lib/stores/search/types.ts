import { HistoryItem } from '../../../api/search'

export interface SearchContext {
  history: HistoryItem[]
  searchHistory: string[]
  addToSearchHistory: (val: string) => void
}
