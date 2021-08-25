import React, { useCallback, useEffect, useState } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { SerializedFileInfo } from '../../interfaces/db/storage'
import { DialogIconTypes, useDialog } from '../../../design/lib/stores/dialog'
import { useToast } from '../../../design/lib/stores/toast'
import { useSettings } from '../../lib/stores/settings'
import { getUploadsData } from '../../api/uploads'
import { SerializedTeam } from '../../interfaces/db/team'
import { deleteFile } from '../../api/teams/files'
import cc from 'classcat'
import {
  freePlanStorageMb,
  proPlanStorageMb,
  standardPlanStorageMb,
} from '../../lib/subscription'
import FileListItem from '../FileListItem'
import Spinner from '../../../design/components/atoms/Spinner'
import styled from '../../../design/lib/styled'
import Link from '../../../design/components/atoms/Link'

const AttachmentsTab = () => {
  const [teamId, setTeamId] = useState<string>()
  const {
    team,
    subscription,
    permissions = [],
    currentUserIsCoreMember,
  } = usePage()
  const { translate } = useI18n()
  const [occupiedSpace, setOccupiedSpace] = useState<number>(0)
  const [currentFiles, setCurrentFiles] = useState<SerializedFileInfo[]>([])
  const [apiError, setApiError] = useState<unknown>()
  const [initialized, setInitialized] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const { openSettingsTab } = useSettings()

  useEffect(() => {
    if (team == null) {
      setTeamId(undefined)
    } else {
      setTeamId(team.id)
    }
  }, [team])

  useEffect(() => {
    if (teamId == null) {
      return
    }

    const getFiles = async () => {
      try {
        const { files, sizeInMb } = await getUploadsData(teamId)
        setCurrentFiles(files)
        setOccupiedSpace(sizeInMb)
        setInitialized(true)
      } catch (error) {
        setApiError(error)
      }
    }
    getFiles()
  }, [teamId])

  useEffect(() => {
    if (apiError != null) {
      pushApiErrorMessage(apiError)
    }
  }, [apiError, pushApiErrorMessage])

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
    <SettingTabContent
      title={translate(lngKeys.GeneralAttachments)}
      body={
        team == null ? (
          'Please select a team.'
        ) : !initialized ? (
          <Spinner />
        ) : (
          <Container>
            <p className='uploads__description'>
              <span>
                {translate(lngKeys.AttachmentsLimitDisclaimer, {
                  current: `${occupiedSpace}MB`,
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
                  <Link
                    className='upgrade-link'
                    href='#'
                    onClick={(e: any) => {
                      e.preventDefault()
                      openSettingsTab('teamUpgrade')
                    }}
                  >
                    {translate(lngKeys.AttachmentsUpgradeLink)}
                  </Link>
                </span>
              )}
            </p>
            <ul className='uploads__list'>
              {currentFiles.length > 0 &&
                currentFiles.map((file, i) => (
                  <FileListItem
                    file={file}
                    team={team}
                    key={`file-${i}`}
                    className={cc([
                      'uploads__list__item',
                      i % 3 == 2 && 'last',
                      sending && 'disabled',
                    ])}
                    onDeleteHandler={
                      currentUserIsCoreMember ? onDeleteHandler : undefined
                    }
                  />
                ))}
            </ul>
          </Container>
        )
      }
    />
  )
}

const Container = styled.div`
  .uploads__description {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;

    span {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  .uploads__list {
    margin: 0;
    padding: 0;
    vertical-align: middle;

    .uploads__list__item {
      position: relative;
      display: inline-block;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
      width: 32%;
      border: 1px solid ${({ theme }) => theme.colors.border.main};
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
        top: ${({ theme }) => theme.sizes.spaces.xsm}px;
        right: ${({ theme }) => theme.sizes.spaces.xsm}px;
        text-align: center;
        border-radius: 5px;
        width: 30px;
        height: 30px;
        cursor: pointer;
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
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }
`

export default AttachmentsTab
