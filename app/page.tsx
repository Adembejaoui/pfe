import React from 'react'
import MainLayout from './Mainlayout'
import GamingHero from '@/components/elements/GamingHero'
import LiveStats from '@/components/elements/LiveStats'
import GamingServices from '@/components/elements/GamingServices'
import ClientReviews from '@/components/elements/ClientReviews'



const page =  () => {
  
  return (
    <MainLayout>
      <GamingHero />
      <LiveStats />
      <GamingServices />
      <ClientReviews />
    </MainLayout>
    
  )
}

export default page