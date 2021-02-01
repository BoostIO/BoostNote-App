import React from 'react'
import styled from '../../../lib/styled'
import { usePage } from '../../../lib/stores/pageStore'
import cc from 'classcat'
import { useSettings } from '../../../lib/stores/settings'

const TeamSubLimit = () => {
  const { subscription, team, currentSubInfo } = usePage()
  const { openSettingsTab } = useSettings()

  if (
    (subscription != null && subscription.status === 'active') ||
    currentSubInfo == null ||
    team == null
  ) {
    return null
  }

  if (currentSubInfo.trialing) {
    return (
      <StyledSidebarTeamSubLimit>
        <a
          className='upgrade-link'
          href='#'
          onClick={(e: any) => {
            e.preventDefault()
            openSettingsTab('teamUpgrade')
          }}
        >
          <h6>Upgrade to go unlimited</h6>
          <p className='note-limit'>
            Your workspace&apos;s trial of the Pro plan lasts through{' '}
            {currentSubInfo.info.formattedEndDate}
          </p>
          <p className='note-limit'>
            You can upgrade at anytime during your trial.
          </p>
        </a>
      </StyledSidebarTeamSubLimit>
    )
  }

  return (
    <StyledSidebarTeamSubLimit>
      <a
        className='upgrade-link'
        href='#'
        onClick={(e: any) => {
          e.preventDefault()
          openSettingsTab('teamUpgrade')
        }}
      >
        <p className='note-limit'>
          {currentSubInfo.info.progressLabel} notes used
        </p>
        <div className='progress-sm'>
          <div
            className={cc([
              'progress-bar',
              currentSubInfo.info.overLimit && 'over-limit',
            ])}
            style={{ width: `${currentSubInfo.info.rate}%` }}
          />
        </div>
        <p>{currentSubInfo.info.label}</p>
        {currentSubInfo.info.trialIsOver && (
          <p className='text-danger'>
            Your pro plan trial has ended. Please upgrade now
          </p>
        )}
      </a>
    </StyledSidebarTeamSubLimit>
  )
}

const StyledSidebarTeamSubLimit = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.baseTextColor};
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;

  p {
    color: ${({ theme }) => theme.subtleTextColor};
    margin: 10px 0px;
  }

  .note-limit {
    font-size: ${({ theme }) => theme.fontSizes.small}px;
  }

  .progress-sm {
    display: block;
    width: 100%;
    overflow: hidden;
    height: 3px;
    font-size: 0.75rem;
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
    border-radius: 0.25rem;
    text-align: center;
    position: relative;
  }

  .progress-bar {
    background-color: ${({ theme }) => theme.primaryBackgroundColor};
    max-width: 100%;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
    transition: width 0.6s ease;
    height: 3px;

    &.over-limit {
      background-color: ${({ theme }) => theme.dangerBackgroundColor};
    }
  }

  .upgrade-link {
    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }
    cursor: pointer;
    display: block;
    margin: 10px 0 5px 0;
    padding: 15px;
    text-decoration: none;
  }

  .progress-label {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }

  .text-danger {
    color: ${({ theme }) => theme.dangerTextColor};
  }
`

export default TeamSubLimit
