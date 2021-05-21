import React from 'react'
import { DocStatus } from '../../interfaces/db/doc'
import Icon, { IconSize } from '../../../shared/components/atoms/Icon'
import styled from '../../lib/styled'
import cc from 'classcat'
import {
  mdiPlayCircleOutline,
  mdiPauseCircleOutline,
  mdiCheckCircleOutline,
  mdiArchiveOutline,
} from '@mdi/js'

interface DocStatusIconProps {
  status: DocStatus
  className?: string
  size?: IconSize
}

const DocStatusIcon = ({ status, className, size }: DocStatusIconProps) => {
  return (
    <WrappedIcon
      className={cc([
        'doc-status-icon',
        getClassNameByStatus(status),
        className,
      ])}
      size={size}
      path={getIconPathByStatus(status)}
    />
  )
}

export default DocStatusIcon

const WrappedIcon = styled(Icon)`
  &.doc-status-icon--in-progress {
    color: ${({ theme }) => theme.infoTextColor};
  }
  &.doc-status-icon--paused {
    color: ${({ theme }) => theme.secondaryTextColor};
  }
  &.doc-status-icon--completed {
    color: ${({ theme }) => theme.successTextColor};
  }
  &.doc-status-icon--archived {
    color: ${({ theme }) => theme.warningTextColor};
  }
`

function getClassNameByStatus(status: DocStatus) {
  switch (status) {
    case 'paused':
      return 'doc-status-icon--paused'
    case 'completed':
      return 'doc-status-icon--completed'
    case 'archived':
      return 'doc-status-icon--archived'
    case 'in_progress':
    default:
      return 'doc-status-icon--in-progress'
  }
}

function getIconPathByStatus(status: DocStatus) {
  switch (status) {
    case 'paused':
      return mdiPauseCircleOutline
    case 'completed':
      return mdiCheckCircleOutline
    case 'archived':
      return mdiArchiveOutline
    case 'in_progress':
    default:
      return mdiPlayCircleOutline
  }
}
