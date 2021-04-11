import React, { useState, useCallback } from 'react'
import Page from '../../components/Page'
import AppLayout from '../../components/layouts/AppLayout'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import {
  getUploadsListPageData,
  UploadsListPageResponseBody,
} from '../../api/pages/teams/uploads'
import FileListItem from '../../components/atoms/FileListItem'
import styled from '../../lib/styled'
import cc from 'classcat'
import { SerializedTeam } from '../../interfaces/db/team'
import { DialogIconTypes, useDialog } from '../../lib/stores/dialog'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../lib/v2/stores/toast'
import { deleteFile } from '../../api/teams/files'
import { usePage } from '../../lib/stores/pageStore'
import { useSettings } from '../../lib/stores/settings'
import { SerializedFileInfo } from '../../interfaces/db/storage'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import {
  freePlanStorageMb,
  proPlanStorageMb,
  standardPlanStorageMb,
} from '../../lib/subscription'

const UploadListPage = ({
  files,
  team,
  sizeInMb,
}: UploadsListPageResponseBody) => {
  const [currentFiles, setCurrentFiles] = useState(files)
  const [sending, setSending] = useState<boolean>(false)
  const { t } = useTranslation()
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const { subscription, permissions } = usePage()
  const { openSettingsTab } = useSettings()

  const onDeleteHandler = useCallback(
    (team: SerializedTeam, file: SerializedFileInfo) => {
      if (sending) {
        return
      }

      setSending(true)

      messageBox({
        title: `Cancel?`,
        message: `Are you sure to delete this file? It won't be visible in your document anymore.`,
        iconType: DialogIconTypes.Warning,
        buttons: ['Delete', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              //remove
              deleteFile(team, file.name)
                .then(() => {
                  setCurrentFiles((prev) => {
                    return prev.filter((item) => item.name !== file.name)
                  })
                })
                .catch((error: any) => {
                  pushApiErrorMessage(error)
                })
                .finally(() => setSending(false))
              return
            default:
              setSending(false)
              return
          }
        },
      })
    },
    [messageBox, setCurrentFiles, pushApiErrorMessage, sending, t]
  )

  return (
    <Page>
      <LazyDefaultLayout>
        <AppLayout
          rightLayout={{
            header: 'Attachments',
            className: 'reduced-width',
          }}
        >
          {permissions != null && (
            <StorageDescription>
              <span>
                {sizeInMb}MB of{' '}
                {subscription == null
                  ? `${freePlanStorageMb}MB `
                  : subscription.plan === 'standard'
                  ? `${(permissions.length * standardPlanStorageMb) / 1000}GB `
                  : `${(permissions.length * proPlanStorageMb) / 1000}GB `}
                used.{' '}
              </span>
              {(subscription == null || subscription.plan !== 'pro') && (
                <span>
                  If you need more space, please{' '}
                  <a
                    className='upgrade-link'
                    href='#'
                    onClick={(e: any) => {
                      e.preventDefault()
                      openSettingsTab('teamUpgrade')
                    }}
                  >
                    upgrade your plan.
                  </a>
                </span>
              )}
            </StorageDescription>
          )}
          <FileItemList>
            {currentFiles.length > 0 &&
              currentFiles.map((file, i) => (
                <FileListItem
                  file={file}
                  team={team}
                  key={`file-${i}`}
                  className={cc([i % 3 == 2 && 'last', sending && 'disabled'])}
                  onDeleteHandler={onDeleteHandler}
                />
              ))}
          </FileItemList>
        </AppLayout>
      </LazyDefaultLayout>
    </Page>
  )
}

UploadListPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getUploadsListPageData(params)
  return result
}

export default UploadListPage

const StorageDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.space.default}px;

  span {
    color: ${({ theme }) => theme.baseTextColor};
  }
  a {
    color: ${({ theme }) => theme.primaryTextColor};

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
      text-decoration: none;
    }
  }
`

const FileItemList = styled.ul`
  margin: 0;
  padding: 0;
  vertical-align: middle;

  .file-list-item {
    position: relative;
    display: inline-block;
    margin-bottom: ${({ theme }) => theme.space.small}px;
    width: 32%;
    border: 1px solid ${({ theme }) => theme.baseBorderColor};
    border-radius: 5px;
    padding: 10px 15px;
    height: 250px;
    vertical-align: middle;

    &.disabled {
      .delete-icon {
        pointer-events: none;
        opacity: 0.3;
      }
    }

    .wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .delete-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: ${({ theme }) => theme.space.xxsmall}px;
      right: ${({ theme }) => theme.space.xxsmall}px;
      background: ${({ theme }) => theme.subtleBackgroundColor};
      text-align: center;
      border-radius: 5px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      svg {
        color: ${({ theme }) => theme.subtleTextColor};
      }
      &:hover,
      &:focus {
        svg {
          color: ${({ theme }) => theme.baseTextColor};
        }
      }
    }

    :not(.last) {
      margin-right: 1%;
    }

    img {
      width: 100%;
      max-height: 210px;
      display: block;
      margin: auto;
      object-fit: contain;
    }

    .date {
      font-size: ${({ theme }) => theme.fontSizes.small}px;
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }
`
