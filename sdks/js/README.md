# Abhedya SDK for Node.js

**Unmatched Speed. Unbreakable Security.**

Abhedya is a high-performance Post-Quantum Cryptography (PQC) library enabling **Sanskrit-Encoded** encryption. This SDK provides Node.js bindings to the optimized Rust core.

## Features

- **Quantum Safety**: Lattice-based LWE implementation ($N=768$).
- **Dual Mode**:
  - **Standard**: High-throughput binary encryption.
  - **Metered**: Steganographic mode producing Sanskrit-metered ciphertexts.
- **Performance**: High-speed C-FFI using `koffi` (Node.js 25+ compatible).
- **Zero-Copy**: Efficient buffer management.

## Installation

```bash
npm install abhedya-sdk
```

## Usage

```javascript
const { Abhedya, EncryptionMode } = require("abhedya-sdk");

// Initialize
const sdk = new Abhedya();

// 1. Generate KeyPair
console.log("Generating Keys...");
const keys = sdk.keygen();
// keys.publicKey, keys.secretKey (Buffers)

// 2. Encrypt
const message = "The quick brown fox";
const ciphertext = sdk.encrypt(
  keys.publicKey,
  message,
  EncryptionMode.STANDARD,
);

// 3. Decrypt
const plaintext = sdk.decrypt(keys.secretKey, ciphertext);
console.log("Decrypted:", plaintext.toString());
```

## API

### `keygen()`

Returns `{ publicKey: Buffer, secretKey: Buffer }`.

### `encrypt(publicKey, message, mode)`

- `publicKey`: Buffer
- `message`: String or Buffer
- `mode`: `EncryptionMode.STANDARD` (0) or `EncryptionMode.METERED` (1)
- Returns: `Buffer` (Ciphertext)

### `decrypt(secretKey, ciphertext)`

- `secretKey`: Buffer
- `ciphertext`: Buffer
- Returns: `Buffer`

## License

MIT License.
