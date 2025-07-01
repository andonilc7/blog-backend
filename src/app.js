const express = require("express")
const userRouter = require("./routes/users")
const postRouter = require("./routes/posts")
const commentRouter = require('./routes/comments')

const app = express()

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

app.listen(5001, () => {
  console.log("Express server started on port 5001")
})