# Análise — abhedya-kem 1.0.24 (src/lib.rs)


## 1. Modo Metered quebra a decifragem (e o teste esconde)

- `lib.rs:200-219`: o ruído é ajustado *depois* de calcular o ciphertext, tomando o primeiro `offset` válido de `-128..=128` que satisfaz peso + truncamento. Como o varrimento começa em `-128`, o offset efetivamente escolhido fica quase sempre ≈ **-125**.
- Consequência: o erro efetivo de `u` deixa de ser ternário e vira `e' ≈ -125` por coordenada.
- Na decifragem (`lib.rs:245-257`): `diff = v − s·u = e·r + e_v − s·e'`, e `s·e'` tem desvio ≈ √(384·125²) ≈ 2450, contra limiar de decisão `Q/4 = 832`. O modo Metered **não decifra** — erro de bit próximo de 50% por símbolo.
- `test_metered_mode_constraints` (`lib.rs:279-300`) valida só as restrições de peso/faixa em `u` — **nunca decifra** o modo Metered. Teste verde sobre caminho quebrado.

## 2. O "verso" prometido não existe

- `to_sanskrit` do `abhedya-chhandas` **nunca é chamado**. `EncryptionMode::Metered` ("Chhandas Output, High Steganography") só gera `i16`s truncados.
- A restrição aplica-se somente a `u`; `v` — a parte que carrega a mensagem (`lib.rs:231-238`) — fica de fora do peso e do truncamento.
- `Ciphertext` (`lib.rs:27-30`) é definido e **nunca usado**; `encrypt` devolve tupla solta.

## 3. Inconsistência com o crate abhedya-chhandas

- **Domínio errado:** o truncamento `< 3168` ("garante mapeamento u16→Sânscrito perfeito", `lib.rs:207-210`) não bate com o domínio do chhandas (`Z_528`). 3168/528 = 6 voltas de consoante — valores codificam sílabas duplicadas, sem decodificação unívoca. Como não é chamado, "funciona" por acidente.
- **Pesos falsos:** `get_matra_weight(idx < 8 → Laghu)` não corresponde à fonética real (só a/i/u/ṛ/ḷ são laghu). O padrão "Even=Laghu, Odd=Guru" do teste vale no espaço numérico, não no verso lido.
- A dependência `^1.0.5` puxa a versão mais nova do crate com colisões de mapeamento (bug confirmado na análise do chhandas; correção de referência: `abhedya-chhandas.mjs`, bijetivo em Z_528).
- **Comentário "81 tentativas"** (`lib.rs:223`) vs. loop de **257** iterações (`-128..=128`).

## 4. É um PKE, não KEM

- Não há `encapsulate`/`decapsulate`, segredo compartilhado nem KDF. Mensagens são bits por par `(u, v)`.
- `m` fora de `{0,1}` vira `0` silenciosamente (`lib.rs:234`, `if m == 1`), apesar da assinatura `&[i16]`.
- `decrypt` faz `zip` entre `u_vecs`/`v_vec` — comprimentos diferentes **truncam em silêncio**.

## 5. Bugs latentes

- `dot()` (`lib.rs:33-38`) acumula em `i32`: para dois vetores de domínio cheio, a soma ~768·2,7M ≈ 2,1×10⁹ fica em cima de `i32::MAX` — em debug **panica** por overflow. Hoje só é chamado com um lado ternário, o que disfarça o problema; a API não declara o pressuposto.
- `dot_avx2` (`lib.rs:87-102`) é **código morto** (nunca chamado) e tem o mesmo risco de overflow no acumulador.
- SIMD sob `#[cfg(target_feature = "avx2")]` + detecção em runtime desalinhadas: CPU detectada mas sem feature de compilação entra no fallback silencioso (`lib.rs:167-173`).
- Nenhuma guard de `N % 16 == 0` — o loop SIMD em passo 16 quebra silenciosamente se `N` mudar.

## 6. Segurança: alegações vs. realidade

- "Constant-Time: Logic designed to resist timing attacks" (docs do crate), mas: `if r_val == 0 { continue }` (`lib.rs:155`) ramifica sobre `r`, e o varrimento com early-exit (`if valid && !found`) ramifica sobre dado que depende do estado. Mitigação plausível (`r` é efêmero), mas a alegação de CT fica falsa.
- **Ruído fino demais:** ternário uniforme η=1, sem análise — segurança bem menor que CBD η=2/3 do Kyber; params "copiados" sem justificativa.
- Chave pública carrega a matriz inteira (N² i16 ≈ **1,2 MB**) em vez de seed derivada determinística.
- Sem `Zeroize` em `SecretKey`, sem validação de entrada, sem `Result` — todos os caminhos de erro silenciosos.
- Fallback do Metered ("probability effectively zero") não testado: se nenhum offset válido for encontrado, usa o ruído original e viola a própria invariante do modo — potencial teste flake.

## 7. Métrica

- O padrão alternado S-L-S-L… **não é Anushtubh**: no Anushtubh real só os postos 5 e 6 são fixos ("5ª leve, 6ª pesada", `lib.rs:133`), o próprio comentário cita e depois descarta.
- `u` tem 768 componentes = 96 "padas" de 8 — os "4 padas de 8 sílabas" do comentário não compõem a estrutura real.

## Veredito

O modo Standard tem roundtrip (teste passa; a matemática fecha com o ruído fino), mas o modo "Steganography" — argumento de venda do crate — é:

1. **Fictício na saída** (nenhum verso é gerado);
2. **Invalidado no próprio teste** (peso numérico ≠ fonético);
3. **Desconectado do domínio** (`Z_528` do chhandas vs. truncamento 3168);
4. **Quebra da própria decifragem** (offsets ±128 estragam `s·e'`).

É um PKE de brinquedo com rótulo de KEM pós-quântico e um teste que mede o atributo errado.
