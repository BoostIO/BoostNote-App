import React, { useCallback } from 'react'
import { StyledModalsBackground } from '../Modal/styled'
import { useGlobalKeyDownHandler } from '../../../lib/keyboard'
import { useSearch } from '../../../lib/stores/search'
import ModalSearchbar from './ModalSearchbar'
import { usePathnameChangeEffect } from '../../../lib/router'

const SearchModal = () => {
  const { showGlobalSearch, setShowGlobalSearch } = useSearch()

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape' && showGlobalSearch) {
        setShowGlobalSearch(false)
      }
    },
    [setShowGlobalSearch, showGlobalSearch]
  )
  useGlobalKeyDownHandler(keydownHandler)

  const backgroundClickHandler = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      setShowGlobalSearch(false)
    },
    [setShowGlobalSearch]
  )

  usePathnameChangeEffect(() => {
    setShowGlobalSearch(false)
  })

  if (!showGlobalSearch) return null

  return (
    <>
      <StyledModalsBackground onClick={backgroundClickHandler} />
      <ModalSearchbar />
    </>
  )
}

export default SearchModal
