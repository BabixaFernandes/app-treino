import { obter, registarPeso, isoData, mediaSemanal, diaCurto } from '../store.js';

export function renderPeso(raiz) {
  const estado = obter();
  const hoje = isoData();
  const pesoHoje = estado.pesos[hoje];
  const semanas = agruparPorSemana(estado.pesos);
  const actual = semanas[semanas.length - 1];
  const anterior = semanas[semanas.length - 2];

  raiz.innerHTML = `
    <div class="destaque">
      <label class="input-grande">
        <span>Peso de hoje (kg)</span>
        <input type="number" id="peso-hoje" step="0.1" inputmode="decimal"
          placeholder="—" value="${pesoHoje ?? ''}">
      </label>
      <p class="legenda">Pesa-te em jejum, sempre à mesma hora.</p>
    </div>

    ${actual ? cartaoMedia(actual, anterior, estado.alvos) : `
      <div class="cartao vazio">
        <p>Ainda não há pesagens registadas.</p>
        <p class="legenda">O número que interessa é a <strong>média semanal</strong>, não o peso do dia. O peso diário oscila 1 a 2 kg só por água.</p>
      </div>`}

    ${semanas.length >= 3 ? cartaoAjuste(semanas) : ''}

    ${grafico(semanas)}

    <div class="cartao">
      <h4>Últimos registos</h4>
      <div class="lista-pesos">
        ${listaRecente(estado.pesos)}
      </div>
    </div>

    <details class="ritmos">
      <summary>A regra de ajuste das calorias</summary>
      <table>
        <thead><tr><th>Ao fim de 3 semanas</th><th>Acção</th></tr></thead>
        <tbody>
          <tr><td>Média desceu 1 a 1,5 kg</td><td>Está certo. Não mexas.</td></tr>
          <tr><td>Média parada ou a subir</td><td>Cortar 150 kcal/dia</td></tr>
          <tr><td>Média desceu mais de 2,5 kg</td><td>Acrescentar 150 kcal/dia</td></tr>
        </tbody>
      </table>
    </details>
  `;

  const campo = raiz.querySelector('#peso-hoje');
  campo.addEventListener('change', () => {
    registarPeso(hoje, campo.value === '' ? null : campo.value);
    renderPeso(raiz);
  });
}

function cartaoMedia(actual, anterior, alvos) {
  const delta = anterior ? actual.media - anterior.media : null;
  const temInicial = typeof alvos.pesoInicial === 'number';
  const temAlvo = typeof alvos.pesoAlvo === 'number';
  const perdido = temInicial ? alvos.pesoInicial - actual.media : null;
  const faltam = temAlvo ? actual.media - alvos.pesoAlvo : null;

  const estatisticas = (temInicial || temAlvo) ? `
    <div class="par-estatisticas">
      ${temInicial ? `<div><strong>${perdido >= 0 ? '−' : '+'}${Math.abs(perdido).toFixed(1)} kg</strong><span>vs. início do plano</span></div>` : ''}
      ${temAlvo ? `<div><strong>${faltam.toFixed(1)} kg</strong><span>até aos ${alvos.pesoAlvo}</span></div>` : ''}
    </div>` : '';

  return `
    <div class="cartao media">
      <div class="numero-grande">${actual.media.toFixed(1)} <small>kg</small></div>
      <p class="legenda">Média desta semana · ${actual.n} ${actual.n === 1 ? 'pesagem' : 'pesagens'}</p>
      ${delta !== null ? `
        <div class="delta ${delta < 0 ? 'bom' : delta > 0 ? 'mau' : ''}">
          ${delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} ${Math.abs(delta).toFixed(2)} kg vs. semana anterior
        </div>` : '<p class="legenda">Precisas de outra semana para haver comparação.</p>'}
      ${estatisticas}
    </div>
  `;
}

function cartaoAjuste(semanas) {
  const ultimas = semanas.slice(-3);
  if (ultimas.length < 3) return '';
  const variacao = ultimas[2].media - ultimas[0].media;

  let veredicto, classe;
  if (variacao <= -2.5) {
    veredicto = 'Estás a perder depressa de mais. Acrescenta 150 kcal/dia — perder rápido em bloco de corrida custa músculo e recuperação.';
    classe = 'aviso';
  } else if (variacao >= -0.5) {
    veredicto = 'A média está praticamente parada. Corta 150 kcal/dia e volta a avaliar daqui a 3 semanas.';
    classe = 'aviso';
  } else {
    veredicto = 'Está no ritmo certo. Não mexas em nada.';
    classe = 'bom';
  }

  return `
    <div class="cartao ajuste ${classe}">
      <h4>Últimas 3 semanas: ${variacao > 0 ? '+' : ''}${variacao.toFixed(1)} kg</h4>
      <p>${veredicto}</p>
    </div>
  `;
}

function grafico(semanas) {
  if (semanas.length < 2) return '';
  const vals = semanas.map((s) => s.media);
  const min = Math.min(...vals) - 0.5;
  const max = Math.max(...vals) + 0.5;
  const w = 320, h = 120, pad = 8;
  const pontos = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `
    <div class="cartao">
      <h4>Média semanal</h4>
      <svg viewBox="0 0 ${w} ${h}" class="gr" preserveAspectRatio="none" role="img"
           aria-label="Evolução da média semanal de peso">
        <polyline points="${pontos.join(' ')}" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linejoin="round" stroke-linecap="round"/>
        ${pontos.map((p) => { const [x, y] = p.split(','); return `<circle cx="${x}" cy="${y}" r="3" fill="currentColor"/>`; }).join('')}
      </svg>
      <p class="legenda">${vals[0].toFixed(1)} kg → ${vals[vals.length - 1].toFixed(1)} kg ao longo de ${vals.length} semanas</p>
    </div>
  `;
}

function listaRecente(pesos) {
  const datas = Object.keys(pesos).sort().reverse().slice(0, 14);
  if (!datas.length) return '<p class="legenda">Nada registado ainda.</p>';
  return datas.map((d) => `
    <div class="linha-peso">
      <span>${diaCurto(d)} ${Number(d.slice(8))}/${Number(d.slice(5, 7))}</span>
      <strong>${pesos[d].toFixed(1)} kg</strong>
    </div>`).join('');
}

function agruparPorSemana(pesos) {
  const mapa = new Map();
  Object.keys(pesos).sort().forEach((iso) => {
    const d = new Date(iso + 'T12:00:00');
    const segunda = new Date(d);
    segunda.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const chave = isoData(segunda);
    if (!mapa.has(chave)) mapa.set(chave, []);
    mapa.get(chave).push(pesos[iso]);
  });
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([inicio, vals]) => ({ inicio, n: vals.length, media: vals.reduce((a, b) => a + b, 0) / vals.length }));
}
