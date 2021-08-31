import {
  mdiAlertCircleCheckOutline,
  mdiAlertCircleOutline,
  mdiCheck,
} from '@mdi/js'
import React, { useCallback } from 'react'
import Icon, {
  SuccessIcon,
  WarningIcon,
} from '../../../../design/components/atoms/Icon'
import { useModal } from '../../../../design/lib/stores/modal'
import { useToast } from '../../../../design/lib/stores/toast'
import styled from '../../../../design/lib/styled'
import { GithubIssueBlock } from '../../../api/blocks'
import { postAction } from '../../../api/integrations'
import { capitalize } from '../../../lib/utils/string'
import { BlockDataProps } from './types'

const GithubStatusCell = ({
  data,
  onUpdate,
}: BlockDataProps<GithubIssueBlock>) => {
  const { openContextModal, closeAllModals } = useModal()
  const { pushApiErrorMessage } = useToast()

  const updateState = useCallback(
    async (state: 'open' | 'closed') => {
      try {
        const [owner, repo] = data.repository.full_name.split('/')
        const issue = await postAction(
          { id: data.integrationId },
          'issue:update',
          { owner, repo, issue_number: data.number },
          { state }
        )
        await onUpdate({ ...data, ...issue })
        closeAllModals()
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [data, onUpdate, closeAllModals, pushApiErrorMessage]
  )

  const openStateSelect: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <GithubStateSelect data={data} onUpdate={updateState} />
      )
    },
    [openContextModal, data, updateState]
  )

  return (
    <StyledStatus onClick={openStateSelect}>
      {data.state === 'open' ? (
        <SuccessIcon path={mdiAlertCircleOutline} />
      ) : (
        <WarningIcon path={mdiAlertCircleCheckOutline} />
      )}
      <span>{capitalize(data.state)}</span>
    </StyledStatus>
  )
}

const StyledStatus = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  & > svg:first-child {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  & > span {
    flex-grow: 1;
    text-align: left;
  }
`

interface StateSelectProps {
  data: GithubCellProps['data']
  onUpdate: (state: 'closed' | 'open') => Promise<void>
}

const GithubStateSelect = ({ data, onUpdate }: StateSelectProps) => {
  return (
    <StateSelectContainer>
      <div onClick={() => onUpdate('open')}>
        <SuccessIcon path={mdiAlertCircleOutline} />
        <span>Open</span>
        {data.state === 'open' && <Icon path={mdiCheck} />}
      </div>
      <div onClick={() => onUpdate('closed')}>
        <WarningIcon path={mdiAlertCircleCheckOutline} />
        <span>Closed</span>
        {data.state === 'closed' && <Icon path={mdiCheck} />}
      </div>
    </StateSelectContainer>
  )
}

const StateSelectContainer = styled.div`
  & > div {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    & svg {
      margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
    }
    & > span {
      flex-grow: 1;
    }
  }
`

export default GithubStatusCell
