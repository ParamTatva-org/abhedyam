// abhedya-classic-benchmark-es.mjs — benchmark del modo CLASSIC (clásico, AES-256-GCM) — benchmark del proceso completo (español)
// Cifra el payload real, graba el poema, descifra y verifica; mide cada etapa.
// uso: node abhedya-classic-benchmark-es.mjs [repeticiones]

import crypto from "node:crypto";
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { encryptToVerse, decryptFromVerse, aesKeyFromHex } from "./abhedya-chhandas-aes.mjs";

const PAYLOAD_FILE = "abhedyam-payload-bricspay-pix.json";
const VERSE_FILE = "abhedyam-benchmark.verso.txt"; // temporal propio: nunca toca el poema por defecto
const KEY_FILE = "abhedyam-payload-bricspay-pix.key";
const ROMAN_RE = /^[IVXLCDM]+\.$/;

const N = Math.max(1, parseInt(process.argv[2] ?? "10", 10));

function stats(times) {
  const s = [...times].sort((a, b) => a - b);
  return { mean: times.reduce((a, b) => a + b, 0) / times.length, p50: s[Math.floor(s.length / 2)], max: s[s.length - 1] };
}

function show(label, times) {
  const { mean, p50, max } = stats(times);
  console.log(`${label.padEnd(28)} media ${mean.toFixed(2).padStart(8)} ms · p50 ${p50.toFixed(2).padStart(8)} ms · máx ${max.toFixed(2).padStart(8)} ms`);
}

const key = aesKeyFromHex(fs.readFileSync(KEY_FILE, "utf8"));
const plain = Buffer.from(JSON.stringify(JSON.parse(fs.readFileSync(PAYLOAD_FILE, "utf8"))), "utf8");

// calentamiento (JIT)
{
  const { poemaVerse } = encryptToVerse(plain, key);
  decryptFromVerse(poemaVerse, key);
}

const tEnc = [], tWrite = [], tRead = [], tDec = [], tCheck = [];
let verse = "";
for (let i = 0; i < N; i++) {
  let t0 = performance.now();
  const r = encryptToVerse(plain, key);
  verse = r.poemaVerse;
  tEnc.push(performance.now() - t0);

  t0 = performance.now();
  fs.writeFileSync(VERSE_FILE, verse + "\n", "utf8");
  tWrite.push(performance.now() - t0);

  t0 = performance.now();
  const text = fs.readFileSync(VERSE_FILE, "utf8");
  tRead.push(performance.now() - t0);

  t0 = performance.now();
  const back = decryptFromVerse(text, key);
  tDec.push(performance.now() - t0);

  t0 = performance.now();
  if (!back.equals(plain)) throw new Error("ida y vuelta divergió");
  tCheck.push(performance.now() - t0);
}

const syllables = verse.split(/\s+/).map((t) => t.replace(/[।॥]/g, "")).filter((t) => t && !ROMAN_RE.test(t) && t.toLowerCase() !== "iti").length;
const sargas = (verse.match(/^[IVXLCDM]+\.$/gm) ?? []).length;
console.log(`payload: ${plain.length} B → poema: ${Buffer.byteLength(verse)} bytes, ${syllables} sílabas, ${sargas} sargas Anuṣṭubh + colofón`);
console.log(`repeticiones: ${N}\n`);
show("cifrar (enc)", tEnc);
show("grabar poema", tWrite);
show("leer poema", tRead);
show("descifrar (dec)", tDec);
show("verificar bytes", tCheck);
const total = tEnc.map((_, i) => tEnc[i] + tWrite[i] + tRead[i] + tDec[i] + tCheck[i]);
show("PROCESO COMPLETO", total);
