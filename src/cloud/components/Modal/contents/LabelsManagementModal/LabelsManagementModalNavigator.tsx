import React, { useMemo } from 'react'
import { SerializedUserTeamPermissions } from '../../../../interfaces/db/userTeamPermissions'
import styled from '../../../../../design/lib/styled'
import { isFocusLeftSideShortcut } from '../../../../../design/lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../../../design/lib/keyboard'
import { focusFirstChildFromElement } from '../../../../../design/lib/dom'
import Spinner from '../../../../../design/components/atoms/Spinner'
import Scroller from '../../../../../design/components/atoms/Scroller'
import NavigationItem from '../../../../../design/components/molecules/Navigation/NavigationItem'
import { SerializedTag } from '../../../../interfaces/db/tag'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { mdiTag } from '@mdi/js'
import Flexbox from '../../../../../design/components/atoms/Flexbox'
import Pastille from '../../../../../design/components/atoms/Pastille'
import { overflowEllipsis } from '../../../../../design/lib/styled/styleFunctions'

interface LabelsManagementModalNavigatorProps {
  tags: (SerializedTag & { docsIds: string[] })[]
  selectedTagId?: string
  fetching: boolean
  currentUserPermissions?: SerializedUserTeamPermissions
  menuRef: React.RefObject<HTMLDivElement>
  selectTag: (id: string) => void
}

const LabelsManagementModalNavigator = ({
  tags,
  selectedTagId,
  menuRef,
  fetching,
  selectTag,
}: LabelsManagementModalNavigatorProps) => {
  const { translate } = useI18n()
  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(menuRef.current)
        return
      }
    }
  }, [menuRef])
  useGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(menuRef)

  return (
    <Container className='label__navigator' ref={menuRef}>
      <header>
        <h2>{translate(lngKeys.GeneralLabels)}</h2>
        {fetching && <Spinner />}
      </header>

      <Scroller className='labels__scroller'>
        {tags.map((tag) => (
          <NavigationItem
            key={tag.id}
            id={`tag-${tag.id}`}
            className='tag__item'
            active={selectedTagId === tag.id}
            labelClick={() => selectTag(tag.id)}
            label={
              <Flexbox
                flex='1 1 auto'
                justifyContent='space-between'
                className='tag__item__label'
              >
                <span className='tag__item__label__text'>{tag.text} </span>
                <Pastille
                  size={20}
                  variant='secondary'
                  className='tag__item__label__pastille'
                >
                  {tag.docsIds.length}
                </Pastille>
              </Flexbox>
            }
            borderRadius={true}
            icon={{
              type: 'icon',
              path: mdiTag,
            }}
          />
        ))}
      </Scroller>
    </Container>
  )
}

const Container = styled.div`
  width: 200px;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.colors.border.main};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .tag__item__label__text {
    ${overflowEllipsis}
  }

  .tag__item__label__pastille {
    flex: 0 0 auto;
  }

  header,
  .labels__scroller {
    padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  header {
    display: block;
    text-align: center;
    flex: 0 0 auto;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;

    h2 {
      margin: 0;
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    }
  }

  .navigation__item__label__ellipsis {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .labels__scroller {
    flex: 1 1 auto;
  }
`

export default LabelsManagementModalNavigator
