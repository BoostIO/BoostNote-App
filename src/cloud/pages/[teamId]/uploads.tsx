import React, { useState, useCallback } from 'react'
import Page from '../../components/Page'
import Application from '../../components/Application'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import {
  getUploadsListPageData,
  UploadsListPageResponseBody,
} from '../../api/pages/teams/uploads'
import FileListItem from '../../components/atoms/FileListItem'
import styled from '../../lib/styled'
import cc from 'classcat'
import { SerializedTeam } from '../../interfaces/db/team'
import { DialogIconTypes, useDialog } from '../../../shared/lib/stores/dialog'
import { useToast } from '../../../shared/lib/stores/toast'
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
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'

const UploadListPage = ({
  files,
  team,
  sizeInMb,
}: UploadsListPageResponseBody) => {
  const [currentFiles, setCurrentFiles] = useState(files)
  const [sending, setSending] = useState<boolean>(false)
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const { subscription, permissions, currentUserIsCoreMember } = usePage()
  const { openSettingsTab } = useSettings()
  const { translate } = useI18n()

  const onDeleteHandler = useCallback(
    (team: SerializedTeam, file: SerializedFileInfo) => {
      if (sending) {
        return
      }

      setSending(true)

      messageBox({
        title: translate(lngKeys.GeneralDelete),
        message: translate(lngKeys.AttachmentsDeleteDisclaimer),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: translate(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: translate(lngKeys.GeneralDelete),
            onClick: async () => {
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
            },
          },
        ],
      })
    },
    [messageBox, setCurrentFiles, pushApiErrorMessage, sending, translate]
  )

  return (
    <Page>
      <LazyDefaultLayout>
        <Application
          content={{
            header: 'Attachments',
            reduced: true,
          }}
        >
          {permissions != null && (
            <StorageDescription>
              <span>
                {translate(lngKeys.AttachmentsLimitDisclaimer, {
                  current: `${sizeInMb}MB`,
                  limit:
                    subscription == null
                      ? `${freePlanStorageMb}MB `
                      : subscription.plan === 'standard'
                      ? `${
                          (permissions.length * standardPlanStorageMb) / 1000
                        }GB `
                      : `${(permissions.length * proPlanStorageMb) / 1000}GB `,
                })}
              </span>
              {(subscription == null || subscription.plan !== 'pro') && (
                <span>
                  {translate(lngKeys.AttachmentsPlanUpgradeDisclaimer)}{' '}
                  <a
                    className='upgrade-link'
                    href='#'
                    onClick={(e: any) => {
                      e.preventDefault()
                      openSettingsTab('teamUpgrade')
                    }}
                  >
                    {translate(lngKeys.AttachmentsUpgradeLink)}
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
                  onDeleteHandler={
                    currentUserIsCoreMember ? onDeleteHandler : undefined
                  }
                />
              ))}
          </FileItemList>
        </Application>
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
