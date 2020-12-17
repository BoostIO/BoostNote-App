import React, { useMemo } from 'react'
import SideNavigatorItem from '../atoms/NavigatorItem'
import { NoteStorage } from '../../lib/db/types'
import { isTagNameValid } from '../../lib/db/utils'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getTagListItemId } from '../../lib/nav'
import { useRouter } from '../../lib/router'
import { usePathnameWithoutNoteId } from '../../lib/routeParams'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useDb } from '../../lib/db'
import { useTranslation } from 'react-i18next'
import { mdiPound, mdiTagMultiple } from '@mdi/js'
import { openContextMenu } from '../../lib/electronOnly'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'

interface TagListFragmentProps {
  storage: NoteStorage
}

const TagListFragment = ({ storage }: TagListFragmentProps) => {
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()
  const { id: storageId, tagMap } = storage
  const { push } = useRouter()
  const { prompt, messageBox } = useDialog()
  const { removeTag, renameTag } = useDb()
  const { t } = useTranslation()
  const currentPathname = usePathnameWithoutNoteId()
  const { report } = useAnalytics()

  const tagListNavItemId = getTagListItemId(storage.id)
  const tagListIsFolded = !sideNavOpenedItemSet.has(tagListNavItemId)

  const tagList = useMemo(() => {
    return Object.keys(tagMap).map((tagName) => {
      const tagPathname = `/app/storages/${storageId}/tags/${tagName}`
      const tagIsActive = currentPathname === tagPathname
      return (
        <SideNavigatorItem
          key={`storage:${storageId}/tags:${tagName}`}
          depth={1}
          iconPath={mdiPound}
          label={tagName}
          onClick={() => {
            push(tagPathname)
          }}
          active={tagIsActive}
          onContextMenu={(event) => {
            event.preventDefault()
            openContextMenu({
              menuItems: [
                {
                  type: 'normal',
                  label: t('tag.remove'),
                  click: () => {
                    messageBox({
                      title: `Remove "${tagName}" tag`,
                      message: t('tag.removeMessage'),
                      iconType: DialogIconTypes.Warning,
                      buttons: [t('tag.remove'), t('general.cancel')],
                      defaultButtonIndex: 0,
                      cancelButtonIndex: 1,
                      onClose: (value: number | null) => {
                        if (value === 0) {
                          removeTag(storageId, tagName)
                          report(analyticsEvents.removeTag)
                        }
                      },
                    })
                  },
                },
                {
                  type: 'normal',
                  label: t('tag.rename'),
                  click: () => {
                    prompt({
                      title: `tag.rename`,
                      message: t('tag.renameMessage', { tagName }),
                      iconType: DialogIconTypes.Question,
                      defaultValue: tagName,
                      submitButtonLabel: t('tag.rename'),
                      onClose: (value: string | null) => {
                        if (value == null || !isTagNameValid(value) || value == tagName) return
                        renameTag(storageId, tagName, value);
                        report(analyticsEvents.renameTag)
                        // TODO: Test rename on cloud storage
                        // TODO: Mobile component.
                        // TODO: Look at where else delete is present.
                        // TODO: Add tests, manual test both pouch and fsnote.
                      },
                    })
                  },
                },
              ],
            })
          }}
        />
      )
    })
  }, [
    storageId,
    tagMap,
    push,
    currentPathname,
    messageBox,
    removeTag,
    t,
    report,
    prompt,
    isTagNameValid,
    renameTag,
  ])

  if (tagList.length === 0) {
    return null
  }

  return (
    <>
      <SideNavigatorItem
        depth={0}
        iconPath={mdiTagMultiple}
        label={t('tag.tags')}
        folded={tagList.length > 0 ? tagListIsFolded : undefined}
        onFoldButtonClick={() => {
          toggleSideNavOpenedItem(tagListNavItemId)
        }}
        onClick={() => {
          toggleSideNavOpenedItem(tagListNavItemId)
        }}
        onContextMenu={(event) => {
          event.preventDefault()
        }}
      />
      {!tagListIsFolded && tagList}
    </>
  )
}

export default TagListFragment
