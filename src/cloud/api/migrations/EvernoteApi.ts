import { callApi } from '../../lib/client'
import { NotebookMetadata } from '../../pages/migrations/EvernoteMigrate'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'

export interface EvernoteNotebooks {
  notebooks: NotebookMetadata[]
}

export interface EvernoteNoteData {
  noteId: string
  notebookId: string
  title: string
}

interface EvernoteNotes {
  notes: EvernoteNoteData[]
}

export interface AccessTokenRequestData {
  oauthAccessToken: string
  oauthAccessTokenSecret: string
  edamShard: string
  edamUserId: string
  edamExpires: string
  edamNoteStoreUrl: string
  edamWebApiUrlPrefix: string
}

interface RequestTokenData {
  oauthToken: string
  oauthTokenSecret: string
  redirectUrl: string
}

export const evernoteAccessTokenDataKey = 'evernote-migration-access-token-data'
export const evernoteOAuthVerifierKey = 'evernote-migration-oauth_verifier'
export const evernoteOAuthTokenKey = 'evernote-migration-oauth_token'
export const evernoteTempTokenKey = 'evernote-migration-temp-token'
export const evernoteTempTokenSecretKey = 'evernote-migration-temp-token-secret'

interface CreateEvernoteMigrationAccessTokenRequestBody {
  oauthToken: string
  oauthVerifier: string
  oauthTokenSecret: string
  // state: string // (Optional) Use it if you set `state`.
  // todo: the state is oauthTokenSecret afaik
}

interface EvernoteDocImportResponseBody {
  doc: SerializedDocWithSupplemental
}

export async function fetchEvernoteAccessToken(
  oauthToken: string,
  oauthVerifier: string,
  oauthTokenSecret: string
): Promise<AccessTokenRequestData> {
  const body: CreateEvernoteMigrationAccessTokenRequestBody = {
    oauthToken,
    oauthVerifier,
    oauthTokenSecret,
  }
  return callApi<AccessTokenRequestData>(
    `/api/migrations/evernote/access-token`,
    { method: 'post', json: body }
  )
}

export async function evernoteAuthorize(): Promise<RequestTokenData> {
  return callApi('api/migrations/evernote/authorize')
}

export async function fetchEvernoteNotebooks(
  oauthAccessToken: string
): Promise<EvernoteNotebooks> {
  return callApi<EvernoteNotebooks>(
    `/api/migrations/evernote/notebooks?oauthAccessToken=${oauthAccessToken}`
  )
}

export async function fetchEvernoteNotes(
  oauthAccessToken: string,
  notebookId: string
): Promise<EvernoteNotes> {
  return callApi<EvernoteNotes>(
    `/api/migrations/evernote/notes?oauthAccessToken=${oauthAccessToken}&notebookId=${notebookId}`
  )
}

export async function importEvernoteNote(
  oauthAccessToken: string,
  noteId: string,
  teamId: string,
  parentFolderId: string,
  workspaceId: string
): Promise<EvernoteDocImportResponseBody> {
  return callApi<EvernoteDocImportResponseBody>(
    `/api/migrations/evernote/${teamId}/${noteId}/import?oauthAccessToken=${oauthAccessToken}&parentFolderId=${parentFolderId}&workspaceId=${workspaceId}`
  )
}

export function resetAccessToken() {
  localStorage.removeItem(evernoteAccessTokenDataKey)
  localStorage.removeItem(evernoteOAuthVerifierKey)
  localStorage.removeItem(evernoteOAuthTokenKey)
  localStorage.removeItem(evernoteTempTokenKey)
  localStorage.removeItem(evernoteTempTokenSecretKey)
}

export function getAccessToken(): string | null {
  const accessTokenData = localStorage.getItem(evernoteAccessTokenDataKey)
  if (accessTokenData == null) {
    return null
  }
  return (JSON.parse(accessTokenData) as AccessTokenRequestData)
    .oauthAccessToken
}
