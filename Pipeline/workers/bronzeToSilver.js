const path = require("path");
const { listStatus, openJson, createJson } = require("./webhdfs");

const BRONZE_DIR =
  process.env.BRONZE_DIR || "/data_lake/bronze/documents/documents";
const SILVER_DIR = process.env.SILVER_DIR || "/data_lake/silver/ocr_text";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000);

function normalizeSilverPayload(content, fileBaseName) {
  if (content == null) return [];

  // Common shapes we accept:
  // - [] (already the expected list of docs)
  // - { data: [] }
  // - { documents: [] }
  // - a single doc object
  if (Array.isArray(content)) return content;
  if (Array.isArray(content?.data)) return content.data;
  if (Array.isArray(content?.documents)) return content.documents;
  if (Array.isArray(content?.results)) return content.results;

  if (typeof content === "object") {
    // If it already looks like a doc, keep it.
    if (content.extracted_data || content.nom_fichier || content.anomalies) {
      return [content];
    }

    // Otherwise, wrap as a single doc.
    return [
      {
        nom_fichier: fileBaseName,
        extracted_data: content,
        anomalies: []
      }
    ];
  }

  return [];
}

function sanitizeDoc(doc, fileBaseName) {
  const nom_fichier = doc?.nom_fichier || fileBaseName;

  const extracted_data =
    doc?.extracted_data ||
    doc?.extractedData ||
    doc?.extracted ||
    doc?.analysis?.extracted_data ||
    {};

  const anomaliesRaw = doc?.anomalies;
  let anomalies = [];
  if (Array.isArray(anomaliesRaw)) anomalies = anomaliesRaw;
  else if (anomaliesRaw != null) anomalies = [String(anomaliesRaw)];

  // Ensure anomalies is an array of strings (front expects join(", ")).
  anomalies = anomalies.map((a) => (typeof a === "string" ? a : JSON.stringify(a)));

  return {
    ...doc,
    nom_fichier,
    extracted_data,
    anomalies
  };
}

async function bronzeToSilverOnce() {
  const bronzeFiles = await listStatus(BRONZE_DIR);
  const silverFiles = await listStatus(SILVER_DIR);

  const existingSilver = new Set(
    (silverFiles || [])
      .filter((f) => f.type === "FILE")
      .map((f) => f.pathSuffix)
  );

  for (const file of bronzeFiles) {
    if (file?.type !== "FILE") continue;
    if (!String(file.pathSuffix || "").toLowerCase().endsWith(".json"))
      continue;

    if (existingSilver.has(file.pathSuffix)) continue;

    const bronzeFilePath = `${BRONZE_DIR}/${file.pathSuffix}`;
    const fileBaseName = path.basename(file.pathSuffix, ".json");
    console.log(`[OCR worker] new bronze json: ${bronzeFilePath}`);

    const content = await openJson(bronzeFilePath);
    if (!content) {
      console.log(`[OCR worker] skip (empty/invalid json): ${bronzeFilePath}`);
      continue;
    }

    const payload = normalizeSilverPayload(content, fileBaseName).map((doc) =>
      sanitizeDoc(doc, fileBaseName)
    );

    const targetPath = `${SILVER_DIR}/${file.pathSuffix}`;
    await createJson(targetPath, payload);
    existingSilver.add(file.pathSuffix);

    console.log(
      `[OCR worker] wrote silver: ${targetPath} (docs=${payload.length})`
    );
  }

  // PDF seul en bronze : sans .json associé, l'ancien worker ne faisait rien → Silver vide.
  // On crée un JSON Silver homonyme (.pdf → .json) pour que la chaîne Silver → Gold tourne.
  const bronzeJsonStems = new Set(
    (bronzeFiles || [])
      .filter((f) => f?.type === "FILE")
      .filter((f) => String(f.pathSuffix || "").toLowerCase().endsWith(".json"))
      .map((f) => path.basename(f.pathSuffix, ".json").toLowerCase())
  );

  for (const file of bronzeFiles) {
    if (file?.type !== "FILE") continue;
    const suffix = String(file.pathSuffix || "");
    if (!suffix.toLowerCase().endsWith(".pdf")) continue;

    const silverSuffix = suffix.replace(/\.pdf$/i, ".json");
    if (existingSilver.has(silverSuffix)) continue;

    const stem = path.basename(suffix, ".pdf");
    if (bronzeJsonStems.has(stem.toLowerCase())) {
      // Un JSON du même « stem » existe en bronze : laisser le traitement JSON remplir le Silver.
      continue;
    }

    const pdfDisplayName = path.basename(suffix);
    const payload = [
      sanitizeDoc(
        {
          nom_fichier: pdfDisplayName,
          extracted_data: {
            note:
              "PDF uploadé sans fichier JSON d'extraction. Champs vides jusqu'à envoi d'un .json ou branchement OCR."
          },
          anomalies: [
            "Silver_auto: pas de JSON bronze — données non extraites du PDF (OCR non exécuté par ce worker)."
          ]
        },
        stem
      )
    ];

    const targetPath = `${SILVER_DIR}/${silverSuffix}`;
    console.log(`[OCR worker] new bronze pdf (placeholder silver): ${suffix}`);
    await createJson(targetPath, payload);
    existingSilver.add(silverSuffix);
    console.log(`[OCR worker] wrote silver: ${targetPath} (docs=${payload.length})`);
  }
}

async function main() {
  console.log(
    `[OCR worker] start polling bronzeDir=${BRONZE_DIR} -> silverDir=${SILVER_DIR}`
  );

  // First run quickly, then poll.
  try {
    await bronzeToSilverOnce();
  } catch (e) {
    console.error("[OCR worker] initial sync failed:", e.message);
  }

  setInterval(async () => {
    try {
      await bronzeToSilverOnce();
    } catch (e) {
      console.error("[OCR worker] sync failed:", e.message);
    }
  }, POLL_INTERVAL_MS);
}

main();

