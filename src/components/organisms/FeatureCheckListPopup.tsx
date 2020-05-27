import React, { useMemo } from 'react'
import { useGeneralStatus } from '../../lib/generalStatus'
import styled from '../../lib/styled'
import {
  borderColor,
  backgroundColor,
  contextMenuShadow,
  border,
} from '../../lib/styled/styleFunctions'
import Icon from '../atoms/Icon'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked } from '@mdi/js'
import { useDb } from '../../lib/db'
import { openNew } from '../../lib/platform'

const zIndex = 8000

const Container = styled.div`
  position: fixed;
  bottom: 15px;
  right: 15px;
  z-index: ${zIndex};
  padding: 15px;
  ${backgroundColor}
  ${borderColor}
  ${contextMenuShadow}
`

const Header = styled.h2`
  font-size: 24px;
  margin: 0;
`

const FeatureCheckList = styled.ul`
  list-style: none;
  padding: 0;
`

const HideButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
`

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 24px;
  background-color: ${({ theme }) => theme.navBackgroundColor};
  ${border}
  border-radius: 4px;
  overflow: hidden;
`

const ProgressBar = styled.div`
  height: 24px;
  transition: width 200ms ease-in-out;
  background-color: ${({ theme }) => theme.primaryColor};
`

const FeatureCheckListItemContainer = styled.li`
  height: 30px;
  display: flex;
  align-items: center;
`

const FeatureCheckListItemIcon = styled.div`
  font-size: 18px;
  &.active {
    color: ${({ theme }) => theme.primaryColor};
  }
`

const FeatureCheckListItemLabel = styled.div`
  padding: 0 5px;
`

interface FeatureCheckListItemProps {
  active: boolean
}

const FeatureCheckListItem: React.FC<FeatureCheckListItemProps> = ({
  active,
  children,
}) => {
  return (
    <FeatureCheckListItemContainer>
      <FeatureCheckListItemIcon className={active ? 'active' : ''}>
        <Icon path={active ? mdiCheckboxMarked : mdiCheckboxBlankOutline} />
      </FeatureCheckListItemIcon>
      <FeatureCheckListItemLabel
        style={{
          textDecoration: active ? 'line-through' : 'none',
        }}
      >
        {children}
      </FeatureCheckListItemLabel>
    </FeatureCheckListItemContainer>
  )
}

const FeatureCheckListPopup = () => {
  const {
    generalStatus,
    hideFeatureCheckList,
    checkFeature,
  } = useGeneralStatus()
  const { initialized } = useDb()

  const { checkedFeatures, hiddenCheckedFeatures } = generalStatus
  const checkedFeatureSet = useMemo(() => {
    return new Set(checkedFeatures)
  }, [checkedFeatures])

  const progressPercentage = useMemo(() => {
    let count = 0

    if (checkedFeatureSet.has('createFolder')) {
      count++
    }

    if (checkedFeatureSet.has('createNote')) {
      count++
    }

    if (checkedFeatureSet.has('changeAppTheme')) {
      count++
    }

    if (checkedFeatureSet.has('changeEditorTheme')) {
      count++
    }
    if (checkedFeatureSet.has('checkOutMobileApp')) {
      count++
    }
    return Math.round((100 / 5) * count)
  }, [checkedFeatureSet])

  if (!initialized || hiddenCheckedFeatures) {
    return null
  }

  return (
    <Container>
      <Header>Get started Boost Note! 🎉</Header>
      {progressPercentage < 100 ? (
        <p>Let&apos;s start with the basics! ({progressPercentage}%)</p>
      ) : (
        <p>
          <HideButton onClick={hideFeatureCheckList}>
            Good job! Click to hide this popup.
          </HideButton>
        </p>
      )}
      <ProgressSection>
        <ProgressBarContainer>
          <ProgressBar
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </ProgressBarContainer>
      </ProgressSection>
      <FeatureCheckList>
        <FeatureCheckListItem active={checkedFeatureSet.has('createFolder')}>
          Create a folder
        </FeatureCheckListItem>
        <FeatureCheckListItem active={checkedFeatureSet.has('createNote')}>
          Create a note
        </FeatureCheckListItem>
        <FeatureCheckListItem active={checkedFeatureSet.has('changeAppTheme')}>
          Change App Theme
        </FeatureCheckListItem>
        <FeatureCheckListItem
          active={checkedFeatureSet.has('changeEditorTheme')}
        >
          Change Editor Theme
        </FeatureCheckListItem>
        <FeatureCheckListItem
          active={checkedFeatureSet.has('checkOutMobileApp')}
        >
          Check out mobile app (
          <a
            href='https://apps.apple.com/us/app/boostnote-mobile/id1498182749'
            onClick={(event) => {
              event.preventDefault()
              checkFeature('checkOutMobileApp')
              openNew(
                'https://apps.apple.com/us/app/boostnote-mobile/id1498182749'
              )
            }}
          >
            iOS
          </a>
          ,{' '}
          <a
            href='https://play.google.com/store/apps/details?id=com.boostio.boostnote'
            onClick={(event) => {
              event.preventDefault()
              checkFeature('checkOutMobileApp')
              openNew(
                'https://play.google.com/store/apps/details?id=com.boostio.boostnote'
              )
            }}
          >
            Android
          </a>
          )
        </FeatureCheckListItem>
      </FeatureCheckList>
      <div>
        <HideButton onClick={hideFeatureCheckList}>Hide</HideButton>
      </div>
    </Container>
  )
}

export default FeatureCheckListPopup
