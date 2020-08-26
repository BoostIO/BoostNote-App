import React from 'react'
import DefaultLayout from '../components/DefaultLayout'
import HeroSection from '../components/organisms/HeroSection'
import FeaturesSection from '../components/organisms/FeaturesSection'
import PricingPlansSection from '../components/organisms/PricingPlansSection'
import BoostHubSection from '../components/organisms/BoostHubSection'
import DownloadSection from '../components/organisms/DownloadSection'
import CommunitySection from '../components/organisms/CommunitySection'

const HomePage = () => {
  return (
    <DefaultLayout>
      <HeroSection />
      <BoostHubSection />
      <FeaturesSection />
      <PricingPlansSection />
      <DownloadSection />
      <CommunitySection />
    </DefaultLayout>
  )
}

export default HomePage
