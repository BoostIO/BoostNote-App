import React, { useState, useCallback, useMemo, useRef } from 'react'
import { usePage } from '../../../../../../lib/stores/pageStore'
import { useNav } from '../../../../../../lib/stores/nav'
import {
  mdiTrashCan,
  mdiPlusBoxMultipleOutline,
  mdiHistory,
  mdiArchiveOutline,
  mdiArrowRight,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFileDocumentOutline,
  mdiAccountGroupOutline,
  mdiClockOutline,
  mdiLabelMultipleOutline,
  mdiAccountMultiplePlusOutline,
} from '@mdi/js'
import { useToast } from '../../../../../../lib/stores/toast'
import { zIndexModalsBackground } from '../styled'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../../../../../interfaces/db/doc'
import { getFormattedDateTime } from '../../../../../../lib/date'
import {
  isSingleKeyEvent,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../../../../lib/keyboard'
import { saveDocAsTemplate } from '../../../../../../api/teams/docs/templates'
import { SerializedTeam } from '../../../../../../interfaces/db/team'
import { archiveDoc, unarchiveDoc } from '../../../../../../api/teams/docs'
import { useModal } from '../../../../../../lib/stores/modal'
import RevisionsModal from '../../../../Modal/contents/Doc/RevisionsModal'
import { SerializedRevision } from '../../../../../../interfaces/db/revision'
import { MixpanelActionTrackTypes } from '../../../../../../interfaces/analytics/mixpanel'
import { trackEvent } from '../../../../../../api/track'
import { SerializedUser } from '../../../../../../interfaces/db/user'
import Flexbox from '../../../../../atoms/Flexbox'
import UserIcon from '../../../../../atoms/UserIcon'
import SmallButton from '../../../../../atoms/SmallButton'
import MoveItemModal from '../../../../Modal/contents/Forms/MoveItemModal'
import DocTagsList from '../../../../../molecules/DocTagsList'
import DocLink from '../../../../../atoms/Link/DocLink'
import { getDocTitle } from '../../../../../../lib/utils/patterns'
import { usePreferences } from '../../../../../../lib/stores/preferences'
import {
  focusFirstChildFromElement,
  isChildNode,
  navigateToNextFocusableWithin,
  navigateToPreviousFocusableWithin,
} from '../../../../../../lib/dom'
import cc from 'classcat'
import {
  linkText,
  topbarIconButtonStyle,
} from '../../../../../../lib/styled/styleFunctions'
import Icon from '../../../../../atoms/Icon'
import { UserPresenceInfo } from '../../../../../../interfaces/presence'
import { LayoutMode } from '../../../../../layouts/DocEditLayout'
import PresenceIcons from '../../../PresenceIcons'
import DocShare from '../../../../../molecules/DocShare'
import plur from 'plur'
import styled from '../../../../../../lib/styled'
import IconMdi from '../../../../../atoms/IconMdi'
import DynamicExports from './DynamicExports'
import GuestsModal from '../../../../Modal/contents/Doc/GuestsModal'
import Button from '../../../../../atoms/Button'

interface DocContextMenuProps {
  currentDoc: SerializedDocWithBookmark
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  revisionHistory?: SerializedRevision[]
  team: SerializedTeam
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  presence?: {
    users: UserPresenceInfo[]
    user: UserPresenceInfo
    editorLayout: LayoutMode
  }
  restoreRevision?: (revision: SerializedRevision) => void
}

const DocContextMenu = ({
  team,
  currentDoc,
  contributors,
  backLinks,
  editorRef,
  presence,
  revisionHistory,
  restoreRevision,
}: DocContextMenuProps) => {
  const [sendingTemplate, setSendingTemplate] = useState(false)
  const [sendingArchive, setSendingArchive] = useState(false)
  const [sendingMove, setSendingMove] = useState(false)
  const {
    updateDocsMap,
    deleteDocHandler,
    updateDocHandler,
    updateTemplatesMap,
  } = useNav()
  const {
    guestsMap,
    setPartialPageData,
    subscription,
    permissions = [],
    currentUserPermissions,
  } = usePage()
  const { pushMessage, pushAxiosErrorMessage } = useToast()
  const { openModal } = useModal()
  const [sliceContributors, setSliceContributors] = useState(true)
  const { preferences, setPreferences } = usePreferences()
  const menuRef = useRef<HTMLDivElement>(null)

  const usersMap = useMemo(() => {
    const users = permissions.reduce((acc, val) => {
      acc.set(val.user.id, val.user)
      return acc
    }, new Map<string, SerializedUser>())

    guestsMap.forEach((val) => users.set(val.user.id, val.user))
    return users
  }, [permissions, guestsMap])

  const guestsOnThisDoc = useMemo(() => {
    return [...guestsMap.values()].filter((guest) =>
      (guest.docsIds || []).includes(currentDoc.id)
    )
  }, [currentDoc, guestsMap])

  const contributorsState = useMemo(() => {
    let allContributors = contributors
    let sliced = 0
    if (sliceContributors && contributors.length > 5) {
      allContributors = contributors.slice(0, 5)
      sliced = contributors.length - 5
    }

    return {
      contributors: allContributors,
      sliced,
    }
  }, [contributors, sliceContributors])

  const toggleContextMenu = useCallback(() => {
    const docContextWasHidden = preferences.docContextIsHidden
    setPreferences({
      docContextIsHidden: !docContextWasHidden,
    })

    if (docContextWasHidden && menuRef.current != null) {
      focusFirstChildFromElement(menuRef.current)
    }
  }, [setPreferences, preferences.docContextIsHidden])

  const toggleArchived = useCallback(async () => {
    if (
      sendingTemplate ||
      sendingArchive ||
      sendingMove ||
      currentDoc == null
    ) {
      return
    }
    setSendingArchive(true)
    try {
      const data =
        currentDoc.archivedAt == null
          ? await archiveDoc(currentDoc.teamId, currentDoc.id)
          : await unarchiveDoc(currentDoc.teamId, currentDoc.id)
      updateDocsMap([data.doc.id, data.doc])
      setPartialPageData({ pageDoc: data.doc })
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not archive this doc',
      })
    }
    setSendingArchive(false)
  }, [
    currentDoc,
    setPartialPageData,
    pushMessage,
    updateDocsMap,
    sendingTemplate,
    sendingArchive,
    sendingMove,
  ])

  const toggleTemplate = useCallback(async () => {
    if (
      sendingTemplate ||
      sendingArchive ||
      sendingMove ||
      currentDoc == null
    ) {
      return
    }
    setSendingTemplate(true)
    try {
      const data = await saveDocAsTemplate(currentDoc.teamId, currentDoc.id)
      updateTemplatesMap([data.template.id, data.template])
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not handle the template change',
      })
    }
    setSendingTemplate(false)
  }, [
    currentDoc,
    setSendingTemplate,
    pushMessage,
    sendingTemplate,
    sendingArchive,
    sendingMove,
    updateTemplatesMap,
  ])

  const useContextMenuKeydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (
        menuRef.current != null &&
        isChildNode(menuRef.current, document.activeElement)
      ) {
        if (isSingleKeyEvent(event, 'arrowdown')) {
          if (!menuRef.current.contains(document.activeElement)) {
            focusFirstChildFromElement(menuRef.current as HTMLDivElement)
            return
          }

          navigateToNextFocusableWithin(menuRef.current, true)
          preventKeyboardEventPropagation(event)
          return
        }

        if (isSingleKeyEvent(event, 'arrowup')) {
          if (!menuRef.current.contains(document.activeElement)) {
            return
          }
          navigateToPreviousFocusableWithin(menuRef.current, true)
          preventKeyboardEventPropagation(event)
          return
        }
      }
    }
  }, [menuRef])
  useGlobalKeyDownHandler(useContextMenuKeydownHandler)

  const revisionNavigateCallback = useCallback(() => {
    openModal(
      <RevisionsModal
        currentDoc={currentDoc}
        restoreRevision={restoreRevision}
      />,
      {
        classNames: 'largeW fixed-height-large',
      }
    )
    trackEvent(MixpanelActionTrackTypes.RevisionHistoryOpen, {
      docId: currentDoc.id,
    })
  }, [currentDoc, openModal, restoreRevision])

  const moveDoc = useCallback(
    async (
      doc: SerializedDocWithBookmark,
      workspaceId: string,
      parentFolderId?: string
    ) => {
      if (sendingTemplate || sendingArchive || sendingMove) {
        return
      }
      setSendingMove(true)
      try {
        await updateDocHandler(doc, { workspaceId, parentFolderId })
      } catch (error) {
        pushAxiosErrorMessage(error)
      }
      setSendingMove(false)
    },
    [
      updateDocHandler,
      pushAxiosErrorMessage,
      sendingTemplate,
      sendingArchive,
      sendingMove,
    ]
  )

  const openMoveForm = useCallback(
    (doc: SerializedDocWithBookmark) => {
      openModal(
        <MoveItemModal
          onSubmit={(workspaceId, parentFolderId) =>
            moveDoc(doc, workspaceId, parentFolderId)
          }
        />
      )
    },
    [openModal, moveDoc]
  )

  const updating = sendingTemplate || sendingArchive || sendingMove

  return (
    <Container className={cc([!preferences.docContextIsHidden && 'active'])}>
      <div className='placeholder' />
      <div ref={menuRef} className='context__menu'>
        <div className='context__container'>
          <button className='context__toggle' onClick={toggleContextMenu}>
            <Icon
              path={
                preferences.docContextIsHidden
                  ? mdiChevronLeft
                  : mdiChevronRight
              }
              size={24}
            />
          </button>
          <div className='context__scroll__container'>
            <div className='context__scroll'>
              {presence != null && (
                <div className='context__row'>
                  <label className='context__label'>
                    <IconMdi
                      path={mdiAccountGroupOutline}
                      size={18}
                      className='context__icon'
                    />{' '}
                    Participating
                  </label>
                  <div className='context__content'>
                    <PresenceIcons
                      user={presence.user}
                      users={presence.users}
                      withTooltip={presence.editorLayout !== 'preview'}
                    />
                  </div>
                </div>
              )}
              <div className='context__row'>
                <label className='context__label'>
                  <IconMdi
                    path={mdiClockOutline}
                    size={18}
                    className='context__icon'
                  />{' '}
                  Last updated
                </label>
                <div className='context__content'>
                  {currentDoc.head == null ? (
                    <span>
                      {getFormattedDateTime(currentDoc.updatedAt, 'at')}
                    </span>
                  ) : (
                    <Flexbox wrap='wrap'>
                      {(currentDoc.head.creators || []).length > 0 ? (
                        <>
                          {(currentDoc.head.creators || []).map((user) => (
                            <UserIcon
                              key={user.id}
                              user={usersMap.get(user.id) || user}
                              className='subtle'
                            />
                          ))}
                          <span style={{ paddingLeft: 10, paddingRight: 5 }}>
                            at
                          </span>
                        </>
                      ) : (
                        ''
                      )}
                      {getFormattedDateTime(currentDoc.head.created)}
                    </Flexbox>
                  )}
                </div>
              </div>
              <div className='context__break' />
              {currentUserPermissions != null && (
                <>
                  <div className='context__row'>
                    <label className='context__label'>
                      <IconMdi
                        path={mdiLabelMultipleOutline}
                        size={18}
                        className='context__icon'
                      />{' '}
                      Labels
                    </label>
                    <div className='context__content'>
                      <DocTagsList team={team} doc={currentDoc} />
                    </div>
                  </div>
                  <div className='context__break' />
                  <DocShare currentDoc={currentDoc} />
                  <div className='context__row'>
                    {guestsOnThisDoc.length === 0 ? (
                      <label className='context__label'>
                        <Icon
                          path={mdiAccountMultiplePlusOutline}
                          className='context__icon'
                          size={18}
                        />
                        Guests
                        <div className='context__tooltip'>
                          <div className='context__tooltip__text'>
                            Guests are outsiders who you want to work with on
                            specific documents. They can be invited to
                            individual documents but not entire workspaces.
                          </div>
                          ?
                        </div>
                      </label>
                    ) : (
                      <label className='context__label'>
                        <Icon
                          path={mdiAccountMultiplePlusOutline}
                          className='context__icon'
                          size={18}
                        />
                        {guestsOnThisDoc.length}{' '}
                        {plur('Guest', guestsOnThisDoc.length)}
                      </label>
                    )}
                    {subscription == null ? (
                      <button
                        className='context__badge'
                        onClick={() =>
                          openModal(
                            <GuestsModal
                              teamId={team.id}
                              docId={currentDoc.id}
                            />,
                            {
                              classNames: 'largeW fixed-height-large',
                            }
                          )
                        }
                      >
                        Upgrade
                      </button>
                    ) : (
                      <Button
                        size='sm'
                        onClick={() =>
                          openModal(
                            <GuestsModal
                              teamId={team.id}
                              docId={currentDoc.id}
                            />,
                            {
                              classNames: 'largeW fixed-height-large',
                            }
                          )
                        }
                        variant='transparent'
                      >
                        {guestsOnThisDoc.length > 0 ? 'Manage' : 'Invite'}
                      </Button>
                    )}
                  </div>
                  <div className='context__break' />
                  {backLinks.length > 0 && (
                    <>
                      <div className='context__column'>
                        <label className='context__label'>
                          {backLinks.length}{' '}
                          {plur('Backlink', backLinks.length)}
                        </label>
                        <ul className='context__list'>
                          {backLinks.map((doc) => (
                            <li key={doc.id}>
                              <DocLink
                                doc={doc}
                                team={team}
                                className='context__backlink'
                                id={`context__backlink__${doc.id}`}
                              >
                                <Icon
                                  path={mdiFileDocumentOutline}
                                  size={18}
                                  className='context__icon'
                                />
                                {getDocTitle(doc)}
                              </DocLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className='context__break' />
                    </>
                  )}
                  <button
                    className='context__row context__button'
                    id='dc-context-top-move'
                    onClick={() => openMoveForm(currentDoc)}
                    disabled={updating}
                  >
                    <Icon
                      path={mdiArrowRight}
                      size={18}
                      className='context__icon'
                    />
                    <span>{sendingMove ? '...' : 'Move'}</span>
                  </button>
                  <button
                    className='context__row context__button'
                    id='dc-context-top-template'
                    onClick={toggleTemplate}
                    disabled={sendingTemplate || sendingArchive}
                  >
                    <Icon
                      path={mdiPlusBoxMultipleOutline}
                      size={18}
                      className='context__icon'
                    />
                    <span>{sendingMove ? '...' : 'Save as a template'}</span>
                  </button>
                  <button
                    className='context__row context__button'
                    id='dc-context-top-archive'
                    onClick={toggleArchived}
                    disabled={
                      sendingTemplate || sendingTemplate || sendingArchive
                    }
                  >
                    <Icon
                      path={mdiArchiveOutline}
                      size={18}
                      className='context__icon'
                    />
                    <span>
                      {currentDoc.archivedAt != null ? 'Unarchive' : 'Archive'}
                    </span>
                  </button>
                  {currentDoc.archivedAt != null && (
                    <button
                      className='context__row context__button'
                      onClick={() => deleteDocHandler(currentDoc)}
                      id='dc-context-top-delete'
                    >
                      <Icon
                        path={mdiTrashCan}
                        size={18}
                        className='context__icon'
                      />
                      <span>{'Delete permanently'}</span>
                    </button>
                  )}
                  <div className='context__break' />
                </>
              )}
              <div className='context__row'>
                <label className='context__label'>
                  {contributorsState.contributors.length}{' '}
                  {plur('Contributor', contributorsState.contributors.length)}
                </label>
              </div>
              <div
                className='context__row'
                style={{ paddingTop: 0, paddingBottom: 8 }}
              >
                <div className='context__content'>
                  <Flexbox wrap='wrap'>
                    {contributorsState.contributors.map((contributor) => (
                      <UserIcon
                        key={contributor.id}
                        user={usersMap.get(contributor.id) || contributor}
                        className='subtle'
                      />
                    ))}
                    {contributors.length > 5 && (
                      <SmallButton
                        variant='transparent'
                        onClick={() => setSliceContributors((prev) => !prev)}
                      >
                        {contributorsState.sliced > 0
                          ? `+${contributorsState.sliced}`
                          : '-'}
                      </SmallButton>
                    )}
                  </Flexbox>
                </div>
              </div>
              <div className='context__break' />
              {revisionHistory != null && (
                <>
                  <div className='context__row'>
                    <label className='context__label'>Revisions</label>
                  </div>
                  <div className='context__row'>
                    <div className='context__content'>
                      {revisionHistory.length > 0 && (
                        <ul className='context__list'>
                          {revisionHistory.map((rev) => {
                            const creators = rev.creators || []
                            return (
                              <li className='context__revision' key={rev.id}>
                                {creators.length > 0 ? (
                                  <>
                                    {creators.map((user) => (
                                      <UserIcon
                                        key={user.id}
                                        user={usersMap.get(user.id) || user}
                                        className='context__revision__user subtle'
                                      />
                                    ))}
                                    <span className='context__revision__names'>
                                      {' '}
                                      {creators
                                        .map((user) => user.displayName)
                                        .join(',')}{' '}
                                      updated doc
                                    </span>
                                  </>
                                ) : (
                                  'Doc has been updated'
                                )}
                                <span className='context__revision__date'>
                                  {getFormattedDateTime(rev.created)}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className='context__row'>
                    <button
                      className='context__flexible__button'
                      onClick={revisionNavigateCallback}
                      id='dc-context-top-revisions'
                    >
                      <Icon
                        path={mdiHistory}
                        className='context__icon'
                        size={18}
                      />
                      See full revisions
                      {subscription == null &&
                        currentUserPermissions != null && (
                          <div className='context__badge'>Upgrade</div>
                        )}
                    </button>
                  </div>
                  <div className='context__break' />
                </>
              )}
              <DynamicExports
                openModal={openModal}
                currentDoc={currentDoc}
                editorRef={editorRef}
                team={team}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const docContextWidth = 350

const Container = styled.div`
  .placeholder {
    width: 45px;
    flex: 0 0 auto;
  }

  .context__tooltip {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.subtleBackgroundColor};
    color: ${({ theme }) => theme.baseTextColor};
    width: 20px;
    height: 20px;
    margin-left: ${({ theme }) => theme.space.xxsmall}px;

    .context__tooltip__text {
      display: none;
      border-radius: 3px;
      position: absolute;
      bottom: 100%;
      background: ${({ theme }) => theme.baseBackgroundColor};
      width: ${docContextWidth - 40}px;
      padding: ${({ theme }) => theme.space.xsmall}px;
      left: 50%;
      transform: translateX(-50%);
      line-height: ${({ theme }) => theme.fontSizes.medium}px;
    }

    &:hover {
      .context__tooltip__text {
        display: block;
      }
    }
  }

  .context__menu {
    z-index: ${zIndexModalsBackground + 1};
    position: absolute;
    top: 0;
    margin: auto;
    width: ${docContextWidth}px;
    right: -${docContextWidth}px;
    max-width: 94%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    border-left: 1px solid ${({ theme }) => theme.subtleBorderColor};
    border-radius: 0px;
    background-color: ${({ theme }) => theme.contextMenuColor};
    color: ${({ theme }) => theme.baseTextColor};
  }

  .context__container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .context__scroll__container {
    height: 100%;
    overflow: auto;
    padding: ${({ theme }) => theme.space.xsmall}px 0;
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      width: 6px;
    }
  }

  .context__scroll {
    flex: 1 1 auto;
    width: 100%;
    overflow: hidden auto;
  }

  .context__row,
  .context__column {
    position: relative;
    display: flex;
    align-items: flex-start;
    line-height: 30px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    padding: 0px ${({ theme }) => theme.space.small}px;
    height: fit-content;
  }

  .context__column {
    flex-direction: column;
  }

  .context__column + .context__break,
  .context__row + .context__break {
    margin-top: ${({ theme }) => theme.space.xxsmall}px;
    margin-bottom: ${({ theme }) => theme.space.xxsmall}px;
  }

  .context__row + .context__row,
  .context__break + .context__row,
  .context__column + .context__column,
  .context__break + .context__column {
    padding-top: ${({ theme }) => theme.space.xxsmall}px;
    padding-bottom: ${({ theme }) => theme.space.xxsmall}px;
  }

  .context__label {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.baseTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    width: 120px;
    flex: 0 0 auto;
    margin-bottom: 0;
    margin-right: ${({ theme }) => theme.space.small}px;
    cursor: inherit;
  }

  .context__content {
    line-height: inherit;
    min-height: 30px;

    &.single__line {
      display: flex;
      align-items: center;
    }
  }

  .context__break {
    display: block;
    height: 1px;
    margin: 0px ${({ theme }) => theme.space.small}px;
    background-color: ${({ theme }) => theme.subtleBorderColor};
  }

  .context__toggle {
    ${topbarIconButtonStyle}
    position: absolute;
    top: 6px;
    left: -41px;
    z-index: ${zIndexModalsBackground + 2};
  }

  .context__button {
    width: 100%;
    text-align: left;
  }

  .context__flexible__button {
    flex-wrap: wrap;
    border-radius: 3px;
    max-width: 96%;
    width: auto;
    margin: 0 auto;
    padding: 2px 5px;
  }

  .context__button,
  .context__flexible__button {
    display: flex;
    align-items: center;
    background: none;
    outline: none;
    color: ${({ theme }) => theme.baseTextColor};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
      color: ${({ theme }) => theme.emphasizedTextColor};
    }

    &:disabled {
      color: ${({ theme }) => theme.subtleTextColor};

      &:hover,
      &:focus {
        color: ${({ theme }) => theme.subtleTextColor} !important;
        background-color: transparent;
        cursor: not-allowed;
      }
    }
  }

  .context__badge {
    background: ${({ theme }) => theme.primaryBackgroundColor};
    text-transform: uppercase;
    color: ${({ theme }) => theme.whiteTextColor};
    padding: 0 5px;
    border-radius: 3px;
    font-size: ${({ theme }) => theme.fontSizes.xxsmall}px;
    margin-left: ${({ theme }) => theme.space.xsmall}px;
    height: auto;
    line-height: 26px;
    height: 26px;
  }

  .context__label + .context__badge {
    margin-left: 0;
  }

  .context__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .context__icon {
    margin-right: ${({ theme }) => theme.space.xsmall}px;
    flex: 0 0 auto;
  }

  context__backlink + context__backlink {
    margin-top: ${({ theme }) => theme.space.xsmall}px;
  }

  .context__backlink {
    ${linkText};
    display: flex;
    align-items: end;
    line-height: 18px;
  }

  .context__list + .context__flexible__button {
    margin-top: ${({ theme }) => theme.space.default}px;
  }

  .context__revision + .context__revision {
    margin-top: ${({ theme }) => theme.space.default}px;

    &::before {
      height: 15px;
      width: 1px;
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
      content: '';
      position: absolute;
      left: 11px;
      top: -19px;
    }
  }

  .context__revision {
    display: flex;
    flex-wrap: wrap;
    line-height: 18px;
    align-items: baseline;
    position: relative;
  }

  .context__revision__user {
    display: inline-block;
  }

  .context__revision__user + .context__revision__names {
    padding-left: ${({ theme }) => theme.space.xsmall}px;
  }

  .context__revision__date {
    display: block;
    width: 100%;
    padding-top: ${({ theme }) => theme.space.xxsmall}px;
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
  }

  &.active {
    .context__menu {
      right: 0px;
    }

    .context__toggle {
      left: -41px;
    }

    .placeholder {
      width: ${docContextWidth + 45}px;
    }
  }
`

export default DocContextMenu
