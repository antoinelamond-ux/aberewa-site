const sentinelScoresURL='https://roda-angola-arcade.woodsystone14.chatgpt.site/api/sentinel-scores';
const sentinelQueuePrefix='roda-sentinel-pending-';
const sentinelAwards=['','Bronze Sentinel','Silver Sentinel','Gold Sentinel','Sentinel Champion'];
function sentinelAward(defeated){return sentinelAwards[Math.floor(defeated/5)];}
const sendingSentinelRuns=new Set();
async function sendSentinelRun(run){
 if(sendingSentinelRuns.has(run.id))return;
 sendingSentinelRuns.add(run.id);
 try{
  const response=await fetch(sentinelScoresURL,{method:'POST',body:JSON.stringify(run)});
  if(!response.ok || !(await response.json()).saved)throw new Error('Score pending');
  try{localStorage.removeItem(sentinelQueuePrefix+run.id)}catch{}
  if(androidRunId===run.id)androidSaveState='SCORE SAVED';
 }catch{
  if(androidRunId===run.id)androidSaveState='SCORE PENDING';
 }finally{
  sendingSentinelRuns.delete(run.id);
  if(mode==='aisha'&&scene==='watchcomplete'&&androidRunId===run.id)showAndroidOutcome();
 }
}
function retrySentinelScores(){
 try{for(const key of Object.keys(localStorage))if(key.startsWith(sentinelQueuePrefix)){
  const run=JSON.parse(localStorage.getItem(key));if(run)sendSentinelRun(run);
 }}catch{}
}
window.addEventListener('online',retrySentinelScores);
function saveAndroidOutcome(){
 if(arcadeScore.completed)return;
 const defeated=matchWinner===0?ANDROID_LIMIT:androidWave-1;
 if(defeated===ANDROID_LIMIT)award('clear',5000);
 arcadeScore.completed=true;
 rankStore.androidEarnings=(Number(rankStore.androidEarnings)||0)+arcadeScore.total;
 rankStore.androidBest=Math.max(Number(rankStore.androidBest)||0,defeated);
 persistRanks();
 const run={id:androidRunId,score:arcadeScore.total,defeated};
 try{localStorage.setItem(sentinelQueuePrefix+run.id,JSON.stringify(run))}catch{}
 androidSaveState='SAVING SCORE';sendSentinelRun(run);
}
function showAndroidOutcome(){
 const defeated=matchWinner===0?ANDROID_LIMIT:androidWave-1;
 const format=amount=>(amount/100).toLocaleString('en-US',{style:'currency',currency:'USD'});
 const awardName=sentinelAward(defeated);
 $('#watchcomplete h2').textContent=(defeated===20?'ALL 20 ANDROIDS DEFEATED':'GAME OVER · '+defeated+' / 20 ANDROIDS DEFEATED')+(awardName?' · '+awardName.toUpperCase():'');
 $('#sessionlabel').textContent='EARNED '+format(arcadeScore.total)+' · '+androidSaveState;
}
