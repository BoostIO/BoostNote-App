import React, { useEffect, useRef, useState, useCallback } from 'react'
import { SerializedWorkspace } from '../../cloud/interfaces/db/workspace'
import { SelectChangeEventHandler } from '../../lib/events'
import { usePreferences } from '../../lib/preferences'
import { getWorkspaces } from '../../cloud/api/teams/workspaces'
import { FormSelect } from '../atoms/form'

interface WorkspaceSelectProps {
  onChange: (workspace: SerializedWorkspace | null) => void
  onError?: (err: Error) => void
  value: SerializedWorkspace | null
  team: { id: string; name: string }
}

const CloudWorkspaceSelect = ({
  onChange,
  onError,
  value,
  team,
}: WorkspaceSelectProps) => {
  const cache = useRef<Map<string, SerializedWorkspace[]>>(new Map())
  const [workspaces, setWorkspaces] = useState<
    SerializedWorkspace[] | undefined
  >()
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading')

  const selectWorkspace: SelectChangeEventHandler = useCallback(
    (ev) => {
      if (workspaces != null) {
        onChange(
          workspaces.find((workspace) => workspace.id === ev.target.value) ||
            null
        )
      }
    },
    [workspaces, onChange]
  )

  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])
  const { preferences } = usePreferences()

  useEffect(() => {
    let cancelled = false
    setWorkspaces(cache.current.get(team.id))
    setState('loading')

    new Promise<{
      workspaces: SerializedWorkspace[]
    }>(async (resolve, reject) => {
      try {
        const data = await getWorkspaces(team.id)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
      .then(({ workspaces }) => {
        cache.current.set(team.id, workspaces)
        if (!cancelled) {
          setWorkspaces(workspaces)
          setState('ready')
        }
      })
      .catch((error) => {
        setState('error')
        console.error(error)
        onErrorRef.current && onErrorRef.current(error)
      })
    return () => {
      cancelled = true
    }
  }, [team, preferences])

  useEffect(() => {
    onChange(workspaces != null ? workspaces[0] || null : null)
  }, [onChange, workspaces])

  return (
    <FormSelect
      disabled={state === 'loading'}
      value={value?.id}
      onChange={selectWorkspace}
    >
      {workspaces != null &&
        workspaces.map((workspace) => {
          return (
            <option value={workspace.id} key={workspace.id}>
              {workspace.name}
            </option>
          )
        })}
    </FormSelect>
  )
}

export default CloudWorkspaceSelect
