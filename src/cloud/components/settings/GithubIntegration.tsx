import React from 'react'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import IntegrationManager from './IntegrationManager'

const GithubIntegrations = () => {
  return (
    <SettingTabContent
      title='GitHub'
      body={
        <IntegrationManager
          service='github:team'
          name='Github'
          icon='/app/static/logos/github.png'
        >
          <h3>How does it work?</h3>
          <p>Create Github Issue blocks in Canvas Documents (beta)</p>
        </IntegrationManager>
      }
    />
  )
}

export default GithubIntegrations
