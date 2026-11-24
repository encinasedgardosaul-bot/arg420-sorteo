
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

  totalEl.textContent = list.length === 0
    ? '$0'
    : list.length === 1 ? '$5.000' : '$9.000';
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
      button.textContent = firstName
        ? `${numberText}\n${firstName}`
        : numberText;

      button.style.whiteSpace = 'pre-line';
      button.style.fontSize = firstName ? '12px' : '16px';
      button.title = firstName
        ? `Reservado por ${firstName}`
        : 'Número reservado';
    } else {
      button.textContent = numberText;
      button.classList.toggle('selected', selected.has(n));

      button.addEventListener('click', () => {
        if (selected.has(n)) {
          selected.delete(n);
        } else {
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

async function loadNumbers() {
  const { data, error } = await db
    .from('numeros_publicos')
    .select('Numero, Estado, Nombre')
    .order('Numero');

  if (error) {
    console.error(error);
    alert('No se pudieron cargar los números. Recargá la página.');
    return;
  }

  reserved.clear();
  names.clear();

  data.forEach(row => {
    const number = Number(row.Numero);

    if (row.Estado !== 'Disponible') {
      reserved.add(number);

      if (row.Nombre) {
        names.set(number, String(row.Nombre).split(' ')[0]);
      }
    }
  });

  renderNumbers();
  updateSelection();
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

  const { error } = await db.rpc('reservar_numeros', {
    p_numeros: list,
    p_nombre: name,
    p_telefono: phone
  });

  if (error) {
    console.error(error);
    alert('No se pudo completar la reserva. Puede que otro participante haya elegido esos números. Actualizá la página.');

    button.disabled = false;
    button.textContent = 'Continuar por WhatsApp';

    await loadNumbers();
    return;
  }

  const price = list.length === 1 ? '$5.000' : '$9.000';

  const message =
    `Hola ARG420! Quiero confirmar mi reserva.\n` +
    `Nombre: ${name}\n` +
    `WhatsApp: ${phone}\n` +
    `Números: ${list.join(', ')}\n` +
    `Total: ${price}`;

  selected.clear();

  await loadNumbers();

  window.location.href =
    'https://wa.me/5491125229926?text=' +
    encodeURIComponent(message);
});

loadNumbers();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
