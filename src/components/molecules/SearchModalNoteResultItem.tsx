import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { NoteDoc } from '../../lib/db/types'
import Icon from '../atoms/Icon'
import { mdiTextBoxOutline, mdiTagMultiple, mdiFolder } from '@mdi/js'
import {
  flexCenter,
  borderBottom,
  textOverflow,
} from '../../lib/styled/styleFunctions'
import {
  getSearchResultKey,
  MAX_SEARCH_PREVIEW_LINE_LENGTH,
  SearchResult,
} from '../../lib/search/search'
import { SearchMatchHighlight } from '../PreferencesModal/styled'
import { escapeRegExp } from '../../lib/string'

interface SearchModalNoteResultItemProps {
  note: NoteDoc
  selectedItemId: string
  searchResults: SearchResult[]
  navigateToNote: (noteId: string) => void
  updateSelectedItem: (note: NoteDoc, selectedId: string) => void
  navigateToEditorFocused: (
    noteId: string,
    lineNum: number,
    lineColumn?: number
  ) => void
}

const SearchModalNoteResultItem = ({
  note,
  searchResults,
  navigateToNote,
  selectedItemId,
  updateSelectedItem,
  navigateToEditorFocused,
}: SearchModalNoteResultItemProps) => {
  const navigate = useCallback(() => {
    navigateToNote(note._id)
  }, [navigateToNote, note._id])

  const highlightMatchedTerm = useCallback((line, matchStr) => {
    const parts = line.split(new RegExp(`(${escapeRegExp(matchStr)})`, 'gi'))
    return (
      <span>
        {parts.map((part: string, i: number) =>
          part.toLowerCase() === matchStr.toLowerCase() ? (
            <SearchMatchHighlight key={i}>{matchStr}</SearchMatchHighlight>
          ) : (
            part
          )
        )}
      </span>
    )
  }, [])
  const beautifyPreviewLine = useCallback(
    (line, matchStr) => {
      const multiline = matchStr.indexOf('\n') != -1
      const beautifiedLine =
        line.substring(0, MAX_SEARCH_PREVIEW_LINE_LENGTH) +
        (line.length > MAX_SEARCH_PREVIEW_LINE_LENGTH ? '...' : '')
      if (multiline) {
        return (
          <span>
            <SearchMatchHighlight>{line}</SearchMatchHighlight>
          </span>
        )
      } else {
        return highlightMatchedTerm(beautifiedLine, matchStr)
      }
    },
    [highlightMatchedTerm]
  )

  const updateSelectedItemAndFocus = useCallback(
    (target, note, id) => {
      {
        updateSelectedItem(note, id)

        setTimeout(() => {
          if (target) {
            target.scrollIntoView(
              {
                // todo: [komediruzecki-12/12/2020] Smooth looks nice,
                //  do we want instant (as now) or slowly auto scrolling to element?
                behavior: 'auto',
                block: 'nearest',
                inline: 'nearest',
              },
              20
            )
          }
        })
      }
    },
    [updateSelectedItem]
  )

  return (
    <Container>
      <MetaContainer onClick={navigate}>
        <div className='header'>
          <div className='icon'>
            <Icon path={mdiTextBoxOutline} />
          </div>
          <div className='title'>{note.title}</div>
        </div>
        <div className='meta'>
          <div className='folderPathname'>
            <Icon className='icon' path={mdiFolder} />
            {note.folderPathname}
          </div>
          {note.tags.length > 0 && (
            <div className='tags'>
              <Icon className='icon' path={mdiTagMultiple} />{' '}
              {note.tags.map((tag) => tag).join(', ')}
            </div>
          )}
        </div>
      </MetaContainer>

      <SearchResultContainer>
        {searchResults.length > 0 &&
          searchResults.map((result) => (
            <SearchResultItem
              className={selectedItemId === result.id ? 'selected' : ''}
              key={getSearchResultKey(note._id, result.id)}
              onClick={(event: MouseEvent) =>
                updateSelectedItemAndFocus(event.target, note, result.id)
              }
              onDoubleClick={() =>
                navigateToEditorFocused(
                  note._id,
                  result.lineNum - 1,
                  result.matchColumn
                )
              }
            >
              <SearchResultLeft title={result.lineStr}>
                <code>
                  {beautifyPreviewLine(result.lineStr, result.matchStr)}
                </code>
              </SearchResultLeft>
              <SearchResultRight>
                <code>{result.lineNum}</code>
              </SearchResultRight>
            </SearchResultItem>
          ))}
      </SearchResultContainer>
    </Container>
  )
}

export default SearchModalNoteResultItem

const Container = styled.div`
  ${borderBottom};
  &:last-child {
    border-bottom: none;
  }
`

const SearchResultContainer = styled.div`
  padding: 5px;
  cursor: pointer;
  user-select: none;
`

const MetaContainer = styled.div`
  padding: 5px 10px;
  cursor: pointer;
  ${borderBottom};
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  &:hover:active {
    background-color: ${({ theme }) => theme.navItemHoverActiveBackgroundColor};
  }

  & > .header {
    font-size: 18px;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    & > .icon {
      width: 18px;
      height: 18px;
      margin-right: 4px;
      ${flexCenter}
    }

    & > .title {
      flex: 1;
      ${textOverflow}
    }
  }
  & > .meta {
    font-size: 12px;
    color: ${({ theme }) => theme.navItemColor};
    display: flex;
    margin-left: 18px;

    & > .folderPathname {
      display: flex;
      align-items: center;
      max-width: 350px;
      ${textOverflow}
      &>.icon {
        margin-right: 4px;
        flex-shrink: 0;
      }
    }
    & > .tags {
      margin-left: 8px;
      display: flex;
      align-items: center;
      max-width: 350px;
      ${textOverflow}
      &>.icon {
        margin-right: 4px;
        flex-shrink: 0;
      }
    }
  }
  &:last-child {
    border-bottom: none;
  }
`

const SearchResultItem = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  overflow: hidden;
  padding: 3px 5px;
  border-radius: 4px;
  margin-bottom: 2px;
  &:last-child {
    margin-bottom: 0;
  }

  &.selected {
    color: ${({ theme }) => theme.searchItemSelectionTextColor};
    background-color: ${({ theme }) =>
      theme.searchItemSelectionBackgroundColor};
  }
  &.selected:hover {
    background-color: ${({ theme }) =>
      theme.searchItemSelectionHoverBackgroundColor};
  }

  &:hover {
    background-color: ${({ theme }) =>
      theme.secondaryButtonHoverBackgroundColor};
  }
`

const SearchResultLeft = styled.div`
  align-self: flex-start;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const SearchResultRight = styled.div`
  align-self: flex-end;
`
