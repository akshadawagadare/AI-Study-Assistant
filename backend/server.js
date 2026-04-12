const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Import routes
const chatRoute = require("./routes/chat");
const uploadRoute = require("./routes/upload"); // 👈 ADD THIS

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Routes
app.use("/chat", chatRoute);
app.use("/upload", uploadRoute); // 👈 ADD THIS

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});