// abhedya-classic-benchmark.mjs — benchmark do modo CLASSIC (clássico, AES-256-GCM) — benchmark do processo completo (ponta a ponta)
// cifra o payload real, grava o verso, decifra e confere; mede cada estágio.
// uso: node abhedya-classic-benchmark.mjs [repetições]

import crypto from "node:crypto";
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { encryptToVerse, decryptFromVerse, aesKeyFromHex } from "./abhedya-chhandas-aes.mjs";

const PAYLOAD_FILE = "abhedyam-payload-bricspay-pix.json";
const VERSE_FILE = "abhedyam-benchmark.verso.txt"; // temporário próprio: nunca toca o verso padrão
const KEY_FILE = "abhedyam-payload-bricspay-pix.key";
const ROMAN_RE = /^[IVXLCDM]+\.$/; // com ponto obrigatório: "vi"/"li"/"mi" são sílabas, não sargas

const N = Math.max(1, parseInt(process.argv[2] ?? "10", 10));

function stats(times) {
  const s = [...times].sort((a, b) => a - b);
  return { mean: times.reduce((a, b) => a + b, 0) / times.length, p50: s[Math.floor(s.length / 2)], max: s[s.length - 1] };
}

function show(label, times) {
  const { mean, p50, max } = stats(times);
  console.log(`${label.padEnd(28)} méd ${mean.toFixed(2).padStart(8)} ms · p50 ${p50.toFixed(2).padStart(8)} ms · máx ${max.toFixed(2).padStart(8)} ms`);
}

const key = aesKeyFromHex(fs.readFileSync(KEY_FILE, "utf8"));
const plain = Buffer.from(JSON.stringify(JSON.parse(fs.readFileSync(PAYLOAD_FILE, "utf8"))), "utf8");

// aquecimento (JIT)
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
  if (!back.equals(plain)) throw new Error("ida e volta divergiu"); // poema íntegro?
  tCheck.push(performance.now() - t0);
}

const syllables = verse.split(/\s+/).map((t) => t.replace(/[।॥]/g, "")).filter((t) => t && !ROMAN_RE.test(t) && t.toLowerCase() !== "iti").length;
const sargas = (verse.match(/^[IVXLCDM]+\.$/gm) ?? []).length;
console.log(`payload: ${plain.length} B → poema: ${Buffer.byteLength(verse)} bytes, ${syllables} sílabas, ${sargas} sargas Anuṣṭubh + colofão`);
console.log(`repetições: ${N}\n`);
show("cifrar (enc)", tEnc);
show("gravar poema", tWrite);
show("ler poema", tRead);
show("decifrar (dec)", tDec);
show("conferir bytes", tCheck);
const total = tEnc.map((_, i) => tEnc[i] + tWrite[i] + tRead[i] + tDec[i] + tCheck[i]);
show("PROCESSO COMPLETO", total);
