import React, { useMemo, useCallback, useState } from 'react'
import styled from '../../../lib/styled'
import { mdiChevronDown } from '@mdi/js'
import Icon from '../../atoms/IconMdi'
import { linkText } from '../../../lib/styled/styleFunctions'
import RelativeDialog from '../../molecules/RelativeDialog'
import SidebarTeamPickerContext from './SidebarTeamPickerContext'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import { buildIconUrl } from '../../../api/files'
import TeamIcon from '../../atoms/TeamIcon'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
} from '../../../lib/keyboard'
import { shortcuts } from '../../../lib/shortcuts'
import { useSettings } from '../../../lib/stores/settings'
import { useElectron } from '../../../lib/stores/electron'
import { useModal } from '../../../../shared/lib/stores/modal'

const SidebarTeamSwitch = () => {
  const { team } = usePage<PageStoreWithTeam>()
  const [hideContext, setHideContext] = useState<boolean>(true)
  const { closed } = useSettings()
  const { modals } = useModal()
  const { usingElectron } = useElectron()

  const teamSwitchKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEventOutsideOfInput(event, shortcuts.teamPicker)) {
        if (modals.length !== 0 || !closed) {
          return
        }
        setHideContext((prev) => {
          return !prev
        })
        event.preventDefault()
      }
    }
  }, [setHideContext, closed, modals])
  useGlobalKeyDownHandler(teamSwitchKeyDownHandler)

  const currentTeamPicker = useMemo(() => {
    const info = {
      icon: '',
      label: 'Pick a team...',
      className: 'default',
    }

    if (team != null) {
      info.icon = team.icon != null ? buildIconUrl(team.icon.location) : ''
      info.label = team.name
      info.className = ''
    }

    return (
      <StyledTeamPicker>
        <div className='icon-wrapper'>
          <TeamIcon team={team} />
        </div>
        <TeamPickerLabel className={info.className}>
          {info.label}
        </TeamPickerLabel>
      </StyledTeamPicker>
    )
  }, [team])

  const onClickHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      setHideContext(false)
    },
    [setHideContext]
  )

  return (
    <StyledContainer>
      <StyledTwamSwitchButtonWrapper>
        {usingElectron ? (
          <StyledSidebarTeamSwitch style={{ cursor: 'inherit' }}>
            {currentTeamPicker}
          </StyledSidebarTeamSwitch>
        ) : (
          <StyledSidebarTeamSwitch onClick={onClickHandler}>
            {currentTeamPicker} <Icon path={mdiChevronDown} />
          </StyledSidebarTeamSwitch>
        )}
      </StyledTwamSwitchButtonWrapper>

      <RelativeDialog closed={hideContext} setClosed={setHideContext}>
        <SidebarTeamPickerContext setClosed={setHideContext} />
      </RelativeDialog>
    </StyledContainer>
  )
}

export default SidebarTeamSwitch

const StyledContainer = styled.div`
  position: relative;
  height: auto;
  display: flex;
`

const StyledTwamSwitchButtonWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 50px;
  padding: ${({ theme }) => theme.space.small}px;
`

const StyledSidebarTeamSwitch = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: 0;
  color: ${({ theme }) => theme.emphasizedTextColor};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  line-height: ${({ theme }) => theme.lineHeights.default};
  text-align: left;

  svg {
    ${linkText}
    position: relative;
    width: 1em !important;
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
    font-size: ${({ theme }) => theme.fontSizes.medium}px;
  }
`

const StyledTeamPicker = styled.div`
  display: flex;
  vertical-align: middle;
  align-items: center;

  .icon-wrapper {
    display: flex;
    width: 20px;
    height: 20px;
    margin-right: ${({ theme }) => theme.space.xxsmall}px;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
`

const TeamPickerLabel = styled.div`
  padding-left: ${({ theme }) => theme.space.xsmall}px;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  &.default {
    ${linkText}
  }
`
