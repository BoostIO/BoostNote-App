import {
  mdiCodeTags,
  mdiFileDocumentOutline,
  mdiGithub,
  mdiPackageVariantClosed,
  mdiTable,
} from '@mdi/js'
import React, { useMemo } from 'react'
import Icon, { IconSize } from '../../../design/components/atoms/Icon'
import { Block } from '../../api/blocks'

interface BlockIconProps {
  block: Block
  size: IconSize
}

const BlockIcon = ({ block, size }: BlockIconProps) => {
  const path = useMemo(() => {
    if (block.type.startsWith('github')) {
      return mdiGithub
    }
    switch (block.type) {
      case 'embed':
        return mdiCodeTags
      case 'table':
        return mdiTable
      case 'markdown':
        return mdiFileDocumentOutline
      default:
        return mdiPackageVariantClosed
    }
  }, [block.type])
  return <Icon path={path} size={size} />
}

export default BlockIcon
