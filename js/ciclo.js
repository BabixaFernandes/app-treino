// Fases do ciclo e o padrão dela por fase.
//
// Uma nota que decide o desenho deste ficheiro: a evidência publicada não sustenta
// regras de manual. A meta-análise de referência (McNulty, Sports Medicine 2020) dá
// um efeito médio *trivial* no desempenho, e a revisão de 2025 com critérios
// metodológicos exigentes encontra efeitos inconsistentes em direcção e magnitude.
// O que sobra é variabilidade individual. Por isso este módulo mede e compara —
// nunca prescreve, e não diz nada antes de ter ciclos suficientes para dizer.

import { obter, somaDias } from './store.js';

const CICLO_PADRAO = 28;
const MENSTRUACAO_PADRAO = 5;
const CICLOS_PARA_PADRAO = 2;
// Passados tantos dias sem fim marcado, deixa de fazer sentido oferecer "acabou hoje".
const DIAS_PERIODO_ABERTO = 14;

export const FASES = {
  menstruacao: { label: 'Menstruação', cor: 'vermelho' },
  folicular: { label: 'Folicular', cor: 'verde' },
  ovulacao: { label: 'Ovulação', cor: 'ouro', estimada: true },
  lutea: { label: 'Lútea', cor: 'roxo', estimada: true },
};

const diasEntre = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

/** A duração média dos ciclos dela. Assumir 28 dias é um dos erros que a
 *  literatura aponta, por isso só se usa o valor padrão sem histórico. */
export function duracaoMedia() {
  const { ciclos } = obter();
  if (ciclos.length < 2) return { dias: CICLO_PADRAO, estimada: true, n: 0 };
  const intervalos = ciclos.slice(1).map((c, i) => diasEntre(ciclos[i].inicio, c.inicio));
  const media = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
  return { dias: Math.round(media), estimada: false, n: intervalos.length };
}

/** Quantos dias duram os períodos dela, dos que tiverem fim marcado. */
export function duracaoPeriodo() {
  const fechados = obter().ciclos.filter((c) => c.fim);
  if (!fechados.length) return { dias: MENSTRUACAO_PADRAO, estimada: true, n: 0 };
  const duracoes = fechados.map((c) => diasEntre(c.inicio, c.fim) + 1);
  const media = duracoes.reduce((a, b) => a + b, 0) / duracoes.length;
  return { dias: Math.round(media), estimada: false, n: fechados.length };
}

/** O último ciclo que começou em ou antes de `data`. */
function cicloAplicavel(data) {
  return [...obter().ciclos].reverse().find((c) => c.inicio <= data) || null;
}

/** O período que está a decorrer, se houver e se ainda fizer sentido fechá-lo. */
export function periodoAberto(hoje) {
  const c = cicloAplicavel(hoje);
  if (!c || c.fim) return null;
  return diasEntre(c.inicio, hoje) <= DIAS_PERIODO_ABERTO ? c : null;
}

/** Em que fase cai um dia. `null` quando não há dados para o saber. */
export function faseDe(data) {
  const ciclo = cicloAplicavel(data);
  if (!ciclo) return null;
  const inicio = ciclo.inicio;

  const { dias: duracao } = duracaoMedia();
  const dia = diasEntre(inicio, data) + 1;

  // Muito depois do ciclo previsto, deixa de fazer sentido adivinhar.
  if (dia > duracao + 14) return null;

  // Se o fim do período foi marcado, a menstruação é medida e não estimada.
  const diasPeriodo = ciclo.fim ? diasEntre(inicio, ciclo.fim) + 1 : duracaoPeriodo().dias;

  const ovulacao = duracao - 14;
  let fase;
  if (dia <= diasPeriodo) fase = 'menstruacao';
  else if (dia < ovulacao - 1) fase = 'folicular';
  else if (dia <= ovulacao + 1) fase = 'ovulacao';
  else fase = 'lutea';

  const info = FASES[fase];
  // A menstruação só é estimada enquanto o fim do período não estiver marcado.
  const estimada = fase === 'menstruacao' ? !ciclo.fim : !!info.estimada;
  return { fase, dia, label: info.label, cor: info.cor, estimada };
}

/** Quantos ciclos completos existem — dois primeiros dias seguidos fazem um ciclo. */
export function ciclosCompletos() {
  return Math.max(0, obter().ciclos.length - 1);
}

export const faltamCiclos = () => Math.max(0, CICLOS_PARA_PADRAO - ciclosCompletos());

/** Sintomas fortes registados num intervalo de dias. */
export function sintomasFortes(de, ate) {
  const { sintomas } = obter();
  const fortes = [];
  for (let d = de; d <= ate; d = somaDias(d, 1)) {
    const s = sintomas[d];
    if (!s) continue;
    const quais = Object.entries(s).filter(([, v]) => v >= 2).map(([k]) => k);
    if (quais.length) fortes.push({ data: d, quais });
  }
  return fortes;
}

/**
 * O padrão dela: ritmo e esforço das corridas, agrupados pela fase em que caíram.
 * Devolve `null` enquanto não houver ciclos suficientes — é deliberado, porque uma
 * conclusão tirada de um ciclo seria pior do que não dizer nada.
 */
export function padraoPorFase() {
  if (faltamCiclos() > 0) return null;

  const { treinos } = obter();
  const grupos = {};

  Object.entries(treinos).forEach(([id, r]) => {
    if (!r.feito) return;
    const f = faseDe(id);
    if (!f) return;
    const g = (grupos[f.fase] ||= { fase: f.fase, label: f.label, n: 0, ritmos: [], esforcos: [], canela: 0 });
    g.n += 1;
    if (r.distanciaKm && r.tempoMin) g.ritmos.push((r.tempoMin * 60) / r.distanciaKm);
    if (r.esforco) g.esforcos.push(r.esforco);
    if (r.dorCanela) g.canela += 1;
  });

  const media = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const linhas = Object.values(grupos)
    .map((g) => ({ ...g, ritmo: media(g.ritmos), esforco: media(g.esforcos) }))
    .sort((a, b) => Object.keys(FASES).indexOf(a.fase) - Object.keys(FASES).indexOf(b.fase));

  return linhas.length ? linhas : null;
}
