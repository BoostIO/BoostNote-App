import ky from 'ky'
import { useCallback, useState } from 'react'
import { useEffectOnce } from 'react-use'
import useApi from '../../../../design/lib/hooks/useApi'
import {
  cancelOpenInvites,
  createOpenInvites,
  getOpenInvites,
} from '../../../api/teams/open-invites'
import { SerializedOpenInvite } from '../../../interfaces/db/openInvite'
import { createCustomEventEmitter } from '../../utils/events'
import { usePage } from '../pageStore'

type OpenInviteAction = {
  inProgress: boolean
  send: (teamId: string) => void
}

type OpenInvitesState =
  | { state: 'loading' }
  | {
      state: 'error'
      error: string
      actions: {
        get: {
          inProgress: boolean
          send: () => void
        }
      }
    }
  | {
      state: 'loaded'
      openInvites: SerializedOpenInvite[]
      actions: {
        post: OpenInviteAction
        delete: OpenInviteAction
      }
    }

export type OpenInviteLoadedEventDetail = {
  openInvites: SerializedOpenInvite[]
}
export const OpenInviteLoadedEvent = createCustomEventEmitter<
  OpenInviteLoadedEventDetail
>('store-openinvites-loaded')

export function useOpenInvitesStore(): OpenInvitesState {
  const { team } = usePage()
  const [openInvites, setOpenInvites] = useState<SerializedOpenInvite[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string>()

  const getInvites = useCallback(async () => {
    try {
      if (team == null) {
        throw new Error('Error: Missing team')
      }
      setFetching(true)
      setError(undefined)
      const data = await getOpenInvites(team.id)
      setOpenInvites(data.invites)
      OpenInviteLoadedEvent.dispatch({ openInvites: data.invites })
    } catch (error) {
      let rawMessage = 'Something wrong happened...'
      if (error instanceof ky.HTTPError) {
        rawMessage = await error.response.text()
      } else {
        rawMessage =
          typeof error === 'string' ? error : (error as Error).message
      }
      const lines = rawMessage.split('\n')
      setError(lines[0])
    } finally {
      setFetching(false)
    }
  }, [team])

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
    getInvites()
  })

  if (fetching) {
    return { state: 'loading' }
  }

  if (error != null) {
    return {
      state: 'error',
      error,
      actions: {
        get: {
          inProgress: fetching,
          send: getInvites,
        },
      },
    }
  }

  return {
    state: 'loaded',
    openInvites,
    actions: {
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
