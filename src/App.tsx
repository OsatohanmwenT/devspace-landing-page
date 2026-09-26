import { useRef, useState } from "react";
import CoreValue from "./components/core-value";
import Devy from "./components/devy";
import Faq from "./components/faq";
import FinalCta from "./components/final-cta";
import Footer from "./components/footer";
import Header from "./components/header";
import Institutions from "./components/institutions";
import LearnerProof from "./components/learner-proof";
import { Question } from "./components/learning-journey";
import Marquee from "./components/marquee";
import Metrics from "./components/metrics";
import Opening from "./components/opening";
import PageLoader from "./components/page-loader";
import Paths from "./components/paths";
import Pricing from "./components/pricing";
import ProductTour from "./components/product-tour";
import Testimonials from "./components/testimonials";

const App = () => {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <PageLoader contentRef={pageRef} onReveal={() => setRevealed(true)} />
      <div ref={pageRef} className="min-h-screen bg-white">
        <Header />
        <Opening ready={revealed} />
        <Question className="bg-[#f4f2ed]" />
        <ProductTour />
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
