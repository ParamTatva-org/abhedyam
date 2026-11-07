# Revisão — Mantra LUS

*Análise do programa de pesquisa LUS · corpus v1.9 (Fase VII)*

Repositório analisado: github.com/lonelyachemist-arch/Mantra · Comparado contra: github.com/andresanemic/lore-plugin · Data: 3 de agosto de 2026 · Autor da análise: Andrés Peña (LUS / Logos)

# 1. Estado teórico reconstruído

**O que o corpus afirma hoje.** A unidade da LUS é o Entre (relação com interdependência e finalidade). O Lore é experiência relacional destilada em critério transferível, de valor **teleológico**: vale em respeito à finalidade do Entre que o produziu. Sua função operacional é aumentar o IME — continuidade contextual, densidade semântica, capacidade de destilação. O Estado IV (colapso) tem um sintoma nomeado: *«o Lore deixa de ser consultado»*.

**O que está em aberto.** H01 (n=2), H02 (n=0), H05 (n=0 +1 parcial), H06 (n=1), H07 (n=0 +1 análogo), H08 (n=1). Débito teórico prioritário: a **fenda** — teoria do fenômeno ou critério do método? —, quatro aparições. v2.0 exige operacionalizar o IME.

**Fase ativa.** VII — Casos de estudo, corpus v1.9 (2026-07-28).

# 2. O que este repositório faz

Lonelyachemist-arch/Mantra é o lore-plugin, **copiado e modificado por um terceiro**. Não é um fork do GitHub: o primeiro commit (2026-07-19) é *«Add files via upload»* — os arquivos foram subidos à mão, por isso a interface do GitHub não mostra vínculo com andresanemic/lore-plugin. Autoria de todos os commits: Lonely Alchemist.

Comparação arquivo por arquivo contra a cópia local do lore-plugin:

| Arquivo | Estado |
|---|---|
| README, USAGE_es/en, REFERENCE_es/en, MIGRATION_es/en, LICENSE, plugin.json, marketplace.json | **Idênticos** (continuam dizendo andresanemic / lore / v1.0.3) |
| create-area, create-project, transmute-lore | **Idênticos** |
| using-lore/SKILL.md | +48 linhas: seção *Manual Decryption* |
| save-to-lore/SKILL.md | Passo 1 reescrito: cifrar antes de guardar |
| abhedyam-helper.js, decrypt-helper.js | **Novos** |

**A mudança, em uma frase:** o Lore deixa de ser escrito em Markdown legível e passa a ser guardado **cifrado** com @abhedyam/sdk (criptografia pós-quântica lattice/LWE N=768, em modo METERED — esteganografia que produz um «poema em sânscrito»). Para ler, o usuário cola a chave privada no chat e a skill decifra em memória.

## 2.1 Estado técnico: não funciona

Não é uma opinião; é verificável:

1.  **Falta o binário.** @abhedyam/sdk é só um binding koffi; procura abhedya_ffi.dll em ../../target/release ou no PATH. Não está no npm nem no repositório. koffi.load() lança exceção na primeira linha.
2.  **API mal usada.** O helper chama sdk.encrypt({publicKey, data, mode}) e sdk.decrypt({secretKey, data}); o SDK espera argumentos **posicionais** (pk, msg, mode). Além disso lê result.ciphertext quando encrypt devolve um Buffer. Com o .dll presente continuaria quebrado.
3.  **Perda de dados garantida** (abhedyam-helper.js:17-26). Se public-key.pem já existe, faz um keygen() novo, cifra com a chave pública **velha** e entrega ao usuário a chave secreta **nova**. Não correspondem. O Lore fica irrecuperável a partir do segundo guardado.
4.  **Rota errada.** path.join(\_\_dirname, '../../lore/...') desde skills/save-to-lore/ aponta para a pasta do **plugin**, não para a do projeto. Destruói o roteamento projeto↔área, que é o coração da skill.
5.  **Sobrescreve em vez de acumular.** writeFileSync substitui o lore/&lt;módulo&gt;.md inteiro; o original **acumula** entradas. Cada Pista nova apaga as anteriores.
6.  **Frontmatter quebrado** em save-to-lore/SKILL.md: abre com ---, usa Name: capitalizado e fecha o bloco fora de lugar. Claude Code provavelmente nem carrega a skill.
7.  **Higiene.** node_modules/ commitado (132 de 169 arquivos trackeados), sem .gitignore, e uma cópia aninhada lore-plugin-main/lore-plugin-main/ com uma versão distinta das mesmas duas skills.

# 3. Análise (Logos)

## 3.1 A fortaleza — real, e há que reconhecê-la

Mantra toca uma **fenda genuína do corpus**: a LUS trata o Lore como *patrimônio* e fala muito de **transferibilidade**, mas **não diz nada sobre titularidade nem confidencialidade**. Se o critério é o ativo, de quem ele é? Pode-se compartilhar o artefato sem entregar o critério?

E aqui está o dado que importa: **essa pergunta já foi interpelada dentro do programa**. O registro de hipóteses anota que o 2026-07-12 um terceiro caminho independente — *«que sentido tem a criptografia se o objetivo é compartilhar o Lore?»* — desembocou em H05. Alguém externo, sem ver o corpus, chegou à mesma pergunta em onze dias. Isso não valida a implementação, mas é sinal de que a fenda não é do autor: está no objeto.

## 3.2 A causa raiz da falha conceitual

Não é que cifrar seja ruim. É que **cifrar o Lore contradiz a definição operacional do Lore**.

- O Lore não é um arquivo: é *o que participa de uma decisão futura*. O corpus o diz como axioma: *«a experiência só cria valor quando pode voltar a participar de uma decisão futura»*.
- A consulta preventiva do Prompt Mestre (*«antes de propor uma solução, leia nosso Lore»*) só funciona se for **barata e automática**.
- Um Lore cifrado exige: identificar o arquivo → pedir a chave → que o humano a cole → decifrar → ler. A consulta deixa de ser um reflexo e passa a ser um **trâmite com humano no laço**.

E pela Teoria Operacional do Entre: isso ataca de frente a **continuidade contextual** e a **densidade semântica**, as duas variáveis que definem o IME. O sintoma do Estado IV é *«o Lore deixa de ser consultado»*. O cifrado não o proíbe: **o encarece**. E o caro não se consulta.

Pior: reproduz-se exatamente o padrão do Caso 05 / H08 — um artefato de preservação que existe, está indexado, é obrigatório... e não participa de decisão nenhuma. Ali o resultado não é observado: é **previsível por construção**.

## 3.3 A inconsistência estrutural

O corpus fixa a fronteira **capacidade** (se usa) vs. **critério** (se arbitra) — Caso 03, H06. Aqui não houve arbitragem: houve **adoção**. Importou-se uma capacidade (PQC esteganográfica) sem submetê-la à finalidade do Entre receptor, e o resultado é uma capacidade que **anula a finalidade do artefato que a hospeda**. É o contraexemplo perfeito de por que o corpus exige arbitrar e não adotar.

## 3.4 Um detalhe que não é menor

A skill instrui o usuário a **colar a chave privada no chat**. Essa chave entra no contexto do modelo e no histórico da sessão. Um fluxo cujo propósito declarado é proteger o critério acaba expondo a única coisa cuja exposição é irreversível.

## 3.5 Sobre a atribuição

A licença MIT permite o fork, e o arquivo LICENSE com o copyright original está conservado — isso está em regra. O que **não** há: declaração de mudanças, README próprio nem renomeado. plugin.json segue publicando "name": "lore", "version": "1.0.3", "author": "andresanemic".

Ou seja: quem instalasse o Mantra instalaria um plugin **que diz ser o original, na mesma versão**, com save-to-lore quebrado e destrutivo. Esse é o risco concreto, e não é teórico: a perda de dados do ponto 3 é determinística.

# 4. O que faria falta para a ideia sobreviver

A intuição de fundo — o critério como ativo com dono — merece ser trabalhada. A implementação, como está, não. Três condições mínimas:

8.  **Arrumar o que rompe dados antes de tudo.** O desalinho de chaves (abhedyam-helper.js:17-26) e a sobrescrita do módulo destroem Lore de forma irreversível. Isso vai primeiro, com ou sem cifrado.
9.  **Separar o artefato do canal.** O Lore deve continuar sendo Markdown legível **em repouso local**; se há que proteger algo, protege-se **ao compartilhá-lo** (o repositório, o transporte), não no ponto onde o agente o consulta. Cifrar em trânsito não custa IME; cifrar em repouso sim.
10. **Renomear e declarar a derivação.** plugin.json e marketplace.json com nome próprio, versão própria e uma nota de derivação no README. O MIT permite; a rastreabilidade exige.

*O fundo do desacordo é simples: um Lore que precisa ser decifrado para ser consultado deixa de ser Lore e passa a ser um arquivo. A pergunta que o Mantra levanta é boa. A resposta que ele propõe cancela aquilo que pergunta por proteger.*
