const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const { GoogleGenAI } = require("@google/genai");

/* ------------------ GEMINI CLIENT ------------------ */
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/* ------------------ SIMPLE MEMORY STORE (IMPORTANT FIX) ------------------ */
const fileStore = {}; // fileId -> extracted text

/* ------------------ MULTER SETUP ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ------------------ PDF EXTRACTION ------------------ */
async function extractText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }

  return text;
}

/* ------------------ CLEAN CONTEXT ------------------ */
function buildContext(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 12000);
}

/* ------------------ UPLOAD ROUTE ------------------ */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractText(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text" });
    }

    const fileId = req.file.filename;

    // STORE TEXT (IMPORTANT FIX)
    fileStore[fileId] = text;

    return res.json({
      message: "Upload success 🚀",
      fileId,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
});

/* ------------------ ASK ROUTE ------------------ */
router.post("/ask", async (req, res) => {
  try {
    console.log("🔥 ASK ROUTE HIT");

    const { question, fileId } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!fileId || !fileStore[fileId]) {
      return res.status(400).json({ error: "Invalid fileId or file not found" });
    }

    const context = buildContext(fileStore[fileId]);

    const prompt = `
You are a strict AI assistant.

RULES:
- Answer ONLY from the PDF content
- If answer is not in PDF, say "Not found in PDF"

PDF CONTENT:
"""
${context}
"""

QUESTION:
${question}

ANSWER:
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer =
      result.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.json({
      question,
      answer: answer || "No response from AI",
    });

  } catch (err) {
    console.error("ASK ERROR:", err.message);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

module.exports = router;