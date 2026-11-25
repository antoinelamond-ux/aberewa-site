'use strict';
const campaignStageArt = new Map();
function arenaArt(file) {
 if (!campaignStageArt.has(file)) {
  const image=new Image();
  image.src=file;
  campaignStageArt.set(file,image);
 }
 return campaignStageArt.get(file);
}
window.drawArena=function(){
 const arena=arenas[activeStage]??arenas[DEFAULT_STAGE];
 const image=arenaArt(arena.file);
 if (!image.naturalWidth) {
  ctx.clearRect(0,0,W,H);
  return;
 }
 if (arena.tile===undefined) {
  ctx.drawImage(image,0,0,W,H);
  return;
 }
 // These paintings are packed two across and three down on the original stage sheets.
 const width=image.naturalWidth/2, height=image.naturalHeight/3;
 ctx.drawImage(image,(arena.tile%2)*width,Math.floor(arena.tile/2)*height,width,height,0,0,W,H);
};
