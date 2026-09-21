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

## O separador Mês

É o único ecrã onde as quatro coisas que a app guarda por data — treinos, peso, comida e ciclo —
aparecem no mesmo eixo. Os outros separadores respondem bem a *o que faço hoje*; este responde a
*como é que este mês está*, e é onde os padrões aparecem: o ritmo semanal das sessões, os dias sem
registo, as fases do ciclo ao longo do bloco.

Cada dia mostra:

| Marca | O que é |
|---|---|
| Ponto colorido | Uma sessão, na cor do tipo. Apagado se ainda não foi feita, com ✓ se foi |
| Fundo vermelho e ⚠ | Dor na canela registada nesse dia |
| Cor por baixo | A fase do ciclo — **tracejada** quando é projectada em vez de medida |
| Ponto azul / verde no topo | Houve pesagem / houve comida registada |

Tocar num dia abre-o: a fase e o dia do ciclo, as sessões com o que ficou registado (tocar numa
abre o mesmo diálogo de registo do separador Treinos), um campo para o peso daquele dia, e os
totais de comida contra os alvos.

A navegação limita-se aos meses que o plano cobre — Setembro a Dezembro — em vez de deixar
navegar para o vazio.

A dor na canela marca **o dia inteiro** e não só o ponto da sessão. Num ponto de 11 px ninguém a
via, e é o sinal que está acima de tudo na hierarquia do plano: um mês onde se vê logo que houve
três dias com dor vale mais do que qualquer média.

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

## Passadeira ou rua

No topo do separador há um interruptor **Passadeira / Rua**. A prescrição de cada sessão é
escrita uma só vez, em velocidades de passadeira, e converte-se para pace quando se escolhe
a rua:

```
🏃  5 min a 6,0 · 33 min a 7,0 · 3 min a 5,5 · inclinação 1%
🛣️  5 min a 10:00/km · 33 min a 8:34/km · 3 min a 10:55/km
```

A inclinação desaparece no modo rua, onde não quer dizer nada. A escolha fica guardada.

Nas semanas 9 a 12 o plano diz *ritmo de prova*, que não é um número decidido de antemão:
é o que ela fizer a 8 de Novembro. Essas sessões escrevem-se com o marcador `{prova}`, e a
app substitui-o pelo ritmo que sai do tempo registado na primeira prova — em km/h ou em
min/km, conforme o modo. O `{alvo}` faz o mesmo para a segunda prova, mas com os 2 a 3
minutos a ganhar já descontados. Enquanto não houver tempo registado, dizem-no em vez de
inventar um número.

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

## Balanço da semana

Aparece no topo da semana **a decorrer** — *"Semana 1, até agora"* — e fica lá como balanço
fechado quando a semana acaba. Nas semanas futuras não aparece nada.

Numa semana a meio só contam os dias que já passaram, e uma sessão só falta depois de o dia
acabar: a de hoje ainda está a tempo. É de propósito que aparece antes do fim — saber à quarta
que a corrida de terça saiu rápida dá tempo de corrigir; saber na segunda seguinte não dá nada.

O que mostra: sessões feitas, a longa, o ritmo
médio das corridas fáceis, registos de dor na canela, a média do peso contra a da semana
anterior, e a média de calorias e proteína dos dias registados.

**Os números estão colapsados; o recado não.** Colapsar tudo mataria a razão de existir — era
preciso abrir o cartão para descobrir que valia a pena abri-lo. Assim uma semana boa ocupa duas
linhas e uma semana com problema grita à mesma.

Vêm **no máximo dois recados**, por esta ordem de prioridade:

1. **Dor na canela** — passa à frente de tudo, com a regra de paragem do plano.
2. **A longa não feita** — a única sessão que não se salta.
3. **Fáceis corridas depressa de mais** — acima de 8:05/km, ou seja o limite de 8:15 com
   10 s de tolerância, para o aviso não disparar por causa do GPS.
4. **A média do peso parada** face aos −0,4 kg/semana.
5. **Proteína abaixo de 90% do alvo** — e só com 5 ou mais dias registados; com menos,
   diz que não tem dados em vez de tirar conclusões.

Não há modelo nenhum por trás disto: são as regras do plano aplicadas aos registos, e corre
offline como o resto da app. Para uma leitura a sério há o botão **Copiar**, que põe a semana
inteira em texto — sessão por sessão — para colar numa conversa com o Claude e pedir o que
umas regras não conseguem dar. Se o telemóvel não deixar copiar, abre o texto já selecionado.

## Ciclo

O separador **Ciclo** tem dois botões — *o período começou hoje* e, enquanto houver um período
aberto, *o período acabou hoje* — e, opcionalmente, dores / cansaço / fluxo em três níveis nos
últimos três dias. Daí a app deriva a fase e mostra-a como etiqueta em cada sessão de treino,
com o dia do ciclo no tooltip.

Nada é assumido quando pode ser medido:

- **A duração do ciclo** sai da média dos ciclos dela, não dos 28 dias por omissão — assumir 28
  é um dos erros metodológicos que a literatura aponta. Sem dois períodos registados usa 28 e di-lo.
- **A duração da menstruação** sai dos períodos que tenham fim marcado. Sem nenhum, usa 5 dias e
  a fase aparece com asterisco. Marcado o fim, a menstruação passa a medida e o asterisco cai —
  e a fronteira entre menstruação e folicular muda em consequência.
- As fases **pós-menstruais levam sempre asterisco**, porque sem temperatura ou testes a ovulação
  é estimada e apresentá-la como facto seria desonesto.

Na lista de períodos, a duração é clicável para reabrir um período fechado por erro, e mostra
quantos dias desse ciclo tiveram sintomas fortes. O `×` apaga o registo todo.

**Marcar noutra data.** Os botões rápidos são para hoje, mas há um campo de data para os dias
esquecidos — e é importante que exista: tudo o que a app calcula sai dessa data, e um início
errado por dois dias desloca as fases todas. Marcar um início a menos de 10 dias de um já
registado **corrige-o** em vez de criar outro período; sem essa regra, corrigir uma data deixava
dois inícios juntos e a média do ciclo passava a contar um intervalo de dois dias.

**Previsão.** O cartão do topo diz quando é previsto o próximo período, e um cartão à parte diz em
que fase caem as provas de 8 de Novembro e 13 de Dezembro — projectado a partir da média, e
marcado como projecção. Serve para saber com o que contar, não para mudar o plano.

**Calendário.** O ciclo actual aparece dia a dia, com a fase por baixo de cada dia e a cor do
fundo a marcar sintomas leves ou fortes. Qualquer dia passado é tocável para registar em atraso.

**Irregularidade.** Quando o ciclo mais curto e o mais longo diferem 5 dias ou mais, a app diz o
intervalo real e avisa que as fases e a previsão são palpites largos — em vez de apresentar uma
média com a mesma cara de sempre.

### Como as médias se comportam ao longo do tempo

As três médias — duração do ciclo, duração do período, e a tabela por fase — recalculam sobre
**tudo** o que está registado, sem janela nem pesos. Com poucos ciclos é o correcto; se um dia
houver um ano de dados e um mês estranho estiver a distorcer, aí vale a pena passar a usar só os
últimos seis.

Mas as fases de um ciclo **não** saem da média global. Saem da duração real desse ciclo, que é o
intervalo até ao período seguinte:

- Enquanto um ciclo está **aberto** (ainda não veio o período seguinte), as fases dele são
  estimadas pela média e **vão ser revistas** quando ele fechar. Se o ciclo acabar por durar 35
  dias em vez de 28, a ovulação passa do dia 14 para o 21 e uma sessão reclassifica-se — porque a
  estimativa estava errada, não porque a app mudou de ideias.
- Um ciclo já **fechado** tem duração conhecida e as fases dele **nunca mais mudam**.

Antes esta distinção não existia: todas as fases saíam da média global, e cada período novo
reclassificava sessões de meses atrás sem ninguém tocar em nada.

### Porque é que a app não muda os treinos por causa da fase

Porque a evidência não o sustenta. A meta-análise de referência
([McNulty et al., *Sports Medicine* 2020](https://pubmed.ncbi.nlm.nih.gov/32661839/)) encontra um
efeito médio **trivial** da fase no desempenho, com grande sobreposição entre fases; uma
[revisão de 2025 restrita a estudos de metodologia exigente](https://journals.physiology.org/doi/full/10.1152/japplphysiol.00223.2025)
encontra efeitos em 58% dos estudos mas com direcção e magnitude inconsistentes. O que é
consistente é a variabilidade individual.

Logo: a app **mede e revela o padrão dela**, e não aplica regras de manual. A secção
*O teu padrão* compara ritmo e esforço médios por fase, e **só aparece com dois ciclos
completos** — antes disso diz quantos faltam, em vez de produzir um número que a levaria a
mudar treinos sem motivo.

Essa comparação usa **só as corridas fáceis**, e só com duas ou mais na mesma fase. Juntar longas
e intervalos no mesmo «ritmo médio» dava um número que refletia a distribuição do calendário —
que tipo de sessão calhou em que fase — e não a fase. As fáceis têm todas o mesmo ritmo prescrito
e duração parecida, por isso uma diferença entre fases é sinal. A coluna *Fáceis* mostra
`2 de 3` para o tamanho da amostra ficar à vista.

A única coisa que o balanço semanal diz sobre o ciclo é contexto, e só quando houve falhas ou
dor na canela **e** dias marcados como fortes: serve para uma semana difícil não ser lida como
perda de forma.

## O separador Comida

O registo alimentar não se abandona por falta de funcionalidades — abandona-se por cansaço. Cada
entrada eram seis passos, e num dia de dez itens isso são setenta interacções. Tudo aqui vai no
sentido de **menos toques por dia**:

**Porções.** Cada alimento sabe o que é na vida real — um ovo são 55 g, uma fatia de pão 35 g, uma
lata de atum 80 g. Escreves `2 ovos` em vez de 110 g, e a app guarda gramas por baixo. O diário
mostra as duas coisas: *2 ovos · 110 g*. Alimentos criados por ti podem ter porção também.

Os plurais irregulares estão escritos nos dados (`colheres de sopa`, `requeijões`,
`batatas médias`), porque o `+s` ingénuo dava *colher de sopas*. E o campo diz
*Quantidade (fatias)* em vez de *quantas/quantos* — o género de cada porção não é adivinhável.

**Mais usados primeiro.** O diálogo de adicionar abre com os alimentos que mais usaste, ordenados
por frequência. Sem isso, o iogurte de todas as manhãs ficava ao mesmo nível do bacalhau que
comeste uma vez.

**Copiar um dia.** Um toque traz as entradas de outro dia, com os totais à vista para escolheres
qual. Come-se parecido de um dia para o outro, e isto elimina o trabalho de dias inteiros.

**Refeição adivinhada pela hora.** Às 13h o campo vem em *Almoço*.

**Editar uma entrada.** Tocar numa linha do diário abre-a — e abre **na unidade em que foi
registada**. Abrir sempre em gramas era a maneira mais fácil de trocar «3 fatias» por «3 gramas»
sem se dar por isso.

**Refeições guardadas.** O botão *guardar* no canto de cada refeição guarda-a inteira; depois
aplica-se a qualquer refeição do dia com um toque. É também o alicerce da fase 2, porque uma
ementa é uma sequência de refeições guardadas.

**Média da semana.** Calorias e proteína médias dos dias registados, que é o número que decide se
ajustas as calorias — não o total de um dia. Conta só os dias com registo, e com menos de quatro
di-lo em vez de apresentar uma média de três dias como se fosse de sete.

O alvo de calorias **não muda nos dias de treino**, de propósito: o plano fixa 2100 kcal todos os
dias, e um alvo que se move sozinho tira a única referência estável que há.

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
  ciclo.js              fases do ciclo e análise por fase
  data/plano.js         as 7 semanas de treino (sem dados pessoais)
  data/alimentos.js     lista inicial de alimentos, por 100 g
  vistas/treinos.js     separador Treinos
  vistas/peso.js        separador Peso
  vistas/comida.js      separador Comida
  vistas/definicoes.js  alvos e calculadora de calorias
  vistas/balanco.js     balanço da semana
  vistas/ciclo.js       separador Ciclo
  vistas/calendario.js  separador Mês
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
