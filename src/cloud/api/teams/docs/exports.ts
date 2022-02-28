import { callApi } from '../../../lib/client'
import * as queryString from 'querystring'
import { boostPdfExportBaseUrl } from '../../../lib/consts'
import ky from 'ky'

export interface GetDocPDFResponseBody {
  buffer: Buffer & { data: any }
}

export interface GetDocHTMLResponseBody {
  html: string
}

export interface GetExportsTokenResponseBody {
  token: string
}

export interface ExportOptions {
  appTheme?: string
  codeBlockTheme?: string
}

export async function getDocExportForPDF(
  title: string,
  content: string,
  token: string,
  options?: ExportOptions
) {
  const queryParams = {
    json: 1,
    ...(options || {}),
  }
  const jsonData = {
    title: title,
    content: content,
    token: token,
  }
  const queryStringifiedParams = queryString.stringify(queryParams)
  const path = `pdf?${queryStringifiedParams}`

  return ky(path, {
    prefixUrl: boostPdfExportBaseUrl,
    method: 'post',
    json: jsonData,
    credentials: 'include',
    retry: 0,
  }).blob()
}

export async function getExportsToken(teamId: string) {
  return callApi<GetExportsTokenResponseBody>(
    `/api/teams/${teamId}/exports-token/`
  )
}
