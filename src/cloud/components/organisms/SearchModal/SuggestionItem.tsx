import React, { useState, useMemo } from 'react'
import styled from '../../../lib/styled'
import { SearchResult } from '../../../api/search'
import { SerializedTeam } from '../../../interfaces/db/team'
import DocLink from '../../atoms/Link/DocLink'
import {
  SideNavItemStyle,
  SideNavLabelStyle,
} from '../Sidebar/SideNavigator/styled'
import IconMdi from '../../atoms/IconMdi'
import { mdiCardTextOutline, mdiFolderOutline } from '@mdi/js'
import FolderLink from '../../atoms/Link/FolderLink'
import { getDocTitle } from '../../../lib/utils/patterns'
import cc from 'classcat'
import { Emoji } from 'emoji-mart'
import Flexbox from '../../atoms/Flexbox'
import { useNav } from '../../../lib/stores/nav'

interface SuggestionItemProps {
  item: SearchResult
  team: SerializedTeam
  id?: string
}

const SuggestionItem = ({ item, team, id }: SuggestionItemProps) => {
  const [focused, setFocused] = useState(false)
  const { workspacesMap } = useNav()

  const onBlurHandler = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  const workspacePath = useMemo(() => {
    const workspace = workspacesMap.get(item.result.workspaceId)
    if (workspace == null) {
      return null
    }
    return workspace.name
  }, [workspacesMap, item.result.workspaceId])

  switch (item.type) {
    case 'doc': {
      const { result } = item
      return (
        <SideNavItemStyle
          className={cc(['searchResult', focused && 'focused'])}
          onBlur={onBlurHandler}
        >
          <DocLink
            doc={result}
            team={team}
            className='itemLink'
            id={'dC' + id}
            onFocus={() => setFocused(true)}
          >
            <StyledPathname>
              {workspacePath}
              {result.folderPathname !== '/'
                ? `${result.folderPathname}/`
                : '/'}
            </StyledPathname>
            <Flexbox flex='1 1 auto'>
              <Flexbox flex='initial' style={{ paddingRight: '5px' }}>
                {result.emoji != null ? (
                  <Emoji emoji={result.emoji} set='apple' size={18} />
                ) : (
                  <IconMdi path={mdiCardTextOutline} size={18} />
                )}
              </Flexbox>
              <SideNavLabelStyle className='label'>
                {getDocTitle(result, 'Untitled')}
              </SideNavLabelStyle>
            </Flexbox>
          </DocLink>
        </SideNavItemStyle>
      )
    }

    case 'folder': {
      const { result } = item
      return (
        <SideNavItemStyle
          className={cc(['searchResult', focused && 'focused'])}
          onBlur={onBlurHandler}
        >
          <FolderLink
            folder={result}
            team={team}
            className='itemLink'
            id={'fD' + id}
            onFocus={() => setFocused(true)}
          >
            <StyledPathname>
              {workspacePath}
              {result.pathname}
            </StyledPathname>
            <Flexbox flex='1 1 auto'>
              <Flexbox flex='initial' style={{ paddingRight: '5px' }}>
                {result.emoji != null ? (
                  <Emoji emoji={result.emoji} set='apple' size={18} />
                ) : (
                  <IconMdi path={mdiFolderOutline} size={18} />
                )}
              </Flexbox>
              <SideNavLabelStyle className='label'>
                {result.name}
              </SideNavLabelStyle>
            </Flexbox>
          </FolderLink>
        </SideNavItemStyle>
      )
    }

    case 'docContent': {
      const { result } = item
      const context = item.context.split(' ').map((txt, i) => {
        return txt.startsWith('<zxNptFF>') ? (
          <strong key={`sg-${i}`}>{`${txt.replace(
            /<\/?zxNptFF>/g,
            ''
          )} `}</strong>
        ) : (
          <span key={`sg-${i}`}>{txt}</span>
        )
      })
      return (
        <SideNavItemStyle
          className={cc(['searchResult', focused && 'focused'])}
          onBlur={onBlurHandler}
        >
          <DocLink
            doc={result}
            team={team}
            className='itemLink'
            id={'dCc' + id}
            onFocus={() => setFocused(true)}
          >
            <StyledPathname>
              {workspacePath}
              {result.folderPathname !== '/'
                ? `${result.folderPathname}/`
                : '/'}
            </StyledPathname>
            <Flexbox flex='1 1 auto'>
              <Flexbox flex='initial' style={{ paddingRight: '5px' }}>
                {result.emoji != null ? (
                  <Emoji emoji={result.emoji} set='apple' size={18} />
                ) : (
                  <IconMdi path={mdiCardTextOutline} size={18} />
                )}
              </Flexbox>
              <SideNavLabelStyle className='label'>
                <div>{getDocTitle(result, 'Untitled')}</div>
                <StyledSearchContext>{context}</StyledSearchContext>
              </SideNavLabelStyle>
            </Flexbox>
          </DocLink>
        </SideNavItemStyle>
      )
    }

    default:
      return null
  }
}

export default SuggestionItem

const StyledPathname = styled.div`
  margin-left: ${({ theme }) => theme.space.default}px;
  color: ${({ theme }) => theme.subtleTextColor};
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
`

const StyledSearchContext = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
`
