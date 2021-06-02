import React, { useMemo, useRef } from 'react'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import DocLimitReachedBanner from '../../molecules/Banner/SubLimitReachedBanner'
import { getDocURL, getTeamURL } from '../../../lib/utils/patterns'
import styled from '../../../lib/styled'
import { useNav } from '../../../lib/stores/nav'
import { SerializedTeam } from '../../../interfaces/db/team'
import { usePage } from '../../../lib/stores/pageStore'
import { usePreferences } from '../../../lib/stores/preferences'
import Application from '../../Application'
import { rightSideTopBarHeight } from '../RightSideTopBar/styled'
import { rightSidePageLayout } from '../../../lib/styled/styleFunctions'
import { SerializedUser } from '../../../interfaces/db/user'
import MarkdownView from '../../atoms/MarkdownView'
import DocContextMenu from '../../organisms/Topbar/Controls/ControlsContextMenu/DocContextMenu'
import { useRouter } from '../../../lib/router'
import { LoadingButton } from '../../../../shared/components/atoms/Button'
import { mdiStar, mdiStarOutline } from '@mdi/js'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { mapTopbarBreadcrumbs } from '../../../lib/mappers/topbarBreadcrumbs'
import { EmbedDoc } from '../../../lib/docEmbedPlugin'

interface ViewPageProps {
  team: SerializedTeam
  doc: SerializedDocWithBookmark
  editable: boolean
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
}

const ViewPage = ({
  doc,
  editable,
  team,
  contributors,
  backLinks,
}: ViewPageProps) => {
  const {} = usePreferences()
  const { foldersMap, workspacesMap, docsMap } = useNav()
  const { push } = useRouter()
  const { currentUserIsCoreMember } = usePage()
  const { sendingMap, toggleDocBookmark } = useCloudApi()
  const {
    openRenameDocForm,
    openRenameFolderForm,
    openWorkspaceEditForm,
    openNewDocForm,
    openNewFolderForm,
    deleteDoc,
    deleteFolder,
    deleteWorkspace,
  } = useCloudResourceModals()
  const initialRenderDone = useRef(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const onRender = useRef(() => {
    if (!initialRenderDone.current && window.location.hash) {
      const ele = document.getElementById(window.location.hash.substr(1))
      if (ele != null) {
        ele.scrollIntoView(true)
      }
      initialRenderDone.current = true
    }
  })

  const embeddableDocs = useMemo(() => {
    const embedMap = new Map<string, EmbedDoc>()
    if (team == null) {
      return embedMap
    }

    for (const doc of docsMap.values()) {
      if (doc.head != null) {
        const current = `${location.protocol}//${location.host}`
        const link = `${current}${getTeamURL(team)}${getDocURL(doc)}`
        embedMap.set(doc.id, {
          title: doc.title,
          content: doc.head.content,
          link,
        })
      }
    }
    return embedMap
  }, [docsMap, team])

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          breadcrumbs: mapTopbarBreadcrumbs(
            team,
            foldersMap,
            workspacesMap,
            push,
            { pageDoc: doc },
            currentUserIsCoreMember ? openRenameFolderForm : undefined,
            currentUserIsCoreMember ? openRenameDocForm : undefined,
            currentUserIsCoreMember ? openNewDocForm : undefined,
            currentUserIsCoreMember ? openNewFolderForm : undefined,
            currentUserIsCoreMember ? openWorkspaceEditForm : undefined,
            currentUserIsCoreMember ? deleteDoc : undefined,
            currentUserIsCoreMember ? deleteFolder : undefined,
            currentUserIsCoreMember ? deleteWorkspace : undefined
          ),
          children: (
            <LoadingButton
              variant='icon'
              disabled={sendingMap.has(doc.id)}
              spinning={sendingMap.has(doc.id)}
              size='sm'
              iconPath={doc.bookmarked ? mdiStar : mdiStarOutline}
              onClick={() =>
                toggleDocBookmark(doc.teamId, doc.id, doc.bookmarked)
              }
            />
          ),
        },
        right: (
          <DocContextMenu
            currentDoc={doc}
            team={team}
            contributors={contributors}
            backLinks={backLinks}
          />
        ),
      }}
    >
      <Container>
        <div className='view__wrapper'>
          <div className='view__content'>
            {!editable && <DocLimitReachedBanner />}
            {doc.head != null ? (
              <>
                <MarkdownView
                  content={doc.head.content}
                  headerLinks={true}
                  onRender={onRender.current}
                  className='scroller'
                  embeddableDocs={embeddableDocs}
                  scrollerRef={previewRef}
                />
              </>
            ) : (
              <>
                <StyledPlaceholderContent>
                  The document is empty
                </StyledPlaceholderContent>
              </>
            )}
          </div>
        </div>
      </Container>
    </Application>
  )
}

const StyledPlaceholderContent = styled.div`
  color: ${({ theme }) => theme.subtleTextColor};
`

const Container = styled.div`
  margin: 0;
  padding: 0;
  padding-top: ${rightSideTopBarHeight}px;
  min-height: calc(100vh - ${rightSideTopBarHeight}px);
  height: auto;
  display: flex;

  .cm-link {
    text-decoration: none;
  }

  .view__wrapper {
    display: flex;
    justify-content: center;
    flex-grow: 1;
    position: relative;
    top: 0;
    bottom: 0px;
    width: 100%;
    height: auto;
    min-height: calc(
      100vh - ${rightSideTopBarHeight}px -
        ${({ theme }) => theme.space.xlarge}px
    );
    font-size: 15px;
    ${rightSidePageLayout}
    margin: auto;
    padding: 0 ${({ theme }) => theme.space.xlarge}px;
  }

  &.view__content {
    height: 100%;
    width: 50%;
    padding-top: ${({ theme }) => theme.space.small}px;
    margin: 0 auto;
    width: 100%;

    & .inline-comment.active,
    .inline-comment.hv-active {
      background-color: rgba(112, 84, 0, 0.8);
    }
  }
`

export default ViewPage
