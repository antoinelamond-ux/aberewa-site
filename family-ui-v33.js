/* RODA 3.3: May and Vovo's story, with the active arcade roster. */
(() => {
 'use strict';
 const begin=document.querySelector('#entermenu');if(begin)begin.onclick=startOpeningFilm;
 const replay=document.querySelector('#replayintro');if(replay)replay.onclick=()=>openOpeningComic('menu');
 const next=document.querySelector('#storyadvance');if(next)next.onclick=()=>advanceStory();
 const previous=document.querySelector('#endingprev');if(previous)previous.onclick=()=>{comicPage=Math.max(0,comicPage-1);paintComicEnding()};
 const finish=document.querySelector('#endingnext');if(finish)finish.onclick=()=>advanceComicEnding();
 for(const id of ['storyportrait']){const element=document.getElementById(id);if(element){element.hidden=true;element.style.display='none'}}
 setRounds();
})();

const protagonistKits={
 11:[['bencao','rasteira','chapa'],['rasteira','costas','bencao'],['chapa','martelo','frente'],['costas','chapa','rasteira'],['frente','bencao','costas'],['martelo','rasteira','chapa']],
 13:[['frente','armada','costas'],['costas','rasteira','frente'],['martelo','armada','chapa'],['armada','bencao','martelo'],['rasteira','chapa','armada'],['chapa','frente','martelo']]
};
for(const [id,kits] of Object.entries(protagonistKits)){
 characterMoves[id]=kits.map((keys,button)=>{
  const phases=keys.map((key,i)=>({...techniqueBook[key],key,frames:12,range:195,damage:5+i,rank:2,knockdown:i===2,push:i===2?3:0}));
  return {...phases[0],button:moves[button].button,name:keys.map(k=>techniqueBook[k].name).join(' → '),start:9,active:36,end:14,cost:0,phases};
 });
}
const watchComplete=document.createElement('section');
watchComplete.id='watchcomplete';watchComplete.className='overlay';watchComplete.hidden=true;
watchComplete.innerHTML='<h2>ARCADE COMPLETE</h2><button id="watchdone">A · RETURN TO MAIN MENU</button>';
$('.screen').append(watchComplete);
$('#watchdone').onclick=()=>{watchComplete.hidden=true;returnToMenu()};


const openingScreen=document.createElement('section');
openingScreen.hidden=true;
openingScreen.style.cssText='position:absolute;inset:0;z-index:1000;background:#000;text-align:center';
openingScreen.setAttribute('aria-label','RODA opening film');
const openingFilm=document.createElement('video');
openingFilm.playsInline=true;openingFilm.controls=true;openingFilm.preload='none';
openingFilm.style.cssText='display:block;width:100%;height:84%;object-fit:contain';
const openingPlay=document.createElement('button');
openingPlay.textContent='PLAY WITH SOUND';openingPlay.hidden=true;
const openingSkip=document.createElement('button');
openingSkip.textContent='B / START · SKIP INTRO';
openingScreen.append(openingFilm,openingPlay,openingSkip);
$('.screen').append(openingScreen);
function playOpeningFilm(){
 openingFilm.muted=!sound;
 openingFilm.play().then(()=>{openingPlay.hidden=true}).catch(()=>{
  if(scene!=='openingfilm')return;
  openingPlay.hidden=false;
  openingFilm.muted=true;
  openingFilm.play().catch(()=>{});
 });
}
function startOpeningFilm(){
 if(scene!=='title')return;
 initAudio();localMusic?.pause();musicCommand('pauseVideo');
 scene='openingfilm';show(null);openingScreen.hidden=false;
 openingFilm.src='comic/roda-opening.mp4';playOpeningFilm();
}
function finishOpeningFilm(){
 if(scene!=='openingfilm')return;
 openingFilm.pause();openingScreen.hidden=true;openOpeningComic('menu');
}
openingPlay.onclick=playOpeningFilm;openingSkip.onclick=finishOpeningFilm;
openingFilm.onended=finishOpeningFilm;openingFilm.onerror=finishOpeningFilm;
