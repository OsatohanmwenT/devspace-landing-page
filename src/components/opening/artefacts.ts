// Learning artefact cards (spec §13). HTML/CSS only, generic, no third-party logos.
// Thumbnails are marked placeholders (asset A10 still to be made or sourced).

export type CardKey =
  | 'video' | 'roadmap' | 'thread' | 'chat' | 'course' | 'design'
  | 'chat2' | 'repo' | 'snippet' | 'video2' | 'plan' | 'tabs' | 'sticky';

const ph = (label: string) => `<span class="ph">Placeholder · ${label}</span>`;

export function cardMarkup(k: CardKey): { cls: string; html: string } {
  switch (k) {
    case 'video':
      return {
        cls: '',
        html: `<div class="thumb">${ph('video still')}<span class="play"></span><span class="dur">11:42:08</span></div>
        <div class="bar"><i style="width:9%"></i></div>
        <div class="pad"><p class="ttl">Full-stack web dev in one video</p><div class="meta">Saved to Watch later</div></div>`,
      };
    case 'video2':
      return {
        cls: '',
        html: `<div class="thumb">${ph('video still')}<span class="play"></span><span class="dur">42:17</span></div>
        <div class="pad"><p class="ttl">Stop learning React. Learn this instead</p><div class="meta">Recommended for you</div></div>`,
      };
    case 'roadmap':
      return {
        cls: '',
        html: `<div class="pad"><div class="row"><span class="doc"></span><div><p class="ttl">frontend-roadmap-2026.pdf</p><div class="meta">42 pages · Downloads</div></div></div>
        <div class="mini"><i></i><b></b><i></i><b></b><i></i></div></div>`,
      };
    case 'thread':
      return {
        cls: '',
        html: `<div class="pad"><div class="row"><span class="av"></span><div style="flex:1"><div class="ln" style="width:48%;margin:0"></div><div class="ln" style="width:30%"></div></div><span class="bm"></span></div>
        <p class="ttl" style="margin-top:10px">27 resources every developer should bookmark</p><div class="meta">Saved · 1.2k reposts</div></div>`,
      };
    case 'chat':
      return {
        cls: '',
        html: `<div class="pad"><div class="bub me">What should I learn after JavaScript?</div>
        <div class="bub ai"><div class="ln" style="width:92%"></div><div class="ln" style="width:84%"></div><div class="ln" style="width:88%"></div><div class="ln"></div></div></div>`,
      };
    case 'chat2':
      return { cls: '', html: `<div class="pad"><div class="bub me" style="margin-left:0">Is my code good enough?</div></div>` };
    case 'course':
      return {
        cls: '',
        html: `<div class="thumb" style="aspect-ratio:3/1">${ph('course cover')}</div>
        <div class="pad"><p class="ttl">Data analysis bootcamp</p><div class="meta">Lesson 2 of 64</div><div class="pb"><i style="width:3%"></i></div></div>`,
      };
    case 'design':
      return {
        cls: '',
        html: `<div class="frames" aria-hidden="true"><div></div><div></div><div></div></div>${''}
        <div class="pad"><p class="ttl">portfolio-final-v2</p><div class="meta">Edited 3 weeks ago · ${'placeholder preview'}</div></div>`,
      };
    case 'repo':
      return { cls: '', html: `<div class="pad"><div class="repo">todo-app (forked)</div><div class="meta">Updated 5 months ago · 0 commits since fork</div></div>` };
    case 'snippet':
      return {
        cls: '',
        html: `<div class="code"><span class="k">const</span> todos = [];
<span class="k">function</span> add(t) {
  todos.push(t);
}
<span class="c">// TODO: finish this</span>
add(<span class="k">"learn"</span>);</div>`,
      };
    case 'plan':
      return {
        cls: 'note',
        html: `<div class="pad"><p class="ttl">Learning plan v4</p><div class="chk x">HTML &amp; CSS</div><div class="chk x">JavaScript basics</div><div class="chk">Pick a framework</div><div class="chk">Build something</div></div>`,
      };
    case 'tabs':
      return {
        cls: 'tabs',
        html: ['React tutorial for beginners', 'Is Python better than JS?', 'Roadmap 2026 (new)', 'Best courses to get hired', 'How long to learn coding?', 'Tailwind in 100 seconds', 'freeCodeCamp vs Udemy']
          .map((t, i) => `<div class="tab" style="top:${i * 9}px;left:${i * 6}px;right:${-i * 6}px">${t}</div>`)
          .join(''),
      };
    case 'sticky':
      return { cls: 'sticky', html: `<div class="pad">Start again Monday</div>` };
  }
}
