import {
  obter, alternarInicioCiclo, marcarFimCiclo, registarSintomas,
  isoData, somaDias, diaCurto, dataLegivel,
} from '../store.js';
import {
  faseDe, duracaoMedia, duracaoPeriodo, periodoAberto,
  ciclosCompletos, faltamCiclos, padraoPorFase,
} from '../ciclo.js';

const SINTOMAS = [
  { chave: 'dores', label: 'Dores' },
  { chave: 'cansaco', label: 'Cansaço' },
  { chave: 'fluxo', label: 'Fluxo' },
];
const NIVEIS = ['Nada', 'Leve', 'Forte'];

const ritmo = (seg) => `${Math.floor(seg / 60)}:${String(Math.round(seg % 60)).padStart(2, '0')}/km`;

export function renderCiclo(raiz) {
  const estado = obter();
  const hoje = isoData();
  const fase = faseDe(hoje);
  const dur = duracaoMedia();
  const per = duracaoPeriodo();
  const comecouHoje = estado.ciclos.some((c) => c.inicio === hoje);
  const aberto = periodoAberto(hoje);

  raiz.innerHTML = `
    <div class="destaque">
      ${fase ? `
        <div class="contagem">
          <strong>${fase.dia}</strong>
          <span>dia do ciclo · ${fase.label.toLowerCase()}${fase.estimada ? ' (estimada)' : ''}</span>
        </div>
      ` : `
        <div class="contagem">
          <strong>—</strong>
          <span>sem ciclo registado</span>
        </div>
      `}
      <button type="button" class="${comecouHoje ? 'secundario' : 'primario'} largo" id="marcar-inicio">
        ${comecouHoje ? 'Desmarcar — não começou hoje' : 'O período começou hoje'}
      </button>
      ${aberto ? `
        <button type="button" class="secundario largo" id="marcar-fim">
          O período acabou hoje
        </button>` : ''}
      <p class="legenda">
        ${dur.n
          ? `Os teus ciclos têm em média <strong>${dur.dias} dias</strong>, de ${dur.n} ${dur.n === 1 ? 'intervalo' : 'intervalos'} registados.`
          : 'Sem dois períodos registados, a app usa 28 dias como referência. Assim que tiver os teus, passa a usar a tua média.'}
        ${per.n
          ? `O período dura-te em média <strong>${per.dias} dias</strong>.`
          : 'Enquanto não marcares o fim de um período, a menstruação é calculada com 5 dias — e as fases aparecem como estimadas.'}
      </p>
    </div>

    ${cartaoSintomas(estado, hoje)}
    ${cartaoPadrao()}
    ${cartaoHistorico(estado)}

    <details class="ritmos">
      <summary>Porque é que a app não muda os treinos por causa da fase</summary>
      <p class="nota">
        Porque a evidência não o sustenta. A meta-análise de referência dá um efeito médio
        <strong>trivial</strong> da fase do ciclo no desempenho, e a revisão de 2025 com critérios
        metodológicos exigentes encontra efeitos inconsistentes de estudo para estudo. O que é
        consistente é a <strong>variabilidade entre pessoas</strong>.
      </p>
      <p class="nota">
        Uma regra do género <em>«não faças intervalos ao dia 2»</em> seria inventar uma certeza que
        não existe. O teu padrão, medido ao longo de vários ciclos, é outra coisa — esse pode ser
        real e grande, e é o que esta secção serve para encontrar.
      </p>
      <p class="nota">
        <strong>Fluxo abundante</strong> é uma das causas mais comuns de falta de ferro, e a falta de
        ferro bate directamente na resistência — cansaço que não passa com descanso e ritmos que não
        melhoram com treino. Isso é conversa para análises e médico, não para uma app.
      </p>
    </details>
  `;

  raiz.querySelector('#marcar-inicio').addEventListener('click', () => {
    alternarInicioCiclo(hoje);
    renderCiclo(raiz);
  });

  raiz.querySelector('#marcar-fim')?.addEventListener('click', () => {
    marcarFimCiclo(aberto.inicio, hoje);
    renderCiclo(raiz);
  });

  raiz.querySelectorAll('[data-reabrir]').forEach((el) => {
    el.addEventListener('click', () => {
      marcarFimCiclo(el.dataset.reabrir, null);
      renderCiclo(raiz);
    });
  });

  raiz.querySelectorAll('[data-sintoma]').forEach((el) => {
    el.addEventListener('change', () => {
      registarSintomas(el.dataset.dia, { [el.dataset.sintoma]: Number(el.value) });
      renderCiclo(raiz);
    });
  });

  raiz.querySelectorAll('[data-apagar-ciclo]').forEach((el) => {
    el.addEventListener('click', () => {
      alternarInicioCiclo(el.dataset.apagarCiclo);
      renderCiclo(raiz);
    });
  });
}

/** Sintomas de hoje e dos dois dias anteriores — para poder preencher em atraso. */
function cartaoSintomas(estado, hoje) {
  const dias = [hoje, somaDias(hoje, -1), somaDias(hoje, -2)];
  return `
    <div class="cartao">
      <h4>Como te sentes</h4>
      <p class="legenda">Opcional, e é o que permite distinguir um ciclo tranquilo de um ciclo mau.</p>
      ${dias.map((d) => `
        <div class="dia-sintomas">
          <span class="rotulo-dia">${d === hoje ? 'Hoje' : `${diaCurto(d)} ${Number(d.slice(8))}`}</span>
          <div class="selects-sintomas">
            ${SINTOMAS.map((s) => `
              <label>
                <span>${s.label}</span>
                <select data-sintoma="${s.chave}" data-dia="${d}">
                  ${NIVEIS.map((n, i) => `
                    <option value="${i}" ${(estado.sintomas[d]?.[s.chave] || 0) === i ? 'selected' : ''}>${n}</option>
                  `).join('')}
                </select>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function cartaoPadrao() {
  const faltam = faltamCiclos();
  if (faltam > 0) {
    return `
      <div class="cartao">
        <h4>O teu padrão</h4>
        <p class="legenda">
          Faltam <strong>${faltam} ${faltam === 1 ? 'ciclo' : 'ciclos'}</strong> de registos para valer a pena
          comparar fases. Com menos do que isso, qualquer conclusão seria ruído — e um número errado
          aqui levava-te a mudar treinos sem motivo.
        </p>
      </div>`;
  }

  const linhas = padraoPorFase();
  if (!linhas) {
    return `
      <div class="cartao">
        <h4>O teu padrão</h4>
        <p class="legenda">Já há ciclos suficientes, mas ainda não há treinos registados dentro deles.</p>
      </div>`;
  }

  return `
    <div class="cartao">
      <h4>O teu padrão, por fase</h4>
      <table class="tabela-fases">
        <thead>
          <tr><th>Fase</th><th>Sessões</th><th>Ritmo</th><th>Esforço</th></tr>
        </thead>
        <tbody>
          ${linhas.map((l) => `
            <tr>
              <td>${l.label}</td>
              <td>${l.n}</td>
              <td>${l.ritmo ? ritmo(l.ritmo) : '—'}</td>
              <td>${l.esforco ? `${l.esforco.toFixed(1).replace('.', ',')}/5` : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="legenda">
        Médias das sessões feitas em cada fase. Se uma fase tiver ritmos parecidos mas esforço mais
        alto, foi mais difícil pelo mesmo resultado — e isso é teu, não é do manual.
      </p>
    </div>
  `;
}

function cartaoHistorico(estado) {
  if (!estado.ciclos.length) return '';
  const ordenados = [...estado.ciclos].reverse();
  return `
    <div class="cartao">
      <h4>Períodos registados</h4>
      <div class="lista-ciclos">
        ${ordenados.map((c, i) => {
          const anterior = ordenados[i + 1];
          const intervalo = anterior ? Math.round((new Date(c.inicio) - new Date(anterior.inicio)) / 86400000) : null;
          const dias = c.fim ? Math.round((new Date(c.fim) - new Date(c.inicio)) / 86400000) + 1 : null;
          return `
            <div class="linha-ciclo">
              <span>
                ${dataLegivel(c.inicio)}
                ${dias
                  ? `<button type="button" class="duracao" data-reabrir="${c.inicio}"
                       title="Marcar outra vez como não terminado">${dias} ${dias === 1 ? 'dia' : 'dias'}</button>`
                  : '<em class="duracao aberto">fim não marcado</em>'}
              </span>
              <span class="intervalo">${intervalo ? `${intervalo} dias depois` : 'primeiro registo'}</span>
              <button type="button" class="apagar" data-apagar-ciclo="${c.inicio}" aria-label="Apagar">×</button>
            </div>`;
        }).join('')}
      </div>
      <p class="legenda">${ciclosCompletos()} ${ciclosCompletos() === 1 ? 'ciclo completo' : 'ciclos completos'}.</p>
    </div>
  `;
}
