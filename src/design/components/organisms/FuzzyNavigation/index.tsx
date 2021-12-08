import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { useGlobalKeyDownHandler } from '../../../lib/keyboard'
import styled from '../../../lib/styled'
import UpDownList from '../../atoms/UpDownList'
import FormInput from '../../molecules/Form/atoms/FormInput'
import FuzzyNavigationItem, {
  FuzzyNavigationItemAttrbs,
  HighlightedFuzzyNavigationitem,
} from './molecules/FuzzyNavigationItem'
import Fuse from 'fuse.js'
import CloseButtonWrapper from '../../molecules/CloseButtonWrapper'
import cc from 'classcat'
import Scroller from '../../atoms/Scroller'
import CustomizedMarkdownPreviewer from '../../../../cloud/components/MarkdownView/CustomizedMarkdownPreviewer'
import { getDoc } from '../../../../cloud/api/teams/docs'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import Spinner from '../../atoms/Spinner'

interface FuzzyNavigationProps {
  recentItems: FuzzyNavigationItemAttrbs[]
  allItems: FuzzyNavigationItemAttrbs[]
  close: () => void
}

const FuzzyNavigation = ({
  allItems,
  recentItems = [],
  close,
}: FuzzyNavigationProps) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [loadingDocContent, setLoadingDocContent] = useState<boolean>(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const { team } = usePage()

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape') {
        close()
      }
    },
    [close]
  )
  useGlobalKeyDownHandler(keydownHandler)

  const filteredItems = useMemo(() => {
    if (query === '') return []

    const fuse = new Fuse(allItems, {
      keys: [
        { name: 'label', weight: 0.6 },
        { name: 'path', weight: 0.4 },
      ],
      threshold: 0.4,
      distance: 80,
      includeMatches: true,
    })

    const results = fuse.search(query)
    const items = results.slice(0, 30).map((res) => {
      return {
        ...res.item,
        refIndex: res.refIndex,
        labelMatches: res.matches?.find((val) => val.key === 'label')?.indices,
        pathMatches: res.matches?.find((val) => val.key === 'path')?.indices,
        content: res.item.content != null ? res.item.content : undefined,
        id: res.item.id,
      }
    })

    return items
  }, [allItems, query])
  const [showMarkdownPreview, setShowMarkdownPreview] = useState<boolean>(false)
  const [markdownPreviewContent, setMarkdownPreviewContent] = useState<
    string | null
  >(null)

  const setMarkdownPreviewForItem = useCallback(
    async (item) => {
      setLoadingDocContent(false)
      setMarkdownPreviewContent(null)
      setShowMarkdownPreview(false)
      setActiveId(item != null && item.id != null ? item.id : null)
      if (item && item.content) {
        setMarkdownPreviewContent(item.content)
        setShowMarkdownPreview(true)
      } else {
        if (team == null || item.id == null) {
          return
        }
        setLoadingDocContent(true)
        const promise = getDoc(item.id, team.id).then((data) => data.doc)
        const doc = await promise
        setLoadingDocContent(false)

        if (doc != null && doc.head != null && doc.head.content) {
          setMarkdownPreviewContent(doc.head.content)
          setShowMarkdownPreview(true)
        } else {
          setMarkdownPreviewContent(null)
          setShowMarkdownPreview(false)
        }
      }
    },
    [team]
  )

  return (
    <Container className='fuzzy'>
      <div className='fuzzy__background' onClick={() => close()} />
      <UpDownList className='fuzzy__wrapper'>
        <CloseButtonWrapper
          onClick={() => setQuery('')}
          show={query !== ''}
          className='fuzzy__search__reset'
        >
          <FormInput
            id='fuzzy__search__input'
            className='fuzzy__search'
            placeholder='Search'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
          />
        </CloseButtonWrapper>

        {query === '' ? (
          <>
            <span className='fuzzy__label'>
              {recentItems.length === 0
                ? `No recently visited items`
                : `Recent items`}
            </span>
            <ResultContainer>
              <SearchResults>
                <Scroller className={cc(['fuzzy__scroller'])}>
                  {recentItems.map((item, i) => (
                    <FuzzyNavigationItem
                      onMouseEnter={() => setMarkdownPreviewForItem(item)}
                      item={item}
                      active={activeId != null && activeId === item.id}
                      id={`fuzzy-recent-${i}`}
                      key={`fuzzy-recent-${i}`}
                    />
                  ))}
                </Scroller>
              </SearchResults>
              {!loadingDocContent &&
                showMarkdownPreview &&
                markdownPreviewContent != null && (
                  <MarkdownPreviewContainer>
                    <Scroller className={cc(['fuzzy__scroller'])}>
                      <CustomizedMarkdownPreviewer
                        content={markdownPreviewContent}
                      />
                    </Scroller>
                  </MarkdownPreviewContainer>
                )}
              {loadingDocContent && (
                <MarkdownPreviewContainer>
                  <Spinner variant={'primary'} />
                </MarkdownPreviewContainer>
              )}
            </ResultContainer>
          </>
        ) : (
          <>
            {filteredItems.length === 0 && (
              <span className='fuzzy__label'>No matching results</span>
            )}

            {filteredItems.length !== 0 && (
              <ResultContainer>
                <SearchResults>
                  <Scroller className={cc(['fuzzy__scroller'])}>
                    {filteredItems.map((item, i) => (
                      <HighlightedFuzzyNavigationitem
                        onMouseEnter={() => setMarkdownPreviewForItem(item)}
                        item={item}
                        active={activeId != null && activeId === item.id}
                        id={`fuzzy-filtered-${i}`}
                        key={`fuzzy-filtered-${i}`}
                        query={query.trim().toLocaleLowerCase()}
                        labelMatches={item.labelMatches}
                        pathMatches={item.pathMatches}
                      />
                    ))}
                  </Scroller>
                </SearchResults>
                {!loadingDocContent &&
                  showMarkdownPreview &&
                  markdownPreviewContent != null && (
                    <MarkdownPreviewContainer>
                      <Scroller className={cc(['fuzzy__scroller'])}>
                        <CustomizedMarkdownPreviewer
                          content={markdownPreviewContent}
                        />
                      </Scroller>
                    </MarkdownPreviewContainer>
                  )}
                {loadingDocContent && (
                  <MarkdownPreviewContainer>
                    <Spinner variant={'primary'} />
                  </MarkdownPreviewContainer>
                )}
              </ResultContainer>
            )}
          </>
        )}
      </UpDownList>
    </Container>
  )
}

const MarkdownPreviewContainer = styled.div`
  display: flex;
  height: 100%;
  max-width: 100%;
  overflow-x: hidden;
  flex: 1;

  z-index: 9999;
`

const SearchResults = styled.div`
  min-height: 100%;
  flex: 1;
`

const ResultContainer = styled.div`
  display: flex;
  height: 75%;
  max-height: 75%;
`

const Container = styled.div`
  .fuzzy__search {
    width: 100%;
  }

  .fuzzy__search__reset {
    width: initial;
    margin: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .fuzzy__wrapper {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    right: 0;
    z-index: 9999 !important;
    width: 96%;
    max-width: 920px;
    background: ${({ theme }) => theme.colors.background.primary};
    padding-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;

    display: flex;
    flex-direction: column;
  }

  .fuzzy__scroller {
    width: 100%;
    display: flex;
    flex-direction: column;
    max-height: calc(80vh - 80px);
  }

  .fuzzy__background {
    z-index: 8001;
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000;
    opacity: 0.7;
  }

  .fuzzy__label {
    color: ${({ theme }) => theme.colors.text.subtle};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.md}px
      ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

export default FuzzyNavigation
