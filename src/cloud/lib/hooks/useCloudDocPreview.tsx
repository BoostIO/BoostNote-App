import { useCallback, useEffect, useRef } from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../router'
import { useNav } from '../stores/nav'
import { modalEventEmitter } from '../utils/events'
import { useCloudResourceModals } from './useCloudResourceModals'

export const docPreviewCloseEvent = 'doc-preview-close'

export function useCloudDocPreview(team: SerializedTeam) {
  const { query } = useRouter()
  const { openDocPreview } = useCloudResourceModals()
  const { docsMap } = useNav()
  const prevPreviewRef = useRef<string>('')

  const openDocInPreview = useCallback(
    (docId: string) => {
      const doc = docsMap.get(docId)
      if (doc == null) {
        return modalEventEmitter.dispatch({ type: docPreviewCloseEvent })
      }
      return openDocPreview(doc, team)
    },
    [openDocPreview, docsMap, team]
  )
  const openDocInPreviewRef = useRef(openDocInPreview)

  useEffect(() => {
    if (
      typeof query.preview !== 'string' ||
      query.preview === prevPreviewRef.current
    ) {
      return
    }
    prevPreviewRef.current = query.preview
    openDocInPreviewRef.current(query.preview)
  }, [query.preview])
}
