# abhedya-chhandas 1.0.24 — Auditoria do motor chhandas

## 1. Metodologia e Validação Empírica

**Metodologia:** A metodologia adotada foi híbrida. A auditoria desse crate foi conduzida por IA (OpenCode), que foi utilizada para mapear e documentar as causas estruturais da falha. No entanto, a premissa desta auditoria partiu da comprovação empírica: testes de integração e execução do código, realizados previamente, comprovaram que o crate não rodava como deveria. A IA foi utilizada para explicar tecnicamente o "porquê" da falha que já havia sido observado na prática.

**Sessão de testes:** O modo métrico foi testado do dia **2 de Julho ao dia 8 de Agosto de 2026**. Essa auditoria **não questiona, reinterpreta ou reabre** essa sessão: ela existe unicamente para **mapear e documentar as causas** da falha observada. Os testes produziram o dado; esse documento organiza o porquê dele.

**Consistência da falha no Core**: A falha foi observada de forma consistente em quatro linguagens que utilizam o core em Rust (Python, JavaScript, WASM e Go). Isso confirma que o erro é estrutural no core do projeto, e não um erro de uma implementação específica.

**Sobre o teste prático — integração real no lore-plugin:** Há um registro de um teste concreto, além das linguagens de programação em que Abhedyam está disponível: o `Revisão-Mantra LUS.md` (03-08-2026) documenta a tentativa do fork **Mantra** de pôr o Abhedyam em uso real — cifrar o Lore do plugin com `@abhedyam/sdk` (mesma árvore N=768/Q=3329) **no modo METERED**, exatamente o modo métrico analisado aqui. Essa integração constituiu um teste prático do modo métrico, em outro ambiente; sua falha está registrada na revisão LUS na camada JS e no complemento deste projeto na camada Rust/PQC. O documento da revisão, sem conhecer os erros profundos do código, ofereceu caminhos para uma integração real; **essa análise registra o teste e não valida esses caminhos** — a seção 3 explica por quê.

**Procedência:** O pacote é o publicado no crates.io (`Cargo.toml` normalizado pela registry, crate `abhedya-chhandas 1.0.24`, ParamTatva-org/abhedyam). O `src/lib.rs` local é idêntico ao analisado em `abhedya-kem 1.0.24 - Auditoria.md` (seção 1) — nenhuma divergência entre fonte local e publicada.


## 2. O que o modo métrico promete e quem o consome

`encode_vector(vec, use_meter = true)` (`lib.rs:75-88`) promete: valores → sílabas sânscritas organizadas em **Anushtubh** (yati `।` a cada 8 sílabas), com pesos Laghu/Guru aplicados pelo `to_sanskrit`/`get_matra_weight`. O consumidor direto do espaço numérico subjacente é o `abhedya-kem` em `EncryptionMode::Metered`, que impõe "Even=Laghu, Odd=Guru" sobre `u % 16`.

Para o modo métrico ser funcional, três condições precisam valer simultaneamente:

1. **Unicidade:** cada valor codifica uma sílaba diferente (injetividade), pois o verso é o veículo dos dados;
2. **Reversibilidade:** o decoder restaura os valores, inclusive com yati presente;
3. **Coerência fonética:** o padrão numérico imposto corresponde ao peso real das sílabas geradas.

Nenhuma das três vale no original. As causas, em ordem causal:

### Causa 1 — o encoder apaga informação antes de qualquer transmissão (não injetivo)

`lib.rs:51-61`: os 8 índices "Laghu" (`m_idx 0..8`) são comprimidos em ciclo de **5**, e os 8 "Guru" em ciclo de **11**:

- `m_idx 0` e `m_idx 5` → ambos produzem `"a"` (colisão); idem `1/6 → "ā"`, `2/7 → "i"`.
- Pelo menos **3/16 ≈ 18,75% de todo o domínio** colide na codificação.

Consequência: o verso gerado em modo métrico **não carrega o dado** — ele carrega uma soma apagada dele. Nenhum decode, por mais robusto, pode restaurar o que o encoder não registrou. Esse é o defeito raiz e é anterior a qualquer camada de transporte.

### Causa 2 — codificação colidente e decodificação sempre "para baixo"

O decoder (`lib.rs:90-113`) varre `c` por fora, `m_idx` por dentro e devolve **o primeiro par** cuja sílaba construída casa com o token. Como as colisões da Causa A produzem strings idênticas de `m_idx` distintos, o decode retorna sistematicamente o **menor** `m_idx`:

- Um valor com `m_idx = 5` (`"ka"`) decodifica como `m_idx = 0` (`v' = c·16 + 0 ≠ v`).
- O roundtrip falha em toda a família das colisões — erro **sistemático e direcional** (nunca para cima), o que desalinha qualquer análise de bit a bit sobre dados restaurados.

E o fail-safe final (`lib.rs:110`): token desconhecido **vira `0` silenciosamente** — dano silencioso em vez de erro: no modo métrico, uma sílaba inválida não aborta; ela insere um falso `"ka"` no meio do dado.

### Causa 3 — o modo métrico quebra o próprio decoder (yati/danda)

O encoder do modo métrico insere `।` (`lib.rs:83-85`); o decoder **nunca trata danda**: `split_whitespace` (`lib.rs:95`) entrega cada `।` como token, ele casa com nenhuma sílaba → o fail-safe de `0` entra em ação.

Resultado **determinístico** no modo métrico: cada yati decodificado vira um valor espúrio `0`, o vetor decodificado cresce (`len + nº de padas`) e **tudo a partir do primeiro pada desalinha**.

> Esse é o defeito mais literalmente "do modo métrico": só o modo que insere `।` é que produz o token que o decoder não sabe apagar. O par encode/decode original é inconsistente **especificamente no uso do medidor** — o modo jamais fechou o ciclo dentro do próprio crate.

### Causa 4 — o "padrão métrico" vale no espaço numérico, não no verso

`get_matra_weight` (`lib.rs:67-73`) divide por corte numérico (`idx < 8`), mas a fonética real tem **5** laghus. Combinado com o remapeamento compressivo do `to_sanskrit`:

- o kem impõe "Even=Laghu, Odd=Guru" sobre `u % 16` (espaço numérico);
- a sílaba efetivamente escrita segue o ciclo 5/11 da Causa A;
- o verso lido por um orientado **não** exibe o padrão que o teste numérico afirma ter.

O teste do kem (`test_metered_mode_constraints`) valida o corte numérico `idx < 8` — o mesmo critério inconsistente do próprio chhandas — e nunca lê o verso: o teste verde mede o atributo errado (já documentado em `abhedya-kem 1.0.24 - Análise.md` §3).

### Causa 5 — distribuição não uniforme no wrap (a alegação "crypto uniformity" falha)

`c_idx % 33` (`lib.rs:46`) com comment de "uniform distribution across consonants": `65536 mod 528 = 64` → os 64 primeiros residues têm dobra **sistematicamente maior**. Para codificação de payload criptográfico uniforme, a alegação do comentário é sem fundamento — o bias é real, previsível e mensurável.

### Causa 6 — nada modela peso por posição (o verso nunca seria autêntico)

Em sânscrito real, Laghu/Guru é determinado por **posição**, não só pela identidade da matra: sílabas antes de consoantes aspiradas ou conjuntas viram Guru por posição (uma consonância que não existe em versão numericamente pura). `to_sanskrit` atribui peso apenas pela identidade da matra (`lib.rs:22-26`, `14-16`). Mesmo com A–E corrigidos, o produto seria um texto com padrão métrico verificável por contagem, jamais por leitura: qualquer leitor treinado reconheceria o texto como prosimétrico, o que ofende o valor adicional que o modo métrico pretendia ter (encobrir a natureza cifrada do texto).

## 3. O teste no lore-plugin e os caminhos não validados

O fork Mantra foi, de fato, o **teste prático do modo métrico do Abhedyam**: A integração Mantra (Revision Mantra LUS, 03-08) levou Abhedyam a um pipeline real — cifrar o Lore do plugin com o `@abhedyam/sdk` no modo métrico. O teste falhou pela causa-raiz: o verso nunca fechou o ciclo (Causas 1 e 3). Logo, **nenhuma integração, em qualquer canal, preserva o dado** com o pipeline original.

Os três caminhos da Revisão do Mantra foram redigidos sem conhecer os erros profundos do código nativo em Rust. A revisão tratou a camada PQC como mal-instrumentada — binário ausente, API mal usada, chaves trocadas —, isto é, como defeitos de acessório, sanáveis. Esta análise mostra que há defeitos de instrumento (Causas 1, 3, 4) por baixo deles: mesmo com o binário presente, a API correta e as chaves casadas, o dado se perde na codificação, **antes** de qualquer cifra. Por isso os caminhos ficam aqui **sem validar**, um a um:

1. **"Arrumar o que rompe dados antes de tudo"** — como higiene de código, correto; como caminho para o modo métrico, não recupera nada: sob o mesmo METERED a perda é determinística pela codificação;
2. **"Separar o artefato do canal"** — pressupõe que o artefato, uma vez salvo, decodifica; com 1 + 3, não decodifica — separar o canal não muda o que está salvo;
3. **"Renomear e declarar a derivação"** — válido organizacionalmente e já emitido no complemento; não é contudo um caminho de integração do modo métrico original, pois não atinge a invertibilidade faltante.

**Balizamento do registro:** a Revisão do Mantra vale como teste prático do Abhedyam no lore-plugin, e sua análise propôs o que a informação da época permitiu — esse mérito fica registrado intacto. Esta análise adiciona a informação faltante e com ela fecha o juízo: **os caminhos de integração da Revisão do Mantra não são válidos para o pipeline original** — o que parecia problema de implementação é problema arquitetural. As correções de referência provam que uma arquitetura sanável existe; mas é outra arquitetura — qualquer retomada parte dela, não do original.

## 4. Encadeamento causal da falha

```
1  não-injetivo              →  o verso já não carrega o dado (perda antes da transmissão)
2  primeiro-par + fail 0     →  decode resolve colisões de forma sistemática e aceita tokens falsos
3  danda não apagado         →  o uso do medidor insere tokens que viram zeros e quebram o alinhamento
4   corte numérico ≠ fonético →  o padrão imposto pelo kem não aparece no verso
5 wrap não uniforme         →  bias mensurável contra a alegação de uniformidade
6  peso só por matra         →  nada se lê como métrica autêntica, mesmo corrigindo 1–5
```

**Qualquer uma delas, sozinha, já derruba o modo métrico**; 1 + 3 **combinam-se** com a falha direcional de B. A falha observada em campo entre 02-07 e 08-08 é a previsível pela arquitetura da Causa 1: não-injetividade + danda → resultado que não se decodifica. A sessão de testes registrou a consequência; esta análise documenta as causas.

## 5. O que a correção prova

As correções de referência no diretório (`abhedya-chhandas.mjs`; `abhedya-chhandas-rs/`1.0.25) mostram que as causas A–E são sanáveis: mapeamento bijetivo (`Z_528` direto) resolve as causas 1 e 2; filtrar efetivamente o danda resolve a causa 3; peso pela identidade real da matra resolve a causa 4 (a correção da causa 6 requer escopo adicional de análise fonética por posição). No mesmo domínio, 528 valores → 528 sílabas distintas, e a ida e volta completa `0..527` fecha — ou seja, cada erro elencado tem solução verificável, e é isso que existe aqui como referência. A correção da Causa 6 (peso por posição) é um escopo adicional que não compromete a reversibilidade do mapeamento (Causas 1–5). A esteganografia funcional (ida e volta completa) não depende dela. 

---

*Código original: `src/lib.rs`. Referência do consumidor: `abhedya-kem 1.0.24 - Análise.md`. Teste prático: `Revisão-Mantra_LUS.docx`.  Correções: `abhedya-chhandas-v1.0.25.mjs`, `abhedya-chhandas-v1.0.25-rs/`.*
