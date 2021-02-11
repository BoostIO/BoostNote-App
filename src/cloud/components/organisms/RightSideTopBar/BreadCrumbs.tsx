import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  FocusEventHandler,
  MouseEventHandler,
} from 'react'
import { useNav } from '../../../lib/stores/nav'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import FolderLink from '../../atoms/Link/FolderLink'
import WorkspaceLink from '../../atoms/Link/WorkspaceLink'
import styled from '../../../lib/styled'
import TeamLink from '../../atoms/Link/TeamLink'
import ToolbarSlashSeparator from './TopBarSlashSeparator'
import Icon from '../../atoms/Icon'
import {
  mdiFolderAccountOutline,
  mdiDotsHorizontal,
  mdiFolderOutline,
  mdiSubdirectoryArrowRight,
} from '@mdi/js'
import { isChildNode } from '../../../lib/dom'
import Flexbox from '../../atoms/Flexbox'
import { useContextMenuKeydownHandler } from '../../../lib/keyboard'
import { useMediaQuery } from 'react-responsive'

interface BreadCrumbsProps {
  team: SerializedTeam
  minimize?: boolean
  path?: string
  addedNodes?: React.ReactNode
}

type BreadCrumbs = {
  folderLabel: string
  folderPathname: string
}[]

const BreadCrumbs = ({ team, path, addedNodes }: BreadCrumbsProps) => {
  const {
    currentPath: defaultPath,
    currentWorkspaceId,
    workspacesMap,
    foldersMap,
  } = useNav()
  const [
    showingParentFolderListPopup,
    setShowingParentFolderListPopup,
  ] = useState(false)
  const parentFolderListPopupRef = useRef<HTMLDivElement>(null)
  const [contextOffset, setContextOffset] = useState(0)

  useEffect(() => {
    if (parentFolderListPopupRef.current != null) {
      parentFolderListPopupRef.current.focus()
    }
  }, [showingParentFolderListPopup])

  const showParentFolderListPopup: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      setContextOffset(event.currentTarget.offsetLeft)
      setShowingParentFolderListPopup(true)
    },
    []
  )

  const hideParentFolderListPopup: FocusEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (
        parentFolderListPopupRef.current != null &&
        !isChildNode(
          parentFolderListPopupRef.current,
          event.relatedTarget as HTMLElement | null
        )
      ) {
        setShowingParentFolderListPopup(false)
      }
    },
    []
  )

  const currentWorkspace = useMemo(() => {
    if (currentWorkspaceId == null) {
      return undefined
    }
    return workspacesMap.get(currentWorkspaceId)
  }, [currentWorkspaceId, workspacesMap])

  const foldersMapByPathnames = useMemo(() => {
    const folderMap = new Map<string, SerializedFolderWithBookmark>()
    const folders = [...foldersMap.values()]
    folders.forEach((folder) => {
      if (folder.teamId === team.id) folderMap.set(folder.pathname, folder)
    })
    return folderMap
  }, [foldersMap, team])

  const breadCrumbs = useMemo(() => {
    const currentPath = path != null ? path : defaultPath
    if (currentPath === '/') {
      return []
    }

    const folders = currentPath.substring(1).split('/')
    const thread = folders.map((folderName, index) => {
      const folderPathname = `/${folders.slice(0, index + 1).join('/')}`
      return {
        folderLabel: folderName,
        folderPathname,
      }
    })
    return thread as BreadCrumbs
  }, [defaultPath, path])

  const parentBreadCrumbs = new Set(
    breadCrumbs
      .slice(0, breadCrumbs.length - 1)
      .map((breadcrumb) => breadcrumb.folderPathname)
  )
  const directParentBreadCrumb = breadCrumbs[breadCrumbs.length - 1]
  const directParentFolder =
    directParentBreadCrumb != null
      ? foldersMapByPathnames.get(directParentBreadCrumb.folderPathname)
      : null

  useContextMenuKeydownHandler(parentFolderListPopupRef)

  const isTabletOrMobile = useMediaQuery({ maxWidth: 1080 })

  return (
    <StyledBreadCrumbs>
      {showingParentFolderListPopup && (
        <ParentFolderListPopup
          tabIndex={-1}
          ref={parentFolderListPopupRef}
          onBlur={hideParentFolderListPopup}
          style={{ left: contextOffset }}
        >
          <ul>
            {isTabletOrMobile && currentWorkspace != null && (
              <li>
                {currentWorkspace.default ? (
                  <TeamLink
                    team={team}
                    intent='index'
                    className='parentFolderItem'
                    style={{ paddingLeft: '5px' }}
                    id={`workspace-context-link`}
                  >
                    <Icon
                      className='icon'
                      path={mdiFolderAccountOutline}
                      size={18}
                    />
                    {currentWorkspace.name}
                  </TeamLink>
                ) : (
                  <WorkspaceLink
                    intent='index'
                    workspace={currentWorkspace}
                    team={team!}
                    style={{ paddingLeft: '5px' }}
                    className='parentFolderItem'
                    id={`workspace-context-link`}
                  >
                    <Icon
                      className='icon'
                      path={mdiFolderAccountOutline}
                      size={18}
                    />
                    {currentWorkspace.name}
                  </WorkspaceLink>
                )}
              </li>
            )}

            {breadCrumbs.map((elem, index) => {
              const folder = foldersMapByPathnames.get(elem.folderPathname)
              if (
                !isTabletOrMobile &&
                !parentBreadCrumbs.has(elem.folderPathname)
              ) {
                return null
              }

              return (
                <li key={index}>
                  {folder != null ? (
                    <FolderLink
                      folder={folder}
                      team={team!}
                      className='parentFolderItem'
                      id={`folder-${index}`}
                      style={{
                        paddingLeft: `${(index + 1) * 5 + 5}px`,
                      }}
                    >
                      {(index !== 0 || (index === 0 && isTabletOrMobile)) && (
                        <Icon
                          className='icon'
                          path={mdiSubdirectoryArrowRight}
                          size={18}
                        />
                      )}
                      <Icon
                        className='icon'
                        path={mdiFolderOutline}
                        size={18}
                      />
                      {folder.name}
                    </FolderLink>
                  ) : (
                    <span>{elem.folderLabel}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </ParentFolderListPopup>
      )}

      {isTabletOrMobile ? (
        <Flexbox flex='0 0 auto' className='padded'>
          <div className='bread-crumb-link' onClick={showParentFolderListPopup}>
            <Icon className='icon' path={mdiDotsHorizontal} size={18} />
          </div>
          {addedNodes != null && <ToolbarSlashSeparator />}
        </Flexbox>
      ) : (
        <Flexbox flex='0 0 auto' className='padded'>
          {currentWorkspace != null && (
            <>
              {currentWorkspace.default ? (
                <TeamLink
                  team={team}
                  intent='index'
                  className='bread-crumb-link'
                >
                  <Icon
                    className='icon'
                    path={mdiFolderAccountOutline}
                    size={18}
                  />
                  {currentWorkspace.name}
                </TeamLink>
              ) : (
                <WorkspaceLink
                  intent='index'
                  workspace={currentWorkspace}
                  team={team!}
                  className='bread-crumb-link'
                >
                  <span>
                    <Icon
                      className='icon'
                      path={mdiFolderAccountOutline}
                      size={18}
                    />
                    {currentWorkspace.name}
                  </span>
                </WorkspaceLink>
              )}
            </>
          )}
          {breadCrumbs.length > 1 && (
            <>
              <ToolbarSlashSeparator />
              <div
                className='bread-crumb-link'
                onClick={showParentFolderListPopup}
              >
                <span>
                  <Icon className='icon' path={mdiDotsHorizontal} size={18} />
                </span>
              </div>
            </>
          )}
          <ToolbarSlashSeparator />
          {directParentBreadCrumb != null && (
            <>
              {directParentFolder != null ? (
                <FolderLink
                  folder={directParentFolder}
                  team={team!}
                  className='bread-crumb-link'
                >
                  <Icon className='icon' path={mdiFolderOutline} size={18} />
                  {directParentFolder.name}
                </FolderLink>
              ) : (
                <span>{directParentBreadCrumb.folderLabel}</span>
              )}

              {addedNodes != null && <ToolbarSlashSeparator />}
            </>
          )}
        </Flexbox>
      )}
      {addedNodes}
    </StyledBreadCrumbs>
  )
}

const StyledBreadCrumbs = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
  align-items: center;
  color: ${({ theme }) => theme.subtleTextColor};
  overflow-x: hidden;

  .padded {
    padding-left: ${({ theme }) => theme.space.small}px;
  }

  .bread-crumb-link {
    display: flex;
    align-items: center;
    padding: 2px 5px;
    border-radius: 3px;
    white-space: nowrap;
    background-color: transparent;
    color: ${({ theme }) => theme.baseTextColor};
    cursor: pointer;
    text-decoration: none !important;

    .icon {
      margin-right: 4px;
    }
    .hoverIcon {
      margin-left: 4px;
      opacity: 0;
    }

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
      .hoverIcon {
        opacity: 1;
      }
    }
  }
`

const ParentFolderListPopup = styled.div`
  position: absolute;
  z-index: 1000;
  max-height: 300px;
  top: 100%;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  border: 1px solid ${({ theme }) => theme.baseBorderColor};
  border-radius: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  & > ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .parentFolderItem {
    padding-right: 5px;
    background-color: transparent;
    color: ${({ theme }) => theme.subtleTextColor};
    cursor: pointer;
    text-decoration: none !important;
    &:hover,
    &:focus {
      color: ${({ theme }) => theme.emphasizedTextColor};
      & > .hoverIcon {
        opacity: 1;
      }
    }

    display: flex;
    align-items: center;
    & > .icon {
      margin-right: 4px;
    }
    & > .hoverIcon {
      margin-left: 4px;
      opacity: 0;
    }
  }
`

export default BreadCrumbs
