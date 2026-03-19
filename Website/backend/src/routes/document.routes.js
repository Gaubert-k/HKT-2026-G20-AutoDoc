const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");

const {
  uploadDocument,
  processCase,
  getSilverResults,
  getGoldResults,
  clearHdfsData
} = require("../controllers/document.controller");

router.post("/upload", upload.array("file"), uploadDocument);

router.post(
  "/process-case",
  upload.fields([
    { name: "invoice", maxCount: 1 },
    { name: "attestation", maxCount: 1 }
  ]),
  processCase
);

router.get("/silver", getSilverResults); 

router.get("/gold", getGoldResults);

router.post("/clear-hdfs", clearHdfsData);

module.exports = router;