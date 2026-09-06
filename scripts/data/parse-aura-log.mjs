/**
 * Parse the AURA ESP32 serial capture into a compact JSON the site can chart.
 *
 *   node scripts/data/parse-aura-log.mjs [path/to/serial.log]
 *
 * Reads raw/aura/serial.log by default and writes src/data/aura-trials.json.
 * The raw log is gitignored; the derived JSON is committed.
 *
 * Two record formats appear in the log (firmware changed mid-session):
 *   early:  Target: 10.04 Hz | Detected: 10.04 Hz | Evidence: 3.13 dB | Margin: 5.04 dB
 *   later:  Cued: 8.00 Hz | Winner: 14.08 Hz (#4 of 6) | Evidence: 5.71 dB | Margin: 1.08 dB
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const input = process.argv[2] ?? resolve(root, "raw", "aura", "serial.log");
const output = resolve(root, "src", "data", "aura-trials.json");

if (!existsSync(input)) {
  console.error(`serial.log not found at ${input}`);
  process.exit(1);
}

const lines = readFileSync(input, "utf8").split(/\r?\n/);

const num = (s) => (s === undefined ? null : Number(s));
// Two start-line shapes:
//   Recording trial 1 - target 10.042 Hz
//   Recording trial 3 - 6 target(s), cued 8.000 Hz
const rxStart = /Recording trial (\d+) - (?:(\d+) target\(s\), cued |target )([\d.]+) Hz/;
const rxHead =
  /(?:Target|Cued): ([\d.]+) Hz \| (?:Detected|Winner): ([\d.]+) Hz(?: \(#(\d+) of (\d+)\))? \| Evidence: (-?[\d.]+) dB \| Margin: (-?[\d.]+) dB/;
const rxCued = /Cued evidence: (-?[\d.]+) dB \| Cued margin: (-?[\d.]+) dB/;
const rxThresh = /Thresholds \| Evidence>=(-?[\d.]+) dB \| Margin>=(-?[\d.]+) dB/;
const rxSet = /Set \|(.*)\|\s*$/;
const rxMain = /MAIN MIN:(\d+) MAX:(\d+) P2P:(\d+) CLIP:(\d+) RMS:([\d.]+)/;
const rxArt = /ART\s+MIN:(\d+) MAX:(\d+) P2P:(\d+) CLIP:(\d+) RMS:([\d.]+)/;
const rxContact = /CONTACT \| Main:(\w+) \| Artifact:(\w+)/;
const rxResult = /RESULT: ([A-Z_]+)/;
const rxTime = /^\[(\d\d:\d\d:\d\d)\]/;

const trials = [];
let cur = null;

for (const raw of lines) {
  const line = raw.trim();
  const t = line.match(rxTime)?.[1] ?? null;

  let m;
  if ((m = line.match(rxStart))) {
    cur = { trial: Number(m[1]), target: Number(m[3]), time: t };
    if (m[2]) cur.setSize = Number(m[2]);
    trials.push(cur);
    continue;
  }
  if (!cur) continue;

  if ((m = line.match(rxHead))) {
    cur.cued = Number(m[1]);
    cur.winner = Number(m[2]);
    cur.rank = num(m[3]);
    cur.setSize = num(m[4]);
    cur.evidence = Number(m[5]);
    cur.margin = Number(m[6]);
  } else if ((m = line.match(rxCued))) {
    cur.cuedEvidence = Number(m[1]);
    cur.cuedMargin = Number(m[2]);
  } else if ((m = line.match(rxThresh))) {
    cur.evidenceThreshold = Number(m[1]);
    cur.marginThreshold = Number(m[2]);
  } else if ((m = line.match(rxSet))) {
    cur.set = m[1]
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const mm = s.match(/([\d.]+)Hz:(-?[\d.]+)(\*?)/);
        return mm ? { hz: Number(mm[1]), db: Number(mm[2]), winner: mm[3] === "*" } : null;
      })
      .filter(Boolean);
  } else if ((m = line.match(rxMain))) {
    cur.main = { p2p: Number(m[3]), clip: Number(m[4]), rms: Number(m[5]) };
  } else if ((m = line.match(rxArt))) {
    cur.artifact = { p2p: Number(m[3]), clip: Number(m[4]), rms: Number(m[5]) };
  } else if ((m = line.match(rxContact))) {
    cur.contact = { main: m[1], artifact: m[2] };
  } else if ((m = line.match(rxResult))) {
    cur.result = m[1];
  }
}

const complete = trials.filter((x) => x.result && x.evidence !== undefined);
const verdicts = {};
for (const x of complete) verdicts[x.result] = (verdicts[x.result] ?? 0) + 1;

// Modal thresholds — the value in force for most of the session.
const mode = (arr) => {
  const c = new Map();
  for (const v of arr) c.set(v, (c.get(v) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};

const out = {
  source: "AURA ESP32 serial capture, bench sessions of 28 Aug 2026",
  sampleRateHz: 250,
  windowSeconds: 4,
  trialsRecorded: trials.length,
  trialsComplete: complete.length,
  verdicts,
  thresholds: {
    evidenceDb: mode(complete.map((x) => x.evidenceThreshold).filter((v) => v != null)),
    marginDb: mode(complete.map((x) => x.marginThreshold).filter((v) => v != null)),
  },
  trials: complete,
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(out));

console.log(
  `${trials.length} trials read, ${complete.length} complete → ${output} (${(
    Buffer.byteLength(JSON.stringify(out)) / 1024
  ).toFixed(1)} KB)`,
);
console.log("verdicts:", verdicts);
console.log("modal thresholds:", out.thresholds);
