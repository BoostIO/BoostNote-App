import React from 'react'
import Banner from '../../../shared/components/atoms/Banner'
import { AppComponent } from '../../../shared/lib/types'
import { usePage } from '../../lib/stores/pageStore'

interface ViewerRestrictedWrapperProps {
  showBanner?: boolean
}

const ViewerRestrictedWrapper: AppComponent<ViewerRestrictedWrapperProps> = ({
  children,
  showBanner = true,
}) => {
  const { currentUserIsCoreMember } = usePage()

  if (!currentUserIsCoreMember) {
    return showBanner ? (
      <Banner variant='warning'>
        This feature is restricted to members only. Consider asking your team
        members to promote you to a member role.
      </Banner>
    ) : null
  }

  return <>{children}</>
}

export default ViewerRestrictedWrapper
