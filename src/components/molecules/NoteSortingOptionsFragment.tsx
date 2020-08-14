import React from 'react'
import { noteSortingOptions, getNoteSortingOptionLabel } from '../../lib/sort'

const NoteSortingOptionsFragment = () => {
  return (
    <>
      {noteSortingOptions.map((noteSortingOption) => (
        <option key={noteSortingOption} value={noteSortingOption}>
          {getNoteSortingOptionLabel(noteSortingOption)}
        </option>
      ))}
    </>
  )
}

export default NoteSortingOptionsFragment
