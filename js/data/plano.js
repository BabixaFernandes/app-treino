// Plano de treino 10 km — 21 Set a 8 Nov 2026
// Tipos: pt | facil | ergo | intervalos | longa | descanso | prova

// Valores neutros de arranque. Os alvos reais são introduzidos por cada pessoa
// no ecrã de Definições e ficam guardados só no dispositivo dela — nunca aqui.
export const ALVOS_PADRAO = {
  kcal: 2000,
  proteina: 140,
  hidratos: 220,
  gordura: 60,
  pesoInicial: null,
  pesoAlvo: null,
  // Quantos PT já tinham sido feitos no mês em que o plano arranca, antes do
  // primeiro dia dele — o plano começa a meio de Setembro e não os conhece.
  ptAntes: 0,
  // Quantos PT tem um mês normal, para se ver quando um mês foge ao pacote.
  ptPorMes: 8,
  configurado: false,
};

export const RITMOS = [
  { ritmo: 'Caminhada', kmh: '5,5 - 6,0', uso: 'Recuperação entre intervalos' },
  { ritmo: '9:00/km', kmh: '6,7', uso: 'Trote de aquecimento' },
  { ritmo: '8:30/km', kmh: '7,0', uso: 'Ritmo base — fácil e longa', destaque: true },
  { ritmo: '8:00/km', kmh: '7,5', uso: 'Primeiros 2 km da prova', destaque: true },
  { ritmo: '7:40/km', kmh: '7,8', uso: 'Ritmo de prova — km 3 a 7', destaque: true },
  { ritmo: '7:30/km', kmh: '8,0', uso: 'Ritmo de prova — final' },
  { ritmo: '7:00/km', kmh: '8,6', uso: 'Intervalos', destaque: true },
];

const PT = (data, titulo = 'PT — força') => ({ data, tipo: 'pt', titulo });
const DESC = (data, titulo = 'Descanso') => ({ data, tipo: 'descanso', titulo });

export const PLANO = [
  {
    semana: 1,
    inicio: '2026-09-21',
    titulo: 'Entrada no bloco',
    nota: 'PT à segunda, terça e quinta — sobra a quarta e o domingo. Sem intervalos esta semana, e está bem assim: duas corridas é a forma certa de entrar num bloco novo.',
    sessoes: [
      PT('2026-09-21'),
      PT('2026-09-22'),
      {
        data: '2026-09-23', tipo: 'facil', titulo: 'Corrida fácil — 25 a 30 min',
        duracaoMin: 28,
        detalhe: 'Ritmo 8:15-8:45/km. Se vieres esmagada dos dois dias de PT, troca por 30 min de caminhada sem culpa nenhuma.',
        passadeira: '5 min a andar a 6,0 · 25 min a 7,0 · 3 min a 5,5 · inclinação 1%',
      },
      PT('2026-09-24'),
      DESC('2026-09-25'),
      DESC('2026-09-26'),
      {
        data: '2026-09-27', tipo: 'longa', titulo: 'Corrida longa — 6 km',
        distanciaKm: 6,
        detalhe: 'Alterna 9 min a correr com 1 min a andar, seis vezes. Não tentes fazer seguido.',
        passadeira: '9 min a 7,0 / 1 min a 5,5 — seis vezes · inclinação 1% · ~51 min',
      },
    ],
  },
  {
    semana: 2,
    inicio: '2026-09-28',
    titulo: 'Primeiros intervalos',
    nota: 'Os intervalos são no ergómetro — estímulo cardiovascular sem impacto nenhum na tíbia.',
    sessoes: [
      PT('2026-09-28'),
      {
        data: '2026-09-29', tipo: 'facil', titulo: 'Corrida fácil — 30 min',
        duracaoMin: 30,
        detalhe: 'Teste da conversa: tens de conseguir dizer uma frase inteira sem parar para respirar.',
        passadeira: '5 min a 6,0 · 30 min a 7,0 · 3 min a 5,5 · inclinação 1%',
      },
      {
        data: '2026-09-30', tipo: 'ergo', titulo: 'Intervalos no ergómetro',
        detalhe: '8 min aquecimento · 5 × (3 min forte / 2 min leve) · 5 min retorno à calma. Ski Erg, remo ou bicicleta.',
        passadeira: 'Escolhe um split que consigas repetir em TODOS os blocos. Se o último for mais lento que o primeiro, saíste rápido de mais.',
      },
      PT('2026-10-01'),
      DESC('2026-10-02'),
      DESC('2026-10-03'),
      {
        data: '2026-10-04', tipo: 'longa', titulo: 'Corrida longa — 7 km',
        distanciaKm: 7,
        detalhe: 'Tenta seguida. Se precisares, 14 min a correr / 1 min a andar.',
        passadeira: '7,0 km/h · inclinação 1% · ~60 min',
      },
    ],
  },
  {
    semana: 3,
    inicio: '2026-10-05',
    titulo: 'A longa passa para a rua',
    nota: 'A partir deste domingo, a corrida longa faz-se na rua. A prova é na estrada e precisas de aprender a gerir o ritmo sem máquina nenhuma a travar-te.',
    sessoes: [
      PT('2026-10-05'),
      {
        data: '2026-10-06', tipo: 'facil', titulo: 'Corrida fácil — 30 a 35 min',
        duracaoMin: 33,
        detalhe: 'Ritmo 8:15-8:45/km.',
        passadeira: '5 min a 6,0 · 33 min a 7,0 · 3 min a 5,5 · inclinação 1%',
      },
      {
        data: '2026-10-07', tipo: 'ergo', titulo: 'Intervalos no ergómetro',
        detalhe: '8 min aquecimento · 4 × (4 min forte / 2 min leve) · 5 min retorno à calma.',
        passadeira: 'Mesmo split em todos os blocos. Aponta-o e repete-o.',
      },
      PT('2026-10-08'),
      DESC('2026-10-09'),
      DESC('2026-10-10'),
      {
        data: '2026-10-11', tipo: 'longa', titulo: 'Corrida longa — 8 km',
        distanciaKm: 8,
        detalhe: 'Seguida, a ritmo fácil. Primeiros 2 km deliberadamente mais lentos — é aqui que se ensaia a prova.',
        passadeira: 'Na rua: 8:15-8:45/km. Percurso plano, evita cimento.',
      },
    ],
  },
  {
    semana: 4,
    inicio: '2026-10-12',
    titulo: 'Semana de alívio',
    nota: 'A longa desce de propósito para abrir espaço aos primeiros intervalos a correr. Não é preguiça, é planeamento.',
    sessoes: [
      PT('2026-10-12'),
      {
        data: '2026-10-13', tipo: 'facil', titulo: 'Corrida fácil — 30 min',
        duracaoMin: 30,
        passadeira: '5 min a 6,0 · 30 min a 7,0 · 3 min a 5,5 · inclinação 1%',
      },
      {
        data: '2026-10-14', tipo: 'intervalos', titulo: 'Primeiros intervalos a correr',
        detalhe: '10 min a trote · 5 × (2 min a 7:00/km / 2 min a andar) · 5 min a trote.',
        passadeira: '10 min a 6,7 · 5 × (2 min a 8,6 / 2 min a 5,5) · 5 min a 6,5 · inclinação 1%',
      },
      PT('2026-10-15'),
      DESC('2026-10-16'),
      DESC('2026-10-17'),
      {
        data: '2026-10-18', tipo: 'longa', titulo: 'Corrida longa — 6 km',
        distanciaKm: 6,
        detalhe: 'Fácil. Semana de alívio — resiste à tentação de fazer mais.',
        passadeira: 'Na rua: 8:15-8:45/km',
      },
    ],
  },
  {
    semana: 5,
    inicio: '2026-10-19',
    titulo: 'Construção',
    nota: 'A longa salta para 9 km. Avisa o PT que domingo é dia de corrida longa — a segunda-feira não pode ser um treino máximo de pernas.',
    sessoes: [
      PT('2026-10-19'),
      {
        data: '2026-10-20', tipo: 'facil', titulo: 'Corrida fácil — 35 min',
        duracaoMin: 35,
        passadeira: '5 min a 6,0 · 35 min a 7,0 · 3 min a 5,5 · inclinação 1%',
      },
      {
        data: '2026-10-21', tipo: 'intervalos', titulo: 'Intervalos',
        detalhe: '10 min a trote · 5 × (3 min a 7:00/km / 2 min a andar) · 5 min a trote.',
        passadeira: '10 min a 6,7 · 5 × (3 min a 8,6 / 2 min a 5,5) · 5 min a 6,5',
      },
      PT('2026-10-22'),
      DESC('2026-10-23'),
      DESC('2026-10-24'),
      {
        data: '2026-10-25', tipo: 'longa', titulo: 'Corrida longa — 9 km',
        distanciaKm: 9,
        detalhe: 'Fácil. Leva água.',
        passadeira: 'Na rua: 8:15-8:45/km · ~77 min',
      },
    ],
  },
  {
    semana: 6,
    inicio: '2026-10-26',
    titulo: 'A semana mais dura',
    nota: 'O domingo desta semana é o que decide a tua prova.',
    sessoes: [
      PT('2026-10-26'),
      {
        data: '2026-10-27', tipo: 'facil', titulo: 'Corrida fácil — 35 min',
        duracaoMin: 35,
        passadeira: '5 min a 6,0 · 35 min a 7,0 · 3 min a 5,5 · inclinação 1%',
      },
      {
        data: '2026-10-28', tipo: 'intervalos', titulo: 'Intervalos',
        detalhe: '10 min a trote · 6 × (3 min a 7:00/km / 90 s a andar) · 5 min a trote.',
        passadeira: '10 min a 6,7 · 6 × (3 min a 8,6 / 90 s a 5,5) · 5 min a 6,5',
      },
      PT('2026-10-29'),
      DESC('2026-10-30'),
      DESC('2026-10-31'),
      {
        data: '2026-11-01', tipo: 'longa', titulo: 'Corrida longa — 10 km',
        distanciaKm: 10,
        detalhe: 'Não é para fazer tempo. É para o teu corpo e a tua cabeça saberem, uma semana antes, que a distância é possível. Vai devagar de propósito.',
        passadeira: 'Ritmo fácil, 8:15-8:45/km · ~86 min',
      },
    ],
  },
  {
    semana: 7,
    inicio: '2026-11-02',
    titulo: 'Descarga e prova',
    nota: 'Vais sentir-te com energia a mais e tentada a treinar mais. Não o faças. A forma constrói-se na recuperação, não nos últimos sete dias.',
    sessoes: [
      PT('2026-11-02', 'PT leve — pede para aliviar as pernas'),
      {
        data: '2026-11-03', tipo: 'facil', titulo: 'Corrida fácil — 25 min',
        duracaoMin: 25,
        passadeira: '5 min a 6,0 · 25 min a 7,0 · 3 min a 5,5',
      },
      {
        data: '2026-11-04', tipo: 'intervalos', titulo: 'Activação',
        detalhe: '10 min a trote · 4 × (2 min a ritmo de prova / 2 min a andar) · 5 min a trote.',
        passadeira: '10 min a 6,7 · 4 × (2 min a 7,8 / 2 min a 5,5) · 5 min a 6,5',
      },
      DESC('2026-11-05', 'Descanso, ou PT muito leve sem pernas'),
      DESC('2026-11-06'),
      DESC('2026-11-07', 'Descanso ou 15 min de caminhada'),
      {
        data: '2026-11-08', tipo: 'prova', titulo: 'PROVA — 10 km',
        distanciaKm: 10,
        detalhe: 'km 1-2 a 8:00/km (mais lento de propósito) · km 3-7 a 7:40/km · km 8-10 a atacar. Se estiveres a ultrapassar pessoas nos primeiros 2 km, vais depressa de mais.',
        passadeira: 'Objectivo: 75 a 78 minutos, a correr do princípio ao fim.',
      },
    ],
  },
];

export const TODAS_SESSOES = PLANO.flatMap((s) => s.sessoes.map((x) => ({ ...x, semana: s.semana })));

export const TIPO_INFO = {
  pt: { label: 'PT', cor: 'roxo' },
  facil: { label: 'Fácil', cor: 'verde' },
  ergo: { label: 'Ergómetro', cor: 'azul' },
  intervalos: { label: 'Intervalos', cor: 'laranja' },
  longa: { label: 'Longa', cor: 'vermelho' },
  descanso: { label: 'Descanso', cor: 'cinza' },
  prova: { label: 'PROVA', cor: 'ouro' },
};
