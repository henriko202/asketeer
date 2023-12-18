require("dotenv").config()
const express = require("express")
const router = require("./routes/router")

const app = express()
app.use(express.json())

const port = process.env.PORT || 8080

app.use("/", router)

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
