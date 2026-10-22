/* DUSTBYTE: original 16-bit-style game art. Assets are local and require no third-party requests. */
window.DustbyteArt = (()=>{
  const assets={},frames={};let loaded=false,failed=false;
  const sources={wastes:'wastes-16bit.png',hero:'hero-16bit.png',enemies:'enemies-16bit.png',boss:'extractor-16bit.png'};
  function load(name,file){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve();};im.onerror=()=>reject(new Error('Could not load '+file));im.src='assets/'+file;});}
  function frame(im,bounds,anchor){const c=document.createElement('canvas');c.width=Math.floor(bounds[2]);c.height=Math.floor(bounds[3]);const x=c.getContext('2d');x.drawImage(im,...bounds,0,0,c.width,c.height);const a=x.getImageData(0,0,c.width,c.height).data;let l=c.width,r=0,t=c.height,b=0;for(let yy=0;yy<c.height;yy++)for(let xx=0;xx<c.width;xx++)if(a[(yy*c.width+xx)*4+3]>80){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);}if(r<l)return null;return {image:im,x:bounds[0]+l,y:bounds[1]+t,w:r-l+1,h:b-t+1,anchor:anchor===undefined?(r-l+1)/2:anchor-(bounds[0]+l)};}
  const ready=Promise.all(Object.entries(sources).map(([k,v])=>load(k,v))).then(()=>{
    const hi=assets.hero,hs=hi.width/1774,vs=hi.height/887;
    const hb=[[0,0,450,440,205],[450,0,450,440,700],[900,0,445,440,1140],[1345,0,429,440,1555],[0,440,450,447,245],[450,440,480,447,640],[930,440,415,447,1145],[1345,440,429,447,1545]];
    frames.hero=hb.map(b=>frame(hi,[b[0]*hs,b[1]*vs,b[2]*hs,b[3]*vs],b[4]*hs));
    const ei=assets.enemies,es=ei.width/1774,ev=ei.height/887;
    const eb=[[0,0,450,443,207],[450,0,450,443,690],[900,0,445,443,1140],[1345,0,429,443,1545],[0,443,450,444],[450,443,450,444],[900,443,445,444],[1345,443,429,444]];
    frames.enemies=eb.map(b=>frame(ei,[b[0]*es,b[1]*ev,b[2]*es,b[3]*ev],b[4]===undefined?undefined:b[4]*es));
    frames.boss=frame(assets.boss,[0,0,assets.boss.width,assets.boss.height]);loaded=true;return true;
  }).catch(e=>{failed=true;console.error(e);return false;});
  function sprite(g,f,x,y,height,face=1,alpha=1,anchorY=1){if(!f)return;const s=height/f.h;g.save();g.globalAlpha=alpha;g.translate(Math.round(x*2)/2,Math.round(y*2)/2);g.scale(face,1);g.drawImage(f.image,f.x,f.y,f.w,f.h,-f.anchor*s,-height*anchorY,f.w*s,height);g.restore();}
  return {assets,frames,ready,sprite,get loaded(){return loaded},get failed(){return failed}};
})();
