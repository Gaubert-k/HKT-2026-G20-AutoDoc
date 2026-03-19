const axios = require("axios");
const fs = require("fs");

const HDFS_URL = process.env.HDFS_URL || "http://localhost:9870/webhdfs/v1";
const HDFS_USER = process.env.HDFS_USER || "root";

const withUser = (url) => `${url}${url.includes("?") ? "&" : "?"}user.name=${encodeURIComponent(HDFS_USER)}`;

exports.uploadToHDFS = async (localFilePath, fileName, documentType = "unknown") => {
  try {
    const hdfsPath = `/data_lake/bronze/documents/${documentType}/${fileName}`;

    const initResponse = await axios.put(
      withUser(`${HDFS_URL}${hdfsPath}?op=CREATE&overwrite=true`),
      null,
      {
        maxRedirects: 0,
        validateStatus: (status) => status === 307
      }
    );

    const redirectURL = initResponse.headers.location;

    const fileStream = fs.createReadStream(localFilePath);

    await axios.put(redirectURL, fileStream, {
      headers: {
        "Content-Type": "application/octet-stream"
      }
    });

    console.log("✅ Uploaded to HDFS:", hdfsPath);

    return hdfsPath;

  } catch (error) {
    console.error("❌ HDFS upload error:", error.message);
    return `LOCAL_ONLY/${fileName}`;
  }
};

exports.getSilverFiles = async () => {
  try {
    const silverPath = `/data_lake/silver/ocr_text`;

    const response = await axios.get(withUser(`${HDFS_URL}${silverPath}?op=LISTSTATUS`));
    const files = response.data.FileStatuses?.FileStatus || [];

    return files;

  } catch (error) {
    console.error("❌ Error fetching Silver files:", error.message);
    return [];
  }
};

// ==================== GET GOLD FILES ====================
exports.getGoldFiles = async () => {
  try {
    const goldPath = `/data_lake/gold`;

    const response = await axios.get(withUser(`${HDFS_URL}${goldPath}?op=LISTSTATUS`));
    const files = response.data.FileStatuses?.FileStatus || [];

    return files;

  } catch (error) {
    console.error("❌ Error fetching Gold files:", error.message);
    return [];
  }
};

exports.readFileFromHDFS = async (filePath) => {
  try {
    const response = await axios.get(withUser(`${HDFS_URL}${filePath}?op=OPEN`), {
      responseType: "json"
    });

    return response.data;

  } catch (error) {
    console.error("❌ Error reading file:", error.message);
    return null;
  }
};

// ==================== CLEAR DATA LAKE (fichiers appli uniquement) ====================

function normalizeFileStatuses(data) {
  const raw = data?.FileStatuses?.FileStatus;
  if (raw == null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * Supprime tous les fichiers sous hdfsPath (récursif). Conserve les dossiers vides.
 */
async function deleteAllFilesUnder(hdfsPath) {
  let deleted = 0;
  const errors = [];

  let entries;
  try {
    const response = await axios.get(
      withUser(`${HDFS_URL}${hdfsPath}?op=LISTSTATUS`)
    );
    entries = normalizeFileStatuses(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return { deleted, errors };
    }
    errors.push({ path: hdfsPath, message: error.message });
    return { deleted, errors };
  }

  for (const entry of entries) {
    const childPath = `${hdfsPath}/${entry.pathSuffix}`;
    if (entry.type === "FILE") {
      try {
        await axios.delete(withUser(`${HDFS_URL}${childPath}?op=DELETE`));
        deleted += 1;
      } catch (error) {
        errors.push({ path: childPath, message: error.message });
      }
    } else if (entry.type === "DIRECTORY") {
      const sub = await deleteAllFilesUnder(childPath);
      deleted += sub.deleted;
      errors.push(...sub.errors);
    }
  }

  return { deleted, errors };
}

/** Dossiers utilisés par l’upload / workers (bronze → silver → gold). */
const CLEAR_TARGETS = [
  "/data_lake/bronze/documents/documents",
  "/data_lake/bronze/documents/invoice",
  "/data_lake/bronze/documents/attestation",
  "/data_lake/silver/ocr_text",
  "/data_lake/gold"
];

/**
 * Vide les fichiers HDFS liés à la démo (ne supprime pas les répertoires racine).
 * @returns {{ deleted: number, errors: Array, paths: string[] }}
 */
exports.clearApplicationLakeData = async () => {
  let deleted = 0;
  const errors = [];
  const paths = [...CLEAR_TARGETS];

  for (const p of CLEAR_TARGETS) {
    const result = await deleteAllFilesUnder(p);
    deleted += result.deleted;
    errors.push(...result.errors);
  }

  return { deleted, errors, paths };
};