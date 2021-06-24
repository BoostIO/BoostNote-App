import React, { useCallback } from 'react'
import { mdiChevronDown, mdiAlertCircleOutline } from '@mdi/js'
import { capitalize } from '../../lib/utils/string'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../shared/lib/stores/contextMenu'
import { Thread } from '../../interfaces/db/comments'
import Icon, {
  SuccessIcon,
  PrimaryIcon,
  WarningIcon,
} from '../../../shared/components/atoms/Icon'
import { RoundButton } from '../../../shared/components/atoms/Button'
import styled from '../../../shared/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { TFunction } from 'i18next'
import { lngKeys } from '../../lib/i18n/types'

export type StatusFilter = Thread['status']['type'] | 'all'

interface StatusFilterControlProps {
  value: StatusFilter
  onChange: (filter: StatusFilter) => void
  counts: { [K in StatusFilter]: number }
}

function ThreadStatusFilterControl({
  value,
  onChange,
  counts,
}: StatusFilterControlProps) {
  const { getThreadStatusLabel, translate } = useI18n()
  const { popup } = useContextMenu()

  const openActionMenu: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault()
      popup(event, buildMenu(translate, onChange, counts))
    },
    [popup, onChange, counts, translate]
  )

  return (
    <FilterButton variant='icon_secondary' onClick={openActionMenu}>
      <ThreadFilterIcon status={value} />
      <span className='filter__text'>
        {capitalize(getThreadStatusLabel(value))} ({counts[value]})
      </span>
      <Icon path={mdiChevronDown} />
    </FilterButton>
  )
}

const FilterButton = styled(RoundButton)`
  & .button__label {
    display: flex;
    align-items: center;
    min-width: 120px;

    & > svg:first-child {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }

    & > span.filter__text {
      flex-grow: 1;
      text-align: left;
    }
  }
`

function buildMenu(
  t: TFunction,
  action: StatusFilterControlProps['onChange'],
  counts: StatusFilterControlProps['counts']
): MenuItem[] {
  return [
    {
      icon: <PrimaryIcon path={mdiAlertCircleOutline} />,
      type: MenuTypes.Normal,
      label: `${capitalize(t(lngKeys.GeneralAll))} (${counts.all})`,
      onClick: () => action('all'),
    },
    {
      icon: <SuccessIcon path={mdiAlertCircleOutline} />,
      type: MenuTypes.Normal,
      label: `${capitalize(t(lngKeys.ThreadOpen))} (${counts.open})`,
      onClick: () => action('open'),
    },
    {
      icon: <WarningIcon path={mdiAlertCircleOutline} />,
      type: MenuTypes.Normal,
      label: `${capitalize(t(lngKeys.ThreadClosed))} (${counts.closed})`,
      onClick: () => action('closed'),
    },
    {
      icon: <Icon path={mdiAlertCircleOutline} />,
      type: MenuTypes.Normal,
      label: `${capitalize(t(lngKeys.ThreadOutdated))} (${counts.outdated})`,
      onClick: () => action('outdated'),
    },
  ]
}

function ThreadFilterIcon({ status }: { status: StatusFilter }) {
  switch (status) {
    case 'all':
      return <PrimaryIcon path={mdiAlertCircleOutline} />
    case 'open':
      return <SuccessIcon path={mdiAlertCircleOutline} />
    case 'closed':
      return <WarningIcon path={mdiAlertCircleOutline} />
    case 'outdated':
      return <Icon path={mdiAlertCircleOutline} />
  }
}

export default ThreadStatusFilterControl
