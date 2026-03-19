const axios = require("axios")

exports.analyze = async (ocrData) => {

  const response = await axios.post(
    "http://localhost:9000/analyze",
    ocrData
  )

  return response.data
}