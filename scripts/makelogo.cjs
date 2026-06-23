const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('@cantoo/pdf-lib');
// Genera un PNG simple con un canvas... no hay canvas en node, así que creo un PNG a mano (cuadro con texto vía pdf->png no). 
// Mejor: PNG mínimo 200x80 turquesa con borde. Construyo un PNG sin libs usando zlib.
const zlib = require('zlib');
const W=240,H=90;
const buf = Buffer.alloc(W*H*4);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;
  const border = x<4||x>W-5||y<4||y>H-5;
  buf[i]=border?247:71; buf[i+1]=border?170:175; buf[i+2]=border?62:179; buf[i+3]=255;}
// raw -> PNG
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type);const crc=Buffer.alloc(4);
  const c=require('zlib');const crcVal=crc32(Buffer.concat([t,data]));crc.writeUInt32BE(crcVal>>>0);return Buffer.concat([len,t,data,crc]);}
function crc32(b){let c=~0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return ~c;}
const sig=Buffer.from([137,80,78,71,13,10,26,10]);
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;buf.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
const idat=zlib.deflateSync(raw);
const png=Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
fs.writeFileSync('C:/Users/Carlos Relaño/Desktop/logo-test.png',png);
console.log('logo-test.png creado',png.length,'bytes');
