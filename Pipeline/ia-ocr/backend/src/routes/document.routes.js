const express = require("express")
const router = express.Router()

const { uploadDocument } = require("../controllers/document.controller")
const upload = require("../middleware/upload.middleware")

router.post("/upload", upload.single("file"), uploadDocument)

module.exports = router