import { obter, guardarAlvos, calcularAlvos } from '../store.js';
import { PLANO } from '../data/plano.js';

const MESES_LONGOS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const ACTIVIDADES = [
  { v: 1.35, label: 'Sedentário, 2 a 3 treinos por semana' },
  { v: 1.5, label: 'Sedentário, 4 a 5 treinos por semana' },
  { v: 1.65, label: 'Activo durante o dia, 5 ou mais treinos' },
];

const DEFICES = [
  { v: 0, label: 'Manter o peso' },
  { v: 400, label: 'Perder devagar — cerca de 0,4 kg/semana' },
  { v: 600, label: 'Perder depressa — cerca de 0,6 kg/semana' },
];

export function abrirDefinicoes(aoFechar) {
  const alvos = obter().alvos;
  const primeira = !alvos.configurado;
  const inicio = PLANO[0].inicio;
  const mesInicio = MESES_LONGOS[Number(inicio.slice(5, 7)) - 1];
  const diaInicio = Number(inicio.slice(8));

  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.innerHTML = `
    <form method="dialog">
      <h3>${primeira ? 'Bem-vinda' : 'Definições'}</h3>
      <p class="sub">
        ${primeira
          ? 'Antes de começares, os teus alvos. Ficam guardados só neste telemóvel.'
          : 'Os teus alvos diários. Ficam guardados só neste dispositivo.'}
      </p>

      <details class="calculadora" ${primeira ? 'open' : ''}>
        <summary>Calcular a partir das minhas medidas</summary>
        <div class="par">
          <label>Peso actual (kg)<input type="number" id="c-peso" step="0.1" inputmode="decimal"
            value="${alvos.pesoInicial ?? ''}"></label>
          <label>Altura (cm)<input type="number" id="c-altura" step="1" inputmode="numeric"
            value="${alvos.altura ?? ''}"></label>
        </div>
        <div class="par">
          <label>Idade<input type="number" id="c-idade" step="1" inputmode="numeric"
            value="${alvos.idade ?? ''}"></label>
          <label>Sexo
            <select id="c-sexo">
              <option value="f" ${alvos.sexo !== 'm' ? 'selected' : ''}>Feminino</option>
              <option value="m" ${alvos.sexo === 'm' ? 'selected' : ''}>Masculino</option>
            </select>
          </label>
        </div>
        <label>Nível de actividade
          <select id="c-actividade">
            ${ACTIVIDADES.map((a) => `<option value="${a.v}" ${alvos.actividade == a.v ? 'selected' : ''}>${a.label}</option>`).join('')}
          </select>
        </label>
        <label>Objectivo
          <select id="c-defice">
            ${DEFICES.map((d) => `<option value="${d.v}" ${alvos.defice == d.v ? 'selected' : ''}>${d.label}</option>`).join('')}
          </select>
        </label>
        <button type="button" id="c-calcular" class="secundario largo">Calcular alvos</button>
        <p class="legenda" id="c-resultado"></p>
      </details>

      <h4 class="sec">Alvos diários</h4>
      <div class="par">
        <label>Calorias<input type="number" name="kcal" id="f-kcal" step="10" inputmode="numeric"
          value="${alvos.kcal}" required></label>
        <label>Proteína (g)<input type="number" name="proteina" id="f-proteina" step="1" inputmode="numeric"
          value="${alvos.proteina}" required></label>
      </div>
      <div class="par">
        <label>Hidratos (g)<input type="number" name="hidratos" id="f-hidratos" step="1" inputmode="numeric"
          value="${alvos.hidratos}" required></label>
        <label>Gordura (g)<input type="number" name="gordura" id="f-gordura" step="1" inputmode="numeric"
          value="${alvos.gordura}" required></label>
      </div>

      <h4 class="sec">Peso</h4>
      <div class="par">
        <label>Peso de partida (kg)<input type="number" name="pesoInicial" id="f-inicial" step="0.1" inputmode="decimal"
          value="${alvos.pesoInicial ?? ''}"></label>
        <label>Peso alvo (kg)<input type="number" name="pesoAlvo" step="0.1" inputmode="decimal"
          value="${alvos.pesoAlvo ?? ''}"></label>
      </div>
      <p class="legenda">O peso de partida serve só de referência para veres quanto já andaste.</p>

      <h4 class="sec">Treinos de PT</h4>
      <div class="par">
        <label>Quantos por mês<input type="number" name="ptPorMes" step="1" min="0" inputmode="numeric"
          value="${alvos.ptPorMes ?? 8}"></label>
        <label>Já feitos em ${mesInicio} antes de ${diaInicio}<input type="number" name="ptAntes" step="1" min="0"
          inputmode="numeric" value="${alvos.ptAntes ?? 0}"></label>
      </div>
      <p class="legenda">
        O plano arranca a ${diaInicio} de ${mesInicio}, a meio do mês. O segundo número diz à app
        quantos PT já lá tinhas antes disso, para a contagem do mês bater certo.
      </p>

      <div class="botoes">
        ${primeira ? '' : '<button value="cancelar" class="secundario">Cancelar</button>'}
        <button value="guardar" class="primario" ${primeira ? 'style="grid-column:1/-1"' : ''}>Guardar</button>
      </div>
    </form>`;

  document.body.appendChild(dialogo);
  dialogo.showModal();

  const num = (id) => Number(dialogo.querySelector(id).value);

  dialogo.querySelector('#c-calcular').addEventListener('click', () => {
    const peso = num('#c-peso'), altura = num('#c-altura'), idade = num('#c-idade');
    if (!peso || !altura || !idade) {
      dialogo.querySelector('#c-resultado').textContent = 'Preenche peso, altura e idade.';
      return;
    }
    const r = calcularAlvos({
      peso, altura, idade,
      sexo: dialogo.querySelector('#c-sexo').value,
      actividade: num('#c-actividade'),
      defice: num('#c-defice'),
    });
    dialogo.querySelector('#f-kcal').value = r.kcal;
    dialogo.querySelector('#f-proteina').value = r.proteina;
    dialogo.querySelector('#f-hidratos').value = r.hidratos;
    dialogo.querySelector('#f-gordura').value = r.gordura;
    if (!dialogo.querySelector('#f-inicial').value) dialogo.querySelector('#f-inicial').value = peso;
    dialogo.querySelector('#c-resultado').innerHTML =
      `Metabolismo basal ~${r.tmb} kcal · manutenção estimada ~${r.manutencao} kcal.<br>` +
      `É uma estimativa de partida — ajusta-a ao fim de 3 semanas pelo que a média do peso fizer.`;
  });

  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'guardar') {
      const f = new FormData(dialogo.querySelector('form'));
      guardarAlvos({
        kcal: Number(f.get('kcal')) || 2000,
        proteina: Number(f.get('proteina')) || 140,
        hidratos: Number(f.get('hidratos')) || 220,
        gordura: Number(f.get('gordura')) || 60,
        pesoInicial: f.get('pesoInicial') ? Number(f.get('pesoInicial')) : null,
        pesoAlvo: f.get('pesoAlvo') ? Number(f.get('pesoAlvo')) : null,
        ptPorMes: Number(f.get('ptPorMes')) || 0,
        ptAntes: Number(f.get('ptAntes')) || 0,
        altura: num('#c-altura') || null,
        idade: num('#c-idade') || null,
        sexo: dialogo.querySelector('#c-sexo').value,
        actividade: num('#c-actividade'),
        defice: num('#c-defice'),
      });
      aoFechar?.();
    }
    dialogo.remove();
  });
}
