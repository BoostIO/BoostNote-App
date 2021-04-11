import { SerializedApiToken } from '../../../interfaces/db/apiTokens'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useState, useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import {
  listTokens,
  deleteToken,
  createToken,
  updateToken,
} from '../../../api/tokens'
import { splitWhen } from 'ramda'
import { useToast } from '../../../../lib/v2/stores/toast'

interface Actions {
  deleteToken: (token: SerializedApiToken) => void
  createToken: (name: string, team: SerializedTeam) => void
  updateToken: (token: SerializedApiToken) => void
}

type State =
  | { state: 'initialising' }
  | { state: 'initialised'; tokens: SerializedApiToken[]; actions: Actions }

export function useApiTokensStore(): State {
  const { pushApiErrorMessage } = useToast()
  const [tokens, setTokens] = useState<SerializedApiToken[]>([])
  const [initialised, setInitialised] = useState(false)

  useEffectOnce(() => {
    const getUserTokens = async () => {
      try {
        const { tokens } = await listTokens()
        setTokens(tokens)
        setInitialised(true)
      } catch (error) {
        pushApiErrorMessage(error)
      }
    }
    getUserTokens()
  })

  const createApiToken = useCallback(
    async (name: string, team: SerializedTeam) => {
      try {
        const { token } = await createToken(name, team)
        setTokens((tokens) => [token, ...tokens])
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [pushApiErrorMessage]
  )

  const updateApiToken = useCallback(
    async (tokenUpdate: SerializedApiToken) => {
      try {
        const { token } = await updateToken(tokenUpdate)
        setTokens((tokens) => {
          const [left, [, ...right]] = splitWhen(
            (tok: SerializedApiToken) => tok.id === token.id,
            tokens
          )
          return [...left, token, ...right]
        })
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [pushApiErrorMessage]
  )

  const deleteApiToken = useCallback(
    async (token: SerializedApiToken) => {
      try {
        await deleteToken(token)
        setTokens((tokens) => {
          return tokens.filter((tok) => tok.id !== token.id)
        })
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [pushApiErrorMessage]
  )

  if (!initialised) {
    return { state: 'initialising' }
  }

  return {
    state: 'initialised',
    tokens,
    actions: {
      createToken: createApiToken,
      deleteToken: deleteApiToken,
      updateToken: updateApiToken,
    },
  }
}
