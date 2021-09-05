import styled from '../../../../design/lib/styled'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import { getAction, postAction } from '../../../api/integrations'
import Spinner from '../../../../design/components/atoms/Spinner'
import { useToast } from '../../../../design/lib/stores/toast'
import { BlockDataProps } from './types'
import { GithubIssueBlock } from '../../../api/blocks'
import SearchableOptionListPopup from '../../SearchableOptionListPopup'
import Flexbox from '../../../../design/components/atoms/Flexbox'

interface Label {
  name: string
  color: string
  description: string
}

const GithubLabelsData = ({
  data,
  onUpdate,
}: BlockDataProps<GithubIssueBlock>) => {
  const { openContextModal, closeAllModals } = useModal()
  const { pushApiErrorMessage } = useToast()

  const addLabel = useCallback(
    async (toAdd: Label[]) => {
      try {
        const labels = data.labels
          .concat(toAdd)
          .map((label: Label) => label.name)
        const [owner, repo] = data.repository.full_name.split('/')
        const issue = await postAction(
          { id: data.integrationId },
          'issue:update',
          { owner, repo, issue_number: data.number },
          { labels }
        )
        await onUpdate({ ...data, ...issue })
        closeAllModals()
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [data, closeAllModals, onUpdate, pushApiErrorMessage]
  )

  const openSetLabelSelect: React.MouseEventHandler = useCallback(
    (ev) => {
      //TOFIX PREVENT GITHUB UPDATE FOR NOW
      return
      openContextModal(
        ev,
        <GithubLabelsSelect data={data} onUpdate={addLabel} />
      )
    },
    [data, addLabel, openContextModal]
  )

  return (
    <StyledGithubLabels onClick={openSetLabelSelect}>
      <ul>
        {data.labels.map((label: Label) => (
          <li style={{ backgroundColor: `#${label.color}` }} key={label.name}>
            {label.name}
          </li>
        ))}
      </ul>
    </StyledGithubLabels>
  )
}

const StyledGithubLabels = styled.div`
  & > ul {
    margin: 0;
    padding: 0;
    display: flex;
    list-style: none;
    & > li {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px;
      border-radius: 5px;
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      text-shadow: 0 0 3px #000;
      white-space: nowrap;
    }
  }
`

interface LabelSelectProps {
  data: GithubIssueBlock['data']
  onUpdate: (labels: Label[]) => Promise<void>
}

const GithubLabelsSelect = ({ data, onUpdate }: LabelSelectProps) => {
  const [labels, setLabels] = useState<Label[] | null>(null)
  const { pushApiErrorMessage } = useToast()
  const [query, setQuery] = useState<string>('')

  const pushErrorRef = useRef(pushApiErrorMessage)
  useEffect(() => {
    pushErrorRef.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  useEffect(() => {
    let cancel = false
    const cb = async () => {
      try {
        if (
          data.integrationId != null &&
          data.repository != null &&
          data.repository.full_name != null
        ) {
          const [owner, repo] = data.repository.full_name.split('/')
          const labels = await getAction(
            { id: data.integrationId },
            'repo:labels',
            { owner, repo }
          )
          if (!cancel) {
            setLabels(labels)
          }
        }
      } catch (error) {
        pushErrorRef.current(error)
      }
    }
    cb()
    return () => {
      cancel = true
    }
  }, [data])

  const filteredLabels = useMemo(() => {
    if (labels == null) {
      return []
    }
    const matches = labels.filter(
      (label) => label.name.includes(query) || label.description.includes(query)
    )
    return matches.map((label) => {
      return {
        label: (
          <Flexbox direction='column'>
            <h4 style={{ margin: '6px 0px' }}>{label.name}</h4>
            <div>{label.description || 'No description'}</div>
          </Flexbox>
        ),
        onClick: () => onUpdate([label]),
      }
    })
  }, [labels, onUpdate, query])

  if (labels == null) {
    return <Spinner />
  }

  return (
    <SearchableOptionListPopup
      query={query}
      setQuery={setQuery}
      title='Labels'
      options={filteredLabels}
    />
  )
}

export default GithubLabelsData
