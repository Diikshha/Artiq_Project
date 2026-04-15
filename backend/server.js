require("dotenv").config();
const express = require("express");
var { connectToMongoDB } = require("./config/dbconnect");
const cors = require("cors");
var userRouter = require("./routers/userRouters");

var app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter);
app.use("/user", userRouter);

connectToMongoDB();

app.use((req, res) => {
  console.log(req.method, req.url);
  res.status(404).send("Invalid URL");
});

// Only listen locally, NOT on Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;