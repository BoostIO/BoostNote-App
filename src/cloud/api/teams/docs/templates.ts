import { SerializedTemplate } from '../../../interfaces/db/template'
import { callApi } from '../../../lib/client'

export interface GetTemplatesResponseBody {
  templates: SerializedTemplate[]
}

export async function getAllTemplates(teamId: string, signal?: AbortSignal) {
  const data = await callApi<GetTemplatesResponseBody>(`api/templates`, {
    search: { teamId },
    signal,
  })
  return data
}

export interface CreateDocTemplateRequestBody {
  teamId: string
  docId: string
}

export interface CreateDocTemplateResponseBody {
  template: SerializedTemplate
}

export interface GetTemplateResponseBody {
  template: SerializedTemplate
}

export interface UpdateTemplateRequestBody {
  emoji?: string
  title: string
  content: string
}

export interface UpdateTemplateResponseBody {
  template: SerializedTemplate
}

export async function getTemplate(templateId: string) {
  const data = await callApi<GetTemplateResponseBody>(
    `api/templates/${templateId}`
  )

  return data
}

export async function saveDocAsTemplate(teamId: string, docId: string) {
  const data = await callApi<CreateDocTemplateResponseBody>(`api/templates`, {
    json: { teamId, docId },
    method: 'post',
  })
  return data
}

export async function destroyDocTemplate(templateId: string) {
  const data = await callApi(`api/templates/${templateId}`, {
    method: 'delete',
  })
  return data
}

export async function updateTemplate(
  templateId: string,
  body: UpdateTemplateRequestBody
) {
  const data = await callApi<UpdateTemplateResponseBody>(
    `api/templates/${templateId}`,
    {
      json: body,
      method: 'put',
    }
  )
  return data
}
