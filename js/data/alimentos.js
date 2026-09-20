// Lista inicial de alimentos. Valores por 100 g (ou por 100 ml nos líquidos).
// Fonte: valores médios de tabelas de composição de alimentos.
// Podes editar, apagar e acrescentar os teus dentro da app.

export const ALIMENTOS_BASE = [
  // Carne e peixe
  { nome: 'Peito de frango grelhado', kcal: 165, p: 31, h: 0, g: 3.6, cat: 'Carne e peixe' },
  { nome: 'Peito de peru grelhado', kcal: 135, p: 29, h: 0, g: 1.7, cat: 'Carne e peixe' },
  { nome: 'Lombo de porco grelhado', kcal: 143, p: 21, h: 0, g: 6, cat: 'Carne e peixe' },
  { nome: 'Carne de vaca magra', kcal: 217, p: 26, h: 0, g: 12, cat: 'Carne e peixe' },
  { nome: 'Atum em água (escorrido)', kcal: 116, p: 26, h: 0, g: 1, cat: 'Carne e peixe' },
  { nome: 'Bacalhau cozido', kcal: 105, p: 23, h: 0, g: 1, cat: 'Carne e peixe' },
  { nome: 'Salmão grelhado', kcal: 208, p: 20, h: 0, g: 13, cat: 'Carne e peixe' },
  { nome: 'Sardinha grelhada', kcal: 208, p: 25, h: 0, g: 11, cat: 'Carne e peixe' },
  { nome: 'Camarão cozido', kcal: 99, p: 24, h: 0, g: 0.3, cat: 'Carne e peixe' },
  { nome: 'Pescada cozida', kcal: 90, p: 18, h: 0, g: 1.5, cat: 'Carne e peixe' },

  // Ovos e lacticínios
  { nome: 'Ovo inteiro', kcal: 155, p: 13, h: 1.1, g: 11, cat: 'Ovos e lacticínios' },
  { nome: 'Clara de ovo', kcal: 52, p: 11, h: 0.7, g: 0.2, cat: 'Ovos e lacticínios' },
  { nome: 'Iogurte grego natural', kcal: 59, p: 10, h: 3.6, g: 0.4, cat: 'Ovos e lacticínios' },
  { nome: 'Skyr natural', kcal: 63, p: 11, h: 4, g: 0.2, cat: 'Ovos e lacticínios' },
  { nome: 'Queijo fresco magro', kcal: 70, p: 11, h: 2, g: 2, cat: 'Ovos e lacticínios' },
  { nome: 'Requeijão', kcal: 174, p: 11, h: 3, g: 13, cat: 'Ovos e lacticínios' },
  { nome: 'Queijo flamengo', kcal: 330, p: 25, h: 1, g: 25, cat: 'Ovos e lacticínios' },
  { nome: 'Leite meio-gordo', kcal: 46, p: 3.3, h: 4.8, g: 1.6, cat: 'Ovos e lacticínios' },
  { nome: 'Proteína whey (pó)', kcal: 400, p: 80, h: 8, g: 5, cat: 'Ovos e lacticínios' },

  // Hidratos
  { nome: 'Arroz cozido', kcal: 130, p: 2.7, h: 28, g: 0.3, cat: 'Hidratos' },
  { nome: 'Massa cozida', kcal: 158, p: 5.8, h: 31, g: 0.9, cat: 'Hidratos' },
  { nome: 'Batata cozida', kcal: 87, p: 2, h: 20, g: 0.1, cat: 'Hidratos' },
  { nome: 'Batata doce cozida', kcal: 90, p: 2, h: 21, g: 0.1, cat: 'Hidratos' },
  { nome: 'Pão de mistura', kcal: 250, p: 9, h: 48, g: 2.5, cat: 'Hidratos' },
  { nome: 'Pão integral', kcal: 247, p: 10, h: 41, g: 3.4, cat: 'Hidratos' },
  { nome: 'Flocos de aveia', kcal: 380, p: 13, h: 60, g: 7, cat: 'Hidratos' },
  { nome: 'Grão-de-bico cozido', kcal: 164, p: 9, h: 27, g: 2.6, cat: 'Hidratos' },
  { nome: 'Feijão cozido', kcal: 132, p: 9, h: 24, g: 0.5, cat: 'Hidratos' },
  { nome: 'Lentilhas cozidas', kcal: 116, p: 9, h: 20, g: 0.4, cat: 'Hidratos' },

  // Fruta e legumes
  { nome: 'Banana', kcal: 89, p: 1.1, h: 23, g: 0.3, cat: 'Fruta e legumes' },
  { nome: 'Maçã', kcal: 52, p: 0.3, h: 14, g: 0.2, cat: 'Fruta e legumes' },
  { nome: 'Laranja', kcal: 47, p: 0.9, h: 12, g: 0.1, cat: 'Fruta e legumes' },
  { nome: 'Abacate', kcal: 160, p: 2, h: 9, g: 15, cat: 'Fruta e legumes' },
  { nome: 'Brócolos cozidos', kcal: 34, p: 2.8, h: 7, g: 0.4, cat: 'Fruta e legumes' },
  { nome: 'Espinafres', kcal: 23, p: 2.9, h: 3.6, g: 0.4, cat: 'Fruta e legumes' },
  { nome: 'Alface', kcal: 15, p: 1.4, h: 2.9, g: 0.2, cat: 'Fruta e legumes' },
  { nome: 'Tomate', kcal: 18, p: 0.9, h: 3.9, g: 0.2, cat: 'Fruta e legumes' },
  { nome: 'Cenoura', kcal: 41, p: 0.9, h: 10, g: 0.2, cat: 'Fruta e legumes' },
  { nome: 'Courgette', kcal: 17, p: 1.2, h: 3.1, g: 0.3, cat: 'Fruta e legumes' },

  // Gorduras e extras
  { nome: 'Azeite', kcal: 884, p: 0, h: 0, g: 100, cat: 'Gorduras e extras' },
  { nome: 'Amêndoas', kcal: 579, p: 21, h: 22, g: 50, cat: 'Gorduras e extras' },
  { nome: 'Manteiga de amendoim', kcal: 588, p: 25, h: 20, g: 50, cat: 'Gorduras e extras' },
  { nome: 'Mel', kcal: 304, p: 0.3, h: 82, g: 0, cat: 'Gorduras e extras' },
  { nome: 'Gel energético (1 un. ~40 g)', kcal: 250, p: 0, h: 62, g: 0, cat: 'Gorduras e extras' },
];

export const REFEICOES = ['Pequeno-almoço', 'Meio da manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];
