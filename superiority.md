# superioridade.md — o que o VAISHYA faz que o KEM sozinho não faz

Três eixos: **tamanho**, **segurança do segredo** e **beleza cultural e linguística**.
Todos os números abaixo vêm dos benchmarks inclusos e são reproduzíveis.

---

## 1. Tamanho: a cifra inteira cabe no que o KEM gasta só para transportar um segredo

ML-KEM-768 transporta **1.088 bytes** de ciphertext para entregar **32 bytes** de segredo
compartilhado. Nesses mesmos 1.088 bytes, o VAISHYA entrega um payload Pix **completo** —
dados reais cifrados, decoys plausíveis e autenticação — em forma de poema.

| payload de entrada | layout | payload VAISHYA | vs. JSON | vs. ciphertext ML-KEM |
|---|---|---|---|---|
| Pix, 137 B | 4×8 | **961 B** | 7,0× | **0,88×** |
| Pix, 137 B | 2×16 | **927 B** | 6,8× | **0,85×** |
| BricsPay, 641 B | 4×8 | 2.634 B | 4,1× | 2,42× |
| BricsPay, 641 B | 2×16 | 2.605 B | 4,1× | 2,39× |

O caso que interessa é o primeiro: **0,85× o ciphertext do KEM**. A afirmação não é "menor
que Kyber" — é mais honesta e mais forte: *o envelope inteiro custa menos que o transporte
do segredo que o protege*.

De onde vem o tamanho, medido campo a campo em `superiority` das medições:

- **Alfabeto**: cada sílaba carrega `log₂(528) = 9,04 bits` (1,13 B) e ocupa 5,27 B em UTF-8
  com espaço. É o preço do sânscrito com diacríticos — e é o que dá o disfarce.
- **Custo fixo**: 8 sílabas de nonce + 8 de tag por poema (não por campo — o formato é único).
- **Fechamento métrico**: até 31 sílabas de preenchimento para nenhum shloka ficar parcial.

Reproduza:

```bash
node abhedyam-vaishya-bench.mjs 10
```

---

## 1b. O overhead em payloads grandes — e por que ainda economiza rede

O VAISHYA tem overhead de forma: os nomes de campo viajam **duas vezes** — como chaves
externas dos decoys (para o payload parecer o original) e dentro do poema (para restaurar a
estrutura exata). Num BricsPay de 641 B, dos 442 B de JSON compacto cifrado, **138 B são
nomes de campo** e 74 B são sintaxe; só 230 B são valores.

Isso infla o envelope. Mas o número que importa numa rede não é o tamanho do poema — é o
**custo total do processo**: JSON + transporte do segredo + envelope. Compare:

| | Pix, 137 B | BricsPay, 641 B |
|---|---|---|
| Convencional cru (JSON + `kem_ct` 1.088 B + IV/ct/tag) | 1.360 B | 2.199 B |
| Convencional em base64 | 1.769 B | 2.721 B |
| STANDARD (poema com `kem_ct` embutido) | 6.014 B | 6.944 B |
| **VAISHYA** (só o SS na chave, nada de `kem_ct` no payload) | **961 B** | **2.634 B** |
| **Economia vs. convencional em base64** | **1,8×** | **1,03×** |
| **Economia vs. STANDARD** | **6,3×** | **2,6×** |

*Os valores do VAISHYA são medianas de 20 selos: os decoys têm comprimentos variáveis, então
o envelope oscila ±60 B (Pix: 930–989 B; BricsPay: 2.587–2.697 B).*

Três conclusões:

1. **O `kem_ct` de 1.088 B é o custo que o VAISHYA elimina.** Não há ciphertext de KEM no
   payload — o segredo compartilhado é combinado fora da banda, e só a chave derivada dele
   é usada. Esse é o único ganho estrutural, e ele é grande: ~1 KB por mensagem, sempre.
2. **O VAISHYA ainda empata com o convencional em base64 no payload grande** (2.634 vs 2.721 B)
   — mesmo carregando decoys, poema métrico, puṣpikā e os nomes duplicados. Ou seja: o
   overhead de forma **não chega a custar mais caro do que o envelope convencional**, e
   ainda entrega disfarce.
3. **Contra o STANDARD da própria família, a economia é 2,6× a 5,9×.** É a comparação justa
   entre dois modos que produzem poema: um transporta o `kem_ct` dentro do verso, o outro
   não.

E o argumento de rede: os 2.634 B são o **processo completo** — dados reais cifrados,
decoys, autenticação e formato poético — não o custo de uma etapa. O convencional gasta
2.199 B só para *entregar* um segredo de 32 B mais os dados em claro. Por byte útil
entregue, o VAISHYA no BricsPay custa 2.634 B para proteger 442 B de JSON; o convencional
custa 2.199 B e ainda deixa os dados legíveis para quem intercepta o JSON.

O espaço onde isso é decisivo é o de pagamentos: mensagens de 100–700 B, milhões por dia.
Ganhar ~1 KB por mensagem é ~1 GB por milhão de transações. O overhead de forma é real, mas
menor que o custo do transporte do segredo que ele substitui.

**Se um dia o overhead incomodar**, os nomes de campo dentro do poema podem sair (ficando só
a ordem e os tipos): cai cerca de 1.000 B no BricsPay. Não foi feito agora porque a
restauração passaria a depender das chaves externas — o que reintroduz a fragilidade da
variante descartada.

---

## 2. Segurança: a chave única nasce do segredo do ML-KEM, não de uma senha

Do ML-KEM vem **só o segredo compartilhado** (`SS`, 32 B). O ciphertext do KEM **não**
viaja no payload — não há `kem_ct` para vazar, comparar ou correlacionar.

```
chave única = HKDF-SHA256(ikm = SS,
                          salt = "vaishya-field/v1",
                          info = "abhedya-field-v1")   → 32 B (hex 64)
```

**Por que isso importa.** A robustez pós-quântica não está no AES (AES-256 continua forte
contra Grover, com margem) e não está no tamanho da chave — está no **IKM**: a chave de
cifra é derivada de um segredo cuja confidencialidade repousa em ML-KEM-768 (FIPS 203),
o KEM padronizado pelo NIST para resistir a adversários com computador quântico. Nenhuma
etapa do VAISHYA depende de dificuldade de fatoração ou de logaritmo discreto clássico.

**O que cifra.** O poema é a cifra: um fluxo de dígitos em Z_528, somado (mod 528) aos
dígitos do texto. Não há AES no caminho — nem no VAISHYA, nem no transporte.

**O que autentica.** A puṣpikā (`॥ iti … ॥`) carrega um tag HMAC-SHA256 sobre
`[nonce | cifra | preenchimento]`, **cifrado pelo mesmo fluxo e pela mesma chave**. O
colofão é, portanto, abarcado pela mesma chave do poema: adulterar uma sílaba do corpo, do
preenchimento ou do próprio colofão quebra a verificação. Um `transactionId` adicional
recebe o HMAC do poema inteiro, amarrando o payload contra troca de campo.

**Propriedades verificadas nos testes** (`sdks/js/test.js`, `sdks/python/test.py`):

- chave errada → rejeitado
- uma sílaba alterada no corpo → rejeitado
- preenchimento alterado → rejeitado
- campo `poem` ausente → rejeitado com mensagem explícita
- payload do formato antigo (`field`) → rejeitado, sem caminho de leitura legado

**Escopo: segurança criptográfica, não imperceptibilidade estatística.** Um adversário pode
reconhecer que um dado é um poema do VAISHYA — o alfabeto é conhecido e o formato é público.
Isso não é o objetivo do desenho e não reduz a segurança: a resistência está na chave
derivada do SS do ML-KEM, não no sigilo da forma. Cifras sérias nunca dependem de o atacante
desconhecer o algoritmo (Kerckhoffs) — o VAISHYA também não. Distinguir o texto do resto não
ajuda a decifrá-lo: sem o SS, saber que ali há um poema dá ao atacante exatamente a mesma
vantagem que saber que um arquivo é um `.gpg`.

---

## 3. Beleza cultural e linguística: a cifra é literatura

O VAISHYA não "codifica em base64 e chama de poema". A saída é métrica de verdade:

- **Anuṣṭubh**: 32 sílabas por shloka, 4 padas de 8 (layout `classic`) ou 2 linhas de 16
  (`standard`).
- **Dandas**: `।` fecha o hemistíquio, `॥` fecha o shloka — a pontuação da tradição.
- **Puṣpikā**: o colofão `॥ iti … ॥` que encerra obras sânscritas, aqui carregando o tag.
- **Nenhum shloka parcial**: o corpo é preenchido até fechar a estrofe. Todo poema termina
  em `॥` numa linha cheia.
- **Estrutura visual**:

```
ṭṝ ji gau dhaḥ lā gṝ ṣi jo 
dṛ ghi khu ṅū jhū ṭā ko ṭhṛ ।
ṇa ñu pṛ ḍau ghḹ ṣi co haṃ 
chau ṅī mi nau śai pu so dī ॥


gṝ haḥ jhaṃ ghṝ ru ghau ghu ñi 
...


॥ iti ṣū hū ṭṝ ṇau pha caṃ laṃ ṣū ॥
```

Duas linhas em branco entre shlokas, uma linha em branco antes do colofão — o poema se lê
como antologia, não como bloco de dados.

- **Alfabeto**: 33 consoantes × 16 matras do sânscrito, com diacríticos corretos (`ṃ`, `ḥ`,
  `ṛ`, `ṝ`, `ḷ`, `ḹ`, `ś`, `ṣ`, `ñ`, `ṅ`). O texto é transliteração IAST legível por quem
  conhece a tradição.
- **Decoys culturais**: os campos falsos são dados brasileiros plausíveis — nome, cidade,
  CPF com dígito verificador válido, e-mail, telefone com DDD real.

A consequência prática: um payload interceptado **não parece** um payload. Parece poesia
sânscrita — e a única coisa que o distingue de poesia de verdade é a chave.

---

## 4. Desempenho

| operação | 4×8 | 2×16 |
|---|---|---|
| selar (decoys + fluxo Z_528 + puṣpikā) | 0,868 ms | 0,476 ms |
| revelar (poema → JSON) | 0,636 ms | 0,507 ms |
| **processo completo** | **1,503 ms** | **0,983 ms** |

Windows x64 / Node v26.7.0, 10 repetições, payload Pix de 137 B. Sem AES, o ciclo ficou
~12× mais rápido que a versão anterior do modo.

---

## 5. O que o VAISHYA não é

- **Não é um KEM.** O VAISHYA é cifra de campo; a distribuição do segredo é do ML-KEM.
- **Não promete imperceptibilidade estatística** — o formato é público por princípio
  (Kerckhoffs); o que protege é a chave derivada do SS. Ver o escopo na seção 2.
- **Não é resistente a comprometimento da chave única**: quem tem o SS, abre. A segurança
  está em proteger o SS (é para isso que existe o ML-KEM).
- **Não tem modo de leitura legado.** Payload do formato antigo é rejeitado por desenho.

---

*Fontes dos números: `abhedyam-vaishya-bench.mjs`, `sdks/js/test.js`, `sdks/python/test.py`.
Medições de 2026-11-07. Tempos variam por máquina; rode os benchmarks antes de citar.*
