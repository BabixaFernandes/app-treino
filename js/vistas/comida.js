import { REFEICOES, refeicaoSugerida } from '../data/alimentos.js';
import {
  obter, isoData, somaDias, dataLegivel, totaisDoDia, alimentoPorId,
  adicionarAoDiario, removerDoDiario, actualizarNoDiario, adicionarAlimento, apagarAlimento,
  copiarDia, usoDosAlimentos, mediaSemanalComida,
  guardarRefeicao, apagarRefeicaoGuardada, aplicarRefeicao,
} from '../store.js';

let dataActiva = isoData();

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n1 = (v) => v.toFixed(1).replace('.', ',');

/** O plural da porção. O `+s` ingénuo daria "colher de sopas" e "requeijãos",
 *  por isso os casos que não obedecem trazem o plural escrito nos dados. */
const plural = (p) => p.plural || `${p.nome}s`;

/** "2 ovos · 110 g" — o que ela pôs, na linguagem em que o pôs. */
function textoQuantidade(a, gramas) {
  if (!a.porcao?.g) return `${gramas} g`;
  const unidades = gramas / a.porcao.g;
  if (Math.abs(unidades - Math.round(unidades * 2) / 2) > 0.01) return `${gramas} g`;
  const q = Math.round(unidades * 2) / 2;
  return `${n1(q).replace(',0', '')} ${q === 1 ? a.porcao.nome : plural(a.porcao)} · ${gramas} g`;
}

export function renderComida(raiz) {
  const estado = obter();
  const totais = totaisDoDia(dataActiva);
  const alvos = estado.alvos;
  const linhas = estado.diario[dataActiva] || [];
  const semana = mediaSemanalComida(dataActiva);

  raiz.innerHTML = `
    <div class="nav-data">
      <button id="dia-anterior" aria-label="Dia anterior">‹</button>
      <div>
        <strong>${dataActiva === isoData() ? 'Hoje' : dataLegivel(dataActiva)}</strong>
        ${dataActiva !== isoData() ? `<br><span class="legenda">${dataLegivel(dataActiva)}</span>` : ''}
      </div>
      <button id="dia-seguinte" aria-label="Dia seguinte">›</button>
    </div>

    <div class="destaque">
      <div class="anel-kcal">
        <div class="numero-grande">${Math.round(totais.kcal)}</div>
        <span class="legenda">de ${alvos.kcal} kcal</span>
        <div class="restante ${totais.kcal > alvos.kcal ? 'excedido' : ''}">
          ${totais.kcal > alvos.kcal
            ? `${Math.round(totais.kcal - alvos.kcal)} kcal acima`
            : `faltam ${Math.round(alvos.kcal - totais.kcal)} kcal`}
        </div>
      </div>
      ${barra('Proteína', totais.p, alvos.proteina, 'g', 'proteina')}
      ${barra('Hidratos', totais.h, alvos.hidratos, 'g')}
      ${barra('Gordura', totais.g, alvos.gordura, 'g')}
    </div>

    ${totais.p < alvos.proteina * 0.8 && totais.kcal > alvos.kcal * 0.7
      ? '<div class="cartao aviso"><p><strong>Proteína a ficar para trás.</strong> É ela que impede que o peso perdido venha de músculo. Ainda vais a tempo de corrigir hoje.</p></div>'
      : ''}

    <div class="acoes-comida">
      <button id="add-comida" class="primario">+ Alimento</button>
      <button id="add-refeicao" class="secundario">Refeição guardada</button>
      <button id="copiar-dia" class="secundario">Copiar um dia</button>
    </div>

    <div class="refeicoes">
      ${REFEICOES.map((r) => blocoRefeicao(r, linhas)).join('')}
    </div>
    ${linhas.length ? '' : '<div class="cartao vazio"><p>Nada registado neste dia.</p><p class="legenda">Se comeste parecido a outro dia, <strong>copiar um dia</strong> é mais rápido do que voltar a escrever tudo.</p></div>'}

    ${cartaoSemana(semana, alvos)}
    ${cartaoRefeicoesGuardadas(estado)}

    <details class="ritmos">
      <summary>Os meus alimentos (${estado.alimentos.length})</summary>
      <button id="novo-alimento" class="secundario largo">+ Criar alimento</button>
      <div class="lista-alimentos">
        ${estado.alimentos.map((a) => `
          <div class="linha-alimento">
            <div>
              <strong>${esc(a.nome)}</strong><br>
              <span class="legenda">
                ${a.kcal} kcal · ${a.p} g proteína / 100 g
                ${a.porcao?.g ? ` · 1 ${esc(a.porcao.nome)} = ${a.porcao.g} g` : ''}
              </span>
            </div>
            <button class="apagar" data-apagar="${a.id}" aria-label="Apagar ${esc(a.nome)}">×</button>
          </div>`).join('')}
      </div>
    </details>
  `;

  raiz.querySelector('#dia-anterior').onclick = () => { dataActiva = somaDias(dataActiva, -1); renderComida(raiz); };
  raiz.querySelector('#dia-seguinte').onclick = () => { dataActiva = somaDias(dataActiva, 1); renderComida(raiz); };
  raiz.querySelector('#add-comida').onclick = () => abrirAdicionar(raiz);
  raiz.querySelector('#add-refeicao').onclick = () => abrirRefeicoesGuardadas(raiz);
  raiz.querySelector('#copiar-dia').onclick = () => abrirCopiarDia(raiz);
  raiz.querySelector('#novo-alimento').onclick = () => abrirNovoAlimento(raiz);

  raiz.querySelectorAll('[data-editar-linha]').forEach((b) => {
    b.onclick = () => abrirAdicionar(raiz, b.dataset.editarLinha);
  });
  raiz.querySelectorAll('[data-guardar-refeicao]').forEach((b) => {
    b.onclick = () => abrirGuardarRefeicao(b.dataset.guardarRefeicao, raiz);
  });
  raiz.querySelectorAll('[data-apagar]').forEach((b) => {
    b.onclick = () => { apagarAlimento(b.dataset.apagar); renderComida(raiz); };
  });
  raiz.querySelectorAll('[data-apagar-refeicao]').forEach((b) => {
    b.onclick = () => { apagarRefeicaoGuardada(b.dataset.apagarRefeicao); renderComida(raiz); };
  });
}

function barra(rotulo, valor, alvo, unidade, classe = '') {
  const pct = Math.min(100, (valor / alvo) * 100);
  return `
    <div class="macro ${classe}">
      <div class="macro-topo"><span>${rotulo}</span><span>${Math.round(valor)} / ${alvo} ${unidade}</span></div>
      <div class="barra-progresso"><div style="width:${pct}%"></div></div>
    </div>`;
}

function blocoRefeicao(nome, linhas) {
  const itens = linhas.filter((l) => l.refeicao === nome);
  if (!itens.length) return '';
  const kcal = itens.reduce((acc, l) => {
    const a = alimentoPorId(l.alimentoId);
    return acc + (a ? (a.kcal * l.gramas) / 100 : 0);
  }, 0);

  return `
    <div class="cartao refeicao">
      <div class="refeicao-topo">
        <h4>${nome}</h4>
        <span class="legenda">${Math.round(kcal)} kcal</span>
        <button type="button" class="guardar-refeicao" data-guardar-refeicao="${nome}"
          title="Guardar esta refeição para reutilizar">guardar</button>
      </div>
      ${itens.map((l) => {
        const a = alimentoPorId(l.alimentoId);
        if (!a) return '';
        const f = l.gramas / 100;
        return `
          <button type="button" class="linha-diario editavel" data-editar-linha="${l.id}">
            <div>
              <strong>${esc(a.nome)}</strong><br>
              <span class="legenda">${textoQuantidade(a, l.gramas)} · ${Math.round(a.kcal * f)} kcal · ${n1(a.p * f)} g prot.</span>
            </div>
            <span class="seta">›</span>
          </button>`;
      }).join('')}
    </div>`;
}

function cartaoSemana(s, alvos) {
  if (!s.dias) return '';
  const fim = somaDias(s.segunda, 6);
  const poucos = s.dias < 4;
  return `
    <div class="cartao">
      <h4>Média da semana</h4>
      <p class="legenda">${dataLegivel(s.segunda)} a ${dataLegivel(fim)} · ${s.dias} de ${s.deDias} dias registados</p>
      <div class="linhas-pt">
        <div class="linha-pt">
          <span class="mes">Calorias</span>
          <span class="n">${Math.round(s.kcal)}</span>
          <span class="parcial">de ${alvos.kcal}</span>
        </div>
        <div class="linha-pt">
          <span class="mes">Proteína</span>
          <span class="n">${Math.round(s.proteina)} g</span>
          <span class="${s.proteina < alvos.proteina * 0.9 ? 'fora' : 'certo'}">de ${alvos.proteina} g</span>
        </div>
      </div>
      <p class="legenda">
        ${poucos
          ? 'Com menos de quatro dias registados, esta média diz pouco.'
          : 'É a média semanal que decide se ajustas as calorias, não o total de um dia.'}
      </p>
    </div>`;
}

function cartaoRefeicoesGuardadas(estado) {
  if (!estado.refeicoes.length) return '';
  return `
    <details class="ritmos">
      <summary>Refeições guardadas (${estado.refeicoes.length})</summary>
      <div class="lista-alimentos">
        ${estado.refeicoes.map((r) => `
          <div class="linha-alimento">
            <div>
              <strong>${esc(r.nome)}</strong><br>
              <span class="legenda">${r.itens.length} ${r.itens.length === 1 ? 'item' : 'itens'} · ${Math.round(kcalDaRefeicao(r))} kcal</span>
            </div>
            <button class="apagar" data-apagar-refeicao="${r.id}" aria-label="Apagar">×</button>
          </div>`).join('')}
      </div>
    </details>`;
}

function kcalDaRefeicao(r) {
  return r.itens.reduce((acc, it) => {
    const a = alimentoPorId(it.alimentoId);
    return acc + (a ? (a.kcal * it.gramas) / 100 : 0);
  }, 0);
}

// ---- Adicionar ou editar uma entrada ----

function abrirAdicionar(raiz, idLinha = null) {
  const estado = obter();
  const linha = idLinha ? (estado.diario[dataActiva] || []).find((l) => l.id === idLinha) : null;
  const aEditar = !!linha;

  // Os que ela usa mais, primeiro. Sem isto, o iogurte de todas as manhãs fica
  // ao mesmo nível do bacalhau que comeu uma vez.
  const uso = usoDosAlimentos();
  const recentes = Object.entries(uso)
    .sort((a, b) => b[1].n - a[1].n || b[1].ultima.localeCompare(a[1].ultima))
    .map(([id]) => alimentoPorId(id))
    .filter(Boolean)
    .slice(0, 8);

  const cats = [...new Set(estado.alimentos.map((a) => a.cat || 'Outros'))];
  const grupos = [
    ...(recentes.length && !aEditar ? [{ nome: 'Mais usados', itens: recentes }] : []),
    ...cats.map((c) => ({ nome: c, itens: estado.alimentos.filter((a) => (a.cat || 'Outros') === c) })),
  ];

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>${aEditar ? 'Editar' : 'Adicionar alimento'}</h3>
      ${aEditar ? '' : `
        <input type="search" id="pesquisa" placeholder="Pesquisar..." autocomplete="off">
        <div class="resultados" id="resultados">
          ${grupos.map((g) => `
            <div class="grupo" data-cat="${esc(g.nome)}">
              <h5>${esc(g.nome)}</h5>
              ${g.itens.map((a) => `
                <button type="button" class="opcao" data-id="${a.id}" data-nome="${esc(a.nome.toLowerCase())}">
                  <span>${esc(a.nome)}</span><span class="legenda">${a.kcal} kcal · ${a.p} g P</span>
                </button>`).join('')}
            </div>`).join('')}
        </div>`}

      <div class="escolhido" id="escolhido" ${aEditar ? '' : 'hidden'}>
        <h4 id="nome-escolhido">${aEditar ? esc(alimentoPorId(linha.alimentoId)?.nome || '') : ''}</h4>
        <div class="unidade" id="unidade" hidden>
          <button type="button" data-unidade="porcao" class="activa"></button>
          <button type="button" data-unidade="g">gramas</button>
        </div>
        <div class="par">
          <label id="rot-qtd">Quantidade
            <input type="number" name="qtd" id="qtd" step="0.5" inputmode="decimal" value="${aEditar ? linha.gramas : 100}">
          </label>
          <label>Refeição
            <select name="refeicao" id="refeicao">
              ${REFEICOES.map((r) => {
                const sel = aEditar ? linha.refeicao === r : refeicaoSugerida() === r;
                return `<option ${sel ? 'selected' : ''}>${r}</option>`;
              }).join('')}
            </select>
          </label>
        </div>
        <p class="legenda" id="previsao"></p>
      </div>

      ${aEditar ? '<button type="button" class="secundario largo apagar-sessao" id="remover-linha">Remover do diário</button>' : ''}

      <div class="botoes">
        <button value="cancelar" class="secundario">Cancelar</button>
        <button value="guardar" class="primario" id="btn-guardar" ${aEditar ? '' : 'disabled'}>
          ${aEditar ? 'Guardar' : 'Adicionar'}
        </button>
      </div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  let idEscolhido = aEditar ? linha.alimentoId : null;

  // Ao editar, abre na unidade em que foi registado. Abrir sempre em gramas era a
  // maneira mais fácil de trocar "3 fatias" por "3 gramas" sem se dar por isso.
  const porcaoDe = (id, gramas) => {
    const p = alimentoPorId(id)?.porcao;
    if (!p?.g) return null;
    const u = gramas / p.g;
    return Math.abs(u - Math.round(u * 2) / 2) < 0.01 ? Math.round(u * 2) / 2 : null;
  };
  const unidadesIniciais = aEditar ? porcaoDe(linha.alimentoId, linha.gramas) : null;
  let modo = unidadesIniciais !== null ? 'porcao' : 'g'; // "g" ou "porcao"

  const qtd = dialogo.querySelector('#qtd');
  const previsao = dialogo.querySelector('#previsao');
  const unidade = dialogo.querySelector('#unidade');
  const rotulo = dialogo.querySelector('#rot-qtd');
  const btnGuardar = dialogo.querySelector('#btn-guardar');

  const gramasActuais = () => {
    const a = alimentoPorId(idEscolhido);
    const v = Number(qtd.value) || 0;
    return modo === 'porcao' && a?.porcao?.g ? Math.round(v * a.porcao.g) : Math.round(v);
  };

  function desenharEscolhido() {
    const a = alimentoPorId(idEscolhido);
    if (!a) return;
    dialogo.querySelector('#nome-escolhido').textContent = a.nome;
    dialogo.querySelector('#escolhido').hidden = false;
    btnGuardar.disabled = false;

    if (a.porcao?.g) {
      unidade.hidden = false;
      unidade.querySelector('[data-unidade="porcao"]').textContent = `${a.porcao.nome} (${a.porcao.g} g)`;
    } else {
      unidade.hidden = true;
      modo = 'g';
    }
    // Sem "quantos/quantas": o género de cada porção não é adivinhável, e a
    // unidade já está escrita no botão activo logo acima.
    rotulo.firstChild.textContent = modo === 'porcao' ? `Quantidade (${plural(a.porcao)})` : 'Quantidade (g)';
    qtd.step = modo === 'porcao' ? '0.5' : '1';
    actualizarPrevisao();
  }

  function actualizarPrevisao() {
    const a = alimentoPorId(idEscolhido);
    if (!a) return;
    const f = gramasActuais() / 100;
    previsao.textContent = `${gramasActuais()} g · ${Math.round(a.kcal * f)} kcal · ${n1(a.p * f)} g proteína · ${n1(a.h * f)} g hidratos · ${n1(a.g * f)} g gordura`;
  }

  unidade.querySelectorAll('[data-unidade]').forEach((b) => {
    b.addEventListener('click', () => {
      const a = alimentoPorId(idEscolhido);
      const gramas = gramasActuais();
      modo = b.dataset.unidade;
      unidade.querySelectorAll('[data-unidade]').forEach((x) => x.classList.toggle('activa', x === b));
      // Converte o que já estava escrito, para não perder o que ela pôs.
      qtd.value = modo === 'porcao' ? Math.round((gramas / a.porcao.g) * 2) / 2 : gramas;
      desenharEscolhido();
    });
  });

  dialogo.querySelector('#pesquisa')?.addEventListener('input', (ev) => {
    const q = ev.target.value.toLowerCase().trim();
    dialogo.querySelectorAll('.opcao').forEach((o) => { o.hidden = q && !o.dataset.nome.includes(q); });
    dialogo.querySelectorAll('.grupo').forEach((g) => {
      g.hidden = ![...g.querySelectorAll('.opcao')].some((o) => !o.hidden);
    });
  });

  dialogo.querySelectorAll('.opcao').forEach((o) => {
    o.addEventListener('click', () => {
      idEscolhido = o.dataset.id;
      const a = alimentoPorId(idEscolhido);
      dialogo.querySelectorAll('.opcao').forEach((x) => x.classList.remove('activa'));
      o.classList.add('activa');
      // Com porção conhecida, arranca em "1 porção" — é o caso comum.
      modo = a.porcao?.g ? 'porcao' : 'g';
      unidade.querySelectorAll('[data-unidade]').forEach((x) => x.classList.toggle('activa', x.dataset.unidade === modo));
      qtd.value = modo === 'porcao' ? 1 : 100;
      desenharEscolhido();
      qtd.focus();
      qtd.select();
    });
  });

  qtd.addEventListener('input', () => { if (idEscolhido) actualizarPrevisao(); });

  dialogo.querySelector('#remover-linha')?.addEventListener('click', () => {
    removerDoDiario(dataActiva, idLinha);
    dialogo.close();
    renderComida(raiz);
  });

  if (aEditar) {
    if (unidadesIniciais !== null) qtd.value = unidadesIniciais;
    unidade.querySelectorAll('[data-unidade]').forEach((x) => x.classList.toggle('activa', x.dataset.unidade === modo));
    desenharEscolhido();
  }

  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'guardar' && idEscolhido) {
      const campos = { gramas: gramasActuais(), refeicao: dialogo.querySelector('#refeicao').value };
      if (aEditar) actualizarNoDiario(dataActiva, idLinha, campos);
      else adicionarAoDiario(dataActiva, { alimentoId: idEscolhido, ...campos });
      renderComida(raiz);
    }
    dialogo.remove();
  });
}

// ---- Copiar um dia ----

function abrirCopiarDia(raiz) {
  const estado = obter();
  const comRegisto = Object.keys(estado.diario)
    .filter((d) => estado.diario[d].length && d !== dataActiva)
    .sort().reverse().slice(0, 14);

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>Copiar um dia</h3>
      <p class="sub">Traz as entradas desse dia para ${dataActiva === isoData() ? 'hoje' : dataLegivel(dataActiva)}. Acrescenta ao que já cá está.</p>
      ${comRegisto.length ? `
        <div class="resultados">
          ${comRegisto.map((d) => {
            const t = totaisDoDia(d);
            return `
              <button type="button" class="opcao" data-copiar="${d}">
                <span><strong>${dataLegivel(d)}</strong><br><span class="legenda">${estado.diario[d].length} itens · ${Math.round(t.kcal)} kcal · ${Math.round(t.p)} g prot.</span></span>
                <span class="seta">›</span>
              </button>`;
          }).join('')}
        </div>` : '<p class="legenda">Ainda não há outros dias com comida registada.</p>'}
      <div class="botoes um"><button value="cancelar" class="secundario">Cancelar</button></div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  dialogo.querySelectorAll('[data-copiar]').forEach((b) => {
    b.addEventListener('click', () => {
      copiarDia(b.dataset.copiar, dataActiva);
      dialogo.close();
      renderComida(raiz);
    });
  });
  dialogo.addEventListener('close', () => dialogo.remove());
}

// ---- Refeições guardadas ----

function abrirGuardarRefeicao(slot, raiz) {
  const itens = (obter().diario[dataActiva] || [])
    .filter((l) => l.refeicao === slot)
    .map((l) => ({ alimentoId: l.alimentoId, gramas: l.gramas }));
  if (!itens.length) return;

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>Guardar esta refeição</h3>
      <p class="sub">${itens.length} ${itens.length === 1 ? 'item' : 'itens'} de ${slot.toLowerCase()}, para voltares a aplicar com um toque.</p>
      <label>Nome<input name="nome" required value="${esc(slot)} do dia-a-dia"></label>
      <div class="botoes">
        <button value="cancelar" class="secundario">Cancelar</button>
        <button value="guardar" class="primario">Guardar</button>
      </div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();
  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'guardar') {
      const nome = new FormData(dialogo.querySelector('form')).get('nome').trim();
      if (nome) { guardarRefeicao(nome, itens); renderComida(raiz); }
    }
    dialogo.remove();
  });
}

function abrirRefeicoesGuardadas(raiz) {
  const estado = obter();
  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>Refeição guardada</h3>
      ${estado.refeicoes.length ? `
        <label>Aplicar em
          <select id="slot">
            ${REFEICOES.map((r) => `<option ${refeicaoSugerida() === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </label>
        <div class="resultados">
          ${estado.refeicoes.map((r) => `
            <button type="button" class="opcao" data-aplicar="${r.id}">
              <span><strong>${esc(r.nome)}</strong><br><span class="legenda">${r.itens.length} itens · ${Math.round(kcalDaRefeicao(r))} kcal</span></span>
              <span class="seta">›</span>
            </button>`).join('')}
        </div>`
      : `<p class="legenda">
           Ainda não guardaste nenhuma. Registas uma refeição como sempre e depois tocas em
           <strong>guardar</strong> no canto do bloco dela — fica disponível aqui.
         </p>`}
      <div class="botoes um"><button value="cancelar" class="secundario">Fechar</button></div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  dialogo.querySelectorAll('[data-aplicar]').forEach((b) => {
    b.addEventListener('click', () => {
      aplicarRefeicao(dataActiva, b.dataset.aplicar, dialogo.querySelector('#slot').value);
      dialogo.close();
      renderComida(raiz);
    });
  });
  dialogo.addEventListener('close', () => dialogo.remove());
}

// ---- Criar alimento ----

function abrirNovoAlimento(raiz) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>Criar alimento</h3>
      <p class="sub">Valores por 100 g. Vêm no rótulo da embalagem.</p>
      <label>Nome<input name="nome" required placeholder="ex.: Iogurte proteico morango"></label>
      <div class="par">
        <label>Calorias<input type="number" name="kcal" step="1" inputmode="numeric" required></label>
        <label>Proteína (g)<input type="number" name="p" step="0.1" inputmode="decimal" required></label>
      </div>
      <div class="par">
        <label>Hidratos (g)<input type="number" name="h" step="0.1" inputmode="decimal" value="0"></label>
        <label>Gordura (g)<input type="number" name="g" step="0.1" inputmode="decimal" value="0"></label>
      </div>
      <label>Categoria
        <select name="cat">
          ${['Carne e peixe', 'Ovos e lacticínios', 'Hidratos', 'Fruta e legumes', 'Gorduras e extras', 'Outros']
            .map((c) => `<option>${c}</option>`).join('')}
        </select>
      </label>
      <h4 class="sec">Porção (opcional)</h4>
      <div class="par">
        <label>Como se conta<input name="porcaoNome" placeholder="ex.: iogurte, fatia, lata"></label>
        <label>Quantos gramas tem<input type="number" name="porcaoG" step="1" inputmode="numeric" placeholder="125"></label>
      </div>
      <p class="legenda">Com isto preenchido, passas a poder escrever <strong>1 iogurte</strong> em vez de 125 g.</p>
      <div class="botoes">
        <button value="cancelar" class="secundario">Cancelar</button>
        <button value="guardar" class="primario">Criar</button>
      </div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'guardar') {
      const f = new FormData(dialogo.querySelector('form'));
      if (f.get('nome') && f.get('kcal') !== '') {
        const pNome = (f.get('porcaoNome') || '').trim();
        const pG = Number(f.get('porcaoG')) || 0;
        adicionarAlimento({
          nome: f.get('nome').trim(),
          kcal: Number(f.get('kcal')),
          p: Number(f.get('p')) || 0,
          h: Number(f.get('h')) || 0,
          g: Number(f.get('g')) || 0,
          cat: f.get('cat'),
          ...(pNome && pG ? { porcao: { nome: pNome, g: pG } } : {}),
        });
        renderComida(raiz);
      }
    }
    dialogo.remove();
  });
}
