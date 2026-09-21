// Balanço de uma semana terminada. Não há modelo nenhum por trás: são as regras
// do próprio plano aplicadas aos registos dela. O que a app não conseguir dizer,
// o botão de copiar manda para uma conversa a sério.

import { TIPO_INFO } from '../data/plano.js';
import { obter, mediaSemanal, totaisDoDia, somaDias, diaCurto, dataLegivel } from '../store.js';

// O ritmo fácil do plano é 8:15-8:45/km, e correr mais rápido do que isso é o erro
// central dela. Mas 10 s/km de tolerância sobre o limite, senão o aviso dispara por
// causa do GPS ou da passadeira e deixa de valer a pena ler.
const FACIL_RAPIDO_DE_MAIS = 485;
const PERDA_SEMANAL_ALVO = 0.4;
const MINIMO_DIAS_COMIDA = 5;

const ritmo = (seg) => `${Math.floor(seg / 60)}:${String(Math.round(seg % 60)).padStart(2, '0')}/km`;
const num = (v, casas = 1) => v.toFixed(casas).replace('.', ',');

function diasEntre(inicio, fim) {
  const dias = [];
  for (let d = inicio; d <= fim; d = somaDias(d, 1)) dias.push(d);
  return dias;
}

export function calcularBalanco(semana, sessoes, fim) {
  const e = obter();
  const reg = (s) => e.treinos[s.id] || {};

  const treinaveis = sessoes.filter((s) => s.tipo !== 'descanso');
  const feitas = treinaveis.filter((s) => reg(s).feito);
  const faltaram = treinaveis.filter((s) => !reg(s).feito);
  const canela = treinaveis.filter((s) => reg(s).dorCanela);

  const longa = sessoes.find((s) => s.tipo === 'longa' || s.tipo === 'prova');
  const longaReg = longa ? reg(longa) : null;

  // Ritmo médio das corridas fáceis que tenham distância e tempo registados.
  const faceis = sessoes
    .filter((s) => s.tipo === 'facil')
    .map((s) => reg(s))
    .filter((r) => r.distanciaKm && r.tempoMin);
  const ritmoFacil = faceis.length
    ? faceis.reduce((a, r) => a + (r.tempoMin * 60) / r.distanciaKm, 0) / faceis.length
    : null;

  const peso = mediaSemanal(semana.inicio);
  const pesoAnterior = mediaSemanal(somaDias(semana.inicio, -7));

  const dias = diasEntre(semana.inicio, fim);
  const comidos = dias.filter((d) => (e.diario[d] || []).length);
  const totais = comidos.map((d) => totaisDoDia(d));
  const comida = {
    dias: comidos.length,
    deDias: dias.length,
    kcal: totais.length ? totais.reduce((a, t) => a + t.kcal, 0) / totais.length : null,
    proteina: totais.length ? totais.reduce((a, t) => a + t.p, 0) / totais.length : null,
  };

  return {
    semana, fim, treinaveis, feitas, faltaram, canela,
    longa, longaReg, ritmoFacil, peso, pesoAnterior, comida, alvos: e.alvos,
  };
}

/** No máximo dois recados, pela ordem em que importam. A canela vem sempre primeiro. */
function veredictos(b) {
  const msgs = [];

  if (b.canela.length) {
    msgs.push({
      tom: 'mau',
      texto: `Dor na canela registada em ${b.canela.length === 1 ? 'uma sessão' : `${b.canela.length} sessões`}. `
        + 'Regra do plano: se doer no aquecimento, ou ainda doer 24 h depois de correr, não corres no dia seguinte. '
        + 'Cortas a semana e retomas onde estavas — isto está acima de qualquer tempo.',
    });
  }

  if (b.longa && !b.longaReg?.feito) {
    msgs.push({
      tom: 'mau',
      texto: 'A corrida longa não ficou feita. É a única sessão da semana que não se salta — '
        + 'falhar terças e quartas não tem importância, falhar domingos faz descarrilar o plano.',
    });
  }

  if (b.ritmoFacil && b.ritmoFacil < FACIL_RAPIDO_DE_MAIS) {
    msgs.push({
      tom: 'mau',
      texto: `As corridas fáceis saíram a ${ritmo(b.ritmoFacil)}, mais rápido do que o limite de 8:15/km. `
        + 'É o teu erro de sempre, em ponto pequeno: o ganho vem de correr devagar nos dias fáceis '
        + 'para poder correr forte nos dias fortes.',
    });
  }

  if (b.peso && b.pesoAnterior) {
    const delta = b.peso.media - b.pesoAnterior.media;
    if (delta > -0.1) {
      msgs.push({
        tom: 'aviso',
        texto: `A média do peso ${delta >= 0.05 ? `subiu ${num(delta)} kg` : 'ficou parada'} em relação à semana anterior, `
          + `contra os −${num(PERDA_SEMANAL_ALVO)} kg previstos. Uma semana não diz nada; três seguidas pedem menos 150 kcal por dia.`,
      });
    }
  }

  if (b.comida.dias >= MINIMO_DIAS_COMIDA && b.comida.proteina < b.alvos.proteina * 0.9) {
    msgs.push({
      tom: 'aviso',
      texto: `Proteína numa média de ${Math.round(b.comida.proteina)} g, com alvo de ${b.alvos.proteina} g. `
        + 'É o que impede que o peso perdido venha do músculo que construíste em dois anos.',
    });
  }

  if (!msgs.length) {
    const partes = ['Semana no sítio'];
    if (b.longaReg?.feito) partes.push('a longa feita');
    if (b.ritmoFacil) partes.push(`as fáceis a ${ritmo(b.ritmoFacil)}`);
    msgs.push({ tom: 'bom', texto: `${partes.join(', ')}. Sem nada a corrigir — continua.` });
  }

  return msgs.slice(0, 2);
}

function linhaLonga(b) {
  if (!b.longa) return null;
  if (!b.longaReg?.feito) return 'não feita';
  const p = [];
  if (b.longaReg.distanciaKm) p.push(`${num(b.longaReg.distanciaKm)} km`);
  if (b.longaReg.tempoMin) p.push(`${b.longaReg.tempoMin} min`);
  if (b.longaReg.distanciaKm && b.longaReg.tempoMin) {
    p.push(ritmo((b.longaReg.tempoMin * 60) / b.longaReg.distanciaKm));
  }
  if (b.longaReg.esforco) p.push(`esforço ${b.longaReg.esforco}/5`);
  return p.length ? p.join(' · ') : 'feita';
}

function linhaPeso(b) {
  if (!b.peso) return 'sem pesagens esta semana';
  const base = `média ${num(b.peso.media)} kg (${b.peso.n} ${b.peso.n === 1 ? 'pesagem' : 'pesagens'})`;
  if (!b.pesoAnterior) return base;
  const delta = b.peso.media - b.pesoAnterior.media;
  if (Math.abs(delta) < 0.05) return `${base} · igual à semana anterior`;
  return `${base} · ${delta < 0 ? '−' : '+'}${num(Math.abs(delta))} kg`;
}

function linhaComida(b) {
  if (!b.comida.dias) return 'nenhum dia registado';
  const base = `${b.comida.dias} de ${b.comida.deDias} dias · ${Math.round(b.comida.kcal)} kcal · proteína ${Math.round(b.comida.proteina)} g`;
  return b.comida.dias < MINIMO_DIAS_COMIDA ? `${base} — poucos dias para tirar conclusões` : base;
}

const linhas = (b) => [
  ['Sessões', `${b.feitas.length} de ${b.treinaveis.length}${b.faltaram.length ? ` — faltou ${b.faltaram.map((s) => TIPO_INFO[s.tipo].label.toLowerCase()).join(', ')}` : ''}`],
  ['A longa', linhaLonga(b)],
  ['Ritmo fácil', b.ritmoFacil ? ritmo(b.ritmoFacil) : 'sem distância e tempo registados'],
  ['Canela', b.canela.length ? `${b.canela.length} ${b.canela.length === 1 ? 'registo' : 'registos'} de dor` : 'sem registos'],
  ['Peso', linhaPeso(b)],
  ['Comida', linhaComida(b)],
].filter(([, v]) => v !== null);

/** Só aparece depois de a semana acabar. */
export function balancoHTML(semana, sessoes, fim, hoje) {
  if (fim >= hoje) return '';
  const b = calcularBalanco(semana, sessoes, fim);

  return `
    <div class="balanco">
      <div class="balanco-topo">
        <h5>Balanço da semana ${semana.semana}</h5>
        <button type="button" class="copiar-balanco" data-balanco="${semana.semana}">Copiar</button>
      </div>
      <dl>
        ${linhas(b).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
      ${veredictos(b).map((m) => `<p class="recado ${m.tom}">${m.texto}</p>`).join('')}
    </div>
  `;
}

/** A mesma coisa em texto, para colar numa conversa e pedir uma leitura a sério. */
export function balancoTexto(semana, sessoes, fim) {
  const b = calcularBalanco(semana, sessoes, fim);
  const alvos = b.alvos;

  return [
    `Balanço da semana ${semana.semana} do meu plano de 10 km (${dataLegivel(semana.inicio)} a ${dataLegivel(fim)}).`,
    `Semana: "${semana.titulo}".`,
    '',
    ...linhas(b).map(([k, v]) => `- ${k}: ${v}`),
    '',
    'Sessões, uma por uma:',
    ...sessoes.map((s) => {
      const r = obter().treinos[s.id] || {};
      const det = [];
      if (r.feito) det.push('feita'); else if (s.tipo !== 'descanso') det.push('não feita');
      if (r.distanciaKm) det.push(`${num(r.distanciaKm)} km`);
      if (r.tempoMin) det.push(`${r.tempoMin} min`);
      if (r.distanciaKm && r.tempoMin) det.push(ritmo((r.tempoMin * 60) / r.distanciaKm));
      if (r.esforco) det.push(`esforço ${r.esforco}/5`);
      if (r.dorCanela) det.push('DOR NA CANELA');
      if (r.notas) det.push(`nota: ${r.notas}`);
      return `- ${diaCurto(s.data)} ${Number(s.data.slice(8))} · ${s.titulo}${det.length ? ` — ${det.join(' · ')}` : ''}`;
    }),
    '',
    `Alvos: ${alvos.kcal} kcal, ${alvos.proteina} g de proteína, ritmo fácil 8:15-8:45/km.`,
    'Diz-me o que ler nisto e o que mudar na próxima semana.',
  ].join('\n');
}
