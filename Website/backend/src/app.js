const express = require("express")
const cors = require("cors")

const documentRoutes = require("./routes/document.routes")
//verfier 
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/documents", documentRoutes)

app.get("/", (req, res) => {
  res.json({ message: "AutoDoc API running" })
})

module.exports = app