const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const { GoogleGenAI } = require("@google/genai");

/* ------------------ CONFIG ------------------ */
const MAX_CONTEXT_CHARS = 12000;
const UPLOAD_DIR = "uploads";
const FILE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/* ------------------ MEMORY STORE WITH TTL ------------------ */
const fileStore = new Map();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [fileId, entry] of fileStore.entries()) {
    if (now - entry.createdAt > FILE_TTL_MS) {
      fileStore.delete(fileId);
      const filePath = path.join(UPLOAD_DIR, fileId);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.warn(`Cleanup failed for ${filePath}:`, err.message);
        }
      });
    }
  }
}, 5 * 60 * 1000);

/* ------------------ MULTER SETUP ------------------ */
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

/* ------------------ PDF EXTRACTION ------------------ */
async function extractText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true, // fixes font warning
  }).promise;

  const pageTexts = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      return content.items.map((item) => item.str).join(" ");
    })
  );

  return pageTexts.join("\n");
}

/* ------------------ BUILD CONTEXT ------------------ */
function buildContext(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const truncated = cleaned.slice(0, MAX_CONTEXT_CHARS);
  const wasTruncated = cleaned.length > MAX_CONTEXT_CHARS;
  return { context: truncated, wasTruncated };
}

/* ------------------ DELETE FILE HELPER ------------------ */
function deleteUploadedFile(fileId) {
  const filePath = path.join(UPLOAD_DIR, fileId);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.warn(`Cleanup failed for ${filePath}:`, err.message);
    }
  });
}

/* ------------------ UPLOAD ROUTE ------------------ */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text;
    try {
      text = await extractText(req.file.path);
    } catch (extractErr) {
      deleteUploadedFile(req.file.filename);
      return res.status(422).json({
        error: "Failed to parse PDF",
        details: extractErr.message,
      });
    }

    if (!text || text.trim().length === 0) {
      deleteUploadedFile(req.file.filename);
      return res.status(422).json({ error: "PDF contains no extractable text" });
    }

    const fileId = req.file.filename;
    fileStore.set(fileId, { text, createdAt: Date.now() });

    const { wasTruncated } = buildContext(text);

    return res.status(201).json({
      message: "Upload successful",
      fileId,
      ...(wasTruncated && {
        warning: `PDF content exceeds ${MAX_CONTEXT_CHARS} characters and will be partially analysed`,
      }),
    });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.filename);
    console.error("UPLOAD ERROR:", err.message);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

/* ------------------ ASK ROUTE ------------------ */
router.post("/ask", async (req, res) => {
  try {
    const { question, fileId } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "A non-empty question is required" });
    }

    const entry = fileStore.get(fileId);
    if (!fileId || !entry) {
      return res.status(404).json({
        error: "File not found. It may have expired — please re-upload.",
      });
    }

    const { context, wasTruncated } = buildContext(entry.text);

    const prompt = `You are a strict document Q&A assistant.

RULES:
- Answer ONLY using information from the PDF content below.
- If the answer is not present, respond with exactly: "Not found in PDF"
- Be concise and factual.

PDF CONTENT:
"""
${context}
"""

QUESTION: ${question.trim()}

ANSWER:`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      console.warn("Gemini returned no answer. Full result:", JSON.stringify(result, null, 2));
    }

    return res.json({
      question: question.trim(),
      answer: answer?.trim() || "No response from AI",
      ...(wasTruncated && {
        warning: "PDF was partially analysed due to size limits",
      }),
    });
  } catch (err) {
    console.error("ASK ERROR:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

/* ------------------ MULTER ERROR HANDLER ------------------ */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err?.message === "Only PDF files are allowed") {
    return res.status(415).json({ error: err.message });
  }
  next(err);
});

module.exports = router;