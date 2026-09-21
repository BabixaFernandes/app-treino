// Armazenamento local. Toda a leitura e escrita de dados passa por aqui —
// assim, acrescentar sincronização na nuvem mais tarde mexe só neste ficheiro.

import { ALIMENTOS_BASE } from './data/alimentos.js';
import { ALVOS_PADRAO } from './data/plano.js';

const CHAVE = 'treino10k.v1';

// Função, e não constante: cada chamada devolve objectos novos, para que
// `treinos`, `ajustes` e companhia nunca fiquem partilhados entre estados.
function estadoInicial() {
  return {
    versao: 1,
    alvos: { ...ALVOS_PADRAO },
    treinos: {},    // "2026-09-23": { feito, distanciaKm, tempoMin, esforco, dorCanela, notas }
    ajustes: {},    // "2026-09-21": "2026-09-23" — sessão do plano movida para outro dia
    edicoes: {},    // "2026-09-23": { tipo, titulo, detalhe, passadeira, distanciaKm } — campos por cima do plano
    extras: {},     // "x-1758...": { data, tipo, titulo, detalhe, passadeira, distanciaKm } — sessão criada por ela
    pesos: {},      // "2026-09-21": 95.2
    alimentos: [],  // { id, nome, kcal, p, h, g, cat }
    diario: {},     // "2026-09-21": [ { id, alimentoId, gramas, refeicao } ]
  };
}

let estado = carregar();
const ouvintes = new Set();

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return semear(estadoInicial());
    const guardado = JSON.parse(bruto);
    return { ...estadoInicial(), ...guardado, alvos: { ...ALVOS_PADRAO, ...(guardado.alvos || {}) } };
  } catch {
    return semear(estadoInicial());
  }
}

function semear(base) {
  base.alimentos = ALIMENTOS_BASE.map((a, i) => ({ id: `base-${i}`, ...a }));
  return base;
}

function gravar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (e) {
    alert('Não foi possível guardar. O armazenamento do browser pode estar cheio.');
  }
  ouvintes.forEach((fn) => fn(estado));
}

export function obter() {
  return estado;
}

export function subscrever(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export function actualizar(mutador) {
  mutador(estado);
  gravar();
}

// ---- Definições ----

export function guardarAlvos(novos) {
  actualizar((e) => {
    e.alvos = { ...e.alvos, ...novos, configurado: true };
  });
}

/** Mostrar os ritmos em velocidade de passadeira ou em pace de rua. */
export function definirModoRitmo(modo) {
  actualizar((e) => { e.alvos.modoRitmo = modo; });
}

/** Alvos estimados a partir das medidas. Mifflin-St Jeor + factor de actividade. */
export function calcularAlvos({ peso, altura, idade, sexo, actividade, defice }) {
  const tmb = 10 * peso + 6.25 * altura - 5 * idade + (sexo === 'm' ? 5 : -161);
  const manutencao = tmb * actividade;
  const kcal = Math.round((manutencao - defice) / 10) * 10;
  const proteina = Math.round(peso * 1.6);
  const gordura = Math.round(peso * 0.65);
  const hidratos = Math.max(0, Math.round((kcal - proteina * 4 - gordura * 9) / 4));
  return { tmb: Math.round(tmb), manutencao: Math.round(manutencao), kcal, proteina, hidratos, gordura };
}

// ---- Treinos ----

export function registarTreino(data, dados) {
  actualizar((e) => {
    e.treinos[data] = { ...(e.treinos[data] || {}), ...dados };
  });
}

export function apagarTreino(data) {
  actualizar((e) => { delete e.treinos[data]; });
}

// ---- Reorganizar a semana ----
//
// Cada sessão é identificada pela data que tem no plano original, e é essa a
// chave usada em `treinos` — assim o registo acompanha a sessão quando ela muda
// de dia. `ajustes` guarda apenas para onde é que ela foi.

/** O dia em que a sessão acontece realmente. */
export function dataEfectiva(idSessao) {
  return estado.ajustes[idSessao] || idSessao;
}

/** Troca de dia duas sessões. Se a troca as devolve ao lugar original, o ajuste desaparece. */
export function trocarSessoes(idA, idB) {
  actualizar((e) => {
    const diaA = e.ajustes[idA] || idA;
    const diaB = e.ajustes[idB] || idB;
    if (diaB === idA) delete e.ajustes[idA]; else e.ajustes[idA] = diaB;
    if (diaA === idB) delete e.ajustes[idB]; else e.ajustes[idB] = diaA;
  });
}

/** Move uma sessão do plano para outro dia, sem trocar com ninguém. */
export function moverSessao(id, data) {
  actualizar((e) => {
    if (data === id) delete e.ajustes[id]; else e.ajustes[id] = data;
  });
}

// ---- Editar, criar e apagar sessões ----

/** Guarda por cima do plano só os campos que ela mudou. */
export function editarSessao(id, campos) {
  actualizar((e) => { e.edicoes[id] = { ...(e.edicoes[id] || {}), ...campos }; });
}

/** Sessão nova, que não existe no plano. Devolve o id criado. */
export function criarSessao(dados) {
  const id = `x-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  actualizar((e) => { e.extras[id] = dados; });
  return id;
}

/** Deita fora as alterações de conteúdo e devolve a sessão ao que o plano diz. */
export function reporConteudo(id) {
  actualizar((e) => { delete e.edicoes[id]; });
}

export function editarExtra(id, campos) {
  actualizar((e) => { e.extras[id] = { ...(e.extras[id] || {}), ...campos }; });
}

/** Apaga uma sessão. As que ela criou desaparecem; as do plano passam a dia de
 *  descanso, para o dia não ficar vazio e para poderem voltar com o repor. */
export function apagarSessao(id) {
  actualizar((e) => {
    if (e.extras[id]) {
      delete e.extras[id];
      delete e.treinos[id];
      delete e.ajustes[id];
    } else {
      e.edicoes[id] = {
        tipo: 'descanso', titulo: 'Descanso', detalhe: '', passadeira: '', distanciaKm: null,
      };
    }
  });
}

/** Devolve uma semana ao plano original: dias, conteúdos e sessões criadas. */
export function reporSemana(idsPlano, idsExtra) {
  actualizar((e) => {
    idsPlano.forEach((id) => {
      delete e.ajustes[id];
      delete e.edicoes[id];
    });
    idsExtra.forEach((id) => {
      delete e.extras[id];
      delete e.treinos[id];
    });
  });
}

// ---- Peso ----

export function registarPeso(data, kg) {
  actualizar((e) => {
    if (kg === null || kg === '' || Number.isNaN(Number(kg))) delete e.pesos[data];
    else e.pesos[data] = Number(kg);
  });
}

/** Média dos pesos registados na semana que contém `data` (segunda a domingo). */
export function mediaSemanal(data) {
  const d = new Date(data + 'T12:00:00');
  const diaSemana = (d.getDay() + 6) % 7; // 0 = segunda
  const segunda = new Date(d);
  segunda.setDate(d.getDate() - diaSemana);

  const valores = [];
  for (let i = 0; i < 7; i++) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);
    const v = estado.pesos[isoData(dia)];
    if (typeof v === 'number') valores.push(v);
  }
  if (!valores.length) return null;
  return { media: valores.reduce((a, b) => a + b, 0) / valores.length, n: valores.length };
}

// ---- Alimentos ----

export function adicionarAlimento(alimento) {
  const id = `u-${Date.now()}`;
  actualizar((e) => { e.alimentos.push({ id, ...alimento }); });
  return id;
}

export function apagarAlimento(id) {
  actualizar((e) => {
    e.alimentos = e.alimentos.filter((a) => a.id !== id);
  });
}

export function alimentoPorId(id) {
  return estado.alimentos.find((a) => a.id === id);
}

// ---- Diário alimentar ----

export function adicionarAoDiario(data, entrada) {
  actualizar((e) => {
    if (!e.diario[data]) e.diario[data] = [];
    e.diario[data].push({ id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...entrada });
  });
}

export function removerDoDiario(data, id) {
  actualizar((e) => {
    e.diario[data] = (e.diario[data] || []).filter((x) => x.id !== id);
  });
}

/** Soma dos macros de um dia. */
export function totaisDoDia(data) {
  const linhas = estado.diario[data] || [];
  return linhas.reduce(
    (acc, linha) => {
      const a = alimentoPorId(linha.alimentoId);
      if (!a) return acc;
      const f = linha.gramas / 100;
      acc.kcal += a.kcal * f;
      acc.p += a.p * f;
      acc.h += a.h * f;
      acc.g += a.g * f;
      return acc;
    },
    { kcal: 0, p: 0, h: 0, g: 0 }
  );
}

// ---- Cópia de segurança ----

export function exportar() {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `treino10k-backup-${isoData(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importar(texto) {
  const dados = JSON.parse(texto);
  if (!dados || typeof dados !== 'object' || !('versao' in dados)) {
    throw new Error('Este ficheiro não parece ser uma cópia de segurança da app.');
  }
  estado = { ...estadoInicial(), ...dados };
  gravar();
}

// ---- Utilitários de data ----

export function isoData(d = new Date()) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function somaDias(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return isoData(d);
}

export function dataLegivel(iso) {
  const d = new Date(iso + 'T12:00:00');
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
}

export function diaCurto(iso) {
  const d = new Date(iso + 'T12:00:00');
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
}
