require("dotenv").config();
const express = require("express");
var { connectToMongoDB } = require("./config/dbconnect");
const cors = require("cors");
var userRouter = require("./routers/userRouters");

var app = express();

app.use(cors({
  origin: "https://artiq-project.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to DB before every request (required for serverless)
app.use(async (req, res, next) => {
  await connectToMongoDB();
  next();
});

app.use("/api", userRouter);
app.use("/user", userRouter);

app.use((req, res) => {
  res.status(404).send("Invalid URL");
});

module.exports = app;