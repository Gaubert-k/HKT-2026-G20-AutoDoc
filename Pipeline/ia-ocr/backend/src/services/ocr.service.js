const axios = require("axios")

exports.runOCR = async (filePath) => {

  const response = await axios.post(
    "http://localhost:8000/ocr",
    { file: filePath }
  )

  return response.data
}