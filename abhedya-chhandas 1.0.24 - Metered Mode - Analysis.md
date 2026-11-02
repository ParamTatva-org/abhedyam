# abhedya-chhandas 1.0.24 — Analysis of the Metered Mode

**About the test session.** The metered mode was tested in the field from **July 2 to August 8, 2026**. That analysis **does not question, reinterpret or reopen** that session: it exists solely to **map and document the causes** of the observed failure. The tests produced the data; that document organizes the why of it.

**About the practical test — real integration in the lore plugin.** There is a record of a concrete test, beyond the programming languages in which Abhedyam is available: `Revision-Mantra LUS.md` (03-08-2026) documents the attempt of the **Mantra** fork to put Abhedyam into real use — encrypting the plugin's Lore with `@abhedyam/sdk` (same N=768/Q=3329 code tree) **in METERED mode**, exactly the metered mode analyzed here. That integration constituted a practical test of the metric mode, in another environment; its failure is recorded in the LUS review at the JS layer and in this project's complement at the Rust/PQC layer. The review document, without knowing the deep errors of the code, offered paths for a real integration; **this analysis records the test and does not validate those paths** — section 8 explains why.

**Provenance.** The package is the one published on crates.io (`Cargo.toml` normalized by the registry, crate `abhedya-chhandas 1.0.24`, ParamTatva-org/abhedyam). The local `src/lib.rs` is identical to the published one analyzed in `abhedya-kem 1.0.24 - Análise.md` (section 1) — no divergence between the local and published source.

---

## 1. What the Metered Mode promises and who consumes it

`encode_vector(vec, use_meter = true)` (`lib.rs:75-88`) promises: values → Sanskrit syllables organized in **Anushtubh** (yati `।` every 8 syllables), with Laghu/Guru weights applied by `to_sanskrit`/`get_matra_weight`. The direct consumer of the underlying numeric space is `abhedya-kem` in `EncryptionMode::Metered`, which enforces "Even=Laghu, Odd=Guru" over `u % 16`.

For the metric mode to be functional, three conditions must hold simultaneously:

1. **Uniqueness:** each value encodes a different syllable (injectivity), since the verse is the vehicle of the data;
2. **Reversibility:** the decoder restores the values, even with yati present;
3. **Phonetic coherence:** the imposed numeric pattern corresponds to the real weight of the generated syllables.

None of the three holds in the original. The causes, in causal order:

## 2. Cause 1 — the encoder erases information before any transmission (not injective)

`lib.rs:51-61`: the 8 "Laghu" indices (`m_idx 0..8`) are compressed in a cycle of **5**, and the 8 "Guru" in a cycle of **11**:

- `m_idx 0` and `m_idx 5` → both produce `"a"` (collision); same for `1/6 → "ā"`, `2/7 → "i"`.
- At least **3/16 ≈ 18.75% of the entire domain** collides at encoding.

Consequence: the verse generated in metric mode **does not carry the data** — it carries an erased sum of it. No decoder, however robust, can restore what the encoder did not register. That is the root defect, and it precedes any transport layer.

## 3. Cause 2 — colliding encoding and decoding always "downward"

The decoder (`lib.rs:90-113`) sweeps `c` on the outside, `m_idx` on the inside, and returns **the first pair** whose built syllable matches the token. Since the collisions of Cause 1 produce identical strings from distinct `m_idx`, decoding systematically returns the **smallest** `m_idx`:

- A value with `m_idx = 5` (`"ka"`) decodes as `m_idx = 0` (`v' = c·16 + 0 ≠ v`).
- The roundtrip fails across the entire collision family — an error that is **systematic and directional** (never upward), which misaligns any bit-by-bit analysis over restored data.

And the final fail-safe (`lib.rs:110`): an unknown token **silently becomes `0`** — silent damage instead of error: in metric mode, an invalid syllable does not abort; it inserts a fake `"ka"` into the middle of the data.

## 4. Cause 3 — the metric mode breaks its own decoder (yati/danda)

The metric mode's encoder inserts `।` (`lib.rs:83-85`); the decoder **never handles the danda**: `split_whitespace` (`lib.rs:95`) delivers each `।` as a token, it matches no syllable → the `0` fail-safe kicks in.

**Deterministic** outcome in metric mode: every decoded yati becomes a spurious `0`, the decoded vector grows (`len + # of padas`) and **everything after the first pada misaligns**.

> That is the defect most literally "of the metric mode": only the mode that inserts `।` produces the token the decoder does not know how to erase. The original encode/decode pair is inconsistent **specifically in the use of the meter** — the mode never closed the cycle within the crate itself.

## 5. Cause 4 — the "metric pattern" holds in the numeric space, not in the verse

`get_matra_weight` (`lib.rs:67-73`) divides by a numeric cut (`idx < 8`), but real phonetics has **5** laghus. Combined with the compressive remapping of `to_sanskrit`:

- the kem enforces "Even=Laghu, Odd=Guru" over `u % 16` (numeric space);
- the syllable actually written follows the 5/11 cycle of Cause 1;
- the verse read by a trained ear **does not** exhibit the pattern the numeric test claims to have.

The kem test (`test_metered_mode_constraints`) validates the numeric cut `idx < 8` — the same inconsistent criterion of chhandas itself — and never reads the verse: the green test measures the wrong attribute (already documented in `abhedya-kem 1.0.24 - Análise.md` §3).

## 6. Cause 5 — non-uniform wrap distribution (the "crypto uniformity" claim fails)

`c_idx % 33` (`lib.rs:46`) with the comment "uniform distribution across consonants": `65536 mod 528 = 64` → the first 64 residues are systematically **over-represented**. For uniform cryptographic payload encoding, the comment's claim is unfounded — the bias is real, predictable and measurable.

## 7. Cause 6 — nothing models weight by position (the verse would never be authentic)

In real Sanskrit, Laghu/Guru is determined by **position**, not only by the identity of the matra: syllables before aspirated or conjunct consonants become Guru by position (a consonance that does not exist in the pure numeric version). `to_sanskrit` assigns weight only by the matra identity (`lib.rs:22-26`, `14-16`). Even with causes 1–5 fixed, the product would be text with a metric pattern verifiable by counting, never by reading: any trained reader would recognize the text as prosimetric, which defeats the added value the metric mode was meant to provide (masking the encrypted nature of the text).

## 8. The test in the lore plugin and the non-validated paths

The Mantra fork was, in fact, the **practical test of Abhedyam's metered mode**: the 1st test session (02-07 to 08-08) exercised it directly in the field; the Mantra integration (Revision Mantra LUS, 03-08) put it into a real pipeline — encrypting the plugin's Lore with `@abhedyam/sdk` in metered mode. Both tests failed for the same root cause: the verse never closed the cycle (Causes 1 and 3). Therefore, **no integration, on any channel, preserves the data** with the original pipeline.

The three paths of the Mantra review were written without knowledge of the deep errors of the native Rust code. The review treated the PQC layer as badly instrumented — missing binary, misused API, swapped keys — that is, as accessory defects, repairable. This analysis shows there are instrument defects (Causes 1, 3, 4) underneath them: even with the binary present, the API correct and the keys matched, the data is lost at encoding, **before** any ciphering. For that reason the paths stay here **unvalidated**, one by one:

1. **"Fix what breaks data before anything else"** — as code hygiene, correct; as a path for the metric mode, recovers nothing: under the same METERED the loss is deterministic by the encoding;
2. **"Separate the artifact from the channel"** — it presupposes that the artifact, once saved, decodes; with 1 + 3, it does not decode — separating the channel does not change what is saved;
3. **"Rename and declare the derivation"** — organizationally valid and already issued in the complement; it is however not an integration path for the original metric mode, as it does not reach the missing invertibility.

**Scoping of the record:** the Mantra Review stands as the practical test of Abhedyam in the lore plugin, and its analysis proposed what the information of the time allowed — that merit is recorded intact. This analysis adds the missing information and with it closes the judgment: **the integration paths of the Mantra Review are not valid for the original pipeline** — what looked like an implementation problem is an architectural problem. The reference correction (`abhedya-chhandas.mjs`, `abhedya-chhandas-rs/` 1.0.25) proves that a repairable architecture exists; but it is another architecture — any resumption starts from it, not from the original.

## 9. Causal chain of the failure

```
1  non-injective              →  the verse no longer carries the data (loss before transmission)
2  first-pair + fail 0        →  decoding resolves collisions systematically and accepts fake tokens
3  danda not erased           →  meter usage inserts tokens that become zeros and break alignment
4  numeric cut ≠ phonetic     →  the pattern imposed by the kem does not appear in the verse
5  non-uniform wrap           →  measurable bias against the uniformity claim
6  weight by matra only       →  nothing reads as authentic meter, even after fixing 1–5
```

**Any of them, alone, already topples the metered mode**; 1 + 3 **combine** with the directional fault of cause 2. The field-observed failure between 02-07 and 08-08 is the one predictable from the architecture of Cause 1: non-injectivity + danda → a result that does not decode. The test session recorded the consequence; this analysis documents the causes.

## 10. What the correction proves

The reference corrections in the directory (`abhedya-chhandas.mjs`; `abhedya-chhandas-rs/`1.0.25) show that causes 1–5 are repairable: a bijective mapping (`Z_528` direct) resolves causes 1 and 2; effectively filtering the danda resolves cause 3; weight by the real matra identity resolves cause 4 (fixing cause 6 requires the additional scope of phonetic analysis by position). In the same domain, 528 values → 528 distinct syllables, and the complete roundtrip `0..527` closes — that is, every listed error has a verifiable solution, and that is what exists here as reference. The correction of Cause 6 (weight by position) is an additional scope that does not compromise the reversibility of the mapping (Causes 1–5). Functional steganography (complete roundtrip) does not depend on it.

---

*Original code:  `src/lib.rs`. Consumer reference: `abhedya-kem 1.0.24 - Análise.md`. Practical test: `Revision-Mantra LUS.md`.  Reconstructions: `abhedya-chhandas.mjs`, `abhedya-chhandas-rs/`.*
