import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SerializedRevision } from '../../../interfaces/db/revision'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'

export interface PageDataContext<D> {
  pageData: D
  pageDataRef: React.MutableRefObject<D>
  team?: SerializedTeam
  workspaces?: SerializedWorkspace[]
  permissions?: SerializedUserTeamPermissions[]
  subscription?: SerializedSubscription
  openInvite?: SerializedOpenInvite
  removeUserInPermissions: (userId: string) => void
  updateUserInPermissions: (user: Partial<SerializedUser>) => void
  updateTeamSubscription: (sub?: Partial<SerializedSubscription>) => void
  updateSinglePermission: (
    permission: Partial<SerializedUserTeamPermissions>
  ) => void
  removeSinglePermission: (permissionId: string) => void
  pageFolder?: SerializedFolderWithBookmark
  pageDoc?: SerializedDocWithBookmark
  pageTag?: SerializedTag
  pageWorkspace?: SerializedWorkspace
  revisions?: SerializedRevision[]
  type?: 'doc' | 'folder'
  currentSubInfo?: SubscriptionInfo
  setPageData: (data: D) => void
  setPartialPageData: (data: D) => void
  setPartialPageDataRef: React.MutableRefObject<(data: D) => void>
}

export interface PageDataProps {
  team?: SerializedTeam
  permissions?: SerializedUserTeamPermissions[]
  subscription?: SerializedSubscription
}

type SubscriptionTrialInfo = {
  trialing: true
  info: { formattedEndDate: string | number }
}
type SubscriptionInactiveInfo = {
  trialing: false
  info: {
    label: string
    progressLabel: string
    rate: number
    overLimit: boolean
    linkLabel: string
    trialIsOver: boolean
  }
}

export type SubscriptionInfo = SubscriptionTrialInfo | SubscriptionInactiveInfo
