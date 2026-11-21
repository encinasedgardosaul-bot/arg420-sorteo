const selected = new Set();
const numbersEl = document.getElementById('numbers');
const selectionText = document.getElementById('selectionText');
const totalEl = document.getElementById('total');
const countEl = document.getElementById('availableCount');
const demoReserved = new Set(); // Demo-only: replace with live database state before publishing reservations.
function render(){
  numbersEl.innerHTML='';
  for(let n=1;n<=40;n++){
    const b=document.createElement('button');
    b.type='button'; b.className='num'+(selected.has(n)?' selected':'')+(demoReserved.has(n)?' reserved':'');
    b.textContent=String(n).padStart(2,'0');
    b.disabled=demoReserved.has(n);
    b.addEventListener('click',()=>{if(selected.has(n))selected.delete(n);else if(selected.size<2)selected.add(n);else alert('Podés elegir hasta 2 números por reserva.');render();});
    numbersEl.appendChild(b);
  }
  const nums=[...selected].sort((a,b)=>a-b);
  selectionText.textContent=nums.length?nums.map(n=>String(n).padStart(2,'0')).join(' · '):'Ningún número';
  totalEl.textContent=nums.length===0?'$0':nums.length===1?'$5.000':'$9.000';
  countEl.textContent=40-demoReserved.size;
}
document.getElementById('reserveForm').addEventListener('submit',e=>{
  e.preventDefault();
  const nums=[...selected].sort((a,b)=>a-b);
  if(!nums.length){alert('Primero elegí uno o dos números.');return;}
  const name=document.getElementById('customerName').value.trim();
  const phone=document.getElementById('customerPhone').value.trim();
  const amount=nums.length===2?'$9.000':'$5.000';
  const msg=`Hola ARG420! Soy ${name}. Quiero consultar la reserva de los números ${nums.map(n=>String(n).padStart(2,'0')).join(', ')}. Total: ${amount}. Mi WhatsApp es ${phone}.`;
  window.open('https://wa.me/5491125229926?text='+encodeURIComponent(msg),'_blank','noopener');
});
render();
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));