// abhedyam-standard-encrypt.mjs — cifra SÓ no modo STANDARD (ML-KEM-768)
// exibe as chaves no terminal; o poema vai para poema-standard.txt.
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

console.log(`mensagem: ${msg}`);
console.log("");
console.log("CHAVE PÚBLICA (DER SPKI, hex):");
console.log(publicKey.toString("hex"));
console.log("");
console.log("CHAVE SECRETA (DER PKCS8, hex — guarde-a, ela decifra):");
console.log(secretKey.toString("hex"));
console.log("");

const envelope = sdk.encrypt(publicKey, msg, EncryptionMode.STANDARD); // SÓ poema (kem_ct dentro dos sargas)
const txtPath = outPath.replace(/\.bin$/i, ".txt");
fs.writeFileSync(txtPath, envelope.toString("utf8") + "\n", "utf8"); // poema legível (.txt)
fs.writeFileSync(outPath, envelope); // envelope binário (utf8 do poema): o que a decifra lê
console.log(`ENVELOPE: ${envelope.length} B (só poema — kem_ct + AES dentro dos sargas)`);
console.log(`POEMA gravado em ${txtPath} (sargas Anuṣṭubh + colofão ॥ iti … ॥ — leitura)`);
console.log(`ENVELOPE gravado em ${outPath} (binário — entrada da decifra)`);
