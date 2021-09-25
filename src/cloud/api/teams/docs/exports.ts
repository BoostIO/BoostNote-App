import { callApi } from '../../../lib/client'
import * as queryString from 'querystring'

export interface GetDocPDFResponseBody {
  buffer: Buffer & { data: any }
}

export interface GetDocHTMLResponseBody {
  html: string
}

export interface ExportOptions {
  appTheme?: string
  codeBlockTheme?: string
  printBackground?: boolean
}

export async function getDocExportForPDF(
  teamId: string,
  docId: string,
  options?: ExportOptions
) {
  const queryParams = {
    ...(options || {}),
    json: 1,
  }
  const queryStringifiedParams = queryString.stringify(queryParams)
  const href = `api/teams/${teamId}/docs/${docId}/exports/pdf?${queryStringifiedParams}`
  console.log('Calling api', href)
  return callApi<GetDocPDFResponseBody>(href)
}

export async function getDocExportForHTML(
  teamId: string,
  docId: string,
  options?: ExportOptions
) {
  const queryParams = {
    ...(options || {}),
    json: 1,
  }
  const queryStringifiedParams = queryString.stringify(queryParams)
  const href = `api/teams/${teamId}/docs/${docId}/exports/html?${queryStringifiedParams}`
  return callApi<GetDocHTMLResponseBody>(href)
}
