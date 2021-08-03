import React from 'react'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import IntegrationManager from './IntegrationManager'

const SlackIntegration = () => {
  return (
    <SettingTabContent
      title='Slack'
      body={
        <IntegrationManager
          service='slack:team'
          name='Slack'
          icon='/app/static/logos/slack.png'
        >
          <h3>How does it work?</h3>
          <p>Show Boost Note document preview in Slack</p>
        </IntegrationManager>
      }
    />
  )
}

export default SlackIntegration
