import React from 'react'
import { DocStatus } from '../interfaces/db/doc'
import Icon, { IconSize } from '../../design/components/atoms/Icon'
import cc from 'classcat'
import {
  mdiPlayCircleOutline,
  mdiPauseCircleOutline,
  mdiCheckCircleOutline,
  mdiArchiveOutline,
} from '@mdi/js'
import styled from '../../design/lib/styled'

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
    color: ${({ theme }) => theme.colors.variants.info.base};
  }
  &.doc-status-icon--paused {
    color: ${({ theme }) => theme.colors.variants.secondary.base};
  }
  &.doc-status-icon--completed {
    color: ${({ theme }) => theme.colors.variants.success.base};
  }
  &.doc-status-icon--archived {
    color: ${({ theme }) => theme.colors.variants.warning.base};
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
