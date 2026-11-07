# abhedya-chhandas 1.0.24 — Análisis del modo métrico

**Sobre la sesión de pruebas.** El modo métrico fue probado del día **2 de julio al día 8 de agosto de 2026**. Ese análisis **no cuestiona, reinterpreta ni reabre** esa sesión: existe únicamente para **mapear y documentar las causas** de la falla observada. Las pruebas produjeron el dato; ese documento organiza el porqué de él.

**Sobre la prueba en planta — integración real en el lore-plugin.** Hay un registro de una prueba concreta, además de los lenguajes de programación en que Abhedyam está disponible: el `Revisión-Mantra_LUS.docx` (03-08-2026) documenta el intento del fork **Mantra** de poner al Abhedyam en uso real — cifrar el Lore del plugin con `@abhedyam/sdk` (el mismo árbol de código, N=768/Q=3329) **en el modo METERED**, exactamente el modo métrico analizado aquí. Esa integración constituyó una prueba en planta del modo métrico, en otro ambiente; su falla está registrada en la revisión LUS en la capa JS y en el complemento de este proyecto en la capa Rust/PQC. El documento de la revisión, sin conocer los errores profundos del código, ofreció caminos para una integración real; **ese análisis registra la prueba y no valida esos caminos** — la sección 8 explica por qué.

**Procedencia.** El paquete es el publicado en crates.io (`Cargo.toml` normalizado por la registry, crate `abhedya-chhandas 1.0.24`, ParamTatva-org/abhedyam). El `src/lib.rs` local es idéntico al publicado y analizado en `abhedya-kem 1.0.24 - Análise.md` (sección 1) — ninguna divergencia entre fuente local y publicada.

---

## 1. Qué promete el modo métrico y quién lo consume

`encode_vector(vec, use_meter = true)` (`lib.rs:75-88`) promete: valores → sílabas sánscritas organizadas en **Anushtubh** (yati `।` cada 8 sílabas), con pesos Laghu/Guru aplicados por `to_sanskrit`/`get_matra_weight`. El consumidor directo del espacio numérico subyacente es el `abhedya-kem` en `EncryptionMode::Metered`, que impone "Even=Laghu, Odd=Guru" sobre `u % 16`.

Para que el modo métrico sea funcional, tres condiciones deben valer simultáneamente:

1. **Unicidad:** cada valor codifica una sílaba distinta (inyectividad), pues el verso es el vehículo de los datos;
2. **Reversibilidad:** el decoder restaura los valores, incluso con yati presente;
3. **Coherencia fonética:** el patrón numérico impuesto corresponde al peso real de las sílabas generadas.

Ninguna de las tres vale en el original. Las causas, en orden causal:

## 2. Causa 1 — el encoder borra información antes de cualquier transmisión (no inyectivo)

`lib.rs:51-61`: los 8 índices "Laghu" (`m_idx 0..8`) se comprimen en ciclo de **5**, y los 8 "Guru" en ciclo de **11**:

- `m_idx 0` y `m_idx 5` → ambos producen `"a"` (colisión); ídem `1/6 → "ā"`, `2/7 → "i"`.
- Al menos **3/16 ≈ 18,75% de todo el dominio** colisiona en la codificación.

Consecuencia: el verso generado en modo métrico **no lleva el dato** — lleva una suma borrada de él. Ningún decode, por robusto que sea, puede restaurar lo que el encoder no registró. Ese es el defecto raíz y es anterior a cualquier capa de transporte.

## 3. Causa 2 — codificación colisionante y decodificación siempre "hacia abajo"

El decoder (`lib.rs:90-113`) barre `c` por fuera, `m_idx` por dentro y devuelve **el primer par** cuya sílaba construida casa con el token. Como las colisiones de la Causa 1 producen strings idénticas de `m_idx` distintos, el decode devuelve sistemáticamente el **menor** `m_idx`:

- Un valor con `m_idx = 5` (`"ka"`) decodifica como `m_idx = 0` (`v' = c·16 + 0 ≠ v`).
- El roundtrip falla en toda la familia de las colisiones — error **sistemático y direccional** (nunca hacia arriba), lo que desalinea cualquier análisis bit a bit sobre datos restaurados.

Y el fail-safe final (`lib.rs:110`): un token desconocido **se vuelve `0` silenciosamente** — daño silencioso en lugar de error: en modo métrico, una sílaba inválida no aborta; inserta un falso `"ka"` en medio del dato.

## 4. Causa 3 — el modo métrico quiebra su propio decoder (yati/danda)

El encoder del modo métrico inserta `।` (`lib.rs:83-85`); el decoder **nunca trata el danda**: `split_whitespace` (`lib.rs:95`) entrega cada `।` como token, no casa con ninguna sílaba → el fail-safe de `0` entra en acción.

Resultado **determinístico** en modo métrico: cada yati decodificado se vuelve un valor espurio `0`, el vector decodificado crece (`len + nº de padas`) y **todo a partir del primer pada desalinea**.

> Ese es el defecto más literalmente "del modo métrico": solo el modo que inserta `।` produce el token que el decoder no sabe borrar. El par encode/decode original es inconsistente **específicamente en el uso del medidor** — el modo jamás cerró el ciclo dentro del propio crate.

## 5. Causa 4 — el "patrón métrico" vale en el espacio numérico, no en el verso

`get_matra_weight` (`lib.rs:67-73`) divide por corte numérico (`idx < 8`), pero la fonética real tiene **5** laghus. Combinado con el remapeo compresivo del `to_sanskrit`:

- el kem impone "Even=Laghu, Odd=Guru" sobre `u % 16` (espacio numérico);
- la sílaba efectivamente escrita sigue el ciclo 5/11 de la Causa 1;
- el verso leído por un oído entrenado **no** exhibe el patrón que la prueba numérica dice tener.

La prueba del kem (`test_metered_mode_constraints`) valida el corte numérico `idx < 8` — el mismo criterio inconsistente del propio chhandas — y nunca lee el verso: la prueba verde mide el atributo equivocado (ya documentado en `abhedya-kem 1.0.24 - Análise.md` §3).

## 6. Causa 5 — distribución no uniforme en el wrap (la alegación "crypto uniformity" falla)

`c_idx % 33` (`lib.rs:46`) con comment de "uniform distribution across consonants": `65536 mod 528 = 64` → los 64 primeros residues están **sistemáticamente sobre-representados**. Para codificación de payload criptográfico uniforme, la alegación del comentario carece de fundamento — el bias es real, previsible y mensurable.

## 7. Causa 6 — nada modela peso por posición (el verso nunca sería auténtico)

En sánscrito real, Laghu/Guru se determina por **posición**, no solo por la identidad de la matra: sílabas ante consonantes aspiradas o conjuntas se vuelven Guru por posición (una consonancia que no existe en versión numéricamente pura). `to_sanskrit` atribuye peso solo por la identidad de la matra (`lib.rs:22-26`, `14-16`). Aun con las causas 1–5 corregidas, el producto sería un texto con patrón métrico verificable por conteo, jamás por lectura: cualquier lector entrenado reconocería el texto como prosimétrico, lo que ofende el valor adicional que el modo métrico pretendía tener (encubrir la naturaleza cifrada del texto).

## 8. La prueba en el lore-plugin y los caminos no validados

El fork Mantra fue, de hecho, la **prueba en planta del modo métrico del Abhedyam**: La integración Mantra (Revision Mantra LUS, 03-08) llevó Abhedyam a un pipeline real — cifrar el Lore del plugin con el `@abhedyam/sdk` en el modo métrico. La prueba falló por la causa-raíz: el verso nunca cerró el ciclo (Causas 1 y 3). Por eso, **ninguna integración, en cualquier canal, preserva el dato** con el pipeline original.

Los tres caminos de la Revisión del Mantra fueron redactados sin conocer los errores profundos del código nativo en Rust. La revisión trató la capa PQC como mal-instrumentada — binario ausente, API mal usada, claves intercambiadas —, es decir, como defectos de accesorio, sanables. Ese análisis muestra que hay defectos de instrumento (Causas 1, 3, 4) debajo de ellos: aun con el binario presente, la API correcta y las claves casadas, el dato se pierde en la codificación, **antes** de cualquier cifra. Por eso los caminos quedan aquí **sin validar**, uno a uno:

1. **"Arreglar lo que rompe datos antes de todo"** — como higiene de código, correcto; como camino para el modo métrico, no recupera nada: bajo el mismo METERED la pérdida es determinística por la codificación;
2. **"Separar el artefacto del canal"** — presupone que el artefacto, una vez guardado, decodifica; con 1 + 3, no decodifica — separar el canal no cambia lo que ha sido guardado;
3. **"Renombrar y declarar la derivación"** — válido organizacionalmente y ya emitido en el complemento; no es, sin embargo, un camino de integración del modo métrico original, pues no alcanza la invertibilidad faltante.

**Delimitación del registro:** la Revisión del Mantra vale como prueba en planta del Abhedyam en el lore-plugin, y su análisis propuso lo que la información de la época permitió — ese mérito queda registrado intacto. Ese análisis agrega la información faltante y con ella cierra el juicio: **los caminos de integración de la Revisión del Mantra no son válidos para el pipeline original** — lo que parecía problema de implementación es problema arquitectural. La corrección de referencia (`abhedya-chhandas.mjs`, `abhedya-chhandas-rs/` 1.0.25) prueba que una arquitectura sanable existe; pero es otra arquitectura — cualquier retomada parte de ella, no del original.

## 9. Encadenamiento causal de la falla

```
1  no inyectivo              →  el verso ya no lleva el dato (pérdida antes de la transmisión)
2  primer-par + fail 0       →  el decode resuelve colisiones de forma sistemática y acepta tokens falsos
3  danda no borrado          →  el uso del medidor inserta tokens que se vuelven ceros y quebran el alineamiento
4  corte numérico ≠ fonético →  el patrón impuesto por el kem no aparece en el verso
5  wrap no uniforme          →  bias mensurable contra la alegación de uniformidad
6  peso solo por matra       →  nada se lee como métrica auténtica, aun corrigiendo 1–5
```

**Cualquiera de ellas, sola, ya tumba el modo métrico**; 1 + 3 **se combinan** con la falla direccional de 2. La falla observada en campo entre 02-07 y 08-08 es la previsible por la arquitectura de la Causa 1: falta de inyectividad + danda → resultado que no se decodifica. La sesión de pruebas registró la consecuencia; este análisis documenta las causas.

## 10. Qué prueba la corrección

Las correcciones de referencia en el directorio (`abhedya-chhandas.mjs`; `abhedya-chhandas-rs/`1.0.25) muestran que las causas 1–5 son sanables: mapeo biyectivo (`Z_528` directo) resuelve las causas 1 y 2; filtrar efectivamente el danda resuelve la causa 3; peso por la identidad real de la matra resuelve la causa 4 (la corrección de la causa 6 requiere el ámbito adicional de análisis fonético por posición). En el mismo dominio, 528 valores → 528 sílabas distintas, y la ida y vuelta completa `0..527` cierra — es decir, cada error listado tiene una solución verificable, y es eso lo que aquí existe como referencia. La corrección de la Causa 6 (peso por posición) es un ámbito adicional que no compromete la reversibilidad del mapeo (Causas 1–5). La esteganografía funcional (ida y vuelta completa) no depende de ella.

---

*Código original:  `src/lib.rs`. Referencia del consumidor: `abhedya-kem 1.0.24 - Análise.md`. Prueba en planta: `Revisión-Mantra_LUS.docx`.  Reconstrucciones: `abhedya-chhandas.mjs`, `abhedya-chhandas-rs/`.*
