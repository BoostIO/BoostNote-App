import React from 'react'
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

HomePage.getInitialProps = async () => {
  return {}
}

export default HomePage
