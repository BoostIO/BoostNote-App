import React from 'react'
import { getSettingsPageData } from '../../api/pages/settings'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { useGlobalData } from '../../lib/stores/globalData'
import HomeForm from './HomeForm'
import HomePageSignInForm from './HomePageSignInForm'

const HomePage = () => {
  const {
    globalData: { currentUser, teams },
  } = useGlobalData()
  if (currentUser) {
    return <HomeForm user={currentUser} teams={teams} />
  }

  return <HomePageSignInForm />
}

HomePage.getInitialProps = async (params: GetInitialPropsParameters) => {
  try {
    const result = await getSettingsPageData(params)
    return result
  } catch (err) {
    if (err.message == 'Unauthorized') {
      return {}
    } else {
      throw err
    }
  }
}

export default HomePage
