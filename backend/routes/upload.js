const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const Anthropic = require("@anthropic-ai/sdk");

/* ------------------ CLAUDE CLIENT ------------------ */
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/* ------------------ SAFE IN-MEMORY STORAGE ------------------ */
const documents = [];

/* ------------------ MULTER ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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
  try {
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
  } catch (err) {
    console.error("❌ PDF ERROR:", err.message);
    throw new Error("PDF extraction failed");
  }
}

/* ------------------ CLEAN CONTEXT ------------------ */
function buildContext(text) {
  if (!text) return "";
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

    documents.push({
      id: req.file.filename,
      text,
      createdAt: new Date(),
    });

    return res.json({
      message: "Upload success 🚀",
      preview: text.substring(0, 300),
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);

    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
});

/* ------------------ ASK ROUTE (FIXED + SAFE) ------------------ */
router.post("/ask", async (req, res) => {
  try {
    console.log("🔥 ASK HIT");
    console.log("BODY:", req.body);

    const question = req.body?.question;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!documents.length) {
      return res.status(400).json({ error: "No document uploaded yet" });
    }

    const doc = documents[documents.length - 1];

    if (!doc?.text) {
      return res.status(400).json({ error: "Document missing text" });
    }

    const context = buildContext(doc.text);

    // 🔥 CHECK API KEY
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: "CLAUDE_API_KEY missing in environment variables",
      });
    }

    const prompt = `
You are a strict AI assistant.

RULES:
- Answer ONLY from the PDF content
- If not found: say "Not found in PDF"

PDF:
"""
${context}
"""

QUESTION:
${question}

ANSWER:
`;

    let answer = "";

    try {
      const response = await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 800,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      answer = response.content?.[0]?.text;

    } catch (apiError) {
      console.error("CLAUDE ERROR:", apiError.message);

      return res.status(500).json({
        error: "Claude API failed",
        details: apiError.message,
      });
    }

    return res.json({
      question,
      answer: answer || "No response from AI",
      contextPreview: context.substring(0, 200),
    });

  } catch (err) {
    console.error("ASK ROUTE ERROR:", err.message);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

module.exports = router;