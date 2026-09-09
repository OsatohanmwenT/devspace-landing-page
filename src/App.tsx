import Header from "./components/header";
import Hero from "./components/hero";
import Marquee from "./components/marquee";
import Metrics from "./components/metrics";
import CoreValue from "./components/core-value";
import Paths from "./components/paths";
import Devy from "./components/devy";
import LearnerProof from "./components/learner-proof";
import Testimonials from "./components/testimonials";
import FinalCta from "./components/final-cta";
import Faq from "./components/faq";
import Footer from "./components/footer";

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Marquee />
      <Metrics />
      <CoreValue />
      <Paths />
      <Devy />
      <LearnerProof />
      <Testimonials />
      <FinalCta />
      <Faq />
      <Footer />
    </div>
  );
};

export default App;
