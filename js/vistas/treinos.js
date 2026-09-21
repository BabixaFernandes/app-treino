import { PLANO, TIPO_INFO, RITMOS } from '../data/plano.js';
import {
  obter, registarTreino, isoData, diaCurto, dataLegivel,
  dataEfectiva, trocarSessoes, reporDias,
} from '../store.js';

const PROVA = '2026-11-08';
const DUROS = ['ergo', 'intervalos', 'longa', 'prova'];

/** As sessões da semana pelos dias em que acontecem, já com os ajustes aplicados.
 *  `id` é a data original (a identidade da sessão); `data` é o dia real. */
function sessoesDaSemana(s) {
  return s.sessoes
    .map((x) => ({ ...x, id: x.data, data: dataEfectiva(x.data) }))
    .sort((a, b) => a.data.localeCompare(b.data));
}

function eDomingo(iso) {
  return new Date(iso + 'T12:00:00').getDay() === 0;
}

export function renderTreinos(raiz) {
  const estado = obter();
  const hoje = isoData();

  raiz.innerHTML = `
    ${cabecalho(hoje)}
    <div id="lista-semanas">${PLANO.map((s) => semanaHTML(s, estado, hoje)).join('')}</div>
    ${tabelaRitmos()}
  `;

  raiz.querySelectorAll('[data-abrir]').forEach((el) => {
    el.addEventListener('click', () => {
      const alvo = raiz.querySelector(`#semana-${el.dataset.abrir}`);
      alvo.classList.toggle('fechada');
      el.classList.toggle('fechada');
    });
  });

  raiz.querySelectorAll('[data-sessao]').forEach((el) => {
    el.addEventListener('click', () => abrirRegisto(el.dataset.sessao, raiz));
  });

  raiz.querySelectorAll('[data-mover]').forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.stopPropagation(); // não abrir também o registo da sessão
      abrirTroca(el.dataset.mover, Number(el.dataset.semana), raiz);
    });
  });

  raiz.querySelectorAll('[data-repor]').forEach((el) => {
    el.addEventListener('click', () => {
      const semana = PLANO.find((s) => s.semana === Number(el.dataset.repor));
      reporDias(semana.sessoes.map((x) => x.data));
      renderTreinos(raiz);
    });
  });

  // Abre a semana actual e fecha as outras
  const semanaActual = PLANO.find((s) => s.sessoes.some((x) => dataEfectiva(x.data) >= hoje)) || PLANO[PLANO.length - 1];
  PLANO.forEach((s) => {
    if (s.semana !== semanaActual.semana) {
      raiz.querySelector(`#semana-${s.semana}`)?.classList.add('fechada');
      raiz.querySelector(`[data-abrir="${s.semana}"]`)?.classList.add('fechada');
    }
  });
}

function cabecalho(hoje) {
  const dias = Math.round((new Date(PROVA) - new Date(hoje)) / 86400000);
  const total = PLANO.flatMap((s) => s.sessoes).filter((s) => s.tipo !== 'descanso').length;
  const feitos = Object.values(obter().treinos).filter((t) => t.feito).length;
  const pct = Math.round((feitos / total) * 100);

  return `
    <div class="destaque">
      <div class="contagem">
        <strong>${dias > 0 ? dias : 0}</strong>
        <span>${dias === 1 ? 'dia' : 'dias'} até aos 10 km</span>
      </div>
      <div class="barra-progresso"><div style="width:${pct}%"></div></div>
      <p class="legenda">${feitos} de ${total} sessões feitas · ${pct}%</p>
    </div>
  `;
}

function semanaHTML(s, estado, hoje) {
  const lista = sessoesDaSemana(s);
  const fim = lista[lista.length - 1].data;
  const activa = hoje >= s.inicio && hoje <= fim;
  const ajustada = lista.some((x) => x.data !== x.id);
  const aviso = avisoDaSemana(lista);

  return `
    <section class="semana">
      <button class="cabecalho-semana ${activa ? 'activa' : ''}" data-abrir="${s.semana}">
        <span class="num">S${s.semana}</span>
        <span class="tit">${s.titulo}</span>
        ${ajustada ? '<span class="sinal-ajuste" title="Semana reorganizada">⇄</span>' : ''}
        <span class="seta">▾</span>
      </button>
      <div class="corpo-semana" id="semana-${s.semana}">
        ${s.nota ? `<p class="nota">${s.nota}</p>` : ''}
        ${ajustada ? `
          <p class="ajustada">
            Semana reorganizada
            <button type="button" data-repor="${s.semana}">repor o plano original</button>
          </p>` : ''}
        ${aviso ? `<p class="nota aviso-semana">⚠ ${aviso}</p>` : ''}
        ${lista.map((x) => sessaoHTML(x, estado, hoje, s.semana)).join('')}
      </div>
    </section>
  `;
}

/** Dois treinos duros em dias seguidos — o risco real quando se reorganiza a semana. */
function avisoDaSemana(lista) {
  for (let i = 1; i < lista.length; i++) {
    const anterior = lista[i - 1];
    const actual = lista[i];
    if (!DUROS.includes(anterior.tipo) || !DUROS.includes(actual.tipo)) continue;
    const dias = (new Date(actual.data) - new Date(anterior.data)) / 86400000;
    if (dias === 1) {
      return `${TIPO_INFO[anterior.tipo].label} e ${TIPO_INFO[actual.tipo].label} ficaram em dias seguidos `
        + `(${diaCurto(anterior.data)} e ${diaCurto(actual.data)}). `
        + 'Se vieres cansada ou a canela reclamar, o segundo passa a fácil ou a descanso.';
    }
  }
  return null;
}

function sessaoHTML(sessao, estado, hoje, semana) {
  const reg = estado.treinos[sessao.id] || {};
  const info = TIPO_INFO[sessao.tipo];
  const registavel = sessao.tipo !== 'descanso';
  const movivel = sessao.tipo !== 'prova';
  const classes = [
    'sessao', `cor-${info.cor}`,
    sessao.data === hoje ? 'hoje' : '',
    reg.feito ? 'feita' : '',
    reg.dorCanela ? 'alerta' : '',
    sessao.data !== sessao.id ? 'movida' : '',
  ].filter(Boolean).join(' ');

  return `
    <article class="${classes}" ${registavel ? `data-sessao="${sessao.id}"` : ''}>
      <div class="dia">
        <span class="ds">${diaCurto(sessao.data)}</span>
        <span class="dn">${Number(sessao.data.slice(8))}</span>
      </div>
      <div class="conteudo">
        <div class="linha-topo">
          <span class="etiqueta">${info.label}</span>
          ${reg.feito ? '<span class="visto">✓</span>' : ''}
          ${reg.dorCanela ? '<span class="aviso">⚠ canela</span>' : ''}
          ${sessao.data !== sessao.id ? `<span class="etiqueta-movida">movida de ${diaCurto(sessao.id)}</span>` : ''}
          ${movivel ? `<button type="button" class="mover" data-mover="${sessao.id}" data-semana="${semana}"
             aria-label="Trocar de dia" title="Trocar de dia">⇄</button>` : ''}
        </div>
        <h4>${sessao.titulo}</h4>
        ${sessao.detalhe ? `<p class="detalhe">${sessao.detalhe}</p>` : ''}
        ${sessao.passadeira ? `<p class="passadeira">🏃 ${sessao.passadeira}</p>` : ''}
        ${reg.feito ? resumoRegisto(reg) : ''}
      </div>
    </article>
  `;
}

function resumoRegisto(reg) {
  const partes = [];
  if (reg.distanciaKm) partes.push(`${reg.distanciaKm} km`);
  if (reg.tempoMin) partes.push(`${reg.tempoMin} min`);
  if (reg.distanciaKm && reg.tempoMin) {
    const seg = (reg.tempoMin * 60) / reg.distanciaKm;
    partes.push(`${Math.floor(seg / 60)}:${String(Math.round(seg % 60)).padStart(2, '0')}/km`);
  }
  if (reg.esforco) partes.push(`esforço ${reg.esforco}/5`);
  if (!partes.length && !reg.notas) return '';
  return `<div class="registo">${partes.join(' · ')}${reg.notas ? `<br><em>${reg.notas}</em>` : ''}</div>`;
}

function tabelaRitmos() {
  return `
    <details class="ritmos">
      <summary>Tabela de ritmos e velocidades de passadeira</summary>
      <table>
        <thead><tr><th>Ritmo</th><th>km/h</th><th>Onde se usa</th></tr></thead>
        <tbody>
          ${RITMOS.map((r) => `
            <tr class="${r.destaque ? 'destaque-linha' : ''}">
              <td>${r.ritmo}</td><td><strong>${r.kmh}</strong></td><td>${r.uso}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="nota">Inclinação sempre a 1%, nunca 0%. E não te agarres aos corrimãos.</p>
    </details>
  `;
}

// ---- Trocar uma sessão de dia ----

function abrirTroca(id, numSemana, raiz) {
  const semana = PLANO.find((s) => s.semana === numSemana);
  const lista = sessoesDaSemana(semana);
  const sessao = lista.find((x) => x.id === id);
  const outras = lista.filter((x) => x.id !== id && x.tipo !== 'prova');

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>Trocar de dia</h3>
      <p class="sub">${sessao.titulo} — está em ${dataLegivel(sessao.data)}</p>
      <h4 class="sec">Trocar com</h4>
      <div class="resultados">
        ${outras.map((alvo) => {
          const aviso = avisoDaTroca(sessao, alvo);
          return `
            <button type="button" class="opcao" data-troca="${alvo.id}">
              <span>
                <strong>${diaCurto(alvo.data)} ${Number(alvo.data.slice(8))}</strong>
                — ${alvo.titulo}
                ${aviso ? `<em class="aviso-troca">${aviso}</em>` : ''}
              </span>
              <span class="seta">⇄</span>
            </button>`;
        }).join('')}
      </div>
      <div class="botoes um">
        <button value="cancelar" class="secundario">Cancelar</button>
      </div>
    </form>
  `;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  dialogo.querySelectorAll('[data-troca]').forEach((el) => {
    el.addEventListener('click', () => {
      trocarSessoes(id, el.dataset.troca);
      dialogo.close();
      renderTreinos(raiz);
    });
  });

  dialogo.addEventListener('close', () => dialogo.remove());
}

/** A regra fixa do plano: a corrida longa é ao domingo. Avisa, mas não impede. */
function avisoDaTroca(sessao, alvo) {
  if (sessao.tipo === 'longa' && !eDomingo(alvo.data)) return 'tira a longa de domingo';
  if (alvo.tipo === 'longa' && !eDomingo(sessao.data)) return 'tira a longa de domingo';
  return null;
}

// ---- Registo de uma sessão ----

function abrirRegisto(id, raiz) {
  const sessao = PLANO.flatMap((s) => s.sessoes).find((x) => x.data === id);
  const reg = obter().treinos[id] || {};
  const corrida = ['facil', 'intervalos', 'longa', 'prova'].includes(sessao.tipo);
  const data = dataEfectiva(id);

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>${sessao.titulo}</h3>
      <p class="sub">${dataLegivel(data)}${data !== id ? ` · movida de ${dataLegivel(id)}` : ''}</p>

      <label class="check">
        <input type="checkbox" name="feito" ${reg.feito ? 'checked' : ''}>
        <span>Sessão feita</span>
      </label>

      ${corrida ? `
        <div class="par">
          <label>Distância (km)
            <input type="number" name="distanciaKm" step="0.1" inputmode="decimal"
              value="${reg.distanciaKm ?? sessao.distanciaKm ?? ''}">
          </label>
          <label>Tempo (min)
            <input type="number" name="tempoMin" step="1" inputmode="numeric" value="${reg.tempoMin ?? ''}">
          </label>
        </div>
      ` : ''}

      <label>Como correu
        <select name="esforco">
          <option value="">—</option>
          ${[1, 2, 3, 4, 5].map((n) => `
            <option value="${n}" ${reg.esforco == n ? 'selected' : ''}>
              ${n} — ${['muito fácil', 'fácil', 'certo', 'duro', 'muito duro'][n - 1]}
            </option>`).join('')}
        </select>
      </label>

      ${corrida ? `
        <label class="check alerta-check">
          <input type="checkbox" name="dorCanela" ${reg.dorCanela ? 'checked' : ''}>
          <span>Senti dor na canela</span>
        </label>
      ` : ''}

      <label>Notas
        <textarea name="notas" rows="2" placeholder="opcional">${reg.notas ?? ''}</textarea>
      </label>

      <div class="botoes">
        <button value="cancelar" class="secundario">Cancelar</button>
        <button value="guardar" class="primario">Guardar</button>
      </div>
    </form>
  `;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'guardar') {
      const f = new FormData(dialogo.querySelector('form'));
      registarTreino(id, {
        feito: f.get('feito') === 'on',
        distanciaKm: f.get('distanciaKm') ? Number(f.get('distanciaKm')) : null,
        tempoMin: f.get('tempoMin') ? Number(f.get('tempoMin')) : null,
        esforco: f.get('esforco') ? Number(f.get('esforco')) : null,
        dorCanela: f.get('dorCanela') === 'on',
        notas: (f.get('notas') || '').trim(),
      });
      renderTreinos(raiz);
      if (f.get('dorCanela') === 'on') {
        setTimeout(() => alert(
          'Dor na canela registada.\n\nRegra do plano: se a canela doer no aquecimento, ou ainda doer 24 h depois de correr, não corres no dia seguinte. Cortas a semana e retomas onde estavas.'
        ), 150);
      }
    }
    dialogo.remove();
  });
}
