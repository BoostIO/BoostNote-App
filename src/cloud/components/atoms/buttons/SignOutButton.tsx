import React, { useCallback, MouseEvent } from 'react'
import CustomLink from '../Link/CustomLink'
import { useTranslation } from 'react-i18next'
import { usingElectron, sendToHost } from '../../../lib/stores/electron'
import { boostHubBaseUrl } from '../../../lib/consts'

interface SignOutButton {
  redirectTo?: string
}

const SignOutButton = ({ redirectTo }: SignOutButton) => {
  const { t } = useTranslation()

  const signOutUrl =
    redirectTo == null
      ? '/api/oauth/signout'
      : `/api/oauth/signout?redirectTo=${redirectTo}`

  const signOut = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      if (usingElectron) {
        sendToHost('sign-out')
      } else {
        window.location.href = `${boostHubBaseUrl}${signOutUrl}`
      }
    },
    [signOutUrl]
  )

  return (
    <CustomLink
      href={signOutUrl}
      onClick={signOut}
      variant='primary'
      block={true}
    >
      {t('general.signOut')}
    </CustomLink>
  )
}

export default SignOutButton
