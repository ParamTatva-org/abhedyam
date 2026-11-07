<p align="center">
  <img src="assets/abhedyam-logo.jpeg" alt="Abhedyam Logo" width="300"/>
</p>

**Idiomas:** [English](README.md) | [Português](README.pt.md) | [Español](README.es.md)

# Abhedyam (अभेद्यम्)

**Abhedyam** ("O Inquebrável") é um framework disruptivo de criptografia pós-quântica que harmoniza a teoria matemática das redes com a variedade topológica da língua sânscrita.

> _"Números são construtos. A linguagem é a verdade."_

## Visão geral

Ao contrário dos frameworks tradicionais de PQC, que dependem exclusivamente do aumento do tamanho das chaves e das distribuições de erros para combater adversários quânticos, o Abhedya introduz uma camada de **esteganografia baseada em linguagem**. Ao mapear primitivas criptográficas para o alfabeto sânscrito ordenado matematicamente (Varnamala) e aplicar a métrica poética (Chhandas), o Abhedya consegue:

- **Segurança quântica**: Resistência baseada na rede de reticulados (LWE) em conformidade com o Nível 3 do NIST (Kyber-768).
- **Descriptografia com latência zero**: Tempo de descriptografia de **~5 µs** (20 vezes mais rápido que o Kyber) por meio de mapeamento direto das variedades topológicas.
- **Esteganografia**: Ciphertext indistinguível de uma poesia épica ("Mahakavya") válida em sânscrito.

## Arquitetura
Este repositório contém os binários verificados e a documentação do ecossistema Abhedya. O código-fonte principal é de propriedade da **ParamTatva**, distribuído sob a licença MIT, que permite seu uso, modificação e redistribuição.

- `bin/`: Ferramentas da CLI pré-compiladas para macOS/Linux (`abhedya-cli`).
- `docs/`: Especificações técnicas e relatórios de conformidade.

## Uso

### 1. Instalação

Baixe o binário `abhedya-cli` do diretório `bin/` e o adicione ao seu PATH.

### 2. Benchmarking

Verifique o desempenho e a conformidade na sua máquina local:

```bash
# Execute o benchmark do modo padrão
./bin/abhedya-cli --benchmark

# Execute o benchmark do modo métrico (poético)
./bin/abhedya-cli --benchmark --meter
```

### 3. Comparação

Compare o Abhedya com os 20 principais candidatos a PQC do NIST:

```bash
./bin/abhedya-cli --compare
```

## Análise de Superioridade

 Veja [superiority.md](docs/superiority.md) para uma análise detalhada sobre por que o Abhedya supera os frameworks puramente matemáticos em velocidade, filosofia e implementação.

## Reforço de segurança (v1.0.1)

Após uma rigorosa auditoria de segurança realizada por pesquisadores independentes, a biblioteca principal foi reforçada contra ataques avançados de canal lateral:

- **Eliminação de Oráculos de Tempo**: Implementou-se a **Codificação em Tempo Constante** com busca em janela fixa otimizada via AVX2, garantindo que o tempo de criptografia seja independente da mensagem secreta.
- **Eliminação de Viés**: Aplicou-se rigorosamente o **truncamento por módulo** ($q < 3168$) para garantir um mapeamento perfeitamente uniforme para o alfabeto sânscrito, eliminando todo viés estatístico.
- **Integridade Esteganográfica:** Formalizou-se a distinção entre o **Modo Padrão** (ruído em conformidade com a norma FIPS) e o **Modo Métrico** (privacidade esteganográfica) para evitar vulnerabilidades decorrentes de desvios distribucionais.


## Prova de Conceito: Esteganografia Linguística Aplicada a Finanças (1.0.45)

Este fork contém uma prova de conceito (POC) cujo objetivo é provar a viabilidade técnica da esteganografia linguística para proteger transações financeiras. Para demonstrar a viabilidade, a POC utiliza um payload fictício baseado na especificação da BRICS Pay E-commerce API, que simula uma compra internacional de um produto digital (a edição standard do jogo Escape from Tarkov), com o pagamento realizado no Brasil via Steam e liquidado no BRICS Pay, no qual metade do valor original (R$ 115) é enviado à Battlestate Games (publicadora do jogo) na Rússia.

 
 ## Auditoria e correções (1.0.45)

Esta seção é a contribuição de [Lonely Alchemist](https://github.com/lonelyalchemist), acrescentada à tradução acima: o que segue registra o que a análise linha a linha do código publicado e um teste prático de integração real constataram sobre as alegações da narrativa original — e as correções verificadas da versão **1.0.45**, com números que qualquer pessoa pode verificar.

## Síntese

As auditorias não reproduziram, de forma independente, nenhuma das três alegações centrais do README original ("~5 µs de decifra, 20× mais rápido que Kyber", "ciphertext indistinguível de Mahakavya válida", "auditoria de segurança por pesquisadores independentes v1.0.1"). As auditorias consistiram em uma análise linha a linha do código publicado e um teste prático de integração real: leu-se o código que foi de fato publicado, executou-se o que roda, mediu-se o que se podia medir, e reescreveu-se a implementação para que o projeto faça o que afirma.

## Nota sobre a metodologia 

A falha do código original foi identificada empiricamente por meio de testes práticos conduzidos entre 02 de julho e 08 de agosto de 2026. As auditorias assistidas por IA (OpenCode) foram utilizadas posteriormente como ferramenta de apoio para mapear e documentar as causas da falha. A conclusão final e a correção proposta (versão 1.0.45) são de responsabilidade do autor da contribuição.

## Afirmação → constatação

| O README original afirma | O que a auditoria constatou |
|---|---|
| ["~5 µs" de decifra, 20× mais rápido que Kyber; "< 1 µs" no caminho de cifragem (docs/superiority.md)](docs/superiority.md) | Modo STANDARD leva em média **1,653 ms** e o ciclo completo **4,939 ms**; CLASSIC leva em média **0,575 ms** (p50 0,456 ms). Nenhum número em microssegundos foi reproduzido; ver [A afirmação dos 20× mais rápidos](#a-afirmação-dos-20x-mais-rápidos) |
| ["Resistência baseada na rede de reticulados (LWE) em conformidade com o Nível 3 do NIST (Kyber-768)"](README.pt.md) | O crate publicado (`abhedya-kem 1.0.24`) é **um mecanismo de PKE, não um KEM**: não possui `encapsulate`/`decapsulate`, nem segredo compartilhado, nem KDF ([análise §4](#fontes)). Seu modo "Metered" **não decifra**: o ruído ajustado posteriormente (≈ −125 por coordenada) eleva `s·e'` a desvio ≈ 2450 contra limiar de decisão `Q/4 = 832` — erro de bit próximo de 50% por símbolo ([§1](#fontes)) |
| ["Ciphertext indistinguível de uma poesia épica (Mahakavya) válida em sânscrito"](README.pt.md) | No código publicado, "`to_sanskrit` nunca é chamado" — o modo que anuncia "Chhandas Output, High Steganography" gera apenas inteiros truncados, nenhum verso ([§2 da análise](#fontes)). A 1.0.45 escreve poemas de verdade (sargas Anuṣṭubh 8 hemistíquios + puṣpikā com hash do conteúdo), mas "indistinguível de Mahakavya válida" permanece aspiração: o universo é de 528 sílabas ordenadas, detectável por estatística em princípio |
| ["Auditoria rigorosa de segurança por pesquisadores independentes v1.0.1: Codificação em Tempo Constante AVX2, truncamento q < 3168"](README.pt.md) | No código publicado: `dot_avx2` é código morto (nunca chamado); a alegação de tempo constante é falsa na prática (`if r_val == 0 { continue }` e early-exit ramificam sobre dados); o comentário anuncia "81 tentativas" para um loop de 257; o truncamento `< 3168` não casa com o domínio do próprio crate chhandas (Z_528; 3168/528 = 6 voltas — mapeamento ambíguo, sem decodificação unívoca) ([§3, §5, §6 da análise](#fontes)). Não foi identificado nenhum pesquisador da auditoria citada, colocando em dúvida a sua veracidade. |
| [`challenge.txt`: "Decrypt Body using ChaCha20 (Key=SS, Nonce=0s)"](challenge.txt) | Orientação perigosa: mesmo par de chaves com nonce fixo reutiliza o keystream entre mensagens, destruindo confidencialidade. A 1.0.45 amarra a chave simétrica ao ciphertext do KEM (`HKDF(ss, salt=kem_ct)`) precisamente para afastar essa classe de falha |
| ["O código-fonte principal é de propriedade da ParamTatva... distribuído sob licença MIT"](README.pt.md) | Contradição interna: código-fonte "proprietário" sob [licença MIT](LICENSE), que existe justamente para permitir auditoria e redistribuição. A declaração correta exige escolher: fonte aberta auditável ou alegações terceirizadas. |

## A afirmação dos 20× mais rápidos

### 1. A comparação é um erro de categoria

Kyber-768/ML-KEM é um **KEM**: encapsula um segredo e não cifra mensagens. "20× mais rápido que Kyber" compara um pipeline completo (KEM + cifra autenticada + esteganografia + métrica poética) com uma operação que, por si, não cifra nada. Kyber sozinho não entrega nenhuma das funções que o projeto promete — portanto a afirmação de ser "mais rápido que Kyber" não possui sustentação no código original. 

### 2. O número alegado não é reproduzível nos artefatos publicados

O teste prático de integração real ([Revisão-Mantra_LUS](#fontes), LUS/Logos, 03-08-2026) documentou que o SDK publicado nem chega a executar: o binding `@abhedyam/sdk` é só um `koffi.load()` por uma biblioteca nativa ausente do npm e do repositório — "koffi.load() lança exceção na primeira linha". O mesmo registro documentou a API mal usada (chamadas com objeto quando o SDK espera posições; leitura de `result.ciphertext` quando `encrypt` devolve Buffer) e perda de dados garantida a partir do segundo guardado. Nenhum caminho "offline/online" com pré-cálculo de pad (superiority.md §4) existe em código auditável publicado.

### 3. O que a arquitetura corrigida faz

Benchmark aberto da contribuição 1.0.45 (`sdks/js/`), mensagem de 14 B, 10 repetições:

| Operação | STANDARD (ML-KEM-768) | CLASSIC (AES-256-GCM) |
|---|---|---|
| keygen (par KEM) | média 0,978 ms · p50 0,213 ms | — |
| criptografar (→ poema) | média 2,308 ms · p50 1,185 ms | média 1,058 ms · p50 0,752 ms |
| descriptografar (poema →) | média 1,653 ms · p50 1,422 ms | média 0,575 ms · p50 0,456 ms |
| **processo completo** | **média 4,939 ms · p50 2,823 ms** | **média 1,633 ms · p50 1,200 ms** |

A superioridade da arquitetura corrigida não está em entregar um Kyber sem latência — está em **entregar o trabalho que o reprodutor espera**: máximos de milissegundos em vez de alegações de microssegundos em um modo que não decifra. Sem SIMD manual, sem pré-cálculo não auditável, com HKDF a cada cifra: código portável que roda em qualquer máquina com Node moderno — e devolve, em milissegundos, o ciclo inteiro com versos completos e puṣpikā verificável (`॥ iti … ॥`).

## As correções e adições da 1.0.45

- **SDK JavaScript auditável** (`sdks/js/index.js`): sem dependências nativas — apenas `node:crypto`; remove o binding `koffi` sobre biblioteca ausente.
- **STANDARD** = KEM das regras: **ML-KEM-768** (FIPS 203) via `generateKeyPairSync`/`encapsulate`/`decapsulate`; chave AES-256-GCM derivada `HKDF(ss, salt = ciphertext-KEM, 'abhedya-kem-aes/v1')` — a chave fica amarrada ao envelope que a transporta.
- **CLASSIC** = AES-256-GCM de chave bruta de 32 B (ex-"METERED": no 1.0.41 este nome era só rótulo de saída do mesmo cifra — não era algoritmo distinto).
- **Poema íntegro nos dois modos**: sargas Anuṣṭubh de 8 hemistíquios (2 shlokas = 64 sílabas) e marcadores romanos para enumerar os sargas do poema.
- **Puṣpikā (पुष्पिका)** — o colofão que fecha o poema: `॥ iti <29 sílabas do hash do conteúdo> ॥`.
- **JSON compacto no plaintext**: deflate one-shot por marcador, JSON compacto antes do deflate — payload do BricsPay de 570 B caiu para 442 B; verso ~30% menor.
- **Processo de criptografia/descriptografia**: o script de criptografia grava o poema em `.txt` e exibe no terminal só as chaves (STANDARD: pública + secreta; CLASSIC: chave da cifra); o descriptografia lê o `.txt`, mostra a mensagem e grava o resultado em `.restored`.
- **Benchmarks PT/EN/ES × STANDARD/CLASSIC**: `abhedyam-standard-benchmark.mjs`, `abhedyam-classic-benchmark.mjs`.


## O que permanece honesto

- **Esteganografia é uma camada extra de proteção**: o poema esconde o ciphertext e o ciphertext protege o payload.
- **"Inquebrável" é nome de projeto, não alegação técnica**: nenhum esquema criptográfico tem prova de inquebrabilidade.
- **Tempos dependem da máquina**: os números aqui são de referência; rode os benchmarks na sua própria máquina para confirmar o tempo apresentado.

## Reproduzir

```bash
 cd abhedyam-1.0.45

# Escolha o sufixo do idioma: - en, - es ou - pt

node abhedyam-classic-benchmark-pt.mjs 
node abhedyam-standard-benchmark-pt.mjs 
node abhedyam-classic-encrypt-pt.mjs 
node abhedyam-classic-decrypt-pt.mjs 
node abhedyam-standard-encrypt-pt.mjs 
node abhedyam-standard-decrypt-pt.mjs
 ```

A contribuição inclui também os documentos da auditoria — `abhedya-kem 1.0.24 - Análise.md` e `abhedya-chhandas 1.0.24 - Modo Métrico - Análise.md` (PT/EN/ES) — citados na seção Fontes.

## Fontes

- **Análise de defeitos — `abhedya-kem 1.0.24` (`src/lib.rs`)**, 2026-10-24: análise linha a linha do código **publicado** (docs.rs, crate 1.0.24, MIT, ParamTatva-org/abhedyam). Resumo: §1 o modo Metered quebra a própria decifragem (e o teste esconde); §2 o "verso" prometido não existe (`to_sanskrit` nunca é chamado); §3 inconsistência com o crate `abhedya-chhandas` (domínio 3168 vs Z_528, pesos fonéticos falsos); §4 é um PKE, não KEM; §5-§6 bugs latentes e alegações de segurança vs. realidade (CT falsa, `dot_avx2` morto, ruído η=1, pk de 1,2 MB); §7 a métrica S-L-S-L não é Anuṣṭubh (só os postos 5 e 6 são fixos na métrica real). Complemento em `abhedya-chhandas 1.0.24` (crates.io): o teste `test_metered_mode_constraints` valida o corte numérico `idx < 8` e nunca lê o verso — "a prova verde mede o atributo errado".
- **Revisão-Mantra_LUS** (análise de Andrés Peña, LUS/Logos, 03-08-2026): o **teste prático de integração real** do Abhedyam no lore-plugin — o fork Mantra (autor terceiro) tentou cifrar o lore com `@abhedyam/sdk` (N=768/Q=3329, METERED) e registrou, de forma verificável: binário nativo ausente (`koffi.load()` lança na primeira linha), API mal usada (objeto vs. posições; `result.ciphertext` sobre Buffer), perda de dados garantida a partir do segundo guardado, rota quebrada dentro do plugin, sobrescrever em vez de acumular, frontmatter quebrado, `node_modules/` commitado. "Estado: não funciona — não é uma opinião; é verificável". [Arquivo `Revisão-Mantra_LUS.md´]



## Licença e atribuição

O código original permanece sob a licença MIT original ([LICENSE](LICENSE)) — e é isso que corrige a narrativa: o código sempre esteve à disposição sob MIT; a auditoria só aparece nesta contribuição. As correções 1.0.45 seguem MIT. Métrica e nomes em sânscrito pertencem à tradição; correções e medições são da contribuição de [Lonely Alchemist](https://github.com/lonelyalchemist).

---

*Todos os números deste README vêm dos benchmarks inclusos, rodados na data da contribuição (2026-11-01). A fonte original permanece no histórico do fork para confronto lado a lado.* 

---

**ParamTatva**, 2026.
