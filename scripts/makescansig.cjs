const fs = require('fs'); const zlib = require('zlib');
const W=520,H=200;
const buf = Buffer.alloc(W*H*4);
// fondo gris papel con ruido
for(let i=0;i<W*H;i++){const n=(Math.sin(i*12.9898)*43758.5453)%1; const g=222+Math.round((n-0.5)*16);
  buf[i*4]=g; buf[i*4+1]=g; buf[i*4+2]=g-2; buf[i*4+3]=255;}
function plot(x,y,r,col){x=Math.round(x);y=Math.round(y);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
  if(dx*dx+dy*dy>r*r)continue;const px=x+dx,py=y+dy;if(px<0||py<0||px>=W||py>=H)continue;const i=(py*W+px)*4;
  buf[i]=col[0];buf[i+1]=col[1];buf[i+2]=col[2];}}
function stroke(pts,r,col){for(let s=0;s<pts.length-1;s++){const[a,b]=pts[s],[c,d]=pts[s+1];const steps=Math.ceil(Math.hypot(c-a,d-b));
  for(let t=0;t<=steps;t++){plot(a+(c-a)*t/steps,b+(d-b)*t/steps,r,col);}}}
const ink=[38,40,70];
// una rúbrica: una gran "C" + un trazo largo + un lazo
stroke([[120,70],[90,55],[70,80],[80,130],[120,150],[160,130]],4,ink); // C
stroke([[150,120],[200,60],[230,140],[270,60],[300,140],[340,70]],4,ink); // zigzag (firma)
stroke([[120,160],[420,150]],3,ink); // subrayado largo
stroke([[360,120],[400,90],[430,120],[410,150],[370,140],[360,120]],4,ink); // lazo final
// PNG encode
function crc32(b){let c=~0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return ~c;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data]))>>>0);return Buffer.concat([len,t,data,crc]);}
const sig=Buffer.from([137,80,78,71,13,10,26,10]);
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;buf.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
const png=Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/firma-escaneada.png',png);
console.log('firma-escaneada.png creada',png.length,'bytes');
