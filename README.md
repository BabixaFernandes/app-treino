# 10K — app de treino

Plano de treino, registo de peso e contagem de calorias para os 10 km de **8 de Novembro de 2026**,
e para a segunda prova a **13 de Dezembro**.

Feita a primeira prova, a contagem decrescente vira-se para a segunda e o objectivo deixa de
ser a distância: passa a ser **bater o tempo da primeira por 2 a 3 minutos**. O alvo é calculado
a partir do tempo que ficou registado a 8 de Novembro, e não de um número decidido de antemão —
por isso só aparece depois de esse tempo estar lá.

É uma PWA: um site que o Android guarda no ecrã inicial com ícone próprio, abre em ecrã
inteiro sem barra do browser e funciona sem internet.

O plano vai de **21 de Setembro a 31 de Dezembro de 2026**: sete semanas até à primeira prova,
cinco de trabalho de ritmo até à segunda, e depois só os dias de PT até ao fim do ano.

## Ver a app no PC

```
npm start
```

Abre <http://localhost:4321>. Não precisa de instalar nada — o servidor não tem dependências.

## Publicar no GitHub Pages

O repositório local já está criado e com o primeiro commit feito. Faltam três passos, todos teus
porque envolvem a tua conta:

**1.** Em <https://github.com/new>, cria um repositório chamado `app-treino`.
Deixa-o **vazio** — sem README, sem .gitignore, sem licença.

**2.** No terminal, dentro desta pasta (substitui `UTILIZADOR` pelo teu nome de utilizador do GitHub):

```bash
git remote add origin https://github.com/UTILIZADOR/app-treino.git
git push -u origin main
```

**3.** No repositório, vai a **Settings → Pages**, e em *Source* escolhe **Deploy from a branch**,
com branch `main` e pasta `/ (root)`. Guarda.

Um ou dois minutos depois a app fica em:

```
https://UTILIZADOR.github.io/app-treino/
```

## Instalar no telemóvel

**Android (Chrome):** abre o endereço → menu ⋮ → **Adicionar ao ecrã principal**.

**iPhone (Safari):** abre o endereço **no Safari** → botão Partilhar (o quadrado com a seta)
→ **Adicionar ao ecrã principal**. Tem de ser o Safari; noutros browsers do iPhone a opção
pode não aparecer.

Da primeira vez que abres, a app pergunta os teus alvos e tem uma calculadora que os estima
a partir do peso, altura, idade e nível de actividade. Cada pessoa tem os seus, no seu
dispositivo.

## Podem usá-la várias pessoas?

Sim. Cada dispositivo guarda os seus próprios dados, sem qualquer ligação entre eles —
mesma app, alvos e registos independentes. O plano de treino das 7 semanas é que é comum
a todos.

## Quando a semana muda

O plano é um ponto de partida, não uma jaula. Cada sessão tem dois botões:

| Botão | O que faz |
|---|---|
| ✎ | Editar: dia, tipo, título, indicações, ritmos, distância — e apagar a sessão |
| ⇄ | Trocar de dia com outra sessão da mesma semana |

No fim de cada semana há ainda **+ Acrescentar sessão**, para os treinos que o plano não
previu. Um dia pode ficar com duas sessões.

Apagar uma sessão do plano transforma-a em **dia de descanso** — o dia não fica vazio, e a
sessão volta com o repor. Uma sessão acrescentada por ti desaparece mesmo.

As confirmações usam o diálogo da própria app e não o `confirm()` do browser, que em PWA
instalada há contextos em que simplesmente não aparece — e um botão que não faz nada é pior
do que não ter botão.

O que fica registado (distância, tempo, esforço, dor na canela) **acompanha a sessão**, não
o dia: o registo é guardado com a data original do plano, e as alterações ficam à parte, em
mapas próprios (`ajustes`, `edicoes`, `removidas`, `extras`). Por isso é que
**repor o plano original** devolve a semana inteira ao sítio — dias, conteúdos, sessões
apagadas e sessões acrescentadas — sem tocar nos registos das sessões do plano.

Há dois avisos, que assinalam mas não impedem:

- **tira a longa de domingo** — a corrida longa ao domingo é a regra fixa do plano.
- **dois treinos duros seguidos** (ou no mesmo dia) — aparece no topo da semana.

A prova não se edita nem se move.

## Contagem dos treinos de PT

Cada sessão de PT mostra em que número do mês vai — *treino 5 de 8* — e no fim do
separador há um resumo por mês que assinala quando um mês foge ao pacote (*+1*, *-1*).

Duas regras que não são óbvias:

- **A contagem segue o dia que a sessão tem no plano, não o dia em que foi feita.**
  Um PT marcado para 1 de Outubro que se antecipe para 30 de Setembro continua a
  descontar do pacote de Outubro.
- **Um mês que o plano não cubra até ao fim não é comparado com o pacote** — diz apenas
  quantos tem. É o caso de Novembro, em que o plano acaba no dia da prova.

O tamanho do pacote e quantos PT já tinhas feito antes de o plano começar definem-se
nas definições. São dados teus, por isso ficam no dispositivo e não no código.

## Cópias de segurança

Os dados ficam guardados no próprio dispositivo (`localStorage`), não numa nuvem. Isto quer dizer:

- Cada dispositivo tem os seus dados. Não há sincronização automática entre o telemóvel e o PC.
- **Se limpares os dados de navegação do Chrome, perdes o histórico da app.**

Por isso há dois botões no canto superior direito:

| Botão | O que faz |
|---|---|
| ⤓ | Descarrega um ficheiro `.json` com tudo |
| ⤒ | Restaura a partir desse ficheiro |

Vale a pena exportar uma vez por semana — ao domingo, depois da corrida longa.

## Estrutura

```
index.html              página única
app.css                 estilos
manifest.webmanifest    metadados da PWA (ícone, nome, cores)
sw.js                   service worker — faz a app funcionar offline
servidor.js             servidor estático para desenvolvimento
js/
  app.js                navegação entre separadores e cópias de segurança
  store.js              leitura e escrita de dados (ponto único)
  data/plano.js         as 7 semanas de treino (sem dados pessoais)
  data/alimentos.js     lista inicial de alimentos, por 100 g
  vistas/treinos.js     separador Treinos
  vistas/peso.js        separador Peso
  vistas/comida.js      separador Comida
  vistas/definicoes.js  alvos e calculadora de calorias
```

Nenhum dado pessoal está no código. Peso, altura, idade e alvos são introduzidos na app
e ficam apenas no dispositivo — o repositório pode ser público sem problema.

Toda a leitura e escrita de dados passa por `store.js`. Acrescentar sincronização na
nuvem mais tarde mexe só nesse ficheiro.

Ao alterar ficheiros, sobe a constante `VERSAO` em `sw.js` — caso contrário os dispositivos
continuam a servir a versão antiga que está em cache.

## Por fazer (fase 2)

- Ementas semanais e lista de compras gerada a partir delas
- Sincronização entre telemóvel e PC
