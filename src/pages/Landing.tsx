import { motion } from 'framer-motion'
import ScrollProgress from '../components/ScrollProgress'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Logos from '../components/Logos'
import Stats from '../components/Stats'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import Testimonials from '../components/Testimonials'
import Comparison from '../components/Comparison'
import FAQ from '../components/FAQ'
import CTABanner from '../components/CTABanner'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <motion.div
      className="min-h-screen bg-[#F9FAFB] dark:bg-[#111827]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Logos />
        <Stats />
        <HowItWorks />
        <Features />
        <Pricing />
        <Testimonials />
        <Comparison />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </motion.div>
  )
}
