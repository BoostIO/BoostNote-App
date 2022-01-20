import { useCallback, useEffect, useRef } from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../router'
import { useNav } from '../stores/nav'
import { ModalEventDetails, modalEventEmitter } from '../utils/events'
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

  const resetPreviewId = useCallback(
    (event: CustomEvent<ModalEventDetails>) => {
      if (event.detail.type !== docPreviewCloseEvent) {
        return
      }

      prevPreviewRef.current = ''
    },
    []
  )

  useEffect(() => {
    modalEventEmitter.listen(resetPreviewId)
    return () => {
      modalEventEmitter.unlisten(resetPreviewId)
    }
  }, [resetPreviewId])

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
