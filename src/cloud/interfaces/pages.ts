export interface RedirectToPageResponseBody {
  redirectTo: string
}

export interface GetInitialPropsParameters {
  pathname: string
  search: string
  signal: AbortSignal
}
