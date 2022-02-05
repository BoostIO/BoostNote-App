import React from 'react'
import { useCallback } from 'react'
import Button from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'
import { callApi } from '../../lib/client'
import { useRouter } from '../../lib/router'
import { useGlobalData } from '../../lib/stores/globalData'

const GithubSourceCallbackPage = () => {
  const { query, push } = useRouter()
  const { globalData } = useGlobalData()

  const submit = useCallback(
    async (teamId: string) => {
      const data = await callApi(`/api/sources/github/callback`, {
        method: 'post',
        json: {
          code: query.code,
          installationId: query.installation_id,
          teamId,
        },
      })

      console.info(data)
      const team = globalData.teams.find((team) => team.id === teamId)
      push(`/${team!.domain}`)
    },
    [globalData.teams, push, query.code, query.installation_id]
  )

  return (
    <Container>
      <h1>Install Github App</h1>
      <p>Select a Team to install the Github app.</p>
      <ul>
        {globalData.teams.map((team) => {
          return (
            <li value={team.id} key={team.id}>
              {team.name}{' '}
              <Button
                onClick={() => {
                  submit(team.id)
                }}
              >
                Install
              </Button>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

export default GithubSourceCallbackPage

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px;
`
