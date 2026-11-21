const numbersEl=document.getElementById('numbers');
const availableEl=document.getElementById('availableCount');
const selectionEl=document.getElementById('selectionText');
const totalEl=document.getElementById('total');
const selected=new Set();
const money=value=>'$'+value.toLocaleString('es-AR');
for(let n=1;n<=40;n++){
  const button=document.createElement('button');
  button.type='button';button.className='number';button.textContent=String(n).padStart(2,'0');button.setAttribute('aria-label','Número '+n);
  button.addEventListener('click',()=>{
    if(selected.has(n)){selected.delete(n)}else if(selected.size<2){selected.add(n)}else{alert('Podés elegir hasta 2 números.');return}
    button.classList.toggle('selected',selected.has(n));
    const list=[...selected].sort((a,b)=>a-b);
    selectionEl.textContent=list.length?list.map(x=>String(x).padStart(2,'0')).join(' · '):'Ningún número';
    totalEl.textContent=money(list.length===0?0:list.length===1?5000:9000);
  });
  numbersEl.appendChild(button);
}
document.getElementById('reserveForm').addEventListener('submit',event=>{
  event.preventDefault();
  if(selected.size===0){alert('Primero elegí uno o dos números.');return}
  const name=document.getElementById('customerName').value.trim();
  const phone=document.getElementById('customerPhone').value.trim();
  const list=[...selected].sort((a,b)=>a-b).map(x=>String(x).padStart(2,'0')).join(', ');
  const price=selected.size===1?'$5.000':'$9.000';
  const message=`Hola ARG420! Quiero solicitar los números ${list} del sorteo. Nombre: ${name}. Mi WhatsApp: ${phone}. Total: ${price}.`;
  window.open('https://wa.me/5491125229926?text='+encodeURIComponent(message),'_blank','noopener');
});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
