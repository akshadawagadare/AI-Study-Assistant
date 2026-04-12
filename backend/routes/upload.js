const express = require("express");
const router = express.Router();
const multer = require("multer");

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

/* ------------------ MULTER SETUP ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ------------------ PDF TEXT EXTRACTION ------------------ */
async function extractText(filePath) {
  const loadingTask = pdfjsLib.getDocument(filePath);
  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }

  return text;
}

/* ------------------ CLEAN CONTEXT BUILDER ------------------ */
function buildContext(text) {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000); // safe limit
}

/* ------------------ UPLOAD ROUTE ------------------ */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractText(req.file.path);

    documents.push({
      id: req.file.filename,
      text,
    });

    console.log("📄 PDF Uploaded:", req.file.filename);
    console.log("📊 Total docs:", documents.length);

    res.json({
      message: "PDF uploaded successfully 🚀",
      preview: text.substring(0, 300),
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ------------------ ASK ROUTE ------------------ */
router.post("/ask", async (req, res) => {
  try {
    console.log("🔥 ASK HIT");
    console.log("BODY:", req.body);

    const question = req.body?.question;

    if (!question) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    if (!documents.length) {
      return res.status(400).json({
        error: "No PDF uploaded yet",
      });
    }

    const doc = documents[documents.length - 1];

    const context = buildContext(doc.text);

    console.log("📄 Context length:", context.length);

    const isGeneration =
      question.toLowerCase().includes("generate") ||
      question.toLowerCase().includes("quiz") ||
      question.toLowerCase().includes("questions");

    const prompt = isGeneration
      ? `
You are a STRICT PDF QUESTION GENERATOR.

RULES:
- ONLY use PDF content
- NO outside knowledge
- NO generic questions
- If insufficient info: "Not enough information in PDF"

PDF:
"""
${context}
"""

TASK:
Generate practice questions strictly from PDF.
QUESTION:
${question}

OUTPUT:
`
      : `
You are a STRICT PDF ANSWER SYSTEM.

RULES:
- ONLY use PDF content
- DO NOT explain
- DO NOT hallucinate
- If answer not in PDF: "Not found in PDF"

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

    const answer = response.content?.[0]?.text || "";

    res.json({
      question,
      answer,
      contextPreview: context.substring(0, 300),
    });

  } catch (err) {
    console.error("CLAUDE ERROR:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const fs = require("fs");

// // PDF parser
// const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");

// // Claude
// const Anthropic = require("@anthropic-ai/sdk");
// const client = new Anthropic({
//   apiKey: process.env.CLAUDE_API_KEY,
// });

// // store PDFs in memory
// let documents = [];
// module.exports.documents = documents;

// /* ------------------ MULTER ------------------ */
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// /* ------------------ PDF TEXT EXTRACTION ------------------ */
// async function extractText(filePath) {
//   const loadingTask = pdfjsLib.getDocument(filePath);
//   const pdf = await loadingTask.promise;

//   let text = "";

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const content = await page.getTextContent();
//     text += content.items.map(item => item.str).join(" ") + "\n";
//   }

//   return text;
// }

// /* ------------------ UPLOAD ROUTE ------------------ */
// router.post("/", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const text = await extractText(req.file.path);

//     documents.push({
//       id: req.file.filename,
//       text,
//     });

//     res.json({
//       message: "PDF uploaded successfully 🚀",
//       preview: text.substring(0, 300),
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// /* ------------------ SMART CONTEXT BUILDER (IMPORTANT FIX) ------------------ */
// function buildContext(text) {
//   const clean = text.replace(/\s+/g, " ").trim();

//   // split into chunks (IMPORTANT FIX)
//   const chunks = clean.match(/.{1,1500}/g) || [];

//   // take only first 3 chunks (prevents hallucination)
//   return chunks.slice(0, 3).join("\n");
// }

// /* ------------------ ASK ROUTE (FINAL FIXED VERSION) ------------------ */
// router.post("/ask", async (req, res) => {
//   try {
//     const question = req.body?.question;

//     if (!question) {
//       return res.status(400).json({
//         error: "Question is required",
//       });
//     }

//     const doc = documents[documents.length - 1];

//     if (!doc) {
//       return res.status(400).json({
//         error: "No PDF uploaded yet",
//       });
//     }

//     // ✅ SMART CONTEXT (FIXED)
//     const context = buildContext(doc.text);

//     // detect generation intent
//     const isGeneration =
//       question.toLowerCase().includes("generate") ||
//       question.toLowerCase().includes("quiz") ||
//       question.toLowerCase().includes("mcq") ||
//       question.toLowerCase().includes("questions");

//     // ✅ STRONG PROMPT (FIXED)
//     const prompt = isGeneration
//       ? `
// You are a STRICT PDF-BASED QUESTION GENERATOR.

// CRITICAL RULES:
// - ONLY use the PDF content
// - DO NOT generate generic textbook questions
// - DO NOT use outside knowledge
// - Every question must come from actual topics in PDF
// - If PDF is insufficient, say: "Not enough information in PDF"

// TASK:
// Generate practice questions STRICTLY from the PDF.

// PDF CONTENT:
// """
// ${context}
// """

// USER REQUEST:
// ${question}

// OUTPUT:
// `
//       : `
// You are a STRICT PDF EXTRACTION SYSTEM.

// CRITICAL RULES:
// - ONLY use PDF content
// - DO NOT explain
// - DO NOT use outside knowledge
// - If answer not found, say: "Not found in PDF"

// TASK:
// Extract exact answer from PDF only.

// PDF CONTENT:
// """
// ${context}
// """

// QUESTION:
// ${question}

// ANSWER:
// `;

//     const response = await client.messages.create({
//       model: "claude-3-haiku-20240307",
//       max_tokens: 800,
//       temperature: 0,
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//     });

//     res.json({
//       question,
//       answer: response.content[0].text,
//       contextPreview: context.substring(0, 300),
//     });

//   } catch (err) {
//     console.error("Claude Error:", err);
//     res.status(500).json({ error: "AI failed" });
//   }
// });

// module.exports = router;