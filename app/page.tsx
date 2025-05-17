import Navbar from '@/components/elements/Navbar'
import React from 'react'
import MainLayout from './Mainlayout'
import { Hero } from '@/components/elements/Hero'
import FeatureCarousel from '@/components/elements/FeatureCarousel'
import Marque from '@/components/elements/Marque'



const page =  () => {
  
  return (
    <MainLayout>
      <Hero />
      <FeatureCarousel />
      <Marque />
    </MainLayout>
    
  )
}

export default page