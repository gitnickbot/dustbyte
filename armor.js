/* Approved Nomad / Street Rogue armor: 04 -> 03 -> 02 -> 01 -> dead. */
window.DeadMoonArmor = (() => {
  const maxHP=7, capacities=[0,1,1,2,3], floors=[0,0,1,2,4];
  function status(hp){
    hp=Math.max(0,Math.min(maxHP,hp));
    const tier=hp>4?4:hp>2?3:hp>1?2:hp>0?1:0;
    return {tier,row:Math.min(3,4-tier),hits:hp-floors[tier],capacity:capacities[tier]};
  }
  // Isolate connected sprites rather than cutting an assumed grid: capes and rifles
  // overlap neighbouring bounding boxes, but their transparent silhouettes do not.
  function extractAtlas(image){
    const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const w=c.width,h=c.height,data=ctx.getImageData(0,0,w,h).data;
    const seen=new Uint8Array(w*h),queue=new Int32Array(w*h),parts=[];
    for(let start=0;start<w*h;start++){
      if(seen[start]||data[start*4+3]<=24)continue;
      let head=0,tail=1,l=w,r=0,t=h,b=0;queue[0]=start;seen[start]=1;
      while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);
        l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
        for(const next of [x>0?n-1:-1,x<w-1?n+1:-1,y>0?n-w:-1,y<h-1?n+w:-1]){
          if(next>=0&&!seen[next]&&data[next*4+3]>24){seen[next]=1;queue[tail++]=next;}
        }
      }
      if(tail<1500)continue;
      const tile=document.createElement('canvas');tile.width=r-l+1;tile.height=b-t+1;
      const tx=tile.getContext('2d'),pixels=tx.createImageData(tile.width,tile.height);
      for(let i=0;i<tail;i++){const n=queue[i],to=((Math.floor(n/w)-t)*tile.width+n%w-l)*4;
        pixels.data.set(data.subarray(n*4,n*4+4),to);}
      tx.putImageData(pixels,0,0);
      parts.push({image:tile,x:0,y:0,w:tile.width,h:tile.height,sourceX:l,sourceY:t,bottom:b});
    }
    if(parts.length!==32)throw new Error('Armor atlas must contain 32 isolated poses; got '+parts.length);
    parts.sort((a,b)=>a.bottom-b.bottom);
    return Array.from({length:4},(_,row)=>parts.slice(row*8,row*8+8).sort((a,b)=>a.sourceX-b.sourceX));
  }
  function tip(f,edge){
    const d=f.image.getContext('2d').getImageData(0,0,f.w,f.h).data;let sx=0,sy=0,n=0;
    for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){
      if((edge==='right'?x>=f.w-4:edge==='top'?y<4:y>=f.h-4)&&d[(y*f.w+x)*4+3]>80){sx+=x;sy+=y;n++;}
    }
    return n?[sx/n,sy/n]:[f.w-1,f.h/3];
  }
  function build(runImage,actionImage){
    const runs=extractAtlas(runImage),actions=extractAtlas(actionImage);
    return actions.map((poses,row)=>{
      const normal=poses[0].h,runH=Math.max(...runs[row].map(f=>f.h));
      for(const f of runs[row]){f.nominalH=runH;const [mx,my]=tip(f,'right');f.anchor=mx-26*runH/53;f.muzzle=[26,(f.h-my)*53/runH];}
      poses.forEach((f,col)=>{
        f.nominalH=col>=6?f.h*53/24:col===5?f.h*53/36:normal;
        const [mx,my]=tip(f,col===2?'top':col===4?'bottom':'right');
        f.anchor=col===2||col===4?mx:col===1||col===3?f.w*.53:mx-26*f.nominalH/53;
        f.muzzle=[(mx-f.anchor)*53/f.nominalH,(f.h-my)*53/f.nominalH];
      });
      const idle=poses[0],portrait={image:idle.image,x:Math.max(0,idle.anchor-normal*.18),y:0,w:normal*.38,h:normal*.42};
      return {run:runs[row],actions:poses,portrait};
    });
  }
  return {maxHP,status,build};
})();
