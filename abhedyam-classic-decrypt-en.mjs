// abhedyam-classic-decrypt.mjs — decifra SÓ no modo CLASSIC (AES-256-GCM), tudo no terminal
// the raw key comes from the terminal (-k or prompt); the poem comes from --in or pipe.
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
      keyHex = (await rl.question("Paste the cipher key (hex 64): ")).trim();
      if (!keyHex) die("empty key");
    }
    rl.close();
  } else if (!keyHex) {
    die("point to the cipher key: -k <hex64>");
  }

  const data = inFile ? fs.readFileSync(inFile)
    : fs.existsSync("poema-classic.txt") ? fs.readFileSync("poema-classic.txt")
    : fs.readFileSync(0);
  const sdk = new Abhedya();
  const back = sdk.decrypt(Buffer.from(keyHex, "hex"), data);

  console.log("");
  console.log("VERIFIED: colophon hash + GCM tag OK");
  console.log("MESSAGE:");
  console.log(back.toString());
} catch (e) {
  die(`wrong key or altered poem: ${e.message}`);
}
