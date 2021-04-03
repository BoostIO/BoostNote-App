import {
  updateWorkspace,
  UpdateWorkspaceResponseBody,
} from '../../../../cloud/api/teams/workspaces'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { useToast } from '../../stores/toast'
import useApi from '../useApi'

export function useWorkspaceEdit() {
  const { updateWorkspacesMap } = useNav()
  const { pushMessage } = useToast()

  const { sending, submit } = useApi({
    api: ({
      teamId,
      workspaceId,
      body,
    }: {
      teamId: string
      workspaceId: string
      body: {
        name: string
        public: boolean
        permissions: string[]
      }
    }) => updateWorkspace({ id: teamId } as any, workspaceId, body),
    cb: ({ workspace }: UpdateWorkspaceResponseBody) => {
      updateWorkspacesMap([workspace.id, workspace])
      pushMessage({
        title: 'Success',
        description: 'Your workspace has been updated',
        type: 'success',
      })
    },
  })

  return {
    sending,
    call: submit,
  }
}
