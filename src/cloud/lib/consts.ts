export const gaTrackingId = process.env.GA_TRACKING_ID || 'elidid'
export const nodeEnv = process.env.NODE_ENV || 'development'
export const intercomAppId = process.env.INTERCOM_APP_ID || 'elidid'
export const boostHubBaseUrl =
  process.env.BOOST_HUB_BASE_URL || 'http://localhost:3001'
export const boostPdfExportBaseUrl =
  process.env.BOOST_PDF_EXPORT_BASE_URL || 'http://localhost:3006'
export const realtimeUrl = process.env.REALTIME_URL || 'http://localhost:3003'
export const sseUrl = process.env.SSE_URL || 'http://localhost:3002'
export const stripePublishableKey =
  process.env.STRIPE_PUBLISHABLE_KEY || 'elidid'
export const githubOauthId = process.env.GITHUB_OAUTH_ID || 'elidid'
export const googleClientId = process.env.GOOGLE_CLIENT_ID || 'elidid'

export const newUserStandardCouponId = process.env.COUPONS_NEW_USER_STANDARD
export const newUserProCouponId = process.env.COUPONS_NEW_USER_PRO
export const newSpaceCouponId = process.env.COUPONS_NEW_SPACE
export const newSpaceAnnualCouponId = process.env.COUPONS_NEW_SPACE_ANNUAL
export const mobileBaseUrl =
  process.env.MOBILE_BASE_URL || 'http://localhost:3005'
export const mockBackend = process.env.MOCK_BACKEND === 'true'
export const githubAppUrl = process.env.GITHUB_APP_URL || 'elidid'
