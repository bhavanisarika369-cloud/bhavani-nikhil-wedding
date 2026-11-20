const gate = document.querySelector('#gate');
const story = document.querySelector('#story');
const openButton = document.querySelector('#open');
const replay = document.querySelector('#replay');
const revealButton = document.querySelector('#reveal');
const statusText = document.querySelector('#status');
const tiles = [...document.querySelectorAll('.tile')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const bouquet = document.querySelector('.sparkles');
for (let i = 0; i < 18; i++) {
  const star = document.createElement('i');
  star.textContent = '✦';
  star.style.cssText = 'left:' + (9 + (i * 37) % 82) + '%;top:' + (12 + (i * 29) % 74) + '%;animation-delay:-' + (i * .53) + 's;font-size:' + (8 + i % 10) + 'px';
  bouquet.append(star);
}
const petals = document.querySelector('.petals');
for (let n = 0; n < 11; n++) {
  const petal = document.createElement('i');
  petal.style.setProperty('--x', (4 + n * 37 % 91) + '%');
  petal.style.setProperty('--drift', (n % 2 ? -1 : 1) * (14 + n * 5) + 'px');
  petal.style.setProperty('--duration', (6.5 + n % 4) + 's');
  petal.style.setProperty('--delay', (n * .47 - 1.2) + 's');
  petal.style.setProperty('--size', (6 + n % 5) + 'px');
  petals.append(petal);
}
let observer;
const completed = new Set();
function uncover(tile) {
  if (completed.has(tile)) return;
  completed.add(tile);
  tile.classList.add('done');
  if (completed.size === tiles.length) {
    statusText.textContent = 'Friday, 11 December 2026';
    revealButton.hidden = true;
  }
}
function prepareScratch(tile) {
  const surface = tile.querySelector('canvas');
  const ctx = surface.getContext('2d', {willReadFrequently:true});
  if (!ctx) { uncover(tile); return; }
  surface.width = surface.height = 240;
  const foil = ctx.createLinearGradient(0,0,240,200);
  ['#aa844a','#f9e7b5','#c8a568','#f9e9c5','#b69054'].forEach((c,i)=>foil.addColorStop(i/4,c));
  ctx.fillStyle = foil;
  ctx.fillRect(0,0,240,240);
  for(let i=0;i<1800;i++){
    ctx.fillStyle=i%2?'#fff8':'#8b713b40';
    ctx.fillRect(Math.random()*240,Math.random()*240,1,1);
  }
  ctx.strokeStyle='#fff4ce';ctx.strokeRect(8,8,224,224);
  ctx.fillStyle='#8b6935';ctx.font='42px Georgia';ctx.textAlign='center';ctx.fillText('❦',120,135);
  ctx.globalCompositeOperation='destination-out';ctx.lineCap='round';ctx.lineWidth=46;
  let active=null, last=null;
  function erase(event) {
    const rect=surface.getBoundingClientRect();
    const x=(event.clientX-rect.left)*240/rect.width, y=(event.clientY-rect.top)*240/rect.height;
    ctx.beginPath();ctx.moveTo(last?.x??x,last?.y??y);ctx.lineTo(x+.01,y+.01);ctx.stroke();last={x,y};
  }
  let previousCheck = 0;
  function check() {
    const pixels=ctx.getImageData(0,0,240,240).data;
    let clear=0;
    for(let i=3;i<pixels.length;i+=64){if(pixels[i]<50)clear++;}
    if(clear>pixels.length/64*.36)uncover(tile);
  }
  surface.onpointerdown=e=>{active=e.pointerId;last=null;surface.setPointerCapture(active);erase(e)};
  surface.onpointermove=e=>{if(active===e.pointerId){erase(e);if(e.timeStamp - previousCheck > 90){check();previousCheck=e.timeStamp}}};
  surface.onlostpointercapture=()=>{active=null;last=null;check()};
}
function showCover(){
  observer?.disconnect(); story.classList.remove('arrive'); story.hidden=true; gate.hidden=false;
  completed.clear();statusText.textContent='';revealButton.hidden=false;
  openButton.classList.remove('opening');openButton.disabled=false;
  window.scrollTo({top:0,behavior:'instant'});
}
openButton.onclick=()=>{
  openButton.disabled=true;openButton.classList.add('opening');
  setTimeout(()=>{
    gate.hidden=true;story.hidden=false;story.classList.add('arrive');
    window.scrollTo({top:0,behavior:'instant'});
    tiles.forEach(tile=>{tile.classList.remove('done');prepareScratch(tile)});
    if ('IntersectionObserver' in window && !reduced.matches) {
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}
      }),{threshold:.08});
      document.querySelectorAll('.rise').forEach(el=>{el.classList.remove('in');el.classList.add('waiting');observer.observe(el)});
    }
    const heading=document.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});
  },reduced.matches?0:1450);
};
revealButton.onclick=()=>tiles.forEach(uncover);
replay.hidden=false;replay.onclick=()=>{showCover();openButton.focus({preventScroll:true})};
showCover();

