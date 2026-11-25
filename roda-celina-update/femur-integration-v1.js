/* RODA · FEMUR: THE RIVAL — engine integration.
 * Loads after game-clarity-v1.js / story-v24.js / stage-rhythms-v32.js and before game-v24.js
 * overrides settle; hooks the engine's own functions so the rest of the roster is untouched.
 * No cords, no powers, no airborne attacks: unarmed Capoeira Angola only.
 */
'use strict';
(function(){
const FEMUR_ID=17;
// The live engine is served from a <base href> on another host; the Femur package ships
// beside this file, so resolve against the script's own directory, not the document base.
const FEMUR_ROOT=new URL('/roda/fighters/femur/',new URL(document.currentScript.src,location.href).origin).href;
const FEMUR_STAGES=[
 {key:'moonlit-colonnade',name:'MOONLIT COLONNADE',file:'arenas/moonlit-colonnade.webp'},
 {key:'ivory-arches',name:'HALL OF THE IVORY ARCHES',file:'arenas/ivory-arches.webp'},
 {key:'obsidian-crystal-shrine',name:'OBSIDIAN CRYSTAL SHRINE',file:'arenas/obsidian-crystal-shrine.webp'},
 {key:'indigo-hound-sanctuary',name:'INDIGO HOUND SANCTUARY',file:'arenas/indigo-hound-sanctuary.webp'},
 {key:'sealed-serpent-gate',name:'THE SEALED SERPENT GATE',file:'arenas/sealed-serpent-gate.webp'}
];
// The fifth slot intentionally reuses a supplied asset until its own file is confirmed; see manifest.
const FEMUR_ARENA_FILES=['moonlit-colonnade.webp','ivory-arches.webp','obsidian-crystal-shrine.webp','indigo-hound-sanctuary.webp','sealed-serpent-gate.webp'];
const FEMUR_ARENA_NAMES=['MOONLIT COLONNADE','HALL OF THE IVORY ARCHES','OBSIDIAN CRYSTAL SHRINE','INDIGO HOUND SANCTUARY','THE SEALED SERPENT GATE'];
const COSTUME_KEY='roda-femur-alt-angola-v1';
const FEMUR_FRAME={w:768,h:576,ax:240,ay:552};
// Femur is 170 cm tall against the roster's ~300-unit fighter field; the atlas cell is 448 tall.
// The roster draws every fighter at visualHeight = trait.height/174, and their sprite art is
// authored so that a 174cm fighter is 305 field units tall. Femur's art is normalised to a
// 390px figure, so scale = 305/390 * height/174 keeps her exactly in step with the cast.
const FEMUR_ART_HEIGHT=512, FEMUR_REF_UNITS=305, FEMUR_REF_CM=174;
function femurScaleFor(id){const cm=(typeof fighterTraits!=='undefined'&&fighterTraits[id]&&fighterTraits[id].height)||170;return FEMUR_REF_UNITS/FEMUR_ART_HEIGHT*(cm/FEMUR_REF_CM);}
const FEMUR_SCALE=femurScaleFor(17);

/* ---------- 1. Roster slot ---------- */
// The engine declares roster, playableIds, arenas and the other tables as consts, so this module
// never rebinds them. It records Femur's slot here and fills the hole on the shared objects.
const FEMUR_ROSTER_ENTRY=['Femur','The rival from another roda'];
// roster is a frozen array literal with a hole at 17. A frozen array cannot be extended, so the
// roster the UI reads is replaced by a frozen copy that carries Femur in the slot the art left.
// roster is the same array object the selection screen iterates: fill the hole in place.
// It already has 17 entries (the hole counts), so append Femur at the end of the hole's slot.
if(roster[FEMUR_ID]?.[0]!=='Femur'||!playableIds.includes(FEMUR_ID))throw new Error('Corrected game-clarity engine must reserve fighter ID 17');
const femurPlayableIds=Object.freeze(roster.flatMap((f,id)=>f?[id]:[]));
window.__femurRoster=roster.map((f,i)=>i+':'+(f?f[0]:'--')).join(' ');
window.__femurPlayable=femurPlayableIds.slice();
nextFighter=(function(original){return function(id,offset){
 const count=femurPlayableIds.length;
 return femurPlayableIds[(femurPlayableIds.indexOf(id)+offset+count)%count];
};})(nextFighter);
arcadeOpponents=function(playerId){return femurPlayableIds.filter(id=>id!==CELINA_ID&&(id!==playerId||id===HEATHER_ID));};
profiles[FEMUR_ID]={
 name:'Femur',
 home:'A roda of her own',
 personality:'Gula made her immortal. She seeks to become the Goddess above Goddesses. An independent rival to Mestre Maré and his students and both male protagonists. Unarmed Capoeira Angola only.',
 win:'I played the game you taught me. Now play mine.',
 lose:'You found the opening. I will find it next time.',
 pitch:198
};
fighterTraits[FEMUR_ID]={height:170,build:1.12,speed:4.9,tempo:.98,reach:1.02,power:1.04,style:'Grounded three-contact chains',signature:'Roda de Femur',accent:'#8fae72',variant:0};
fighterPlans[FEMUR_ID]='Six grounded three-kick chains · no Axé cost · planted ginga';

/* ---------- 2. Six three-contact chains (no power cost, ground only) ---------- */
const FEMUR_BUTTONS=[
 {button:'A',clip:'combo_a',phases:[['bencao','Benção','mid',0,11,7],['chapa','Chapa','mid',12,20,15],['martelo','Martelo','mid',21,28,24]]},
 {button:'B',clip:'combo_b',phases:[['low_chapa','Chapa baixa','low',0,7,2],['rasteira','Rasteira','low',8,14,11],['chapa','Chapa','mid',15,23,18]]},
 {button:'X',clip:'combo_x',phases:[['crescent','Meia-lua alta','high',0,11,7],['queixada','Queixada','high',12,22,17],['bencao','Benção','mid',23,34,30]]},
 {button:'Y',clip:'combo_y',phases:[['queixada','Queixada','high',0,10,5],['compasso','Meia-lua de compasso','mid',11,20,13],['crescent','Meia-lua alta','high',21,32,28]]},
 {button:'LB',clip:'combo_lb',phases:[['compasso','Meia-lua de compasso','mid',0,9,2],['low_chapa','Chapa baixa','low',10,17,12],['martelo','Martelo','mid',18,25,21]]},
 {button:'RB',clip:'combo_rb',phases:[['rasteira','Rasteira','low',0,6,3],['chapa','Chapa','mid',7,15,10],['queixada','Queixada','high',16,26,21]]}
];
function buildFemurMoves(){
 const old=moves;
 characterMoves[FEMUR_ID]=FEMUR_BUTTONS.map((kit,slot)=>{
  const phases=kit.phases.map(([key,name,level,first,last,contact])=>({
   key,name,level,rank:slot>=4?2:1,frames:last-first+1,
   range:level==='high'?214:level==='low'?196:204,
   damage:slot>=4?8:7,travel:0,knockdown:false,
   push:last===kit.phases[2][4]?3:0,contactFrame:contact-first
  }));
  const total=phases.reduce((n,p)=>n+p.frames,0);
  return {...old[slot],...phases[0],phases,name:kit.phases.map(p=>p[1]).join(' → '),
   signature:kit.button+' · THREE CONTACTS',label:'THREE-CONTACT CHAIN',rank:slot>=4?2:1,cost:0,
   start:8,active:total,end:14,retreat:0,groundOnly:true,authoredRow:null};
 });
}
buildFemurMoves();

/* ---------- 3. Frame art ---------- */
const femurClips={};
const femurImages={};
const femurAltImages={};
const femurClipMeta={"ginga": {"file": "ginga.webp", "count": 1, "columns": 6, "ms": 90, "loop": true}, "guard": {"file": "guard.webp", "count": 4, "columns": 4, "ms": 60, "loop": false}, "low_guard": {"file": "low_guard.webp", "count": 4, "columns": 4, "ms": 60, "loop": false}, "crouch": {"file": "crouch.webp", "count": 3, "columns": 3, "ms": 60, "loop": false}, "hit": {"file": "hit.webp", "count": 4, "columns": 4, "ms": 60, "loop": false}, "fall": {"file": "fall.webp", "count": 7, "columns": 6, "ms": 60, "loop": false}, "recover": {"file": "recover.webp", "count": 3, "columns": 6, "ms": 60, "loop": false}, "defeat": {"file": "defeat.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}, "round_win": {"file": "round_win.webp", "count": 22, "columns": 6, "ms": 90, "loop": true}, "advance": {"file": "advance.webp", "count": 12, "columns": 6, "ms": 90, "loop": true}, "retreat": {"file": "retreat.webp", "count": 10, "columns": 6, "ms": 90, "loop": true}, "jump": {"file": "jump.webp", "count": 8, "columns": 6, "ms": 60, "loop": false}, "roll_forward": {"file": "roll_forward.webp", "count": 12, "columns": 6, "ms": 29, "loop": false}, "roll_backward": {"file": "roll_backward.webp", "count": 12, "columns": 6, "ms": 29, "loop": false}, "kick_bencao": {"file": "01-bencao.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_chapa": {"file": "02-chapa.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_crescent": {"file": "04-meia-lua-de-frente.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_queixada": {"file": "05-queixada.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_martelo": {"file": "03-martelo.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_rasteira": {"file": "01-bencao.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_compasso": {"file": "06-meia-lua-de-compasso.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "kick_low_chapa": {"file": "01-bencao.png", "count": 6, "columns": 3, "ms": 80, "loop": false}, "combo_a": {"file": "combo_a.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}, "combo_b": {"file": "combo_b.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}, "combo_x": {"file": "combo_x.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}, "combo_y": {"file": "combo_y.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}, "combo_lb": {"file": "combo_lb.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}, "combo_rb": {"file": "combo_rb.webp", "count": 9, "columns": 6, "ms": 60, "loop": false}};
for(const [name,meta] of Object.entries(femurClipMeta)){
 const im=new Image();im.src=FEMUR_ROOT+meta.file;femurImages[name]=im;femurClips[name]=meta;
}
const femurPortrait=new Image();femurPortrait.src=FEMUR_ROOT+'select-card.webp';
const femurComics={};
const FEMUR_COMIC_KEYS=['femur_opening_celina','femur_student','femur_protagonist','femur_other','challenge_femur','aisha_challenge_femur','femur_victory','femur_defeat','player_defeats_femur','player_loses_to_femur'];
for(const key of FEMUR_COMIC_KEYS){const im=new Image();im.src=FEMUR_ROOT+'comics/'+key+'.webp';femurComics[key]=im;}

/* ---------- 4. Rendering ---------- */
function femurFrameRect(clip,index){
 const meta=femurClips[clip]||femurClips.ginga;
 const i=Math.max(0,Math.min(meta.count-1,Math.floor(index)));
 return {x:(i%meta.columns)*FEMUR_FRAME.w,y:Math.floor(i/meta.columns)*FEMUR_FRAME.h,w:FEMUR_FRAME.w,h:FEMUR_FRAME.h,meta};
}
const FEMUR_TICK_MS=1000/60;
function femurState(p){
 const hitAge=Math.max(0,tick-(Number.isFinite(p.hitAt)?p.hitAt:tick));
 const progress=(clip,t)=>({clip,age:Math.max(0,Math.min(.999999,t))*femurClips[clip].count*femurClips[clip].ms});
 if(p.hp<=0)return progress('defeat',hitAge/30);
 if(p.down>0){if(p.down<=14)return progress('recover',(14-p.down)/14);return progress('fall',hitAge/18);}
 if(p.stun>0&&!p.guardStun)return progress('hit',hitAge/Math.max(1,hitAge+p.stun));
 if(p.rollTime>0)return progress(p.rollDirection===p.dir?'roll_forward':'roll_backward',(24-p.rollTime)/24);
 if(p.attack!==null){
  const m=moveFor(p,p.attack),clip='combo_'+m.button.toLowerCase();
  if(p.at<m.start)return {clip,age:0};
  // One source pose per active game tick; the contact window uses the identical frame index.
  return {clip,age:Math.max(0,Math.min(femurClips[clip].count-1,p.at-m.start))*femurClips[clip].ms};
 }
 if(p.y>0||p.takeoff>0||p.landing>0)return progress('jump',p.takeoff>0?0:p.landing>0?.95:Math.max(.1,Math.min(.9,(14.8-p.vy)/29.6)));
 if(p.block)return {clip:p.crouch?'low_guard':'guard',age:tick*FEMUR_TICK_MS};
 if(p.crouch)return {clip:'crouch',age:tick*FEMUR_TICK_MS};
 if(Math.abs(p.vx)>.25)return {clip:p.vx*p.dir>0?'advance':'retreat',age:tick*FEMUR_TICK_MS};
 // Match the roster: everyone else stands on one pose until they travel.
 return {clip:'ginga',age:0};
}
function drawFemurFrame(p,clip,age,groundY){
 const im=femurImages[clip]||femurImages.ginga;if(!im||!im.complete||!im.naturalWidth)return false;
 const meta=femurClips[clip]||femurClips.ginga;const index=meta.loop?Math.max(0,Math.floor(age/meta.ms+1e-8))%meta.count:Math.max(0,Math.min(meta.count-1,Math.floor(age/meta.ms+1e-8)));
 const r=femurFrameRect(clip,index);
 const sc=femurScaleFor(p.id);ctx.save();ctx.translate(p.x,groundY);ctx.scale(p.dir<0?-sc:sc,sc);
 ctx.drawImage(im,r.x,r.y,r.w,r.h,-FEMUR_FRAME.ax,-FEMUR_FRAME.ay,r.w,r.h);ctx.restore();return true;
}
const femurOriginalDrawFighter=drawFighter;
drawFighter=function(p){
 if(p.id!==FEMUR_ID){femurOriginalDrawFighter(p);return}
 ctx.fillStyle='#10190f66';ctx.beginPath();ctx.ellipse(p.x,592,78,12,0,0,Math.PI*2);ctx.fill();
 const state=femurState(p);
 if(!drawFemurFrame(p,state.clip,state.age,590-p.y))drawFemurFrame(p,'ginga',tick*FEMUR_TICK_MS,590-p.y);
 if(p.combo>=2&&p.comboTimer>0){text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');text('COMBINATION',p.x,225,12,'#eee6c8','center')}
};
const femurOriginalFacePortrait=facePortrait;
facePortrait=function(c,id){
 if(id!==FEMUR_ID){femurOriginalFacePortrait(c,id);return}
 const im=femurPortrait;if(!im.complete||!im.naturalWidth){im.addEventListener('load',()=>facePortrait(c,id),{once:true});return}
 const g=c.getContext('2d');const ratio=c.width/c.height;
 const sw=Math.min(im.naturalWidth,im.naturalHeight*ratio),sh=sw/ratio;
 g.clearRect(0,0,c.width,c.height);
 g.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)*.10,sw,sh,0,0,c.width,c.height);
};
selectFaceBounds[FEMUR_ID]=[76,38,44];

/* ---------- 5. Portraits on the roster, result cards ---------- */
const femurPortraitSrc=FEMUR_ROOT+'select-card.webp';
// The roster grid paints from portraitImages[id]; give it Femur's card art.
portraitImages[FEMUR_ID]=femurPortrait;
const femurOriginalShowResultCard=showResultCard;
showResultCard=function(slot,id,whiteUniform){
 if(id===FEMUR_ID){const card=$('#'+slot+'portrait');card.src=femurPortraitSrc;card.alt='Femur fighter card';return}
 femurOriginalShowResultCard(slot,id,whiteUniform);
};

/* ---------- 6. Five arenas as Femur's own stages ---------- */
const FEMUR_STAGE_BASE=stageNames.length;
for(let i=0;i<FEMUR_ARENA_NAMES.length;i++){arenas.push({name:FEMUR_ARENA_NAMES[i],file:FEMUR_ROOT+'arenas/'+FEMUR_ARENA_FILES[i],owner:i===0?FEMUR_ID:undefined});}
stageNames.push(...FEMUR_ARENA_NAMES);
const femurArenaImages=FEMUR_ARENA_FILES.map(f=>{const im=new Image();im.src=FEMUR_ROOT+'arenas/'+f;return im});
homeStages.set(FEMUR_ID,FEMUR_STAGE_BASE);
const femurOriginalDrawArena=drawArena;
function femurSlotForStage(stage){const base=femurStageBase();return stage>=base&&stage<base+FEMUR_ARENA_FILES.length?stage-base:-1}
const femurDrawArena=function(){
 const slot=femurArenaSlotOverride!==null?femurArenaSlotOverride:femurSlotForStage(activeStage);
 // This adapter is loaded last; no render-time monkey patching.
 // Femur's stages are hers alone; everything else keeps the engine's own painter untouched.
 if(slot>=0&&slot<FEMUR_ARENA_FILES.length){drawFemurArena(slot);return}
 femurOriginalDrawArena();
};
let femurArenaSlotOverride=null;
function femurSetArenaSlot(slot){femurArenaSlotOverride=slot}
// Exposed for the test harness and for a future debug toggle; not used by gameplay.
window.__rodaFemurArena={paint:function(slot){drawFemurArena(slot)},slot:function(){return femurArenaSlotOverride},set:function(slot){femurArenaSlotOverride=slot;drawArena=femurDrawArena},draw:function(){return drawArena}};
function drawFemurArena(femurSlot){
 if(femurSlot<0||femurSlot>=FEMUR_ARENA_FILES.length)return;
 const im=femurArenaImages[femurSlot];
 if(im&&im.complete&&im.naturalWidth){
 const camera=players.length&&scene==='fight'?clamp(((players[0].x+players[1].x)/2-640)*.02,-10,10):0;
  // Fit 16:9 art to the 1280x660 field without distorting it.
  const scale=Math.max(W/im.naturalWidth,H/im.naturalHeight);
  const dw=im.naturalWidth*scale,dh=im.naturalHeight*scale;
  ctx.drawImage(im,(W-dw)/2-camera,(H-dh)/2,dw,dh);
 }else{
  ctx.drawImage(stage,0,0);return;
 }
 // The main renderer already draws the roda outline.
}

/* ---------- 7. Route: Femur first-Celina, after Aisha, after androids ---------- */
// Femur's arenas rotate across her own route; on someone else's route her bout takes the next one.
const FEMUR_STAGE_COUNT=FEMUR_ARENA_FILES.length;
// The shipped roster already leaves a hole at index 17; Femur's five arenas start at 18.
// Read the base from the live stage table each time: homeStages is rebuilt by the engine.
function femurStageBase(){return FEMUR_STAGE_BASE;}
function femurOwnStage(index){return femurStageBase()+(index%FEMUR_STAGE_COUNT)}
// The engine lays out Femur's route itself now. This module only has to give her bout a stage
// from her five arenas, because the engine's homeStageFor() maps her to a single home stage.
const femurOriginalMakeArcade=makeArcade;
makeArcade=function(){
 femurOriginalMakeArcade();
 if(chosen[0]===FEMUR_ID){arcadeStages.splice(0,arcadeStages.length,...arcadeOrder.map((_,i)=>femurOwnStage(i)));}
 else {const at=arcadeOrder.indexOf(FEMUR_ID);if(at>=0)arcadeStages[at]=femurOwnStage(0);}
};
// Aisha's final-bout transition is handled directly in the corrected engine. No duplicate wrapper.
/* ---------- 8. Comics ---------- */
const FEMUR_SCRIPTS={};
const FEMUR_FALLBACK_LINES={
 femur_opening_celina:[['FEMUR','I came for your school. Every student. Every champion.'],['CELINA','Then you can start with me.'],['FEMUR','Good. I want them to know who challenged them first.'],['CELINA','The roda will answer you.']],
 femur_student:[['FEMUR','Mestre Mare taught you. Show me what he taught.'],['STUDENT','The roda is not a challenge. It is a conversation.'],['FEMUR','Then speak with your feet.'],['STUDENT','Ginga first. Always ginga.']],
 femur_protagonist:[['FEMUR','You are the ones they talk about.'],['CHAMPION','We earned that. In the roda.'],['FEMUR','Then no exceptions. Not for you.'],['CHAMPION','No exceptions.']],
 femur_other:[['FEMUR','Another roda. Another champion.'],['CHAMPION','You will not find this one easy.'],['FEMUR','I did not come for easy.'],['CHAMPION','Then come and play.']],
 challenge_femur:[['FEMUR','Aisha has fallen. That leaves only me.'],['CHAMPION','You waited until the end.'],['FEMUR','I wanted the whole school to watch.'],['CHAMPION','Then the whole school answers.']],
 aisha_challenge_femur:[['FEMUR','Every machine you built, I put down.'],['AISHA','Then the last answer is mine.'],['FEMUR','You build. I play.'],['AISHA','Let us find out.']],
 femur_victory:[['FEMUR','The roda answered. It answered me.'],['FEMUR','Tell Mestre Mare his students held, and it was not enough.'],['FEMUR','I wear this Angola now. I earned it here.'],['FEMUR','Next time, bring more.']],
 femur_defeat:[['CELINA','You played well. That is not the same as winning.'],['FEMUR','I do not need the win. I needed the roda.'],['CELINA','Then come back and play again.'],['FEMUR','I will. Count on it.']],
 player_defeats_femur:[['FEMUR','You found the opening.'],['CHAMPION','The roda always has one.'],['FEMUR','Then I will find yours next time.'],['CHAMPION','We will be here.']],
 player_loses_to_femur:[['FEMUR','You fought the whole school and still came.'],['CHAMPION','Somebody had to answer you.'],['FEMUR','Somebody did. It was not enough.'],['CHAMPION','Not yet.']]
};
function femurComicPanels(key,opponentName){
 const script=FEMUR_SCRIPTS[key];
 if(!script||!Array.isArray(script.panels)){
  const fallback=FEMUR_FALLBACK_LINES[key];
  if(!fallback)return [];
  const playerName=profiles[chosen[0]]?profiles[chosen[0]].name:'You';
  const fix=line=>String(line).replace(/OPPONENT/g,opponentName).replace(/PLAYER/g,playerName);
  return fallback.map(([speaker,speech])=>({speaker:fix(speaker),speech:fix(speech)}));
 }
 const playerName=profiles[chosen[0]]?profiles[chosen[0]].name:'You';
 const resolve=line=>String(line||'').replace(/OPPONENT/g,opponentName).replace(/PLAYER/g,playerName);
 return script.panels.map(panel=>({speaker:resolve(panel.speaker),speech:resolve(panel.dialogue)}));
}
function femurComicKeyFor(opponent){
 if(chosen[0]===FEMUR_ID){
  if(opponent===CELINA_ID)return 'femur_opening_celina';
  if(isProtagonist(opponent))return 'femur_protagonist';
  if(opponent===AISHA_ID||opponent===HEATHER_ID)return 'femur_other';
  return 'femur_student';
 }
 return opponent===FEMUR_ID?(mode==='aisha'||chosen[0]===AISHA_ID?'aisha_challenge_femur':'challenge_femur'):null;
}
function paintFemurComic(title,place,key,panels){
 // Own painter: the shared one prints 'undefined undefined' for the illustration-only entry.
 $('#storytitle').textContent=title;$('#storyplace').textContent=place;
 const strip=$('#story .family-comic');strip.replaceChildren();
 const art=document.createElement('img');art.className='chapter-art';art.style.cssText='display:block;width:100%;max-width:1040px;height:auto;margin:0 auto 18px';
 art.src=FEMUR_ROOT+'comics/'+key+'.webp';art.alt=title+' — Femur story page';strip.append(art);
 const dialogue=document.createElement('div');dialogue.className='chapter-dialogue';
 for(const panel of panels){
  if(!panel.speech)continue;
  const line=document.createElement('p'),speaker=document.createElement('strong');
  speaker.textContent=(panel.speaker||'')+' ';line.append(speaker,panel.speech);dialogue.append(line);
 }
 strip.append(dialogue);
}
function openFemurComic(key){
 const opponentId=chosen[1],opponentName=profiles[opponentId]?profiles[opponentId].name:'the roda';
 const art=femurComics[key];
 storyEnding=false;storyPrologue=false;storyReturn='fight';scene='story';show('story');storyTime=arcadeAutoplay?1080:Infinity;
 const pages=femurComicPanels(key,opponentName);
 window.__femurArt=art;
 paintFemurComic(FEMUR_SCRIPTS[key]?.title||'Femur · The Rival',
  'Femur · RODA',key,pages);
 const femurArt=document.querySelector('#story .chapter-art');
 if(femurArt)femurArt.style.cssText='display:block;width:100%;max-width:1040px;height:auto;margin:0 auto 18px';
 $('#storychapter').textContent='FEMUR · THE RIVAL';
 $('#storyopponent').textContent=chosen[0]===FEMUR_ID?'YOU · FEMUR':'NEXT: FEMUR';
 $('#storyrole').textContent='Bout '+(arcadeIndex+1)+' of '+arcadeOrder.length+' · '+formatLabel()+' · 99 seconds';
 $('#storyadvance').textContent='A · ENTER THE RODA';setStoryHint();
 if(typeof setStageMusic==='function')setStageMusic(activeStage);
}
const femurOriginalOpenStory=openStory;
openStory=function(ending){
 if(!ending){
  const key=femurComicKeyFor(chosen[1]);
  if(key){openFemurComic(key);return}
  // Femur's route never shows the ordinary Celina interludes.
  if(chosen[0]===FEMUR_ID){storyReturn='fight';advanceStory();return}
 }
 femurOriginalOpenStory(ending);
};

/* ---------- 9. Endings and earned costume eligibility ---------- */
// The supplied alternate uniform art is not a complete playable costume. Record eligibility,
// not a selectable unlock, until the full matching animation set is available.
const EARNED_KEY='roda-femur-alt-angola-earned-v1';
let femurAltEarned=false;
try{femurAltEarned=localStorage.getItem(EARNED_KEY)==='1'}catch(e){}
function grantFemurCostume(){
 if(arcadeAutoplay||mode!=='solo'||chosen[0]!==FEMUR_ID||matchWinner!==0||arcadeIndex!==arcadeOrder.length-1||femurAltEarned)return false;
 femurAltEarned=true;try{localStorage.setItem(EARNED_KEY,'1')}catch(e){}return true;
}
let femurEndingAction=null;
const femurOriginalAdvanceStory=advanceStory;
advanceStory=function(){
 if(storyReturn==='femur-ending'&&femurEndingAction){const next=femurEndingAction;femurEndingAction=null;storyReturn='fight';next();return;}
 return femurOriginalAdvanceStory.apply(this,arguments);
};
$('#storyadvance').onclick=()=>advanceStory();
const femurOriginalAutoContinue=autoContinue;
autoContinue=function(){
 if(!matchOver||mode==='training')return femurOriginalAutoContinue.apply(this,arguments);
 const selected=chosen[0]===FEMUR_ID, opposing=chosen[1]===FEMUR_ID;
 const terminal=mode==='aisha'?opposing:arcadeIndex===arcadeOrder.length-1;
 const won=matchWinner===0;
 if((selected&&mode==='solo'&&(!won||terminal))||(opposing&&terminal&&(mode==='solo'||mode==='aisha'))){
  const key=selected?(won?'femur_victory':'femur_defeat'):(won?'player_defeats_femur':'player_loses_to_femur');
  if(selected&&won&&!arcadeAutoplay)grantFemurCostume();
  femurEndingAction=()=>{if(mode==='aisha'){continueAndroidRun();return;}if(won&&!arcadeAutoplay){openArcadeScore();return;}returnToMenu();};
  openFemurComic(key);storyReturn='femur-ending';$('#storyadvance').textContent='A · CONTINUE';
  if(selected&&won)$('#storyrole').textContent='Campaign clear · alternate costume earned; playable costume artwork pending';
  return;
 }
 return femurOriginalAutoContinue.apply(this,arguments);
};
const femurOriginalOpenComicEnding=openComicEnding;
openComicEnding=function(){
 if(mode==='solo'&&(chosen[0]===FEMUR_ID||chosen[1]===FEMUR_ID)&&arcadeIndex===arcadeOrder.length-1){
  const key=chosen[0]===FEMUR_ID?(matchWinner===0?'femur_victory':'femur_defeat'):(matchWinner===0?'player_defeats_femur':'player_loses_to_femur');
  femurEndingAction=()=>{if(arcadeAutoplay||matchWinner!==0)returnToMenu();else openArcadeScore();};
  openFemurComic(key);storyReturn='femur-ending';$('#storyadvance').textContent='A · CONTINUE';return;
 }
 return femurOriginalOpenComicEnding.apply(this,arguments);
};
/* ---------- 11. Load scripts + clip images, then the rest of the engine ---------- */
let femurLoadPromise;
function femurLoadAll(){
 if(femurLoadPromise)return femurLoadPromise;
 femurLoadPromise=(async()=>{
  const [manifest,scripts]=await Promise.all([
   fetch(FEMUR_ROOT+'manifest.json').then(r=>{if(!r.ok)throw new Error('Femur manifest HTTP '+r.status);return r.json();}),
   fetch(FEMUR_ROOT+'comic-scripts.json').then(r=>{if(!r.ok)throw new Error('Femur comic scripts HTTP '+r.status);return r.json();})
  ]);
  Object.assign(FEMUR_SCRIPTS,scripts.comics||scripts);
  for(const [n,c] of Object.entries(femurClipMeta)){const d=manifest.clips[n];if(!d||d.file!==c.file||d.columns!==c.columns||d.count!==c.count)throw new Error('Femur atlas manifest mismatch: '+n);}
  await Promise.all([...Object.values(femurImages),femurPortrait,...Object.values(femurComics),...femurArenaImages].map(async im=>{if(!im.complete||!im.naturalWidth)await im.decode();if(!im.naturalWidth)throw new Error('Missing Femur image '+im.src);}));
 })();return femurLoadPromise;
}
// Take over the arena painter now that every other module has had its say.
drawArena=femurDrawArena;
window.RODAFemur={
 id:FEMUR_ID,stageBase:function(){return femurStageBase()},setArenaSlot:femurSetArenaSlot,arenaNames:FEMUR_ARENA_NAMES,altUnlocked:()=>false,altEarned:()=>femurAltEarned,grant:grantFemurCostume,
 stateClip:p=>femurState(p).clip,ready:()=>femurLoadAll(),comicKeys:FEMUR_COMIC_KEYS
};
})();
