// abhedyam-classic-decrypt.mjs — decifra SÓ no modo CLASSIC (AES-256-GCM), tudo no terminal
// la clave bruta entra por la terminal (-k o pregunta); el poema entra por --in o pipe.
// uso:
//   node abhedyam-classic-decrypt.mjs -k <hex64> --in poema.txt
//   cat poema.txt | node abhedyam-classic-decrypt.mjs -k <hex64>

import fs from "node:fs";
import readline from "node:readline/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { Abhedya } = require("./index.js");

function die(msg) {
  console.error(msg);
  process.exit(1);
}

const argv = process.argv.slice(2);
let keyArg = null, inFile = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "-k" || argv[i] === "--key") keyArg = argv[++i];
  else if (argv[i] === "--in") inFile = argv[++i];
}

try {
  let keyHex = keyArg;
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!keyHex) {
      keyHex = (await rl.question("Pega la clave de la cifra (hex 64): ")).trim();
      if (!keyHex) die("clave vacía");
    }
    rl.close();
  } else if (!keyHex) {
    die("apunta la clave de la cifra: -k <hex64>");
  }

  const data = inFile ? fs.readFileSync(inFile)
    : fs.existsSync("poema-classic.txt") ? fs.readFileSync("poema-classic.txt")
    : fs.readFileSync(0);
  const sdk = new Abhedya();
  const back = sdk.decrypt(Buffer.from(keyHex, "hex"), data);

  console.log("");
  console.log("VERIFICADO: hash del colofón + tag GCM OK");
  console.log("MENSAJE:");
  console.log(back.toString());
} catch (e) {
  die(`clave errada o poema alterado: ${e.message}`);
}
