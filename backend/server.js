const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Import routes
const chatRoute = require("./routes/chat");
const uploadRoute = require("./routes/upload");

// ✅ Middlewares
app.use(cors());

// 🔥 IMPORTANT FIX (add both parsers)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Routes
app.use("/chat", chatRoute);
app.use("/upload", uploadRoute);

// ❌ Optional: global error handler (VERY USEFUL)
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(500).json({
    error: "Something went wrong",
    details: err.message,
  });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});