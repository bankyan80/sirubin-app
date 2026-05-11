const fs=require('fs');
const B='C:\\Users\\Bank Yan\\sirubin\\sirubin-app';
const f=B+'\\src\\components\\laporan\\laporan-form.tsx';
const t=fs.readFileSync(f,'utf8');
const L=t.split('\n');
console.log('Total baris: '+L.length);
for(let i=0;i<L.length;i++){
  console.log((i+1)+'|'+L[i]);
}
