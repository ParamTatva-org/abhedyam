// abhedyam-classic-encrypt.mjs — cifra SÓ no modo CLASSIC (AES-256-GCM)
// exibe a chave no terminal; os poemas vão para poema-classic.txt.
// uso: node abhedyam-classic-encrypt.mjs [mensagem] [-o poema.txt]

import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { Abhedya, EncryptionMode } = require("./index.js");

const argv = process.argv.slice(2);
let outPath = "poema-classic.txt";
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "-o" || argv[i] === "--out") outPath = argv[++i];
  else positional.push(argv[i]);
}
const [msg = "PEDIDO18051974"] = positional;
const sdk = new Abhedya();
const key = crypto.randomBytes(32);

console.log(`mensaje: ${msg}`);
console.log("");
console.log("CLAVE DE LA CIFRA (hex 64 — único elemento de la descifra, guárdala):");
console.log(key.toString("hex"));
console.log("");

const poems = sdk.encrypt(key, msg, EncryptionMode.CLASSIC).toString("utf8");
fs.writeFileSync(outPath, poems + "\n", "utf8");
console.log(`POEMA grabado en ${outPath} (sargas Anuṣṭubh + colofón ॥ iti … ॥)`);
