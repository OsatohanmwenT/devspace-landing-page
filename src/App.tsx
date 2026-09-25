import { useRef, useState } from "react";
import CoreValue from "./components/core-value";
import Devy from "./components/devy";
import Faq from "./components/faq";
import FinalCta from "./components/final-cta";
import Footer from "./components/footer";
import Header from "./components/header";
import Hero from "./components/hero";
import Institutions from "./components/institutions";
import LearnerProof from "./components/learner-proof";
import LearningJourney from "./components/learning-journey";
import Marquee from "./components/marquee";
import Metrics from "./components/metrics";
import PageLoader from "./components/page-loader";
import Paths from "./components/paths";
import Pricing from "./components/pricing";
import Testimonials from "./components/testimonials";

const App = () => {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <PageLoader contentRef={pageRef} onReveal={() => setRevealed(true)} />
      <div ref={pageRef} className="min-h-screen bg-white">
        <Header />
        <Hero ready={revealed} />
        <LearningJourney />
        <Marquee />
        <Metrics />
        <CoreValue />
        <Paths />
        <Devy />
        <LearnerProof />
        <Testimonials />
        <Institutions />
        <Pricing />
        <FinalCta />
        <Faq />
        <Footer />
      </div>
    </>
  );
};

export default App;
