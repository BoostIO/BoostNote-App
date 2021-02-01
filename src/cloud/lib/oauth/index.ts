export interface TokenInfo {
  token: string
  userIdentifier: string
}

export interface OAuthHandler {
  getAuthUrl: (state: string, callbackUrl: string) => string
  getToken: (
    code: string,
    state: string,
    callbackUrl: string
  ) => Promise<TokenInfo>
}
