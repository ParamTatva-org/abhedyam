// abhedyam-standard-encrypt.mjs — cifra SÓ no modo STANDARD (ML-KEM-768)
// prints the keys to the terminal; the poem goes to poema-standard.txt.
// uso: node abhedyam-standard-encrypt.mjs [mensagem] [-o poema.txt]

import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { Abhedya, EncryptionMode } = require("./index.js");

const argv = process.argv.slice(2);
let outPath = "abhedyam-standard.bin";
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "-o" || argv[i] === "--out") outPath = argv[++i];
  else positional.push(argv[i]);
}
const [msg = "PEDIDO18051974"] = positional;
const sdk = new Abhedya();
const { publicKey, secretKey } = sdk.keygen();

console.log(`message: ${msg}`);
console.log("");
console.log("PUBLIC KEY (DER SPKI, hex):");
console.log(publicKey.toString("hex"));
console.log("");
console.log("SECRET KEY (DER PKCS8, hex — keep it, it decrypts):");
console.log(secretKey.toString("hex"));
console.log("");

const envelope = sdk.encrypt(publicKey, msg, EncryptionMode.STANDARD);
const txtPath = outPath.replace(/\.bin$/i, ".txt");
fs.writeFileSync(txtPath, poems + "\n", "utf8"); // poema legível (.txt)
fs.writeFileSync(outPath, envelope); // envelope binário: o que a decifra lê
console.log(`ENVELOPE: ${envelope.length} B ([só poema — kem_ct + AES dentro dos sargas])`);
console.log(`POEM written to ${txtPath} (Anuṣṭubh sargas + colophon ॥ iti … ॥ — reading)`);
console.log(`ENVELOPE written to ${outPath} (binary — decrypt input)`);
