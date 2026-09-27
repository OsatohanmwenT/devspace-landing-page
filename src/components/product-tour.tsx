import { useEffect, useRef } from "react";
import "./product-tour.css";

const STEPS = [
  {
    id: "paths", kicker: "Find your path", title: "We recommend. You decide.",
    copy: "Devy suggests a path from your goals, interests, experience and time. Or explore a path you already like, focus on one skill, or build your own.",
    note: "Your goals. Your pace. A clear next step.",
  },
  {
    id: "lessons", kicker: "Learn", title: "Learn, watch and practise in one flow.",
    copy: "Clear explanations, short video clips, examples and diagrams, quick checks and practical exercises, all in the same lesson.",
    note: "Less switching tabs. More connecting the dots.",
  },
  {
    id: "build", kicker: "Build", title: "Code live, with Devy beside you.",
    copy: "Write and run code in the live editor, and ask Devy about any text or code while you work.",
    note: "Make something. Get unstuck. Keep moving.",
  },
  {
    id: "proof", kicker: "Prove it", title: "Submit real work, not just answers.",
    copy: "Hand in live links, Figma files, spreadsheets, Power BI reports or screenshots. Proof for design and data paths too, not only code.",
    note: "Something you made. Something you can show.",
  },
  {
    id: "progress", kicker: "Keep going", title: "Progress you can see, and rewards you can earn.",
    copy: "XP, streaks and leaderboards keep you moving, and cash rewards make the effort count.",
    note: "Small steps become visible progress.",
  },
];

// Illustrative product previews; kept in HTML so they stay sharp at every size.
const Preview = ({ step }: { step: number }) => (
  <div className={`product-preview preview-${step}`}>
    <div className="preview-toolbar"><span className="preview-mark">d.</span><span>devspace <span className="preview-slash">/</span> {STEPS[step].kicker.toLowerCase()}</span><span className="preview-status">Your workspace</span></div>
    {step === 0 && <div className="preview-body">
      <span className="preview-label">MADE FOR YOUR NEXT CHAPTER</span>
      <h4>Where do you want to go?</h4>
      <div className="goal-tags"><span>Build for the web</span><span>Start from the basics</span><span>5 hours a week</span></div>
      <div className="recommendation"><div className="recommendation-top"><span>↗</span><span>RECOMMENDED FOR YOU</span></div><h5>Frontend development</h5><p>From your first line of HTML to a project you can share.</p><div className="preview-route"><i /><b /><i /><b /><i /><b /><i /></div><div className="preview-row"><span>6 milestones</span><strong>A path, not a pile of links ↗</strong></div></div>
      <div className="devy-note"><img src="/devy.svg" alt="" /><p>Start with the foundations.<br /><strong>We’ll build from there, together.</strong></p></div>
    </div>}
    {step === 1 && <div className="preview-body">
      <div className="preview-row"><span className="preview-label">YOUR FIRST WEB PAGE</span><span className="lesson-count">02 / 06</span></div>
      <h4>Give your ideas a structure.</h4>
      <div className="lesson-video"><span className="html-tag">&lt;main&gt;</span><span className="video-play">▶</span><span className="video-caption">HTML, explained visually <b>04:32</b></span></div>
      <div className="lesson-tabs"><span>Understand</span><span>Watch</span><span className="selected">Practise</span></div>
      <div className="exercise"><span className="preview-label">YOUR TURN</span><p>Add a heading. Make it yours.</p><code>&lt;h1&gt;Hello, world.&lt;/h1&gt;</code></div>
    </div>}
    {step === 2 && <div className="editor-body">
      <div className="editor-tab"><span>●</span> app.js <span>Live editor</span></div>
      <pre><code><span className="code-comment">// A small idea, brought to life.</span>{'\n\n'}<span className="code-purple">const</span> greeting = <span className="code-green">"Hello, world."</span>;{'\n\n'}<span className="code-purple">function</span> welcome(name) {'{'}{'\n'}  <span className="code-purple">return</span> `Hello, ${'{'}name{'}'}!`;{'\n'}{'}'}{'\n\n'}console.log(welcome(<span className="code-green">"builder"</span>));</code></pre>
      <div className="editor-output"><span>CONSOLE <b>✓ Ran successfully</b></span><p>Hello, builder!</p></div>
      <div className="devy-note"><img src="/devy.svg" alt="" /><p><strong>Devy is right here.</strong><br />Highlight a line. Let’s work through it.</p></div>
    </div>}
    {step === 3 && <div className="preview-body">
      <span className="preview-label">BUILT BY YOU</span><h4>Your work speaks for itself.</h4>
      <div className="project-art"><div className="project-orbit" /><span>My first<br /><strong>real project.</strong></span><span className="project-live">↗ Live project</span></div>
      <div className="submission"><div><span className="submission-icon">↗</span><p><strong>Personal portfolio</strong><br /><span>Live link attached</span></p><b>✓</b></div><div><span className="submission-icon">≡</span><p><strong>What I learned</strong><br /><span>Reflection added</span></p><b>✓</b></div></div>
      <div className="review-note">Ready for feedback <span>→</span></div>
    </div>}
    {step === 4 && <div className="preview-body">
      <span className="preview-label">LOOK HOW FAR YOU’VE COME</span><h4>It all adds up.</h4>
      <div className="progress-summary"><div><strong>1,240</strong><span>XP earned</span></div><img src="/devy-celebration.svg" alt="Devy celebrating your progress" /></div>
      <div className="week-progress">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <div key={i} className={i < 5 ? 'complete' : ''}><span>{day}</span><b>{i < 5 ? '✓' : '·'}</b></div>)}</div>
      <div className="preview-row progress-streak"><strong>5 days. Still building.</strong><span>Keep your streak going ↗</span></div>
      <div className="milestone"><span>✳</span><div><strong>First project shipped</strong><p>That’s more than a lesson completed.</p></div></div>
    </div>}
  </div>
);

const ProductTour = () => {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>(".tour-chapter"));
    const intro = root.querySelector<HTMLElement>(".tour-intro")!;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      intro.classList.toggle("is-visible", media.matches || intro.getBoundingClientRect().top < height * 0.8);
      for (const scene of scenes) {
        // Trigger a complete transition, even if the visitor stops scrolling here.
        scene.classList.toggle("is-focused", media.matches || scene.getBoundingClientRect().top < height * 0.2);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <section ref={rootRef} id="how-it-works" className="product-tour" aria-labelledby="product-tour-title">
      <header className="tour-intro">
        <span className="scene-eyebrow">Inside Devspace</span>
        <h2 id="product-tour-title">From “what should I learn?”<br /><span>to “look what I built.”</span></h2>
        <p>One place to find your direction. And follow it through.</p>
        <a href="#paths" className="tour-start">Explore the experience <span aria-hidden="true">↓</span></a>
      </header>
      {STEPS.map((step, i) => (
        <section key={step.id} id={step.id} className={`tour-chapter ${i % 2 ? 'is-reversed' : ''} ${i === 2 ? 'is-dark' : ''}`} aria-labelledby={`${step.id}-title`}>
          <div className="tour-stage">
            <div className="chapter-meta"><span>Inside Devspace</span><span>0{i + 1} <i>/</i> 05</span></div>
            <div className="tour-copy">
              <span className="scene-eyebrow">{step.kicker}</span>
              <h3 id={`${step.id}-title`}>{step.title}</h3>
              <p>{step.copy}</p>
              <span className="chapter-note">{step.note}</span>
            </div>
            <figure className="tour-visual"><Preview step={i} /><figcaption>Illustrative preview <span>Devspace / {step.kicker}</span></figcaption></figure>
            <nav className="chapter-nav" aria-label={`${step.kicker}: product tour chapters`}>
              {STEPS.map((item, j) => <a key={item.id} href={`#${item.id}`} aria-label={item.kicker} aria-current={j === i ? 'step' : undefined}><span>0{j + 1}</span><i /></a>)}
            </nav>
          </div>
        </section>
      ))}
      <div className="tour-end"><span className="scene-eyebrow">Your next chapter</span><h2>Start with a little direction.<br />See how far you can go.</h2><a href="#paths">Find your path <span aria-hidden="true">↗</span></a><img src="/devy.svg" alt="" /></div>
    </section>
  );
};

export default ProductTour;
