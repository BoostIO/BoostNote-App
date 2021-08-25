import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import SearchableOptionList, {
  SearchableOptionListProps,
} from '../../design/components/molecules/SearchableOptionList'
import { AppComponent } from '../../design/lib/types'

const SearchableOptionListPopup: AppComponent<SearchableOptionListProps> = ({
  children,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  return <SearchableOptionList ref={inputRef} {...props} />
}

export default SearchableOptionListPopup
