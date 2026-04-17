const express = require("express");
const cors = require("cors");

const app = express();

// =====================
// ✅ CORS FIX (IMPORTANT)
// =====================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-study-assistant-theta-one.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow tools like Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// =====================
// ✅ BODY PARSERS
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// ✅ IMPORT ROUTES
// =====================
const chatRoute = require("./routes/chat");
const uploadRoute = require("./routes/upload");

// =====================
// ✅ TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// =====================
// ✅ API ROUTES
// =====================
app.use("/chat", chatRoute);
app.use("/upload", uploadRoute);

// =====================
// ❌ GLOBAL ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  res.status(500).json({
    error: "Something went wrong",
    details: err.message,
  });
});

// =====================
// 🚀 SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});