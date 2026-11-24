
const SUPABASE_URL = 'https://hhskhfgiocvknlhyzjzv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HhoykS3i-rfIl2lylgYaBw_TnVyrjFR';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const numbersEl = document.getElementById('numbers');
const availableEl = document.getElementById('availableCount');
const selectionEl = document.getElementById('selectionText');
const totalEl = document.getElementById('total');
const reserveForm = document.getElementById('reserveForm');

const selected = new Set();
const reserved = new Set();
const names = new Map();

function updateSelection() {
  const list = [...selected].sort((a, b) => a - b);
  selectionEl.textContent = list.length
    ? list.map(n => String(n).padStart(2, '0')).join(', ')
    : 'Ningún número';
  totalEl.textContent = list.length === 0 ? '$0' : list.length === 1 ? '$5.000' : '$9.000';
}

function renderNumbers() {
  numbersEl.innerHTML = '';
  for (let n = 1; n <= 40; n++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'number';
    const numberText = String(n).padStart(2, '0');

    if (reserved.has(n)) {
      const firstName = names.get(n) || '';
      button.classList.add('pending');
      button.disabled = true;
      button.textContent = firstName ? `${numberText}\n${firstName}` : numberText;
      button.style.whiteSpace = 'pre-line';
      button.style.fontSize = firstName ? '12px' : '16px';
      button.title = firstName ? `Reservado por ${firstName}` : 'Número reservado';
    } else {
      button.textContent = numberText;
      button.classList.toggle('selected', selected.has(n));
      button.addEventListener('click', () => {
        if (selected.has(n)) selected.delete(n);
        else {
          if (selected.size >= 2) {
            alert('Podés elegir hasta 2 números.');
            return;
          }
          selected.add(n);
        }
        renderNumbers();
        updateSelection();
      });
    }
    numbersEl.appendChild(button);
  }
  availableEl.textContent = 40 - reserved.size;
}

async function loadNumbers(showError = true) {
  const { data, error } = await db
    .from('numeros_publicos')
    .select('Numero, Estado, Nombre')
    .order('Numero');

  if (error) {
    console.error('Error al cargar números:', error);
    if (showError) alert('No se pudieron cargar los números: ' + error.message);
    return null;
  }

  reserved.clear();
  names.clear();
  data.forEach(row => {
    const number = Number(row.Numero);
    if (row.Estado !== 'Disponible') {
      reserved.add(number);
      if (row.Nombre) names.set(number, String(row.Nombre).split(' ')[0]);
    }
  });

  renderNumbers();
  updateSelection();
  return data;
}

reserveForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (selected.size === 0) {
    alert('Primero elegí uno o dos números.');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  if (!name || !phone) {
    alert('Completá tu nombre y WhatsApp.');
    return;
  }

  const list = [...selected].sort((a, b) => a - b);
  const button = reserveForm.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Procesando reserva...';

  try {
    const { error } = await db.rpc('reservar_numeros', {
      p_numeros: list,
      p_nombre: name,
      p_telefono: phone
    });

    if (error) {
      console.error('Error RPC reservar_numeros:', error);
      alert('No se pudo guardar la reserva. Detalle: ' + error.message);
      await loadNumbers(false);
      return;
    }

    // Confirmar desde la vista pública que TODOS los números quedaron reservados
    // antes de enviar al participante a WhatsApp.
    const rows = await loadNumbers(false);
    if (!rows) {
      alert('La reserva fue enviada, pero no pudimos verificarla. No vuelvas a reservar esos números; contactá a ARG420 por WhatsApp.');
      return;
    }

    const verified = list.every(number => {
      const row = rows.find(item => Number(item.Numero) === number);
      return row && row.Estado !== 'Disponible' &&
        String(row.Nombre || '').toLowerCase() === name.split(/\s+/)[0].toLowerCase();
    });

    if (!verified) {
      alert('La base no confirmó todos los números como reservados. No se abrió WhatsApp para evitar una reserva duplicada. Contactá a ARG420 para verificar.');
      return;
    }

    const price = list.length === 1 ? '$5.000' : '$9.000';
    const message =
      `Hola ARG420! Quiero confirmar mi reserva.\n` +
      `Nombre: ${name}\n` +
      `WhatsApp: ${phone}\n` +
      `Números: ${list.map(n => String(n).padStart(2, '0')).join(', ')}\n` +
      `Total: ${price}`;

    selected.clear();
    window.location.href = 'https://wa.me/5491125229926?text=' + encodeURIComponent(message);
  } catch (err) {
    console.error('Error inesperado al reservar:', err);
    alert('Ocurrió un error al procesar la reserva: ' + (err.message || 'Error desconocido'));
    await loadNumbers(false);
  } finally {
    button.disabled = false;
    button.textContent = 'Reservar y continuar por WhatsApp';
  }
});

loadNumbers();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
