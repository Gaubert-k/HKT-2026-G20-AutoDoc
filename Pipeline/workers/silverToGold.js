const path = require("path");
const { listStatus, openJson, createJson } = require("./webhdfs");

const SILVER_DIR =
  process.env.SILVER_DIR || "/data_lake/silver/ocr_text";
const GOLD_DIR = process.env.GOLD_DIR || "/data_lake/gold";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000);

function normalizeSilverToDocs(content, fileBaseName) {
  if (content == null) return [];
  if (Array.isArray(content)) return content;
  if (Array.isArray(content?.data)) return content.data;
  if (Array.isArray(content?.documents)) return content.documents;
  // Single doc object.
  return [
    typeof content === "object" ? content : { nom_fichier: fileBaseName }
  ];
}

function anomaliesToArray(anomaliesRaw) {
  if (Array.isArray(anomaliesRaw)) return anomaliesRaw.map(String);
  if (anomaliesRaw == null) return [];
  return [String(anomaliesRaw)];
}

function computeFiabiliteScore(doc) {
  const extracted = doc?.extracted_data || doc?.extractedData || {};
  const requiredKeys = ["siret", "tva", "amount_ht", "date"];
  const presentCount = requiredKeys.filter((k) => {
    const v = extracted?.[k];
    return v != null && String(v).trim() !== "" && String(v).trim() !== "N/A";
  }).length;

  const anomalies = anomaliesToArray(doc?.anomalies);
  // Soft penalty: each anomaly reduces score, capped.
  const penalty = Math.min(anomalies.length / 5, 1);

  const completeness = presentCount / requiredKeys.length; // 0..1
  const fiabilite = Math.max(0, Math.round(100 * completeness * (1 - penalty)));

  return fiabilite;
}

function sanitizeDocForGold(doc, fileBaseName) {
  const nom_fichier = doc?.nom_fichier || fileBaseName;
  const extracted_data = doc?.extracted_data || doc?.extractedData || doc?.extracted || {};
  const anomalies = anomaliesToArray(doc?.anomalies);
  const fiabilite_score = computeFiabiliteScore({ extracted_data, anomalies });

  return {
    ...doc,
    nom_fichier,
    extracted_data,
    anomalies,
    fiabilite_score
  };
}

async function silverToGoldOnce() {
  const silverFiles = await listStatus(SILVER_DIR);
  const goldFiles = await listStatus(GOLD_DIR);

  const existingGold = new Set(
    (goldFiles || [])
      .filter((f) => f.type === "FILE")
      .map((f) => f.pathSuffix)
  );

  for (const file of silverFiles) {
    if (file?.type !== "FILE") continue;
    if (!String(file.pathSuffix || "").toLowerCase().endsWith(".json"))
      continue;
    if (existingGold.has(file.pathSuffix)) continue;

    const silverFilePath = `${SILVER_DIR}/${file.pathSuffix}`;
    const fileBaseName = path.basename(file.pathSuffix, ".json");

    console.log(`[Score worker] new silver json: ${silverFilePath}`);

    const content = await openJson(silverFilePath);
    if (!content) {
      console.log(`[Score worker] skip empty/invalid json: ${silverFilePath}`);
      continue;
    }

    const docsRaw = normalizeSilverToDocs(content, fileBaseName);
    const payload = docsRaw.map((d) => sanitizeDocForGold(d, fileBaseName));

    const targetPath = `${GOLD_DIR}/${file.pathSuffix}`;
    await createJson(targetPath, payload);
    existingGold.add(file.pathSuffix);

    console.log(
      `[Score worker] wrote gold: ${targetPath} (docs=${payload.length})`
    );
  }
}

async function main() {
  console.log(
    `[Score worker] start polling silverDir=${SILVER_DIR} -> goldDir=${GOLD_DIR}`
  );

  try {
    await silverToGoldOnce();
  } catch (e) {
    console.error("[Score worker] initial sync failed:", e.message);
  }

  setInterval(async () => {
    try {
      await silverToGoldOnce();
    } catch (e) {
      console.error("[Score worker] sync failed:", e.message);
    }
  }, POLL_INTERVAL_MS);
}

main();

