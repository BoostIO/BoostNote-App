import React, { useEffect, useRef, useState, useCallback } from 'react'
import { SerializedWorkspace } from '../../cloud/interfaces/db/workspace'
import { SelectChangeEventHandler } from '../../lib/events'
import { initAccessToken } from '../../cloud/lib/stores/electron'
import { getWorkspaces } from '../../cloud/api/teams/workspaces'
import { SectionSelect } from '../PreferencesModal/styled'

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

  useEffect(() => {
    let cancelled = false
    setWorkspaces(cache.current.get(team.id))
    setState('loading')
    initAccessToken()
      .then(() => getWorkspaces(team.id))
      .then(({ workspaces }) => {
        cache.current.set(team.id, workspaces)
        if (!cancelled) {
          setWorkspaces(workspaces)
          setState('ready')
        }
      })
      .catch((error) => {
        setState('error')
        onErrorRef.current && onErrorRef.current(error)
      })
    return () => {
      cancelled = true
    }
  }, [team])

  useEffect(() => {
    onChange(workspaces != null ? workspaces[0] || null : null)
  }, [onChange, workspaces])

  return (
    <SectionSelect
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
    </SectionSelect>
  )
}

export default CloudWorkspaceSelect
