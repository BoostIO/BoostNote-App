import React, { useMemo } from 'react'
import { getSharedDocsListData } from '../../api/pages/teams/shared'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import ContentManager from '../../components/ContentManager'
import InviteCTAButton from '../../components/Buttons/InviteCTAButton'
import FolderPageInviteSection from '../../components/Onboarding/FolderPageInviteSection'
import ApplicationPage from '../../components/ApplicationPage'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import ApplicationTopbar from '../../components/ApplicationTopbar'
import ApplicationContent from '../../components/ApplicationContent'

const SharedDocsListPage = () => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, workspacesMap } = useNav()

  const sharedDocs = useMemo(() => {
    return [...docsMap.values()].filter((doc) => doc.shareLink != null)
  }, [docsMap])

  useTitle('Shared')

  if (team == null) {
    return (
      <ApplicationPage topbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Team is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={[
          {
            type: 'node',
            element: <InviteCTAButton key='invite-cta' />,
          },
        ]}
      />
      <ApplicationContent>
        <FolderPageInviteSection />
        <ContentManager
          team={team}
          documents={sharedDocs}
          page='shared'
          workspacesMap={workspacesMap}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

SharedDocsListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getSharedDocsListData(params)
  return result
}

export default SharedDocsListPage
