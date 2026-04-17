const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Import routes
const chatRoute = require("./routes/chat");
const uploadRoute = require("./routes/upload");

// ✅ CORS (allow only your frontend)
app.use(cors({
  origin: "https://ai-study-assistant-theta-one.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Routes
app.use("/chat", chatRoute);
app.use("/upload", uploadRoute);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(500).json({
    error: "Something went wrong",
    details: err.message,
  });
});

// ✅ PORT fix for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});