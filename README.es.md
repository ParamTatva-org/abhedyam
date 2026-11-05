<p align="center">
  <img src="assets/abhedyam-logo.jpeg" alt="Abhedyam Logo" width="300"/>
</p>

**Idiomas:** [English](README.md) | [Português](README.pt.md) | [Español](README.es.md)

# Abhedyam (अभेद्यम्)

**Abhedyam** ("Lo inquebrantable") es un framework disruptivo de criptografía poscuántica (PQC) que armoniza la teoría matemática de retículos con la variedad topológica de la lengua sánscrita. 

> _"Los números son construcciones. El lenguaje es la verdad."_

## Visión general

A diferencia de los frameworks tradicionales de PQC, que se basan únicamente en el aumento del tamaño de las claves y las distribuciones de error para combatir a los adversarios cuánticos, Abhedya introduce una capa de **esteganografía basada en el lenguaje**. Al mapear primitivas criptográficas al alfabeto sánscrito ordenado matemáticamente (Varnamala) y aplicar la métrica poética (Chhandas), Abhedya logra:

- **Seguridad cuántica**: Resistencia basada en retículos (LWE) que cumple con el Nivel 3 del NIST (Kyber-768).
- **Descifrado sin latencia**: Tiempo de descifrado de **~5 µs** (20 veces más rápido que Kyber) mediante mapeo directo de las variedades topológicas. 
- **Esteganografía**: Ciphertext indistinguible de una poesía épica ("Mahakavya") válida en sánscrito. 

## Arquitectura

Este repositorio contiene los binarios verificados y la documentación del ecosistema Abhedya. El código fuente principal es propiedad de **ParamTatva**, distribuido bajo la licencia MIT, que permite su uso, modificación y redistribución.

- `bin/`: Herramientas de la CLI precompiladas para macOS/Linux (`abhedya-cli`).
- `docs/`: Especificaciones técnicas e informes de conformidad.

## Uso

### 1. Instalación

Descarga el binario `abhedya-cli` del directorio `bin/` y añádelo a tu PATH.

### 2. Benchmarking

Comprueba el rendimiento y la conformidad en tu equipo local:

```bash
# Ejecute el benchmark del modo estándar
./bin/abhedya-cli --benchmark

# Ejecute el benchmark del modo métrico (Poético)
./bin/abhedya-cli --benchmark --meter
```

### 3. Comparación

Compara Abhedya con los 20 principales candidatos al PQC de NIST:

```bash
./bin/abhedya-cli --compare
```

## Análisis de superioridad

Lea [superiority.md](docs/superiority.md) para obtener un desglose detallado de por qué Abhedya supera a los frameworks puramente matemáticos en cuanto a velocidad, filosofía e implementación.

## Refuerzo de la seguridad (v1.0.1)

Tras una rigurosa auditoría de seguridad realizada por investigadores independientes, se ha reforzado la biblioteca principal contra ataques avanzados de canal lateral:

- **Eliminación del oráculo de temporización**: Se ha implementado la **codificación en tiempo constante** con búsqueda de ventana fija optimizada para AVX2, lo que garantiza que el tiempo de cifrado sea independiente del mensaje secreto.
- **Eliminación del sesgo**: Se ha aplicado un estricto **truncamiento del módulo** ($q < 3168$) para garantizar una correspondencia perfectamente uniforme con el alfabeto sánscrito, eliminando así cualquier sesgo estadístico.
- **Integridad esteganográfica**: Se ha formalizado la distinción entre el **modo estándar** (ruido conforme a FIPS) y el **modo métrico** (privacidad esteganográfica) para prevenir vulnerabilidades por deriva distribucional.


## Prueba de Concepto: Esteganografía Lingüística Aplicada a Finanzas (1.0.45)

Este fork contiene una prueba de concepto (POC) cuyo objetivo es demostrar la viabilidad técnica de la esteganografía lingüística para proteger transacciones financieras. Para demostrar la viabilidad, la POC utiliza una carga útil ficticia basada en la especificación de la BRICS Pay E-commerce API que simula una compra internacional de un producto digital (la edición estándar del juego Escape from Tarkov), con el pago realizado en Brasil vía Steam y liquidado en BRICS Pay, en la cual la mitad del valor original (R$ 115) se envía a Battlestate Games (publicadora del juego) en Rusia.

## Auditoría y correcciones (1.0.45)

Esta sección es la contribución de [Lonely Alchemist](https://github.com/lonelyalchemist), añadida a la traducción anterior: lo que sigue registra lo que el análisis línea por línea del código publicado y una prueba práctica de integración real constataron sobre las afirmaciones de la narrativa original — y las correcciones verificadas de la versión **1.0.45**, con números que cualquier persona puede verificar.

## Síntesis

Las auditorías no reprodujeron, de forma independiente, ninguna de las tres afirmaciones centrales del README original ("~5 µs de descifrado, 20× más rápido que Kyber", "texto cifrado indistinguible de Mahakavya válido", "auditoría de seguridad por investigadores independientes v1.0.1"). El trabajo consistió en un análisis línea por línea del código publicado y una prueba práctica de integración real: se leyó el código que fue publicado, se ejecutó lo que era ejecutable, se midió lo que se pudo medir, y se reescribió la implementación para que el proyecto cumpla lo que afirma. 

## Nota sobre la metodología

La falla del código original fue identificada empíricamente mediante pruebas prácticas realizadas entre el 02 de julio y el 08 de agosto de 2026. Las auditorías asistidas por IA (OpenCode) se utilizaron posteriormente como herramienta de apoyo para mapear y documentar las causas de la falla. La conclusión final y la corrección propuesta (versión 1.0.45) son responsabilidad del autor de la contribución. 

## Afirmación → constatación

| La lectura original afirma | Lo que constató las auditorías |
|---|---|
| ["~5 µs" para descifrar, 20× más rápido que Kyber; "< 1 µs" en el camino de cifrado (docs/superiority.md)](docs/superiority.md) | El modo ESTÁNDAR tarda en promedio **1,653 ms** y el ciclo completo **4,939 ms**; CLASSIC tarda en promedio **0,575 ms** (p50 0,456 ms). Ningún número en microsegundos fue reproducido; ver [La afirmación de los 20× más rápidos](#la-afirmación-de-los-20x-más-rápidos) |
| ["Resistencia basada en la red de reticulados (LWE) en conformidad con el Nivel 3 del NIST (Kyber-768)"](README.pt.md) | El crate publicado (`abhedya-kem 1.0.24`) es **un PKE, no un KEM**: no posee `encapsulate`/`decapsulate`, ni secreto compartido, ni KDF ([análisis §4](#fuentes)). Su modo "Metered" **no descifra**: el ruido ajustado posteriormente (≈ −125 por coordenada) eleva `s·e'` a desviación ≈ 2450 contra el umbral de decisión `Q/4 = 832` — error de bit cercano al 50% por símbolo ([§1](#fuentes)) |
| ["Cifrado indistinguible de una poesía épica (Mahakavya) válida en sánscrito"](README.es.md) | En el código publicado, "`to_sanskrit` nunca se llama" — el modo que anuncia "Chhandas Output, High Steganography" genera solo enteros truncados, ningún verso ([§2 del análisis](#fuentes)). La versión 1.0.45 escribe poemas de verdad (sargas Anuṣṭubh 8 hemistíquios + puṣpikā con hash del contenido), pero "indistinguible de Mahakavya válida" sigue siendo una aspiración: el universo es de 528 sílabas ordenadas, detectable por estadística en principio |
| ["Auditoría rigurosa de seguridad por investigadores independientes v1.0.1: Codificación en Tiempo Constante AVX2, truncamiento q < 3168"](README.es.md) | Código publicado: `dot_avx2` es código muerto (nunca llamado); la afirmación de tiempo constante es falsa en la práctica (`if r_val == 0 { continue }` y ramificación de salida temprana sobre datos); el comentario anuncia "81 intentos" para un bucle de 257; el truncamiento `< 3168` no coincide con el dominio del propio crate chhandas (Z_528; 3168/528 = 6 vueltas — mapeo ambiguo, sin decodificación unívoca) ([§3, §5, §6 del análisis](#fontes)). No se ha identificado ningún investigador de la auditoría citada, poniendo en duda su veracidad. |
| [`challenge.txt`: "Descifrar cuerpo usando ChaCha20 (Clave=SS, Nonce=0s)"`](challenge.txt) | Orientación peligrosa: el mismo par de claves con nonce fijo reutiliza la keystream entre mensajes, destruyendo la confidencialidad. La versión 1.0.45 vincula la clave simétrica al ciphertext del KEM (`HKDF(ss, salt=kem_ct)`) precisamente para evitar esta clase de fallas. |
| ["El código fuente principal es propiedad de ParamTatva... distribuido bajo licencia MIT"](README.es.md) | Contradicción interna: código fuente "propietario" bajo [licencia MIT](LICENSE), que existe precisamente para permitir auditoría y redistribución. La declaración correcta requiere elegir: código abierto auditable o alegaciones de terceros. |

## La afirmación de los 20× más rápidos

### 1. La comparación es un error de categoría

Kyber-768/ML-KEM es un **KEM**: encapsula un secreto y no cifra mensajes. "20× más rápido que Kyber" compara un pipeline completo (KEM + cifrado autenticado + esteganografía + métrica poética) con una operación que, por sí misma, no cifra nada. Kyber solo no entrega ninguna de las funciones que el proyecto promete — por lo tanto, la afirmación de "más rápido que Kyber" no tiene sustento en el código original. 

### 2. El número alegado no es reproducible en los artefactos publicados

La prueba práctica de integración real ([Revisión-Mantra_LUS](#fontes), LUS/Logos, 03-08-2026) documentó que el SDK publicado ni siquiera llega a ejecutarse: el binding `@abhedyam/sdk` es solo un `koffi.load()` por una biblioteca nativa ausente del npm y del repositorio — "koffi.load() lanza excepción en la primera línea". El mismo registro documentó el API mal utilizado (llamadas con objeto cuando el SDK espera posiciones; lectura de `result.ciphertext` cuando `encrypt` devuelve Buffer) y pérdida de datos garantizada a partir del segundo guardado. Ningún camino "offline/online" con pre-cálculo de pad (superiority.md §4) existe en código auditable publicado.

### 3. Lo que hace la arquitectura corregida

Benchmark abierto de la contribución 1.0.45 (`sdks/js/`), mensaje de 14 B, 10 repeticiones:

| Operación | STANDARD (ML-KEM-768) | CLASSIC (AES-256-GCM) |
|---|---|---|
| keygen (par KEM) | media 0,978 ms · p50 0,213 ms | — |
| cifrado (→ poema) | media 2,308 ms · p50 1,185 ms | media 1,058 ms · p50 0,752 ms |
| descifrado (poema →) | media 1,653 ms · p50 1,422 ms | media 0,575 ms · p50 0,456 ms |
| **proceso completo** | **media 4,939 ms · p50 2,823 ms** | **media 1,633 ms · p50 1,200 ms** |

La superioridad de la arquitectura corregida no está en entregar un Kyber sin latencia — está en **entregar el trabajo que el reproductor espera**: máximos de milisegundos en lugar de afirmaciones de microsegundos en un modo que no descifra. Sin SIMD manual, sin pre-cálculo no auditable, con HKDF en cada cifra: código portátil que funciona en cualquier máquina con Node moderno — y devuelve, en milisegundos, todo el ciclo con versos completos y puṣpikā verificable (`॥ iti … ॥`).

## Las correcciones y adiciones de la 1.0.45

- **SDK JavaScript auditable** (`sdks/js/index.js`): sin dependencias nativas — solo `node:crypto`; elimina la vinculación `koffi` sobre biblioteca ausente.
- **STANDARD** = KEM de las reglas: **ML-KEM-768** (FIPS 203) vía `generateKeyPairSync`/`encapsulate`/`decapsulate`; clave AES-256-GCM derivada `HKDF(ss, salt = ciphertext-KEM, 'abhedya-kem-aes/v1')` — la clave queda atada al sobre que la transporta.
- **CLASSIC** = AES-256-GCM de clave bruta de 32 B (ex-"METERED": en la 1.0.41 este nombre era solo etiqueta de salida de la misma cifra — no era algoritmo distinto).
- **Poema completo en ambos modos**: sargas Anuṣṭubh de 8 hemistíquios (2 shlokas = 64 sílabas) y marcadores romanos para enumerar las sargas del poema.
- **Puṣpikā (पुष्पिका)** — el colofón que cierra el poema: `॥ iti <29 sílabas del hash del contenido> ॥`.
- **JSON compacto en texto plano**: deflate de una sola vez por marcador, JSON compacto antes del deflate — la carga útil de BricsPay de 570 B cayó a 442 B; verso ~30% menor.
- **Proceso de cifrado/descifrado**: el script de cifrado guarda el poema en `.txt` y muestra en el terminal solo las claves (ESTÁNDAR: pública + secreta; CLÁSICO: clave de la cifra); el descifrado lee el `.txt`, muestra el mensaje y guarda el resultado en `.restored`.
- **Benchmarks PT/EN/ES × ESTÁNDAR/CLÁSICO**: `abhedyam-standard-benchmark.mjs`, `abhedyam-classic-benchmark.mjs`.

 ## Lo que permanece honesto

- **Esteganografía es una capa adicional de protección**: el poema oculta el cifrado y el cifrado protege el payload.
- **"Inquebrantable" es el nombre del proyecto, no una afirmación técnica**: ningún esquema criptográfico tiene prueba de inquebrantabilidad.
- **Los tiempos dependen de la máquina**: los números aquí son de referencia; ejecuta los benchmarks en tu propia máquina para confirmar el tiempo presentado.

## Reproducir

```bash
 cd abhedyam-1.0.45

# Elige el sufijo del idioma: - en, - es o - pt
node abhedyam-classic-benchmark-es.mjs 
node abhedyam-standard-benchmark-es.mjs 
node abhedyam-classic-encrypt-es.mjs 
node abhedyam-classic-decrypt-es.mjs 
node abhedyam-standard-encrypt-es.mjs 
node abhedyam-standard-decrypt-es.mjs
 ```

La contribución también incluye los documentos de la auditoría — `abhedya-kem 1.0.24 - Análise.md` y `abhedya-chhandas 1.0.24 - Modo Métrico - Análisis.md` (PT/EN/ES) — citados en la sección Fuentes.

## Fuentes

- **Análisis de defectos — `abhedya-kem 1.0.24` (`src/lib.rs`)**, 2026-10-24: análisis línea por línea del código **publicado** (docs.rs, crate 1.0.24, MIT, ParamTatva-org/abhedyam). Resumen: §1 el modo Metered rompe la propia descifrado (y la prueba lo oculta); §2 el "verso" prometido no existe (`to_sanskrit` nunca se llama); §3 inconsistencia con el crate `abhedya-chhandas` (dominio 3168 vs Z_528, pesos fonéticos falsos); §4 es un PKE, no KEM; §5-§6 bugs latentes y alegaciones de seguridad vs. realidad (CT falsa, `dot_avx2` muerto, ruido η=1, pk de 1,2 MB); §7 la métrica S-L-S-L no es Anuṣṭubh (solo las posiciones 5 y 6 son fijas en la métrica real). Complemento en `abhedya-chhandas 1.0.24` (crates.io): la prueba `test_metered_mode_constraints` valida el corte numérico `idx < 8` y nunca lee el verso — "la prueba verde mide el atributo incorrecto".
- **Revisión-Mantra_LUS** (análisis de Andrés Peña, LUS/Logos, 03-08-2026): la **prueba práctica de integración real** de Abhedyam en el lore-plugin — el fork Mantra (autor tercero) intentó cifrar el lore con `@abhedyam/sdk` (N=768/Q=3329, METERED) y registró, de forma verificable: binario nativo ausente (`koffi.load()` lanza en la primera línea), API mal utilizada (objeto vs. posiciones; `result.ciphertext` sobre Buffer), pérdida de datos garantizada a partir del segundo guardado, ruta rota dentro del plugin, sobrescribir en lugar de acumular, frontmatter roto, `node_modules/` commitado. "Estado: no funciona — no es una opinión; es verificable". [Archivo `Revisión-Mantra_LUS.docx´]

## Licencia y atribución

El código fuente permanece bajo la licencia MIT original ([LICENSE](LICENSE)) — y eso es lo que corrige la narrativa: el código siempre ha estado disponible bajo MIT; la auditoría solo aparece en esta contribución. Las correcciones 1.0.45 siguen siendo MIT. La métrica y los nombres en sánscrito pertenecen a la tradición; las correcciones y mediciones son de la contribución de [Lonely Alchemist](https://github.com/lonelyalchemist).


**ParamTatva**, 2026.
