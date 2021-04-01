import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { ControlButtonProps } from '../types'

export function mapTopbar(
  hideMetadata: boolean,
  toggleHideMetadata: () => void
) {
  const controls: ControlButtonProps[] = []
  controls.push({
    icon: hideMetadata ? mdiChevronLeft : mdiChevronRight,
    onClick: toggleHideMetadata,
  })
  return {
    controls,
  }
}
