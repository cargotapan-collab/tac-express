import { HeroSection } from "@workspace/ui/components/composed/hero-section"
import { TrackingBox } from "@workspace/ui/components/composed/tracking-box"
import { StatsBar } from "@workspace/ui/components/composed/stats-bar"
import { RouteMarquee } from "@workspace/ui/components/composed/route-marquee"
import { FeatureBento } from "@workspace/ui/components/composed/feature-bento"
import { HowItWorks } from "@workspace/ui/components/composed/how-it-works"
import { CtaBanner } from "@workspace/ui/components/composed/cta-banner"
import { SectionDivider } from "@workspace/ui/components/composed/section-divider"
import heroAnimation from "../../assets/lottie/hero-asset.json"

export default function Home() {
  return (
    <>
      <HeroSection animationData={heroAnimation} />
      <RouteMarquee />
      <TrackingBox />
      <StatsBar />
      <SectionDivider variant="gradient-fade" accent className="my-0" />
      <FeatureBento />
      <SectionDivider variant="dashed" className="my-0" />
      <HowItWorks />
      <CtaBanner />
    </>
  )
}
