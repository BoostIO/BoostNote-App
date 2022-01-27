import React, { useEffect, useMemo } from 'react'
import Page from '../../../components/Page'
import {
  getResourceShowPageData,
  ResourceShowPageResponseBody,
} from '../../../api/pages/teams'
import DocPage from '../../../components/DocPage'
import FolderPage from '../../../components/FolderPage'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { parse as parseQuery } from 'querystring'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { useRouter } from '../../../lib/router'
import {
  ResourceDeleteEventDetails,
  resourceDeleteEventEmitter,
} from '../../../lib/utils/events'

const ResourceIndex = () => {
  const { pageData } = usePage()
  const props = pageData as ResourceShowPageResponseBody
  const { foldersMap } = useNav()
  const { push } = useRouter()

  useEffect(() => {
    const handler = (event: CustomEvent<ResourceDeleteEventDetails>) => {
      const deletedResourceType = event.detail.resourceType
      const deletedResourceId = event.detail.resourceId

      if (props.type === 'doc') {
        if (
          deletedResourceType === 'workspace' &&
          deletedResourceId === props.pageDoc.workspaceId
        ) {
          push(event.detail.parentURL)
          return
        }

        if (deletedResourceType === 'folder') {
          let parentFolderId = props.pageDoc.parentFolderId
          while (parentFolderId != null) {
            const parentFolder = foldersMap.get(parentFolderId)
            if (parentFolder == null) {
              break
            }
            if (deletedResourceId === parentFolderId) {
              push(event.detail.parentURL)
              return
            }
            parentFolderId = parentFolder.parentFolderId
          }
        }

        if (
          deletedResourceType === 'doc' &&
          deletedResourceId === props.pageDoc.id
        ) {
          push(event.detail.parentURL)
          return
        }
      } else if (props.type === 'folder') {
        if (
          deletedResourceType === 'workspace' &&
          deletedResourceId === props.pageFolder.workspaceId
        ) {
          push(event.detail.parentURL)
          return
        }

        if (deletedResourceType === 'folder') {
          let parentFolderId = props.pageFolder.parentFolderId
          while (parentFolderId != null) {
            const parentFolder = foldersMap.get(parentFolderId)
            if (parentFolder == null) {
              break
            }
            if (deletedResourceId === parentFolderId) {
              push(event.detail.parentURL)
              return
            }
            parentFolderId = parentFolder.parentFolderId
          }
        }
      }
    }
    resourceDeleteEventEmitter.listen(handler)
    return () => {
      resourceDeleteEventEmitter.unlisten(handler)
    }
  }, [push, props, foldersMap])

  const content = useMemo(() => {
    let innerPage

    switch (props.type) {
      case 'doc':
        innerPage = (
          <DocPage
            doc={props.pageDoc}
            contributors={props.contributors || []}
            backLinks={props.backLinks || []}
            revisionHistory={props.revisionHistory || []}
            thread={props.thread}
          />
        )
        break

      case 'folder':
        innerPage = <FolderPage />
        break
    }

    return <Page>{innerPage}</Page>
  }, [props])

  return content
}

ResourceIndex.getInitialProps = async (
  params: GetInitialPropsParameters & { forceReload?: boolean }
) => {
  const result = await getResourceShowPageData(params)
  const query = parseQuery(params.search.slice(1))
  return { ...result, thread: query.thread }
}

export default ResourceIndex
