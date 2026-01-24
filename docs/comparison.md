# Post-Quantum Framework Comparison
**Date**: 2026-01-23
**Metric**: Average micro-seconds (µs) per operation, Bytes (B) for sizes.

## 1. Top 20 PQC Frameworks Benchmark
Comparison of **Abhedya** against NIST Round 3/4 Finalists and Alternates.

*   **Live Bench**: Executed locally on this machine alongside Abhedya.
*   **NIST Ref**: Reference performance data from standard implementations.

| Algorithm | Class | Enc (µs) | Dec (µs) | PK Size (B) | CT Size (B) | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Abhedya (PoC)** | Lattice (Sanskrit) | 2629.51 | 2.26 | 1536 | 1538 | Live Bench |
| **Abhedya (Metered)** | Lattice (Sanskrit) | 8370.21 | 3.41 | 1536 | 1826 | Live Bench |
| **Kyber-768** | Lattice (Module) | 72.41 | 85.41 | 1184 | 1088 | Live Bench |
| **Classic McEliece-348864** | Code-Based | 16.80 | 32.88 | 261120 | 96 | Live Bench |
| **FrodoKEM-976** | Lattice | 2500.00 | 2400.00 | 15632 | 15744 | NIST Ref |
| **NTRU-HPS-2048-677** | Lattice | 35.00 | 60.00 | 930 | 930 | NIST Ref |
| **Saber** | Lattice | 58.00 | 64.00 | 992 | 1088 | NIST Ref |
| **BIKE-L1** | Code-Based | 160.00 | 5200.00 | 1541 | 1573 | NIST Ref |
| **HQC-128** | Code-Based | 140.00 | 280.00 | 2249 | 4481 | NIST Ref |
| **Dilithium-3** | Lattice (Sig) | 130.00 | 55.00 | 1952 | 3293 | NIST Ref |
| **Falcon-512** | Lattice (Sig) | 290.00 | 45.00 | 897 | 666 | NIST Ref |
| **SPHINCS+-SHA256** | Hash-Based | 350000.00 | 15000.00 | 32 | 17088 | NIST Ref |
| **SIKE-p434 (Broken)** | Isogeny | 6000.00 | 6500.00 | 330 | 346 | NIST Ref |
| **Rainbow-I** | Multivariate | 52.00 | 60.00 | 157800 | 64 | NIST Ref |


## 2. Analysis

### Performance
*   **Abhedya vs Kyber**: Abhedya (2629.51 µs) is slower/faster than Kyber-768.
*   **Abhedya vs McEliece**: Abhedya has significantly smaller public keys (1.5KB vs 260KB+).
*   **Metered Mode Impact**: Adding Chhandas (Meter) increases ciphertext size by approx 10-15% (due to separators) but adds structural obfuscation.

## 3. Validation
To run the live comparisons:

```bash
cargo run --release --bin abhedya-cli -- --compare 
```
