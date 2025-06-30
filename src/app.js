const express = require("express")

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/", (req, res) => {
  res.json({
    message: "Initial home response"
  })
})

app.listen(5001, () => {
  console.log("Express server started on port 5001")
})