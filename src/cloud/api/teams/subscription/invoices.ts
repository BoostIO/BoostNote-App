import { callApi } from '../../../lib/client'

export interface GetCustomerInvoicePortalResponseBody {
  url: string
}

export async function getTeamPortalUrl(teamId: string) {
  const data = await callApi<GetCustomerInvoicePortalResponseBody>(
    `api/teams/${teamId}/subscription/invoices`
  )
  return data
}
