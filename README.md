# 📚 AI Study Assistant

Upload any PDF and ask questions about it in plain English — instant AI-powered answers without reading the whole document.

---

## 🌐 Live Demo

👉 [Click here to try it live](https://ai-study-assistant-theta-one.vercel.app)

---

## 📸 Screenshots

![Chat Interface](screenshots/chat.png)
![PDF Upload](screenshots/upload.png)

---

## ✨ Features

- 📄 Upload and process PDF documents
- 🤖 Ask questions based on document content
- 🧠 Context-aware AI responses via Google Gemini API
- 💬 Chat-style user interface
- ⚡ Real-time frontend-backend communication

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, Multer, pdfjs-dist |
| AI | Google Gemini API (gemini-2.5-flash) |

---

## 📂 Project Structure
AI-Study-Assistant/
├── backend/
│   ├── routes/
│   │   ├── chat.js
│   │   └── upload.js
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── FileItem.tsx
│   │   │   └── DocumentSidebarSection.tsx
│   │   └── App.tsx
└── README.md
---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/akshadawagadare/ai-study-assistant.git
cd ai-study-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

Start the server:

```bash
node server.js
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔌 API Endpoints

### Upload PDF
POST /upload
Content-Type: multipart/form-data
Response:
```json
{
  "message": "Upload successful",
  "fileId": "1234567890-filename.pdf"
}
```

### Ask a Question
POST /upload/ask
Content-Type: application/json
Request:
```json
{
  "question": "What is the main topic of this document?",
  "fileId": "1234567890-filename.pdf"
}
```

Response:
```json
{
  "answer": "The document covers..."
}
```

---

## 🧠 How It Works

1. User uploads a PDF
2. Backend extracts text using `pdfjs-dist`
3. Backend stores extracted text and returns a `fileId`
4. User asks a question with the `fileId`
5. Extracted text is injected as context into the Gemini prompt
6. Gemini API generates a context-aware response
7. Answer is displayed in the chat interface

---

## 🚧 Future Improvements

- 🔍 Implement RAG with vector database (Pinecone / FAISS)
- 📚 Multi-document support
- 💾 Chat history with MongoDB
- 🔐 User authentication
- ⚡ Streaming AI responses
- 🗄️ Persistent storage with MongoDB to survive server restarts

---

## ⚠️ Notes

- Start backend before frontend
- Upload a PDF before asking questions
- Never expose API keys in frontend code
- Uploaded PDFs expire after 30 minutes on the server

---

## 👩‍💻 Author

**Akshada Wagadare**
[GitHub](https://github.com/akshadawagadare) • [LinkedIn](https://www.linkedin.com/in/akshadawagadare/)

---

⭐ If this helped you, consider starring the repo!