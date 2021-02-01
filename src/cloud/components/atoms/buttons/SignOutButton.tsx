import React from 'react'
import CustomLink from '../Link/CustomLink'
import { useTranslation } from 'react-i18next'

interface SignOutButton {
  redirectTo?: string
}

const SignOutButton = ({ redirectTo }: SignOutButton) => {
  const { t } = useTranslation()
  return (
    <CustomLink
      href={
        redirectTo == null
          ? '/api/oauth/signout'
          : `/api/oauth/signout?redirectTo=${redirectTo}`
      }
      variant='primary'
      block={true}
    >
      {t('general.signOut')}
    </CustomLink>
  )
}

export default SignOutButton
