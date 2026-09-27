import { useRef, useState } from "react";
import Header from "./components/header";
import { Question } from "./components/learning-journey";
import Opening from "./components/opening";
import PageLoader from "./components/page-loader";
import ProductTour from "./components/product-tour";
import StraightPath from "./components/straight-path";

const App = () => {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <PageLoader contentRef={pageRef} onReveal={() => setRevealed(true)} />
      <div ref={pageRef} className="min-h-screen bg-white">
        <Header />
        <main>
        <Opening ready={revealed} />
        <Question className="question-handoff" />
        <StraightPath />
        <ProductTour />
        </main>
        {/* <Marquee />
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
        <Footer /> */}
      </div>
    </>
  );
};

export default App;
