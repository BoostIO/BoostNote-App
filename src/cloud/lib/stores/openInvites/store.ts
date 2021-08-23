import { useState } from 'react'
import { useEffectOnce } from 'react-use'
import useApi from '../../../../design/lib/hooks/useApi'
import {
  cancelOpenInvites,
  createOpenInvites,
  getOpenInvites,
} from '../../../api/teams/open-invites'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'
import { usePage } from '../pageStore'

type OpenInviteAction = {
  inProgress: boolean
  send: (teamId: string) => void
}

type OpenInvitesState =
  | { state: 'loading' }
  | {
      state: 'loaded'
      openInvites: SerializedOpenInvite[]
      actions: {
        get: OpenInviteAction
        post: OpenInviteAction
        delete: OpenInviteAction
      }
    }

export function useOpenInvitesStore(): OpenInvitesState {
  const { team } = usePage()
  const [openInvites, setOpenInvites] = useState<SerializedOpenInvite[]>([])

  const { submit: getInvites, sending: fetching } = useApi({
    api: (teamId: string) => getOpenInvites(teamId),
    cb: ({ invites }) => {
      setOpenInvites(invites)
    },
  })

  const { submit: refreshInvites, sending: registering } = useApi({
    api: (teamId: string) => createOpenInvites(teamId),
    cb: ({ invites }) => {
      setOpenInvites(invites)
    },
  })

  const { submit: deleteInvites, sending: deleting } = useApi({
    api: (teamId: string) => cancelOpenInvites(teamId),
    cb: () => {
      setOpenInvites([])
    },
  })

  useEffectOnce(() => {
    getInvites(team!.id)
  })

  if (fetching) {
    return { state: 'loading' }
  }

  return {
    state: 'loaded',
    openInvites,
    actions: {
      get: {
        inProgress: fetching,
        send: getInvites,
      },
      post: {
        inProgress: registering,
        send: refreshInvites,
      },
      delete: {
        inProgress: deleting,
        send: deleteInvites,
      },
    },
  }
}
