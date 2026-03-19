const ocrService = require("../services/ocr.service")
const aiService = require("../services/ai.service")

exports.uploadDocument = async (req, res) => {

  try {

    const filePath = req.file.path

    const ocrResult = await ocrService.runOCR(filePath)

    const aiResult = await aiService.analyze(ocrResult)

    res.json({
      success: true,
      ocr: ocrResult,
      analysis: aiResult
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    })

  }

}