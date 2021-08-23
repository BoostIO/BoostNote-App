import { mdiAlertCircleCheckOutline, mdiAlertCircleOutline } from '@mdi/js'
import React from 'react'
import {
  SuccessIcon,
  WarningIcon,
} from '../../../../../design/components/atoms/Icon'
import styled from '../../../../../design/lib/styled'
import { capitalize } from '../../../../lib/utils/string'

interface GithubStatusCellProps {
  state: 'open' | 'closed'
}

const GithubStatusCell = ({ state }: GithubStatusCellProps) => {
  return (
    <StyledStatus>
      {state === 'open' ? (
        <SuccessIcon path={mdiAlertCircleOutline} />
      ) : (
        <WarningIcon path={mdiAlertCircleCheckOutline} />
      )}
      <span>{capitalize(state)}</span>
    </StyledStatus>
  )
}

const StyledStatus = styled.div`
  display: flex;
  align-items: center;

  & > svg:first-child {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  & > span {
    flex-grow: 1;
    text-align: left;
  }
`

export default GithubStatusCell
