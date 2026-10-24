/* DUSTBYTE. Original 16-bit-style raster assets, canvas effects, audio and game logic. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), canvas=$('game'), g=canvas.getContext('2d',{alpha:false});
g.imageSmoothingEnabled=false;
const art=window.DustbyteArt;
let effects=[];
if(art){$('start').disabled=true;$('start').querySelector('span').textContent='LOADING ART...';art.ready.then(ok=>{$('start').disabled=false;$('start').querySelector('span').textContent=ok?'ENTER THE WASTES':'RELOAD ART';});}
const W=640,H=360,GROUND=304,LENGTH=4300,ACID='#ffb65f',CYAN='#e8d6aa';
const glyph={
A:['01110','11011','11011','11111','11011','11011','11011'],B:['11110','11011','11011','11110','11011','11011','11110'],C:['01111','11000','11000','11000','11000','11000','01111'],D:['11110','11011','11011','11011','11011','11011','11110'],E:['11111','11000','11000','11110','11000','11000','11111'],F:['11111','11000','11000','11110','11000','11000','11000'],G:['01111','11000','11000','11011','11011','11011','01111'],H:['11011','11011','11011','11111','11011','11011','11011'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00011','00011','00011','11011','11011','01110'],K:['11011','11011','11110','11100','11110','11011','11011'],L:['11000','11000','11000','11000','11000','11000','11111'],M:['11011','11111','11111','11011','11011','11011','11011'],N:['11011','11111','11111','11111','11011','11011','11011'],O:['01110','11011','11011','11011','11011','11011','01110'],P:['11110','11011','11011','11110','11000','11000','11000'],Q:['01110','11011','11011','11011','11011','11110','01111'],R:['11110','11011','11011','11110','11100','11010','11011'],S:['01111','11000','11000','01110','00011','00011','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['11011','11011','11011','11011','11011','11011','01110'],V:['11011','11011','11011','11011','11011','01110','00100'],W:['11011','11011','11011','11011','11111','11111','01010'],X:['11011','11011','01110','00100','01110','11011','11011'],Y:['11011','11011','11011','01110','00100','00100','00100'],Z:['11111','00011','00110','00100','01100','11000','11111'],
'0':['01110','11011','11011','11011','11011','11011','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','11011','00011','00110','01100','11000','11111'],'3':['11110','00011','00011','01110','00011','00011','11110'],'4':['11011','11011','11011','11111','00011','00011','00011'],'5':['11111','11000','11000','11110','00011','00011','11110'],'6':['01111','11000','11000','11110','11011','11011','01110'],'7':['11111','00011','00110','00100','01100','01100','01100'],'8':['01110','11011','11011','01110','11011','11011','01110'],'9':['01110','11011','11011','01111','00011','00011','11110'],
' ':['00000','00000','00000','00000','00000','00000','00000'],'/':['00001','00011','00010','00100','01000','11000','10000'],'-':['00000','00000','00000','11111','00000','00000','00000'],':':['00000','00100','00100','00000','00100','00100','00000'],'.':['00000','00000','00000','00000','00000','00110','00110'],'+':['00000','00100','00100','11111','00100','00100','00000'],'!':['00100','00100','00100','00100','00100','00000','00100'],'>':['10000','11000','01100','00110','01100','11000','10000']};
function text(str,x,y,size=1,color='#f1e6cc',align='left'){
 str=String(str).toUpperCase();if(align==='center')x-=str.length*6*size/2;if(align==='right')x-=str.length*6*size;
 g.fillStyle=color;for(const ch of str){const rows=glyph[ch]||glyph[' '];for(let j=0;j<7;j++)for(let i=0;i<5;i++)if(rows[j][i]==='1')g.fillRect(Math.round(x+i*size),Math.round(y+j*size),size,size);x+=6*size;}
}
let titlePath='';for(const [str,yy] of [['DUST',0],['BYTE',46]]){let x=0;for(const ch of str){glyph[ch].forEach((row,y)=>{[...row].forEach((v,i)=>{if(v==='1')titlePath+=`M${x+i*6} ${yy+y*6}h6v6h-6z`;});});x+=36;}}
$('title-art').setAttribute('viewBox','0 0 145 88');$('title-art').innerHTML=`<path d="${titlePath}" fill="#2c170e" transform="translate(3 3)"/><path d="${titlePath}" fill="#fff0cf"/><path d="${titlePath}" fill="#f3a34e" clip-path="url(#bottom)"/><defs><clipPath id="bottom"><rect y="46" width="145" height="42"/></clipPath></defs>`;
// Sound is synthesized on-device, and starts only after a user gesture.
let audio=null,soundOn=false,master=null,nextBeat=0,beat=0;
function audioInit(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();master=audio.createGain();master.gain.value=.3;master.connect(audio.destination);}if(audio.state==='suspended')audio.resume().catch(()=>{});}
function tone(freq,type,duration,vol=.15,end=0){if(!soundOn||!audio)return;const t=audio.currentTime,o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(v);v.connect(master);o.start(t);o.stop(t+duration);}
function noise(duration=.1,vol=.1){if(!soundOn||!audio)return;const b=audio.createBuffer(1,Math.floor(audio.sampleRate*duration),audio.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=audio.createBufferSource(),v=audio.createGain(),f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;s.buffer=b;v.gain.value=vol;s.connect(f);f.connect(v);v.connect(master);s.start();}
function sfx(kind){if(kind==='shot'){tone(190,'square',.05,.07,65);noise(.035,.06);}if(kind==='boom'){tone(80,'sawtooth',.3,.25,20);noise(.38,.4);}if(kind==='hit'){tone(150,'square',.14,.12,40);noise(.1,.12);}if(kind==='jump')tone(200,'square',.1,.06,440);if(kind==='pickup'){tone(580,'square',.08,.08,880);setTimeout(()=>tone(880,'square',.14,.07,1100),70);}if(kind==='dash')noise(.2,.16);}
function toggleSound(){soundOn=!soundOn;if(soundOn)audioInit();$('sound').querySelector('span').textContent=soundOn?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-label',soundOn?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)tone(440,'triangle',.1,.2,660);}
let seed=71027;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}function hash(n){let v=Math.sin(n*127.1+19.7)*43758.5453;return v-Math.floor(v);}function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function poly(points,c){g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(Math.round(x),Math.round(y)):g.moveTo(Math.round(x),Math.round(y)));g.closePath();g.fill();}
function circle(x,y,r,c){g.fillStyle=c;for(let yy=-r;yy<=r;yy++){const xx=Math.floor(Math.sqrt(r*r-yy*yy));g.fillRect(Math.round(x-xx),Math.round(y+yy),xx*2+1,1);}}
let state='menu',clock=0,elapsed=0,cam=0,shake=0,flash=0,score=0,kills=0,checkpoint=0,usedCheckpoint=false,best=0,bossTriggered=false,winTimer=0;
try{best=Number(localStorage.getItem('dustbyte-best')||0);}catch(e){}
let player,enemies=[],shots=[],hostiles=[],particles=[],grenades=[],pickups=[],crates=[],hazards=[],texts=[],boss=null;
const held=new Set(),pressed=new Set(),touch=new Set();
const binds={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',KeyJ:'fire',KeyZ:'fire',KeyK:'grenade',KeyX:'grenade',ShiftLeft:'dash',ShiftRight:'dash'};
const down=k=>held.has(k)||touch.has(k),tap=k=>pressed.has(k);
const platforms=[{x:450,y:250,w:88},{x:620,y:207,w:88},{x:1030,y:250,w:135},{x:1340,y:222,w:92},{x:1660,y:255,w:120},{x:1900,y:210,w:90},{x:2320,y:252,w:130},{x:2560,y:217,w:100},{x:2870,y:249,w:100},{x:3160,y:231,w:120},{x:3660,y:244,w:84}];
function createEnemy(type,x,y=GROUND){return {type,x,y,home:x,hp:type==='turret'?15:type==='drone'?8:9,maxHp:type==='turret'?15:9,t:rand()*8,cool:1.3+rand()*1.1,flash:0,face:-1,alert:0};}
function reset(startAt=0){effects=[];seed=71027;enemies=[];shots=[];hostiles=[];particles=[];grenades=[];pickups=[];texts=[];hazards=[];boss=null;bossTriggered=false;winTimer=0;flash=0;shake=0;usedCheckpoint=startAt>0;checkpoint=startAt;
 player={x:startAt||80,y:GROUND,vx:0,vy:0,face:1,hp:6,maxHp:6,inv:1.6,cool:0,jumps:0,onGround:true,anim:0,grenades:4,grenadeCool:0,heavy:0,dash:0,dashCool:0,coyote:.1};
 const config=[['soldier',430],['soldier',740],['drone',890,204],['soldier',1130],['turret',1270],['drone',1470,180],['soldier',1560],['soldier',1720],['drone',1830,210],['turret',2030],['soldier',2200],['soldier',2420],['drone',2510,177],['turret',2735],['soldier',2890],['drone',3040,195],['soldier',3190],['turret',3350],['drone',3480,180],['soldier',3570]];
 for(const c of config)if(c[1]>startAt+140)enemies.push(createEnemy(...c));
 crates=[{x:560,y:GROUND,hp:5,drop:'heavy'},{x:1180,y:GROUND,hp:5,drop:'health'},{x:1780,y:GROUND,hp:5,drop:'grenade'},{x:2380,y:GROUND,hp:5,drop:'heavy'},{x:3060,y:GROUND,hp:5,drop:'health'},{x:3540,y:GROUND,hp:5,drop:'grenade'}].filter(c=>c.x>startAt);
 pickups=[{x:669,y:190,type:'heavy',phase:0},{x:1390,y:205,type:'grenade',phase:1},{x:1940,y:193,type:'health',phase:2},{x:2610,y:200,type:'heavy',phase:1},{x:3220,y:214,type:'health',phase:1}].filter(p=>p.x>startAt);
 cam=Math.max(0,player.x-180);state='playing';$('intro').hidden=true;$('intro-bottom').hidden=true;$('modal').hidden=true;$('pause').disabled=false;held.clear();touch.clear();pressed.clear();announce('Mission started. Reach and destroy the extraction mech.');if(startAt===0)message('CROSS THE WRECK FIELD',player.x+155,125,2.8,ACID);
}
function startGame(){if(art&&!art.loaded){if(art.failed)location.reload();return;}score=0;kills=0;elapsed=0;reset();if(soundOn)audioInit();canvas.focus({preventScroll:true});}
function announce(s){$('live-region').textContent=s;}
function message(str,x,y,life=1.2,color=ACID){texts.push({str,x,y,life,max:life,color});}
function openModal(eyebrow,title,copy,button){$('modal-eyebrow').textContent=eyebrow;$('modal-title').textContent=title;$('modal-copy').textContent=copy;$('resume').innerHTML=button+' <span>↗</span>';$('modal').hidden=false;$('resume').focus({preventScroll:true});announce(title+'. '+copy);}
function pauseGame(){if(state==='playing'){state='paused';held.clear();touch.clear();openModal('TRANSMISSION PAUSED','Take a breath.','The wastes can wait.','RESUME MISSION');}else if(state==='paused'){state='playing';$('modal').hidden=true;canvas.focus({preventScroll:true});}}
function gameOver(){if(state!=='playing')return;state='dead';sfx('boom');burst(player.x,player.y-12,30,'#eea86a');openModal('TRANSMISSION LOST','Dust to dust.',`SCORE ${String(score).padStart(6,'0')}  /  ${kills} HOSTILES DOWN\n${checkpoint?'Relay secured. Resume from the checkpoint.':'One more run. You know the way now.'}`,checkpoint?'RETRY FROM RELAY':'TRY AGAIN');}
function finish(){if(state==='won')return;state='won';score+=Math.max(200,2000-Math.floor(elapsed)*5);best=Math.max(best,score);try{localStorage.setItem('dustbyte-best',String(best));}catch(e){}openModal('EXTRACTION NETWORK OFFLINE','The wastes are yours.',`SCORE ${String(score).padStart(6,'0')}  /  ${kills} HOSTILES DOWN\nTIME ${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')}  /  BEST ${String(best).padStart(6,'0')}`,'RUN IT BACK');}
function burst(x,y,n,color,force=75){if(n>=18)effects.push({x,y,age:0,duration:n>40?.85:.55,size:n>40?76:42,rotation:rand()*.3-.15});for(let i=0;i<n;i++){const a=rand()*Math.PI*2,v=rand()*force;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:.2+rand()*.55,max:1,size:rand()>.6?3:2,color:rand()>.7?'#ffe7ac':color,gravity:160});}}
function damage(n){if(player.inv>0||player.dash>0||state!=='playing')return;player.hp-=n;player.inv=1.3;flash=.15;shake=5;sfx('hit');burst(player.x,player.y-17,9,'#e77c63');announce(`Armor ${Math.max(0,player.hp)} of 6`);if(player.hp<=0)gameOver();}
function enemyHit(e,n){if(e.hp<=0)return;e.hp-=n;e.flash=.09;burst(e.x,e.y-(e.type==='drone'?0:25),4,'#d4b086',50);if(e.hp<=0){score+=e.type==='turret'?250:e.type==='drone'?150:100;kills++;burst(e.x,e.y-12,18,'#e7a467');sfx('hit');message('+'+(e.type==='turret'?250:e.type==='drone'?150:100),e.x,e.y-35,.7,'#efe3b8');if(kills%6===0)pickups.push({x:e.x,y:GROUND-13,type:'health',phase:0});}}
function bossHit(n){if(!boss||boss.hp<=0)return;boss.hp-=n;boss.flash=.06;burst(boss.x-28,boss.y-58,4,ACID,60);if(boss.hp<=0){boss.hp=0;boss.dead=true;winTimer=2.6;score+=3000;kills++;hostiles=[];hazards=[];player.inv=5;shake=12;sfx('boom');burst(boss.x,boss.y-50,100,'#f7ba70',140);message('EXTRACTOR DESTROYED',boss.x-140,100,2.4,ACID);}}
const HERO_MUZZLES=[[24,38],[20,38],[19,35],[24,37],[24,37],[25,38],[23,28],[29,26],...Array.from({length:8},()=>[26,37])];
function heroPose(anim,firing,air,dashing){return dashing?7:air?6:anim?8+Math.floor(anim)%8:firing?5:0;}
function playerMuzzle(){const m=HERO_MUZZLES[heroPose(player.vx?player.anim+.000001:0,true,!player.onGround,player.dash>0)];return {x:player.x+player.face*m[0],y:player.y-m[1]};}
function fire(){const muzzle=playerMuzzle(),heavy=player.heavy>0;if(player.cool>0)return;player.cool=heavy?.105:.135;const targets=enemies.filter(e=>e.hp>0&&(e.x-player.x)*player.face>0&&Math.abs(e.x-player.x)<240&&Math.abs((e.y-(e.type==='drone'?0:25))-muzzle.y)<78);
 targets.sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x));let aim=0;if(targets.length){const e=targets[0];aim=Math.atan2(e.y-(e.type==='drone'?0:25)-muzzle.y,Math.abs(e.x-player.x));}else if(boss&&!boss.dead&&Math.abs(boss.x-player.x)<360&&(boss.x-player.x)*player.face>0){aim=Math.atan2(boss.y-88-muzzle.y,Math.abs(boss.x-player.x));}else{const crate=crates.filter(c=>c.hp>0&&(c.x-player.x)*player.face>0&&Math.abs(c.x-player.x)<240&&Math.abs(c.y-18-muzzle.y)<55).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];if(crate)aim=Math.atan2(crate.y-18-muzzle.y,Math.abs(crate.x-muzzle.x));}
 for(let i=0;i<(heavy?3:1);i++){const a=aim+(heavy?(i-1)*.10:0);shots.push({x:muzzle.x,y:muzzle.y,vx:Math.cos(a)*400*player.face,vy:Math.sin(a)*400,life:.95,heavy,dmg:heavy?3:3});}
 burst(muzzle.x+player.face*4,muzzle.y,2,'#fff1b5',30);particles.push({x:player.x,y:player.y-33,vx:-player.face*30,vy:-45,life:.45,size:2,color:'#b79962',gravity:220});sfx('shot');}
function grenade(){if(player.grenades<=0||player.grenadeCool>0)return;player.grenades--;player.grenadeCool=.6;grenades.push({x:player.x+player.face*10,y:player.y-30,vx:player.face*155,vy:-190,t:1.05,bounce:0});tone(300,'triangle',.08,.1,120);}
function explode(x,y){burst(x,y,45,'#f5af5c',145);sfx('boom');shake=7;for(const e of enemies)if(Math.hypot(e.x-x,e.y-14-y)<92)enemyHit(e,35);if(boss&&Math.hypot(boss.x-x,boss.y-35-y)<125)bossHit(38);for(const c of crates)if(Math.abs(c.x-x)<85)c.hp=0;hostiles=hostiles.filter(b=>Math.hypot(b.x-x,b.y-y)>105);particles.push({x,y,vx:0,vy:0,life:.24,max:.24,size:1,ring:true,color:'#ffe2a1'});}
function enemyFire(e){const sy=e.y-(e.type==='drone'?-8:e.type==='turret'?27:29),sx=e.x+(e.type==='drone'?0:e.face*28),a=Math.atan2(player.y-24-sy,player.x-sx),speed=e.type==='drone'?102:115;hostiles.push({x:sx,y:sy,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4,r:3});tone(130,'sawtooth',.06,.025,75);}
function collect(p){p.taken=true;sfx('pickup');if(p.type==='health'){player.hp=Math.min(6,player.hp+2);message('ARMOR +2',p.x,p.y-25,1.3,CYAN);announce('Medkit collected. Armor '+player.hp+' of 6');}else if(p.type==='heavy'){player.heavy=14;message('HEAVY ROUNDS',p.x,p.y-25,1.3,ACID);announce('Heavy rounds acquired');}else{player.grenades=Math.min(9,player.grenades+3);message('GRENADES +3',p.x,p.y-25,1.3,'#eab483');}}
function update(dt){clock+=dt;
 if(state==='menu'){cam=120;updateParticles(dt);return;}if(state!=='playing'){if(state==='dead')updateParticles(dt);return;}
 elapsed+=dt;player.cool-=dt;player.grenadeCool-=dt;player.inv=Math.max(0,player.inv-dt);player.heavy=Math.max(0,player.heavy-dt);player.dashCool=Math.max(0,player.dashCool-dt);player.dash=Math.max(0,player.dash-dt);shake=Math.max(0,shake-dt*22);flash=Math.max(0,flash-dt);
 let move=(down('right')?1:0)-(down('left')?1:0);if(move)player.face=move;player.vx=move*112;
 if(tap('dash')&&player.dashCool===0){player.dash=.18;player.dashCool=.8;sfx('dash');}
 if(player.dash>0){player.vx=player.face*290;particles.push({x:player.x,y:player.y-13,vx:0,vy:0,life:.2,size:8,color:'#b4885c80',gravity:0});}
 if(tap('jump')&&(player.onGround||player.coyote>0||player.jumps<2)){player.vy=-245;player.jumps=player.onGround||player.coyote>0?1:2;player.onGround=false;player.coyote=0;sfx('jump');burst(player.x,player.y,7,'#d6b384',45);}
 if(down('fire'))fire();if(tap('grenade'))grenade();
 const prevY=player.y;player.x+=player.vx*dt;player.vy+=610*dt;player.y+=player.vy*dt;player.onGround=false;player.coyote=Math.max(0,player.coyote-dt);
 if(player.y>=GROUND){player.y=GROUND;player.vy=0;player.onGround=true;player.jumps=0;player.coyote=.1;}
 for(const p of platforms)if(player.x>p.x-5&&player.x<p.x+p.w+5&&prevY<=p.y+1&&player.y>=p.y&&player.vy>=0){player.y=p.y;player.vy=0;player.onGround=true;player.jumps=0;player.coyote=.1;}
 player.x=Math.max(bossTriggered?3550:18,Math.min(LENGTH-28,player.x));if(move&&player.onGround&&player.dash===0)player.anim=(player.anim+Math.abs(player.vx)*dt/10)%8;else if(!move)player.anim=0;
 if(move&&player.onGround&&Math.random()<.24)particles.push({x:player.x-move*6,y:player.y-1,vx:-move*20,vy:-rand()*16,life:.35,size:2,color:'#d49a57',gravity:20});
 if(player.x>2100&&!usedCheckpoint){checkpoint=2100;usedCheckpoint=true;player.hp=6;player.grenades=Math.max(4,player.grenades);message('RELAY SECURED / ARMOR RESTORED',2260,122,3,ACID);sfx('pickup');announce('Checkpoint reached. Armor restored.');}
 if(player.x>3590&&!bossTriggered){bossTriggered=true;boss={x:4005,y:GROUND,hp:230,maxHp:230,t:0,cycle:0,cool:2,flash:0,dead:false,slam:0};message('WARNING / EXTRACTOR ONLINE',3860,105,2.4,'#f2ad77');announce('Boss encounter. Destroy the extraction mech.');}
 const targetCam=bossTriggered?Math.max(3515,Math.min(LENGTH-W,player.x-240)):Math.max(0,Math.min(LENGTH-W,player.x-210));cam+=(targetCam-cam)*Math.min(1,dt*6);
 for(const e of enemies){if(e.hp<=0||Math.abs(e.x-player.x)>510)continue;e.t+=dt;e.cool-=dt;e.flash=Math.max(0,e.flash-dt);e.face=player.x<e.x?-1:1;
  if(e.type==='drone')e.y=196+Math.sin(e.t*1.6)*30;else if(e.type==='soldier'){if(Math.abs(player.x-e.x)<250&&Math.abs(player.x-e.x)>110)e.x+=e.face*23*dt;else e.x+=Math.sin(e.t)*8*dt;}
  if(e.cool<.4&&Math.abs(e.x-player.x)<340)e.alert=.4-e.cool;else e.alert=0;
  if(e.cool<=0&&Math.abs(e.x-player.x)<340){enemyFire(e);e.cool=e.type==='turret'?1.6:e.type==='drone'?2.4:2.3;}
  if(Math.abs(e.x-player.x)<13&&Math.abs((e.y-(e.type==='drone'?0:12))-(player.y-12))<19)damage(1);
 }
 enemies=enemies.filter(e=>e.hp>0);
 for(const b of shots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)continue;for(const e of enemies){const ey=e.y-(e.type==='drone'?0:24);if(Math.abs(b.x-e.x)<(e.type==='turret'?17:12)&&Math.abs(b.y-ey)<(e.type==='drone'?16:24)){enemyHit(e,b.dmg);b.life=0;break;}}
  if(b.life>0&&boss&&!boss.dead&&Math.abs(b.x-boss.x)<76&&b.y>boss.y-136&&b.y<boss.y-12){bossHit(b.dmg);b.life=0;}
  if(b.life>0)for(const c of crates)if(c.hp>0&&Math.abs(b.x-c.x)<13&&b.y>c.y-35&&b.y<c.y){c.hp-=b.dmg;burst(c.x,c.y-16,5,'#c9a771');b.life=0;break;}
 }shots=shots.filter(b=>b.life>0);
 for(const b of hostiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.abs(b.x-player.x)<9+b.r&&b.y>player.y-43&&b.y<player.y-2){damage(1);b.life=0;}if(b.y>GROUND){burst(b.x,GROUND,3,'#f1b780',25);b.life=0;}}
 hostiles=hostiles.filter(b=>b.life>0&&Math.abs(b.x-player.x)<600);
 for(const n of grenades){n.t-=dt;n.x+=n.vx*dt;n.y+=n.vy*dt;n.vy+=420*dt;if(n.y>GROUND-4){n.y=GROUND-4;n.vy=-Math.abs(n.vy)*.45;n.vx*=.62;}if(n.t<=0)explode(n.x,n.y);}grenades=grenades.filter(n=>n.t>0);
 for(const c of crates)if(c.hp<=0&&!c.broken){c.broken=true;burst(c.x,c.y-14,18,'#c6a47b');pickups.push({x:c.x,y:c.y-13,type:c.drop,phase:0});score+=25;}
 for(const p of pickups){p.phase+=dt;if(Math.abs(p.x-player.x)<19&&Math.abs(p.y-(player.y-16))<29)collect(p);}pickups=pickups.filter(p=>!p.taken);
 if(boss&&!boss.dead){boss.t+=dt;boss.cool-=dt;boss.flash=Math.max(0,boss.flash-dt);boss.slam=Math.max(0,boss.slam-dt);boss.x=4005+Math.sin(boss.t*.7)*35;
  if(boss.cool<=0){boss.cycle++;const phase=boss.hp<boss.maxHp*.45;
   if(boss.cycle%3===0){boss.slam=1.1;for(let i=0;i<3;i++)hazards.push({x:Math.max(3580,Math.min(4260,player.x-75+i*85)),t:1.15,done:false});boss.cool=phase?2:2.6;}
   else{const origin={x:boss.x-126,y:boss.y-108},a=Math.atan2(player.y-17-origin.y,player.x-origin.x);for(let i=-1;i<=1;i++)hostiles.push({x:origin.x,y:origin.y,vx:Math.cos(a+i*.18)*(phase?142:117),vy:Math.sin(a+i*.18)*(phase?142:117),life:5,r:4});boss.cool=phase?.85:1.35;}
  }
  if(Math.abs(player.x-boss.x)<62&&player.y>boss.y-95)damage(1);
 }
 for(const h of hazards){h.t-=dt;if(h.t<=0&&!h.done){h.done=true;burst(h.x,GROUND-4,25,'#f4bc6c',115);sfx('boom');shake=5;if(Math.abs(player.x-h.x)<29&&player.y>GROUND-42)damage(1);}}hazards=hazards.filter(h=>h.t>-.3);
 if(winTimer>0){winTimer-=dt;if(Math.random()<dt*12){burst(boss.x+(rand()-.5)*100,boss.y-rand()*100,18,'#f6aa5e');sfx('boom');}if(winTimer<=0)finish();}
 updateParticles(dt);for(const t of texts){t.life-=dt;t.y-=dt*8;}texts=texts.filter(t=>t.life>0);
 if(soundOn&&audio&&audio.currentTime>nextBeat){nextBeat=audio.currentTime+.31;const bass=[55,55,65.4,49,55,55,82.4,65.4][Math.floor(beat/4)%8];if(beat%2===0)tone(bass,'triangle',.24,.09);if(beat%4===0)tone(95,'sine',.14,.13,28);if(beat%4===2)noise(.06,.045);beat++;}
}
function updateParticles(dt){for(const e of effects)e.age+=dt;effects=effects.filter(e=>e.age<e.duration);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.gravity||0)*dt;}particles=particles.filter(p=>p.life>0);}
// Dense painted-pixel artwork with independent world geometry and effects layers.
function background(){
 rect(0,0,W,H,'#844329');
 if(!art||!art.loaded)return;
 const im=art.assets.wastes,bw=GROUND*im.width/im.height;
 const offset=28+Math.min(1,cam/(LENGTH-W))*(bw-W-28);
 g.drawImage(im,0,0,im.width,im.height,-Math.round(offset),0,bw,GROUND);
 // Slowly moving sand haze separates the distant wreck from the walkable foreground.
 g.save();g.globalAlpha=.07;g.fillStyle='#ffd396';
 for(let i=0;i<6;i++){const x=((i*157-clock*9-cam*.23)%850+850)%850-100;g.beginPath();g.ellipse(x,266+i%3*13,110,5+i%2*4,0,0,Math.PI*2);g.fill();}g.restore();
}
function steel(x,y,w,h,seed=1){
 const bands=['#211713','#9f7250','#e7b780','#795743','#584238','#3e302a','#29221e'];
 rect(x,y,w,h,bands[0]);rect(x+1,y+1,w-2,h-2,bands[4]);rect(x+1,y+1,w-2,1,bands[2]);rect(x+1,y+2,w-2,2,bands[1]);rect(x+2,y+4,w-4,Math.max(1,h-7),bands[3]);rect(x+2,y+h-3,w-4,2,bands[6]);
 for(let i=0;i<Math.floor(w*h/12);i++){const px=x+2+hash(i+seed)*Math.max(1,w-5),py=y+4+hash(i+seed+52)*Math.max(1,h-8);rect(px,py,hash(i+61)>.8?2:1,1,bands[hash(i+79)>.6?1:5]);}
 for(const px of [x+3,x+w-5])for(const py of [y+4,y+h-5]){rect(px,py,2,2,'#30221b');rect(px,py,1,1,'#e6c296');}
}
function shadow(x,y,w){g.save();g.fillStyle='#2c120b85';g.beginPath();g.ellipse(x,y,w,3.5,0,0,Math.PI*2);g.fill();g.restore();}
function foregroundWorld(){
 if(!art||!art.loaded)return;
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
function person(x,y,face,anim,enemy=false,firing=false,air=false,dashing=false){
 if(!art||!art.loaded)return;
 const index=enemy?(firing?3:anim?([1,0,2,0][Math.floor(anim*1.6)%4]):0):heroPose(anim,firing,air,dashing);
 const f=enemy?art.frames.enemies[index]:index>=8?art.frames.run[index-8]:art.frames.hero[index];
 const height=enemy?49:53;
 if(!air)shadow(x,y,enemy?15:17);
 const bob=!anim&&!firing?Math.sin(clock*3)*.45:0;
 art.sprite(g,f,x,y-bob,height,face);
 // While running, the weapon still flashes without interrupting the leg animation.
 if(firing){const m=enemy?[33,32]:HERO_MUZZLES[index];g.save();g.translate(x+face*m[0],y-m[1]);g.scale(face,1);poly([[0,0],[7,-5],[5,-1],[14,0],[5,2],[6,5],[-1,2]],'#f79441');poly([[0,0],[6,-2],[10,0],[5,2],[0,2]],'#fff4b7');g.restore();}
}
function drone(e){if(!art||!art.loaded)return;const x=e.x-cam,y=e.y;art.sprite(g,art.frames.enemies[4],x,y,37,e.face||1,1,.52);g.save();g.globalCompositeOperation='lighter';rect(x-5,y+15+Math.sin(clock*18),2,4,'#b6bfa944');rect(x+9,y+13+Math.cos(clock*18),2,5,'#b6bfa944');g.restore();if(e.alert>.08)text('!',x-2,y-28,1,'#ffcc8e');}
function turret(e){if(!art||!art.loaded)return;const x=e.x-cam;shadow(x,e.y,25);art.sprite(g,art.frames.enemies[5],x,e.y,36,e.face);if(e.alert>.15){circle(x+e.face*18,e.y-29,2,'#ffda8e');}}
function drawBoss(b,menu=false){if(!art||!art.loaded)return;const x=menu?484:b.x-cam,y=menu?GROUND:b.y,t=menu?clock:b.t,height=menu?163:159;
 shadow(x+4,y,107);g.save();if(b.flash>0)g.filter='brightness(1.65)';if(b.dead)g.filter='brightness(.55) sepia(.4)';art.sprite(g,art.frames.boss,x,y-Math.sin(t*2)*1,height);g.restore();
 // Exhaust wisps and the energized reactor keep the massive machine alive.
 g.save();g.globalCompositeOperation='lighter';const pulse=.5+Math.sin(t*4)*.16;g.globalAlpha=pulse;circle(x-6,y-height*.56,5,'#d4b37c33');g.restore();
 for(let i=0;i<8;i++){const age=(t*.4+i/8)%1,xx=x+44+Math.sin(t+i)*5;g.save();g.globalAlpha=(1-age)*.13;g.fillStyle='#a6a08b';g.beginPath();g.ellipse(xx+age*14,y-height+6-age*33,4+age*7,3+age*4,0,0,Math.PI*2);g.fill();g.restore();}
 if(!menu&&b.slam>0){text('!',x-3,y-height-11,2,'#ffcb8c');}
}
function drawCrate(c){if(!art||!art.loaded)return;const x=c.x-cam;if(x<-45||x>W+45)return;if(c.broken){for(let i=0;i<7;i++)rect(x-14+i*4,GROUND-2-hash(c.x+i)*3,4,2,i%2?'#5f5c42':'#a69b6c');return;}shadow(x,c.y,24);art.sprite(g,art.frames.enemies[6],x,c.y,35);}
function drawPickup(p){const x=Math.round(p.x-cam),y=Math.round(p.y+Math.sin(clock*3+p.phase)*2),col=p.type==='health'?CYAN:p.type==='heavy'?ACID:'#edb278';shadow(x,p.y+12,8);steel(x-9,y-9,18,18,p.x);rect(x-6,y-5,12,11,'#3c2b20');text(p.type==='health'?'+':p.type==='heavy'?'H':'G',x-2,y-3,1,col);rect(x-6,y-7,12,1,col);g.save();g.globalCompositeOperation='lighter';rect(x-6,y-7,12,1,col+'88');g.restore();}
function drawEffects(){if(!art||!art.loaded)return;for(const e of effects){const p=e.age/e.duration,x=e.x-cam,y=e.y,s=e.size*(.45+Math.min(1,p*4)*.75);g.save();if(p>.38){g.filter='brightness(.28) saturate(.35)';art.sprite(g,art.frames.enemies[7],x+8*p,y-16*p,s*1.2,1,(1-p)*.55,.6);g.filter='none';}art.sprite(g,art.frames.enemies[7],x,y-p*7,s,1,Math.max(0,1-p*1.4),.6);if(p<.15){g.globalCompositeOperation='lighter';circle(x,y,s*.24,'#ffe5a43c');}g.restore();}}
function hudText(str,x,y,size=1,color='#f2e4bd',align='left'){text(str,x+1,y+1,size,'#1d211a',align);text(str,x,y,size,color,align);}
function drawHUD(){
 // Compact beveled arcade panels let the detailed environment fill the screen.
 steel(8,7,134,36,11);rect(11,10,128,30,'#2d211be8');
 if(art&&art.loaded){const f=art.frames.portrait;g.save();g.beginPath();g.rect(14,12,23,24);g.clip();g.drawImage(f.image,f.x,f.y,f.w,f.h,13,11,25,27);g.restore();}
 hudText('1UP',44,12,1,'#ffdf87');hudText(String(score).padStart(6,'0'),68,12,1,'#f0ebd2');
 rect(44,24,91,12,'#1b130f');for(let i=0;i<6;i++){const xx=46+i*15;rect(xx,26,12,8,i<player.hp?'#d3aa72':'#4c3a2e');if(i<player.hp){rect(xx,26,12,2,'#ffe2b0');rect(xx,32,12,2,'#98613b');}}
 steel(151,7,87,36,12);rect(154,10,81,30,'#30231ce8');hudText(player.heavy>0?'HEAVY':'RIFLE',159,13,1,player.heavy>0?ACID:'#dfd1a5');hudText('BOMB '+String(player.grenades).padStart(2,'0'),159,27,1,'#eccc8b');
 hudText(Math.max(0,Math.floor(elapsed/60))+':'+String(Math.floor(elapsed%60)).padStart(2,'0'),W-16,13,2,'#f6d791','right');hudText('SECTOR 07',W-16,32,1,'#dfd8b8','right');
 rect(10,50,101,3,'#2b1b14ba');rect(10,50,101*Math.min(1,player.x/4000),3,ACID);hudText(bossTriggered?'EXTRACTOR':'CROSS THE WRECK FIELD',118,48,1,'#e7e0b5');
 if(player.heavy>0)rect(155,40,80*(player.heavy/14),1,CYAN);
 if(boss&&!boss.dead){steel(188,62,264,23,13);rect(191,65,258,17,'#39271c');hudText('THE EXTRACTOR',W/2,67,1,'#ead9ae','center');rect(198,77,244,4,'#231711');rect(198,77,244*(boss.hp/boss.maxHp),4,boss.hp<boss.maxHp*.45?'#d98252':'#dba358');rect(198,77,244*(boss.hp/boss.maxHp),1,'#f1df9b');}
 if(player.x<220&&elapsed<8)hudText('MOVE >  JUMP >  HOLD FIRE',W/2,329,1,'#f1dba4','center');
}

function draw(){
 g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
 g.save();if(shake>0&&state==='playing')g.translate(Math.round((Math.random()-.5)*shake),Math.round((Math.random()-.5)*shake));background();foregroundWorld();
 if(state==='menu'){
  // An animated, in-engine title vignette, not a disconnected illustration.
  drawBoss({t:clock},true);person(325,GROUND,1,0,false,Math.sin(clock*5)>.95);
  for(let i=0;i<3;i++)drone({x:cam+355+i*68,y:112+Math.sin(clock*1.3+i)*7+i*8,flash:0,alert:0});

 }else{
  for(const h of hazards){const x=h.x-cam;if(h.t>0){rect(x-23,GROUND-3,46,3,Math.sin(clock*24)>0?'#f1ba76':'#a76048');for(let i=0;i<5;i++)rect(x-20+i*10,GROUND-7,5,2,'#e7ac6f');text('!',x-2,GROUND-27,1,'#ffd99c');}else{rect(x-8,GROUND-55,16,55,'#ffe0a5');rect(x-16,GROUND-28,32,28,'#e79d68');}}
  for(const c of crates)drawCrate(c);
  for(const p of pickups)if(Math.abs(p.x-cam-W/2)<370)drawPickup(p);
  for(const e of enemies)if(e.x-cam>-45&&e.x-cam<W+45){if(e.type==='drone')drone(e);else if(e.type==='turret')turret(e);else{person(e.x-cam,e.y,e.face,e.t*5,true,e.cool>2.22);if(e.alert>.12)text('!',e.x-cam-2,e.y-46,1,'#efbc87');}}
  if(boss)drawBoss(boss);
  if(player&&(player.inv===0||Math.floor(player.inv*13)%2===0)&&state!=='dead')person(player.x-cam,player.y,player.face,player.vx?player.anim+.000001:0,false,player.cool>.09&&down('fire'),!player.onGround,player.dash>0);
  for(const b of shots){rect(b.x-cam-Math.sign(b.vx)*7,b.y-1,9,3,b.heavy?ACID:'#ffeeb8');rect(b.x-cam-Math.sign(b.vx)*12,b.y,6,1,b.heavy?'#d39551':'#dcad71');}
  for(const b of hostiles){circle(b.x-cam,b.y,b.r+2,'#ed936935');circle(b.x-cam,b.y,b.r,'#ecac7d');rect(b.x-cam-1,b.y-1,2,2,'#fff0b9');}
  for(const n of grenades){rect(n.x-cam-3,n.y-3,6,6,'#8b7860');rect(n.x-cam-1,n.y-5,2,2,'#d6c1a2');if(Math.floor(clock*15)%2)rect(n.x-cam,n.y-2,2,2,'#ef9869');}
 }
 drawEffects();
 for(const p of particles){if(p.ring){const r=(1-p.life/.24)*50;g.strokeStyle=p.color;g.lineWidth=2;g.globalAlpha=Math.max(0,p.life/.24)*.65;g.beginPath();g.ellipse(p.x-cam,p.y,r,r*.55,0,0,Math.PI*2);g.stroke();g.globalAlpha=1;}else rect(p.x-cam,p.y,p.size,p.size,p.color);}
 // Dust streaks sweep over every layer of the scene.
 for(let i=0;i<64;i++){const x=((hash(i+90)*800-clock*(20+hash(i)*40)-cam*.13)%700+700)%700-25,y=hash(i+120)*H;rect(x,y,i%4===0?7:2,1,i%3===0?'#e7c69b55':'#d8c49828');}
 g.restore();
 if(state!=='menu'&&player){drawHUD();for(const t of texts){g.globalAlpha=Math.min(1,t.life*2);text(t.str,t.x-cam,t.y,1,t.color,'center');g.globalAlpha=1;}if(flash>0)rect(0,0,W,H,'#ed956b33');}
 else{rect(0,0,W,2,'#d5c89650');if(best>0)text('BEST '+String(best).padStart(6,'0'),W-19,17,1,'#e1d8ac','right');}
}
// Keyboard and multi-touch inputs share the same action map.
window.addEventListener('keydown',e=>{if(e.target.closest('button')&&['Space','Enter'].includes(e.code))return;if(binds[e.code]){e.preventDefault();const action=binds[e.code];if(!held.has(action))pressed.add(action);held.add(action);}if(e.repeat)return;if(e.code==='Enter'){if(state==='menu')startGame();else if(state==='dead')retry();else if(state==='won')startGame();else if(state==='paused')pauseGame();}if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();pauseGame();}if(e.code==='KeyM')toggleSound();});
window.addEventListener('keyup',e=>{const a=binds[e.code];if(a){held.delete(a);e.preventDefault();}});
window.addEventListener('blur',()=>{held.clear();pressed.clear();touch.clear();document.querySelectorAll('[data-control]').forEach(b=>b.classList.remove('active'));if(state==='playing')pauseGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pauseGame();});
for(const button of document.querySelectorAll('[data-control]')){const a=button.dataset.control;let lastTap=-1000;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);if(state!=='playing')return;touch.add(a);pressed.add(a);if(a==='left'||a==='right'){const now=performance.now();if(now-lastTap<280)pressed.add('dash');lastTap=now;}button.classList.add('active');if(soundOn)audioInit();});const release=e=>{e.preventDefault();touch.delete(a);button.classList.remove('active');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',()=>{touch.delete(a);button.classList.remove('active');});}
function retry(){if(checkpoint){score=Math.max(0,score-250);reset(checkpoint);}else startGame();canvas.focus({preventScroll:true});}
$('start').addEventListener('click',startGame);$('sound').addEventListener('click',toggleSound);$('pause').disabled=true;$('pause').addEventListener('click',pauseGame);$('restart').addEventListener('click',startGame);$('resume').addEventListener('click',()=>{if(state==='paused')pauseGame();else if(state==='dead')retry();else startGame();});
function expandFallback(){const expanded=$('game-shell').classList.toggle('expanded');document.body.classList.toggle('game-expanded',expanded);announce(expanded?'Expanded view. Turn your phone sideways for a larger game.':'Expanded view closed.');}
$('fullscreen').addEventListener('click',async()=>{const el=$('game-shell');try{if(document.fullscreenElement)await document.exitFullscreen();else if(el.requestFullscreen)await el.requestFullscreen();else expandFallback();}catch(e){expandFallback();}});
$('exit-expanded').addEventListener('click',async()=>{if(document.fullscreenElement)await document.exitFullscreen();$('game-shell').classList.remove('expanded');document.body.classList.remove('game-expanded');});$('expanded-pause').addEventListener('click',pauseGame);
let last=performance.now();function loop(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);pressed.clear();draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
})();
