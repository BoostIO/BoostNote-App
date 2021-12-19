import React, { ChangeEvent } from 'react'
import { useState } from 'react'
import { useCallback } from 'react'
import { callApi } from '../../lib/client'
import { useRouter } from '../../lib/router'
import { useGlobalData } from '../../lib/stores/globalData'

const GithubSourceCallbackPage = () => {
  const { query, push } = useRouter()
  const { globalData } = useGlobalData()
  const [teamId, setTeamId] = useState<string>('')

  const submit = useCallback(async () => {
    if (teamId === '') {
      return
    }
    const data = await callApi(`/api/sources/github/callback`, {
      method: 'post',
      json: {
        code: query.code,
        installationId: query.installation_id,
        teamId,
      },
    })

    console.log(data)
    const team = globalData.teams.find((team) => team.id === teamId)
    push(`/${team!.domain}`)
  }, [globalData.teams, push, query.code, query.installation_id, teamId])

  const updateTeamId = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setTeamId(event.target.value)
  }, [])

  return (
    <div>
      <div>
        <h2>Code</h2>
        <input defaultValue={query.code} readOnly />
      </div>

      <div>
        <h2>Install</h2>
        <input defaultValue={query.installation_id} readOnly />
      </div>

      <div>
        Team select
        <select value={teamId} onChange={updateTeamId}>
          <option value=''>Select Team</option>
          {globalData.teams.map((team) => {
            return (
              <option value={team.id} key={team.id}>
                {team.name}
              </option>
            )
          })}
        </select>
      </div>

      <div>
        <button onClick={submit}>Create Source</button>
      </div>
    </div>
  )
}

export default GithubSourceCallbackPage
