/* Zenith Prime: world-space route geometry; stage 1 retains the original streets. */
window.ZenithPrime = (()=>{
 const roofY=-842,length=9000;
 const climb=[4350,4510,4670,4830,4990,4830,4670,4510,4350,4510,4670,4830,4990,5150]
   .map((x,i)=>({x,y:224-i*82,w:180,climb:true,index:i}));
 const structures=[{x:4300,y:304,w:1140,h:600,road:true,style:2},
   {x:5250,y:roofY,w:550,h:32,style:1},
   {x:5800,y:roofY,w:3200,h:550,road:true,style:0}];
 const wall={x:4250,y:44,w:48,h:260,barrier:true};
 const gate={x:5540,y:roofY-230,w:36,h:230,barrier:true};
 function fresh(){return {stage:1,breached:false,crash:null,gateHP:120,gateOpen:false,
   gateFlash:0,traffic:[],trafficTimer:2,trafficWarning:null,trafficCount:0,
   safe:{x:80,y:304},relay:false,roofEntered:false};}
 return {roofY,length,climb,structures,wall,gate,fresh};
})();
