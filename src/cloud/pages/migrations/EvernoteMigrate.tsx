import React, { useCallback, useEffect, useState } from 'react'
import { SerializedUser } from '../../interfaces/db/user'
import {
  SerializedTeam,
  SerializedTeamWithPermissions,
} from '../../interfaces/db/team'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import { useRouter } from '../../lib/router'
import {
  AccessTokenRequestData,
  evernoteAccessTokenDataKey,
  evernoteAuthorize,
  EvernoteNoteData,
  evernoteOAuthTokenKey,
  evernoteOAuthVerifierKey,
  evernoteTempTokenKey,
  evernoteTempTokenSecretKey,
  fetchEvernoteAccessToken,
  fetchEvernoteNotebooks,
  fetchEvernoteNotes,
  getAccessToken,
  importEvernoteNote,
  resetAccessToken,
} from '../../api/migrations/EvernoteApi'
import { useToast } from '../../../design/lib/stores/toast'
import EvernoteImportNotebookList from '../../components/ImportFlow/molecules/EvernoteImportNotebookList'
import { rightSidePageLayout } from '../../../design/lib/styled/styleFunctions'
import { rightSideTopBarHeight } from '../../../design/components/organisms/Topbar'
import Spinner from '../../../design/components/atoms/Spinner'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { SerializedFolder } from '../../interfaces/db/folder'
import Button from '../../../design/components/atoms/Button'
import { useNavigateToWorkspace } from '../../components/Link/WorkspaceLink'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { DialogIconTypes, useDialog } from '../../../design/lib/stores/dialog'
import styled from '../../../design/lib/styled'
import ProgressBar from '../../../components/atoms/ProgressBar'
import { useNav } from '../../lib/stores/nav'
import { getMapFromEntityArray } from '../../../design/lib/utils/array'
import { useElectron } from '../../lib/stores/electron'

interface EvernoteMigrateProps {
  user: SerializedUser
  teams: (SerializedTeamWithPermissions & {
    subscription?: SerializedSubscription
  })[]
}

export interface NotebookMetadata {
  notebookName: string
  noteCount: number
  notebookId: string
}

type EvernoteImportStep = 'notebook-list' | 'migration' | 'migration-finished'

function getProgressPercentage(jobsCompleted: number, jobsCount: number) {
  return Math.max(Math.min((jobsCompleted / jobsCount) * 100, 100), 0)
}

export const EvernoteMigrate = ({ teams = [] }: EvernoteMigrateProps) => {
  const [notebookFolders, setNotebookFolders] = useState<
    Map<string, SerializedFolder>
  >(new Map())
  const [numberOfNotesToImport, setNumberOfNotesToImport] = useState<number>(0)
  const [progressValue, setProgressValue] = useState<number>(0)
  const [stopMigration, setStopMigration] = useState<boolean>(false)
  const [selectedTeam, setSelectedTeam] = useState<SerializedTeam | null>(null)
  const [
    selectedWorkspace,
    setSelectedWorkspace,
  ] = useState<SerializedWorkspace | null>(null)
  const [notMigratedNotes, setNotMigratedNotes] = useState<EvernoteNoteData[]>(
    []
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [migrationStep, setMigrationStep] = useState<EvernoteImportStep>(
    'notebook-list'
  )
  const [migrationDescription, setMigrationDescription] = useState<string>('')
  const [notebooks, setNotebooks] = useState<NotebookMetadata[]>([])

  const { query } = useRouter()
  const { pushMessage } = useToast()
  const { sendToElectron, usingElectron } = useElectron()

  const { createWorkspace: createWorkspaceApi, createFolder } = useCloudApi()
  const navigateToWorkspace = useNavigateToWorkspace()
  const { messageBox } = useDialog()
  const {
    updateDocsMap,
    updateParentFolderOfDoc,
    updateParentWorkspaceOfDoc,
    updateTagsMap,
  } = useNav()

  const fetchEvernoteTempToken = useCallback(() => {
    evernoteAuthorize()
      .then((result) => {
        localStorage.setItem(evernoteTempTokenKey, result.oauthToken)
        localStorage.setItem(
          evernoteTempTokenSecretKey,
          result.oauthTokenSecret
        )

        if (usingElectron) {
          sendToElectron('open-external-url', result.redirectUrl)
        } else {
          open(result.redirectUrl)
        }
      })
      .catch((err) => {
        setLoading(false)
        resetAccessToken()
        pushMessage({
          title: 'UnAuthorized',
          description:
            'You need to grant access to Boost Note to import Evernote notebooks. Please authorize again on Settings import page.',
        })
        console.log('Failed because of', err)
        fetchEvernoteTempToken()
      })
  }, [pushMessage, sendToElectron, usingElectron])

  const fetchNotebooks = useCallback(
    (oauthAccessToken: string) => {
      setMigrationDescription('Retrieving data from Evernote...')
      setLoading(true)
      fetchEvernoteNotebooks(oauthAccessToken)
        .then((res) => {
          setLoading(false)
          setMigrationDescription('')
          setNotebooks(res.notebooks)
        })
        .catch((err) => {
          setLoading(false)
          // reset saved access token - it is invalid
          resetAccessToken()
          pushMessage({
            title: 'UnAuthorized',
            description:
              'You need to grant access to Boost Note to import Evernote notebooks. Please authorize again on Settings import page.',
          })
          console.log('Failed because of', err)
          fetchEvernoteTempToken()
        })
    },
    [fetchEvernoteTempToken, pushMessage]
  )

  const getEvernoteAccessToken = useCallback(
    (oauthToken, oauthVerifier, oauthSecretToken) => {
      setLoading(true)
      fetchEvernoteAccessToken(oauthToken, oauthVerifier, oauthSecretToken)
        .then((data) => {
          setLoading(false)
          localStorage.setItem(evernoteAccessTokenDataKey, JSON.stringify(data))
          fetchNotebooks(data.oauthAccessToken)
        })
        .catch((err) => {
          resetAccessToken()
          setLoading(false)

          pushMessage({
            title: 'UnAuthorized',
            description:
              'You need to grant access to Boost Note to import Evernote notebooks. Please refresh the page.',
          })
          console.log('Failed because of', err)
          fetchEvernoteTempToken()
        })
    },
    [fetchNotebooks, pushMessage, fetchEvernoteTempToken]
  )

  const importNote = useCallback(
    async (
      selectedTeam: SerializedTeam,
      noteData: EvernoteNoteData,
      folder: SerializedFolder
    ) => {
      console.log('Import', selectedTeam)
      if (selectedTeam == null) {
        pushMessage({
          title: 'Error',
          description: 'Please select a team.',
        })
        return
      }
      const oauthAccessToken = getAccessToken()
      if (oauthAccessToken == null) {
        pushMessage({
          title: 'Unauthorized',
          description: 'Please authorize evernote again.',
        })
        return
      }
      try {
        const res = await importEvernoteNote(
          oauthAccessToken,
          noteData.noteId,
          selectedTeam.id,
          folder.id,
          folder.workspaceId
        )
        // console.log('Got doc from backend', res.doc)
        if (res && res.doc) {
          if (res.doc.tags != null && res.doc.tags.length > 0) {
            const tagMap = getMapFromEntityArray(res.doc.tags)
            updateTagsMap(...tagMap)
          }
          updateDocsMap([res.doc.id, res.doc])
          if (res.doc.parentFolder != null) {
            updateParentFolderOfDoc(res.doc)
          } else if (res.doc.workspace != null) {
            updateParentWorkspaceOfDoc(res.doc)
          }
        }
      } catch (e) {
        console.warn('Hey failed note', noteData, e)
        setNotMigratedNotes((prev) => {
          return [...prev, noteData]
        })
      }
    },
    [
      pushMessage,
      updateDocsMap,
      updateParentFolderOfDoc,
      updateParentWorkspaceOfDoc,
      updateTagsMap,
    ]
  )

  const importNotes = useCallback(
    async (selectedTeam, folders, notes) => {
      setProgressValue(0)
      const totalNumberOfNotes = notes.length
      setNumberOfNotesToImport(totalNumberOfNotes)
      let currentNoteIdx = 1

      for (const note of notes) {
        const folder = folders.get(note.notebookId)
        console.log('Importing the note', note, folder)
        if (folder == null) {
          setNotMigratedNotes((prev) => {
            return [...prev, note]
          })
          continue
        }

        if (stopMigration) {
          setNotMigratedNotes((prev) => {
            return [...prev, ...notes]
          })
          continue
        }

        setMigrationDescription(
          `Migrating... (${currentNoteIdx}/${totalNumberOfNotes})`
        )

        await importNote(selectedTeam, note, folder)
        currentNoteIdx += 1
        setProgressValue(
          getProgressPercentage(currentNoteIdx, totalNumberOfNotes)
        )
      }
    },
    [importNote, stopMigration]
  )

  const importNotebooks = useCallback(
    async (
      selectedNotebooks,
      selectedTeam: SerializedTeam,
      workspaceId,
      oauthAccessToken
    ) => {
      const createdFolders: Map<string, SerializedFolder> = new Map()
      for (const notebook of selectedNotebooks) {
        console.log('Importing notebook', notebook.notebookName)
        try {
          await createFolder(
            selectedTeam,
            {
              workspaceId: workspaceId,
              description: '',
              folderName: notebook.notebookName,
            },
            {
              skipRedirect: true,
              afterSuccess: (folder: SerializedFolder) => {
                console.log('Created notebook folder', folder)
                createdFolders.set(notebook.notebookId, folder)
              },
            }
          )
          console.log('Folder created...', notebook.notebookName)
        } catch (e) {
          setLoading(false)
          setMigrationDescription('')
          setMigrationStep('notebook-list')
          pushMessage({
            title: 'Error during migration',
            description: e,
          })
        }
      }

      setLoading(true)
      setMigrationStep('migration')

      const notesToImport: EvernoteNoteData[] = []
      setProgressValue(0)
      let currentNotebookIdx = 1
      for (const notebook of selectedNotebooks) {
        setProgressValue(
          getProgressPercentage(currentNotebookIdx, selectedNotebooks.length)
        )
        setMigrationDescription(
          `Loading notes from evernote notebooks... (${currentNotebookIdx++}/${
            selectedNotebooks.length
          })`
        )
        try {
          const notes = await fetchEvernoteNotes(
            oauthAccessToken,
            notebook.notebookId
          )
          if (createdFolders.has(notebook.notebookId)) {
            notesToImport.push(...notes.notes)
          } else {
            // the folder probably wasn't created, set those notes to failed
            setNotMigratedNotes((prev) => {
              return [...prev, ...notes.notes]
            })
          }
        } catch (e) {
          // no conversion will happen in this case, we could track this as not loaded notes? But don't know how to show those!
          pushMessage({
            title: 'Evernote notes fetch error',
            description:
              'Error happened during fetching evernote notes. Not all notes will be imported.',
          })
        }
      }

      setLoading(false)
      setNotebookFolders(createdFolders)
      await importNotes(selectedTeam, createdFolders, notesToImport)

      setMigrationStep('migration-finished')
    },
    [importNotes, createFolder, pushMessage]
  )

  const importEvernoteNotebooks = useCallback(
    async (selectedNotebooks: NotebookMetadata[], selectedTeamId) => {
      const selectedTeam = teams.find(
        (team: SerializedTeam) => team.id == selectedTeamId
      )
      if (selectedTeam == null) {
        pushMessage({
          title: 'Error',
          description: `The team selected is invalid: ${selectedTeamId}.`,
        })
        return
      }

      setSelectedTeam(selectedTeam)

      const oauthAccessToken = getAccessToken()
      if (oauthAccessToken == null) {
        pushMessage({
          title: 'Unauthorized',
          description: 'Please authorize evernote again.',
        })
        return
      }

      // create folder and sub-folders for notes
      try {
        await createWorkspaceApi(
          selectedTeam,
          {
            name: 'EvernoteNotebooks',
            permissions: [],
            public: false,
          },
          {
            skipRedirect: true,
            afterSuccess: (wp) => {
              setSelectedWorkspace(wp)
              importNotebooks(
                selectedNotebooks,
                selectedTeam,
                wp.id,
                oauthAccessToken
              )
            },
          }
        )
      } catch (e) {
        pushMessage({
          title: 'Error during migration',
          description: e,
        })
        setLoading(false)
        setMigrationDescription('')
        setMigrationStep('notebook-list')
      }
    },
    [createWorkspaceApi, importNotebooks, pushMessage, teams]
  )

  useEffect(() => {
    const accessTokenData = localStorage.getItem(evernoteAccessTokenDataKey)
    if (accessTokenData) {
      const accessOauthToken = (JSON.parse(
        accessTokenData
      ) as AccessTokenRequestData).oauthAccessToken
      fetchNotebooks(accessOauthToken)
      return
    }

    const evernoteTempTokenSecret = localStorage.getItem(
      evernoteTempTokenSecretKey
    )
    if (
      localStorage.getItem(evernoteTempTokenKey) == null ||
      evernoteTempTokenSecret == null ||
      query.oauth_token == null
    ) {
      return
    }

    if (!query.oauth_verifier || query.oauth_verifier === '') {
      pushMessage({
        title: 'No access given',
        description:
          'You need to grant access to Boost Note to import Evernote notebooks' +
          query.reason,
      })
      return
    }
    if (
      query.oauth_verifier != null &&
      typeof query.oauth_verifier === 'string'
    ) {
      localStorage.setItem(evernoteOAuthVerifierKey, query.oauth_verifier)
    }
    if (typeof query.oauth_token === 'string') {
      localStorage.setItem(evernoteOAuthTokenKey, query.oauth_token)
    }
    getEvernoteAccessToken(
      query.oauth_token,
      query.oauth_verifier,
      evernoteTempTokenSecret
    )
  }, [fetchNotebooks, getEvernoteAccessToken, pushMessage, query])

  const retryImportingFailedNotes = useCallback(async () => {
    setMigrationDescription('')
    setMigrationStep('migration')

    const notesToImport = [...notMigratedNotes]
    setNotMigratedNotes([])
    await importNotes(selectedTeam, notebookFolders, notesToImport)

    setMigrationStep('migration-finished')
  }, [importNotes, notMigratedNotes, notebookFolders, selectedTeam])

  const navigateToCreatedWorkspace = useCallback(() => {
    if (selectedWorkspace != null && selectedTeam != null) {
      navigateToWorkspace(selectedWorkspace, selectedTeam, 'index')
    } else {
      pushMessage({
        title: 'Error in navigation',
        description:
          'Something went wrong during migration, please try again later.',
      })
    }
  }, [navigateToWorkspace, pushMessage, selectedTeam, selectedWorkspace])

  const abortMigrationProcess = useCallback(() => {
    messageBox({
      title: `Stop Evernote migration?`,
      message: `Are you sure you want to stop the migration. You can continue migrating remaining notes if you stop the migration now.`,
      iconType: DialogIconTypes.Warning,
      buttons: [
        {
          variant: 'secondary',
          label: 'Cancel',
          cancelButton: true,
          defaultButton: true,
        },
        {
          variant: 'danger',
          label: 'Stop',
          onClick: async () => {
            setStopMigration(true)
          },
        },
      ],
    })
  }, [messageBox])

  useEffect(() => {
    if (migrationStep === 'migration-finished') {
      if (notMigratedNotes.length > 0) {
        setMigrationDescription(
          `${
            numberOfNotesToImport - notMigratedNotes.length
          } note(s) have been migrated.\n${
            notMigratedNotes.length
          } note(s) have not been migrated yet.`
        )
      } else {
        setMigrationDescription(
          `${numberOfNotesToImport} notes have been migrated.`
        )
      }
    }
  }, [migrationStep, notMigratedNotes.length, numberOfNotesToImport])

  return (
    <Container>
      <img
        alt={'evernote icon'}
        src='/app/static/logos/evernote.svg'
        width={48}
        height={48}
      />
      <h1>Evernote migration</h1>
      <>
        {migrationDescription !== '' && <h2>{migrationDescription}</h2>}
        {loading && <Spinner variant='subtle' size={32} />}
      </>

      {notebooks.length > 0 && migrationStep === 'notebook-list' && (
        <>
          <EvernoteImportNotebookList
            teams={teams}
            notebooks={notebooks}
            onSelect={(selectedNotebooks, selectedSpace) =>
              importEvernoteNotebooks(selectedNotebooks, selectedSpace)
            }
          />
        </>
      )}

      {migrationStep === 'migration' && (
        <MigrationProgressContainer>
          <ProgressBar
            className={'evernote__migration__progress__style'}
            progress={progressValue}
          />
          <Button variant={'secondary'} onClick={abortMigrationProcess}>
            Abort migration
          </Button>
        </MigrationProgressContainer>
      )}

      {notMigratedNotes.length > 0 && (
        <div>
          <h1>Failed</h1>
          <div className={'not-imported-notes--container'}>
            {notMigratedNotes.map((failedNote) => (
              <div key={failedNote.noteId}>
                <span>{failedNote.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {migrationStep === 'migration-finished' && (
        <MigrationFinishedButtons>
          {notMigratedNotes.length > 0 && (
            <Button variant={'secondary'} onClick={retryImportingFailedNotes}>
              Try again
            </Button>
          )}
          <Button variant={'secondary'} onClick={navigateToCreatedWorkspace}>
            Go to the destination folder
          </Button>
        </MigrationFinishedButtons>
      )}
    </Container>
  )
}

const MigrationProgressContainer = styled.div`
  min-width: 480px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;

  .evernote__migration__progress__style {
    background-color: ${({ theme }) =>
      theme.colors.background.secondary} !important;
    height: 15px;
    border-radius: 4px;
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .evernote__migration__progress__style:after {
    background-color: ${({ theme }) =>
      theme.colors.background.quaternary} !important;
  }
`

const MigrationFinishedButtons = styled.div`
  display: flex;
  align-content: center;
`

const Container = styled.div`
  ${rightSidePageLayout};
  margin: 0 auto;
  padding-top: calc(
    ${rightSideTopBarHeight}px + ${({ theme }) => theme.sizes.spaces.l}px
  );
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  padding-right: ${({ theme }) => theme.sizes.spaces.l}px;
  min-height: calc(100vh - ${rightSideTopBarHeight}px);
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  .not-imported-notes--container {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    padding: 6px;

    min-width: 480px;
    min-height: 180px;

    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`
