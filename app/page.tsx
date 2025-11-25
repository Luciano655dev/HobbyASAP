import Hero from "@/components/home/Hero"
import HowItWorks from "@/components/home/HowItWorks"
import MetricSection from "@/components/home/MetricSection"
import HobbiesGrid from "@/components/home/HobbiesGrid"
import WhySection from "@/components/home/WhySection"
import FAQ from "@/components/home/FAQ"

export default function HobbyASAPHome() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <Hero />
      <MetricSection />
      <HowItWorks />
      <HobbiesGrid />
      <WhySection />
      <FAQ />
    </main>
  )
}
