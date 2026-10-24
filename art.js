/* DUSTBYTE: original 16-bit-style game art. Assets are local and require no third-party requests. */
window.DustbyteArt = (()=>{
  const assets={},frames={};let loaded=false,failed=false;
  const sources={wastes:'nomad-wastes.png',terrain:'nomad-terrain.png',hero:'nomad-hero.png',run:'nomad-run-approved.png',enemies:'enemies-16bit.png',boss:'extractor-16bit.png'};
  function load(name,file){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve();};im.onerror=()=>reject(new Error('Could not load '+file));im.src='assets/'+file;});}
  function frame(im,bounds,anchor){const c=document.createElement('canvas');c.width=Math.floor(bounds[2]);c.height=Math.floor(bounds[3]);const x=c.getContext('2d');x.drawImage(im,...bounds,0,0,c.width,c.height);const a=x.getImageData(0,0,c.width,c.height).data;let l=c.width,r=0,t=c.height,b=0;for(let yy=0;yy<c.height;yy++)for(let xx=0;xx<c.width;xx++)if(a[(yy*c.width+xx)*4+3]>80){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);}if(r<l)return null;return {image:im,x:bounds[0]+l,y:bounds[1]+t,w:r-l+1,h:b-t+1,anchor:anchor===undefined?(r-l+1)/2:anchor-(bounds[0]+l)};}
  const ready=Promise.all(Object.entries(sources).map(([k,v])=>load(k,v))).then(()=>{
    const hi=assets.hero,hs=hi.width/1774,vs=hi.height/887;
    // Atlas gutters follow the actual artwork, so the jump rifle and dash scarf never leak between frames.
    const hb=[[0,0,444,444,235],[444,0,440,444,690],[884,0,440,444,1110],[1324,0,450,444,1585],[0,444,450,443,225],[450,444,440,443,675],[890,444,416,443,1105],[1306,444,468,443,1540]];
    frames.hero=hb.map(b=>{const f=frame(hi,[b[0]*hs,b[1]*vs,b[2]*hs,b[3]*vs],b[4]*hs);if(f)f.nominalH=373*vs;return f;});
    // Extract the approved contact sheet without regenerating its corrected poses.
    // Flood only the connected neutral paper; preserve enclosed armor and cloth details.
    frames.run=Array.from({length:8},(_,i)=>{
      const c=document.createElement('canvas');c.width=384;c.height=350;
      const ctx=c.getContext('2d');ctx.drawImage(assets.run,(i%4)*384,i<4?110:560,384,350,0,0,384,350);
      const pixels=ctx.getImageData(0,0,384,350),d=pixels.data,seen=new Uint8Array(384*350),queue=[];
      const add=(x,y)=>{if(x<0||y<0||x>=384||y>=350)return;const n=y*384+x;if(seen[n])return;seen[n]=1;const k=n*4,r=d[k],g=d[k+1],b=d[k+2];if(r>125&&g>120&&b>105&&Math.max(r,g,b)-Math.min(r,g,b)<48){d[k+3]=0;queue.push(n);}};
      for(let x=0;x<384;x++){add(x,0);add(x,349);}for(let y=0;y<350;y++){add(0,y);add(383,y);}
      for(let q=0;q<queue.length;q++){const n=queue[q],x=n%384,y=Math.floor(n/384);add(x-1,y);add(x+1,y);add(x,y-1);add(x,y+1);}
      ctx.putImageData(pixels,0,0);
      return {image:c,x:0,y:0,w:384,h:350,anchor:210,nominalH:350};
    });
    frames.portrait={image:hi,x:178*hs,y:42*vs,w:140*hs,h:150*vs};
    const ei=assets.enemies,es=ei.width/1774,ev=ei.height/887;
    const eb=[[0,0,450,443,207],[450,0,450,443,690],[900,0,445,443,1140],[1345,0,429,443,1545],[0,443,450,444],[450,443,450,444],[900,443,445,444],[1345,443,429,444]];
    frames.enemies=eb.map(b=>frame(ei,[b[0]*es,b[1]*ev,b[2]*es,b[3]*ev],b[4]===undefined?undefined:b[4]*es));
    frames.boss=frame(assets.boss,[0,0,assets.boss.width,assets.boss.height]);loaded=true;return true;
  }).catch(e=>{failed=true;console.error(e);return false;});
  function sprite(g,f,x,y,height,face=1,alpha=1,anchorY=1){if(!f)return;const s=height/(f.nominalH||f.h);g.save();g.globalAlpha=alpha;g.translate(Math.round(x*2)/2,Math.round(y*2)/2);g.scale(face,1);g.drawImage(f.image,f.x,f.y,f.w,f.h,-f.anchor*s,-f.h*s*anchorY,f.w*s,f.h*s);g.restore();}
  return {assets,frames,ready,sprite,get loaded(){return loaded},get failed(){return failed}};
})();
