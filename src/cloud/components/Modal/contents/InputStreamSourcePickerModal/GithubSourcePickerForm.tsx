import plur from 'plur'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LoadingButton } from '../../../../../design/components/atoms/Button'
import ColoredBlock from '../../../../../design/components/atoms/ColoredBlock'
import FormSelect from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { useToast } from '../../../../../design/lib/stores/toast'
import styled from '../../../../../design/lib/styled'
import { getAction, IntegrationActionTypes } from '../../../../api/integrations'
import { SerializedTeamIntegration } from '../../../../interfaces/db/connections'

interface GithubSourcePickerFormProps {
  integration?: SerializedTeamIntegration
  setSource: React.Dispatch<React.SetStateAction<string | undefined>>
}

type Repo = IntegrationActionTypes['user:repos'][number] & {
  private?: boolean
  full_name?: string
}
const perPagePerQuery = 10

const GithubSourcePickerForm = ({
  integration,
  setSource,
}: GithubSourcePickerFormProps) => {
  const [repos, setRepos] = useState<Repo[]>([])
  const [currentRepo, setCurrentRepo] = useState<Repo | null>(null)
  const [fetching, setFetching] = useState(false)
  const { pushApiErrorMessage } = useToast()

  const currentPageRef = useRef(1)
  const mountedRef = useRef(false)
  const errorHandleRef = useRef(pushApiErrorMessage)

  const repoOptions = useMemo(() => {
    return repos.map(({ id, full_name }) => ({ label: full_name, value: id }))
  }, [repos])

  const setRepo = useCallback(
    ({ value }) => {
      const repo = repos.find(({ id }) => id === value)
      if (repo) {
        setCurrentRepo(repo)
        setSource(repo.full_name)
      }
    },
    [repos, setSource]
  )

  useEffect(() => {
    errorHandleRef.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setRepos([])
    setCurrentRepo(null)
    currentPageRef.current = 1
    if (integration == null) {
      return
    }
    setFetching(true)
    getAction(integration, 'user:repos', {
      per_page: perPagePerQuery,
      page: 1,
    })
      .then((repos) => {
        if (!mountedRef.current) return

        console.log(repos)
        setRepos(repos)
      })
      .finally(() => {
        if (!mountedRef.current) return
        setFetching(false)
      })
      .catch(errorHandleRef.current)
  }, [integration])

  const getMore = useCallback(async () => {
    if (integration == null) {
      return
    }
    setFetching(true)
    const page = currentPageRef.current + 1

    getAction(integration, 'user:repos', {
      per_page: perPagePerQuery,
      page,
    })
      .then((repos) => {
        if (!mountedRef.current) return

        currentPageRef.current = page
        setRepos((prev) => prev.concat(repos))
      })
      .finally(() => {
        if (!mountedRef.current) return
        setFetching(false)
      })
      .catch(errorHandleRef.current)
  }, [integration])

  return (
    <>
      <FormRow
        row={{
          title: 'Scope',
        }}
        fullWidth={true}
      >
        <FormRowItem>
          <FormSelect
            value={
              currentRepo != null
                ? {
                    label: currentRepo.full_name,
                    value: currentRepo.id,
                  }
                : undefined
            }
            isLoading={fetching}
            options={repoOptions}
            onChange={setRepo}
            isDisabled={integration == null || fetching}
            isSearchable={true}
            placeholder='Select a repository...'
          />
        </FormRowItem>
      </FormRow>
      {repoOptions.length > 0 && (
        <GetMoreLine className='form__row'>
          <span>
            {repoOptions.length} {plur('repository', repoOptions.length)} found
          </span>
          {repoOptions.length % perPagePerQuery === 0 && (
            <LoadingButton
              variant='secondary'
              size='sm'
              disabled={fetching}
              spinning={fetching}
              onClick={getMore}
              className='form__get-more'
            >
              Get More
            </LoadingButton>
          )}
        </GetMoreLine>
      )}
      {currentRepo != null && currentRepo.private && (
        <FormRow fullWidth={true}>
          <FormRowItem>
            <ColoredBlock variant='warning'>
              Private repositories have to allow the creation of external
              webhooks. Please check carefully before proceeding.
            </ColoredBlock>
          </FormRowItem>
        </FormRow>
      )}
    </>
  )
}

const GetMoreLine = styled.div`
  .form__get-more {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default GithubSourcePickerForm
