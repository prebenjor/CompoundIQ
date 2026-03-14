import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Calculator from '@/components/Calculator'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import CtaSection from '@/components/CtaSection'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Calculator />
        <HowItWorks />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
      <CookieConsent />
    </>
  )
}
