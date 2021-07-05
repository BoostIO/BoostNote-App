import { Dispatch, SetStateAction } from 'react'
import { HistoryItem } from '../../../api/search'

export interface SearchContext {
  showSearchScreen: boolean
  setShowSearchScreen: Dispatch<SetStateAction<boolean>>
  history: HistoryItem[]
  searchHistory: string[]
  addToSearchHistory: (val: string) => void
}
