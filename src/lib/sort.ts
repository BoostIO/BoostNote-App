import { ConditionalKeys } from 'type-fest'
import { NoteDoc } from './db/types'
import { sort, prop, descend, ascend, compose, toLower } from 'ramda'

export type NoteSortingOptions =
  | 'title-asc'
  | 'title-dsc'
  | 'created-date-asc'
  | 'created-date-dsc'
  | 'updated-date-asc'
  | 'updated-date-dsc'

export const noteSortingOptions: NoteSortingOptions[] = [
  'title-asc',
  'title-dsc',
  'created-date-asc',
  'created-date-dsc',
  'updated-date-asc',
  'updated-date-dsc',
]

export type NoteDocSortableKeys = ConditionalKeys<NoteDoc, string | number>

export function getSortingArguments(
  noteSorting: NoteSortingOptions
): { key: NoteDocSortableKeys; descendingOrder: boolean } {
  switch (noteSorting) {
    case 'title-asc':
      return {
        key: 'title',
        descendingOrder: false,
      }
    case 'title-dsc':
      return {
        key: 'title',
        descendingOrder: true,
      }
    case 'created-date-asc':
      return {
        key: 'createdAt',
        descendingOrder: false,
      }
    case 'created-date-dsc':
      return {
        key: 'createdAt',
        descendingOrder: true,
      }
    case 'updated-date-asc':
      return {
        key: 'updatedAt',
        descendingOrder: false,
      }
    case 'updated-date-dsc':
    default:
      return {
        key: 'updatedAt',
        descendingOrder: true,
      }
  }
}

export function sortNotesByKeys(
  noteDocs: NoteDoc[],
  key: NoteDocSortableKeys,
  descendingOrder = false
) {
  const orderFunction = descendingOrder ? descend : ascend
  return sort(orderFunction(compose(toLower, prop(key))), noteDocs)
}

export function sortNotesByNoteSortingOption(
  noteDocs: NoteDoc[],
  noteSorting: NoteSortingOptions
) {
  const { key, descendingOrder } = getSortingArguments(noteSorting)
  return sortNotesByKeys(noteDocs, key, descendingOrder)
}

export function getNoteSortingOptionLabel(noteSorting: NoteSortingOptions) {
  switch (noteSorting) {
    case 'title-asc':
      return 'Title A-Z'
    case 'title-dsc':
      return 'Title Z-A'
    case 'created-date-asc':
      return 'First Created'
    case 'created-date-dsc':
      return 'Last Created'
    case 'updated-date-asc':
      return 'First Updated'
    case 'updated-date-dsc':
    default:
      return 'Last Updated'
  }
}
