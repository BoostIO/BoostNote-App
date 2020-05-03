import React, { useMemo, useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../../lib/db/utils'
import styled from '../../../lib/styled'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../../lib/contextMenu'
import { usePreferences } from '../../../lib/preferences'
import { useGeneralStatus } from '../../lib/generalStatus'
import { useTranslation } from 'react-i18next'
import Icon from '../../../components/atoms/Icon'
import { mdiClose, mdiPlus, mdiTuneVertical } from '@mdi/js'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import { borderBottom } from '../../../lib/styled/styleFunctions'

const StyledSideNavContainer = styled.nav`
  display: flex;
  background-color: ${({ theme }) => theme.navBackgroundColor};
  flex-direction: column;
  height: 100%;
  .topControl {
    height: 44px;
    display: flex;
    -webkit-app-region: drag;
    ${borderBottom}
    .spacer {
      flex: 1;
    }
    .button {
      width: 44px;
      height: 44px;
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-size: 24px;

      transition: color 200ms ease-in-out;
      color: ${({ theme }) => theme.navButtonColor};
      &:hover {
        color: ${({ theme }) => theme.navButtonHoverColor};
      }

      &:active,
      .active {
        color: ${({ theme }) => theme.navButtonActiveColor};
      }
    }
  }

  .storageList {
    list-style: none;
    margin: 0;
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  .empty {
    padding: 4px;
    padding-left: 26px;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.navLabelColor};
    user-select: none;
  }

  .bottomControl {
    height: 35px;
    display: flex;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    button {
      height: 35px;
      border: none;
      background-color: transparent;
      display: flex;
      align-items: center;
    }
    .addFolderButton {
      flex: 1;
      border-right: 1px solid ${({ theme }) => theme.colors.border};
    }
    .addFolderButtonIcon {
      margin-right: 4px;
    }
    .moreButton {
      width: 30px;
      display: flex;
      justify-content: center;
    }
  }
`

const Spacer = styled.div`
  flex: 1;
`

interface NavigatorProps {
  toggle: () => void
}

export default ({ toggle }: NavigatorProps) => {
  const { createStorage, storageMap } = useDb()
  const { popup } = useContextMenu()
  const { prompt } = useDialog()
  const { push } = useRouter()

  const storageEntries = useMemo(() => {
    return entries(storageMap)
  }, [storageMap])

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'New Storage',
          onClick: async () => {
            prompt({
              title: 'Create a Storage',
              message: 'Enter name of a storage to create',
              iconType: DialogIconTypes.Question,
              submitButtonLabel: 'Create Storage',
              onClose: async (value: string | null) => {
                if (value == null) return
                const storage = await createStorage(value)
                push(`/m/storages/${storage.id}/notes`)
              },
            })
          },
        },
      ])
    },
    [popup, prompt, createStorage, push]
  )

  const { toggleClosed } = usePreferences()
  const { toggleNav } = useGeneralStatus()

  const { t } = useTranslation()

  return (
    <StyledSideNavContainer>
      <div className='topControl'>
        <button className='button' onClick={toggle}>
          <Icon path={mdiClose} />
        </button>
        <div className='spacer' />
        <button
          className='button'
          onClick={() => {
            push('/m/storages')
            toggleNav()
          }}
        >
          <Icon path={mdiPlus} />
        </button>
        <button className='button' onClick={toggleClosed}>
          <Icon path={mdiTuneVertical} />
        </button>
      </div>

      <div className='storageList'>
        {storageEntries.map(([, storage]) => (
          <StorageNavigatorFragment key={storage.id} storage={storage} />
        ))}
        {storageEntries.length === 0 && (
          <div className='empty'>{t('storage.noStorage')}</div>
        )}

        <Spacer onContextMenu={openSideNavContextMenu} />
      </div>
    </StyledSideNavContainer>
  )
}
