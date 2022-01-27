import React from 'react'
import { useGlobalData } from '../../lib/stores/globalData'
import { EvernoteMigrate } from './EvernoteMigrate'
import HomePageSignInForm from '../home/HomePageSignInForm'

const EvernoteMigration = () => {
  const {
    globalData: { currentUser, teams },
  } = useGlobalData()
  if (currentUser) {
    return <EvernoteMigrate user={currentUser} teams={teams} />
  }
  return <HomePageSignInForm />
}

EvernoteMigration.getInitialProps = async () => {
  return {}
}

export default EvernoteMigration
