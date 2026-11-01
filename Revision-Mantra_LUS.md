# Revision — Mantra LUS

*Analysis from the LUS research program · corpus v1.9 (Phase VII)*

Repository analyzed: github.com/lonelyachemist-arch/Mantra · Compared against: github.com/andresanemic/lore-plugin · Date: August 3, 2026 · Analysis author: Andrés Peña (LUS / Logos)

# 1. Reconstructed theoretical state

**What the corpus asserts today.** The unit of LUS is the Entre (relation with interdependence and finality). The Lore is relational experience distilled into transferable criterion, of **teleological** value: it matters with respect to the finality of the Entre that produced it. Its operational function is to raise the IME — contextual continuity, semantic density, distillation capacity. State IV (collapse) has a named symptom: *«the Lore stops being consulted»*.

**What is open.** H01 (n=2), H02 (n=0), H05 (n=0 +1 partial), H06 (n=1), H07 (n=0 +1 analog), H08 (n=1). Priority theoretical debt: the **rift** — theory of the phenomenon or criterion of the method? —, four occurrences. v2.0 requires operationalizing the IME.

**Active phase.** VII — Case studies, corpus v1.9 (2026-07-28).

# 2. What this repository does

Lonelyachemist-arch/Mantra is the lore-plugin, **copied and modified by a third party**. It is not a GitHub fork: the first commit (2026-07-19) is *«Add files via upload»* — the files were uploaded by hand, so the GitHub interface shows no link to andresanemic/lore-plugin. Authorship of all commits: Lonely Alchemist.

File-by-file comparison against the local copy of lore-plugin:

| File | State |
|---|---|
| README, USAGE_es/en, REFERENCE_es/en, MIGRATION_es/en, LICENSE, plugin.json, marketplace.json | **Identical** (they still say andresanemic / lore / v1.0.3) |
| create-area, create-project, transmute-lore | **Identical** |
| using-lore/SKILL.md | +48 lines: *Manual Decryption* section |
| save-to-lore/SKILL.md | Step 1 rewritten: encrypt before saving |
| abhedyam-helper.js, decrypt-helper.js | **New** |

**The change, in one sentence:** the Lore stops being written in readable Markdown and is stored **encrypted** with @abhedyam/sdk (post-quantum lattice/LWE N=768 cryptography, in METERED mode — steganography that produces a «poem in Sanskrit»). To read it, the user pastes their private key into the chat and the skill decrypts it in memory.

## 2.1 Technical state: it does not work

Not an opinion; it is verifiable:

1.  **The binary is missing.** @abhedyam/sdk is only a koffi binding; it looks for abhedya_ffi.dll in ../../target/release or on the PATH. It is not on npm nor in the repository. koffi.load() throws on the first line.
2.  **API misused.** The helper calls sdk.encrypt({publicKey, data, mode}) and sdk.decrypt({secretKey, data}); the SDK expects **positional** arguments (pk, msg, mode). It also reads result.ciphertext when encrypt returns a Buffer. With the .dll present it would still break.
3.  **Guaranteed data loss** (abhedyam-helper.js:17-26). If public-key.pem already exists, it runs a new keygen(), encrypts with the **old** public key and hands the user the **new** secret key. They do not match. The Lore becomes unrecoverable from the second save onward.
4.  **Wrong route.** path.join(\_\_dirname, '../../lore/...') from skills/save-to-lore/ points to the **plugin** folder, not to the project's. It destroys the project↔area routing, which is the heart of the skill.
5.  **Overwrites instead of appending.** writeFileSync replaces lore/&lt;module&gt;.md entirely; the original **accumulates** entries. Each new Pista erases the previous ones.
6.  **Broken frontmatter** in save-to-lore/SKILL.md: opens with ---, uses a capitalized Name: and closes the block out of place. Claude Code probably does not even load the skill.
7.  **Hygiene.** node_modules/ committed (132 of 169 tracked files), no .gitignore, and a nested copy lore-plugin-main/lore-plugin-main/ with a different version of the same two skills.

# 3. Analysis (Logos)

## 3.1 The strength — real, and it must be acknowledged

Mantra touches a **genuine rift in the corpus**: LUS treats the Lore as *patrimony* and talks a lot about **transferability**, but says **nothing about ownership or confidentiality**. If the criterion is the asset, whose is it? Can the artifact be shared without giving away the criterion?

And here is the datum that matters: **that question was already challenged within the program**. The hypothesis log records that on 2026-07-12 a third independent path — *«what sense does cryptography make if the goal is to share the Lore?»* — led to H05. Someone external, without seeing the corpus, arrived at the same question in eleven days. That does not validate the implementation, but it is a signal that the rift is not the author's: it is in the object.

## 3.2 The root cause of the conceptual failure

It is not that encrypting is bad. It is that **encrypting the Lore contradicts the operational definition of the Lore**.

- The Lore is not a file: it is *what participates in a future decision*. The corpus states it as an axiom: *«experience only creates value when it can return to participate in a future decision»*.
- The preventive consultation of the Master Prompt (*«before proposing a solution, read our Lore»*) only works if it is **cheap and automatic**.
- An encrypted Lore requires: identifying the file → asking for the key → having the human paste it → decrypting → reading. Consultation stops being a reflex and becomes a **procedure with a human in the loop**.

And by the Operational Theory of the Entre: this attacks head-on **contextual continuity** and **semantic density**, the two variables that define the IME. The symptom of State IV is *«the Lore stops being consulted»*. Encryption does not forbid it: **it makes it expensive**. And what is expensive is not consulted.

Worse: it reproduces exactly the pattern of Case 05 / H08 — a preservation artifact that exists, is indexed, is mandatory... and participates in no decision. There the result is not observed: it is **predictable by construction**.

## 3.3 The structural inconsistency

The corpus fixes the boundary **capacity** (it is used) vs. **criterion** (it is arbitrated) — Case 03, H06. Here there was no arbitration: there was **adoption**. A capacity (steganographic PQC) was imported without subjecting it to the finality of the receiving Entre, and the result is a capacity that **annuls the finality of the artifact hosting it**. It is the perfect counterexample of why the corpus demands arbitrating and not adopting.

## 3.4 A detail that is not minor

The skill instructs the user to **paste their private key into the chat**. That key enters the model's context and the session history. A flow whose declared purpose is to protect the criterion ends up exposing the only thing whose exposure is irreversible.

## 3.5 On attribution

The MIT license permits the fork, and the LICENSE file with the original copyright is preserved — that is in order. What there **is not**: a declaration of changes, a README of its own or a renaming. plugin.json still publishes "name": "lore", "version": "1.0.3", "author": "andresanemic".

That is: anyone installing Mantra would install a plugin **claiming to be the original, at the same version**, with save-to-lore broken and destructive. That is the concrete risk, and it is not theoretical: the data loss of point 3 is deterministic.

# 4. What would be needed for the idea to survive

The underlying intuition — the criterion as an asset with an owner — deserves to be worked. The implementation, as it stands, does not. Three minimum conditions:

8.  **Fix what breaks data before anything else.** The key mismatch (abhedyam-helper.js:17-26) and the module overwriting destroy Lore irreversibly. That comes first, with or without encryption.
9.  **Separate the artifact from the channel.** The Lore must remain readable Markdown **at rest locally**; if something must be protected, it is protected **when sharing** (the repository, the transport), not at the point where the agent consults it. Encrypting in transit does not cost IME; encrypting at rest does.
10. **Rename and declare the derivation.** plugin.json and marketplace.json with their own name, own version and a derivation note in the README. MIT allows it; traceability demands it.

*The bottom of the disagreement is simple: a Lore that must be decrypted to be consulted stops being Lore and becomes a file. The question Mantra raises is good. The answer it proposes cancels the very thing it asks to protect.*
