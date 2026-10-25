/* Glass Dunes: wreck field -> sloping ascent and cave -> summit overlook. */
window.GlassDunes=(()=>{
 const summitY=-296,length=10800,caveStart=6300,caveEnd=7600;
 const floor=x=>x<4300?304:x<6300?304-(x-4300)*.3:summitY;
 const ledges=Array.from({length:9},(_,i)=>{const x=4510+i*190;return {x,y:floor(x)-66,w:110,rock:true,index:i};});
 const caveLedges=[{x:6580,y:-350,w:120,rock:true},{x:6880,y:-373,w:125,rock:true},{x:7230,y:-346,w:130,rock:true}];
 const ceiling={x:6350,y:-660,w:1180,h:155};
 const fresh=()=>({stage:1,walkerDown:false,collapse:0,caveReached:false,relay:false,swarm:[],swarmTimer:2.5,warning:null,swarmCount:0});
 return {summitY,length,caveStart,caveEnd,floor,ledges,caveLedges,ceiling,fresh};
})();
