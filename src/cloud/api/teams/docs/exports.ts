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
  title: string,
  content: string,
  options?: ExportOptions
) {
  const queryParams = {
    json: 1,
    ...(options || {}),
  }
  const jsonData = {
    title: title,
    content: content,
    docId: docId,
  }
  const queryStringifiedParams = queryString.stringify(queryParams)
  const href = `/api/teams/${teamId}/doc-exports/pdf?${queryStringifiedParams}`
  return callApi<GetDocPDFResponseBody>(href, {
    method: 'post',
    json: jsonData,
  })
}

export async function getDocExportForHTML(
  teamId: string,
  docId: string,
  title: string,
  content: string,
  options?: ExportOptions
) {
  const queryParams = {
    json: 1,
    ...(options || {}),
  }
  const jsonData = {
    title: title,
    content: content,
    docId: docId,
  }
  const queryStringifiedParams = queryString.stringify(queryParams)
  const href = `/api/teams/${teamId}/doc-exports/html?${queryStringifiedParams}`
  return callApi<GetDocHTMLResponseBody>(href, {
    method: 'post',
    json: jsonData,
  })
}
