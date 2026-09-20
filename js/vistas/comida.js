import { REFEICOES } from '../data/alimentos.js';
import {
  obter, isoData, dataLegivel, totaisDoDia, alimentoPorId,
  adicionarAoDiario, removerDoDiario, adicionarAlimento, apagarAlimento,
} from '../store.js';

let dataActiva = isoData();

export function renderComida(raiz) {
  const estado = obter();
  const totais = totaisDoDia(dataActiva);
  const alvos = estado.alvos;
  const linhas = estado.diario[dataActiva] || [];

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

    <button id="add-comida" class="primario largo">+ Adicionar alimento</button>

    <div class="refeicoes">
      ${REFEICOES.map((r) => blocoRefeicao(r, linhas)).join('')}
    </div>

    <details class="ritmos">
      <summary>Os meus alimentos (${estado.alimentos.length})</summary>
      <button id="novo-alimento" class="secundario largo">+ Criar alimento</button>
      <div class="lista-alimentos">
        ${estado.alimentos.map((a) => `
          <div class="linha-alimento">
            <div><strong>${a.nome}</strong><br><span class="legenda">${a.kcal} kcal · ${a.p} g proteína / 100 g</span></div>
            <button class="apagar" data-apagar="${a.id}" aria-label="Apagar ${a.nome}">×</button>
          </div>`).join('')}
      </div>
    </details>
  `;

  raiz.querySelector('#dia-anterior').onclick = () => { dataActiva = deslocar(dataActiva, -1); renderComida(raiz); };
  raiz.querySelector('#dia-seguinte').onclick = () => { dataActiva = deslocar(dataActiva, 1); renderComida(raiz); };
  raiz.querySelector('#add-comida').onclick = () => abrirAdicionar(raiz);
  raiz.querySelector('#novo-alimento').onclick = () => abrirNovoAlimento(raiz);

  raiz.querySelectorAll('[data-remover]').forEach((b) => {
    b.onclick = () => { removerDoDiario(dataActiva, b.dataset.remover); renderComida(raiz); };
  });
  raiz.querySelectorAll('[data-apagar]').forEach((b) => {
    b.onclick = () => {
      if (confirm('Apagar este alimento da tua lista?')) { apagarAlimento(b.dataset.apagar); renderComida(raiz); }
    };
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
  const kcalRefeicao = itens.reduce((acc, l) => {
    const a = alimentoPorId(l.alimentoId);
    return acc + (a ? (a.kcal * l.gramas) / 100 : 0);
  }, 0);

  return `
    <div class="cartao refeicao">
      <div class="refeicao-topo"><h4>${nome}</h4><span class="legenda">${Math.round(kcalRefeicao)} kcal</span></div>
      ${itens.map((l) => {
        const a = alimentoPorId(l.alimentoId);
        if (!a) return '';
        const f = l.gramas / 100;
        return `
          <div class="linha-diario">
            <div>
              <strong>${a.nome}</strong><br>
              <span class="legenda">${l.gramas} g · ${Math.round(a.kcal * f)} kcal · ${(a.p * f).toFixed(1)} g prot.</span>
            </div>
            <button class="apagar" data-remover="${l.id}" aria-label="Remover">×</button>
          </div>`;
      }).join('')}
    </div>`;
}

function abrirAdicionar(raiz) {
  const estado = obter();
  const cats = [...new Set(estado.alimentos.map((a) => a.cat || 'Outros'))];

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>Adicionar alimento</h3>
      <input type="search" id="pesquisa" placeholder="Pesquisar..." autocomplete="off">
      <div class="resultados" id="resultados">
        ${cats.map((c) => `
          <div class="grupo" data-cat="${c}">
            <h5>${c}</h5>
            ${estado.alimentos.filter((a) => (a.cat || 'Outros') === c).map((a) => `
              <button type="button" class="opcao" data-id="${a.id}" data-nome="${a.nome.toLowerCase()}">
                <span>${a.nome}</span><span class="legenda">${a.kcal} kcal · ${a.p} g P</span>
              </button>`).join('')}
          </div>`).join('')}
      </div>
      <div class="escolhido" id="escolhido" hidden>
        <h4 id="nome-escolhido"></h4>
        <div class="par">
          <label>Quantidade (g)
            <input type="number" name="gramas" id="gramas" step="1" inputmode="numeric" value="100">
          </label>
          <label>Refeição
            <select name="refeicao">${REFEICOES.map((r) => `<option>${r}</option>`).join('')}</select>
          </label>
        </div>
        <p class="legenda" id="previsao"></p>
      </div>
      <div class="botoes">
        <button value="cancelar" class="secundario">Cancelar</button>
        <button value="guardar" class="primario" id="btn-guardar" disabled>Adicionar</button>
      </div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  let idEscolhido = null;
  const pesquisa = dialogo.querySelector('#pesquisa');
  const escolhido = dialogo.querySelector('#escolhido');
  const gramas = dialogo.querySelector('#gramas');
  const previsao = dialogo.querySelector('#previsao');
  const btnGuardar = dialogo.querySelector('#btn-guardar');

  pesquisa.addEventListener('input', () => {
    const q = pesquisa.value.toLowerCase().trim();
    dialogo.querySelectorAll('.opcao').forEach((o) => {
      o.hidden = q && !o.dataset.nome.includes(q);
    });
    dialogo.querySelectorAll('.grupo').forEach((g) => {
      g.hidden = ![...g.querySelectorAll('.opcao')].some((o) => !o.hidden);
    });
  });

  function actualizarPrevisao() {
    const a = alimentoPorId(idEscolhido);
    const f = (Number(gramas.value) || 0) / 100;
    previsao.textContent = `${Math.round(a.kcal * f)} kcal · ${(a.p * f).toFixed(1)} g proteína · ${(a.h * f).toFixed(1)} g hidratos · ${(a.g * f).toFixed(1)} g gordura`;
  }

  dialogo.querySelectorAll('.opcao').forEach((o) => {
    o.addEventListener('click', () => {
      idEscolhido = o.dataset.id;
      dialogo.querySelectorAll('.opcao').forEach((x) => x.classList.remove('activa'));
      o.classList.add('activa');
      dialogo.querySelector('#nome-escolhido').textContent = alimentoPorId(idEscolhido).nome;
      escolhido.hidden = false;
      btnGuardar.disabled = false;
      actualizarPrevisao();
      gramas.focus();
      gramas.select();
    });
  });

  gramas.addEventListener('input', () => { if (idEscolhido) actualizarPrevisao(); });

  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'guardar' && idEscolhido) {
      const f = new FormData(dialogo.querySelector('form'));
      adicionarAoDiario(dataActiva, {
        alimentoId: idEscolhido,
        gramas: Number(f.get('gramas')) || 0,
        refeicao: f.get('refeicao'),
      });
      renderComida(raiz);
    }
    dialogo.remove();
  });
}

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
        adicionarAlimento({
          nome: f.get('nome').trim(),
          kcal: Number(f.get('kcal')),
          p: Number(f.get('p')) || 0,
          h: Number(f.get('h')) || 0,
          g: Number(f.get('g')) || 0,
          cat: f.get('cat'),
        });
        renderComida(raiz);
      }
    }
    dialogo.remove();
  });
}

function deslocar(iso, dias) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  return isoData(d);
}
