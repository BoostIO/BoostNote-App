import { FolderDoc, NoteDoc, NoteStorage } from '../../../db/types'
import { mdiFileDocumentOutline, mdiNoteText } from '@mdi/js'
import { SidebarSearchResult } from '../../../../shared/components/organisms/Sidebar/molecules/SidebarSearch'
import {
  getMatchData,
  NoteSearchData,
  TagSearchResult,
} from '../../../search/search'
import {
  values,
  getFolderName,
  getNoteTitle,
  getFolderHref,
  getDocHref,
} from '../../../db/utils'
import { escapeRegExp } from '../../../string'

export function getSearchRegex(rawSearch: string) {
  return new RegExp(escapeRegExp(rawSearch), 'gim')
}

export function getSearchResultItems(
  storage?: NoteStorage,
  searchQuery?: string
): NoteSearchData[] {
  if (storage == null) {
    return []
  }
  if (!searchQuery || searchQuery == '') {
    return []
  }

  const notes = values(storage.noteMap)
  const folders = values(storage.folderMap)
  const regex = getSearchRegex(searchQuery)
  // todo: [komediruzecki-01/12/2020] Here we could have buttons (toggles) for content/title/tag search! (by tag color?)
  //  for now, it's only content search
  const searchResultData: NoteSearchData[] = []
  notes.forEach((note: NoteDoc) => {
    if (note.trashed) {
      return
    }
    const matchDataContent = getMatchData(note.content, regex)
    const titleMatchResult = note.title.match(regex)
    const titleSearchResult =
      titleMatchResult != null ? titleMatchResult[0] : null
    const tagSearchResults = note.tags.reduce<TagSearchResult[]>(
      (searchResults, tagName) => {
        const matchResult = tagName.match(regex)
        if (matchResult != null) {
          searchResults.push({
            tagName,
            matchString: matchResult[0],
          })
        }
        return searchResults
      },
      []
    )

    if (
      titleSearchResult ||
      tagSearchResults.length > 0 ||
      matchDataContent.length > 0
    ) {
      searchResultData.push({
        titleSearchResult,
        tagSearchResults,
        item: {
          type: matchDataContent.length > 0 ? 'noteContent' : 'note',
          context:
            matchDataContent.length > 0
              ? matchDataContent[0].lineString
              : note.title,
          result: note,
        },
        results: matchDataContent,
      })
    }
  })
  folders.forEach((folder: FolderDoc) => {
    const folderName = getFolderName(folder)
    const matchDataContent = getMatchData(folderName, regex)
    if (matchDataContent.length > 0) {
      searchResultData.push({
        titleSearchResult: null,
        tagSearchResults: [],
        item: {
          type: 'folder',
          result: folder,
        },
        results: matchDataContent,
      })
    }
  })

  return searchResultData
}

export function mapSearchResults(
  results: NoteSearchData[],
  push: (url: string) => void,
  storage?: NoteStorage
) {
  if (storage == null) {
    return []
  }

  return results.reduce((acc, searchData) => {
    // maybe get results as folder, folder title, note, note title, tags etc. results
    // for now just use same result
    // add search metadata (type and actual item)
    console.log('Got result', searchData)
    if (searchData.item.type === 'folder') {
      const href = getFolderHref(searchData.item.result, storage.id)
      acc.push({
        label: getFolderName(searchData.item.result),
        emoji: mdiNoteText,
        href,
        onClick: () => push(href),
      })
      return acc
    }

    const noteDoc = searchData.item.result
    const href = getDocHref(noteDoc, storage.id)
    acc.push({
      label: getNoteTitle(noteDoc, 'Untitled'),
      href,
      defaultIcon: mdiFileDocumentOutline,
      // emoji: item.result.emoji,
      contexts:
        searchData.item.type === 'noteContent'
          ? [searchData.item.context]
          : undefined,
      onClick: () => push(href),
    })
    return acc
  }, [] as SidebarSearchResult[])
}
