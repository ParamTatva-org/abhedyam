// abhedyam-standard-decrypt.mjs — decifra SÓ no modo STANDARD (ML-KEM-768), tudo no terminal
// the secret key comes from the terminal (-k or prompt); the envelope comes from --in or pipe.
// uso:
//   node abhedyam-standard-decrypt.mjs -k <sk-hex> --in envelope.bin
//   cat envelope.bin | node abhedyam-standard-decrypt.mjs -k <sk-hex>

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
  let skHex = keyArg;
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!skHex) {
      skHex = (await rl.question("Paste the secret key (hex): ")).trim();
      if (!skHex) die("empty key");
    }
    rl.close();
  } else if (!skHex) {
    die("point to the secret key: -k <sk-hex>");
  }

  const data = inFile ? fs.readFileSync(inFile)
    : fs.existsSync("abhedyam-standard.bin") ? fs.readFileSync("abhedyam-standard.bin")
    : fs.readFileSync(0);
  const sdk = new Abhedya();
  const back = sdk.decrypt(Buffer.from(skHex, "hex"), data);

  console.log("");
  console.log("VERIFIED: KEM + colophon hash + GCM tag OK");
  console.log("MESSAGE:");
  console.log(back.toString());
} catch (e) {
  die(`wrong key or altered envelope: ${e.message}`);
}
