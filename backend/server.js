require("dotenv").config();
const express = require("express");
var { connectToMongoDB } = require("./config/dbconnect");
const cors = require("cors");
var userRouter = require("./routers/userRouters");

var app = express();

// Handle OPTIONS preflight requests first
app.options("*", cors());

app.use(cors({
  origin: "https://artiq-project.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter);
app.use("/user", userRouter);

connectToMongoDB();

app.use((req, res) => {
  res.status(404).send("Invalid URL");
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;