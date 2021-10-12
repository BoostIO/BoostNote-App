import { callApi, callPdfApi } from '../../../lib/client'
import * as queryString from 'querystring'

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
  const href = `/pdf?${queryStringifiedParams}`
  return callPdfApi<GetDocPDFResponseBody>(href, {
    method: 'post',
    json: jsonData,
  })
}

export async function getDocExportForHTML(
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
  const href = `/html/?${queryStringifiedParams}`
  return callPdfApi<GetDocHTMLResponseBody>(href, {
    method: 'post',
    json: jsonData,
  })
}

export async function getExportsToken(teamId: string) {
  return callApi<GetExportsTokenResponseBody>(
    `/api/teams/${teamId}/exports-token/`
  )
}
