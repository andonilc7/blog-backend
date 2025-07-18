// only need to call dotenv (load it) once! do it before everything else!
require("dotenv").config()
const express = require("express")
const userRouter = require("./routes/users")
const postRouter = require("./routes/posts")
const commentRouter = require('./routes/comments')
const authRouter = require("./routes/auth")
const cors = require("cors")
// console.log(process.env)

require("./config/passport")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Blog API. Available routes: /posts, /comments, /users"
  })
})

app.use("/users", userRouter)
app.use("/posts", postRouter)
app.use("/comments", commentRouter)
app.use("/auth", authRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    note: "Caught in global error handler"
  })
})

app.listen(5001, () => {
  console.log("Express server started on port 5001")
})