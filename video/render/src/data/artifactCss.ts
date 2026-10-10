// Genere depuis la CSS de l'artifact source — ne pas editer a la main.
// Les unites cqw et l'aspect-ratio 16/9 d'origine sont conserves tels quels.
export const ARTIFACT_CSS = `
:root{
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
  --page:#E8EDF4; --text:#14213D; --muted:#55627A; --panel:#FFFFFF; --line:#C9D3E1;
  --ink:#14213D; --ink2:#1D2F52; --ink3:#26406B; --paper:#F4F7FB;
  --sun:#F2B33D; --teal:#3FB8AF; --rose:#EE6C6C; --sky:#8FB8FF;
  --head:"Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif;
  --body:"Atkinson Hyperlegible",ui-sans-serif,system-ui,sans-serif;
  --mono:"JetBrains Mono",ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){--page:#0E1626;--text:#E6ECF5;--muted:#9AA8C0;--panel:#16223A;--line:#2A3A5A}
}
:root[data-theme="dark"]{--page:#0E1626;--text:#E6ECF5;--muted:#9AA8C0;--panel:#16223A;--line:#2A3A5A}
*,*::before,*::after{box-sizing:inherit}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;background:var(--page);color:var(--text);font-family:var(--body);line-height:1.5}
.wrap{max-width:1100px;margin:0 auto;padding:20px 16px 40px}
header.top{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
header.top h1{font-family:var(--head);font-weight:800;font-size:clamp(22px,3.2vw,34px);margin:0;letter-spacing:-.02em}
header.top p{margin:0;color:var(--muted)}
/* ---------- Lecteur ---------- */
.player{background:var(--ink);border-radius:18px;overflow:hidden;box-shadow:0 18px 40px -20px rgba(20,33,61,.55)}
.stage{position:relative;aspect-ratio:16/9;container-type:inline-size;background:
  radial-gradient(circle at 85% 10%,rgba(63,184,175,.18),transparent 45%),
  radial-gradient(circle at 10% 95%,rgba(242,179,61,.14),transparent 45%),var(--ink);
  color:var(--paper);overflow:hidden}
.stage.paused *{animation-play-state:paused!important}
.caption{background:#0F1A31;color:#fff;font-size:clamp(14px,1.7vw,18px);padding:14px 20px;min-height:4.6em;border-top:1px solid #22355A}
.bar{height:6px;background:#22355A;cursor:pointer;position:relative}
.bar i{position:absolute;inset:0 auto 0 0;width:0;background:var(--sun)}
.controls{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#0F1A31;color:#fff;flex-wrap:wrap}
.controls button,.controls select{font:600 14px var(--body);background:#22355A;color:#fff;border:0;border-radius:10px;padding:8px 12px;cursor:pointer}
.controls button:hover{background:var(--ink3)}
.controls button:focus-visible,.controls select:focus-visible,.chap button:focus-visible,.bigplay:focus-visible{outline:3px solid var(--sun);outline-offset:2px}
.controls .count{margin-left:auto;color:#B9C6DD;font-size:14px}
.controls #playBtn{background:var(--sun);color:var(--ink);min-width:110px}
.bigplay{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,33,61,.72);border:0;cursor:pointer;z-index:5;color:#fff;font-family:var(--head)}
.bigplay span{display:flex;flex-direction:column;align-items:center;gap:1.4cqw}
.bigplay b{width:12cqw;height:12cqw;border-radius:50%;background:var(--sun);display:grid;place-items:center;color:var(--ink);font-size:5cqw;padding-left:1cqw}
.bigplay em{font-style:normal;font-size:2.2cqw}
/* ---------- Chapitres ---------- */
.chap{margin-top:18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;list-style:none;padding:0}
.chap button{width:100%;text-align:left;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:15px var(--body);cursor:pointer;display:flex;gap:10px;align-items:baseline}
.chap button small{color:var(--muted);font-variant-numeric:tabular-nums;min-width:1.6em}
.chap button[aria-current="true"]{border-color:var(--sun);box-shadow:inset 4px 0 0 var(--sun)}
.note{color:var(--muted);font-size:14px;margin-top:14px}
/* ---------- Scènes (unités en cqw = % de la largeur de l'écran vidéo) ---------- */
.scene{position:absolute;inset:0;padding:4.5cqw 6cqw;display:flex;flex-direction:column;gap:2cqw}
.scene.center{justify-content:center;align-items:center;text-align:center}
.step{font-family:var(--head);font-weight:600;font-size:1.6cqw;color:var(--teal)}
.h{font-family:var(--head);font-weight:800;font-size:4.4cqw;line-height:1.05;margin:0;letter-spacing:-.02em}
.hero{font-family:var(--head);font-weight:800;font-size:11cqw;line-height:.9;margin:0;letter-spacing:-.05em;color:var(--sun)}
.lead{font-size:2.2cqw;color:#C8D4EA;max-width:60cqw;margin:0}
.row{display:flex;gap:2.2cqw;align-items:center;justify-content:center;flex:1}
.col{display:flex;flex-direction:column;gap:1.4cqw}
.box{background:var(--ink2);border:.15cqw solid var(--ink3);border-radius:1.4cqw;padding:1.8cqw 2cqw;font-size:1.9cqw;line-height:1.35}
.box b{display:block;font-family:var(--head);font-size:2.3cqw;margin-bottom:.4cqw}
.box.sun{border-color:var(--sun)}
.box.teal{border-color:var(--teal)}
.box.rose{border-color:var(--rose)}
.emoji{font-size:5cqw;line-height:1;display:block;margin-bottom:.6cqw}
.arrow{font-size:3.4cqw;color:var(--sun);font-family:var(--head);font-weight:800}
.tag{display:inline-block;background:var(--sun);color:var(--ink);font-weight:700;border-radius:.8cqw;padding:.2cqw .9cqw;font-size:1.6cqw}
.file{font-family:var(--mono);font-size:1.35cqw;color:var(--sky);margin-bottom:.5cqw}
.code{font-family:var(--mono);font-size:1.6cqw;line-height:1.55;background:#0B1730;border:.15cqw solid var(--ink3);border-radius:1.2cqw;padding:1.6cqw 2cqw;margin:0;white-space:pre;overflow:hidden}
.code .k{color:var(--sky)}
.code .j{color:var(--sun);font-weight:600}
.code .s{color:#9FE0A4}
.code .c{color:#7A8BAA;font-style:italic}
.code .p{color:var(--teal)}
.term{font-family:var(--mono);font-size:1.55cqw;line-height:1.6;background:#08101F;border-radius:1.2cqw;padding:1.6cqw 2cqw;margin:0;white-space:pre;overflow:hidden}
.term .p{color:var(--teal)}
.term .ok{color:#9FE0A4}
.term .dim{color:#7A8BAA}
.tree{font-family:var(--mono);font-size:1.75cqw;line-height:1.6;white-space:pre;margin:0}
.tree .d{color:var(--sky)}
.tree .x{color:#7A8BAA}
.messy{position:relative;flex:1}
.messy .f{position:absolute;background:var(--ink2);border:.15cqw dashed var(--rose);border-radius:.8cqw;padding:.8cqw 1.2cqw;font-family:var(--mono);font-size:1.45cqw}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:2.4cqw;flex:1;align-items:start}
.check{display:flex;gap:1cqw;align-items:center;font-size:2cqw}
.check i{font-style:normal;width:3cqw;height:3cqw;border-radius:50%;display:grid;place-items:center;background:var(--teal);color:var(--ink);font-weight:800;font-size:1.8cqw;flex:none}
/* Une seule mise en scène : chaque élément .a entre à son tour, calé sur la narration */
.a{opacity:0;animation:enter .7s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:var(--d,0s)}
@keyframes enter{from{opacity:0;transform:translateY(1.6cqw)}
to{opacity:1;transform:none}
}
.draw{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 1.1s ease forwards;animation-delay:var(--d,0s)}
@keyframes draw{to{stroke-dashoffset:0}
}
.blink::after{content:"▍";animation:blink 1s steps(1) infinite;color:var(--sun)}
@keyframes blink{50%{opacity:0}
}
@media (prefers-reduced-motion:reduce){.a,.draw{animation-duration:.01s}
.blink::after{animation:none}
}
`;
