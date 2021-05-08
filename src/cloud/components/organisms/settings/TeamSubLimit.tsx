import React from 'react'
import cc from 'classcat'
import { usePage } from '../../../lib/stores/pageStore'
import { useSettings } from '../../../lib/stores/settings'
import SettingTeamSubLimit from '../../../../shared/components/organisms/Settings/atoms/SettingTeamSubLimit'

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
      <SettingTeamSubLimit>
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
      </SettingTeamSubLimit>
    )
  }

  return (
    <SettingTeamSubLimit>
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
    </SettingTeamSubLimit>
  )
}

export default TeamSubLimit
