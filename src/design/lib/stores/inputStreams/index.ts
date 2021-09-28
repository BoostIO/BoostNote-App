import { createStoreContext } from '../../utils/context'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useToast } from '../toast'
import {
  SerializedInputStream,
  SerializedSource,
} from '../../../../cloud/interfaces/db/inputStream'
import {
  createTeamInputStream,
  CreateTeamInputStreamResponseBody,
  createTeamInputStreamSource,
  CreateTeamInputStreamSourceResponseBody,
  deleteTeamInputStream,
  deleteTeamInputStreamSource,
  getTeamInputStreams,
} from '../../../../cloud/api/inputStreams'
import useBulkApi, { BulkApiActionRes } from '../../hooks/useBulkApi'
import shortid from 'shortid'

export interface InputStreamsActions {
  removeInputStream: (
    stream: SerializedInputStream
  ) => Promise<BulkApiActionRes>
  addInputStream: (
    teamId: string,
    integrationId: string,
    type: string,
    name: string,
    initialSource?: string
  ) => Promise<BulkApiActionRes>
  addSource: (
    stream: SerializedInputStream,
    source: string
  ) => Promise<BulkApiActionRes>
  removeSource: (source: SerializedSource) => Promise<BulkApiActionRes>
}

export type TeamInputStreamsState =
  | { initialized: false }
  | {
      initialized: true
      streams: SerializedInputStream[]
      actions: InputStreamsActions
      sendingMap: Map<string, string>
      setStreams: React.Dispatch<React.SetStateAction<SerializedInputStream[]>>
    }
  | {
      initialized: true
      streams: SerializedInputStream[]
      actions: InputStreamsActions
      sendingMap: Map<string, string>
      setStreams: React.Dispatch<React.SetStateAction<SerializedInputStream[]>>
    }

function useTeamInputStreamsStore(): TeamInputStreamsState {
  const { team, currentUserPermissions } = usePage()
  const { pushApiErrorMessage } = useToast()
  const [inputStreams, setInputStreams] = useState<SerializedInputStream[]>([])
  const [initialized, setInitialized] = useState<boolean>(false)
  const { sendingMap, send } = useBulkApi()

  const prevTeamRef = useRef('')
  const prevUserRef = useRef('')
  useEffect(() => {
    if (team == null || currentUserPermissions == null) {
      setInitialized(false)
      setInputStreams([])
      return undefined
    }

    if (
      team.id === prevTeamRef.current &&
      currentUserPermissions.user.id === prevUserRef.current
    ) {
      return undefined
    }

    setInitialized(false)
    setInputStreams([])

    prevTeamRef.current = team.id
    prevUserRef.current = currentUserPermissions.user.id

    let cancel = false
    const getInputStreams = async () => {
      try {
        const { data } = await getTeamInputStreams(team.id)
        if (cancel) {
          return
        }
        setInputStreams(data)
        setInitialized(true)
      } catch (err) {
        pushApiErrorMessage(err)
      }
    }

    getInputStreams()
    return () => {
      cancel = true
    }
  }, [team, currentUserPermissions, pushApiErrorMessage])

  const removeInputStream = useCallback(
    async (stream: SerializedInputStream) => {
      return send(stream.id, 'delete', {
        api: () => deleteTeamInputStream(stream.id),
        cb: () => {
          setInputStreams((streams) => {
            return streams.filter((item) => item.id !== stream.id)
          })
        },
      })
    },
    [send]
  )

  const addInputStream = useCallback(
    async (
      teamId: string,
      integrationId: string,
      type: string,
      name: string,
      initialSource?: string
    ) => {
      return send(shortid.generate(), 'create', {
        api: () =>
          createTeamInputStream(
            teamId,
            integrationId,
            type,
            name,
            initialSource
          ),
        cb: (response: CreateTeamInputStreamResponseBody) => {
          setInputStreams((prev) => [response.data, ...prev])
        },
      })
    },
    [send]
  )

  const addSource = useCallback(
    async (stream: SerializedInputStream, source: string) => {
      return send(shortid.generate(), 'create-source', {
        api: () => createTeamInputStreamSource(stream.id, source),
        cb: (response: CreateTeamInputStreamSourceResponseBody) => {
          setInputStreams((prev) =>
            prev.reduce((acc, inputStream) => {
              if (inputStream.id === stream.id) {
                const newStream = inputStream
                inputStream.sources = [
                  ...(inputStream.sources || []).slice(),
                  response.data,
                ]
                acc.push(newStream)
              } else {
                acc.push(inputStream)
              }
              return acc
            }, [] as SerializedInputStream[])
          )
        },
      })
    },
    [send]
  )

  const removeSource = useCallback(
    async (source: SerializedSource) => {
      return send(source.id, 'delete', {
        api: () => deleteTeamInputStreamSource(source.inputStreamId, source.id),
        cb: () => {
          setInputStreams((prev) =>
            prev.reduce((acc, inputStream) => {
              if (inputStream.id === source.inputStreamId) {
                const newStream = inputStream

                newStream.sources = (inputStream.sources || []).filter(
                  (s) => s.id !== source.id
                )

                acc.push(newStream)
              } else {
                acc.push(inputStream)
              }
              return acc
            }, [] as SerializedInputStream[])
          )
        },
      })
    },
    [send]
  )

  if (!initialized) {
    return { initialized: false }
  }

  return {
    initialized: true,
    streams: inputStreams,
    setStreams: setInputStreams,
    sendingMap,
    actions: {
      removeInputStream,
      addInputStream,
      addSource,
      removeSource,
    },
  }
}

export const {
  StoreProvider: TeamInputStreamsProvider,
  useStore: useTeamInputStreams,
} = createStoreContext(useTeamInputStreamsStore, 'Input Streams')
