import { callApi } from '../../../lib/client'

export interface GetDocPDFResponseBody {
  buffer: Buffer & { data: any }
}

export interface GetDocHTMLResponseBody {
  html: string
}

export async function getDocExportForPDF(teamId: string, docId: string) {
  return callApi<GetDocPDFResponseBody>(
    `api/teams/${teamId}/docs/${docId}/exports/pdf?json=1`
  )
}

export async function getDocExportForHTML(teamId: string, docId: string) {
  return callApi<GetDocHTMLResponseBody>(
    `api/teams/${teamId}/docs/${docId}/exports/html?json=1`
  )
}
