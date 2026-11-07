// bench-standard.mjs — benchmark do modo STANDARD (ML-KEM-768), ponta a ponta
// mede: keygen, encapsular+HKDF, cifrar poema, decapsular, decifrar; repete N vezes.
// uso: node bench-standard.mjs [repetições] [mensagem]

import crypto from "node:crypto";
import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { Abhedya, EncryptionMode } = require("./index.js");

const N = Math.max(1, parseInt(process.argv[2] ?? "10", 10));
const MSG = Buffer.from(process.argv[3] ?? "PEDIDO18051974");

function stats(times) {
  const s = [...times].sort((a, b) => a - b);
  return { mean: times.reduce((a, b) => a + b, 0) / times.length, p50: s[Math.floor(s.length / 2)], max: s[s.length - 1] };
}
function show(label, times) {
  const { mean, p50, max } = stats(times);
  console.log(`${label.padEnd(28)} méd ${mean.toFixed(3).padStart(9)} ms · p50 ${p50.toFixed(3).padStart(9)} ms · máx ${max.toFixed(3).padStart(9)} ms`);
}

const sdk = new Abhedya();
const tKeygen = [], tEnc = [], tDec = [];
let env;
for (let i = 0; i < N; i++) {
  let t0 = performance.now();
  const { publicKey, secretKey } = sdk.keygen();
  tKeygen.push(performance.now() - t0);

  t0 = performance.now();
  env = sdk.encrypt(publicKey, MSG, EncryptionMode.STANDARD);
  tEnc.push(performance.now() - t0);

  t0 = performance.now();
  const back = sdk.decrypt(secretKey, env);
  tDec.push(performance.now() - t0);

  if (!back.equals(MSG)) throw new Error("volta divergiu");
}

console.log(`STANDARD (ML-KEM-768) · ${MSG.length} B → envelope ${env.length} B · repetições: ${N}\n`);
show("keygen (par KEM)", tKeygen);
show("cifrar (encapsular+poema)", tEnc);
show("decifrar (decapsular+poema)", tDec);
const total = tKeygen.map((_, i) => tKeygen[i] + tEnc[i] + tDec[i]);
show("PROCESSO COMPLETO", total);
