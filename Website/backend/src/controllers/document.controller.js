const fs = require("fs");
const path = require("path");
const { 
  uploadToHDFS, 
  getSilverFiles, 
  getGoldFiles,
  readFileFromHDFS,
  clearApplicationLakeData
} = require("../services/hdfs.service");

exports.uploadDocument = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      console.log("Fichier reçu :", file.filename);

   
      const hdfsPath = await uploadToHDFS(
        file.path,
        file.filename,
        "documents"
      );

      uploadedFiles.push({
        originalname: file.originalname,
        filename: file.filename,
        localPath: file.path,
        hdfsPath
      });
    }

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully to HDFS",
      files: uploadedFiles
    });

  } catch (error) {
    console.error("Erreur upload :", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.processCase = async (req, res) => {
  try {
    const invoice = req.files["invoice"]?.[0];
    const attestation = req.files["attestation"]?.[0];

    if (!invoice || !attestation) {
      return res.status(400).json({
        success: false,
        message: "Invoice and attestation are required"
      });
    }

    
    const invoiceHdfsPath = await uploadToHDFS(
      invoice.path,
      invoice.filename,
      "invoice"
    );

    const attestationHdfsPath = await uploadToHDFS(
      attestation.path,
      attestation.filename,
      "attestation"
    );

    const caseData = {
      case_id: "case_" + Date.now(),
      processed_at: new Date().toISOString(),
      documents: [
        {
          document_id: invoice.filename,
          document_type: "invoice",
          file_name: invoice.originalname,
          hdfs_path: invoiceHdfsPath
        },
        {
          document_id: attestation.filename,
          document_type: "attestation",
          file_name: attestation.originalname,
          hdfs_path: attestationHdfsPath
        }
      ]
    };

    res.status(200).json({
      success: true,
      case: caseData
    });

  } catch (error) {
    console.error("Erreur process case :", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getSilverResults = async (req, res) => {
  try {
   
    const files = await getSilverFiles();

    if (!files || files.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Aucun fichier Silver pour le moment"
      });
    }

    const data = [];

    //  lire chaque fichier JSon apres 
    for (const file of files) {
      if (file.type === "FILE" && file.pathSuffix.endsWith(".json")) {
        const filePath = `/data_lake/silver/ocr_text/${file.pathSuffix}`;

        const content = await readFileFromHDFS(filePath);

        data.push({
          file_name: file.pathSuffix,
          content
        });
      }
    }

    //affich
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Erreur lecture Silver :", error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ==================== GET GOLD RESULTS (HDFS) ====================
exports.getGoldResults = async (req, res) => {
  try {
    const files = await getGoldFiles();

    if (!files || files.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Aucun fichier Gold pour le moment"
      });
    }

    const data = [];

    for (const file of files) {
      if (file.type === "FILE" && file.pathSuffix.endsWith(".json")) {
        const filePath = `/data_lake/gold/${file.pathSuffix}`;
        const content = await readFileFromHDFS(filePath);

        data.push({
          file_name: file.pathSuffix,
          content
        });
      }
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Erreur lecture Gold :", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/** Supprime tous les fichiers Bronze/Silver/Gold utilisés par l’appli (WebHDFS). */
exports.clearHdfsData = async (req, res) => {
  try {
    const { deleted, errors, paths } = await clearApplicationLakeData();

    if (errors.length > 0) {
      console.warn("clearHdfsData: certaines suppressions ont échoué", errors);
    }

    return res.status(200).json({
      success: errors.length === 0,
      deleted,
      paths,
      errors: errors.length > 0 ? errors : undefined,
      message:
        errors.length === 0
          ? `HDFS vidé : ${deleted} fichier(s) supprimé(s).`
          : `Partiellement vidé : ${deleted} fichier(s), ${errors.length} erreur(s).`
    });
  } catch (error) {
    console.error("Erreur clear HDFS :", error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};