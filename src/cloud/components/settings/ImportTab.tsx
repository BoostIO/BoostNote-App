import React from 'react'
import { usePage } from '../../lib/stores/pageStore'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import ViewerRestrictedWrapper from '../ViewerRestrictedWrapper'
import ImportFlow from '../ImportFlow'

const ImportTab = () => {
  const { team } = usePage()
  const { translate } = useI18n()

  return (
    <SettingTabContent
      title={translate(lngKeys.GeneralImport)}
      description={translate(lngKeys.SettingsImportDescription)}
      body={
        team == null ? (
          'Please select a team.'
        ) : (
          <ViewerRestrictedWrapper>
            <ImportFlow />
          </ViewerRestrictedWrapper>
        )
      }
    />
  )
}

export default ImportTab
