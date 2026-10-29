/* DUSTBYTE. Original 16-bit-style raster assets, canvas effects, audio and game logic. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), canvas=$('game'), g=canvas.getContext('2d',{alpha:false});
g.imageSmoothingEnabled=false;
const art=window.DustbyteArt, armor=window.DeadMoonArmor;
let effects=[];
if(art){$('start').disabled=true;$('start').querySelector('span').textContent='LOADING ART...';art.ready.then(ok=>{$('load-status').textContent=ok?'ENTER / PRESS START':'ART FAILED TO LOAD · RELOAD';$('start').disabled=false;$('start').querySelector('span').textContent=ok?'START GAME':'RELOAD ART';});}
const W=640,H=360,GROUND=304,LENGTH=4300,ACID='#ffb65f',CYAN='#e8d6aa';
const glyph={
A:['01110','11011','11011','11111','11011','11011','11011'],B:['11110','11011','11011','11110','11011','11011','11110'],C:['01111','11000','11000','11000','11000','11000','01111'],D:['11110','11011','11011','11011','11011','11011','11110'],E:['11111','11000','11000','11110','11000','11000','11111'],F:['11111','11000','11000','11110','11000','11000','11000'],G:['01111','11000','11000','11011','11011','11011','01111'],H:['11011','11011','11011','11111','11011','11011','11011'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00011','00011','00011','11011','11011','01110'],K:['11011','11011','11110','11100','11110','11011','11011'],L:['11000','11000','11000','11000','11000','11000','11111'],M:['11011','11111','11111','11011','11011','11011','11011'],N:['11011','11111','11111','11111','11011','11011','11011'],O:['01110','11011','11011','11011','11011','11011','01110'],P:['11110','11011','11011','11110','11000','11000','11000'],Q:['01110','11011','11011','11011','11011','11110','01111'],R:['11110','11011','11011','11110','11100','11010','11011'],S:['01111','11000','11000','01110','00011','00011','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['11011','11011','11011','11011','11011','11011','01110'],V:['11011','11011','11011','11011','11011','01110','00100'],W:['11011','11011','11011','11011','11111','11111','01010'],X:['11011','11011','01110','00100','01110','11011','11011'],Y:['11011','11011','11011','01110','00100','00100','00100'],Z:['11111','00011','00110','00100','01100','11000','11111'],
'0':['01110','11011','11011','11011','11011','11011','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','11011','00011','00110','01100','11000','11111'],'3':['11110','00011','00011','01110','00011','00011','11110'],'4':['11011','11011','11011','11111','00011','00011','00011'],'5':['11111','11000','11000','11110','00011','00011','11110'],'6':['01111','11000','11000','11110','11011','11011','01110'],'7':['11111','00011','00110','00100','01100','01100','01100'],'8':['01110','11011','11011','01110','11011','11011','01110'],'9':['01110','11011','11011','01111','00011','00011','11110'],
'<':['00001','00010','00110','01100','00110','00010','00001'],' ':['00000','00000','00000','00000','00000','00000','00000'],'/':['00001','00011','00010','00100','01000','11000','10000'],'-':['00000','00000','00000','11111','00000','00000','00000'],':':['00000','00100','00100','00000','00100','00100','00000'],'.':['00000','00000','00000','00000','00000','00110','00110'],'+':['00000','00100','00100','11111','00100','00100','00000'],'!':['00100','00100','00100','00100','00100','00000','00100'],'>':['10000','11000','01100','00110','01100','11000','10000']};
function text(str,x,y,size=1,color='#f1e6cc',align='left'){
 str=String(str).toUpperCase();if(align==='center')x-=str.length*6*size/2;if(align==='right')x-=str.length*6*size;
 g.fillStyle=color;for(const ch of str){const rows=glyph[ch]||glyph[' '];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(rows[j][i]==='1')g.fillRect(Math.round(x+i*size),Math.round(y+j*size),size,size);x+=6*size;}
}
// Sound is synthesized on-device, and starts only after a user gesture.
let audio=null,soundOn=false,master=null,nextBeat=0,beat=0;
function audioInit(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();master=audio.createGain();master.gain.value=.3;master.connect(audio.destination);}if(audio.state==='suspended')audio.resume().catch(()=>{});}
function tone(freq,type,duration,vol=.15,end=0){if(!soundOn||!audio)return;const t=audio.currentTime,o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(v);v.connect(master);o.start(t);o.stop(t+duration);}
function noise(duration=.1,vol=.1){if(!soundOn||!audio)return;const b=audio.createBuffer(1,Math.floor(audio.sampleRate*duration),audio.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=audio.createBufferSource(),v=audio.createGain(),f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;s.buffer=b;v.gain.value=vol;s.connect(f);f.connect(v);v.connect(master);s.start();}
function sfx(kind){if(kind==='shot'){tone(190,'square',.05,.07,65);noise(.035,.06);}if(kind==='boom'){tone(80,'sawtooth',.3,.25,20);noise(.38,.4);}if(kind==='hit'){tone(150,'square',.14,.12,40);noise(.1,.12);}if(kind==='jump')tone(200,'square',.1,.06,440);if(kind==='pickup'){tone(580,'square',.08,.08,880);setTimeout(()=>tone(880,'square',.14,.07,1100),70);}if(kind==='dash')noise(.2,.16);}
function toggleSound(){soundOn=!soundOn;$('option-sound').textContent=soundOn?'SOUND: ON':'SOUND: OFF';if(soundOn)audioInit();$('sound').querySelector('span').textContent=soundOn?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-label',soundOn?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)tone(440,'triangle',.1,.2,660);}
let seed=71027;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}function hash(n){let v=Math.sin(n*127.1+19.7)*43758.5453;return v-Math.floor(v);}function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function poly(points,c){g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(Math.round(x),Math.round(y)):g.moveTo(Math.round(x),Math.round(y)));g.closePath();g.fill();}
function circle(x,y,r,c){g.fillStyle=c;for(let yy=-r;yy<=r;yy++){const xx=Math.floor(Math.sqrt(r*r-yy*yy));g.fillRect(Math.round(x-xx),Math.round(y+yy),xx*2+1,1);}}
let state='menu',clock=0,elapsed=0,cam=0,shake=0,flash=0,score=0,kills=0,checkpoint=0,usedCheckpoint=false,best=0,bossTriggered=false,winTimer=0;
try{best=Number(localStorage.getItem('dustbyte-best')||0);}catch(e){}
let player,enemies=[],shots=[],hostiles=[],particles=[],grenades=[],pickups=[],crates=[],hazards=[],texts=[],boss=null;
const held=new Set(),pressed=new Set(),touch=new Set(),padHeld=new Set();
const controller={index:null,previous:new Set(),needsNeutral:false,suspended:false};
const binds={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyJ:'fire',KeyZ:'fire',KeyK:'grenade',KeyX:'grenade',ShiftLeft:'dash',ShiftRight:'dash'};
const stick={x:0,y:0,pointer:null},actionPointers=[];
const down=k=>held.has(k)||touch.has(k)||padHeld.has(k)||(k==='left'&&stick.x<0)||(k==='right'&&stick.x>0)||(k==='up'&&stick.y<0)||(k==='down'&&stick.y>0),tap=k=>pressed.has(k);
function playerHeight(){return player?.crawling?20:player?.crouching?29:43;}
function playerWidth(){return player?.crawling?17:9;}
function canStand(){return !isCity()||!cityGeometry().some(p=>player.x+9>p.x&&player.x-9<p.x+p.w&&player.y>p.y+.01&&player.y-43<p.y+p.h-.01);}
function updateStance(move){
 const vertical=(down('down')?1:0)-(down('up')?1:0),blocked=!canStand(),low=player.onGround&&(vertical>0||blocked);
 player.crouching=low;player.crawling=low&&(!!move||(player.crawling&&blocked));
 // Down on the ground is a low stance. In the air it aims down.
 const ay=vertical<0?-1:vertical>0&&!player.onGround?1:0;
 const ax=move||(ay?0:player.face),length=Math.hypot(ax,ay)||1;
 player.aimX=ax/length;player.aimY=ay/length;
}
function directionalPose(){
 if(player.crawling)return 5+[0,1,2,1][Math.floor(player.anim)%4];
 if(player.crouching)return 4;
 if(player.aimY<0)return Math.abs(player.aimX)>.1?0:1;
 if(player.aimY>0)return Math.abs(player.aimX)>.1?2:3;
 return -1;
}
function armorStatus(){return armor.status(player?.hp??armor.maxHP);}
function armorSet(){return art?.loaded?art.frames.armor[isCity()?1:0][armorStatus().row]:null;}
function directionalFrame(){const set=armorSet(),pose=directionalPose();return set&&pose>=0?set.actions[[1,2,3,4,5,6,7,6][pose]]:null;}
function armorFrame(anim=player.vx?player.anim+.000001:0,air=!player.onGround,dashing=player.dash>0){const set=armorSet();return set?(anim||air||dashing?set.run[air||dashing?3:Math.floor(anim)%8]:set.actions[0]):null;}
function resetInputs(){padHeld.clear();controller.needsNeutral=true;held.clear();pressed.clear();touch.clear();if(typeof physicalKeys!=='undefined')physicalKeys.clear();stick.x=stick.y=0;stick.pointer=null;actionPointers.forEach(p=>p.clear());renderStick();document.querySelectorAll('[data-control]').forEach(b=>b.classList.remove('active'));}

const dunesPlatforms=[{x:450,y:250,w:88},{x:620,y:207,w:88},{x:1030,y:250,w:135},{x:1340,y:222,w:92},{x:1660,y:255,w:120},{x:1900,y:210,w:90},{x:2320,y:252,w:130},{x:2560,y:217,w:100},{x:2870,y:249,w:100},{x:3160,y:231,w:120},{x:3660,y:244,w:84}];
// A continuous but vertically varied city route. Solid roofs have real side/underside collisions.
const cityRoad=[
 [0,304,320],[320,264,150],[470,224,190],[660,164,290],
 [950,244,210],[1160,344,220],[1380,454,330],[1710,404,140],
 [1850,354,160],[2010,304,230],[2240,254,170],[2410,204,190],
 [2600,144,270],[2870,264,180],[3050,384,220],[3270,344,160],
 [3430,304,160],[3590,304,710]
].map(([x,y,w],i)=>({x,y,w,h:850-y,style:i%3,road:true}));
const cityOverhangs=[{x:60,y:150,w:210,h:32,style:2},{x:1240,y:210,w:100,h:32,style:2},{x:1460,y:320,w:240,h:34,style:2},{x:3130,y:234,w:100,h:34,style:1}];
const citySolids=[...cityRoad,...cityOverhangs];
const cityPlatforms=[{x:3540,y:240,w:110},{x:3780,y:244,w:105},{x:4080,y:239,w:110}];
const cityColumns=[{x:180,y:115,h:230,w:27},{x:780,y:-90,h:295,w:34},{x:1485,y:282,h:220,w:36},{x:2140,y:62,h:280,w:26},{x:2730,y:-90,h:280,w:32},{x:3140,y:188,h:250,w:34}];
let camY=0;
function roadAt(x){return cityRoad.find(p=>x>=p.x&&x<p.x+p.w)||cityRoad[cityRoad.length-1];}
function groundAt(x){return isCity()?(x>=5250?Z.roofY:x>=4300?304:roadAt(x).y):expandedDesert()?D.floor(x):GROUND;}
function cityBlocked(x,y){return isCity()&&cityGeometry().some(p=>x>p.x&&x<p.x+p.w&&y>p.y&&y<p.y+p.h);}
function resolveCityMotion(px,py){
 const height=playerHeight(),width=playerWidth();
 // Resolve side walls against the previous vertical span, then sweep floor / ceiling crossings.
 for(const p of cityGeometry()){if(py<=p.y+.01||py-height>=p.y+p.h-.01)continue;
  if(player.x>px&&px<p.x&&player.x+width>p.x)player.x=p.x-width;
  if(player.x<px&&px>p.x+p.w&&player.x-width<p.x+p.w)player.x=p.x+p.w+width;
 }
 let floor=Infinity,ceiling=-Infinity;
 for(const p of cityGeometry()){if(player.x+8<=p.x||player.x-8>=p.x+p.w)continue;
  if(player.vy>=0&&py<=p.y+.01&&player.y>=p.y)floor=Math.min(floor,p.y);
  if(player.vy<0&&py-height>=p.y+p.h-.01&&player.y-height<=p.y+p.h)ceiling=Math.max(ceiling,p.y+p.h);
 }
 if(floor<Infinity){player.y=floor;player.vy=0;player.onGround=true;player.jumps=0;player.coyote=.1;}
 else if(ceiling>-Infinity){player.y=ceiling+height;player.vy=0;}
}
let platforms=dunesPlatforms,level='dunes',selectedRoute='dunes',cleared={};
try{cleared=JSON.parse(localStorage.getItem('dead-moon-cleared')||'{}')||{};}catch(e){}
const isCity=()=>level==='city';
// Zenith Prime stage flow is continuous: crash breach -> ascent gate -> open skyline.
const Z=window.ZenithPrime;let zenith=Z.fresh();
function cityGeometry(){return [...citySolids,...Z.structures,...(!zenith.breached?[Z.wall]:[]),...(!zenith.gateOpen?[Z.gate]:[])];}
function stageName(){return ['','NEON STREETS','TOWER ASCENT','SKYLINE PURSUIT'][zenith.stage];}
function stageObjective(){return zenith.stage===1?(zenith.breached?'BREACH OPEN / ENTER THE TOWER':'DOWN THE WARDEN'):zenith.stage===2?(zenith.gateOpen?'GATE OPEN / REACH THE ROOFTOP':'CLIMB / DESTROY SECURITY GATE'):bossTriggered?'DEFEAT THE ORB SENTINEL':'JUMP THE FLYING TRAFFIC';}
function updateStageLabel(){$('stage-name').textContent=isCity()?'ZENITH PRIME / '+zenith.stage+' OF 3 / '+stageName():'GLASS DUNES / '+dunes.stage+' OF 3 / '+dunesStageName();}
function cityCameraX(){
 if(zenith.stage===1){if(zenith.crash)return 3660;if(!zenith.breached)return bossTriggered?Math.max(3515,Math.min(3660,player.x-240)):Math.max(0,Math.min(3660,player.x-210));}
 if(zenith.stage===2)return Math.max(4140,Math.min(5400,player.x-270));
 return Math.max(0,Math.min(Z.length-W,player.x-240));
}
function cityCameraY(){return zenith.stage===1?Math.max(-80,Math.min(205,player.y-265)):zenith.stage===3?Z.roofY-270:Math.max(Z.roofY-270,Math.min(110,player.y-230));}
function cityEnemy(type,x,y,patrol){const e=createEnemy(type,x);e.y=y;e.baseY=y;e.home=x;e.patrol=patrol||{x:x-55,w:110};e.cool=1.5+rand();enemies.push(e);return e;}
function enterCityStage(stage,retryStage=false){
 zenith.stage=stage;zenith.breached=true;zenith.crash=null;zenith.gateOpen=stage===3;zenith.gateHP=stage===3?0:120;zenith.relay=false;
 boss=null;bossTriggered=false;winTimer=0;hostiles=[];shots=[];grenades=[];hazards=[];enemies=[];crates=[];pickups=[];
 zenith.traffic=[];zenith.trafficWarning=null;zenith.trafficTimer=2.5;
 platforms=stage===2?Z.climb:[];checkpoint=stage===2?4320:5840;usedCheckpoint=true;
 if(retryStage){player.hp=player.maxHp;player.grenades=Math.max(4,player.grenades);player.heavy=0;}
 player.x=checkpoint;player.y=stage===2?304:Z.roofY;player.vx=0;player.vy=0;player.onGround=true;player.jumps=0;player.inv=2;
 player.crouching=false;player.crawling=false;player.aimX=1;player.aimY=0;player.face=1;player.dash=0;player.cool=0;
 zenith.safe={x:player.x,y:player.y};resetInputs();state='playing';setMode('playing');$('modal').hidden=true;$('pause').disabled=false;updateStageLabel();
 if(stage===2){
  for(const i of [2,4,6,9,11]){const p=Z.climb[i];cityEnemy(i===4||i===11?'turret':'soldier',p.x+110,p.y,p);}
  for(const i of [3,8,12]){const p=Z.climb[i];cityEnemy('drone',p.x+150,p.y-80,p);}
  cityEnemy('soldier',5370,Z.roofY,{x:5260,w:270});cityEnemy('turret',5460,Z.roofY,{x:5260,w:270});cityEnemy('turret',5630,Z.roofY,{x:5585,w:180});
  for(const [i,type] of [[0,'health'],[5,'grenade'],[8,'health'],[12,'heavy']]){const p=Z.climb[i];pickups.push({x:p.x+50,y:p.y-18,type,phase:0});}
 }else{
  zenith.roofEntered=true;for(const x of [6300,6900,7540])cityEnemy('soldier',x,Z.roofY,{x:x-80,w:160});
  for(const [x,type] of [[5900,'health'],[6700,'grenade'],[7400,'health'],[7910,'heavy']])pickups.push({x,y:Z.roofY-18,type,phase:0});
 }
 cam=cityCameraX();camY=cityCameraY();message('STAGE 0'+stage+' / '+stageName(),player.x+180,player.y-150,3,'#8de9ff');
 announce('Zenith Prime stage '+stage+' of 3. '+(stage===2?'Climb the tower and shoot through the guarded security gate.':'Jump over flying traffic. Defeat the Orb Sentinel.'));
 canvas.focus({preventScroll:true});
}
function gateHit(n){if(!isCity()||zenith.gateOpen||zenith.stage!==2)return;zenith.gateHP=Math.max(0,zenith.gateHP-n);zenith.gateFlash=.1;burst(Z.gate.x,Z.roofY-75,4,'#81d7fc',65);
 if(zenith.gateHP===0){zenith.gateOpen=true;score+=750;sfx('boom');shake=10;burst(Z.gate.x,Z.roofY-85,60,'#a4dfff',145);message('SECURITY GATE BREACHED',Z.gate.x,Z.roofY-150,2.5,'#89fff0');announce('Gate destroyed. Continue right to the rooftops.');}
}
function hitGate(x,y){return isCity()&&zenith.stage===2&&!zenith.gateOpen&&x>=Z.gate.x-4&&x<=Z.gate.x+Z.gate.w+4&&y>=Z.gate.y&&y<Z.roofY;}
function bossContains(x,y){if(!boss||boss.dead)return false;if(boss.kind==='beetle')return !['burrow','warning'].includes(boss.phase)&&Math.abs(x-boss.x)<90&&y>boss.y-95&&y<boss.y-12;if(boss.kind==='orb')return Math.hypot(x-boss.x,y-(boss.y-48))<46;return Math.abs(x-boss.x)<(isCity()?110:76)&&y>boss.y-(isCity()?98:136)&&y<boss.y-12;}
function beginGunshipCrash(){
 zenith.crash={t:0,x:boss.x,y:boss.y,impact:false};boss.kind='gunship';winTimer=0;hostiles=[];hazards=[];player.inv=5;
 message('WARDEN FALLING / STAND CLEAR',4000,90,2.5,'#ffc087');announce('Warden disabled. It is crashing into the tower wall.');
}
function updateCityRoute(dt){
 zenith.gateFlash=Math.max(0,zenith.gateFlash-dt);
 if(zenith.crash){const c=zenith.crash;c.t+=dt;const f=Math.min(1,c.t/1.8);boss.x=c.x+(Z.wall.x-32-c.x)*f;boss.y=c.y+(322-c.y)*f*f;boss.rotation=f*.45;
  if(Math.random()<dt*16)burst(boss.x-50,boss.y-50,5,'#d68c54',50);
  if(f===1&&!c.impact){c.impact=true;zenith.breached=true;shake=18;flash=.18;sfx('boom');burst(Z.wall.x,215,120,'#e9ba80',190);score+=500;
   message('WALL BREACHED / TOWER ACCESS OPEN',4200,110,3,'#8cecff');announce('Wall breached. Continue right into stage two.');}
  if(c.t>3){zenith.crash=null;boss=null;bossTriggered=false;}
 }
 if(zenith.stage===1&&zenith.breached&&!zenith.crash&&player.x>4305){enterCityStage(2);return;}
 if(zenith.stage===2){
  if(player.onGround&&player.y<zenith.safe.y)zenith.safe={x:player.x,y:player.y};
  if(!zenith.relay&&player.onGround&&player.y<=Z.climb[8].y){zenith.relay=true;player.hp=player.maxHp;message('ASCENT RELAY / ARMOR RESTORED',player.x,player.y-80,2,'#8efcd4');sfx('pickup');}
  if(player.y>zenith.safe.y+420){player.x=zenith.safe.x;player.y=zenith.safe.y;player.vy=0;player.onGround=true;damage(1);}
  if(zenith.gateOpen&&player.x>5808&&player.y<=Z.roofY+3){enterCityStage(3);return;}
 }
 if(zenith.stage!==3)return;
 if(player.x>8120&&!bossTriggered){bossTriggered=true;zenith.traffic=[];zenith.trafficWarning=null;boss={kind:'orb',x:8510,y:Z.roofY-110,hp:300,maxHp:300,t:0,cycle:-1,cool:0,spiral:0,burst:0,flash:0,dead:false,slam:0};
  message('ZP ENFORCEMENT / ORB SENTINEL',player.x+220,Z.roofY-160,3,'#ffacb9');announce('Final boss. Orb Sentinel. Watch for spiral shots and timed bursts.');}
 if(!bossTriggered){
  zenith.trafficTimer-=dt;
  if(zenith.trafficTimer<=0&&!zenith.trafficWarning){zenith.trafficWarning={t:1.2,dir:zenith.trafficCount++%2?-1:1};zenith.trafficTimer=4.8;}
  if(zenith.trafficWarning){zenith.trafficWarning.t-=dt;if(zenith.trafficWarning.t<=0){const d=zenith.trafficWarning.dir;zenith.traffic.push({x:d<0?cam+W+90:cam-90,y:Z.roofY-5,vx:d*240,dir:d});zenith.trafficWarning=null;}}
 }
 for(const car of zenith.traffic){car.x+=car.vx*dt;if(Math.abs(car.x-player.x)<56&&player.y>Z.roofY-32&&player.y-playerHeight()<Z.roofY-8)damage(1);}
 zenith.traffic=zenith.traffic.filter(c=>Math.abs(c.x-player.x)<900);
}
function orbShot(angle,speed,color){hostiles.push({x:boss.x+Math.cos(angle)*39,y:boss.y-48+Math.sin(angle)*39,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:7,r:3,color});}
function updateOrb(dt){
 boss.t+=dt;boss.flash=Math.max(0,boss.flash-dt);boss.x=8510+Math.sin(boss.t*.55)*100;boss.y=Z.roofY-108+Math.sin(boss.t*.8)*24;
 const phase=boss.t%11,cycle=Math.floor(boss.t/11),rage=boss.hp<boss.maxHp*.4;
 if(cycle!==boss.cycle){boss.cycle=cycle;boss.spiral=0;boss.burst=0;boss.cool=0;}
 boss.attack=phase<1?'SPIRAL CHARGING':phase<4.2?'SPIRAL FIRE':phase<5.6?'COOLING':phase<6.8?'BURST CHARGING':phase<8.4?'RADIAL BURST':'COOLING';
 if(phase>=1&&phase<4.2){boss.cool-=dt;if(boss.cool<=0){const a=boss.spiral++*.33;for(let k=0;k<3;k++)orbShot(a+k*Math.PI*2/3,rage?100:84,'#65dcff');boss.cool=rage?.14:.18;}}
 if(phase>=6.8&&phase<8.4){const due=Math.min(3,1+Math.floor((phase-6.8)/.55));while(boss.burst<due){const offset=boss.burst++*.15;for(let i=0;i<14;i++)orbShot(i*Math.PI*2/14+offset,rage?115:96,'#ff79b3');tone(270,'triangle',.12,.1,100);}}
 if(Math.hypot(player.x-boss.x,player.y-23-(boss.y-48))<57)damage(1);
}
function drawCityExpansion(){
 if(zenith.stage===1){
  if(!zenith.breached){const x=Z.wall.x-cam;facade(x,Z.wall.y,Z.wall.w,Z.wall.h,2);steel(x-5,120,Z.wall.w+10,20);text('SEALED',x+24,126,1,'#ff9d85','center');for(let y=55;y<300;y+=42)rect(x+2,y,3,20,'#f39365');}
  else{for(let i=0;i<9;i++){const x=4235+i*9-cam;poly([[x,304],[x+3,294-hash(i)*9],[x+11,304]],'#4a5967');}text('TOWER >',4270-cam,270,1,'#8be6ef');}
  if(zenith.breached){roofEdge(4300-cam,304,250);}
  return;
 }
 if(zenith.stage===2){
  for(let i=0;i<5;i++){const x=4290+i*240-cam;if(x>W+50||x+180<-50)continue;facade(x,camY-90,180,H+180,i);rect(x,camY-90,180,H+180,'#030b1860');for(let y=Math.floor(camY/110)*110;y<camY+H+120;y+=110){steel(x-7,y,194,8);rect(x+12,y+12,4,43,'#62b7dc');}}
  // Braces and cables sit behind one-way landing platforms, leaving readable jumps.
  for(const p of Z.climb){if(p.y<camY-30||p.y>camY+H+80)continue;const x=p.x-cam;roofEdge(x,p.y,p.w);poly([[x+10,p.y+27],[x+35,p.y+60],[x+35,p.y+27]],'#283e53');poly([[x+p.w-10,p.y+27],[x+p.w-35,p.y+60],[x+p.w-35,p.y+27]],'#283e53');rect(x+9,p.y+2,p.w-18,2,'#74e8ed');text(String(p.index+1).padStart(2,'0'),x+8,p.y+11,1,'#bddae5');if(p.index<Z.climb.length-1){const next=Z.climb[p.index+1];text(next.x<p.x?'<':'>' ,x+p.w/2,p.y-18,1,'#f5c87b');}}
  roofEdge(4300-cam,304,1140);roofEdge(5250-cam,Z.roofY,550);
  const gx=Z.gate.x-cam;steel(gx-15,Z.gate.y-16,66,16);text(zenith.gateOpen?'OPEN':'ZP SECURITY',gx+18,Z.gate.y-30,1,zenith.gateOpen?'#86f8d1':'#ffacb4','center');
  if(!zenith.gateOpen){steel(gx,Z.gate.y,Z.gate.w,Z.gate.h);for(let y=Z.gate.y+12;y<Z.roofY-8;y+=18){rect(gx+4,y,28,8,zenith.gateFlash?'#e9faff':'#345771');rect(gx+7,y+2,22,2,'#ec7398');}rect(gx-3,Z.roofY-90,3,50,'#ff799f');rect(gx+39,Z.roofY-90,3,50,'#ff799f');}
  else{rect(gx,Z.roofY-8,36,8,'#6f8690');text('ROOFTOP >',gx+65,Z.roofY-34,1,'#8ef9e9');}
  roofEdge(5800-cam,Z.roofY,400);return;
 }
 // Rooftops deliberately leave almost the entire skyline unobstructed.
 const y=Z.roofY;rect(5800-cam,y,Z.length-5800,400,'#101b31');roofEdge(5800-cam,y,Z.length-5800);
 for(let x=Math.floor(cam/180)*180;x<cam+W+180;x+=180){steel(x-cam,y+35,160,60,x);rect(x-cam+8,y+42,144,2,'#354a64');for(let j=0;j<6;j++)rect(x-cam+15+j*23,y+57,12,2,'#52647b');}
 for(const x of [5880,6480,7080,7680,8100]){const sx=x-cam;if(sx<-150||sx>W+100)continue;steel(sx,y-24,6,24);rect(sx+1,y-25,4,4,'#76f1ee');text('ZP / SKYWAY',sx-30,y+32,1,'#7097b0');}
 for(const car of zenith.traffic)art.sprite(g,art.frames.car,car.x-cam,car.y,28,-car.dir);
}
function drawOrb(b){const x=b.x-cam,y=b.y;g.save();if(b.flash>0)g.filter='brightness(1.8)';if(b.dead)g.filter='brightness(.5)';art.sprite(g,art.frames.orb,x,y,96);g.restore();
 if(!b.dead){const charge=b.attack?.includes('CHARGING');g.strokeStyle=charge?(b.attack.startsWith('SPIRAL')?'#6ce6ff':'#ff83be'):'#7ca6d544';g.lineWidth=charge?2:1;g.beginPath();g.arc(x,y-48,charge?54+Math.sin(clock*15)*3:52,0,Math.PI*2);g.stroke();if(charge)text(b.attack,x,y-111,1,g.strokeStyle,'center');}
}

// Glass Dunes progression and organic enemies.
const D=window.GlassDunes;let dunes=D.fresh();
const expandedDesert=()=>!isCity()&&dunes.stage>1;
function dunesStageName(){return ['','WRECK FIELD','FANGRIDGE ASCENT','SUNSEA OVERLOOK'][dunes.stage];}
function dunesObjective(){return dunes.stage===1?(dunes.walkerDown?'WALKER DOWN / CLIMB THE DUNES':'DESTROY THE WALKER'):dunes.stage===2?(player.x>=D.caveStart?'FIGHT THROUGH THE SAND BUG CAVE':'CLIMB THE JAGGED DUNES'):bossTriggered?(boss.vulnerable?'SHELL OPEN / HIT THE GLOWING CORE':boss.phase==='burrow'||boss.phase==='warning'?'WATCH THE SAND PLUMES':'ARMORED SHELL / KEEP MOVING'):'JUMP THE FLYING BEETLES';}
function dunesCameraX(){return dunes.stage===1?Math.max(bossTriggered?3515:0,Math.min(dunes.walkerDown?4100:LENGTH-W,player.x-210)):Math.max(dunes.stage===2?4300:7600,Math.min(D.length-W,player.x-220));}
function dunesCameraY(){return dunes.stage===1?0:dunes.stage===3?D.summitY-270:Math.max(D.summitY-250,Math.min(70,player.y-245));}
function dunesBlocked(x,y){if(!expandedDesert())return false;const c=D.ceiling;return y>D.floor(x)||(dunes.stage===2&&x>c.x&&x<c.x+c.w&&y>c.y&&y<c.y+c.h);}
function resolveDunesMotion(px,py){
 const floor=expandedDesert()?D.floor(player.x):GROUND,oldFloor=expandedDesert()?D.floor(px):GROUND;
 if(player.vy>=0&&(player.y>=floor||(Math.abs(py-oldFloor)<2&&player.y>=py))){player.y=floor;player.vy=0;player.onGround=true;player.jumps=0;player.coyote=.1;}
 if(expandedDesert()&&dunes.stage===2){const c=D.ceiling;if(player.x+8>c.x&&player.x-8<c.x+c.w&&player.vy<0&&py-playerHeight()>=c.y+c.h&&player.y-playerHeight()<c.y+c.h){player.y=c.y+c.h+playerHeight();player.vy=0;}}
}
function sandBug(x,platform=null){const y=platform?platform.y:D.floor(x);return {type:'bug',x,y,baseY:y,home:x,hp:9,maxHp:9,t:rand()*6,cool:1,flash:0,face:-1,alert:0,patrol:platform||{x:x-85,w:170},ground:!platform};}
function enterDunesStage(stage,retryStage=false){
 const caveRetry=retryStage&&stage===2&&dunes.caveReached;dunes.stage=stage;dunes.walkerDown=true;dunes.collapse=0;dunes.swarm=[];dunes.warning=null;dunes.swarmTimer=2.5;
 effects=[];particles=[];texts=[];boss=null;bossTriggered=false;winTimer=0;hostiles=[];shots=[];grenades=[];hazards=[];enemies=[];crates=[];pickups=[];
 platforms=stage===2?[...D.ledges,...D.caveLedges]:[];checkpoint=stage===3?7640:caveRetry?6420:4340;usedCheckpoint=true;
 if(retryStage){player.hp=player.maxHp;player.grenades=Math.max(4,player.grenades);player.heavy=0;}
 Object.assign(player,{x:checkpoint,y:D.floor(checkpoint),vx:0,vy:0,onGround:true,jumps:0,inv:2,crouching:false,crawling:false,aimX:1,aimY:0,face:1,dash:0,cool:0});
 if(stage===2){for(const x of [4760,5210,5660,6120,6500,6740,7020,7330,7480])enemies.push(sandBug(x));for(const p of D.caveLedges)enemies.push(sandBug(p.x+65,p));
  for(const [x,type] of [[4820,'health'],[5500,'grenade'],[6100,'heavy'],[6770,'health'],[7270,'grenade']])pickups.push({x,y:D.floor(x)-18,type,phase:0});
 }else{for(const [x,type] of [[7750,'health'],[8500,'grenade'],[9160,'health'],[9710,'heavy']])pickups.push({x,y:D.summitY-18,type,phase:0});}
 resetInputs();state='playing';setMode('playing');$('modal').hidden=true;$('pause').disabled=false;updateStageLabel();cam=dunesCameraX();camY=dunesCameraY();
 message('STAGE 0'+stage+' / '+dunesStageName(),player.x+185,player.y-140,3,ACID);announce('Glass Dunes stage '+stage+' of 3. '+(stage===2?'Climb the jagged dunes and cross the sand bug cave.':'Jump the flying beetles. Watch the sand for the burrowing boss.'));canvas.focus({preventScroll:true});
}
function updateDunesRoute(dt){
 if(dunes.collapse>0){dunes.collapse-=dt;if(Math.random()<dt*10)burst(boss.x+(rand()-.5)*90,boss.y-30-rand()*90,18,'#ffba68',100);if(dunes.collapse<=0){dunes.collapse=0;boss=null;bossTriggered=false;message('DUNE PATH OPEN >',4230,180,3,ACID);}}
 if(dunes.stage===1&&dunes.walkerDown&&!dunes.collapse&&player.x>4305){enterDunesStage(2);return;}
 if(dunes.stage===2&&player.x>6370&&!dunes.caveReached){dunes.caveReached=true;checkpoint=6420;player.hp=player.maxHp;player.grenades=Math.max(4,player.grenades);message('CAVE RELAY / ARMOR RESTORED',player.x+130,player.y-100,3,CYAN);announce('Cave checkpoint secured. Armor restored.');}
 if(dunes.stage===2&&player.x>D.caveEnd+8){enterDunesStage(3);return;}
 if(dunes.stage!==3)return;
 if(player.x>9880&&!bossTriggered){bossTriggered=true;dunes.swarm=[];dunes.warning=null;boss={kind:'beetle',x:10300,y:D.summitY,hp:270,maxHp:270,t:0,phase:'burrow',phaseT:0,targetX:Math.max(9980,Math.min(10560,player.x+100)),vulnerable:false,flash:0,dead:false,face:-1,vx:-150,cool:1};message('WARNING / DUNE SOVEREIGN',player.x+220,D.summitY-160,3,'#ffe2a1');announce('Dune Sovereign. Sand plumes warn of its emergence. Shoot the exposed core when its shell opens.');}
 if(!bossTriggered){dunes.swarmTimer-=dt;if(dunes.swarmTimer<=0&&!dunes.warning){dunes.warning={t:1.3,dir:dunes.swarmCount++%2?1:-1};dunes.swarmTimer=4.6;}
  if(dunes.warning){dunes.warning.t-=dt;if(dunes.warning.t<=0){const dir=dunes.warning.dir;dunes.swarm.push({x:dir<0?cam+W+65:cam-65,y:D.summitY-3,vx:dir*210,dir,t:0});dunes.warning=null;}}
 }
 for(const b of dunes.swarm){b.x+=b.vx*dt;b.t+=dt;b.y=D.summitY-3+Math.sin(b.t*11)*3;if(Math.abs(b.x-player.x)<33&&player.y>D.summitY-34&&player.y-playerHeight()<D.summitY-5)damage(1);}
 dunes.swarm=dunes.swarm.filter(b=>Math.abs(b.x-player.x)<850);
}
function updateSandBug(e,dt){e.x+=e.face*(Math.abs(e.x-player.x)<210?36:15)*dt;e.x=Math.max(e.patrol.x+12,Math.min(e.patrol.x+e.patrol.w-12,e.x));if(e.ground)e.y=D.floor(e.x);if(Math.abs(e.x-player.x)<25&&player.y>e.y-30&&player.y-playerHeight()<e.y)damage(1);}
function updateBeetle(dt){
 const b=boss;b.t+=dt;b.phaseT+=dt;b.flash=Math.max(0,b.flash-dt);b.cool-=dt;const p=b.phaseT;
 if(b.phase==='burrow'){b.vulnerable=false;b.y=D.summitY+90;b.x+=(b.targetX-b.x)*Math.min(1,dt*3);if(p>1.5){b.phase='warning';b.phaseT=0;b.targetX=Math.max(9980,Math.min(10550,player.x));b.x=b.targetX;announce('Sand plume. Move away from the eruption.');}}
 else if(b.phase==='warning'){if(Math.random()<dt*16)burst(b.targetX,D.summitY,3,'#e6af63',25);if(p>1.5){b.phase='emerge';b.phaseT=0;shake=9;burst(b.x,D.summitY,35,'#edbd78',125);sfx('boom');}}
 else if(b.phase==='emerge'){b.y=D.summitY+100-Math.min(1,p/.8)*150;if(Math.abs(player.x-b.x)<66&&player.y>D.summitY-95)damage(1);if(p>1.1){b.phase='flight';b.phaseT=0;b.y=D.summitY-50;b.vx=b.x>10280?-155:155;b.cool=1;}}
 else if(b.phase==='flight'){b.x+=b.vx*dt;if(b.x<9970){b.x=9970;b.vx=Math.abs(b.vx);}if(b.x>10580){b.x=10580;b.vx=-Math.abs(b.vx);}b.face=b.vx<0?-1:1;b.y=D.summitY-64+Math.sin(p*1.5)*24;b.vulnerable=p%3>.65&&p%3<2.65;
  if(b.vulnerable&&b.cool<=0){const a=Math.atan2(player.y-24-(b.y-46),player.x-b.x);for(let i=-1;i<=1;i++)hostiles.push({x:b.x,y:b.y-46,vx:Math.cos(a+i*.2)*105,vy:Math.sin(a+i*.2)*105,life:5,r:3,color:'#ffd476'});b.cool=1.2;}
  if(Math.abs(player.x-b.x)<76&&Math.abs(player.y-22-(b.y-45))<54)damage(1);
  if(p>9){b.phase='dive';b.phaseT=0;b.vulnerable=false;}
 }else if(b.phase==='dive'){b.y+=dt*190;if(p>1.2){b.phase='burrow';b.phaseT=0;b.targetX=Math.max(9980,Math.min(10550,player.x));hostiles=[];}}
}
function drawSandBug(e){if(!art||!art.loaded)return;const f=art.frames.beetles[0],x=e.x-cam;g.save();if(e.flash>0)g.filter='brightness(1.8)';g.translate(x,e.y);g.rotate(Math.sin(e.t*13)*.035);art.sprite(g,f,0,0,28,-e.face);g.restore();}
function drawBeetle(b){
 if(b.phase==='burrow'||b.phase==='warning'){const x=b.targetX-cam,y=D.summitY,warning=b.phase==='warning';for(let i=0;i<8;i++){const spread=warning?45:20,xx=x+(hash(i+2)-.5)*spread,hh=(warning?16:5)+Math.sin(clock*9+i)*5;poly([[xx-7,y],[xx-3,y-hh],[xx+2,y-hh-4],[xx+8,y]],i%2?'#e8b16c':'#ae6c3d');}if(warning)text('SAND ERUPTION',x,y-40,1,'#ffe6a6','center');return;}
 const open=b.vulnerable,f=art.frames.beetles[open?3:2],width=220,height=width*f.h/f.w;
 g.save();g.beginPath();g.rect(0,camY,W,D.summitY-camY+2);g.clip();if(b.flash>0)g.filter='brightness(1.8)';art.sprite(g,f,b.x-cam,b.y,height,-b.face);g.restore();
 if(open){const x=b.x-cam+b.face*-20,y=b.y-84;g.strokeStyle='#ffe39a';g.lineWidth=1;g.beginPath();g.arc(x,y,18+Math.sin(clock*12)*2,0,Math.PI*2);g.stroke();text('CORE EXPOSED',b.x-cam,b.y-height-14,1,'#ffe5a8','center');}
}
function desertRock(f,x,y,height,face=1,alpha=1){art.sprite(g,art.frames.rocks[f%3],x,y,height,face,alpha);}
function dunesBackground(){
 const cave=player.x>D.caveStart-100&&player.x<D.caveEnd&&dunes.stage===2;
 const im=cave?art.assets.dunesCave:art.assets.overlook;const offset=((cam-(cave?D.caveStart:4300))*.10)%500;
 g.drawImage(im,-offset-40,-20,1200,400);if(cave){rect(0,0,W,H,'#1c0e1260');return;}
 if(dunes.stage===2){for(let i=Math.floor(cam*.36/230)-1;i<cam*.36/230+5;i++){const x=i*230-cam*.36;desertRock(i%2?0:2,x,350-(camY+250)*.12,180+hash(i)*100,i%2?1:-1,.6);}}
}
function drawDuneTerrain(){
 const left=Math.max(4300,Math.floor(cam/16)*16),right=Math.min(D.length,cam+W+32),points=[];
 for(let x=left;x<=right+16;x+=16)points.push([x-cam,D.floor(x)]);
 points.push([right+16-cam,camY+H+400],[left-cam,camY+H+400]);
 g.save();g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();rect(0,camY,W,H+400,'#653420');
 const im=art.assets.terrain;for(let x=left;x<right+16;x+=8){const sx=((x%288)+288)%288/288*im.width;g.drawImage(im,sx,0,im.width*8/288,im.height,x-cam,D.floor(x),9,Math.max(240,camY+H+200-D.floor(x)));}g.restore();
 for(let x=left;x<right;x+=8){const y=D.floor(x);rect(x-cam,y,9,2,'#edbd70');if(hash(x)>.6)rect(x-cam+3,y+7,4,1,'#ab6b39');}
}
function drawDunesExpansion(){
 drawDuneTerrain();
 if(dunes.stage===2){
  for(const p of platforms){if(p.x>cam+W+50||p.x+p.w<cam-50)continue;const x=p.x-cam,base=D.floor(p.x+p.w),depth=Math.max(38,base-p.y+35);g.save();g.beginPath();g.moveTo(x,p.y);g.lineTo(x+p.w,p.y);g.lineTo(x+p.w+15,p.y+depth);g.lineTo(x-12,p.y+depth+15);g.closePath();g.clip();desertRock(1,x+p.w/2,p.y+depth+20,depth+45);g.restore();rect(x+2,p.y,p.w-4,2,'#f1c17c');}
  // Stone roof and jagged mouth are close scenery; cave walls recede behind the bugs.
  const entrance=D.caveStart-cam,exit=D.caveEnd-cam,roofY=D.summitY-190;
  if(entrance<W&&exit>0){g.save();g.beginPath();g.rect(Math.max(0,entrance),camY,Math.min(W,exit)-Math.max(0,entrance),Math.max(0,roofY-camY));g.clip();g.drawImage(art.assets.dunesCave,entrance,camY-70,1300,320);g.restore();
   for(let x=D.caveStart+20;x<D.caveEnd;x+=74){if(x<cam-60||x>cam+W+60)continue;g.save();g.translate(x-cam,roofY-18);g.scale(1,-1);g.filter='brightness(.45)';desertRock(0,0,0,35+hash(x)*35);g.restore();}
  }
  for(const x of [D.caveStart,D.caveEnd])if(x>cam-130&&x<cam+W+130){desertRock(2,x-cam,D.summitY+20,290,x===D.caveStart?1:-1);text(x===D.caveStart?'SANDHOLLOW >':'SUNSEA >',x-cam+30,D.summitY-150,1,'#ffe1a2');}
 }else for(const b of dunes.swarm){const f=art.frames.beetles[1];art.sprite(g,f,b.x-cam,b.y,42+Math.sin(b.t*24)*2,-b.dir);}
}
function dunesOccluders(){if(!art||!art.loaded||dunes.stage!==2)return;for(const x of [4660,5160,5740,6600,7050,7420]){const sx=(x-cam)*1.13;if(sx<-120||sx>W+120)continue;const y=D.floor(x)+32;g.save();g.filter='brightness(.48)';desertRock(0,sx,y,110+hash(x)*70,1,Math.abs(player.x-x)<65?.27:.8);g.restore();}}

function setMode(mode){document.body.dataset.mode=mode;}
function chooseRoute(route){if(!['dunes','city'].includes(route))return;selectedRoute=route;for(const id of ['dunes','city']){$('route-'+id).classList.toggle('selected',id===route);$('route-'+id).setAttribute('aria-pressed',String(id===route));$(id+'-badge').textContent=((cleared[id]===3)?'CLEARED · ':'')+(id==='city'?'STREET ROGUE':'NOMAD');}$('route-status').textContent=(route==='city'?'ZENITH PRIME · STREET ROGUE':'GLASS DUNES · NOMAD')+' · CONFIRM TO DEPLOY';}
function showMap(){$('stage-name').textContent='SECTOR NAVIGATION';state='map';setMode('map');resetInputs();$('intro').hidden=true;$('modal').hidden=true;$('options-panel').hidden=true;$('sector-map').hidden=false;$('pause').disabled=true;chooseRoute(selectedRoute);$('deploy').focus({preventScroll:true});}
function showTitle(){resetInputs();$('stage-name').textContent='CHOOSE YOUR PATH';state='menu';setMode('menu');$('sector-map').hidden=true;$('options-panel').hidden=true;$('intro').hidden=false;$('modal').hidden=true;$('pause').disabled=true;$('start').focus({preventScroll:true});}
function deploy(){if(art&&!art.loaded)return;level=selectedRoute;$('stage-name').textContent=isCity()?'02 / ZENITH PRIME':'01 / GLASS DUNES';$('mission-title').innerHTML=isCity()?'Breach. Ascend. Liberate.<br><span>Take Zenith Prime.</span>':'Break the machine.<br><span>Take back the wastes.</span>';platforms=isCity()?cityPlatforms:dunesPlatforms;$('sector-map').hidden=true;startGame();}
function createEnemy(type,x,y=GROUND){if(isCity())y=type==='drone'?groundAt(x)-100:groundAt(x);return {type,x,y,baseY:y,home:x,hp:type==='turret'?15:type==='drone'?8:9,maxHp:type==='turret'?15:9,t:rand()*8,cool:1.3+rand()*1.1,flash:0,face:-1,alert:0};}
function reset(startAt=0){zenith=Z.fresh();dunes=D.fresh();platforms=isCity()?cityPlatforms:dunesPlatforms;effects=[];seed=71027;enemies=[];shots=[];hostiles=[];particles=[];grenades=[];pickups=[];texts=[];hazards=[];boss=null;bossTriggered=false;winTimer=0;flash=0;shake=0;usedCheckpoint=startAt>0;checkpoint=startAt;
 player={x:startAt||80,y:groundAt(startAt||80),vx:0,vy:0,face:1,hp:armor.maxHP,maxHp:armor.maxHP,inv:1.6,cool:0,jumps:0,onGround:true,anim:0,grenades:4,grenadeCool:0,heavy:0,dash:0,dashCool:0,coyote:.1,crouching:false,crawling:false,aimX:1,aimY:0};
 const config=isCity()?[['drone',410,190],['soldier',680],['turret',840],['drone',1010,170],['soldier',1190],['drone',1350,210],['turret',1530],['soldier',1760],['drone',1950,185],['soldier',2260],['turret',2430],['drone',2650,160],['soldier',2800],['drone',2980,190],['turret',3200],['soldier',3370],['drone',3500,180]]:[['soldier',430],['soldier',740],['drone',890,204],['soldier',1130],['turret',1270],['drone',1470,180],['soldier',1560],['soldier',1720],['drone',1830,210],['turret',2030],['soldier',2200],['soldier',2420],['drone',2510,177],['turret',2735],['soldier',2890],['drone',3040,195],['soldier',3190],['turret',3350],['drone',3480,180],['soldier',3570]];
 for(const c of config)if(c[1]>startAt+140)enemies.push(createEnemy(...c));
 crates=[{x:560,y:GROUND,hp:5,drop:'heavy'},{x:1180,y:GROUND,hp:5,drop:'health'},{x:1780,y:GROUND,hp:5,drop:'grenade'},{x:2380,y:GROUND,hp:5,drop:'heavy'},{x:3060,y:GROUND,hp:5,drop:'health'},{x:3540,y:GROUND,hp:5,drop:'grenade'}].filter(c=>c.x>startAt);
 pickups=[{x:669,y:190,type:'heavy',phase:0},{x:1390,y:205,type:'grenade',phase:1},{x:1940,y:193,type:'health',phase:2},{x:2610,y:200,type:'heavy',phase:1},{x:3220,y:214,type:'health',phase:1}].filter(p=>p.x>startAt);
 if(isCity()){for(const c of crates)c.y=groundAt(c.x);for(const p of pickups)p.y=groundAt(p.x)-18;}
 camY=isCity()?Math.max(-80,Math.min(205,player.y-265)):0;
 cam=Math.max(0,player.x-180);updateStageLabel();state='playing';setMode('playing');$('intro').hidden=true;$('intro-bottom').hidden=true;$('modal').hidden=true;$('pause').disabled=false;resetInputs();announce(isCity()?'Street Rogue deployed. Disable the Zenith Warden.':'Nomad deployed. Destroy the extraction mech.');if(startAt===0)message(isCity()?'BREACH THE NEON DISTRICT':'CROSS THE WRECK FIELD',player.x+155,125,2.8,ACID);
}
function startGame(){if(art&&!art.loaded){if(art.failed)location.reload();return;}score=0;kills=0;elapsed=0;reset();if(soundOn)audioInit();canvas.focus({preventScroll:true});}
function announce(s){$('live-region').textContent=s;}
function message(str,x,y,life=1.2,color=ACID){texts.push({str,x,y,life,max:life,color});}
function openModal(eyebrow,title,copy,button){$('modal-eyebrow').textContent=eyebrow;$('modal-title').textContent=title;$('modal-copy').textContent=copy;$('resume').innerHTML=button+' <span>↗</span>';$('modal').hidden=false;$('resume').focus({preventScroll:true});announce(title+'. '+copy);}
function pauseGame(){if(state==='playing'){state='paused';resetInputs();openModal('TRANSMISSION PAUSED','Take a breath.',isCity()?'The city can wait.':'The wastes can wait.','RESUME MISSION');}else if(state==='paused'){state='playing';$('modal').hidden=true;canvas.focus({preventScroll:true});}}
function gameOver(){if(state!=='playing')return;resetInputs();state='dead';sfx('boom');burst(player.x,player.y-12,30,'#eea86a');openModal('TRANSMISSION LOST','Dust to dust.',`SCORE ${String(score).padStart(6,'0')}  /  ${kills} HOSTILES DOWN\n${checkpoint?'Relay secured. Resume from the checkpoint.':'One more run. You know the way now.'}`,checkpoint?'RETRY FROM RELAY':'TRY AGAIN');}
function finish(){if(state==='won'||(isCity()?zenith.stage!==3:dunes.stage!==3))return;resetInputs();cleared[level]=3;try{localStorage.setItem('dead-moon-cleared',JSON.stringify(cleared));}catch(e){}state='won';score+=Math.max(200,2000-Math.floor(elapsed)*5);best=Math.max(best,score);try{localStorage.setItem('dustbyte-best',String(best));}catch(e){}openModal(isCity()?'ZENITH PRIME LIBERATED':'GLASS DUNES LIBERATED',isCity()?'Zenith Prime is free.':'The wastes are yours.',`SCORE ${String(score).padStart(6,'0')}  /  ${kills} HOSTILES DOWN\nTIME ${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')}  /  BEST ${String(best).padStart(6,'0')}`,'CHOOSE NEXT ROUTE');}
function burst(x,y,n,color,force=75){if(n>=18)effects.push({x,y,age:0,duration:n>40?.85:.55,size:n>40?76:42,rotation:rand()*.3-.15});for(let i=0;i<n;i++){const a=rand()*Math.PI*2,v=rand()*force;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:.2+rand()*.55,max:1,size:rand()>.6?3:2,color:rand()>.7?'#ffe7ac':color,gravity:160});}}
function shatterArmor(tier){
 const city=isCity(),color=city?'#89929e':'#bc9363';
 for(let i=0;i<12;i++){const a=rand()*Math.PI*2;particles.push({x:player.x+(rand()-.5)*18,y:player.y-12-rand()*30,vx:Math.cos(a)*(45+rand()*65),vy:-50-rand()*85,life:.8+rand()*.4,size:3+rand()*4,color,gravity:240,plate:true,rotation:rand()*6,spin:(rand()-.5)*16});}
 tone(650,'triangle',.18,.15,120);shake=7;
 message('ARMOR 0'+tier+' BROKEN',player.x,player.y-65,1.3,city?'#8de4f2':'#ffcf83');
}
function damage(n){
 if(player.inv>0||player.dash>0||state!=='playing'||!Number.isFinite(n)||n<=0)return;
 const before=armorStatus();player.hp=Math.max(0,player.hp-Math.floor(n));
 const after=armorStatus();player.inv=1.3;flash=.15;shake=5;sfx('hit');burst(player.x,player.y-17,9,'#e77c63');
 if(after.tier<before.tier&&after.tier>0)shatterArmor(before.tier);
 announce(after.tier?`Armor 0${after.tier}. ${after.hits} of ${after.capacity} hits left in this stage. ${player.hp} total.`:'Armor depleted.');
 if(player.hp<=0)gameOver();
}
function enemyHit(e,n){if(e.hp<=0)return;e.hp-=n;e.flash=.09;burst(e.x,e.y-(e.type==='drone'?0:25),4,'#d4b086',50);if(e.hp<=0){score+=e.type==='turret'?250:e.type==='drone'?150:100;kills++;burst(e.x,e.y-12,18,'#e7a467');sfx('hit');message('+'+(e.type==='turret'?250:e.type==='drone'?150:100),e.x,e.y-35,.7,'#efe3b8');if(kills%6===0)pickups.push({x:e.x,y:groundAt(e.x)-13,type:'health',phase:0});}}
function bossHit(n){if(!boss||boss.hp<=0)return;if(boss.kind==='beetle'&&!boss.vulnerable){burst(boss.x,boss.y-50,3,'#e0c390',30);return;}boss.hp-=n;boss.flash=.06;burst(boss.x-28,boss.y-58,4,ACID,60);if(boss.hp<=0){boss.hp=0;boss.dead=true;if(!isCity()&&dunes.stage===1){dunes.walkerDown=true;dunes.collapse=2.6;score+=3000;kills++;hostiles=[];hazards=[];player.inv=4;shake=10;message('WALKER DOWN / DUNE PATH OPEN',player.x+200,125,3,ACID);return;}if(isCity()&&zenith.stage===1){score+=3000;kills++;beginGunshipCrash();return;}winTimer=2.6;score+=3000;kills++;hostiles=[];hazards=[];player.inv=5;shake=12;sfx('boom');burst(boss.x,boss.y-50,100,'#f7ba70',140);message(isCity()?'ORB SENTINEL DESTROYED':'DUNE SOVEREIGN DEFEATED',boss.x-140,boss.y-150,2.4,ACID);}}
const HERO_MUZZLES=[[24,38],[20,38],[19,35],[24,37],[24,37],[25,38],[23,28],[29,26],...Array.from({length:8},()=>[26,37])];
function heroPose(anim,firing,air,dashing){return dashing?7:air?6:anim?8+Math.floor(anim)%8:firing?5:0;}
function playerMuzzle(){
 const pose=directionalPose(),f=pose>=0?directionalFrame():armorFrame();
 if(f)return {x:player.x+player.face*f.muzzle[0],y:player.y-f.muzzle[1]};
 if(pose>=0){const h=player.crawling?13:player.crouching?23:36;return {x:player.x+player.aimX*24,y:player.y-h+player.aimY*24};}
 const m=isCity()&&!player.vx&&!player.dash&&player.onGround?[20,36]:HERO_MUZZLES[heroPose(player.vx?player.anim+.000001:0,true,!player.onGround,player.dash>0)];return {x:player.x+player.face*m[0],y:player.y-m[1]};
}
function fire(){
 if(player.cool>0)return;const muzzle=playerMuzzle(),heavy=player.heavy>0;player.cool=heavy?.105:.135;
 const aim=Math.atan2(player.aimY,player.aimX);
 for(let i=0;i<(heavy?3:1);i++){const a=aim+(heavy?(i-1)*.10:0);shots.push({x:muzzle.x,y:muzzle.y,vx:Math.cos(a)*400,vy:Math.sin(a)*400,life:isCity()?1.4:.95,heavy,dmg:3});}
 burst(muzzle.x+player.aimX*4,muzzle.y+player.aimY*4,2,'#fff1b5',30);particles.push({x:player.x,y:player.y-(player.crouching?18:33),vx:-player.face*30,vy:-45,life:.45,size:2,color:'#b79962',gravity:220});sfx('shot');
}
function grenade(){if(player.grenades<=0||player.grenadeCool>0)return;player.grenades--;player.grenadeCool=.6;grenades.push({x:player.x+player.face*10,y:player.y-(player.crouching?17:30),vx:player.face*155,vy:-190,t:1.05,bounce:0});tone(300,'triangle',.08,.1,120);}
function explode(x,y){burst(x,y,45,'#f5af5c',145);sfx('boom');shake=7;for(const e of enemies)if(Math.hypot(e.x-x,e.y-14-y)<92)enemyHit(e,35);if(boss&&Math.hypot(boss.x-x,boss.y-35-y)<125)bossHit(38);if(isCity()&&zenith.stage===2&&!zenith.gateOpen&&Math.abs(x-Z.gate.x)<100&&y<Z.roofY+20&&y>Z.gate.y-50)gateHit(38);for(const c of crates)if(Math.abs(c.x-x)<85)c.hp=0;hostiles=hostiles.filter(b=>Math.hypot(b.x-x,b.y-y)>105);particles.push({x,y,vx:0,vy:0,life:.24,max:.24,size:1,ring:true,color:'#ffe2a1'});}
function enemyFire(e){const sy=e.y-(e.type==='drone'?-8:e.type==='turret'?27:29),sx=e.x+(e.type==='drone'?0:e.face*28),a=Math.atan2(player.y-24-sy,player.x-sx),speed=(e.type==='drone'?102:115)*(isCity()?1.12:1);hostiles.push({x:sx,y:sy,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4,r:3});tone(130,'sawtooth',.06,.025,75);}
function collect(p){p.taken=true;sfx('pickup');if(p.type==='health'){const gained=Math.min(2,player.maxHp-player.hp);player.hp+=gained;message(gained?'ARMOR +'+gained:'ARMOR FULL',p.x,p.y-25,1.3,CYAN);const a=armorStatus();announce('Armor repaired. Armor 0'+a.tier+', '+a.hits+' hits in this stage. '+player.hp+' of '+player.maxHp+' total.');}else if(p.type==='heavy'){player.heavy=14;message('HEAVY ROUNDS',p.x,p.y-25,1.3,ACID);announce('Heavy rounds acquired');}else{player.grenades=Math.min(9,player.grenades+3);message('GRENADES +3',p.x,p.y-25,1.3,'#eab483');}}
function update(dt){clock+=dt;
 if(state==='menu'){cam=120;updateParticles(dt);return;}if(state!=='playing'){if(state==='dead')updateParticles(dt);return;}
 elapsed+=dt;player.cool-=dt;player.grenadeCool-=dt;player.inv=Math.max(0,player.inv-dt);player.heavy=Math.max(0,player.heavy-dt);player.dashCool=Math.max(0,player.dashCool-dt);player.dash=Math.max(0,player.dash-dt);shake=Math.max(0,shake-dt*22);flash=Math.max(0,flash-dt);
 let move=(down('right')?1:0)-(down('left')?1:0);if(move)player.face=move;updateStance(move);player.vx=move*(player.crawling?38:isCity()?126:112);
 if(tap('dash')&&!player.crouching&&player.dashCool===0){player.dash=.18;player.dashCool=.8;sfx('dash');}
 if(player.crouching)player.dash=0;
 if(player.dash>0){player.vx=player.face*290;particles.push({x:player.x,y:player.y-13,vx:0,vy:0,life:.2,size:8,color:'#b4885c80',gravity:0});}
 if(tap('jump')&&canStand()&&(player.onGround||player.coyote>0||player.jumps<2)){player.vy=-245;player.jumps=player.onGround||player.coyote>0?1:2;player.onGround=false;player.coyote=0;sfx('jump');burst(player.x,player.y,7,'#d6b384',45);}
 updateStance(move);
 if(down('fire'))fire();if(tap('grenade'))grenade();
 const prevY=player.y,prevX=player.x;player.x+=player.vx*dt;player.vy+=610*dt;player.y+=player.vy*dt;player.onGround=false;player.coyote=Math.max(0,player.coyote-dt);
 if(isCity())resolveCityMotion(prevX,prevY);
 if(!isCity())resolveDunesMotion(prevX,prevY);
 for(const p of platforms)if(player.x>p.x-5&&player.x<p.x+p.w+5&&prevY<=p.y+1&&player.y>=p.y&&player.vy>=0){player.y=p.y;player.vy=0;player.onGround=true;player.jumps=0;player.coyote=.1;}
 player.x=Math.max(isCity()?(zenith.stage===3&&bossTriggered?8050:zenith.stage===2?4308:zenith.stage===3?5808:bossTriggered?3550:18):dunes.stage===3?(bossTriggered?9820:7608):dunes.stage===2?4308:bossTriggered?3550:18,Math.min((isCity()?Z.length:dunes.stage>1||dunes.walkerDown?D.length:LENGTH)-28,player.x));if(move&&player.onGround&&player.dash===0)player.anim=(player.anim+Math.abs(player.vx)*dt/10)%8;else if(!move)player.anim=0;
 if(move&&player.onGround&&Math.random()<.24)particles.push({x:player.x-move*6,y:player.y-1,vx:-move*20,vy:-rand()*16,life:.35,size:2,color:'#d49a57',gravity:20});
 if(player.x>2100&&!usedCheckpoint){checkpoint=2100;usedCheckpoint=true;player.hp=player.maxHp;player.grenades=Math.max(4,player.grenades);message('RELAY SECURED / ARMOR RESTORED',2260,122,3,ACID);sfx('pickup');announce('Checkpoint reached. Armor restored.');}
 if(player.x>3590&&!bossTriggered&&(isCity()?(zenith.stage===1&&!zenith.breached):(dunes.stage===1&&!dunes.walkerDown))){bossTriggered=true;boss={x:4005,y:isCity()?205:GROUND,hp:230,maxHp:230,t:0,cycle:0,cool:2,flash:0,dead:false,slam:0};message(isCity()?'WARNING / WARDEN ONLINE':'WARNING / EXTRACTOR ONLINE',3860,105,2.4,'#f2ad77');announce(isCity()?'Boss encounter. Destroy the Warden gunship.':'Boss encounter. Destroy the extraction mech.');}
 const targetCam=isCity()?cityCameraX():dunesCameraX();cam+=(targetCam-cam)*Math.min(1,dt*6);
 const targetY=isCity()?cityCameraY():dunesCameraY();camY+=(targetY-camY)*Math.min(1,dt*5);
 if(player.y>800){player.x=checkpoint||80;player.y=groundAt(player.x);player.vy=0;damage(1);}
 for(const e of enemies){if(e.hp<=0||Math.abs(e.x-player.x)>510)continue;e.t+=dt;e.cool-=dt;e.flash=Math.max(0,e.flash-dt);e.face=player.x<e.x?-1:1;
  if(e.type==='bug'){updateSandBug(e,dt);continue;}if(e.type==='drone')e.y=(isCity()?e.baseY:196)+Math.sin(e.t*1.6)*30;else if(e.type==='soldier'){if(Math.abs(player.x-e.x)<250&&Math.abs(player.x-e.x)>110)e.x+=e.face*23*dt;else e.x+=Math.sin(e.t)*8*dt;}
  if(isCity()&&e.type!=='drone'){const p=e.patrol||roadAt(e.home);e.x=Math.max(p.x+20,Math.min(p.x+p.w-20,e.x));}
  if(e.cool<.4&&Math.abs(e.x-player.x)<340)e.alert=.4-e.cool;else e.alert=0;
  if(e.cool<=0&&Math.abs(e.x-player.x)<340&&Math.abs(e.y-player.y)<200){enemyFire(e);e.cool=e.type==='turret'?1.6:e.type==='drone'?2.4:2.3;}
  if(Math.abs(e.x-player.x)<13&&Math.abs((e.y-(e.type==='drone'?0:12))-(player.y-12))<19)damage(1);
 }
 enemies=enemies.filter(e=>e.hp>0);
 for(const b of shots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(hitGate(b.x,b.y)){gateHit(b.dmg);b.life=0;}if(b.life>0&&isCity()&&cityBlocked(b.x,b.y)){b.life=0;burst(b.x,b.y,2,'#73d7ff',20);}if(b.life>0&&dunesBlocked(b.x,b.y))b.life=0;if(b.life<=0)continue;for(const e of enemies){const ey=e.y-(e.type==='drone'?0:e.type==='bug'?14:24);if(Math.abs(b.x-e.x)<(e.type==='bug'?26:e.type==='turret'?17:12)&&Math.abs(b.y-ey)<(e.type==='bug'?14:e.type==='drone'?16:24)){enemyHit(e,b.dmg);b.life=0;break;}}
  if(b.life>0&&bossContains(b.x,b.y)){bossHit(b.dmg);b.life=0;}
  if(b.life>0)for(const c of crates)if(c.hp>0&&Math.abs(b.x-c.x)<13&&b.y>c.y-35&&b.y<c.y){c.hp-=b.dmg;burst(c.x,c.y-16,5,'#c9a771');b.life=0;break;}
 }shots=shots.filter(b=>b.life>0);
 for(const b of hostiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.abs(b.x-player.x)<playerWidth()+b.r&&b.y>player.y-playerHeight()&&b.y<player.y-2){damage(1);b.life=0;}if(isCity()?cityBlocked(b.x,b.y):expandedDesert()?dunesBlocked(b.x,b.y):b.y>GROUND){burst(b.x,b.y,3,'#f1b780',25);b.life=0;}}
 hostiles=hostiles.filter(b=>b.life>0&&Math.abs(b.x-player.x)<600);
 for(const n of grenades){n.t-=dt;const oldY=n.y;n.x+=n.vx*dt;n.y+=n.vy*dt;n.vy+=420*dt;
  let floor=isCity()?Infinity:groundAt(n.x);
  if(isCity()||expandedDesert())for(const p of [...(isCity()?cityGeometry():[]),...platforms])if(n.x>=p.x&&n.x<=p.x+p.w&&oldY<=p.y&&n.y>=p.y&&n.vy>0)floor=Math.min(floor,p.y);
  if(n.y>floor-4){n.y=floor-4;n.vy=-Math.abs(n.vy)*.45;n.vx*=.62;}
  if(n.t<=0)explode(n.x,n.y);
 }grenades=grenades.filter(n=>n.t>0);
 for(const c of crates)if(c.hp<=0&&!c.broken){c.broken=true;burst(c.x,c.y-14,18,'#c6a47b');pickups.push({x:c.x,y:c.y-13,type:c.drop,phase:0});score+=25;}
 for(const p of pickups){p.phase+=dt;if(Math.abs(p.x-player.x)<19&&Math.abs(p.y-(player.y-16))<29)collect(p);}pickups=pickups.filter(p=>!p.taken);
 if(isCity())updateCityRoute(dt);else updateDunesRoute(dt);
 if(boss&&!boss.dead&&isCity()){if(boss.kind==='orb')updateOrb(dt);else updateGunship(dt);}
 if(boss&&!boss.dead&&boss.kind==='beetle')updateBeetle(dt);
 if(boss&&!boss.dead&&!isCity()&&boss.kind!=='beetle'){boss.t+=dt;boss.cool-=dt;boss.flash=Math.max(0,boss.flash-dt);boss.slam=Math.max(0,boss.slam-dt);boss.x=4005+Math.sin(boss.t*.7)*35;
  if(boss.cool<=0){boss.cycle++;const phase=boss.hp<boss.maxHp*.45;
   if(boss.cycle%(isCity()?2:3)===0){boss.slam=1.1;for(let i=0;i<3;i++)hazards.push({x:Math.max(3580,Math.min(4260,player.x-75+i*85)),t:1.15,done:false});boss.cool=phase?2:2.6;}
   else{const origin={x:boss.x-126,y:boss.y-108},a=Math.atan2(player.y-17-origin.y,player.x-origin.x);for(let i=-(isCity()?2:1);i<=(isCity()?2:1);i++)hostiles.push({x:origin.x,y:origin.y,vx:Math.cos(a+i*.18)*(phase?142:117),vy:Math.sin(a+i*.18)*(phase?142:117),life:5,r:4});boss.cool=phase?.85:1.35;}
  }
  if(Math.abs(player.x-boss.x)<62&&player.y>boss.y-95)damage(1);
 }
 for(const h of hazards){h.t-=dt;if(h.t<=0&&!h.done){h.done=true;burst(h.x,GROUND-4,25,'#f4bc6c',115);sfx('boom');shake=5;if(Math.abs(player.x-h.x)<29&&player.y>GROUND-42)damage(1);}}hazards=hazards.filter(h=>h.t>-.3);
 if(winTimer>0){if(isCity())boss.y=Math.min(Z.roofY-10,boss.y+dt*46);else if(boss.kind==='beetle')boss.y=Math.min(D.summitY,boss.y+dt*65);winTimer-=dt;if(Math.random()<dt*12){burst(boss.x+(rand()-.5)*100,boss.y-rand()*100,18,'#f6aa5e');sfx('boom');}if(winTimer<=0)finish();}
 updateParticles(dt);for(const t of texts){t.life-=dt;t.y-=dt*8;}texts=texts.filter(t=>t.life>0);
 if(soundOn&&audio&&audio.currentTime>nextBeat){nextBeat=audio.currentTime+.31;const bass=[55,55,65.4,49,55,55,82.4,65.4][Math.floor(beat/4)%8];if(beat%2===0)tone(bass,'triangle',.24,.09);if(beat%4===0)tone(95,'sine',.14,.13,28);if(beat%4===2)noise(.06,.045);beat++;}
}
function updateGunship(dt){
 boss.t+=dt;boss.cool-=dt;boss.flash=Math.max(0,boss.flash-dt);boss.slam=Math.max(0,boss.slam-dt);
 const rage=boss.hp<boss.maxHp*.45;
 boss.x=3970+Math.sin(boss.t*.65)*125;boss.y=190+Math.sin(boss.t*1.1)*36;
 if(boss.cool<=0){boss.cycle++;
  if(boss.cycle%3===0){boss.slam=1.3;const target=player.x;for(let i=-1;i<=1;i++)hazards.push({x:Math.max(3580,Math.min(4260,target+i*70)),t:1.3,done:false});boss.cool=rage?1.8:2.4;}
  else{const ox=boss.x-100,oy=boss.y-48,a=Math.atan2(player.y-22-oy,player.x-ox);for(let i=-1;i<=1;i++)hostiles.push({x:ox,y:oy,vx:Math.cos(a+i*.21)*(rage?150:125),vy:Math.sin(a+i*.21)*(rage?150:125),life:5,r:4});boss.cool=rage?.85:1.3;}
 }
 if(Math.abs(player.x-boss.x)<95&&player.y>boss.y-100&&player.y-playerHeight()<boss.y-10)damage(1);
}
function updateParticles(dt){for(const e of effects)e.age+=dt;effects=effects.filter(e=>e.age<e.duration);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.gravity||0)*dt;if(p.plate)p.rotation+=p.spin*dt;}particles=particles.filter(p=>p.life>0);}
// Dense painted-pixel artwork with independent world geometry and effects layers.
function background(){
 rect(0,0,W,H,isCity()?'#050d23':'#844329');
 if(!art||!art.loaded)return;
 if(expandedDesert()){dunesBackground();return;}
 if(isCity()&&zenith.stage===3){const im=art.assets.skyline,offset=(cam-5800)*.10;g.drawImage(im,-offset-60,-20,1200,400);rect(0,0,W,H,'#07122915');return;}
 if(isCity()){const im=art.assets.city,bx=-(cam*.18)%900,by=zenith.stage===2?-80:-80-camY*.12;g.drawImage(im,bx,by,1200,500);if(bx+1200<W)g.drawImage(im,bx+1200,by,1200,500);rect(0,0,W,H,'#080f2790');cityMidground();return;}
 const im=art.assets.wastes,bw=GROUND*im.width/im.height;
 const offset=28+Math.min(1,cam/(LENGTH-W))*(bw-W-28);
 g.drawImage(im,0,0,im.width,im.height,-Math.round(offset),0,bw,GROUND);
 // Slowly moving sand haze separates the distant wreck from the walkable foreground.
 g.save();g.globalAlpha=.07;g.fillStyle=isCity()?'#6c65ff':'#ffd396';
 for(let i=0;i<6;i++){const x=((i*157-clock*9-cam*.23)%850+850)%850-100;g.beginPath();g.ellipse(x,266+i%3*13,110,5+i%2*4,0,0,Math.PI*2);g.fill();}g.restore();
}
function steel(x,y,w,h,seed=1){
 const bands=isCity()?['#090f24','#384e72','#8bccdf','#233751','#1c2940','#122035','#0a1020']:['#211713','#9f7250','#e7b780','#795743','#584238','#3e302a','#29221e'];
 rect(x,y,w,h,bands[0]);rect(x+1,y+1,w-2,h-2,bands[4]);rect(x+1,y+1,w-2,1,bands[2]);rect(x+1,y+2,w-2,2,bands[1]);rect(x+2,y+4,w-4,Math.max(1,h-7),bands[3]);rect(x+2,y+h-3,w-4,2,bands[6]);
 for(let i=0;i<Math.floor(w*h/12);i++){const px=x+2+hash(i+seed)*Math.max(1,w-5),py=y+4+hash(i+seed+52)*Math.max(1,h-8);rect(px,py,hash(i+61)>.8?2:1,1,bands[hash(i+79)>.6?1:5]);}
 for(const px of [x+3,x+w-5])for(const py of [y+4,y+h-5]){rect(px,py,2,2,'#30221b');rect(px,py,1,1,'#e6c296');}
}
function shadow(x,y,w){g.save();g.fillStyle='#2c120b85';g.beginPath();g.ellipse(x,y,w,3.5,0,0,Math.PI*2);g.fill();g.restore();}
function foregroundWorld(){
 if(!art||!art.loaded)return;
 if(isCity()){cityForeground();return;}
 if(expandedDesert()){drawDunesExpansion();return;}
 const im=art.assets.terrain,tw=288,th=tw*im.height/im.width,tx=-((cam)%tw);
 for(let i=-1;i<4;i++)g.drawImage(im,Math.round(tx+i*tw),GROUND,tw,th);
 const shade=g.createLinearGradient(0,GROUND,0,H);shade.addColorStop(0,'#28150a00');shade.addColorStop(1,'#24130c99');g.fillStyle=shade;g.fillRect(0,GROUND,W,H-GROUND);
 rect(0,GROUND,W,1,'#f3c585');rect(0,GROUND+1,W,1,'#bf793e');
 for(const p of platforms){const x=Math.round(p.x-cam);if(x>W+30||x+p.w<-30)continue;
  // Pipes and braced support legs keep raised platforms visibly separate from the backdrop.
  for(const lx of [x+8,x+p.w-13]){steel(lx,p.y+10,7,GROUND-p.y-10,p.x);rect(lx+2,p.y+20,1,GROUND-p.y-24,'#c5a07b');for(let yy=p.y+22;yy<GROUND-5;yy+=19)steel(lx-2,yy,11,5,p.x+yy);}
  g.strokeStyle='#38251d';g.lineWidth=4;g.beginPath();g.moveTo(x+12,p.y+17);g.lineTo(x+p.w-10,GROUND-4);g.moveTo(x+p.w-10,p.y+17);g.lineTo(x+12,GROUND-4);g.stroke();g.lineWidth=1;g.strokeStyle='#9d6d45';g.stroke();
  steel(x,p.y,p.w,12,p.x);for(let xx=x+5;xx<x+p.w-6;xx+=12){poly([[xx,p.y+5],[xx+5,p.y+5],[xx+2,p.y+9],[xx-3,p.y+9]],'#b58b5e');}
  rect(x+4,p.y+1,p.w-8,1,'#ebc396');rect(x+8,p.y+11,p.w-16,1,'#dba25d76');
 }
 // The checkpoint gantry gets the same worn, layered metal treatment.
 const qx=2140-cam;if(qx>-100&&qx<740){steel(qx,168,11,136,6);steel(qx+77,168,11,136,7);steel(qx-3,164,95,16,8);steel(qx+23,150,40,15,9);text(usedCheckpoint?'ON':'07',qx+36,154,1,CYAN);rect(qx+5,183,2,103,usedCheckpoint?ACID:CYAN);rect(qx+82,183,2,103,usedCheckpoint?ACID:CYAN);for(let i=0;i<7;i++)rect(qx+3+i*13,171,6,3,'#dec283');}
 // Tiny foreground stones, shards and tufts break the flat ground silhouette.
 for(let i=Math.floor(cam/79);i<cam/79+10;i++){const x=i*79-cam,r=hash(i+79);if(r>.35){poly([[x-7,GROUND],[x-3,GROUND-4],[x+2,GROUND-5],[x+7,GROUND-1]],'#673723');rect(x-3,GROUND-4,5,1,'#d79b56');rect(x,GROUND-2,5,1,'#95532d');}else{for(let j=0;j<5;j++){g.strokeStyle=j%2?'#70482e':'#cc9452';g.lineWidth=.6;g.beginPath();g.moveTo(x,GROUND);g.lineTo(x+(j-2)*2,GROUND-5-hash(i+j)*4);g.stroke();}}}
}
function facade(x,y,w,h,style=0,alpha=1){
 if(!art||!art.loaded)return;const im=art.assets.facades,cw=im.width/3;
 g.save();g.globalAlpha=alpha;g.drawImage(im,style%3*cw,0,Math.min(cw,w*2.5),Math.min(im.height,h*2.5),Math.round(x),Math.round(y),Math.round(w),Math.round(h));g.restore();
}
function cityMidground(){
 // Separate apartment towers move more slowly than the playable roofs.
 for(let i=Math.floor(cam*.7/235)-1;i<cam*.7/235+4;i++){const x=i*235-cam*.7,y=-140-camY*.65+hash(i+5)*100;
  facade(x,y,175,650,i+300,.85);rect(x,y,175,650,'#080f2870');rect(x+171,y,8,650,'#050b19');
  for(let yy=y+45;yy<y+650;yy+=92){rect(x-8,yy,193,8,'#142237');rect(x-8,yy,193,1,'#52647c');}
 }
}
function roofEdge(x,y,w){
 steel(x,y,w,19,Math.round(x));rect(x,y,w,3,'#9ebbbf');rect(x,y+3,w,2,'#375e6e');
 for(let xx=x+6;xx<x+w-10;xx+=25){poly([[xx,y+8],[xx+12,y+8],[xx+6,y+15],[xx-6,y+15]],'#a98b36');}
 rect(x,y+19,w,7,'#060c19');rect(x+4,y+25,w-8,2,'#2f4761');
}
function cityForeground(){
 if(zenith.stage>1){drawCityExpansion();return;}
 drawCityExpansion();
 // Buildings behind the player are at world scale, breaking up the distant skyline.
 const walls=[[-110,-170,245,474,0],[370,-160,200,424,1],[700,-170,220,334,2],[1200,160,470,294,2],[1910,-80,250,434,0],[2400,-250,200,454,1],[2680,-200,170,344,2],[3040,80,220,304,1],[3540,-220,120,524,2],[4220,-260,140,564,0]];
 for(const [wx,wy,w,h,style] of walls){if(wx===4220&&zenith.breached)continue;const x=wx-cam;if(x>W||x+w<0)continue;facade(x,wy,w,h,style);rect(x,wy,w,h,'#030b1838');rect(x,wy,5,h,'#0b1629');rect(x+w-6,wy,6,h,'#040a16');}
 for(const p of citySolids){const x=p.x-cam;if(x>W+30||x+p.w<-30)continue;
  const visibleH=Math.min(p.h,camY+H+40-p.y);if(visibleH>0){facade(x,p.y,p.w,p.road?500:p.h,p.style);if(p.road)rect(x,p.y+29,p.w,Math.max(0,visibleH-29),'#050a1640');}
  roofEdge(x,p.y,p.w);
  if(!p.road){for(const sx of [x+5,x+p.w-18]){steel(sx,p.y+p.h,13,groundAt(p.x+p.w/2)-p.y-p.h);rect(sx+2,p.y+p.h,2,Math.max(0,groundAt(p.x+p.w/2)-p.y-p.h),'#62a3c3');}rect(x+30,p.y+p.h-4,p.w-60,3,'#6bdbf2');}
  if(p.road){for(let xx=x+18;xx<x+p.w-25;xx+=66){rect(xx,p.y+45,41,28,'#070f1d');for(let j=0;j<5;j++)rect(xx+3,p.y+49+j*4,35,1,'#304258');}}
 }
 for(const p of cityPlatforms){const x=p.x-cam;roofEdge(x,p.y,p.w);for(const sx of [x+7,x+p.w-15])steel(sx,p.y+27,8,GROUND-p.y-27);}
 // Local details: fenced ledges, street lamps, air-conditioning units, signs and ducts.
 for(let i=0;i<cityRoad.length;i++){const p=cityRoad[i],x=p.x-cam,y=p.y;if(x>W||x+p.w<0)continue;
  if(i%3===0){const sx=x+45;steel(sx,y-105,5,105);steel(sx-5,y-110,42,9);rect(sx-1,y-101,32,2,'#8ef4f2');rect(sx+60,y-28,43,28,'#253449');steel(sx+62,y-26,39,23);for(let j=0;j<7;j++)rect(sx+66+j*4,y-22,1,15,'#0b1828');}
  if(i%3===1){for(let fx=x+10;fx<x+p.w-10;fx+=28){rect(fx,y-34,2,34,'#58717d');for(let k=0;k<4;k++){g.strokeStyle='#607f8a77';g.beginPath();g.moveTo(fx,y-32+k*8);g.lineTo(fx+28,y-8+k*8);g.stroke();}}rect(x+10,y-35,p.w-20,2,'#6b8994');}
 }
 const q=2140-cam;steel(q,168,11,136);steel(q+77,168,11,136);roofEdge(q-4,156,99);text(usedCheckpoint?'LINKED':'RELAY',q+29,184,1,'#73eddf');rect(q+4,194,3,91,usedCheckpoint?'#72ffad':'#34acdd');
 for(const [x,y,str,col] of [[180,235,'SERVICE  >','#6ce4df'],[685,95,'ROOFTOPS  >','#f2bc68'],[1405,390,'LOWER WORKS  >','#a8daf0'],[2620,80,'SKYBRIDGE  >','#f2bc68'],[3600,270,'AIRSPACE  >','#f29193']])if(Math.abs(x-cam-320)<400){rect(x-cam-5,y-6,str.length*6+10,21,'#07101de8');text(str,x-cam,y,1,col);}
}
function cityOccluders(){
 if(zenith.stage>1)return;
 // Close foreground passes in front of the actors. Fade only the column covering the hero.
 for(const p of cityColumns){const x=p.x-cam*1.025;if(x<-80||x>W+80)continue;g.save();const overlap=Math.abs((player.x-cam)-(x+p.w/2))<p.w/2+20&&player.y>p.y&&player.y-45<p.y+p.h;g.globalAlpha=overlap?.30:.96;
  facade(x,p.y,p.w,p.h,2);rect(x,p.y,5,p.h,'#030814');rect(x+p.w-4,p.y,4,p.h,'#2c5267');for(let yy=p.y+20;yy<p.y+p.h;yy+=70){steel(x-5,yy,p.w+10,12);rect(x-2,yy+4,p.w+4,2,'#536e81');}g.restore();
 }
 for(const p of cityOverhangs){const x=p.x-cam;rect(x-12,p.y-25,p.w+24,25,'#050b18');steel(x-15,p.y-28,p.w+30,10);for(let xx=x;xx<x+p.w;xx+=40)rect(xx,p.y-17,17,3,'#263b53');}
 // Foreground cable bundles hang across select streets and leave the travel line readable.
 for(const wx of [80,1000,2300,3000]){const x=wx-cam*1.06;if(x<-450||x>W)continue;g.strokeStyle='#030815';g.lineWidth=5;g.beginPath();g.moveTo(x,-40);g.quadraticCurveTo(x+180,90,x+360,-25);g.stroke();g.lineWidth=1;}
}
function person(x,y,face,anim,enemy=false,firing=false,air=false,dashing=false){
 if(!art||!art.loaded)return;
 const index=enemy?(firing?3:anim?([1,0,2,0][Math.floor(anim*1.6)%4]):0):heroPose(anim,firing,air,dashing);
 const f=enemy?art.frames.enemies[index]:armorFrame(anim,air,dashing);
 const height=enemy?49:53;
 if(!air)shadow(x,y,enemy?15:17);
 const bob=!anim&&!firing?Math.sin(clock*3)*.45:0;
 const pose=enemy?-1:directionalPose(),df=pose<0?null:directionalFrame();
 if(df){
  if(pose<2&&(anim||air)){
   g.save();g.beginPath();g.rect(x-60,y-24,120,25);g.clip();art.sprite(g,f,x,y,height,face);g.restore();
   g.save();g.beginPath();g.rect(x-60,y-90,120,66);g.clip();art.sprite(g,df,x,y,height,face);g.restore();
  }else art.sprite(g,df,x,y,height,face);
 }else art.sprite(g,f,x,y-bob,height,face);
 // While running, the weapon still flashes without interrupting the leg animation.
 if(firing){const muzzle=enemy?{x:x+face*33,y:y-32}:playerMuzzle();g.save();g.translate(enemy?muzzle.x:muzzle.x-cam,muzzle.y);g.rotate(enemy?(face<0?Math.PI:0):Math.atan2(player.aimY,player.aimX));poly([[0,0],[7,-5],[5,-1],[14,0],[5,2],[6,5],[-1,2]],'#f79441');poly([[0,0],[6,-2],[10,0],[5,2],[0,2]],'#fff4b7');g.restore();}
}
function drone(e){if(!art||!art.loaded)return;const x=e.x-cam,y=e.y;art.sprite(g,art.frames.enemies[4],x,y,37,e.face||1,1,.52);g.save();g.globalCompositeOperation='lighter';rect(x-5,y+15+Math.sin(clock*18),2,4,'#b6bfa944');rect(x+9,y+13+Math.cos(clock*18),2,5,'#b6bfa944');g.restore();if(e.alert>.08)text('!',x-2,y-28,1,'#ffcc8e');}
function turret(e){if(!art||!art.loaded)return;const x=e.x-cam;shadow(x,e.y,25);art.sprite(g,art.frames.enemies[5],x,e.y,36,e.face);if(e.alert>.15){circle(x+e.face*18,e.y-29,2,'#ffda8e');}}
function drawBoss(b,menu=false){if(!art||!art.loaded)return;if(b.kind==='beetle'){drawBeetle(b);return;}if(isCity()&&!menu){if(b.kind==='orb')drawOrb(b);else drawGunship(b);return;}const x=menu?484:b.x-cam,y=menu?GROUND:b.y,t=menu?clock:b.t,height=menu?163:159;
 shadow(x+4,y,107);g.save();if(isCity())g.filter='hue-rotate(165deg) saturate(.8)';if(b.flash>0)g.filter='brightness(1.65)';if(b.dead)g.filter='brightness(.55) sepia(.4)';art.sprite(g,art.frames.boss,x,y-Math.sin(t*2)*1,height);g.restore();
 // Exhaust wisps and the energized reactor keep the massive machine alive.
 g.save();g.globalCompositeOperation='lighter';const pulse=.5+Math.sin(t*4)*.16;g.globalAlpha=pulse;circle(x-6,y-height*.56,5,'#d4b37c33');g.restore();
 for(let i=0;i<8;i++){const age=(t*.4+i/8)%1,xx=x+44+Math.sin(t+i)*5;g.save();g.globalAlpha=(1-age)*.13;g.fillStyle='#a6a08b';g.beginPath();g.ellipse(xx+age*14,y-height+6-age*33,4+age*7,3+age*4,0,0,Math.PI*2);g.fill();g.restore();}
 if(!menu&&b.slam>0){text('!',x-3,y-height-11,2,'#ffcb8c');}
}
function drawGunship(b){
 const x=b.x-cam,y=b.y;g.save();if(b.flash>0)g.filter='brightness(1.9)';if(b.dead)g.filter='brightness(.45)';
 if(b.rotation){g.translate(x,y-50);g.rotate(b.rotation);art.sprite(g,art.frames.gunship,0,50,112,1);}else art.sprite(g,art.frames.gunship,x,y,112,1);g.restore();
 if(!b.dead){for(const dx of [19,117]){g.save();g.globalCompositeOperation='lighter';circle(x+dx,y-15,5+Math.sin(clock*28), '#65eaff35');g.restore();}
  if(b.slam>0){g.save();g.globalAlpha=.24;for(const h of hazards){poly([[x,y-15],[h.x-cam-20,GROUND],[h.x-cam+20,GROUND]],'#f46699');}g.restore();text('MISSILE LOCK',x, y-125,1,'#ff8d9f','center');}
 }
}
function drawCrate(c){if(!art||!art.loaded)return;const x=c.x-cam;if(x<-45||x>W+45)return;if(c.broken){for(let i=0;i<7;i++)rect(x-14+i*4,c.y-2-hash(c.x+i)*3,4,2,i%2?'#5f5c42':'#a69b6c');return;}shadow(x,c.y,24);art.sprite(g,art.frames.enemies[6],x,c.y,35);}
function drawPickup(p){const x=Math.round(p.x-cam),y=Math.round(p.y+Math.sin(clock*3+p.phase)*2),col=p.type==='health'?CYAN:p.type==='heavy'?ACID:'#edb278';shadow(x,p.y+12,8);steel(x-9,y-9,18,18,p.x);rect(x-6,y-5,12,11,'#3c2b20');text(p.type==='health'?'+':p.type==='heavy'?'H':'G',x-2,y-3,1,col);rect(x-6,y-7,12,1,col);g.save();g.globalCompositeOperation='lighter';rect(x-6,y-7,12,1,col+'88');g.restore();}
function drawEffects(){if(!art||!art.loaded)return;for(const e of effects){const p=e.age/e.duration,x=e.x-cam,y=e.y,s=e.size*(.45+Math.min(1,p*4)*.75);g.save();if(p>.38){g.filter='brightness(.28) saturate(.35)';art.sprite(g,art.frames.enemies[7],x+8*p,y-16*p,s*1.2,1,(1-p)*.55,.6);g.filter='none';}art.sprite(g,art.frames.enemies[7],x,y-p*7,s,1,Math.max(0,1-p*1.4),.6);if(p<.15){g.globalCompositeOperation='lighter';circle(x,y,s*.24,'#ffe5a43c');}g.restore();}}
function hudText(str,x,y,size=1,color='#f2e4bd',align='left'){text(str,x+1,y+1,size,'#1d211a',align);text(str,x,y,size,color,align);}
function drawHUD(){
 // Compact beveled arcade panels let the detailed environment fill the screen.
 steel(8,7,134,36,11);rect(11,10,128,30,'#2d211be8');
 if(art&&art.loaded){const f=armorSet().portrait;g.save();g.beginPath();g.rect(14,12,23,24);g.clip();g.drawImage(f.image,f.x,f.y,f.w,f.h,13,11,25,27);g.restore();}
 hudText('1UP',44,12,1,'#ffdf87');hudText(String(score).padStart(6,'0'),68,12,1,'#f0ebd2');
 rect(44,24,91,12,'#1b130f');for(let i=0;i<7;i++){const xx=46+i*12.5;rect(xx,26,10,8,i<player.hp?'#d3aa72':'#4c3a2e');if(i<player.hp){rect(xx,26,10,2,'#ffe2b0');rect(xx,32,10,2,'#98613b');}}
 const a=armorStatus(),armorColor=a.tier===1?'#ff8b7c':isCity()?'#8adbe9':'#f1cd8f';
 steel(248,7,108,36,14);rect(251,10,102,30,'#17212ce8');hudText('ARMOR 0'+a.tier,257,13,1,armorColor);
 for(let i=0;i<a.capacity;i++){rect(257+i*15,27,11,7,i<a.hits?armorColor:'#3c4855');}
 hudText(a.tier===1?'LAST':a.hits+'/'+a.capacity,347,27,1,armorColor,'right');
 steel(151,7,87,36,12);rect(154,10,81,30,'#30231ce8');hudText(player.heavy>0?'HEAVY':'RIFLE',159,13,1,player.heavy>0?ACID:'#dfd1a5');hudText('BOMB '+String(player.grenades).padStart(2,'0'),159,27,1,'#eccc8b');
 hudText(Math.max(0,Math.floor(elapsed/60))+':'+String(Math.floor(elapsed%60)).padStart(2,'0'),W-16,13,2,'#f6d791','right');hudText('STAGE '+(isCity()?zenith.stage:dunes.stage)+'/3',W-16,32,1,'#dfd8b8','right');
 rect(10,50,101,3,'#2b1b14ba');rect(10,50,101*Math.min(1,isCity()?zenith.stage===1?player.x/4300:zenith.stage===2?(304-player.y)/(304-Z.roofY):(player.x-5800)/3100:dunes.stage===1?player.x/4300:dunes.stage===2?(player.x-4300)/3300:(player.x-7600)/3100),3,ACID);hudText(isCity()?stageObjective():dunesObjective(),118,48,1,'#e7e0b5');
 if(player.heavy>0)rect(155,40,80*(player.heavy/14),1,CYAN);
 if(boss&&!boss.dead){steel(188,62,264,23,13);rect(191,65,258,17,'#39271c');hudText(isCity()?(boss.kind==='orb'?'ZP ORB SENTINEL':'WARDEN GUNSHIP'):boss.kind==='beetle'?'DUNE SOVEREIGN':'THE EXTRACTOR',W/2,67,1,'#ead9ae','center');rect(198,77,244,4,'#231711');rect(198,77,244*(boss.hp/boss.maxHp),4,boss.hp<boss.maxHp*.45?'#d98252':'#dba358');rect(198,77,244*(boss.hp/boss.maxHp),1,'#f1df9b');}
 if(isCity()&&zenith.stage===2&&!zenith.gateOpen&&player.y<Z.roofY+150){steel(210,62,220,23,15);hudText('SECURITY GATE',320,66,1,'#aee9ff','center');rect(218,78,204,3,'#24314c');rect(218,78,204*zenith.gateHP/120,3,'#ef7ba7');}
 if(!isCity()&&dunes.warning){rect(150,105,340,22,'#24120de8');hudText((dunes.warning.dir<0?'BEETLES FROM RIGHT <':'BEETLES FROM LEFT >')+' / JUMP',W/2,112,1,'#ffe4a2','center');}
 if(isCity()&&zenith.trafficWarning){const w=zenith.trafficWarning;hudText(w.dir<0?'TRAFFIC FROM RIGHT / JUMP':'TRAFFIC FROM LEFT / JUMP',320,100,1,'#ffcb79','center');}
 if(player.x<220&&elapsed<8)hudText('MOVE >  JUMP >  HOLD FIRE',W/2,329,1,'#f1dba4','center');
}

function draw(){
 if(['menu','map','options'].includes(state))return;
 g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
 g.save();if(shake>0&&state==='playing')g.translate(Math.round((Math.random()-.5)*shake),Math.round((Math.random()-.5)*shake));background();g.translate(0,-Math.round(camY));foregroundWorld();
 if(state==='menu'){
  // An animated, in-engine title vignette, not a disconnected illustration.
  drawBoss({t:clock},true);person(325,GROUND,1,0,false,Math.sin(clock*5)>.95);
  for(let i=0;i<3;i++)drone({x:cam+355+i*68,y:112+Math.sin(clock*1.3+i)*7+i*8,flash:0,alert:0});

 }else{
  for(const h of hazards){const x=h.x-cam;if(h.t>0){rect(x-23,GROUND-3,46,3,Math.sin(clock*24)>0?'#f1ba76':'#a76048');for(let i=0;i<5;i++)rect(x-20+i*10,GROUND-7,5,2,'#e7ac6f');text('!',x-2,GROUND-27,1,'#ffd99c');}else{rect(x-8,GROUND-55,16,55,'#ffe0a5');rect(x-16,GROUND-28,32,28,'#e79d68');}}
  for(const c of crates)drawCrate(c);
  for(const p of pickups)if(Math.abs(p.x-cam-W/2)<370)drawPickup(p);
  for(const e of enemies)if(e.x-cam>-45&&e.x-cam<W+45){if(e.type==='bug')drawSandBug(e);else if(e.type==='drone')drone(e);else if(e.type==='turret')turret(e);else{person(e.x-cam,e.y,e.face,e.t*5,true,e.cool>2.22);if(e.alert>.12)text('!',e.x-cam-2,e.y-46,1,'#efbc87');}}
  if(boss)drawBoss(boss);
  if(player&&(player.inv===0||Math.floor(player.inv*13)%2===0)&&state!=='dead')person(player.x-cam,player.y,player.face,player.vx?player.anim+.000001:0,false,player.cool>.09&&down('fire'),!player.onGround,player.dash>0);
  for(const b of shots){g.save();g.translate(b.x-cam,b.y);g.rotate(Math.atan2(b.vy,b.vx));rect(-7,-1,9,3,b.heavy?ACID:'#ffeeb8');rect(-12,0,6,1,b.heavy?'#d39551':'#dcad71');g.restore();}
  for(const b of hostiles){circle(b.x-cam,b.y,b.r+2,'#ed936935');circle(b.x-cam,b.y,b.r,b.color||'#ecac7d');rect(b.x-cam-1,b.y-1,2,2,'#fff0b9');}
  for(const n of grenades){rect(n.x-cam-3,n.y-3,6,6,'#8b7860');rect(n.x-cam-1,n.y-5,2,2,'#d6c1a2');if(Math.floor(clock*15)%2)rect(n.x-cam,n.y-2,2,2,'#ef9869');}
 }
 drawEffects();
 for(const p of particles){if(p.ring){const r=(1-p.life/.24)*50;g.strokeStyle=p.color;g.lineWidth=2;g.globalAlpha=Math.max(0,p.life/.24)*.65;g.beginPath();g.ellipse(p.x-cam,p.y,r,r*.55,0,0,Math.PI*2);g.stroke();g.globalAlpha=1;}else if(p.plate){g.save();g.translate(p.x-cam,p.y);g.rotate(p.rotation);g.globalAlpha=Math.min(1,p.life*3);poly([[-p.size,-2],[p.size,-3],[p.size+1,2],[-p.size,3]],p.color);rect(-p.size,-2,p.size*2,1,'#e4d8c2');g.restore();}else rect(p.x-cam,p.y,p.size,p.size,p.color);}
 if(isCity())cityOccluders();else if(expandedDesert())dunesOccluders();g.translate(0,Math.round(camY));
 // Rain in Zenith Prime; airborne sand in the dunes.
 for(let i=0;i<(isCity()&&zenith.stage===3?14:64);i++){const x=((hash(i+90)*800-clock*(20+hash(i)*40)-cam*.13)%700+700)%700-25,y=hash(i+120)*H;if(isCity()){const ry=(y+clock*240)%H;rect(x,ry,1,7+i%6,i%3?'#6fa9ef55':'#cf91ef77');}else rect(x,y,i%4===0?7:2,1,i%3===0?'#e7c69b55':'#d8c49828');}
 g.restore();
 if(state!=='menu'&&player){drawHUD();for(const t of texts){g.globalAlpha=Math.min(1,t.life*2);text(t.str,t.x-cam,Math.max(bossTriggered?100:64,t.y-camY),1,t.color,'center');g.globalAlpha=1;}if(flash>0)rect(0,0,W,H,'#ed956b33');}
 else{rect(0,0,W,2,'#d5c89650');if(best>0)text('BEST '+String(best).padStart(6,'0'),W-19,17,1,'#e1d8ac','right');}
}
// Standard browser gamepad mapping: Xbox, plus other standard-mapped controllers.
function controllerStatus(message){const el=$('controller-status');if(el)el.textContent=message;}
function pollController(){
 let pads=[];try{if(typeof navigator!=='undefined'&&navigator.getGamepads)pads=Array.from(navigator.getGamepads()||[]);}catch(e){}
 const supported=p=>p&&p.connected!==false&&p.mapping==='standard';
 let pad=pads.find(p=>supported(p)&&p.index===controller.index);
 if(controller.index!==null&&!pad){
  padHeld.clear();controller.index=null;controller.previous.clear();controller.needsNeutral=true;
  if(state==='playing')pauseGame();
  controllerStatus('Controller disconnected. Reconnect and press Menu or A to resume.');return;
 }
 if(!pad)pad=pads.find(supported);
 if(!pad){padHeld.clear();return;}
 if(controller.index===null){controller.index=pad.index;controllerStatus('Controller connected · A confirm · B back · Menu pause');}
 const button=i=>!!pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5);
 const current=new Set();
 let dx=0,dy=0;
 const ax=Number(pad.axes[0])||0,ay=Number(pad.axes[1])||0;
 if(Math.hypot(ax,ay)>.28){const a=Math.round(Math.atan2(ay,ax)/(Math.PI/4))*Math.PI/4;dx=Math.round(Math.cos(a));dy=Math.round(Math.sin(a));}
 if([12,13,14,15].some(button)){dx=Number(button(15))-Number(button(14));dy=Number(button(13))-Number(button(12));}
 if(dx<0)current.add('left');if(dx>0)current.add('right');if(dy<0)current.add('up');if(dy>0)current.add('down');
 for(const [action,buttons] of [['jump',[0]],['fire',[2,7]],['grenade',[1]],['dash',[3,5]],['pause',[9]]])if(buttons.some(button))current.add(action);
 const previous=controller.previous;controller.previous=current;
 padHeld.clear();
 if(controller.suspended||document.hidden){controller.needsNeutral=true;return;}
 if(controller.needsNeutral){if(!current.size)controller.needsNeutral=false;return;}
 // Edges use the previous poll, not the snapshot we just stored.
 const fresh=k=>current.has(k)&&!previous.has(k);
 if(state==='playing'){
  if(fresh('pause')){pauseGame();return;}
  for(const k of current)if(k!=='pause'){padHeld.add(k);if(fresh(k))pressed.add(k);}
 }else if(state==='menu'){if(fresh('jump')||fresh('pause')){if(!art||art.loaded)showMap();}}
 else if(state==='map'){
  if(fresh('left'))chooseRoute('dunes');if(fresh('right'))chooseRoute('city');
  if(fresh('grenade'))showTitle();else if(fresh('jump')||fresh('pause'))deploy();
 }else if(state==='paused'){
  if(fresh('jump')||fresh('pause')){resetInputs();pauseGame();}else if(fresh('grenade'))showMap();
 }else if(state==='dead'){if(fresh('jump')||fresh('pause'))retry();else if(fresh('grenade'))showMap();}
 else if(state==='won'){if(fresh('jump')||fresh('pause')||fresh('grenade'))showMap();}
 else if(state==='options'){if(fresh('grenade')||fresh('pause'))showTitle();else if(fresh('jump'))toggleSound();}
}
window.addEventListener('focus',()=>{controller.suspended=false;controller.needsNeutral=true;});
window.addEventListener('blur',()=>{controller.suspended=true;padHeld.clear();});

// Keyboard, eight-way stick and multi-touch actions share one input map.
const physicalKeys=new Set();
window.addEventListener('keydown',e=>{if(state==='map'){if(['ArrowLeft','KeyA','ArrowRight','KeyD'].includes(e.code)){e.preventDefault();chooseRoute(['ArrowLeft','KeyA'].includes(e.code)?'dunes':'city');return;}if(e.code==='Escape'){e.preventDefault();showTitle();return;}}if(state==='options'&&e.code==='Escape'){showTitle();return;}if(e.target.closest('button')&&['Space','Enter'].includes(e.code))return;if(binds[e.code]){e.preventDefault();const action=binds[e.code];physicalKeys.add(e.code);if(!held.has(action))pressed.add(action);held.add(action);}if(e.repeat)return;if(e.code==='Enter'){if(state==='menu')showMap();else if(state==='map')deploy();else if(state==='dead')retry();else if(state==='won')showMap();else if(state==='paused')pauseGame();}if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();pauseGame();}if(e.code==='KeyM')toggleSound();});
window.addEventListener('keyup',e=>{const a=binds[e.code];if(a){physicalKeys.delete(e.code);if(![...physicalKeys].some(k=>binds[k]===a))held.delete(a);e.preventDefault();}});
window.addEventListener('blur',()=>{resetInputs();document.querySelectorAll('[data-control]').forEach(b=>b.classList.remove('active'));if(state==='playing')pauseGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pauseGame();});
function quantizeStick(dx,dy,radius){
 if(Math.hypot(dx,dy)<radius*.23)return {x:0,y:0};
 const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;
 return {x:Math.round(Math.cos(angle)),y:Math.round(Math.sin(angle))};
}
function renderStick(){
 const pad=$('direction-stick');if(!pad)return;
 pad.style.setProperty('--stick-x',stick.x*24+'%');pad.style.setProperty('--stick-y',stick.y*24+'%');
 pad.dataset.direction=stick.x+','+stick.y;
 pad.classList.toggle('active',!!(stick.x||stick.y));
 pad.querySelectorAll('[data-dir]').forEach(el=>el.classList.toggle('lit',el.dataset.dir===pad.dataset.direction));
 const labels={'0,0':'MOVE / AIM','0,-1':'AIM UP','1,-1':'RUN + AIM','-1,-1':'RUN + AIM','1,0':'RUN RIGHT','-1,0':'RUN LEFT','0,1':'DUCK / AIM DOWN','1,1':'CRAWL / AIM','-1,1':'CRAWL / AIM'};
 $('stick-status').textContent=labels[pad.dataset.direction];
}
const pad=$('direction-stick');
function moveStick(e){const r=pad.getBoundingClientRect(),v=quantizeStick(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,r.width/2);stick.x=v.x;stick.y=v.y;renderStick();}
pad.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='playing'||stick.pointer!==null)return;stick.pointer=e.pointerId;pad.setPointerCapture(e.pointerId);moveStick(e);if(soundOn)audioInit();});
pad.addEventListener('pointermove',e=>{if(e.pointerId!==stick.pointer)return;e.preventDefault();if(state==='playing')moveStick(e);});
function releaseStick(e){if(e.pointerId!==stick.pointer)return;stick.pointer=null;stick.x=stick.y=0;renderStick();}
for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,releaseStick);
pad.addEventListener('contextmenu',e=>e.preventDefault());
for(const button of document.querySelectorAll('[data-control]')){
 const a=button.dataset.control,pointers=new Set();actionPointers.push(pointers);
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='playing')return;pointers.add(e.pointerId);button.setPointerCapture(e.pointerId);touch.add(a);pressed.add(a);button.classList.add('active');if(soundOn)audioInit();});
 const release=e=>{pointers.delete(e.pointerId);if(pointers.size)return;touch.delete(a);button.classList.remove('active');};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
}
function retry(){if(!isCity()&&dunes.stage>1){score=Math.max(0,score-250);enterDunesStage(dunes.stage,true);return;}if(isCity()&&zenith.stage>1){score=Math.max(0,score-250);enterCityStage(zenith.stage,true);return;}if(checkpoint){score=Math.max(0,score-250);reset(checkpoint);}else startGame();canvas.focus({preventScroll:true});}
$('touch-toggle').addEventListener('click',()=>{const shown=document.body.classList.toggle('touch-enabled');$('touch-toggle').setAttribute('aria-pressed',String(shown));$('touch-toggle').setAttribute('aria-label',shown?'Use automatic touch controls':'Show touch controls');});
$('start').addEventListener('click',showMap);$('route-dunes').addEventListener('click',()=>chooseRoute('dunes'));$('route-city').addEventListener('click',()=>chooseRoute('city'));$('deploy').addEventListener('click',deploy);$('map-back').addEventListener('click',showTitle);$('return-map').addEventListener('click',showMap);$('options').addEventListener('click',()=>{state='options';setMode('options');$('options-panel').hidden=false;$('option-sound').focus();});$('options-back').addEventListener('click',showTitle);$('option-sound').addEventListener('click',toggleSound);$('sound').addEventListener('click',toggleSound);$('pause').disabled=true;$('pause').addEventListener('click',pauseGame);$('restart').addEventListener('click',startGame);$('resume').addEventListener('click',()=>{if(state==='paused')pauseGame();else if(state==='dead')retry();else showMap();});
function expandFallback(){const expanded=$('game-shell').classList.toggle('expanded');document.body.classList.toggle('game-expanded',expanded);announce(expanded?'Expanded view. Turn your phone sideways for a larger game.':'Expanded view closed.');}
$('fullscreen').addEventListener('click',async()=>{const el=$('game-shell');try{if(document.fullscreenElement)await document.exitFullscreen();else if(el.requestFullscreen)await el.requestFullscreen();else expandFallback();}catch(e){expandFallback();}});
$('exit-expanded').addEventListener('click',async()=>{if(document.fullscreenElement)await document.exitFullscreen();$('game-shell').classList.remove('expanded');document.body.classList.remove('game-expanded');});$('expanded-pause').addEventListener('click',pauseGame);
let last=performance.now();function loop(now){const dt=Math.min((now-last)/1000,.033);last=now;pollController();update(dt);pressed.clear();draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
})();
