const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

// PDF parser
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");

// Claude
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// in-memory storage (prototype only)
let documents = [];
module.exports.documents = documents;

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

/* ------------------ PDF EXTRACTION SAFE ------------------ */
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
    console.error("❌ PDF PARSE ERROR:", err);
    throw new Error("PDF extraction failed");
  }
}

/* ------------------ CLEAN TEXT ------------------ */
function buildContext(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().slice(0, 12000);
}

/* ------------------ UPLOAD ------------------ */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 UPLOAD HIT");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 FILE:", req.file.filename);

    const text = await extractText(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: "Could not extract text from PDF",
      });
    }

    documents.push({
      id: req.file.filename,
      text,
      createdAt: new Date(),
    });

    console.log("✅ UPLOAD SUCCESS");
    console.log("📊 DOC COUNT:", documents.length);

    return res.json({
      message: "PDF uploaded successfully 🚀",
      preview: text.substring(0, 300),
    });
  } catch (err) {
    console.error("❌ UPLOAD ERROR FULL:", err);
    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
});
console.log("🔥 ASK ROUTE TRIGGERED");

/* ------------------ ASK (FULL DEBUG VERSION) ------------------ */
router.post("/ask", async (req, res) => {
  try {
    console.log("🔥 ASK ROUTE TRIGGERED FULL");
    console.log("BODY RAW:", req.body);
    console.log("BODY TYPE:", typeof req.body);

    const question = req.body?.question;

    console.log("QUESTION:", question);

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!documents.length) {
      return res.status(400).json({ error: "No PDF uploaded yet" });
    }

    const doc = documents.at(-1);

    if (!doc?.text) {
      return res.status(400).json({
        error: "PDF text missing or corrupted",
      });
    }

    const context = buildContext(doc.text);

    console.log("📄 CONTEXT SIZE:", context.length);

    // 🔥 FINAL SAFETY CHECK
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: "CLAUDE API KEY missing in .env",
      });
    }

    const prompt = `
STRICT PDF QA SYSTEM:

RULES:
- ONLY use PDF content
- If answer not in PDF: say "Not found in PDF"

PDF:
"""
${context}
"""

QUESTION:
${question}

ANSWER:
`;

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

    const answer = response.content?.[0]?.text || "No response";

    return res.json({
      question,
      answer,
      contextPreview: context.substring(0, 300),
    });

  } catch (err) {
    console.error("🔥 CLAUDE FULL ERROR:", err);
    console.error("🔥 MESSAGE:", err.message);
    console.error("🔥 STACK:", err.stack);

    return res.status(500).json({
      error: "AI failed",
      details: err.message,
    });
  }
});

module.exports = router;
