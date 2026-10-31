(function(){
"use strict";
/* 새 버전이 배포되면 오래된 화면 대신 최신 화면을 불러오기 */
const BUILD="202611010112";
(async()=>{try{const r=await fetch("version.txt?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;const nv=(await r.text()).trim();
  if(nv&&nv!==BUILD){const u=new URL(location.href);if(u.searchParams.get("v")!==nv){u.searchParams.set("v",nv);location.replace(u.toString());}}}catch(e){}})();
const $=id=>document.getElementById(id);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const toastEl=$("toast");let toastT;
function toast(msg,ms=3600){toastEl.textContent=msg;toastEl.classList.remove("hide");clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.add("hide"),ms);}
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};

/* ---------- 시계 ---------- */
function tick(){const d=new Date();const h=d.getHours(),m=d.getMinutes();
  const part=h<5?"새벽":h<12?"오전":h<18?"오후":"밤";const hh=h%12===0?12:h%12;
  $("clock").textContent=`${part} ${hh}시 ${String(m).padStart(2,"0")}분`;}
tick();setInterval(tick,15000);
setTimeout(()=>{$("hint").style.opacity="0";},15000);

/* ---------- 패널 ---------- */
const PANELS=[...document.querySelectorAll(".panel")].map(p=>p.id);
const panelBtns=[...document.querySelectorAll("[data-p]")];
function openPanel(id){PANELS.forEach(p=>{$(p).hidden=(p!==id);});
  panelBtns.forEach(b=>{const on=!$(b.dataset.p).hidden;if(b.classList.contains("chip"))b.setAttribute("aria-expanded",String(on));else b.setAttribute("aria-pressed",String(on));});}
function togglePanel(id){openPanel($(id).hidden?id:null);}
document.querySelectorAll(".ph").forEach(ph=>{const x=$("xTpl").content.firstElementChild.cloneNode(true);x.addEventListener("click",()=>openPanel(null));ph.append(x);});
panelBtns.forEach(b=>b.addEventListener("click",()=>{togglePanel(b.dataset.p);}));
let userDim=0,sleepDim=0;
function applyDim(){$("dim").style.opacity=String(Math.max(userDim,sleepDim));}
$("dimR").addEventListener("input",e=>{userDim=Number(e.target.value);applyDim();});
const segPick=(wrap,btn)=>wrap.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));
$("policyLink").addEventListener("click",()=>{openPanel("pInfo");$("policy").open=true;setTimeout(()=>{try{$("policy").scrollIntoView({block:"start",behavior:"smooth"});}catch(e){}},60);});

/* ---------- 처음 온 사람을 위한 안내 ---------- */
const TOUR=[
 {t:"어서 와요, 정말 반가워요",b:"잠이 오지 않는 밤이죠? 괜찮아요. 여기는 같은 밤을 보내는 사람들이 조용히 머물다 가는 작은 쉼터예요. 제가 천천히 둘러보는 법을 알려 드릴게요. 1분이면 충분해요."},
 {t:"마음 가는 곳으로 걸어 봐요",b:"풀밭 아무 곳이나 톡 누르면 내 캐릭터가 아장아장 걸어가요. 화면을 끌면 둘레를 둘러볼 수 있고, 오른쪽 [+] [−] 버튼이나 마우스 휠로 가까이, 멀리 볼 수 있어요. 화면을 위로 끌거나 [☆]를 누르면 별과 오로라가 흐르는 하늘을 올려다볼 수 있어요. 오른쪽 위 [장소]를 누르면 꽃밭 언덕이나 텐트 마을로 데려다줄게요.",hi:[".zoom",'.topright [data-p="pPlaces"]']},
 {t:"편한 자세로 쉬어요",b:"아래 [명상]을 누르면 자리에 앉아요. 머리 위로 마음을 다독이는 문장이 천천히 떠오를 거예요. [눕기]를 누르면 이불을 덮고 누워요. 1분쯤 지나면 화면도 살며시 어두워져요. [표현]으로 손을 흔들거나 하품도 할 수 있어요.",hi:[".bottom .pose"]},
 {t:"혼자가 아니에요",b:"지금 함께 깨어 있는 사람들도 작은 캐릭터로 보여요. 누군가를 누르면 [토닥이기]로 하트를 보낼 수 있고, 숨 고르는 사람과는 같은 박자로 숨을 쉴 수도 있어요. 걷다 보면 저 같은 숲 요정과 반딧불 친구들이 다가와 말을 걸 거예요. 반갑게 맞아 주세요."},
 {t:"잠이 오도록 도와줄게요",b:"[음악]에는 빗소리, 파도, 피아노, 기도할 때 듣기 좋은 소리까지 있어요. 잠들기 타이머도 걸 수 있어요. [숨 고르기], [양 세기], 100편의 잠자리 [이야기]도 준비해 두었어요. 머릿속이 복잡하면 [걱정 태우기]로 모닥불에 살짝 넣어 버려요. 그 말은 저장되지 않고 불꽃과 함께 사라져요.",hi:[".bottom .tools"]},
 {t:"마음을 나눠도 괜찮아요",b:"[등불 달기]로 누군가에게 건넬 따뜻한 한마디를 나무에 걸 수 있어요. 오른쪽 위 [마음 우체통]에는 방명록과 사연함이 있어요. 이름 없이 익명으로 저장되고, 다른 사람들이 안아 주거나 답장을 남겨 줄 거예요. 내 글은 언제든 지울 수 있어요.",hi:['.topright [data-p="pBoard"]','.bottom .tools [data-p="pNote"]']},
 {t:"마지막으로, 나를 꾸며 봐요",b:"오른쪽 위 [내 모습]에서 토끼, 고양이, 펭귄처럼 좋아하는 모습과 색을 골라 보세요. 이 안내는 [안내]에서 언제든 다시 볼 수 있어요. 마음이 많이 힘든 밤에는 109나 1577-0199에서 24시간 이야기를 들어 줘요. 그럼, 편안한 밤 보내요.",hi:['.topright [data-p="pLook"]','.topright [data-p="pInfo"]']}];
let tourI=0;
TOUR.forEach(()=>$("tourDots").append(document.createElement("i")));
function richText(node,str){node.replaceChildren();str.split(/(\[[^\]]+\])/).forEach(part=>{if(/^\[.*\]$/.test(part)){const s=document.createElement("span");s.className="kbd";s.textContent=part.slice(1,-1);node.append(s);}else if(part)node.append(document.createTextNode(part));});}
function clearHi(){document.querySelectorAll(".tour-hi").forEach(e=>e.classList.remove("tour-hi"));}
function tourShow(i){tourI=Math.max(0,Math.min(TOUR.length-1,i));const s=TOUR[tourI];
  $("tourTitle").textContent=s.t;richText($("tourBody"),s.b);$("tourStep").textContent=`${tourI+1} / ${TOUR.length}`;
  [...$("tourDots").children].forEach((d,j)=>d.classList.toggle("on",j===tourI));
  clearHi();(s.hi||[]).forEach(q=>document.querySelectorAll(q).forEach(e=>e.classList.add("tour-hi")));
  $("tourPrev").hidden=tourI===0;$("tourSkip").hidden=tourI===TOUR.length-1;$("tourNext").textContent=tourI===TOUR.length-1?"시작하기":"다음";}
function tourOpen(){openPanel(null);$("hint").style.opacity="0";$("tour").hidden=false;tourShow(0);try{$("tourNext").focus({preventScroll:true});}catch(e){}}
function tourClose(){$("tour").hidden=true;clearHi();store.set("shelter.tour","done");}
$("tourNext").addEventListener("click",()=>{if(tourI>=TOUR.length-1){tourClose();toast("편안한 밤 보내요. 언제든 [안내]에서 다시 볼 수 있어요".replace(/[\[\]]/g,""),3800);}else tourShow(tourI+1);});
$("tourPrev").addEventListener("click",()=>tourShow(tourI-1));
$("tourSkip").addEventListener("click",tourClose);
$("tourAgain").addEventListener("click",tourOpen);
addEventListener("keydown",e=>{if($("tour").hidden)return;if(e.key==="Escape")tourClose();else if(e.key==="ArrowRight")$("tourNext").click();else if(e.key==="ArrowLeft"&&tourI>0)tourShow(tourI-1);});
if(store.get("shelter.tour")!=="done")setTimeout(tourOpen,1400);


/* ---------- 달님의 응원 ---------- */
const MOON_LINES=["오늘 하루도 여기까지 온 당신, 정말 애썼어요","잠이 오지 않아도 괜찮아요. 눈을 감고 쉬는 것만으로도 몸은 회복하고 있어요",
 "지금 이 시간, 당신 혼자 깨어 있는 게 아니에요","내일 일은 내일의 당신이 잘 해낼 거예요","생각이 많은 밤이에요. 오늘은 여기 내려놓고 가요",
 "당신의 속도로 천천히 가도 괜찮아요","완벽하지 않아도 충분히 좋은 하루였어요","숨을 한 번 길게 내쉬어 볼까요","당신이 있어서 이 밤이 조금 더 따뜻해요",
 "애쓰지 않아도 돼요. 그냥 여기 있어도 돼요","밤은 결국 지나가고, 아침은 꼭 와요","오늘 못다 한 일은 내일로 미뤄도 괜찮아요","어깨에 들어간 힘을 조금만 풀어 보세요",
 "누군가에게 당신은 이미 큰 위로예요","잘 자지 못해도, 당신은 잘하고 있어요","따뜻한 이불 속처럼 이 밤이 당신을 감싸 주기를","걱정은 구름처럼 흘러가게 두어요",
 "오늘의 당신에게 고맙다고 말해 주세요","조금 느려도, 조금 서툴러도 괜찮아요","달은 오늘 밤 내내 당신 곁에 있을게요","힘든 마음을 꺼내 놓은 것만으로도 용기예요",
 "오늘 웃었던 순간 하나를 떠올려 봐요","당신은 생각보다 훨씬 단단한 사람이에요","쉬어 가는 것도 앞으로 가는 일이에요"];
let moonQ=shuffle(MOON_LINES),moonOn=store.get("shelter.moon")!=="0";
$("moonOn").checked=moonOn;
$("moonOn").addEventListener("change",e=>{moonOn=e.target.checked;store.set("shelter.moon",moonOn?"1":"0");});
function nextMoon(){if(!moonQ.length)moonQ=shuffle(MOON_LINES);const el=$("moonMsg");el.style.opacity="0";
  setTimeout(()=>{$("moonText").textContent=moonQ.pop();el.style.opacity="1";},1600);}
$("moonText").textContent=moonQ.pop();setInterval(nextMoon,17000);

/* ---------- 명상 문구 ---------- */
const MED_LINES=["들이쉬는 숨에 고요를, 내쉬는 숨에 긴장을 내보내요","지금 이 순간에 머물러요","생각이 떠오르면 그저 바라보고 흘려보내요",
 "몸이 바닥에 닿는 무게를 느껴 보세요","어깨가 천천히 내려가요","턱과 혀의 힘을 풀어요","나는 지금 안전한 곳에 있어요",
 "아무것도 하지 않아도 괜찮은 시간이에요","숨은 저절로 들어오고 저절로 나가요","마음은 하늘, 생각은 지나가는 구름","이마와 눈가가 부드럽게 풀려요",
 "따뜻함이 가슴에서 손끝으로 번져요","지금 들리는 소리를 하나씩 알아차려요","나에게 조금 더 친절하게","잘하려고 하지 않아도 돼요",
 "내쉬는 숨을 조금 더 길게","모든 것은 지나가요","나는 이대로 충분해요","배가 부풀고 가라앉는 것을 느껴요","오늘의 나를 그대로 안아 줘요"];
let medQ=shuffle(MED_LINES),medShownAt=0;
function nextMed(){if(!medQ.length)medQ=shuffle(MED_LINES);const el=$("medPhrase");el.style.opacity="0";
  setTimeout(()=>{el.textContent=medQ.pop();el.style.opacity="1";},1400);}

/* =========================================================
   음악: WebAudio로 실시간 합성 (외부 파일 없음)
   ========================================================= */
let actx=null,master=null,bus=null;
function noiseBuffer(sec,type){const len=Math.floor(actx.sampleRate*sec),b=actx.createBuffer(2,len,actx.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let last=0,b0=0,b1=0,b2=0;
    for(let i=0;i<len;i++){const w=Math.random()*2-1;
      if(type==="brown"){last=(last+0.02*w)/1.02;d[i]=last*3.2;}
      else if(type==="pink"){b0=.99765*b0+w*.099;b1=.963*b1+w*.2965;b2=.57*b2+w*1.0526;d[i]=(b0+b1+b2+w*.1848)*.2;}
      else d[i]=w;}}
  return b;}
function initAudio(){if(actx)return;
  actx=new (window.AudioContext||window.webkitAudioContext)();
  master=actx.createGain();master.gain.value=Number($("vol").value);master.connect(actx.destination);
  bus=actx.createGain();bus.connect(master);
  const conv=actx.createConvolver();const len=actx.sampleRate*4.2,ir=actx.createBuffer(2,len,actx.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4);}
  conv.buffer=ir;const wet=actx.createGain();wet.gain.value=.5;bus.connect(conv);conv.connect(wet);wet.connect(master);}
const mtof=m=>440*Math.pow(2,(m-69)/12);
const rnd=(a,b)=>a+Math.random()*(b-a);const pickR=a=>a[Math.floor(Math.random()*a.length)];
function tone(out,t,freq,dur,opt={}){const o=actx.createOscillator();if(opt.wave)o.setPeriodicWave(opt.wave);else o.type=opt.type||"sine";o.frequency.value=freq;if(opt.detune)o.detune.value=opt.detune;
  const g=actx.createGain();const a=opt.attack||.008,peak=opt.gain||.2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05);}
function bell(out,t,f,partials,decay,gain){partials.forEach(([r,g,dm])=>{tone(out,t,f*r,decay*(dm||1),{gain:gain*g,attack:.004});tone(out,t,f*r+.9,decay*(dm||1)*.9,{gain:gain*g*.5,attack:.004});});}
function noiseHit(out,t,buf,freq,q,gain,dur){const s=actx.createBufferSource();s.buffer=buf;const bp=actx.createBiquadFilter();bp.type="bandpass";bp.frequency.value=freq;bp.Q.value=q;
  const g=actx.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(bp);bp.connect(g);g.connect(out);s.start(t);s.stop(t+dur+.05);}
function makeTrack(def){return{...def,on:false,gain:null,timer:null,next:0,nodes:[]};}
const ORGAN_V={C:[48,55,64,72],C2:[48,55,60,67],F:[41,57,65,69],G:[43,55,62,71],G2:[43,59,62,67],Am:[45,57,64,72],Em:[40,55,64,67],Dm:[38,57,65,69]};
const TRACKS=[
  /* 자연의 소리 */
  makeTrack({group:"자연의 소리",name:"창밖 빗소리",desc:"처마에 떨어지는 잔잔한 비",
    build(tr){const src=actx.createBufferSource();src.buffer=noiseBuffer(5,"pink");src.loop=true;const hp=actx.createBiquadFilter();hp.type="highpass";hp.frequency.value=500;
      const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=5200;const g=actx.createGain();g.gain.value=.55;src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(tr.gain);src.start();tr.nodes.push(src);
      tr.drop=noiseBuffer(.05,"white");tr.next=actx.currentTime+.2;},
    sched(tr,until){while(tr.next<until){noiseHit(tr.gain,tr.next,tr.drop,rnd(1400,4400),6,.12*Math.random(),.05);tr.next+=rnd(.03,.15);}}}),
  makeTrack({group:"자연의 소리",name:"파도",desc:"밀려왔다 빠지는 밤바다",
    build(tr){const src=actx.createBufferSource();src.buffer=noiseBuffer(6,"pink");src.loop=true;const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=700;
      const sw=actx.createGain();sw.gain.value=.08;src.connect(lp);lp.connect(sw);sw.connect(tr.gain);src.start();tr.nodes.push(src);tr.sw=sw;tr.lp=lp;tr.next=actx.currentTime+.3;},
    sched(tr,until){while(tr.next<until){const t=tr.next;tr.sw.gain.setTargetAtTime(.9,t,1.3);tr.lp.frequency.setTargetAtTime(1700,t,1.2);
      tr.sw.gain.setTargetAtTime(.07,t+3.4,1.9);tr.lp.frequency.setTargetAtTime(550,t+3.4,2.2);tr.next+=rnd(7.5,11);}}}),
  makeTrack({group:"자연의 소리",name:"풀벌레와 바람",desc:"풀숲의 낮은 바람과 귀뚜라미",
    build(tr){const src=actx.createBufferSource();src.buffer=noiseBuffer(6,"brown");src.loop=true;const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=380;
      const g=actx.createGain();g.gain.value=.5;const lfo=actx.createOscillator();lfo.frequency.value=.07;const lg=actx.createGain();lg.gain.value=.3;lfo.connect(lg);lg.connect(g.gain);
      src.connect(lp);lp.connect(g);g.connect(tr.gain);src.start();lfo.start();tr.nodes.push(src,lfo);tr.next=actx.currentTime+.5;},
    sched(tr,until){while(tr.next<until){const t=tr.next;const f=rnd(4300,4800);const pan=actx.createStereoPanner?actx.createStereoPanner():null;
      const out=pan?(pan.pan.value=rnd(-.8,.8),pan.connect(tr.gain),pan):tr.gain;
      const n=2+Math.floor(Math.random()*3);for(let i=0;i<n;i++)tone(out,t+i*.07,f,.05,{gain:.018,attack:.004});tr.next+=rnd(.6,2.8);}}}),
  makeTrack({group:"자연의 소리",name:"모닥불 소리",desc:"타닥타닥 장작 타는 소리",
    build(tr){const src=actx.createBufferSource();src.buffer=noiseBuffer(4,"brown");src.loop=true;const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=900;
      const g=actx.createGain();g.gain.value=.35;src.connect(lp);lp.connect(g);g.connect(tr.gain);src.start();tr.nodes.push(src);tr.crack=noiseBuffer(.03,"white");tr.next=actx.currentTime+.3;},
    sched(tr,until){while(tr.next<until){const t=tr.next;const n=Math.random()<.3?3:1;for(let i=0;i<n;i++)noiseHit(tr.gain,t+i*.04,tr.crack,rnd(900,3400),2,rnd(.25,.55),.03);tr.next+=rnd(.12,1);}}}),
  /* 잔잔한 음악 */
  makeTrack({group:"잔잔한 음악",name:"별빛 피아노",desc:"느리게 떨어지는 맑은 음",
    build(tr){const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2400;lp.connect(tr.gain);tr.out=lp;tr.idx=4;tr.next=actx.currentTime+.3;},
    sched(tr,until){const S=[50,54,57,59,62,64,66,69,71,74];
      while(tr.next<until){const t=tr.next;tr.idx=Math.max(0,Math.min(S.length-1,tr.idx+pickR([-2,-1,-1,0,1,1,2])));
        const m=S[tr.idx];tone(tr.out,t,mtof(m),4.2,{type:"triangle",gain:.11});tone(tr.out,t,mtof(m+12),2.2,{gain:.025});
        if(Math.random()<.22){const base=pickR([38,45,43,40]);tone(tr.out,t,mtof(base),6,{gain:.09,attack:.03});tone(tr.out,t+.04,mtof(base+7),5,{gain:.05,attack:.03});}
        tr.next+=1.1+Math.random()*2.4+(Math.random()<.15?2.5:0);}}}),
  makeTrack({group:"잔잔한 음악",name:"오르골",desc:"작은 상자 속 자장 선율",
    build(tr){const dl=actx.createDelay(1);dl.delayTime.value=.42;const fb=actx.createGain();fb.gain.value=.32;const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=3600;
      lp.connect(tr.gain);lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(tr.gain);tr.out=lp;tr.step=0;tr.next=actx.currentTime+.3;},
    sched(tr,until){const MEL=[81,0,76,78,81,0,83,81,78,0,76,0,73,0,0,0,76,0,78,81,85,0,83,0,81,78,76,0,78,0,0,0,73,0,76,78,76,0,73,71,69,0,71,73,76,0,0,0,78,0,81,0,78,76,73,0,71,0,73,0,69,0,0,0];
      while(tr.next<until){const m=MEL[tr.step%MEL.length];const t=tr.next;
        if(m){tone(tr.out,t,mtof(m),1.9,{gain:.07,attack:.003});tone(tr.out,t,mtof(m+12),.7,{gain:.022,attack:.002});tone(tr.out,t,mtof(m)*2.76,.35,{gain:.008,attack:.002});}
        if(tr.step%16===0)tone(tr.out,t,mtof(57),3,{gain:.04});tr.step++;tr.next+=.5+(Math.random()-.5)*.04;}}}),
  makeTrack({group:"잔잔한 음악",name:"포근한 앰비언트",desc:"구름처럼 번지는 화음",
    build(tr){const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2600;lp.connect(tr.gain);tr.out=lp;tr.ci=0;tr.next=actx.currentTime+.05;},
    sched(tr,until){const CH=[[50,62,66,69,74],[47,59,62,66,71],[43,59,62,67,71],[45,57,61,64,69]];
      while(tr.next<until){const t=tr.next;CH[tr.ci%4].forEach((m,i)=>{[0,7].forEach(dt=>{const o=actx.createOscillator();o.type=i===0?"sine":"triangle";o.frequency.value=mtof(m);o.detune.value=dt-3;
          const peak=i===0?.04:.085;const g=actx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+1.4);g.gain.linearRampToValueAtTime(peak*.8,t+7.5);g.gain.linearRampToValueAtTime(0,t+10.5);
          o.connect(g);g.connect(tr.out);o.start(t);o.stop(t+10.7);});});
        tone(tr.out,t+.6+Math.random()*3,mtof(CH[tr.ci%4][4]+12),4,{gain:.05,attack:.02});
        tr.ci++;tr.next+=8;}}}),
  makeTrack({group:"잔잔한 음악",name:"싱잉볼",desc:"오래 울리다 사라지는 명상 종",
    build(tr){tr.next=actx.currentTime+.4;},
    sched(tr,until){while(tr.next<until){const t=tr.next;const f=pickR([196,220,174.6]);
      [[1,.12,12],[2.76,.05,8],[5.4,.02,5],[8.9,.008,3]].forEach(([r,g,d])=>{tone(tr.gain,t,f*r,d,{gain:g,attack:.01});tone(tr.gain,t,f*r,d,{gain:g*.6,attack:.01,detune:6});});
      tr.next+=rnd(10,17);}}}),
  /* 신앙 */
  makeTrack({group:"신앙",name:"기도 오르간",desc:"기독교 · 예배당의 잔잔한 성가 화음",
    build(tr){const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1900;lp.connect(tr.gain);tr.out=lp;
      tr.wave=actx.createPeriodicWave(new Float32Array([0,0,0,0,0,0,0,0]),new Float32Array([0,1,.55,.32,.22,.12,.07,.05]));tr.q=[];tr.next=actx.currentTime+.3;},
    sched(tr,until){const PA=["C","F","C2","G","Am","F","G2","C2"],PB=["C","Am","Dm","G","Em","F","G","C2"],PC=["F","C","Dm","Am","F","C2","G2","C"];
      while(tr.next<until){if(!tr.q.length){tr.q=pickR([PA,PB,PC]).slice();tr.q.push("rest");}
        const k=tr.q.shift();if(k==="rest"){tr.next+=3.5;continue;}const t=tr.next,dur=tr.q.length===1?5.6:4.2;
        ORGAN_V[k].forEach((m,i)=>{const o=actx.createOscillator();o.setPeriodicWave(tr.wave);o.frequency.value=mtof(m);const g=actx.createGain();const peak=i===0?.04:.028;
          g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.5);g.gain.setValueAtTime(peak,t+dur-.2);g.gain.linearRampToValueAtTime(0,t+dur+.7);
          o.connect(g);g.connect(tr.out);o.start(t);o.stop(t+dur+.8);});tr.next+=dur;}}}),
  makeTrack({group:"신앙",name:"그레고리오 성가 풍",desc:"천주교 · 성당에 울리는 단선율 노래",
    build(tr){const o1=actx.createOscillator(),o2=actx.createOscillator();o1.type=o2.type="sawtooth";o1.frequency.value=mtof(62);o2.frequency.value=mtof(50);
      const mix=actx.createGain();mix.gain.value=1;const g1=actx.createGain();g1.gain.value=.55;const g2=actx.createGain();g2.gain.value=.4;o1.connect(g1);o2.connect(g2);g1.connect(mix);g2.connect(mix);
      const vg=actx.createGain();vg.gain.value=0;mix.connect(vg);
      [[700,5,.9],[1150,7,.45],[2500,9,.15]].forEach(([f,q,w])=>{const bp=actx.createBiquadFilter();bp.type="bandpass";bp.frequency.value=f;bp.Q.value=q;const fg=actx.createGain();fg.gain.value=w*.6;vg.connect(bp);bp.connect(fg);fg.connect(tr.gain);});
      const lfo=actx.createOscillator();lfo.frequency.value=4.8;const lg=actx.createGain();lg.gain.value=7;lfo.connect(lg);lg.connect(o1.detune);lg.connect(o2.detune);
      const drone=actx.createGain();drone.gain.value=.025;drone.connect(tr.gain);const d1=actx.createOscillator();d1.frequency.value=mtof(38);const d2=actx.createOscillator();d2.frequency.value=mtof(45);d1.connect(drone);d2.connect(drone);
      [o1,o2,lfo,d1,d2].forEach(n=>{n.start();tr.nodes.push(n);});tr.o1=o1;tr.o2=o2;tr.vg=vg;tr.next=actx.currentTime+.5;},
    sched(tr,until){const SC=[57,60,62,64,65,67,69,72];
      while(tr.next<until){let t=tr.next;let idx=pickR([2,4,6]);const n=5+Math.floor(Math.random()*5);tr.vg.gain.setTargetAtTime(.13,t,.3);
        for(let i=0;i<n;i++){const m=SC[idx];tr.o1.frequency.setTargetAtTime(mtof(m),t,.07);tr.o2.frequency.setTargetAtTime(mtof(m-12),t,.07);t+=pickR([.8,1,1,1.3]);idx=Math.max(0,Math.min(7,idx+pickR([-1,-1,0,1,1,-2,2])));}
        const end=pickR([62,69]);tr.o1.frequency.setTargetAtTime(mtof(end),t,.1);tr.o2.frequency.setTargetAtTime(mtof(end-12),t,.1);t+=2.6;tr.vg.gain.setTargetAtTime(0,t-.7,.5);tr.next=t+rnd(2.5,4.5);}}}),
  makeTrack({group:"신앙",name:"성당 종소리",desc:"천주교 · 멀리서 셋씩 울리는 삼종",
    build(tr){tr.n=0;tr.next=actx.currentTime+.4;},
    sched(tr,until){const P=[[.5,.5,2.2],[1,.6,1],[1.19,.35,.8],[1.5,.25,.7],[2,.2,.6],[2.51,.12,.45],[3,.08,.35]];
      while(tr.next<until){bell(tr.gain,tr.next,329.6,P,7,.16);tr.n++;tr.next+=(tr.n%3===0)?rnd(18,26):3.2;}}}),
  makeTrack({group:"신앙",name:"목탁과 풍경",desc:"불교 · 산사의 목탁과 처마 끝 풍경",
    build(tr){tr.click=noiseBuffer(.03,"white");tr.beat=0;tr.next=actx.currentTime+.4;tr.chime=actx.currentTime+2;},
    sched(tr,until){while(tr.next<until){const t=tr.next;const o=actx.createOscillator();o.frequency.setValueAtTime(640,t);o.frequency.exponentialRampToValueAtTime(430,t+.06);
        const g=actx.createGain();g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(tr.gain);o.start(t);o.stop(t+.2);
        noiseHit(tr.gain,t,tr.click,1800,3,.08,.02);tr.beat++;tr.next+=(tr.beat%18===0)?rnd(6,9):.95;}
      while(tr.chime<until){const t=tr.chime;const n=1+Math.floor(Math.random()*3);
        for(let i=0;i<n;i++)bell(tr.gain,t+i*rnd(.15,.5),pickR([1760,2093,2349,2637]),[[1,.5],[2.76,.2,.6],[5.4,.08,.4]],3,.05);tr.chime+=rnd(3,9);}}}),
  makeTrack({group:"신앙",name:"산사의 범종",desc:"불교 · 깊고 길게 퍼지는 큰 종",
    build(tr){tr.thud=noiseBuffer(.3,"brown");tr.next=actx.currentTime+.4;},
    sched(tr,until){while(tr.next<until){const t=tr.next;bell(tr.gain,t,58,[[1,.9,1],[2,.45,.8],[2.76,.3,.6],[3.2,.18,.5],[4.1,.1,.35],[5.4,.05,.25]],24,.2);
      noiseHit(tr.gain,t,tr.thud,180,1,.5,.25);tr.next+=rnd(26,34);}}}),
];
function startTrack(tr){initAudio();if(actx.state==="suspended")actx.resume();
  tr.gain=actx.createGain();tr.gain.gain.value=0;tr.gain.connect(bus);tr.gain.gain.setTargetAtTime(1,actx.currentTime,.8);tr.nodes=[];tr.build(tr);
  const run=()=>{tr.sched(tr,actx.currentTime+1.8);};run();tr.timer=setInterval(run,400);tr.on=true;}
function stopTrack(tr){if(!tr.on)return;tr.on=false;clearInterval(tr.timer);const g=tr.gain;g.gain.setTargetAtTime(0,actx.currentTime,.6);
  const nodes=tr.nodes;setTimeout(()=>{nodes.forEach(n=>{try{n.stop();}catch(e){}});try{g.disconnect();}catch(e){}},4000);}
{const groups={};TRACKS.forEach(tr=>{if(!groups[tr.group]){const h=document.createElement("h3");h.textContent=tr.group;const w=document.createElement("div");w.className="tracks";$("trackGroups").append(h,w);groups[tr.group]=w;}
  const b=document.createElement("button");b.className="track";b.setAttribute("aria-pressed","false");
  const nm=document.createElement("b");nm.textContent=tr.name;const ds=document.createElement("span");ds.textContent=tr.desc;b.append(nm,ds);
  b.addEventListener("click",()=>{try{if(tr.on)stopTrack(tr);else startTrack(tr);}catch(e){toast("이 브라우저에서는 소리를 만들 수 없어요.");return;}
    b.setAttribute("aria-pressed",String(tr.on));if(tr.on&&timerEnd)restoreMaster();musicStarted=true;store.set("shelter.music",TRACKS.some(t=>t.on)?"on":"off");updateNowPlaying();});
  tr.btn=b;groups[tr.group].append(b);});}
$("vol").addEventListener("input",()=>{$("volText").textContent=`${Math.round(Number($("vol").value)*10)} / 10`;store.set("shelter.vol",$("vol").value);if(master)master.gain.setTargetAtTime(Number($("vol").value),actx.currentTime,.2);});
/* ---------- 지금 흐르는 음악 표시, 기본 음악 ---------- */
const DEFAULT_TRACK="포근한 앰비언트";let musicStarted=false,lastOn=[];
try{const v=store.get("shelter.vol");if(v!==null&&isFinite(Number(v)))$("vol").value=v;}catch(e){}
$("volText").textContent=`${Math.round(Number($("vol").value)*10)} / 10`;
function updateNowPlaying(){const on=TRACKS.filter(t=>t.on);const np=$("np");np.classList.toggle("playing",on.length>0);
  $("npName").textContent=on.length?on[0].name+(on.length>1?` 외 ${on.length-1}개`:""):(musicStarted?"음악이 꺼져 있어요":"화면을 누르면 음악이 흘러요");
  $("npMute").setAttribute("aria-label",on.length?"음악 끄기":"음악 켜기");
  $("npIcon").innerHTML=on.length?'<path d="M3 8v4h3l4 3V5L6 8H3z"/><path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10"/>':'<path d="M3 8v4h3l4 3V5L6 8H3z"/><path d="M13 8l4 4M17 8l-4 4"/>';
  document.querySelectorAll('.tools [data-p="pMusic"]').forEach(b=>b.classList.toggle("playing",on.length>0));}
function setTrackOn(tr,on){try{if(on&&!tr.on)startTrack(tr);else if(!on&&tr.on)stopTrack(tr);}catch(e){return;}tr.btn.setAttribute("aria-pressed",String(tr.on));}
function startDefaultMusic(){if(musicStarted)return;musicStarted=true;
  if(store.get("shelter.music")==="off"){updateNowPlaying();return;}
  const tr=TRACKS.find(t=>t.name===DEFAULT_TRACK);if(tr)setTrackOn(tr,true);updateNowPlaying();
  $("np").classList.add("intro");setTimeout(()=>$("np").classList.remove("intro"),6200);
  setTimeout(()=>toast("포근한 앰비언트가 잔잔하게 흘러요 · 오른쪽 음악 표시로 바꿀 수 있어요",5200),400);}
let unlockEl=null;
function silentWav(){const sr=8000,n=sr/2,b=new ArrayBuffer(44+n*2),v=new DataView(b);const w=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
  w(0,"RIFF");v.setUint32(4,36+n*2,true);w(8,"WAVEfmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,n*2,true);
  return URL.createObjectURL(new Blob([b],{type:"audio/wav"}));}
function unlockAudio(){try{if(!unlockEl){unlockEl=new Audio(silentWav());unlockEl.loop=true;unlockEl.setAttribute("playsinline","");unlockEl.volume=.01;}
    const p=unlockEl.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}
  if(actx&&actx.state!=="running"){try{actx.resume();}catch(e){}}}
["pointerdown","pointerup","touchend","click","keydown"].forEach(ev=>addEventListener(ev,()=>{unlockAudio();if(!musicStarted)startDefaultMusic();else if(actx&&actx.state!=="running"&&TRACKS.some(t=>t.on)){try{actx.resume();}catch(e){}}},{capture:true,passive:true}));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&actx&&actx.state!=="running"&&TRACKS.some(t=>t.on)){try{actx.resume();}catch(e){}}});
$("npMain").addEventListener("click",()=>togglePanel("pMusic"));
$("npMute").addEventListener("click",e=>{e.stopPropagation();const on=TRACKS.filter(t=>t.on);
  if(on.length){lastOn=on;on.forEach(t=>setTrackOn(t,false));store.set("shelter.music","off");}
  else{const list=lastOn.length?lastOn:[TRACKS.find(t=>t.name===DEFAULT_TRACK)];list.forEach(t=>setTrackOn(t,true));store.set("shelter.music","on");if(timerEnd)restoreMaster();}
  musicStarted=true;updateNowPlaying();});
updateNowPlaying();

let timerEnd=0;
function restoreMaster(){if(master)master.gain.setTargetAtTime(Number($("vol").value),actx.currentTime,.3);}
$("timer").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{segPick($("timer"),b);const m=Number(b.dataset.m);timerEnd=m?Date.now()+m*60000:0;restoreMaster();updTimer();}));
function updTimer(){if(!timerEnd){$("timerState").textContent="";return;}
  const left=timerEnd-Date.now();
  if(left<=0){TRACKS.forEach(tr=>{stopTrack(tr);tr.btn.setAttribute("aria-pressed","false");});timerEnd=0;updateNowPlaying();
    segPick($("timer"),$("timer").querySelector('[data-m="0"]'));$("timerState").textContent="음악을 껐어요. 편히 자요.";restoreMaster();return;}
  if(left<120000&&master)master.gain.setTargetAtTime(Number($("vol").value)*left/120000,actx.currentTime,1);
  $("timerState").textContent=`${Math.ceil(left/60000)}분 뒤 천천히 꺼져요`;}
setInterval(updTimer,5000);

/* ---------- 숨 ---------- */
const CYCLE=["들이쉬기","머금기","내쉬기"];const CYCLE_LEN=19;
let breathStart=0,breathing=false;
const easeIO=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
function breathLevel(start,now){const t=(((now-start)/1000)%CYCLE_LEN+CYCLE_LEN)%CYCLE_LEN;
  if(t<4)return{l:easeIO(t/4),i:0,rem:4-t};if(t<11)return{l:1,i:1,rem:11-t};return{l:1-easeIO((t-11)/8),i:2,rem:CYCLE_LEN-t};}

/* ---------- 잠자리 이야기 (미리 지어 둔 100편) ---------- */
const THEMES=[["sea","바닷가 오두막"],["snow","눈 오는 숲"],["train","밤기차"],["bakery","고양이 빵집"],["star","별 닦는 사람"]];
const BED=window.BEDTIME_STORIES||{};
let storyTheme=THEMES.some(t=>t[0]===store.get("shelter.theme"))?store.get("shelter.theme"):"sea";
let storyIdx=-1;let readSet=new Set();try{readSet=new Set(JSON.parse(store.get("shelter.read")||"[]"));}catch(e){}
const themeLabel=k=>(THEMES.find(t=>t[0]===k)||["",""])[1];
const themeBtns=THEMES.map(([k,label])=>{const b=document.createElement("button");b.textContent=label;b.setAttribute("aria-pressed",String(k===storyTheme));
  b.addEventListener("click",()=>{segPick($("themes"),b);storyTheme=k;store.set("shelter.theme",k);showToc();});$("themes").append(b);return b;});
function syncThemeBtns(){themeBtns.forEach((b,j)=>b.setAttribute("aria-pressed",String(THEMES[j][0]===storyTheme)));}
function showToc(){storyIdx=-1;const list=BED[storyTheme]||[];const toc=$("storyToc");toc.replaceChildren();
  if(!list.length){$("storyState").textContent="이야기를 불러오지 못했어요";return;}
  list.forEach((s,i)=>{const li=document.createElement("li");const b=el("button","toc-item");
    b.append(el("span","toc-n",String(i+1)),el("span","toc-t",s.title));
    if(readSet.has(storyTheme+":"+i)){b.classList.add("read");b.append(el("span","toc-r","읽음"));}
    b.addEventListener("click",()=>openStory(i));li.append(b);toc.append(li);});
  toc.hidden=false;toc.scrollTop=0;$("storyIntro").hidden=false;$("storyTitle").hidden=true;$("storyText").hidden=true;
  $("storyPrev").hidden=true;$("storyBack").hidden=true;$("storyGo").textContent="아무 이야기나";
  const n=list.filter((_,i)=>readSet.has(storyTheme+":"+i)).length;
  $("storyState").textContent=`${themeLabel(storyTheme)} · ${list.length}편${n?` 중 ${n}편 읽음`:""}`;}
function openStory(i){const list=BED[storyTheme]||[];if(!list[i])return;storyIdx=i;const s=list[i];
  $("storyToc").hidden=true;$("storyIntro").hidden=true;
  $("storyTitle").textContent=s.title;$("storyTitle").hidden=false;$("storyText").textContent=s.body;$("storyText").hidden=false;$("storyText").scrollTop=0;
  readSet.add(storyTheme+":"+i);store.set("shelter.read",JSON.stringify([...readSet]));
  $("storyState").textContent=`${themeLabel(storyTheme)} · ${list.length}편 중 ${i+1}번째`;
  $("storyPrev").hidden=false;$("storyPrev").disabled=i===0&&THEMES[0][0]===storyTheme;$("storyBack").hidden=false;
  const last=i===list.length-1&&THEMES[THEMES.length-1][0]===storyTheme;$("storyGo").textContent=last?"처음 이야기로":"다음 이야기";}
function stepStory(d){const ti=THEMES.findIndex(t=>t[0]===storyTheme);const list=BED[storyTheme]||[];let i=storyIdx+d;
  if(i>=list.length){storyTheme=THEMES[(ti+1)%THEMES.length][0];i=0;}
  else if(i<0){if(ti===0)return;storyTheme=THEMES[ti-1][0];i=(BED[storyTheme]||[]).length-1;}
  store.set("shelter.theme",storyTheme);syncThemeBtns();openStory(i);}
$("storyGo").addEventListener("click",()=>{if(storyIdx<0){const list=BED[storyTheme]||[];if(!list.length)return;
  const unread=list.map((_,i)=>i).filter(i=>!readSet.has(storyTheme+":"+i));const pool=unread.length?unread:list.map((_,i)=>i);
  openStory(pool[Math.floor(Math.random()*pool.length)]);}else stepStory(1);});
$("storyPrev").addEventListener("click",()=>stepStory(-1));
$("storyBack").addEventListener("click",showToc);
setTimeout(showToc,0);

/* ---------- 마음 우체통 (방명록, 사연) · Supabase ---------- */
$("boardTabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{segPick($("boardTabs"),b);$("tabGuest").hidden=b.dataset.tab!=="guest";$("tabStory").hidden=b.dataset.tab!=="story";}));
const CFG=window.SHELTER_CONFIG||{};
const CONFIGURED=!!(CFG.supabaseUrl&&CFG.supabaseKey&&!/여기에/.test(CFG.supabaseKey)&&window.supabase&&window.supabase.createClient);
let db=null,myId=null,isOwner=false;
const DATA={guest:[],stories:[],replies:[],hugs:[],lanterns:[]};
let onLanternsChanged=()=>{};
function ago(ts){const m=Math.round((Date.now()-ts)/60000);if(m<1)return"방금";if(m<60)return`${m}분 전`;const h=Math.round(m/60);if(h<24)return`${h}시간 전`;return`${Math.round(h/24)}일 전`;}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
const tsOf=r=>Date.parse(r.created_at)||0;
function errMsg(err,what){const m=(err&&(err.message||err.details))||"";
  if(/rate_limited/.test(m))return "조금 쉬었다가 다시 남겨 주세요";
  if(/row-level|permission|JWT|not authenticated/i.test(m))return "지금은 남길 수 없어요. 잠시 뒤 다시 열어 주세요";
  if(/check constraint/i.test(m))return "글자 수를 확인해 주세요";
  return `${what} 못했어요. 다시 눌러 주세요`;}
let authFailed=false;
function needDb(stateEl){if(!db||!myId){stateEl.textContent=!CONFIGURED?"아직 저장 공간이 연결되지 않았어요":authFailed?"지금은 글을 남길 수 없어요. 읽기만 할 수 있어요":"연결하는 중이에요. 잠시 뒤 다시 눌러 주세요";return false;}return true;}
/* 글 읽기: 작성자 번호(user_id) 대신 "내 글인지(mine)"만 받아요.
   보기(…_pub)가 아직 없으면(003_hardening.sql 실행 전) 예전 방식으로 읽어요. */
let usePub=true;
async function readRows(table,cols,build){
  if(usePub){const r=await build(db.from(table+"_pub").select(cols+",mine"));
    if(!r.error)return r;
    if(r.error.code!=="PGRST205"&&r.error.code!=="42P01")return r;usePub=false;}
  const r=await build(db.from(table).select(cols+",user_id"));
  if(r.data)r.data.forEach(x=>{x.mine=!!myId&&x.user_id===myId;delete x.user_id;});
  return r;}
async function refresh(table){if(!db)return;
  if(table==="lanterns"){const {data,error}=await readRows("lanterns","id,body,created_at",q=>q.eq("hidden",false).order("created_at",{ascending:false}).limit(150));if(!error){DATA.lanterns=data||[];onLanternsChanged();}}
  else if(table==="guestbook"){const {data,error}=await readRows("guestbook","id,body,created_at",q=>q.eq("hidden",false).order("created_at",{ascending:false}).limit(80));if(!error){DATA.guest=data||[];renderGuest();}}
  else{const {data,error}=await readRows("stories","id,body,created_at",q=>q.eq("hidden",false).order("created_at",{ascending:false}).limit(60));if(error)return;DATA.stories=data||[];
    const ids=DATA.stories.map(r=>r.id);DATA.replies=[];DATA.hugs=[];
    if(ids.length){const [r1,r2]=await Promise.all([readRows("replies","id,story_id,body,created_at",q=>q.eq("hidden",false).in("story_id",ids).order("created_at",{ascending:true}).limit(1000)),
      readRows("hugs","story_id",q=>q.in("story_id",ids).limit(5000))]);DATA.replies=r1.data||[];DATA.hugs=r2.data||[];}
    renderStories();}}
const refreshTimers={};function refreshSoon(t){clearTimeout(refreshTimers[t]);refreshTimers[t]=setTimeout(()=>refresh(t),400);}
async function report(table,id,btn){if(!needDb($("stState")))return;btn.disabled=true;
  const {error}=await db.from("reports").insert({target_table:table,target_id:id});
  if(error&&!/duplicate|unique/i.test(error.message||"")){btn.disabled=false;toast("신고하지 못했어요. 다시 눌러 주세요");return;}
  btn.textContent="신고했어요";toast("알려 주셔서 고마워요. 여러 사람이 신고하면 자동으로 가려져요");}
async function removeRow(table,row,btn,after){btn.disabled=true;
  const q=row.mine?db.from(table).delete().eq("id",row.id):db.from(table).update({hidden:true}).eq("id",row.id);
  const {error}=await q;if(error){btn.disabled=false;btn.textContent="지우지 못했어요";return;}
  refresh(table==="replies"?"stories":table);if(after)after();}
function rowActs(table,row,wrap,mine){
  if(db&&(row.mine||isOwner)){const d=el("button","link",row.mine?mine:"관리자로서 가리기");d.addEventListener("click",()=>removeRow(table,row,d));wrap.append(d);}
  if(db&&myId&&!row.mine){const r=el("button","link","신고");r.addEventListener("click",()=>report(table,row.id,r));wrap.append(r);}}
$("gbText").addEventListener("input",e=>{$("gbState").textContent=`${e.target.value.length} / 100`;});
$("stText").addEventListener("input",e=>{$("stState").textContent=`${e.target.value.length} / 1000`;});
let busy=false;
$("gbGo").addEventListener("click",async()=>{const v=$("gbText").value.trim();if(!v)return $("gbText").focus();if(!needDb($("gbState"))||busy)return;busy=true;$("gbGo").disabled=true;
  const {error}=await db.from("guestbook").insert({body:v.slice(0,100)});
  if(error)$("gbState").textContent=errMsg(error,"남기지");else{$("gbText").value="";$("gbState").textContent="남겼어요. 고마워요";refresh("guestbook");}
  busy=false;$("gbGo").disabled=false;});
$("stGo").addEventListener("click",async()=>{const v=$("stText").value.trim();if(!v)return $("stText").focus();if(!needDb($("stState"))||busy)return;busy=true;$("stGo").disabled=true;
  const {error}=await db.from("stories").insert({body:v.slice(0,1000)});
  if(error)$("stState").textContent=errMsg(error,"올리지");else{$("stText").value="";$("stState").textContent="사연을 올렸어요. 꺼내 놓은 것만으로도 큰 용기예요";refresh("stories");}
  busy=false;$("stGo").disabled=false;});
function renderGuest(){const list=$("gbList");list.replaceChildren();
  if(!DATA.guest.length){list.append(el("div","empty","아직 남겨진 글이 없어요. 첫 흔적을 남겨 주세요."));return;}
  DATA.guest.forEach(r=>{const e=el("div","entry");e.append(el("div","body",String(r.body).slice(0,100)));const m=el("div","meta");
    m.append(el("span",null,(r.mine?"나":"다녀간 이웃")+" · "+ago(tsOf(r))));const acts=el("div","acts");rowActs("guestbook",r,acts,"지우기");m.append(acts);e.append(m);list.append(e);});}
const replyDrafts=new Map();const expanded=new Set();
function renderStories(){const list=$("stList");
  list.querySelectorAll("textarea[data-k]").forEach(t=>replyDrafts.set(t.dataset.k,t.value));const focusK=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.k:null;
  const hugN=new Map(),myHugs=new Set(),reps=new Map();
  DATA.hugs.forEach(h=>{hugN.set(h.story_id,(hugN.get(h.story_id)||0)+1);if(h.mine)myHugs.add(h.story_id);});
  DATA.replies.forEach(r=>{if(!reps.has(r.story_id))reps.set(r.story_id,[]);reps.get(r.story_id).push(r);});
  list.replaceChildren();
  if(!DATA.stories.length){list.append(el("div","empty","아직 올라온 사연이 없어요."));return;}
  DATA.stories.forEach(r=>{const key=String(r.id);const text=String(r.body).slice(0,1000);const e=el("div","entry");
    e.append(el("div","body"+(expanded.has(key)?"":" clamp"),text));
    if(text.length>160||text.split("\n").length>5){const more=el("button","link",expanded.has(key)?"접기":"끝까지 읽기");more.addEventListener("click",()=>{if(expanded.has(key))expanded.delete(key);else expanded.add(key);renderStories();});e.append(more);}
    const m=el("div","meta");m.append(el("span",null,(r.mine?"내 사연":"익명의 사연")+" · "+ago(tsOf(r))));
    const acts=el("div","acts");const n=hugN.get(r.id)||0;const hb=el("button","btn ghost sm hug",`안아 주기${n?" "+n:""}`);hb.setAttribute("aria-pressed",String(myHugs.has(r.id)));
    hb.addEventListener("click",async()=>{if(!needDb($("stState")))return;hb.disabled=true;const has=myHugs.has(r.id);
      const {error}=has?await db.from("hugs").delete().eq("story_id",r.id):await db.from("hugs").insert({story_id:r.id});
      if(error)toast(errMsg(error,"전하지"));else{if(!has)toast("마음으로 꼭 안아 주었어요");refresh("stories");}hb.disabled=false;});
    acts.append(hb);rowActs("stories",r,acts,"내리기");m.append(acts);e.append(m);
    const rs=reps.get(r.id)||[];
    if(rs.length){const box=el("div","replies");rs.forEach(rp=>{const line=el("div","reply",String(rp.body).slice(0,200));line.append(el("span","small",(rp.mine?"나":"이웃")+" · "+ago(tsOf(rp))));
      const a=el("span","acts");a.style.marginLeft="6px";a.style.display="inline-flex";rowActs("replies",rp,a,"지우기");line.append(a);box.append(line);});e.append(box);}
    const form=el("div","replyform");const ta=el("textarea");ta.rows=1;ta.maxLength=200;ta.placeholder="따뜻한 답장 남기기";ta.dataset.k=key;ta.setAttribute("aria-label","답장");ta.value=replyDrafts.get(key)||"";
    const send=el("button","btn sm","보내기");send.addEventListener("click",async()=>{const v=ta.value.trim();if(!v)return ta.focus();if(!needDb($("stState")))return;send.disabled=true;
      const {error}=await db.from("replies").insert({story_id:r.id,body:v.slice(0,200)});
      if(error)toast(errMsg(error,"보내지"));else{replyDrafts.delete(key);ta.value="";refresh("stories");}send.disabled=false;});
    form.append(ta,send);e.append(form);list.append(e);if(focusK===key)ta.focus();});}


/* ---------- 방문자 수와 함께 머문 시간 ---------- */
const nf=n=>Number(n||0).toLocaleString("ko-KR");
function fmtDur(sec){sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);
  if(h>=100)return `${nf(h)}시간`;if(h>0)return `${h}시간 ${m}분`;return `${m}분`;}
function showStats(d){if(!d||typeof d!=="object")return;
  $("stats").textContent=`지금까지 ${nf(d.visitors)}명이 다녀갔어요 · 함께 머문 시간 ${fmtDur(d.seconds)}`;$("stats").hidden=false;
  $("stToday").textContent=`${nf(d.today)}명`;$("stAll").textContent=`${nf(d.visitors)}명`;$("stTime").textContent=fmtDur(d.seconds);$("stMine").textContent=fmtDur(d.mine_today);$("statsDl").hidden=false;}
async function pingStats(){if(!db)return;const visible=document.visibilityState==="visible";
  const {data,error}=await db.rpc(myId&&visible?"heartbeat":"stats");if(!error)showStats(data);}

/* ---------- Supabase 연결 (익명 로그인, 실시간 방, 저장소) ---------- */
const PEER=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
function makeRoom(client){const ch=client.channel("shelter-lobby",{config:{presence:{key:PEER},broadcast:{self:true}}});
  const H={peers:[],topics:{}};let last=null,joined=false;
  ch.on("presence",{event:"sync"},()=>{const st=ch.presenceState();
    const peers=Object.keys(st).map(k=>{const metas=st[k]||[];const m=metas[metas.length-1]||{};return{peer:k,presence:m,isMe:k===PEER,sameTab:k===PEER,kind:"viewer",guest:false,by:null};});
    H.peers.forEach(fn=>fn({peers,left:[],joined:[],updated:[]}));});
  ch.on("broadcast",{event:"warm"},({payload})=>{if(!payload||typeof payload.from!=="string")return;
    (H.topics.warm||[]).forEach(fn=>fn({topic:"warm",peer:payload.from,isMe:payload.from===PEER,sameTab:payload.from===PEER,data:{to:payload.to}}));});
  ch.subscribe(status=>{if(status==="SUBSCRIBED"){joined=true;if(last)ch.track(last);}});
  return{presence(obj){last=obj;return joined?Promise.resolve(ch.track(obj)):Promise.resolve();},
    emit(topic,data){return Promise.resolve(ch.send({type:"broadcast",event:topic,payload:{...data,from:PEER}}));},
    onPeers(fn){H.peers.push(fn);},on(topic,fn){(H.topics[topic]=H.topics[topic]||[]).push(fn);}};}
async function startSupabase(hooks){
  if(!CONFIGURED){["noteState","gbState","stState"].forEach(id=>{$(id).textContent="아직 저장 공간이 연결되지 않았어요";});return;}
  const client=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{db:{schema:"shelter"},auth:{persistSession:true,autoRefreshToken:true,storageKey:"dawn-shelter-auth"}});
  db=client;
  try{let {data:{session}}=await client.auth.getSession();
    if(!session){const r=await client.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session;}
    myId=session.user.id;$("myIdText").textContent=myId;}
  catch(e){authFailed=true;console.warn("익명 로그인 실패",e);["noteState","gbState","stState"].forEach(id=>{$(id).textContent="지금은 글을 남길 수 없어요. 읽기만 할 수 있어요";});}
  if(myId){try{const {data}=await client.from("admins").select("user_id").eq("user_id",myId);isOwner=!!(data&&data.length);}catch(e){}}
  ["lanterns","guestbook","stories"].forEach(refresh);
  client.channel("shelter-db")
    .on("postgres_changes",{event:"*",schema:"shelter",table:"lanterns"},()=>refreshSoon("lanterns"))
    .on("postgres_changes",{event:"*",schema:"shelter",table:"guestbook"},()=>refreshSoon("guestbook"))
    .on("postgres_changes",{event:"*",schema:"shelter",table:"stories"},()=>refreshSoon("stories"))
    .on("postgres_changes",{event:"*",schema:"shelter",table:"replies"},()=>refreshSoon("stories"))
    .on("postgres_changes",{event:"*",schema:"shelter",table:"hugs"},()=>refreshSoon("stories"))
    .subscribe();
  setInterval(()=>{["lanterns","guestbook","stories"].forEach(refreshSoon);},90000);
  pingStats();setInterval(pingStats,60000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")pingStats();});
  if(hooks)hooks.onRoom(makeRoom(client));}

/* =========================================================
   3D
   ========================================================= */
let renderer=null;const canvas=$("scene");
try{if(typeof THREE!=="undefined")renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"low-power"});}catch(e){renderer=null;}
if(!renderer){$("nogl").hidden=false;$("moonMsg").hidden=true;$("bToggle").addEventListener("click",()=>{breathing=!breathing;breathStart=Date.now();$("bToggle").textContent=breathing?"멈추기":"시작";});startSupabase(null);return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();
const FOG=new THREE.Color(0x10162c);
scene.fog=new THREE.FogExp2(FOG,0.012);
const camera=new THREE.PerspectiveCamera(50,1,0.1,700);
let narrow=false;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;narrow=w<h;camera.fov=narrow?64:50;camera.updateProjectionMatrix();}
addEventListener("resize",resize);resize();
const MOON=new THREE.Vector3(-16,27,-140);

scene.add(new THREE.HemisphereLight(0x6f7fbf,0x2a2416,.75));
const moonLight=new THREE.DirectionalLight(0xc8d0ff,.55);moonLight.position.copy(MOON);scene.add(moonLight);
const FIRE=new THREE.Vector3(2.5,0,-3);
const fireLight=new THREE.PointLight(0xff9a48,2.2,20,2);fireLight.position.set(FIRE.x,1.4,FIRE.z);scene.add(fireLight);

scene.add(new THREE.Mesh(new THREE.SphereGeometry(320,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{moonDir:{value:MOON.clone().normalize()}},
  vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;uniform vec3 moonDir;void main(){float h=clamp(vP.y,0.,1.);
    vec3 top=vec3(.03,.035,.09);vec3 hor=vec3(.11,.11,.2);vec3 c=mix(hor,top,pow(h,.5));
    float m=max(dot(vP,moonDir),0.);c+=vec3(.22,.19,.14)*pow(m,40.)+vec3(.05,.05,.07)*pow(m,6.);
    c+=vec3(.12,.07,.05)*pow(1.-h,9.);gl_FragColor=vec4(c,1.);}`})));
const starMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},pr:{value:renderer.getPixelRatio()},dim:{value:1}},
  vertexShader:`attribute float seed;varying float vA;uniform float t;uniform float pr;void main(){vA=.35+.65*(.5+.5*sin(t*(.4+seed*1.4)+seed*40.));
    gl_PointSize=(1.+seed*1.8)*pr;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying float vA;uniform float dim;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d)*vA*dim;gl_FragColor=vec4(vec3(1.,.95,.86)*a,a);}`});
{const N=1300,pos=new Float32Array(N*3),seed=new Float32Array(N);
 for(let i=0;i<N;i++){const th=Math.random()*Math.PI*2,ph=Math.acos(.05+Math.random()*.88);const r=290;
   pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);seed[i]=Math.random();}
 const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("seed",new THREE.BufferAttribute(seed,1));
 scene.add(new THREE.Points(g,starMat));}
function glowTex(stops){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");
  const g=x.createRadialGradient(64,64,0,64,64,64);stops.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
const TEX_CORE=glowTex([[0,"rgba(255,255,255,1)"],[.2,"rgba(255,238,210,.9)"],[.5,"rgba(255,200,140,.22)"],[1,"rgba(255,180,120,0)"]]);
const TEX_HALO=glowTex([[0,"rgba(255,220,170,.6)"],[.4,"rgba(255,190,120,.16)"],[1,"rgba(255,170,100,0)"]]);
const TEX_SOFT=glowTex([[0,"rgba(255,255,255,1)"],[.5,"rgba(255,255,255,.6)"],[1,"rgba(255,255,255,0)"]]);
const addSprite=(tex,opt)=>new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending},opt)));
const moonObj=new THREE.Group();moonObj.position.copy(MOON);scene.add(moonObj);
{const disk=addSprite(glowTex([[0,"rgba(255,248,232,1)"],[.36,"rgba(250,238,215,1)"],[.42,"rgba(240,225,200,.25)"],[1,"rgba(240,220,190,0)"]]),{fog:false,blending:THREE.NormalBlending});disk.scale.set(20,20,1);moonObj.add(disk);
 const halo=addSprite(TEX_HALO,{fog:false,opacity:.45});halo.scale.set(80,80,1);moonObj.add(halo);}

function ridge(z,height,color,seed){const seg=140,W=620,pos=[],idx=[];let s=seed;const rn=()=>{s=(s*9301+49297)%233280;return s/233280;};
  const amp=[];for(let k=0;k<5;k++)amp.push([rn()*6.28,.5+rn()*2.5*(k+1)]);
  for(let i=0;i<=seg;i++){const x=-W/2+W*i/seg;let y=0;amp.forEach((a,k)=>{y+=Math.sin(x*.012*a[1]+a[0])*height/(k+1.4);});y=Math.abs(y)*.7+height*.35;
    pos.push(x,-1,z,x,y,z);if(i<seg){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
  scene.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color})));}
ridge(-200,24,0x121830,7);ridge(-120,13,0x0e1426,21);ridge(-85,7,0x0b1120,42);

const GROUND_C=new THREE.Color(0x2c4236),SNOW_C=new THREE.Color(0x7d8a9a),GRASS_C=new THREE.Color(0x3f6150),GRASS_SNOW=new THREE.Color(0x8796a3);
const groundMat=new THREE.MeshLambertMaterial({color:0x2c4236});
const ground=new THREE.Mesh(new THREE.CircleGeometry(90,72),groundMat);ground.rotation.x=-Math.PI/2;scene.add(ground);
const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const RADIUS=46;
const hillMat=new THREE.MeshLambertMaterial({color:0x22362d});
for(let i=0;i<26;i++){const a=i/26*Math.PI*2+Math.random()*.1;const r=58+Math.random()*10;const s=5+Math.random()*6;if(Math.sin(a)>.25)continue;
  const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),hillMat);m.scale.set(s*1.6,s*.45,s);m.position.set(Math.cos(a)*r,-.5,Math.sin(a)*r);scene.add(m);}
const grassMat=new THREE.MeshLambertMaterial({color:0x3f6150});
{const geo=new THREE.ConeGeometry(.07,.42,4);geo.translate(0,.21,0);
 const N=2600,im=new THREE.InstancedMesh(geo,grassMat,N);const d=new THREE.Object3D();
 for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*54;const x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(Math.hypot(x-FIRE.x,z-FIRE.z)<2.2||z>40.5){i--;continue;}d.position.set(x,0,z);d.rotation.set((Math.random()-.5)*.4,Math.random()*3,(Math.random()-.5)*.4);d.scale.setScalar(.6+Math.random()*1.1);d.updateMatrix();im.setMatrixAt(i,d.matrix);}
 scene.add(im);
 const fgeo=new THREE.SphereGeometry(.07,6,4);
 [0xf7e6b5,0xe9c6e8,0xbfd8f5].forEach(c=>{const M=200,fm=new THREE.InstancedMesh(fgeo,new THREE.MeshBasicMaterial({color:c}),M);
   for(let i=0;i<M;i++){const a=Math.random()*Math.PI*2,r=3+Math.sqrt(Math.random())*48;{const zz=Math.sin(a)*r;d.position.set(Math.cos(a)*r,.28,zz>40?-zz*.8:zz);}d.rotation.set(0,0,0);d.scale.setScalar(.8+Math.random()*.6);d.updateMatrix();fm.setMatrixAt(i,d.matrix);}
   scene.add(fm);});}

const TREES=[{x:-7,z:-9,r:3.3,h:4.6},{x:9,z:-11,r:2.6,h:3.8},{x:-13,z:3,r:2.4,h:3.4},{x:12,z:4,r:2.2,h:3.2}];
const trunkMat=new THREE.MeshLambertMaterial({color:0x4a3628});const leafMat=new THREE.MeshToonMaterial({color:0x2f5a46});
const treeObjs=[];
function regTree(x,z,r,h,ms){const tm=trunkMat.clone(),lm=leafMat.clone();ms.forEach(m=>{m.material=m.material===trunkMat?tm:lm;});treeObjs.push({x,z,r,h,mats:[tm,lm],op:1});}
TREES.forEach(T=>{const tr=new THREE.Mesh(new THREE.CylinderGeometry(.28*T.r/3,.42*T.r/3,T.h,10),trunkMat);tr.position.set(T.x,T.h/2,T.z);scene.add(tr);const ms=[tr];
  [[0,0,0,1],[.55,-.35,.2,.72],[-.5,-.3,-.25,.7],[.1,.45,-.1,.66]].forEach(([dx,dy,dz,s])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(T.r*s,18,14),leafMat);m.position.set(T.x+dx*T.r,T.h+dy*T.r,T.z+dz*T.r);scene.add(m);ms.push(m);});regTree(T.x,T.z,T.r,T.h,ms);});

/* 마음 우체통 */
const MAILBOX=new THREE.Vector3(-3.2,0,-6.2);
const mailbox=new THREE.Group();mailbox.position.copy(MAILBOX);mailbox.rotation.y=.35;scene.add(mailbox);
{const wood=new THREE.MeshLambertMaterial({color:0x7a5a40});const red=new THREE.MeshToonMaterial({color:0xc4655a});
 const post=new THREE.Mesh(new THREE.BoxGeometry(.16,1.2,.16),wood);post.position.y=.6;mailbox.add(post);
 const box=new THREE.Mesh(new THREE.BoxGeometry(.75,.5,.55),red);box.position.y=1.42;mailbox.add(box);
 const roof=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.75,16,1,false,0,Math.PI),red);roof.rotation.z=Math.PI/2;roof.position.y=1.67;mailbox.add(roof);
 const slot=new THREE.Mesh(new THREE.BoxGeometry(.4,.05,.02),new THREE.MeshBasicMaterial({color:0x2a1a18}));slot.position.set(0,1.5,.28);mailbox.add(slot);
 const glow=addSprite(TEX_HALO,{color:0xffb070,opacity:.5});glow.scale.setScalar(2.6);glow.position.y=1.5;mailbox.add(glow);
 mailbox.traverse(o=>{o.userData={kind:"mailbox"};});}
const OBST=TREES.map(T=>({x:T.x,z:T.z,r:.9})).concat([{x:FIRE.x,z:FIRE.z,r:1.7},{x:MAILBOX.x,z:MAILBOX.z,r:.5}]);

const fireGroup=new THREE.Group();fireGroup.position.copy(FIRE);scene.add(fireGroup);
{const stoneMat=new THREE.MeshLambertMaterial({color:0x6b6670});
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const s=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),stoneMat);s.scale.set(1,.7,1);s.position.set(Math.cos(a)*.95,.12,Math.sin(a)*.95);fireGroup.add(s);}
 const logMat=new THREE.MeshLambertMaterial({color:0x5a3a24});
 for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,1.2,8),logMat);l.rotation.z=Math.PI/2;l.rotation.y=i*Math.PI/4;l.position.y=.14;fireGroup.add(l);}
 const benchMat=new THREE.MeshLambertMaterial({color:0x6a4a33});
 [[-3.2,.6,.4],[3.4,-.3,-.3],[.3,3.3,1.5]].forEach(([x,z,r])=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,1.8,10),benchMat);b.rotation.z=Math.PI/2;b.rotation.y=r;b.position.set(x,.28,z);fireGroup.add(b);});}
const flames=[];
[[0xff7a2e,.5,1.3,0],[0xffa645,.36,1.0,.1],[0xffe08a,.2,.66,.05]].forEach(([c,r,h,o])=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,10),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.92}));
  m.position.y=.2+h/2;m.position.x=o;fireGroup.add(m);flames.push({m,h});});
const fireGlow=addSprite(TEX_HALO,{opacity:.85,color:0xffa050});fireGlow.scale.set(7,7,1);fireGlow.position.y=.9;fireGroup.add(fireGlow);
const embers=[];let fireBoost=0;
function spawnEmber(n){for(let i=0;i<n;i++){const s=addSprite(TEX_CORE,{color:0xffb060});s.scale.setScalar(.18+Math.random()*.15);
  s.position.set(FIRE.x+(Math.random()-.5)*.6,.8,FIRE.z+(Math.random()-.5)*.6);scene.add(s);
  embers.push({s,v:new THREE.Vector3((Math.random()-.5)*.6,1.2+Math.random()*1.6,(Math.random()-.5)*.6),t0:performance.now(),life:1600+Math.random()*1800});}}

const FF_N=170;const ffPos=new Float32Array(FF_N*3);const ffSeed=[];
for(let i=0;i<FF_N;i++){const a=Math.random()*Math.PI*2,r=3+Math.random()*40;ffSeed.push({x:Math.cos(a)*r,z:Math.sin(a)*r,y:.6+Math.random()*2.4,p:Math.random()*10,s:.2+Math.random()*.5});}
const ffGeo=new THREE.BufferGeometry();ffGeo.setAttribute("position",new THREE.BufferAttribute(ffPos,3));
const ffMat=new THREE.PointsMaterial({size:.22,map:TEX_CORE,color:0xe8f59a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
scene.add(new THREE.Points(ffGeo,ffMat));

const WN=1100;const wPos=new Float32Array(WN*3);const wVel=new Float32Array(WN);
for(let i=0;i<WN;i++){wPos[i*3]=(Math.random()-.5)*44;wPos[i*3+1]=Math.random()*16;wPos[i*3+2]=(Math.random()-.5)*44;wVel[i]=.6+Math.random()*.8;}
const wGeo=new THREE.BufferGeometry();wGeo.setAttribute("position",new THREE.BufferAttribute(wPos,3));
const wMat=new THREE.PointsMaterial({size:.16,map:TEX_SOFT,color:0xffffff,transparent:true,depthWrite:false,opacity:.9});
const wPts=new THREE.Points(wGeo,wMat);wPts.frustumCulled=false;scene.add(wPts);
const rPos=new Float32Array(WN*6);const rGeo=new THREE.BufferGeometry();rGeo.setAttribute("position",new THREE.BufferAttribute(rPos,3));
const rLines=new THREE.LineSegments(rGeo,new THREE.LineBasicMaterial({color:0x9fb2d8,transparent:true,opacity:.45}));rLines.frustumCulled=false;scene.add(rLines);
let weather=store.get("shelter.weather")||"clear";
function setWeather(w){weather=w;store.set("shelter.weather",w);segPick($("weathers"),$("weathers").querySelector(`[data-w="${w}"]`));
  wPts.visible=w==="snow"||w==="petal";rLines.visible=w==="rain";
  if(w==="snow"){wMat.color.set(0xffffff);wMat.size=.17;}if(w==="petal"){wMat.color.set(0xffc2d4);wMat.size=.2;}}
$("weathers").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>setWeather(b.dataset.w)));
setWeather(["clear","snow","rain","petal"].includes(weather)?weather:"clear");

/* ---------- 하늘: 은하수와 오로라 ---------- */
{const N=2600,pos=new Float32Array(N*3),seed=new Float32Array(N);const tilt=new THREE.Euler(.5,.3,.9);const v=new THREE.Vector3();let k=0;
 for(let i=0;i<N*3&&k<N;i++){const a=Math.random()*Math.PI*2;const g=(Math.random()+Math.random()+Math.random()-1.5)*.16;v.set(Math.cos(a),g,Math.sin(a)).normalize().applyEuler(tilt);
   if(v.y<.04)continue;pos[k*3]=v.x*285;pos[k*3+1]=v.y*285;pos[k*3+2]=v.z*285;seed[k]=Math.random()*.55;k++;}
 const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos.subarray(0,k*3),3));g.setAttribute("seed",new THREE.BufferAttribute(seed.subarray(0,k),1));
 scene.add(new THREE.Points(g,starMat));}
const auroraMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  uniforms:{t:{value:0},amp:{value:.55}},
  vertexShader:`varying vec2 vUv;uniform float t;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.018+t*.08)*26.+sin(p.x*.05+t*.13)*6.;p.y+=sin(p.x*.03+t*.11)*5.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
  fragmentShader:`varying vec2 vUv;uniform float t;uniform float amp;void main(){
    float r=.5+.5*sin(vUv.x*90.+t*.5+sin(vUv.x*11.+t*.25)*4.);float rays=.35+.65*pow(r,2.5);
    float v=smoothstep(0.,.18,vUv.y)*(1.-smoothstep(.3,1.,vUv.y));float wave=.55+.45*sin(t*.17+vUv.x*7.);
    float edge=smoothstep(0.,.12,vUv.x)*(1.-smoothstep(.88,1.,vUv.x));
    vec3 c=mix(vec3(.15,1.,.55),vec3(.55,.35,1.),smoothstep(.25,.95,vUv.y));c=mix(c,vec3(.2,.9,.9),.25*sin(vUv.x*5.+t*.1));
    float a=v*rays*wave*edge*amp;gl_FragColor=vec4(c*a,a);}`});
const auroras=[[185,72,-20,300,70,0],[172,60,75,240,55,.4],[160,54,-115,220,50,-.45]].map(([x,y,z,w,h,ry])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h,140,1),auroraMat);m.position.set(x,y,z);m.rotation.set(0,-Math.PI/2+ry,0);m.rotateX(.25);scene.add(m);return m;});
/* 밝은 별과 별구름 */
const SKY_DIRS={moon:Math.atan2(-MOON.x,-MOON.z),aurora:-Math.PI/2,galaxy:2.35,sea:Math.PI};
const brightStars=[];
{const cols=[0xfff4e0,0xdfe8ff,0xffe0c8,0xd8f0ff,0xfff0f6];const mdir=MOON.clone().normalize();let tries=0;
 while(brightStars.length<80&&tries<800){tries++;const az=Math.random()*Math.PI*2,el=.15+Math.random()*1.25;
   const v=new THREE.Vector3(Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az));if(v.dot(mdir)>.97)continue;
   const s=addSprite(TEX_CORE,{color:pickR(cols),fog:false});const sc=1.6+Math.random()*2.6;s.scale.setScalar(sc);s.position.copy(v.multiplyScalar(270));scene.add(s);
   brightStars.push({s,ph:Math.random()*6,sp:.4+Math.random()*1.2,base:.55+Math.random()*.45});}}
const TEX_NEB=glowTex([[0,"rgba(255,255,255,.9)"],[.35,"rgba(255,255,255,.35)"],[.7,"rgba(255,255,255,.08)"],[1,"rgba(255,255,255,0)"]]);
const nebulae=[];
[[2.15,.55,0x7a5cff,150,.13],[2.45,.85,0x3fa8ff,120,.11],[2.7,.45,0xff6ab0,110,.09],[2.3,.32,0x8a5cff,90,.1],[2.55,1.05,0x3fd0c0,130,.08],[1.95,.8,0xb070ff,100,.08]].forEach(([az,el,c,sz,op])=>{
  const v=new THREE.Vector3(-Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el)).multiplyScalar(260);
  const s=addSprite(TEX_NEB,{color:c,opacity:op,fog:false});s.scale.set(sz*1.4,sz,1);s.position.copy(v);s.material.rotation=Math.random()*3;scene.add(s);nebulae.push({s,op,ph:Math.random()*6});});
let auroraOn=store.get("shelter.aurora")!=="0";
function setAurora(on){auroraOn=on;store.set("shelter.aurora",on?"1":"0");auroras.forEach(m=>m.visible=on);$("auroraOn").checked=on;}
$("auroraOn").addEventListener("change",e=>setAurora(e.target.checked));setAurora(auroraOn);


/* =========================================================
   캐릭터
   ========================================================= */
const BODY_COLORS=["#f6c6a8","#f5d77e","#b9dcb0","#a9c8f0","#d6b8ef","#f4b6c8","#ece4d4","#9fd8d6","#c9ae92","#8f9ab8"];
const SPECIES=[["round","동글이"],["rabbit","토끼"],["cat","고양이"],["bear","곰"],["penguin","펭귄"],["sheep","양"]];
const HATS=[[1,"수면 모자"],[2,"털모자"],[3,"새싹"],[4,"꽃 화관"],[5,"리본"],[0,"없음"]];
const ITEMS=[[0,"없음"],[1,"곰 인형"],[2,"작은 등불"],[3,"따뜻한 차"],[4,"베개"]];
const darkMat=new THREE.MeshBasicMaterial({color:0x2a2030});
const blushMat=new THREE.MeshBasicMaterial({color:0xff9fb0,transparent:true,opacity:.6});
const pinkMat=new THREE.MeshToonMaterial({color:0xf3a6b8});
const whiteMat=new THREE.MeshToonMaterial({color:0xfbf7ef});
const orangeMat=new THREE.MeshToonMaterial({color:0xf2a14a});
const shadowMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false});
const QUILTS=[0x8fa7d9,0xd99fb0,0xa7cfa0,0xe8c88e];
const S=(r,w=14,h=10)=>new THREE.SphereGeometry(r,w,h);
const geoBody=S(.55,24,18),geoHead=S(.5,24,18),geoEye=S(.055,10,8),geoFoot=S(.17,12,8),geoHand=S(.13,12,8),geoBlush=new THREE.CircleGeometry(.08,14);
function mesh(g,m,x=0,y=0,z=0,parent){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(parent)parent.add(o);return o;}

function makeChar(o){const root=new THREE.Group();const inner=new THREE.Group();root.add(inner);
  const sp=o.sp||"round";const bodyMat=new THREE.MeshToonMaterial({color:o.color});
  const body=mesh(geoBody,bodyMat,0,.62,0,inner);body.scale.set(1,1.02,.92);
  const head=new THREE.Group();head.position.y=1.38;inner.add(head);
  mesh(geoHead,bodyMat,0,0,0,head);
  const eyeZ=sp==="penguin"?.5:.45;
  const eyes=[-1,1].map(s=>mesh(geoEye,darkMat,s*.17,.04,eyeZ,head));
  [-1,1].forEach(s=>{const b=mesh(geoBlush,blushMat,s*.29,-.08,.425,head);b.rotation.y=s*.5;});
  const mouth=mesh(new THREE.TorusGeometry(.045,.012,6,12,Math.PI),darkMat,0,-.07,.48,head);mouth.rotation.z=Math.PI;
  let footMat=bodyMat;
  if(sp==="rabbit"){[-1,1].forEach(s=>{const e=mesh(S(.12),bodyMat,s*.17,.6,-.02,head);e.scale.set(.85,3.1,.6);e.rotation.z=-s*.15;
      const inr=mesh(S(.07),pinkMat,s*.17,.6,.04,head);inr.scale.set(.8,3.6,.4);inr.rotation.z=-s*.15;});mesh(S(.14),whiteMat,0,.45,-.5,inner);}
  else if(sp==="cat"){[-1,1].forEach(s=>{const e=mesh(new THREE.ConeGeometry(.17,.32,4),bodyMat,s*.27,.44,0,head);e.rotation.z=-s*.35;});
    const tail=mesh(new THREE.CylinderGeometry(.06,.07,.8,8),bodyMat,0,.55,-.62,inner);tail.rotation.x=-.9;mesh(S(.09),bodyMat,0,.85,-.95,inner);
    [-1,1].forEach(s=>{[-1,1].forEach(k=>{const w=mesh(new THREE.CylinderGeometry(.006,.006,.22,4),darkMat,s*.3,-.05+k*.03,.42,head);w.rotation.z=Math.PI/2+k*.12*s;});});}
  else if(sp==="bear"){[-1,1].forEach(s=>mesh(S(.15),bodyMat,s*.33,.37,0,head));
    const sn=mesh(S(.17),whiteMat,0,-.12,.42,head);sn.scale.set(1.15,.85,.7);mouth.position.set(0,-.16,.55);mesh(S(.05),darkMat,0,-.06,.55,head);}
  else if(sp==="penguin"){const face=mesh(S(.34),whiteMat,0,-.04,.2,head);face.scale.set(1.05,1,.85);
    const belly=mesh(S(.42),whiteMat,0,.58,.17,inner);belly.scale.set(1,1.05,.8);
    const beak=mesh(new THREE.ConeGeometry(.08,.18,8),orangeMat,0,-.07,.55,head);beak.rotation.x=Math.PI/2;mouth.visible=false;footMat=orangeMat;}
  else if(sp==="sheep"){[[0,.4,-.05,.2],[-.22,.33,0,.17],[.22,.33,0,.17],[-.12,.42,.15,.15],[.12,.42,.15,.15],[0,.3,-.25,.2]].forEach(([x,y,z,r])=>mesh(S(r),whiteMat,x,y,z,head));
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;mesh(S(.24),whiteMat,Math.cos(a)*.45,.62+Math.sin(i*1.7)*.18,Math.sin(a)*.4-.05,inner);}
    [-1,1].forEach(s=>{const e=mesh(S(.1),bodyMat,s*.5,.08,0,head);e.scale.set(1.6,.6,.8);});}
  const feet=[-1,1].map(s=>{const f=mesh(geoFoot,footMat,s*.22,.12,.08,inner);f.scale.set(1,.7,1.25);return f;});
  const hands=[-1,1].map(s=>{const h=mesh(geoHand,bodyMat,s*.55,.68,.05,inner);if(sp==="penguin")h.scale.set(.6,1.5,.4);return h;});
  const hat=new THREE.Group();head.add(hat);const item=new THREE.Group();inner.add(item);
  const shadow=mesh(new THREE.CircleGeometry(.6,20),shadowMat,0,.02,0,root);shadow.rotation.x=-Math.PI/2;
  const aura=mesh(new THREE.RingGeometry(.85,.95,48),new THREE.MeshBasicMaterial({color:0xffe1a8,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),0,.04,0,root);
  aura.rotation.x=-Math.PI/2;
  const bed=new THREE.Group();root.add(bed);
  mesh(new THREE.BoxGeometry(1.35,.16,1.25),new THREE.MeshToonMaterial({color:QUILTS[Math.floor(Math.random()*QUILTS.length)]}),0,.8,-.58,bed);
  mesh(new THREE.BoxGeometry(1.6,.1,2.9),new THREE.MeshLambertMaterial({color:0xe8dcc6}),0,.05,-.8,bed);
  const pillow=mesh(S(.4,16,10),new THREE.MeshLambertMaterial({color:0xf5efe3}),0,.16,-1.55,bed);pillow.scale.set(1.3,.35,.8);
  bed.scale.setScalar(.001);bed.visible=false;
  let buddy=null;if(o.npc){buddy=addSprite(TEX_CORE,{color:0xe8f59a});buddy.scale.setScalar(.35);root.add(buddy);}
  const c={root,inner,head,body,bodyMat,eyes,feet,hands,hat,item,aura,bed,mouth,buddy,shadow,npc:!!o.npc,sp,
    pos:new THREE.Vector3(),target:new THREE.Vector3(),yaw:0,state:"walk",walkPh:Math.random()*6,blinkT:2+Math.random()*4,seed:Math.random()*10,
    rotX:0,lift:0,sit:0,zzzT:0,steamT:0,bs:0,breathing:false,moving:false,emote:null,hatType:-1,itemType:-1};
  scene.add(root);setHat(c,o.hat||0);setItem(c,o.item||0);return c;}
function setHat(c,h){if(c.hatType===h)return;c.hatType=h;while(c.hat.children.length)c.hat.remove(c.hat.children[0]);
  const T=m=>new THREE.MeshToonMaterial({color:m});
  if(h===1){const cone=mesh(new THREE.ConeGeometry(.42,.85,18),T(0x5a6fb5),0,.6,-.05,c.hat);cone.rotation.z=-.35;
    mesh(S(.11),T(0xfff6e8),.27,.98,-.05,c.hat);const band=mesh(new THREE.TorusGeometry(.4,.07,8,24),T(0xfff6e8),0,.22,0,c.hat);band.rotation.x=Math.PI/2;}
  else if(h===2){mesh(new THREE.SphereGeometry(.52,20,12,0,Math.PI*2,0,Math.PI/2),T(0xd9776a),0,.1,0,c.hat);mesh(S(.13),T(0xf3d9a4),0,.62,0,c.hat);}
  else if(h===3){const lm=T(0x8fd27a);mesh(new THREE.CylinderGeometry(.025,.03,.25,6),lm,0,.6,0,c.hat);
    [-1,1].forEach(s=>{const l=mesh(S(.12,10,6),lm,s*.13,.74,0,c.hat);l.scale.set(1.4,.4,.8);l.rotation.z=s*.5;});}
  else if(h===4){const cols=[0xffd3e0,0xfff1b0,0xd8c8ff,0xffffff];for(let i=0;i<9;i++){const a=i/9*Math.PI*2;mesh(S(.085,8,6),T(cols[i%4]),Math.cos(a)*.4,.3,Math.sin(a)*.4,c.hat);}
    const ring=mesh(new THREE.TorusGeometry(.4,.03,6,24),T(0x7fb06a),0,.3,0,c.hat);ring.rotation.x=Math.PI/2;}
  else if(h===5){const rm=T(0xe86a8a);[-1,1].forEach(s=>{const b=mesh(new THREE.ConeGeometry(.14,.26,4),rm,s*.15+.2,.4,.12,c.hat);b.rotation.z=s*Math.PI/2;});mesh(S(.07),rm,.2,.4,.12,c.hat);}}

/* 노 젓는 작은 배 */
function makeRowboat(){const g=new THREE.Group();const wood=new THREE.MeshLambertMaterial({color:0x8a5a3a}),dark=new THREE.MeshLambertMaterial({color:0x5e3d26});
  mesh(new THREE.BoxGeometry(1.25,.38,2.5),wood,0,.1,0,g);
  const bow=mesh(new THREE.ConeGeometry(.66,.9,4),wood,0,.1,1.68,g);bow.rotation.set(Math.PI/2,Math.PI/4,0);bow.scale.set(1,1,.55);
  mesh(new THREE.BoxGeometry(1.05,.05,2.3),dark,0,.3,0,g);mesh(new THREE.BoxGeometry(1.22,.08,.32),wood,0,.36,-.35,g);
  const oars=[-1,1].map(s=>{const pv=new THREE.Group();pv.position.set(s*.62,.4,.05);g.add(pv);
    const sh=mesh(new THREE.CylinderGeometry(.03,.03,2.1,6),dark,s*.9,-.2,0,pv);sh.rotation.z=s*(Math.PI/2+.32);
    mesh(new THREE.BoxGeometry(.5,.04,.2),wood,s*1.85,-.52,0,pv);return pv;});
  const lan=addSprite(TEX_CORE,{color:0xffc070});lan.scale.setScalar(.7);lan.position.set(0,.75,1.5);g.add(lan);
  g.userData.oars=oars;return g;}
function setBoat(c,on){c.inBoat=!!on;if(on&&!c.boatMesh){c.boatMesh=makeRowboat();c.root.add(c.boatMesh);}if(c.boatMesh)c.boatMesh.visible=!!on;}
const SEA_B={x0:-150,x1:150,z0:51.5,z1:230};
function setItem(c,it){if(c.itemType===it)return;c.itemType=it;while(c.item.children.length)c.item.remove(c.item.children[0]);c.steam=null;
  const T=m=>new THREE.MeshToonMaterial({color:m});
  if(it===1){const g=new THREE.Group();const m=T(0xb88a5e);mesh(S(.14),m,0,0,0,g);mesh(S(.11),m,0,.19,0,g);[-1,1].forEach(s=>mesh(S(.045),m,s*.08,.28,0,g));mesh(S(.04),T(0xe8d2b5),0,.17,.1,g);g.position.set(.42,.6,.32);c.item.add(g);}
  else if(it===2){const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.1,.08,.2,10),new THREE.MeshBasicMaterial({color:0xffd59a}),0,0,0,g);
    mesh(new THREE.TorusGeometry(.07,.012,6,12,Math.PI),darkMat,0,.12,0,g);const gl=addSprite(TEX_HALO,{color:0xffc070,opacity:.8});gl.scale.setScalar(1.3);g.add(gl);g.position.set(.6,.45,.18);c.item.add(g);}
  else if(it===3){const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.1,.09,.18,12),T(0xf1e6d6),0,0,0,g);mesh(new THREE.CircleGeometry(.085,12),new THREE.MeshBasicMaterial({color:0x8a5a3a}),0,.091,0,g).rotation.x=-Math.PI/2;
    mesh(new THREE.TorusGeometry(.05,.015,6,12),T(0xf1e6d6),.11,0,0,g);g.position.set(.38,.78,.38);c.item.add(g);c.steam=g;}
  else if(it===4){const p=mesh(S(.3,16,10),T(0xf3ead8),0,.7,.48,c.item);p.scale.set(1.3,.75,.45);}}

function charTex(draw,w=96,h=96){const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d");draw(x,w,h);return new THREE.CanvasTexture(cv);}
const TEX_Z=charTex(x=>{x.fillStyle="rgba(235,240,255,.95)";x.font='bold 64px "Gowun Batang", Georgia, serif';x.textAlign="center";x.textBaseline="middle";x.fillText("z",48,52);});
const TEX_HEART=charTex(x=>{x.fillStyle="#ff9db4";x.beginPath();x.moveTo(48,80);x.bezierCurveTo(10,52,14,18,36,18);x.bezierCurveTo(44,18,48,26,48,30);x.bezierCurveTo(48,26,52,18,60,18);x.bezierCurveTo(82,18,86,52,48,80);x.fill();});
const bubbleCache={};
function bubbleTex(txt){if(bubbleCache[txt])return bubbleCache[txt];return bubbleCache[txt]=charTex((x,w,h)=>{x.fillStyle="rgba(20,24,44,.82)";
  const r=30;x.beginPath();x.moveTo(r,6);x.arcTo(w-6,6,w-6,h-6,r);x.arcTo(w-6,h-6,6,h-6,r);x.arcTo(6,h-6,6,6,r);x.arcTo(6,6,w-6,6,r);x.fill();
  x.fillStyle="#efe6d3";x.font='34px "Gowun Batang", serif';x.textAlign="center";x.textBaseline="middle";x.fillText(txt,w/2,h/2+2);},240,80);}
{const lbl=new THREE.Sprite(new THREE.SpriteMaterial({map:bubbleTex("마음 우체통"),transparent:true,depthWrite:false}));lbl.scale.set(1.6,.53,1);lbl.position.y=2.35;lbl.userData={kind:"mailbox"};mailbox.add(lbl);}
/* ---------- 장소들 ---------- */
const ZONES=[
 {id:"fire",name:"모닥불 광장",desc:"모두가 모이는 따뜻한 한가운데",x:FIRE.x,z:FIRE.z},
 {id:"hammock",name:"해먹 숲",desc:"나무 사이 해먹이 흔들리는 숲",x:-24,z:-17},
 {id:"flower",name:"꽃밭 언덕",desc:"밤에 피는 꽃들이 은은하게 빛나요",x:27,z:-6},
 {id:"star",name:"별 보는 언덕",desc:"망원경과 누울 의자가 있는 전망대",x:0,z:-34},
 {id:"prayer",name:"기도의 뜰",desc:"작은 예배당과 석탑, 촛불이 있는 뜰",x:-27,z:19},
 {id:"tent",name:"텐트 마을",desc:"불빛 새는 텐트 곁에서 이불 덮고 쉬어요",x:25,z:22},
 {id:"sea",name:"바닷가",desc:"작은 배를 타고 노 저어 밤바다로 나갈 수 있어요",x:0,z:41}];
const Zp=id=>ZONES.find(z=>z.id===id);
const lam=c=>new THREE.MeshLambertMaterial({color:c}),toon=c=>new THREE.MeshToonMaterial({color:c});
const zoneFx=[];
function addTree(x,z,r,h){const ms=[mesh(new THREE.CylinderGeometry(.28*r/3,.42*r/3,h,8),trunkMat,x,h/2,z,scene)];
  [[0,0,0,1],[.5,-.3,.2,.7],[-.45,-.25,-.2,.68]].forEach(([dx,dy,dz,s])=>ms.push(mesh(new THREE.SphereGeometry(r*s,14,10),leafMat,x+dx*r,h+dy*r,z+dz*r,scene)));regTree(x,z,r,h,ms);OBST.push({x,z,r:.7});}
function zoneLabel(Z,y){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:bubbleTex(Z.name),transparent:true,depthWrite:false,fog:false}));sp.scale.set(2.6,.87,1);sp.position.set(Z.x,y||4.8,Z.z);scene.add(sp);}
function glowAt(x,y,z,color,size,base){const g=addSprite(TEX_CORE,{color});g.scale.setScalar(size);g.position.set(x,y,z);scene.add(g);zoneFx.push({s:g,ph:Math.random()*6,base:base||.9});return g;}
function lightString(a,b,n,sag,colors,size){for(let i=0;i<=n;i++){const f=i/n;const p=new THREE.Vector3().lerpVectors(a,b,f);p.y-=Math.sin(f*Math.PI)*sag;glowAt(p.x,p.y,p.z,pickR(colors),size||.45);}}
const WARM=[0xffd59a,0xffc27a,0xfff0c8];
{// 해먹 숲
 const H=Zp("hammock");for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;addTree(H.x+Math.cos(a)*8,H.z+Math.sin(a)*8,2+Math.random()*.7,3.2+Math.random()*.9);}
 [[-2.2,-.5,.3,0x9fb7d9],[2.6,2,-.4,0xe7b7a0],[0,-3.6,.1,0xb8d4a8]].forEach(([ox,oz,ry,col])=>{const g=new THREE.Group();g.position.set(H.x+ox,0,H.z+oz);g.rotation.y=ry;scene.add(g);
   [-1.9,1.9].forEach(px=>mesh(new THREE.CylinderGeometry(.08,.1,1.9,8),trunkMat,px,.95,0,g));
   const cloth=mesh(new THREE.CylinderGeometry(.55,.55,3,16,1,true,Math.PI,Math.PI),new THREE.MeshToonMaterial({color:col,side:THREE.DoubleSide}),0,1.15,0,g);cloth.rotation.z=Math.PI/2;
   [-1,1].forEach(s=>{const rope=mesh(new THREE.CylinderGeometry(.015,.015,.55,4),darkMat,s*1.68,1.45,0,g);rope.rotation.z=s*1.1;});
   const pil=mesh(S(.22,12,8),whiteMat,-1.05,.85,0,g);pil.scale.set(1,.45,1.3);OBST.push({x:H.x+ox,z:H.z+oz,r:1.2});});
 lightString(new THREE.Vector3(H.x-6.5,3.4,H.z-4),new THREE.Vector3(H.x+6.5,3.4,H.z-4),14,.9,WARM);
 lightString(new THREE.Vector3(H.x-6,3.2,H.z+4),new THREE.Vector3(H.x+6,3.2,H.z+4),12,.8,WARM);zoneLabel(H);}
{// 꽃밭 언덕
 const F=Zp("flower");const fgeo=new THREE.SphereGeometry(.09,6,4);const d=new THREE.Object3D();
 [0xffd3e0,0xfff1b0,0xd8c8ff,0xbfe6ff,0xffffff,0xffc8a8].forEach(c=>{const M=140,fm=new THREE.InstancedMesh(fgeo,new THREE.MeshBasicMaterial({color:c}),M);
   for(let i=0;i<M;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*8.5;d.position.set(F.x+Math.cos(a)*r,.25+Math.random()*.15,F.z+Math.sin(a)*r);d.scale.setScalar(.8+Math.random()*.8);d.updateMatrix();fm.setMatrixAt(i,d.matrix);}scene.add(fm);});
 for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2,r=1.5+Math.random()*6.5;glowAt(F.x+Math.cos(a)*r,.55,F.z+Math.sin(a)*r,pickR([0xffc8e0,0xd8c8ff,0xbfe6ff]),.9,.7);}
 const bench=new THREE.Group();bench.position.set(F.x,0,F.z+4);bench.rotation.y=Math.PI;scene.add(bench);
 mesh(new THREE.BoxGeometry(2,.12,.55),lam(0x8a6a4c),0,.48,0,bench);mesh(new THREE.BoxGeometry(2,.5,.1),lam(0x8a6a4c),0,.85,-.25,bench);
 [[-.85,-.2],[.85,-.2],[-.85,.2],[.85,.2]].forEach(([x,z])=>mesh(new THREE.BoxGeometry(.1,.48,.1),lam(0x6a4a33),x,.24,z,bench));OBST.push({x:F.x,z:F.z+4,r:1});
 zoneLabel(F);}
{// 별 보는 언덕
 const Z=Zp("star");mesh(new THREE.BoxGeometry(8,.14,5.5),lam(0x6b4f3a),Z.x,.07,Z.z,scene);
 const tel=new THREE.Group();tel.position.set(Z.x+2,0,Z.z-1.2);scene.add(tel);
 [0,2.1,4.2].forEach(a=>{const l=mesh(new THREE.CylinderGeometry(.03,.03,1.4,6),lam(0x5a5048),Math.cos(a)*.35,.68,Math.sin(a)*.35,tel);l.rotation.z=Math.cos(a)*.25;l.rotation.x=-Math.sin(a)*.25;});
 const tube=mesh(new THREE.CylinderGeometry(.12,.17,1.7,14),lam(0xc9bfae),0,1.55,0,tel);tube.rotation.x=-.75;OBST.push({x:Z.x+2,z:Z.z-1.2,r:.7});
 [-2.2,-.6].forEach(x=>{const ln=mesh(new THREE.BoxGeometry(.8,.1,1.9),lam(0xd9c7a8),Z.x+x,.38,Z.z+.6,scene);ln.rotation.x=-.25;});
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const st=mesh(S(.32,8,6),lam(0x6b6670),Z.x+Math.cos(a)*6.4,.15,Z.z+Math.sin(a)*5,scene);st.scale.set(1,.6,1);}
 zoneLabel(Z,4.2);}
{// 기도의 뜰
 const P=Zp("prayer");
 const ch=new THREE.Group();ch.position.set(P.x-4.6,0,P.z-2.2);ch.rotation.y=.3;scene.add(ch);
 mesh(new THREE.BoxGeometry(2.8,2.2,3.4),lam(0xe9e1d2),0,1.1,0,ch);const roof=mesh(new THREE.ConeGeometry(2.55,1.5,4),lam(0x8a5a4a),0,2.95,0,ch);roof.rotation.y=Math.PI/4;
 mesh(new THREE.BoxGeometry(.12,.85,.12),lam(0xe9d9a8),0,4.05,0,ch);mesh(new THREE.BoxGeometry(.5,.12,.12),lam(0xe9d9a8),0,4.2,0,ch);
 mesh(new THREE.PlaneGeometry(.8,1.3),new THREE.MeshBasicMaterial({color:0x3a2a22}),0,.65,1.71,ch);
 mesh(new THREE.PlaneGeometry(.6,.5),new THREE.MeshBasicMaterial({color:0xffd59a}),0,1.75,1.71,ch);
 [-1,1].forEach(s=>{const w=mesh(new THREE.PlaneGeometry(.5,.7),new THREE.MeshBasicMaterial({color:0xffcf8a}),s*1.41,1.3,.4,ch);w.rotation.y=s*Math.PI/2;});
 {const g=addSprite(TEX_HALO,{color:0xffc070,opacity:.7});g.scale.setScalar(3.2);g.position.set(0,1.6,2);ch.add(g);}
 OBST.push({x:P.x-4.6,z:P.z-2.2,r:2.3});
 const pg=new THREE.Group();pg.position.set(P.x+4.2,0,P.z-1.6);scene.add(pg);let y=.25;
 mesh(new THREE.BoxGeometry(1.9,.5,1.9),lam(0x8f8a82),0,y,0,pg);y=.5;
 for(let i=0;i<5;i++){const w=1.35-i*.2;mesh(new THREE.BoxGeometry(w,.42,w),lam(0x9a968e),0,y+.21,0,pg);mesh(new THREE.BoxGeometry(w*1.3,.08,w*1.3),lam(0x7f7b74),0,y+.46,0,pg);y+=.5;}
 mesh(new THREE.CylinderGeometry(.04,.06,.6,6),lam(0x7f7b74),0,y+.3,0,pg);OBST.push({x:P.x+4.2,z:P.z-1.6,r:1.2});
 mesh(new THREE.BoxGeometry(1.8,.5,.8),lam(0x8f8a82),P.x,.25,P.z+1.8,scene);OBST.push({x:P.x,z:P.z+1.8,r:.9});
 for(let i=0;i<11;i++){const h=.14+Math.random()*.16;const cx=P.x-.7+(i%6)*.28,cz=P.z+1.62+Math.floor(i/6)*.3;mesh(new THREE.CylinderGeometry(.04,.04,h,8),whiteMat,cx,.5+h/2,cz,scene);glowAt(cx,.5+h+.06,cz,0xffc070,.35,.95);}
 lightString(new THREE.Vector3(P.x-3,3.1,P.z+.6),new THREE.Vector3(P.x+3.6,3.1,P.z+.6),9,.6,[0xff8a8a,0xffb3cc,0xffe08a,0xa8e0a0],.75);
 zoneLabel(P,5.6);}
{// 텐트 마을
 const T=Zp("tent");[[-3.2,-1,0xd98b5f],[3,-2,0x6fa3a0],[.2,3.4,0xe8dcc0]].forEach(([ox,oz,col])=>{const x=T.x+ox,z=T.z+oz;
   const tn=mesh(new THREE.ConeGeometry(1.55,2.1,4),toon(col),x,1.05,z,scene);tn.rotation.y=Math.PI/4;
   const dir=new THREE.Vector3(-ox,0,-oz).normalize();glowAt(x+dir.x*1.05,.55,z+dir.z*1.05,0xffb060,1.2,.75);
   const mat=mesh(new THREE.BoxGeometry(1.2,.06,1),lam(0xd9c7a8),x+dir.x*1.9,.03,z+dir.z*1.9,scene);mat.rotation.y=Math.atan2(dir.x,dir.z);OBST.push({x,z,r:1.4});});
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const st=mesh(S(.16,8,6),lam(0x6b6670),T.x+Math.cos(a)*.55,.1,T.z+Math.sin(a)*.55,scene);st.scale.set(1,.7,1);}
 glowAt(T.x,.45,T.z,0xff9a48,1.6,.9);glowAt(T.x,.35,T.z,0xffd08a,.7,1);OBST.push({x:T.x,z:T.z,r:.8});
 lightString(new THREE.Vector3(T.x-3.2,2.3,T.z-1),new THREE.Vector3(T.x+3,2.3,T.z-2),10,.5,WARM);
 lightString(new THREE.Vector3(T.x+3,2.3,T.z-2),new THREE.Vector3(T.x+.2,2.3,T.z+3.4),10,.5,WARM);zoneLabel(T);}
zoneLabel(Zp("fire"),3.6);
// 바다와 배
{const Z=Zp("sea");
 const sand=new THREE.Mesh(new THREE.PlaneGeometry(190,14),new THREE.MeshLambertMaterial({color:0x6f6553}));sand.rotation.x=-Math.PI/2;sand.position.set(0,.012,46);scene.add(sand);
 for(let i=0;i<40;i++){const st=mesh(S(.25+Math.random()*.35,8,6),lam(0x5d5a60),rnd(-60,60),.05,rnd(42,48.5),scene);st.scale.y=.5;}
 for(let i=0;i<4;i++){const b=new THREE.Group();b.position.set(rnd(-25,25),0,rnd(43,46));b.rotation.y=rnd(-.6,.6);scene.add(b);
   mesh(new THREE.BoxGeometry(1.8,.1,.5),lam(0x8a6a4c),0,.45,0,b);[-.75,.75].forEach(x=>mesh(new THREE.BoxGeometry(.1,.45,.4),lam(0x6a4a33),x,.22,0,b));OBST.push({x:b.position.x,z:b.position.z,r:1});}
 window.__seaMat=new THREE.ShaderMaterial({uniforms:{t:{value:0},camP:{value:camera.position},fogC:{value:FOG}},
  vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`varying vec3 vW;uniform float t;uniform vec3 camP;uniform vec3 fogC;
    vec2 wv(vec2 p,vec2 d,float f,float s,float a){float ph=dot(p,d)*f+t*s;return d*cos(ph)*a*f;}
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec2 p=vW.xz;vec2 g=wv(p,normalize(vec2(.3,1.)),.28,.8,.4)+wv(p,normalize(vec2(-.7,.6)),.55,1.2,.18)+wv(p,normalize(vec2(.9,.2)),1.4,1.9,.06);
      vec3 n=normalize(vec3(-g.x,1.,-g.y));vec3 v=normalize(camP-vW);float fr=pow(1.-max(dot(n,v),0.),3.);
      vec3 c=mix(vec3(.01,.025,.06),vec3(.08,.1,.2),fr*.9+.06);
      vec2 cell=floor(p*4.);float sp=step(.992,h(cell+floor(t*.7)))*smoothstep(.5,1.,fr+.4);c+=vec3(.75,.8,1.)*sp*.5;
      float shore=smoothstep(51.5,49.5,vW.z);c+=vec3(.55,.6,.7)*shore*(.35+.25*sin(t*1.3+vW.x*.4));
      float d=length(camP-vW);float f=1.-exp(-pow(d*.011,2.));gl_FragColor=vec4(mix(c,fogC,clamp(f,0.,1.)),1.);}`});
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(700,360),window.__seaMat);sea.rotation.x=-Math.PI/2;sea.position.set(0,.03,49+180);scene.add(sea);
 // 등대
 const lh=new THREE.Group();lh.position.set(46,0,78);scene.add(lh);
 mesh(S(4,12,8),lam(0x4d4a52),0,-1.2,0,lh).scale.set(1,.55,1);
 [[0,0xf1ece2],[1,0xc4655a],[2,0xf1ece2],[3,0xc4655a]].forEach(([i,c])=>mesh(new THREE.CylinderGeometry(1.15-i*.12-.12,1.15-i*.12,2,14),lam(c),0,1+i*2,0,lh));
 mesh(new THREE.CylinderGeometry(.75,.75,1,10),new THREE.MeshBasicMaterial({color:0xffe6a8}),0,8.5,0,lh);mesh(new THREE.ConeGeometry(.95,1,10),lam(0x3d3a42),0,9.5,0,lh);
 const lamp=addSprite(TEX_HALO,{color:0xffd890,fog:false});lamp.scale.setScalar(9);lamp.position.y=8.5;lh.add(lamp);
 const beamG=new THREE.ConeGeometry(3,60,24,1,true);beamG.translate(0,-30,0);beamG.rotateZ(Math.PI/2);
 const beam=new THREE.Mesh(beamG,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;void main(){float a=pow(vUv.y,2.2)*.13;gl_FragColor=vec4(vec3(1.,.94,.75)*a,a);}`}));
 beam.position.y=8.5;lh.add(beam);window.__lhBeam=beam;window.__lhLamp=lamp;
 // 배
 window.__boats=[];OBST.push({x:46,z:78,r:6});
 const sailCols=[0xf3ead8,0xe8d2c0,0xd9e2ef,0xf0d9a8];
 for(let i=0;i<8;i++){const b=new THREE.Group();const dir=Math.random()<.5?1:-1;const sc=1.4+Math.random()*1.4;b.scale.setScalar(sc);
   mesh(new THREE.BoxGeometry(2.4,.42,.9),lam(0x7a5236),0,.2,0,b);const bow=mesh(new THREE.ConeGeometry(.45,.8,4),lam(0x7a5236),1.55,.2,0,b);bow.rotation.z=-Math.PI/2;bow.rotation.x=Math.PI/4;
   mesh(new THREE.CylinderGeometry(.035,.04,2.4,6),lam(0x5a4030),.1,1.4,0,b);
   const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(0,1.9);sh.lineTo(1.25,0);sh.lineTo(0,0);
   const sail=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshLambertMaterial({color:pickR(sailCols),side:THREE.DoubleSide}));sail.position.set(.16,.5,0);b.add(sail);
   const lan=addSprite(TEX_CORE,{color:0xffc070});lan.scale.setScalar(.9);lan.position.set(-1,.85,0);b.add(lan);
   const refl=addSprite(TEX_HALO,{color:0xffb060,opacity:.35});refl.scale.set(.9,3.2,1);refl.position.set(-1,-1.1,0);b.add(refl);
   b.rotation.y=dir>0?0:Math.PI;const z=rnd(66,230);b.position.set(rnd(-150,150),.05,z);scene.add(b);
   window.__boats.push({b,dir,sp:rnd(.5,1.4)*(z<120?.8:1.2),ph:Math.random()*6,lan});}
 zoneLabel(Z,4.2);}
// 흩어진 숲
for(let i=0;i<46;i++){const a=Math.random()*Math.PI*2,r=12+Math.random()*36;const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(z>34||ZONES.some(Z=>Math.hypot(Z.x-x,Z.z-z)<10)||TREES.some(T=>Math.hypot(T.x-x,T.z-z)<5)){continue;}addTree(x,z,1.8+Math.random()*1.4,2.8+Math.random()*1.6);}
// 장소 패널
ZONES.forEach(Z=>{const b=document.createElement("button");b.className="track";const nm=document.createElement("b");nm.textContent=Z.name;const ds=document.createElement("span");ds.textContent=Z.desc;b.append(nm,ds);
  b.addEventListener("click",()=>{if(me.state!=="walk")setMyState("walk");const a=Math.atan2(me.pos.x-Z.x,me.pos.z-Z.z);const r=Z.id==="fire"?3:4.5;
    me.target.set(Z.x+Math.sin(a)*r,0,Math.min(Z.z+Math.cos(a)*r,44));if(Z.id==="sea"){me.target.set(Z.x+rnd(-3,3),0,42);yawGoal=Math.PI;}sendPresence(true);openPanel(null);toast(`${Z.name} 쪽으로 걸어가요`);});$("placeList").append(b);});
let curZone="";

const floaters=[];
function floatSprite(tex,pos,opt={}){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:opt.add?THREE.AdditiveBlending:THREE.NormalBlending,color:opt.color||0xffffff}));const sc=opt.scale||.45;
  s.scale.set(sc*(opt.aspect||1),sc,1);s.position.copy(pos);scene.add(s);floaters.push({s,t0:performance.now(),life:opt.life||2600,vx:opt.vx||0,vy:opt.vy||.6,sc,aspect:opt.aspect||1,grow:opt.grow||.4,wob:opt.wob||0,follow:opt.follow||null,off:opt.follow?pos.clone().sub(opt.follow.root.position):null});}
function hearts(c,n=5){for(let i=0;i<n;i++)setTimeout(()=>{const p=c.root.position.clone();p.y+=2.2;p.x+=(Math.random()-.5)*.8;floatSprite(TEX_HEART,p,{scale:.42,vy:.7,life:2200,wob:.6});},i*180);}
function bubble(c,txt){const p=c.root.position.clone();p.y+=2.5;floatSprite(bubbleTex(txt),p,{scale:.55,aspect:3,vy:.12,life:2400,grow:.05,follow:c});}

const EMOTES={wave:{dur:2.2},yawn:{dur:2.6,txt:"하아암"},stretch:{dur:2.4,txt:"으쌰"},heart:{dur:1.2},nod:{dur:3,txt:"꾸벅"},shh:{dur:2.4,txt:"쉿"}};
function playEmote(c,name){if(!Object.prototype.hasOwnProperty.call(EMOTES,name))return;const E=EMOTES[name];c.emote={name,t0:performance.now()};if(name==="heart")hearts(c,6);if(E.txt)bubble(c,E.txt);}

const tmpV=new THREE.Vector3(),tmpV2=new THREE.Vector3();const UP=new THREE.Vector3(0,1,0);
const lerp=(a,b,k)=>a+(b-a)*k;
function updateChar(c,dt,t,now){
  let moving=false;
  if(c.state==="walk"){tmpV.subVectors(c.target,c.pos);tmpV.y=0;const d=tmpV.length();
    if(d>.08){moving=true;const sp=Math.min(d,dt*(c.npc?1.1:c.inBoat?1.8:Math.min(6,1.9+d*.12)));tmpV.multiplyScalar(sp/d);c.pos.add(tmpV);c.yaw=Math.atan2(tmpV.x,tmpV.z);}}
  OBST.forEach(o=>{const dx=c.pos.x-o.x,dz=c.pos.z-o.z;const d=Math.hypot(dx,dz);if(d<o.r&&d>0.0001){c.pos.x=o.x+dx/d*o.r;c.pos.z=o.z+dz/d*o.r;}});
  c.moving=moving;const k=1-Math.exp(-dt*5);
  let dy=c.yaw-c.root.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));c.root.rotation.y+=dy*(1-Math.exp(-dt*8));
  c.root.position.set(c.pos.x,c.inBoat?.05+(reduce?0:Math.sin(t*1.1+c.seed)*.07):0,c.pos.z);
  let bl=.3;if(c.breathing&&c.bs)bl=breathLevel(c.bs,now).l;
  const breathe=c.state!=="walk"?(c.breathing?bl:.5+.5*Math.sin(t*(c.state==="sleep"?1.1:1.6)+c.seed)):0;
  const sleep=c.state==="sleep",med=c.state==="meditate";
  c.rotX=lerp(c.rotX,sleep?-Math.PI/2:0,k);c.inner.rotation.x=c.rotX;
  const seated=med||(c.inBoat&&!sleep);c.sit=lerp(c.sit,seated?1:0,k);c.lift=lerp(c.lift,sleep?.48:0,k);
  const bob=moving&&!reduce?Math.abs(Math.sin(c.walkPh))*.12:0;if(moving)c.walkPh+=dt*9;
  c.inner.position.y=c.lift+(c.inBoat?0:bob)-c.sit*.18+(c.inBoat?.3:0);
  let sy=1;const bs=1+breathe*.045;const sw=moving?Math.sin(c.walkPh):0;
  c.feet.forEach((f,i)=>{const s=i?1:-1;
    f.position.x=lerp(f.position.x,seated?s*.36:s*.22,k);f.position.z=lerp(f.position.z,seated?.36:.08+(i?sw:-sw)*.16,k);f.position.y=lerp(f.position.y,seated?.16:.12,k);f.rotation.y=lerp(f.rotation.y,seated?-s*1.1:0,k);});
  if(c.inBoat&&c.boatMesh){const ph=t*4;c.boatMesh.userData.oars.forEach((o,i)=>{const s=i?1:-1;o.rotation.y=moving?Math.sin(ph)*.55*s:lerp(o.rotation.y,0,k);o.rotation.x=moving?Math.cos(ph)*.14:lerp(o.rotation.x,0,k);});
    if(moving&&!sleep)c.hands.forEach((h,i)=>{h.position.set((i?1:-1)*.42,.6,.32+Math.sin(ph)*.18);});
    c.boatMesh.rotation.z=reduce?0:Math.sin(t*.9+c.seed)*.05;
    if(moving){c.wakeT=(c.wakeT||0)-dt;if(c.wakeT<0){c.wakeT=.7;groundPulse(c.pos.x,c.pos.z,0x9fb7d9,1.8,1.8);}}}
  if(c.shadow)c.shadow.visible=!c.inBoat;c.bed.position.y=c.inBoat?.3:0;
  c.hands.forEach((h,i)=>{const s=i?1:-1;
    h.position.x=lerp(h.position.x,med?s*.4:sleep?s*.5:s*.55,k);h.position.z=lerp(h.position.z,med?.38:(moving?(i?-sw:sw)*.15:.05),k);h.position.y=lerp(h.position.y,med?.42:.68,k);});
  let headRX=med?.18:0,headRZ=sleep?.25:(!reduce&&!moving?Math.sin(t*.7+c.seed)*.06:0);let mouthS=1;
  if(c.emote){const E=EMOTES[c.emote.name];const el=(performance.now()-c.emote.t0)/1000;
    if(el>E.dur)c.emote=null;else{const env=Math.min(1,el/.35,(E.dur-el)/.35);const R=c.hands[1],L=c.hands[0];
      if(c.emote.name==="wave"){R.position.set(lerp(R.position.x,.62,env),lerp(R.position.y,1.45+Math.sin(el*11)*.06,env),lerp(R.position.z,.15+Math.sin(el*11)*.18,env));}
      else if(c.emote.name==="yawn"){headRX=lerp(headRX,-.35,env);mouthS=1+2.6*env;R.position.y=lerp(R.position.y,1.2,env);R.position.x=lerp(R.position.x,.25,env);R.position.z=lerp(R.position.z,.45,env);}
      else if(c.emote.name==="stretch"){[L,R].forEach((h,i)=>{const s=i?1:-1;h.position.set(lerp(h.position.x,s*.32,env),lerp(h.position.y,2.05,env),lerp(h.position.z,0,env));});sy=1+.08*env;c.inner.position.y+=.08*env;}
      else if(c.emote.name==="nod"){headRX=.35*Math.abs(Math.sin(el*2.2))*env;}
      else if(c.emote.name==="shh"){R.position.set(lerp(R.position.x,.12,env),lerp(R.position.y,1.32,env),lerp(R.position.z,.5,env));}}}
  c.body.scale.set(bs,1.02*bs*sy,.92*bs);
  c.head.rotation.x=lerp(c.head.rotation.x,headRX,c.emote?.3:k);c.head.rotation.z=lerp(c.head.rotation.z,headRZ,k);
  c.mouth.scale.set(mouthS,mouthS,1);
  c.blinkT-=dt;let eyeY=1;if(c.blinkT<0){eyeY=.15;if(c.blinkT<-.14)c.blinkT=2.5+Math.random()*4;}
  if(med||sleep||(c.emote&&(c.emote.name==="yawn"||c.emote.name==="nod")))eyeY=.18;c.eyes.forEach(e=>{e.scale.y=lerp(e.scale.y,eyeY,.5);e.scale.x=eyeY<.5?1.4:1;});
  c.aura.material.opacity=lerp(c.aura.material.opacity,med?.18+.3*breathe:0,k);c.aura.scale.setScalar(1+breathe*.25);
  const ns=lerp(c.bed.scale.x,sleep?1:.001,k);c.bed.scale.setScalar(ns);c.bed.visible=ns>.01;
  if(c.buddy){c.buddy.position.set(Math.cos(t*1.3+c.seed)*.7,2.1+Math.sin(t*2.1)*.15,Math.sin(t*1.3+c.seed)*.7);c.buddy.material.opacity=.6+.4*Math.sin(t*3+c.seed);}
  if(!reduce&&sleep){c.zzzT-=dt;if(c.zzzT<0){c.zzzT=1.6+Math.random()*.8;const p=c.root.position.clone();
    tmpV.set(0,0,-1.3).applyAxisAngle(UP,c.root.rotation.y);p.add(tmpV);p.y=1.1;floatSprite(TEX_Z,p,{scale:.38,vy:.45,vx:.15,life:3200,grow:.8});}}
  if(!reduce&&c.steam&&!sleep){c.steamT-=dt;if(c.steamT<0){c.steamT=.9;c.steam.getWorldPosition(tmpV2);tmpV2.y+=.15;floatSprite(TEX_SOFT,tmpV2,{scale:.18,vy:.35,life:1800,grow:1.5,add:true,color:0x9a9aa8});}}
}

/* 나 */
const pickN=(k,max,def)=>{const v=Number(store.get(k));return store.get(k)!==null&&Number.isInteger(v)&&v>=0&&v<max?v:def;};
let myColor=pickN("shelter.color",BODY_COLORS.length,Math.floor(Math.random()*BODY_COLORS.length));
let myHatT=pickN("shelter.hat",6,1),myItem=pickN("shelter.item",5,0);
let mySp=SPECIES.some(s=>s[0]===store.get("shelter.sp"))?store.get("shelter.sp"):SPECIES[Math.floor(Math.random()*SPECIES.length)][0];
let me=makeChar({color:BODY_COLORS[myColor],hat:myHatT,item:myItem,sp:mySp});
{const a=Math.random()*Math.PI*2;me.pos.set(FIRE.x+Math.cos(a)*3.8,0,FIRE.z+3+Math.random()*2);me.target.copy(me.pos);me.yaw=Math.atan2(FIRE.x-me.pos.x,FIRE.z-me.pos.z);me.root.rotation.y=me.yaw;}
function rebuild(c,opts){const n=makeChar(opts);["pos","target","yaw","state","breathing","bs","rotX","lift","sit"].forEach(k=>{n[k]=c[k]&&c[k].clone?c[k].clone():c[k];});
  n.root.rotation.y=c.root.rotation.y;if(c.inBoat)setBoat(n,true);n.returning=c.returning;scene.remove(c.root);return n;}
function myOpts(){return{color:BODY_COLORS[myColor],hat:myHatT,item:myItem,sp:mySp};}
function fillSeg(wrap,list,cur,onPick){list.forEach(([v,label])=>{const b=document.createElement("button");b.textContent=label;b.setAttribute("aria-pressed",String(v===cur));
  b.addEventListener("click",()=>{segPick(wrap,b);onPick(v);});wrap.append(b);});}
fillSeg($("species"),SPECIES,mySp,v=>{mySp=v;store.set("shelter.sp",v);me=rebuild(me,myOpts());sendPresence(true);});
fillSeg($("hats"),HATS,myHatT,v=>{myHatT=v;store.set("shelter.hat",String(v));setHat(me,v);sendPresence(true);});
fillSeg($("items"),ITEMS,myItem,v=>{myItem=v;store.set("shelter.item",String(v));setItem(me,v);sendPresence(true);});
BODY_COLORS.forEach((hex,i)=>{const b=document.createElement("button");b.className="sw";b.style.background=hex;b.setAttribute("aria-label",`색 ${i+1}`);b.setAttribute("aria-pressed",String(i===myColor));
  b.addEventListener("click",()=>{myColor=i;store.set("shelter.color",String(i));me.bodyMat.color.set(hex);segPick($("swatches"),b);sendPresence(true);});$("swatches").append(b);});

const poseBtns=[...document.querySelectorAll(".pose button[data-s]")];
let sleepSince=0;
function setMyState(s){const was=me.state;me.state=s;poseBtns.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.s===s)));
  if(s==="sleep"){sleepSince=Date.now();}else{sleepSince=0;sleepDim=0;applyDim();}
  if(s==="meditate"){if(Math.hypot(me.pos.x-FIRE.x,me.pos.z-FIRE.z)<6)me.yaw=Math.atan2(FIRE.x-me.pos.x,FIRE.z-me.pos.z);
    if(was!=="meditate"){const m=$("medPhrase");if(!medQ.length)medQ=shuffle(MED_LINES);m.textContent=medQ.pop();m.hidden=false;m.style.opacity="0";requestAnimationFrame(()=>{m.style.opacity="1";});medShownAt=performance.now();}}
  else $("medPhrase").hidden=true;
  if(s!=="meditate"&&breathing)stopBreath();
  if(s==="walk")me.target.copy(me.pos);
  sendPresence(true);}
poseBtns.forEach(b=>b.addEventListener("click",()=>{setMyState(b.dataset.s);if(b.dataset.s==="sleep")toast("이불을 덮었어요. 잘 자요",2800);}));
function stopBreath(){breathing=false;me.breathing=false;$("bToggle").textContent="시작";$("breath").hidden=true;$("bRounds").textContent="0 / 4 회";}
function startBreath(start){breathing=true;breathStart=start;me.breathing=true;me.bs=start;$("bToggle").textContent="멈추기";$("breath").hidden=false;
  if(me.state!=="meditate")setMyState("meditate");else sendPresence(true);}
$("bToggle").addEventListener("click",()=>{if(breathing){stopBreath();sendPresence(true);return;}startBreath(Date.now());});
/* 배 타기 */
$("boatBtn").addEventListener("click",()=>{
  if(!me.inBoat){setBoat(me,true);me.returning=false;if(me.state!=="walk")setMyState("walk");me.pos.set(Math.max(-30,Math.min(30,me.pos.x)),0,52.6);me.target.copy(me.pos);me.yaw=0;
    yawGoal=Math.PI;sendPresence(true);toast("작은 배에 올랐어요 · 바다를 누르면 그쪽으로 노를 저어 가요. 모래사장을 누르면 돌아와요",5200);}
  else{if(me.state!=="walk")setMyState("walk");me.target.set(Math.max(-30,Math.min(30,me.pos.x)),0,51.6);me.returning=true;sendPresence(true);}});
let lastEmote={e:"",et:0};
$("emotes").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{if(me.state==="sleep"&&b.dataset.e!=="heart")setMyState("walk");
  playEmote(me,b.dataset.e);lastEmote={e:b.dataset.e,et:Date.now()};sendPresence(true);openPanel(null);}));

const NPC_DEF=[{sp:"bear",color:"#c9a989",z:"fire",st:"meditate",it:3},{sp:"rabbit",color:"#e6ddd0",z:"fire",st:"sleep"},{sp:"sheep",color:"#b9a99a",z:"fire",st:"walk"},
  {sp:"cat",color:"#d9b38c",z:"hammock",st:"sleep",it:4},{sp:"penguin",color:"#8f9ab8",z:"star",st:"meditate"},{sp:"bear",color:"#e6d3bd",z:"flower",st:"walk",it:1},
  {sp:"rabbit",color:"#c9b8a3",z:"prayer",st:"meditate",it:2},{sp:"sheep",color:"#d6c8b8",z:"tent",st:"sleep"}];
const npcs=NPC_DEF.map((d,i)=>{const n=makeChar({...d,npc:true,hat:0,item:d.it||0});const H=Zp(d.z);n.home=H;const a=i*2.1+1;const r=d.z==="fire"?4.5:3+Math.random()*2;
  n.pos.set(H.x+Math.cos(a)*r,0,H.z+Math.sin(a)*r);n.target.copy(n.pos);n.state=d.st;n.timer=8+Math.random()*20;n.yaw=Math.atan2(H.x-n.pos.x,H.z-n.pos.z);return n;});
function npcBrain(n,dt){n.timer-=dt;if(n.state==="walk"&&n.moving)return;if(n.timer>0)return;const r=Math.random();
  if(r<.4){n.state="walk";const H=n.home,a=Math.random()*Math.PI*2,d=3+Math.random()*(H.id==="fire"?10:6);n.target.set(H.x+Math.cos(a)*d,0,H.z+Math.sin(a)*d);n.timer=4+Math.random()*6;}
  else if(r<.5){n.state="walk";n.target.copy(n.pos);playEmote(n,pickR(["yawn","stretch","wave","nod"]));n.timer=3;}
  else if(r<.75){n.state="meditate";n.yaw=Math.atan2(n.home.x-n.pos.x,n.home.z-n.pos.z);n.timer=25+Math.random()*30;}
  else{n.state="sleep";n.timer=40+Math.random()*50;}}

const peers=new Map();let myPeer=null,room=null,roomCanEmit=true;
function setCount(){let n=0;peers.forEach(p=>{if(!p.leaving)n++;});$("count").textContent=room?(n===0?"지금은 숲 친구들과 당신뿐이에요":`지금 ${n+1}명이 함께 깨어 있어요`):"숲 친구들과 함께 있어요";}

const lanterns=new Map();const paperMat=new THREE.MeshBasicMaterial({color:0xffd59a});
function hashN(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function lanternSlot(key){const a=hashN(key),b=hashN(key+"b"),c=hashN(key+"c");const T=TREES[Math.floor(a*TREES.length)%TREES.length];
  const ang=b*Math.PI*2;const rr=T.r*(.92+c*.1);return new THREE.Vector3(T.x+Math.cos(ang)*rr,T.h-T.r*.35-c*T.r*.5,T.z+Math.sin(ang)*rr);}
function placeLantern(key,text,at,owner,row){let L=lanterns.get(key);
  if(!L){const g=new THREE.Group();const base=lanternSlot(key);g.position.copy(base);
    const body=mesh(new THREE.CylinderGeometry(.16,.13,.34,10),paperMat,0,0,0,g);mesh(new THREE.CylinderGeometry(.008,.008,.5,4),darkMat,0,.42,0,g);
    const glow=addSprite(TEX_HALO,{color:0xffc070,opacity:.8});glow.scale.setScalar(1.6);g.add(glow);
    body.userData={kind:"lantern",key};glow.userData={kind:"lantern",key};scene.add(g);L={g,base,body,glow,ph:hashN(key+"p")*6};lanterns.set(key,L);}
  Object.assign(L,{text,at,owner,row});}
function removeLantern(key){const L=lanterns.get(key);if(L){scene.remove(L.g);L.glow.material.dispose();lanterns.delete(key);}}
function syncLanterns(){const seen=new Set();
  DATA.lanterns.forEach(r=>{if(!r||typeof r.body!=="string"||!r.body.trim())return;const key="l"+r.id;seen.add(key);placeLantern(key,r.body.slice(0,80),tsOf(r),!!r.mine,r);});
  [...lanterns.keys()].forEach(k=>{if(!seen.has(k))removeLantern(k);});if(popFor&&popFor.kind==="lantern"&&!lanterns.has(popFor.key))hidePop();}
onLanternsChanged=syncLanterns;

const glows=[];const ringGeo=new THREE.RingGeometry(.9,1,60);
function groundPulse(x,z,color=0xf4d29a,maxR=1.6,dur=1.4){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.set(x,.04,z);m.scale.setScalar(.2);scene.add(m);glows.push({m,t0:performance.now(),maxR,dur});}

const flyers=[];
function textSprite(txt){const c=document.createElement("canvas");const W=512,H=170;c.width=W;c.height=H;const x=c.getContext("2d");
  x.font='28px "Gowun Batang", serif';x.fillStyle="rgba(240,232,214,.96)";x.textAlign="center";x.textBaseline="middle";
  const lines=[];let cur="";for(const ch of txt){if(x.measureText(cur+ch).width>W-40){lines.push(cur);cur=ch;}else cur+=ch;}lines.push(cur);
  const L=lines.slice(0,3);L.forEach((l,i)=>x.fillText(l,W/2,H/2+(i-(L.length-1)/2)*38));
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(6,2,1);return s;}
$("worry").addEventListener("input",e=>{$("worryCount").textContent=`${e.target.value.length} / 120`;});
$("worryGo").addEventListener("click",()=>{const v=$("worry").value.trim();if(!v){$("worry").focus();return;}
  const s=textSprite(v);const from=me.pos.clone();from.y=2.6;s.position.copy(from);scene.add(s);
  flyers.push({s,from,to:new THREE.Vector3(FIRE.x,.9,FIRE.z),t0:performance.now(),dur:2600,kind:"worry"});
  $("worry").value="";$("worryCount").textContent="0 / 120";openPanel(null);});


/* ---------- 요정과 반딧불 친구 ---------- */
const FAIRY_LINES=["안녕! 이 밤에 산책 나왔구나. 반가워","네 발자국 소리가 참 다정해","오늘 하루 정말 수고 많았어","있잖아, 너는 생각보다 훨씬 괜찮은 사람이야",
 "잠이 안 와도 괜찮아. 우리가 같이 깨어 있을게","천천히 걸어도 돼. 밤은 아직 길어","걱정은 내가 잠깐 들고 있을게. 넌 좀 쉬어","너를 응원하는 사람이 분명히 있어. 나도 그중 하나야",
 "오늘 잘한 일 하나만 떠올려 볼래? 아주 작아도 좋아","어깨에 힘 빼고, 후— 한 번 길게 내쉬어 봐","네가 와 줘서 숲이 조금 더 밝아졌어","완벽하지 않아도 넌 충분히 소중해",
 "내일의 너는 오늘보다 조금 더 가벼울 거야","지금 여기까지 온 것만으로도 대단한 거야","힘들었던 마음, 여기 두고 가도 돼","네 눈빛이 아까보다 한결 편안해 보여",
 "꽃밭 언덕에 가 봤어? 오늘 밤 꽃들이 제일 예쁘게 빛나","텐트 마을에 가면 포근하게 누울 자리가 있어","해먹 숲에서 흔들흔들 쉬어 가는 것도 좋아",
 "별 보는 언덕에 누우면 별이 너한테 말을 걸 거야","기도의 뜰에는 누군가 켜 둔 촛불이 아직 따뜻해","마음 우체통에 한마디 남겨 볼래? 누군가에게 큰 위로가 될지 몰라"];
const FIREFLY_LINES=["반짝, 반짝. 우리가 길을 밝혀 줄게","작은 불빛도 모이면 따뜻해져. 너도 그래","여기 있어도 돼. 아무도 서두르라고 하지 않아",
 "어두워도 괜찮아. 우리가 곁에 있잖아","오늘 밤 별들이 너를 닮았대","깜빡깜빡, 천천히 숨 쉬는 박자에 맞춰 볼까?","우리 셋이 너를 꼭 지켜 줄게","눈을 감으면 우리 불빛이 보일 거야"];
let fairyQ=shuffle(FAIRY_LINES),fireflyQ=shuffle(FIREFLY_LINES);
const nextLine=k=>{if(k==="fairy"){if(!fairyQ.length)fairyQ=shuffle(FAIRY_LINES);return fairyQ.pop();}if(!fireflyQ.length)fireflyQ=shuffle(FIREFLY_LINES);return fireflyQ.pop();};
const wingMat=new THREE.MeshBasicMaterial({color:0xe8f4ff,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
const wingGeo=new THREE.CircleGeometry(.2,16);
let fairy=null,walkDist=0,nextFairyAt=rnd(10,18),fairyCount=0;
function spawnFairy(){const kind=fairyCount%3===2?"firefly":"fairy";fairyCount++;wingMat.opacity=.55;
  const g=new THREE.Group();g.userData={kind:"fairy"};const parts=[];
  if(kind==="fairy"){const col=pickR([0xffd6ec,0xd6f0ff,0xfff0c4,0xe0d4ff]);
    const core=addSprite(TEX_CORE,{color:col});core.scale.setScalar(.55);g.add(core);const halo=addSprite(TEX_HALO,{color:col,opacity:.7});halo.scale.setScalar(1.8);g.add(halo);
    const wings=[-1,1].map(s=>{const w=new THREE.Mesh(wingGeo,wingMat);w.scale.set(1,.65,1);w.position.set(s*.2,.06,0);g.add(w);return w;});parts.push(...wings);g.userData.wings=wings;}
  else{for(let i=0;i<5;i++){const f=addSprite(TEX_CORE,{color:0xe8f59a});f.scale.setScalar(.32);g.add(f);parts.push(f);}g.userData.flies=parts;}
  g.traverse(o=>{o.userData.kind="fairy";});
  const a=Math.random()*Math.PI*2;const from=new THREE.Vector3(me.pos.x+Math.cos(a)*14,4+Math.random()*2,me.pos.z+Math.sin(a)*14);g.position.copy(from);scene.add(g);
  fairy={g,kind,from,t0:performance.now(),phase:"in",line:nextLine(kind)};}
function fairySpeak(line){$("fairyWho").textContent=fairy.kind==="fairy"?"숲 요정":"반딧불 친구들";$("fairyText").textContent=line;const m=$("fairyMsg");m.hidden=false;m.style.opacity="1";}
function updateFairy(dt,t,pnow){
  if(me.state==="walk"&&me.moving)walkDist+=dt*2;
  if(!fairy&&walkDist>nextFairyAt&&me.state==="walk"){walkDist=0;nextFairyAt=rnd(22,38);spawnFairy();}
  if(!fairy)return;const f=fairy;const el=(pnow-f.t0)/1000;
  const side=new THREE.Vector3(1.05,0,.2).applyAxisAngle(UP,camYaw);
  const hover=new THREE.Vector3(me.pos.x+side.x,2.5+Math.sin(t*2.4)*.15,me.pos.z+side.z);
  if(f.phase==="in"){const k=Math.min(1,el/2.6);f.g.position.lerpVectors(f.from,hover,easeIO(k));f.g.position.y+=Math.sin(k*Math.PI)*1.2;
    if(k>=1){f.phase="talk";f.t0=pnow;fairySpeak(f.line);}}
  else if(f.phase==="talk"){f.g.position.lerp(hover,1-Math.exp(-dt*4));if(el>7.5){f.phase="out";f.t0=pnow;f.from=f.g.position.clone();$("fairyMsg").style.opacity="0";setTimeout(()=>{if(!fairy||fairy.phase!=="talk")$("fairyMsg").hidden=true;},800);}}
  else{const k=Math.min(1,el/2.4);f.g.position.copy(f.from).add(new THREE.Vector3(Math.sin(k*3)*2,k*k*9,-k*6));
    f.g.children.forEach(c=>{if(c.material)c.material.opacity=Math.min(c.material.opacity,1-k);});
    if(k>=1){scene.remove(f.g);f.g.children.forEach(c=>{if(c.isSprite)c.material.dispose();});fairy=null;return;}}
  if(f.g.userData.wings)f.g.userData.wings.forEach((w,i)=>{w.rotation.y=(i?-1:1)*(.3+Math.abs(Math.sin(t*22))*.9);});
  if(f.g.userData.flies)f.g.userData.flies.forEach((s,i)=>{const a=t*1.6+i*1.26;s.position.set(Math.cos(a)*.45,Math.sin(t*2+i)*.2,Math.sin(a)*.45);s.material.opacity=.6+.4*Math.sin(t*5+i);});
  if(f.phase==="talk"){f.g.getWorldPosition(tmpV);tmpV.y+=.5;tmpV.project(camera);const m=$("fairyMsg");
    m.style.left=Math.max(150,Math.min(innerWidth-150,(tmpV.x*.5+.5)*innerWidth))+"px";m.style.top=Math.max(130,(-tmpV.y*.5+.5)*innerHeight)+"px";}}

/* 양 세기 */
const sheepGroup=new THREE.Group();scene.add(sheepGroup);sheepGroup.visible=false;
{const wm=new THREE.MeshLambertMaterial({color:0x8a6a4c});[-.7,.7].forEach(z=>mesh(new THREE.BoxGeometry(.1,.8,.1),wm,0,.4,z,sheepGroup));[.3,.6].forEach(y=>mesh(new THREE.BoxGeometry(.06,.08,1.6),wm,0,y,0,sheepGroup));}
const sheepList=[];let sheepOn=false,sheepN=0,sheepNext=0;
const sheepFace=new THREE.MeshToonMaterial({color:0x4a4048});
function makeSheep(){const g=new THREE.Group();[[0,.55,0,.32],[-.25,.6,0,.26],[.25,.6,0,.26],[0,.78,0,.26],[-.15,.5,.2,.22],[.15,.5,.2,.22],[-.15,.5,-.2,.22],[.15,.5,-.2,.22]].forEach(([x,y,z,r])=>mesh(S(r),whiteMat,x,y,z,g));
  const hd=mesh(S(.2),sheepFace,.42,.7,0,g);hd.scale.set(1.1,1,.9);[-1,1].forEach(s=>{const e=mesh(S(.07),sheepFace,.4,.8,s*.2,g);e.scale.set(.5,.4,1.6);});
  [[-.2,-.15],[-.2,.15],[.2,-.15],[.2,.15]].forEach(([x,z])=>mesh(new THREE.CylinderGeometry(.04,.04,.36,6),darkMat,x,.18,z,g));
  g.scale.setScalar(.85);sheepGroup.add(g);return {g,t0:performance.now(),counted:false};}
const NUM_U=["","한","두","세","네","다섯","여섯","일곱","여덟","아홉"],NUM_T=["","열","스물","서른","마흔","쉰","예순","일흔","여든","아흔"];
function koCount(n){if(n>=100)return `${n}`;const t=Math.floor(n/10),u=n%10;if(t===2&&u===0)return "스무";return NUM_T[t]+NUM_U[u];}
$("sheepBtn").addEventListener("click",()=>{sheepOn=!sheepOn;$("sheepBtn").setAttribute("aria-pressed",String(sheepOn));$("sheepMsg").hidden=!sheepOn;sheepGroup.visible=sheepOn;
  if(sheepOn){sheepN=0;$("sheepCount").textContent="양을 불러올게요";sheepNext=performance.now()+600;sheepGroup.position.copy(me.pos).add(new THREE.Vector3(0,0,-3.4).applyAxisAngle(UP,camYaw));sheepGroup.rotation.y=camYaw;openPanel(null);}
  else{sheepList.splice(0).forEach(s=>sheepGroup.remove(s.g));}});

/* 별똥별 */
const shooting=[];let nextShoot=performance.now()+20000+Math.random()*25000;let wishTimer=null;
const shootLineMat=new THREE.LineBasicMaterial({color:0xfff2d8,transparent:true,opacity:.9,fog:false});
function spawnShoot(){const start=new THREE.Vector3(rnd(-60,60),rnd(45,70),rnd(-170,-130));
  const dir=new THREE.Vector3(rnd(-.8,.8),-.45,rnd(-.1,.1)).normalize();
  const geo=new THREE.BufferGeometry().setFromPoints([start.clone(),start.clone()]);const line=new THREE.Line(geo,shootLineMat.clone());line.frustumCulled=false;scene.add(line);
  const head=addSprite(TEX_CORE,{fog:false,color:0xfff2d8});head.scale.setScalar(4);scene.add(head);shooting.push({line,head,start,dir,t0:performance.now()});
  $("wishBtn").hidden=false;clearTimeout(wishTimer);wishTimer=setTimeout(()=>{$("wishBtn").hidden=true;},9000);}
$("wishBtn").addEventListener("click",()=>{$("wishBtn").hidden=true;openPanel("pWish");});
$("wishGo").addEventListener("click",()=>{const v=$("wish").value.trim();if(!v){$("wish").focus();return;}
  $("wish").value="";openPanel(null);
  for(let i=0;i<14;i++){const p=me.root.position.clone();p.y=1.6;floatSprite(TEX_CORE,p,{scale:.25,vy:rnd(3,6),vx:rnd(-.7,.7),life:2600,add:true,color:0xfff0c8,grow:-.5});}
  toast("소원이 별에게 닿았어요. 이 말은 저장되지 않아요");});

/* 입력 */
const ray=new THREE.Raycaster();const ndc=new THREE.Vector2();let downAt=null;
let zoom=Math.max(.45,Math.min(2.4,Number(store.get("shelter.zoom"))||1)),camYaw=0;
function setZoom(z){zoom=Math.max(.45,Math.min(2.4,z));store.set("shelter.zoom",String(Math.round(zoom*100)/100));}
$("zIn").addEventListener("click",()=>setZoom(zoom/1.25));$("zOut").addEventListener("click",()=>setZoom(zoom*1.25));
let lookUp=0,lookUpCur=0,skyToasted=false,yawGoal=null;const skyV=new THREE.Vector3();
$("skyNav").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{yawGoal=SKY_DIRS[b.dataset.dir];segPick($("skyNav"),b);}));
function setLookUp(v){lookUp=Math.max(0,Math.min(1,v));$("zSky").setAttribute("aria-pressed",String(lookUp>.5));
  $("skyNav").hidden=!(lookUp>.5);
  if(lookUp>.5&&!skyToasted){skyToasted=true;toast("하늘을 올려다봐요 · 아래 버튼으로 달, 오로라, 별구름 쪽을 돌아볼 수 있어요",4600);}}
$("zSky").addEventListener("click",()=>setLookUp(lookUp>.5?0:1));
$("zReset").addEventListener("click",()=>{setZoom(1);camYaw=0;yawGoal=null;setLookUp(0);});
canvas.addEventListener("wheel",e=>{e.preventDefault();setZoom(zoom*Math.exp(e.deltaY*.0012));},{passive:false});
const ptrs=new Map();let pinchD=0;
canvas.addEventListener("pointerdown",e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{canvas.setPointerCapture(e.pointerId);}catch(_){}
  if(ptrs.size===1)downAt={x:e.clientX,y:e.clientY};else{downAt=null;const v=[...ptrs.values()];pinchD=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);}});
canvas.addEventListener("pointermove",e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size>=2){const v=[...ptrs.values()];const d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(pinchD>0&&d>0)setZoom(zoom*pinchD/d);pinchD=d;return;}
  if(downAt&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>10){yawGoal=null;camYaw-=dx*.006;if(Math.abs(dy)>Math.abs(dx)*.6)setLookUp(lookUp-dy*.0045);canvas.style.cursor="grabbing";}});
function endPtr(e){ptrs.delete(e.pointerId);if(ptrs.size<2)pinchD=0;canvas.style.cursor="";}
canvas.addEventListener("pointercancel",e=>{endPtr(e);downAt=null;});
canvas.addEventListener("pointerup",e=>{endPtr(e);if(!downAt)return;const moved=Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y);downAt=null;if(moved>10)return;
  ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  const targets=[mailbox];if(fairy)targets.push(fairy.g);peers.forEach((p,k)=>{p.root.userData={kind:"peer",key:k};targets.push(p.root);});
  npcs.forEach((n,i)=>{n.root.userData={kind:"npc",key:i};targets.push(n.root);});
  me.root.userData={kind:"me"};targets.push(me.root);lanterns.forEach(L=>targets.push(L.body,L.glow));
  const hit=ray.intersectObjects(targets,true)[0];
  if(hit){let o=hit.object;while(o&&!(o.userData&&o.userData.kind))o=o.parent;
    if(o){const u=o.userData;if(u.kind==="peer")return showPeerPop(u.key);if(u.kind==="npc")return showNpcPop(u.key);if(u.kind==="lantern")return showLanternPop(u.key);
      if(u.kind==="mailbox"){hidePop();return openPanel("pBoard");}if(u.kind==="fairy"&&fairy){hearts(me,4);if(fairy.phase==="talk"){fairy.t0=performance.now();fairySpeak(nextLine(fairy.kind));}return;}if(u.kind==="me"){hidePop();return openPanel("pEmote");}}}
  hidePop();openPanel(null);
  const pt=new THREE.Vector3();if(ray.ray.intersectPlane(groundPlane,pt)){
    if(me.inBoat){if(me.state!=="walk")setMyState("walk");
      if(pt.z<51){me.target.set(Math.max(-30,Math.min(30,pt.x)),0,51.6);me.returning=true;}
      else{me.target.set(Math.max(SEA_B.x0,Math.min(SEA_B.x1,pt.x)),0,Math.max(SEA_B.z0,Math.min(SEA_B.z1,pt.z)));me.returning=false;}
      groundPulse(me.target.x,me.target.z,0x9fb7d9);sendPresence(true);return;}
    const d=Math.hypot(pt.x,pt.z);if(d>RADIUS){pt.x*=RADIUS/d;pt.z*=RADIUS/d;}
    if(me.state!=="walk")setMyState("walk");
    me.target.set(pt.x,0,pt.z);groundPulse(pt.x,pt.z);sendPresence(true);}
});

const pop=$("pop");let popFor=null;const patCool=new Map();
function hidePop(){pop.hidden=true;popFor=null;}
const STATE_KO={walk:"산책 중",meditate:"명상 중",sleep:"자는 중"};const SP_KO=Object.fromEntries(SPECIES);const own=(o,k)=>typeof k==="string"&&Object.prototype.hasOwnProperty.call(o,k);
function showPeerPop(key){const p=peers.get(key);if(!p)return;popFor={kind:"peer",key};pop.replaceChildren();
  pop.append(el("div","txt",p.breathing?`숨 고르는 ${SP_KO[p.sp]||"친구"}`:`${STATE_KO[p.state]}인 ${SP_KO[p.sp]||"친구"}`));
  const b=el("button","btn","토닥이기");
  if(Date.now()<(patCool.get(key)||0)){b.disabled=true;b.textContent="방금 토닥였어요";}
  if(!room||!roomCanEmit){b.disabled=true;b.textContent="토닥일 수 없어요";}
  b.addEventListener("click",async()=>{if(!room)return;b.disabled=true;
    try{await room.emit("warm",{to:key});patCool.set(key,Date.now()+8000);b.textContent="토닥였어요";setTimeout(hidePop,900);}
    catch(err){if(err&&err.code==="not_permitted"){roomCanEmit=false;b.textContent="이 권한으로는 토닥일 수 없어요";}else{b.textContent="전하지 못했어요. 다시 눌러 주세요";b.disabled=false;}}});
  pop.append(b);
  if(p.breathing&&p.bs){const s=el("button","btn ghost","같은 박자로 숨쉬기");s.addEventListener("click",()=>{startBreath(p.bs);hidePop();toast("같은 박자로 숨을 쉬어요");});pop.append(s);}
  pop.hidden=false;}
function showNpcPop(i){const n=npcs[i];popFor={kind:"npc",key:i};pop.replaceChildren();
  const b=el("button","btn ghost","쓰다듬기");b.addEventListener("click",()=>{hearts(n,3);if(n.state==="walk")playEmote(n,"wave");hidePop();});
  pop.append(el("div","txt",`숲 친구 ${SP_KO[n.sp]} · ${STATE_KO[n.state]}`),el("div","small","혼자일 때도 곁에 있어 주는 친구예요"),b);pop.hidden=false;}
function showLanternPop(key){const L=lanterns.get(key);if(!L)return;popFor={kind:"lantern",key};pop.replaceChildren();
  pop.append(el("div","txt",L.text),el("div","small",(L.owner===true?"내가 건 등불":"누군가 건 등불")+" · "+ago(L.at)));
  const acts=el("div","acts");rowActs("lanterns",L.row,acts,"등불 내리기");if(acts.childNodes.length)pop.append(acts);
  pop.hidden=false;}
addEventListener("keydown",e=>{if(e.key==="Escape"){hidePop();openPanel(null);}});

/* 실시간 방 */
let lastPresence=0,presenceTimer=null;
function sendPresence(force){if(!room)return;
  const doSend=()=>{lastPresence=Date.now();room.presence({x:Math.round(me.target.x*100)/100,z:Math.round(me.target.z*100)/100,yaw:Math.round(me.yaw*100)/100,
    s:me.state,bt:me.inBoat?1:0,c:myColor,hat:myHatT,it:myItem,sp:mySp,b:breathing,bs:breathing?breathStart:0,e:lastEmote.e,et:lastEmote.et}).catch(()=>{});};
  clearTimeout(presenceTimer);if(force&&Date.now()-lastPresence>250)doSend();else presenceTimer=setTimeout(doSend,300);}
const MAX_PEERS=60;const patFrom=new Map();let patToastAt=0;
function applyPeer(pr){if(pr.kind!=="viewer")return;if(pr.isMe&&pr.sameTab){myPeer=pr.peer;return;}
  const ps=pr.presence||{};const x=Number(ps.x),z=Number(ps.z);if(!isFinite(x)||!isFinite(z))return;
  const ci=Math.max(0,Math.min(BODY_COLORS.length-1,Math.floor(Number(ps.c)||0)));const hat=Math.max(0,Math.min(5,Math.floor(Number(ps.hat)||0)));
  const it=Math.max(0,Math.min(4,Math.floor(Number(ps.it)||0)));const sp=own(SP_KO,ps.sp)?ps.sp:"round";
  let p=peers.get(pr.peer);const opts={color:BODY_COLORS[ci],hat,item:it,sp};
  if(!p&&peers.size>=MAX_PEERS)return;
  if(!p){p=makeChar(opts);const a=Math.random()*Math.PI*2;p.pos.set(x+Math.cos(a)*6,0,z+Math.sin(a)*6);peers.set(pr.peer,p);p.ci=ci;p.lastEt=Number(ps.et)||0;}
  else if(p.sp!==sp&&!(p.rebuiltAt>performance.now()-2000)){const keepEt=p.lastEt;p=rebuild(p,opts);p.rebuiltAt=performance.now();p.lastEt=keepEt;peers.set(pr.peer,p);p.ci=ci;}
  if(p.ci!==ci){p.bodyMat.color.set(BODY_COLORS[ci]);p.ci=ci;}setHat(p,hat);setItem(p,it);
  if(ps.bt){p.target.set(Math.max(SEA_B.x0,Math.min(SEA_B.x1,x)),0,Math.max(SEA_B.z0-.5,Math.min(SEA_B.z1,z)));}else{const d=Math.hypot(x,z);const k=d>RADIUS&&z<44?RADIUS/d:1;p.target.set(x*k,0,z*k);}
  if(!!ps.bt!==!!p.inBoat){setBoat(p,!!ps.bt);if(ps.bt)p.pos.copy(p.target);}
  const st=["walk","meditate","sleep"].includes(ps.s)?ps.s:"walk";
  if(st!=="walk"){p.pos.copy(p.target);if(isFinite(Number(ps.yaw)))p.yaw=Number(ps.yaw);}
  p.state=st;p.breathing=!!ps.b;p.bs=Number(ps.bs)||0;p.leaving=0;
  const et=Number(ps.et)||0;if(et&&et!==p.lastEt){p.lastEt=et;if(Date.now()-et<6000&&own(EMOTES,ps.e))playEmote(p,ps.e);}}
function dropPeer(peer){const p=peers.get(peer);if(p&&!p.leaving){p.leaving=performance.now();setCount();}}
startSupabase({onRoom(r){room=r;setCount();
    r.onPeers(ch=>{ch.peers.forEach(applyPeer);ch.left.forEach(p=>dropPeer(p.peer));const live=new Set(ch.peers.map(p=>p.peer));peers.forEach((v,k)=>{if(!live.has(k))dropPeer(k);});setCount();},()=>{room=null;setCount();});
    r.on("warm",msg=>{const to=msg&&msg.data&&msg.data.to;if(typeof to!=="string")return;
      const from=msg.sameTab?me:peers.get(msg.peer);const target=(to===myPeer)?me:peers.get(to);if(!from||!target)return;
      const nowT=Date.now();if(!msg.sameTab){if((patFrom.get(msg.peer)||0)>nowT)return;patFrom.set(msg.peer,nowT+4000);}if(flyers.length>80)return;
      flyers.push({s:null,fromC:from,toC:target,t0:performance.now(),dur:1500,kind:"pat"});
      if(to===myPeer&&!msg.sameTab&&nowT>patToastAt){patToastAt=nowT+5000;setTimeout(()=>toast("누군가 당신을 토닥여 줬어요"),1500);}},()=>{});
    sendPresence(true);},onLanterns:syncLanterns});

/* 등불 쓰기 */
$("note").addEventListener("input",e=>{$("noteState").textContent=`${e.target.value.length} / 80`;});
let noteBusy=false;
$("noteGo").addEventListener("click",async()=>{const v=$("note").value.trim();if(!v){$("note").focus();return;}
  if(!needDb($("noteState"))||noteBusy)return;noteBusy=true;$("noteGo").disabled=true;
  const {data,error}=await db.from("lanterns").insert({body:v.slice(0,80)}).select("id").single();
  if(error){$("noteState").textContent=errMsg(error,"걸지");}
  else{const s=addSprite(TEX_CORE,{color:0xffd59a});s.scale.setScalar(.8);scene.add(s);
    flyers.push({s,from:new THREE.Vector3(me.pos.x,1.8,me.pos.z),to:lanternSlot("l"+data.id),t0:performance.now(),dur:2400,kind:"lantern"});
    $("note").value="";$("noteState").textContent="나무에 걸었어요";openPanel(null);toast("등불이 나무로 날아가요");refreshSoon("lanterns");}
  noteBusy=false;$("noteGo").disabled=false;});

/* 루프 */
const clock=new THREE.Clock();let rounds=0,lastIdx=-1;
const camPos=new THREE.Vector3(),camLook=new THREE.Vector3();
camPos.copy(me.pos).add(new THREE.Vector3(0,6,11));camLook.copy(me.pos);
const moonEl=$("moonMsg"),medEl=$("medPhrase");
function frame(){const dt=Math.min(clock.getDelta(),.05);const t=clock.elapsedTime;const now=Date.now();const pnow=performance.now();
  starMat.uniforms.t.value=t;starMat.uniforms.dim.value=lerp(starMat.uniforms.dim.value,weather==="rain"?.25:weather==="snow"?.5:1,dt);
  if(breathing){const b=breathLevel(breathStart,now);
    if(b.i!==lastIdx){if(lastIdx===2&&b.i===0){rounds++;$("bRounds").textContent=`${rounds} / 4 회`;if(rounds===4)toast("네 번 다 했어요. 이대로 누워도 좋아요",5000);}lastIdx=b.i;}
    $("bPhase").textContent=CYCLE[b.i];$("bSec").textContent=String(Math.ceil(b.rem));}else{rounds=0;lastIdx=-1;}
  if(sleepSince){const m=(now-sleepSince)/60000;sleepDim=Math.max(0,Math.min(.45,(m-1)*.15));applyDim();}
  updateChar(me,dt,t,now);
  updateFairy(dt,t,pnow);
  if(me.inBoat&&me.returning&&Math.hypot(me.target.x-me.pos.x,me.target.z-me.pos.z)<.2){setBoat(me,false);me.returning=false;me.pos.z=45.6;me.target.copy(me.pos);sendPresence(true);toast("모래사장에 내렸어요");}
  {const show=curZone==="sea"||me.inBoat;const bb=$("boatBtn");if(bb.hidden===show)bb.hidden=!show;
   if(show){const tx=me.inBoat?(me.returning?"뭍으로 돌아가는 중이에요":"뭍으로 돌아가기"):"작은 배 타고 바다로 나가기";if(bb.textContent!==tx)bb.textContent=tx;}}
  window.__seaMat.uniforms.t.value=t;window.__lhBeam.rotation.y=-Math.PI/2+(reduce?0:Math.sin(t*.22)*1.15);window.__lhLamp.material.opacity=.75+.25*Math.sin(t*1.2);
  window.__boats.forEach(o=>{o.b.position.x+=o.dir*o.sp*dt;if(o.b.position.x>165)o.b.position.x=-165;if(o.b.position.x<-165)o.b.position.x=165;
    o.b.position.y=.05+(reduce?0:Math.sin(t*1.1+o.ph)*.12);o.b.rotation.x=reduce?0:Math.sin(t*.9+o.ph)*.06;o.lan.material.opacity=.8+.2*Math.sin(t*2+o.ph);});
  zoneFx.forEach(f=>{f.s.material.opacity=f.base*(reduce?1:.72+.28*Math.sin(t*2.6+f.ph));});
  {let zn="";for(const Z of ZONES){if(Math.hypot(Z.x-me.pos.x,Z.z-me.pos.z)<(Z.id==="fire"?6:9)){zn=Z.id;break;}}
   if(zn!==curZone){curZone=zn;if(zn&&clock.elapsedTime>3){const Z=Zp(zn);toast(`${Z.name}에 왔어요 · ${Z.desc}`,3200);}}}
  npcs.forEach(n=>{npcBrain(n,dt);updateChar(n,dt,t,now);});
  peers.forEach((p,k)=>{updateChar(p,dt,t,now);
    if(p.leaving){const f=(pnow-p.leaving)/1500;p.root.scale.setScalar(Math.max(.001,1-f));if(f>=1){scene.remove(p.root);peers.delete(k);setCount();if(popFor&&popFor.key===k)hidePop();}}});
  fireBoost=Math.max(0,fireBoost-dt*.6);
  flames.forEach((f,i)=>{const s=reduce?1:1+Math.sin(t*(7+i*2.3))*.08+Math.sin(t*13.1+i)*.05;f.m.scale.set(1+fireBoost*.4,s*(1+fireBoost*.9),1+fireBoost*.4);f.m.position.y=.2+f.h*f.m.scale.y/2;});
  fireLight.intensity=(reduce?2.1:2+Math.sin(t*9)*.25+Math.sin(t*15.7)*.15)*(1+fireBoost*.8);fireGlow.material.opacity=.75+fireBoost*.25;
  if(!reduce&&Math.random()<dt*2.2)spawnEmber(1);
  for(let i=embers.length-1;i>=0;i--){const e=embers[i];const f=(pnow-e.t0)/e.life;if(f>=1){scene.remove(e.s);e.s.material.dispose();embers.splice(i,1);continue;}
    e.s.position.addScaledVector(e.v,dt);e.v.x+=Math.sin(t*3+i)*dt*.3;e.s.material.opacity=1-f;}
  for(let i=0;i<FF_N;i++){const s=ffSeed[i];const tt=reduce?0:t*s.s;ffPos[i*3]=s.x+Math.sin(tt+s.p)*1.2;ffPos[i*3+1]=s.y+Math.sin(tt*1.7+s.p)*.4;ffPos[i*3+2]=s.z+Math.cos(tt*.8+s.p)*1.2;}
  ffGeo.attributes.position.needsUpdate=true;ffMat.opacity=(weather==="rain"?.25:.6)+Math.sin(t*1.3)*.3;
  const snowy=weather==="snow";groundMat.color.lerp(snowy?SNOW_C:GROUND_C,dt*.08);grassMat.color.lerp(snowy?GRASS_SNOW:GRASS_C,dt*.08);
  if(wPts.visible){const cx=camLook.x,cz=camLook.z;const fall=weather==="snow"?.9:.6;
    for(let i=0;i<WN;i++){let y=wPos[i*3+1]-wVel[i]*fall*dt;wPos[i*3]+=Math.sin(t*.8+i)*dt*(weather==="petal"?.8:.3);
      if(y<0){y=14+Math.random()*2;wPos[i*3]=cx+(Math.random()-.5)*44;wPos[i*3+2]=cz+(Math.random()-.5)*44;}wPos[i*3+1]=y;}
    wGeo.attributes.position.needsUpdate=true;}
  if(rLines.visible){const cx=camLook.x,cz=camLook.z;
    for(let i=0;i<WN;i++){let y=wPos[i*3+1]-wVel[i]*14*dt;if(y<0){y=14+Math.random()*2;wPos[i*3]=cx+(Math.random()-.5)*44;wPos[i*3+2]=cz+(Math.random()-.5)*44;}wPos[i*3+1]=y;
      rPos[i*6]=wPos[i*3];rPos[i*6+1]=y;rPos[i*6+2]=wPos[i*3+2];rPos[i*6+3]=wPos[i*3]+.04;rPos[i*6+4]=y+.45;rPos[i*6+5]=wPos[i*3+2];}
    rGeo.attributes.position.needsUpdate=true;}
  lanterns.forEach(L=>{L.g.position.set(L.base.x+(reduce?0:Math.sin(t*.8+L.ph)*.05),L.base.y+(reduce?0:Math.sin(t*1.1+L.ph)*.04),L.base.z);L.glow.material.opacity=.65+(reduce?0:Math.sin(t*1.7+L.ph)*.15);});
  for(let i=glows.length-1;i>=0;i--){const r=glows[i];const f=(pnow-r.t0)/(r.dur*1000);if(f>=1){scene.remove(r.m);r.m.material.dispose();glows.splice(i,1);continue;}
    r.m.scale.setScalar(.2+r.maxR*f);r.m.material.opacity=.6*(1-f)*(1-f);}
  for(let i=floaters.length-1;i>=0;i--){const fl=floaters[i];const f=(pnow-fl.t0)/fl.life;if(f>=1){scene.remove(fl.s);fl.s.material.dispose();floaters.splice(i,1);continue;}
    if(fl.follow){fl.off.y+=fl.vy*dt;fl.s.position.copy(fl.follow.root.position).add(fl.off);}else{fl.s.position.y+=fl.vy*dt;fl.s.position.x+=fl.vx*dt+(fl.wob?Math.sin(f*12)*fl.wob*dt:0);}
    const sc=fl.sc*Math.max(.05,1+fl.grow*f);fl.s.scale.set(sc*fl.aspect,sc,1);fl.s.material.opacity=f<.12?f/.12:1-(f-.12)/.88;}
  for(let i=flyers.length-1;i>=0;i--){const fy=flyers[i];const f=Math.min(1,(pnow-fy.t0)/fy.dur);
    if(fy.kind==="pat"){if(!fy.s){fy.s=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX_HEART,transparent:true,depthWrite:false}));fy.s.scale.setScalar(.5);scene.add(fy.s);}
      tmpV.lerpVectors(fy.fromC.root.position,fy.toC.root.position,f);tmpV.y=1.8+Math.sin(f*Math.PI)*2.4;fy.s.position.copy(tmpV);
      if(f>=1){scene.remove(fy.s);fy.s.material.dispose();flyers.splice(i,1);hearts(fy.toC,6);groundPulse(fy.toC.pos.x,fy.toC.pos.z,0xff9db4,2.2,1.8);}continue;}
    tmpV.lerpVectors(fy.from,fy.to,easeIO(f));tmpV.y+=Math.sin(f*Math.PI)*(fy.kind==="worry"?2.2:1.6);fy.s.position.copy(tmpV);
    if(fy.kind==="worry"){const sc=1-f*.85;fy.s.scale.set(6*sc,2*sc,1);fy.s.material.opacity=f<.7?1:1-(f-.7)/.3;}
    if(f>=1){scene.remove(fy.s);if(fy.kind==="worry")fy.s.material.map.dispose();fy.s.material.dispose();flyers.splice(i,1);
      if(fy.kind==="worry"){fireBoost=1.2;spawnEmber(28);toast("걱정을 모닥불에 넣었어요. 이 말은 저장되지 않아요");}}}
  if(sheepOn){if(pnow>sheepNext){sheepList.push(makeSheep());sheepNext=pnow+3300;}
    for(let i=sheepList.length-1;i>=0;i--){const s=sheepList[i];const f=(pnow-s.t0)/6000;const x=-5+f*10;let y=0;
      const jump=Math.abs(x)<1.1;if(jump)y=Math.sin((x+1.1)/2.2*Math.PI)*1.3;
      s.g.position.set(x,y+(!jump&&!reduce?Math.abs(Math.sin(f*40))*.06:0),0);s.g.rotation.z=jump?-Math.cos((x+1.1)/2.2*Math.PI)*.3:0;
      if(!s.counted&&x>0){s.counted=true;sheepN++;$("sheepCount").textContent=`양 ${koCount(sheepN)} 마리`;
        if(actx&&actx.state==="running")tone(bus,actx.currentTime,mtof(76+[0,2,4,7,9][sheepN%5]),1.4,{gain:.05});}
      if(f>=1){sheepGroup.remove(s.g);sheepList.splice(i,1);}}}
  if(lookUp>.5&&nextShoot-pnow>20000)nextShoot=pnow+3000+Math.random()*6000;
  if(pnow>nextShoot){if(weather!=="rain")spawnShoot();nextShoot=pnow+(lookUp>.5?8000+Math.random()*12000:35000+Math.random()*50000);}
  for(let i=shooting.length-1;i>=0;i--){const s=shooting[i];const f=(pnow-s.t0)/1400;
    if(f>=1){scene.remove(s.line);scene.remove(s.head);s.line.material.dispose();s.head.material.dispose();shooting.splice(i,1);continue;}
    const headP=s.start.clone().addScaledVector(s.dir,f*90);const tail=s.start.clone().addScaledVector(s.dir,Math.max(0,f*90-26));
    s.line.geometry.setFromPoints([tail,headP]);s.head.position.copy(headP);s.line.material.opacity=1-f;s.head.material.opacity=1-f;}
  // 카메라: 하늘이 보이도록 앞쪽을 바라봄
  const sleepCam=me.state==="sleep";
  const off=sleepCam?tmpV.set(0,narrow?8:6,narrow?10:8.5):narrow?tmpV.set(0,7,12.5):tmpV.set(0,5.2,10);
  off.multiplyScalar(zoom).applyAxisAngle(UP,camYaw);
  const wantPos=tmpV2.copy(me.pos).add(off);wantPos.x+=reduce?0:Math.sin(t*.15)*.3;
  camPos.lerp(wantPos,1-Math.exp(-dt*3));
  tmpV.set(0,sleepCam?.6:1.7,-(sleepCam?3:6)*Math.min(1.2,zoom)).applyAxisAngle(UP,camYaw).add(me.pos);
  lookUpCur+=(lookUp-lookUpCur)*Math.min(1,dt*2.5);
  if(yawGoal!==null){let d=yawGoal-camYaw;d=Math.atan2(Math.sin(d),Math.cos(d));camYaw+=d*Math.min(1,dt*2.2);if(Math.abs(d)<.003)yawGoal=null;}
  brightStars.forEach(b=>{b.s.material.opacity=b.base*(reduce?1:.65+.35*Math.sin(t*b.sp+b.ph));});
  nebulae.forEach(n=>{n.s.material.opacity=n.op*(.85+.15*Math.sin(t*.15+n.ph))*(1+.6*lookUpCur);});
  if(lookUpCur>.002){const e=easeIO(Math.min(1,lookUpCur));const pitch=.3*e;skyV.set(0,0,-1).applyAxisAngle(UP,camYaw);
    skyV.multiplyScalar(Math.cos(pitch)*60);skyV.y=Math.sin(pitch)*60;skyV.add(camPos);tmpV.lerp(skyV,e);}
  camLook.lerp(tmpV,1-Math.exp(-dt*3));
  auroraMat.uniforms.t.value=t;auroraMat.uniforms.amp.value=.5+.5*lookUpCur;
  camera.position.copy(camPos);camera.lookAt(camLook);
  // 시야를 가리는 나무는 반투명하게
  {const cx=camPos.x,cz=camPos.z,dx=me.pos.x-cx,dz=me.pos.z-cz,L2=dx*dx+dz*dz||1;
   treeObjs.forEach(T=>{let want=1;const u=((T.x-cx)*dx+(T.z-cz)*dz)/L2;
     if(u>-.05&&u<1.08){const d=Math.hypot(T.x-(cx+dx*u),T.z-(cz+dz*u));if(d<T.r*1.1+.9)want=.15;}
     if(Math.hypot(T.x-cx,T.z-cz)<T.r+1.5)want=.15;
     if(Math.abs(want-T.op)<.005&&(T.op===1||T.op===want))return;
     T.op+=(want-T.op)*Math.min(1,dt*7);if(Math.abs(want-T.op)<.01)T.op=want;const fade=T.op<.99;
     T.mats.forEach(m=>{m.transparent=fade;m.opacity=T.op;m.depthWrite=!fade;});});}
  // 달님 메시지 위치
  const busyCenter=breathing||sheepOn;
  if(moonOn&&!busyCenter){tmpV.copy(MOON).project(camera);let x=(tmpV.x*.5+.5)*innerWidth,y=(-tmpV.y*.5+.5)*innerHeight;
    const onScreen=tmpV.z<1&&x>40&&x<innerWidth-40&&y>60&&y<innerHeight*.5;
    if(onScreen){moonEl.style.left=Math.max(170,Math.min(innerWidth-170,x))+"px";moonEl.style.top=(y+innerHeight*.045)+"px";}
    else{moonEl.style.left="50%";moonEl.style.top=narrow?"20%":"16%";}
    moonEl.hidden=false;}
  else moonEl.hidden=true;
  // 명상 문구 위치
  if(me.state==="meditate"&&!medEl.hidden){me.head.getWorldPosition(tmpV);tmpV.y+=1.25;tmpV.project(camera);
    medEl.style.left=Math.max(150,Math.min(innerWidth-150,(tmpV.x*.5+.5)*innerWidth))+"px";medEl.style.top=Math.max(120,(-tmpV.y*.5+.5)*innerHeight)+"px";
    if(pnow-medShownAt>9000){medShownAt=pnow;nextMed();}}
  if(popFor){let obj=null;if(popFor.kind==="peer"){const p=peers.get(popFor.key);obj=p&&p.head;}else if(popFor.kind==="npc"){obj=npcs[popFor.key].head;}else{const L=lanterns.get(popFor.key);obj=L&&L.body;}
    if(!obj)hidePop();else{obj.getWorldPosition(tmpV);tmpV.y+=.6;tmpV.project(camera);const x=(tmpV.x*.5+.5)*innerWidth,y=(-tmpV.y*.5+.5)*innerHeight;
      pop.style.left=Math.max(140,Math.min(innerWidth-140,x))+"px";pop.style.top=Math.max(150,y)+"px";}}
  renderer.render(scene,camera);requestAnimationFrame(frame);}
setCount();requestAnimationFrame(frame);
setInterval(()=>{if(room)sendPresence(false);},20000);

})();
