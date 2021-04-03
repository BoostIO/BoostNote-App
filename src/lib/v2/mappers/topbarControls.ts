import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { ControlButtonProps } from '../types'

// Map<parentId, [breadcrumb children]
export function mapTopbarControls(
  hideMetadata: boolean,
  toggleHideMetadata: () => void
) {
  const controls: ControlButtonProps[] = []
  controls.push({
    icon: hideMetadata ? mdiChevronLeft : mdiChevronRight,
    onClick: toggleHideMetadata,
  })
  return controls
}
