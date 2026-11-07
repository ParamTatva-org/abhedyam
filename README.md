<p align="center">
  <img src="assets/abhedyam-logo.jpeg" alt="Abhedyam Logo" width="300"/>
</p>

**Languages:** [English](README.md) | [Português](README.pt.md) | [Español](README.es.md)

# Abhedyam (अभेद्यम्)

**Abhedyam** ("The Unbreakable") is a paradigm-shifting Post-Quantum Cryptography (PQC) framework that harmonizes mathematical lattice theory with the topological manifold of the Sanskrit language.

> _"Numbers are constructs. Language is Truth."_

## Overview

Unlike traditional PQC frameworks that rely solely on increasing key sizes and error distributions to combat quantum adversaries, Abhedya introduces a **Language-Based Steganography** layer. By mapping cryptographic primitives to the mathematically ordered Sanskrit alphabet (Varnamala) and enforcing poetic meter (Chhandas), Abhedya achieves:

- **Quantum Security**: Core Lattice-based hardness (LWE) matching NIST Level 3 (Kyber-768).
- **Zero-Latency Decryption**: **~5 µs** decryption time (20x faster than Kyber) via direct manifold mapping.
- **Steganography**: Ciphertext indistinguishable from valid Sanskrit "Mahakavya" (Epic Poetry).

## Architecture

This repository contains the verified binaries and documentation for the Abhedya ecosystem. The core source code is proprietary to **ParamTatva**.

- `bin/`: Pre-compiled CLI tools for macOS/Linux (`abhedya-cli`).
- `docs/`: Technical specifications and compliance reports.

## Usage

### 1. Installation

Download the `abhedya-cli` binary from the `bin/` directory and add it to your PATH.

### 2. Benchmarking

Verify the performance and compliance on your local machine:

```bash
# Run Standard Mode Benchmark
./bin/abhedya-cli --benchmark

# Run Metered (Poetic) Mode Benchmark
./bin/abhedya-cli --benchmark --meter
```

### 3. Comparison

Compare Abhedya against Top 20 NIST PQC candidates:

```bash
./bin/abhedya-cli --compare
```

## Superiority Analysis

See [superiority.md](docs/superiority.md) for a detailed breakdown of why Abhedya outperforms purely mathematical frameworks in speed, philosophy, and implementation.

## Security Hardening (v1.0.1)

Following a rigorous security audit by independent researchers, the core library has been hardened against advanced side-channel attacks:

- **Timing Oracle Elimination**: Implemented **Constant-Time Encoding** with AVX2-optimized fixed-window search, ensuring encryption time is independent of the secret message.
- **Bias Elimination**: Enforced strict **Modulus Truncation** ($q < 3168$) to guarantee perfectly uniform mapping to the Sanskrit alphabet, removing all statistical bias.
- **Steganographic Integrity**: Formalized the distinction between **Standard Mode** (FIPS-compliant noise) and **Metered Mode** (Steganographic privacy) to prevent distributional drift vulnerabilities.

## Proof of Concept: Linguistic Steganography Applied to Finance (1.0.45)

This fork contains a proof of concept (POC) whose goal is to demonstrate the technical feasibility of linguistic steganography to protect financial transactions. To demonstrate feasibility, the POC uses a fictitious payload based on the BRICS Pay E-commerce API specification, which simulates an international purchase of a digital product (the standard edition of the game Escape from Tarkov), with the payment made in Brazil via Steam and settled through BRICS Pay, in which half of the original amount (R$ 115) is sent to Battlestate Games (the game's publisher) in Russia.

## Audits and corrections (1.0.45)

This section is the contribution of [Lonely Alchemist](https://github.com/lonelyalchemist), added to the above translation: what follows records what the line-by-line analysis of the published code and a real integration test verified about the claims of the original narrative — and the verified corrections of version **1.0.45**, with numbers that anyone can verify. 



## Summary

The audits did not independently reproduce any of the three main claims from the original README ("~5 µs to decrypt, 20× faster than Kyber", "ciphertext indistinguishable from valid Mahakavya", "security audit by independent researchers v1.0.1"). The audits consisted of a line-by-line analysis of the published code and a practical real-world integration test: the code that was actually published was read, what runs was executed, what could be measured was measured, and the implementation was rewritten so that the project does what it claims.

## Note on the methodology

The failure of the original code was empirically identified through practical tests conducted between July 2 and August 8, 2026. AI-assisted audits (OpenCode) were subsequently used as a support tool to map and document the causes of the failure. The final conclusion and the proposed correction (version 1.0.45) are the responsibility of the contributor. 



---

**ParamTatva**, 2026.
