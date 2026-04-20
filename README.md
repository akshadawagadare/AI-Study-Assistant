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
- 🧠 Context-aware AI responses via Claude API
- 💬 Chat-style user interface
- ⚡ Real-time frontend-backend communication

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, Multer, pdfjs-dist |
| AI | Anthropic Claude API |

---

## 📂 Project Structure

```
AI-Study-Assistant/
├── backend/
│   ├── routes/
│   │   └── upload.js
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.tsx
│   │   │   └── FileUpload.tsx
│   │   └── App.tsx
└── README.md
```

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
CLAUDE_API_KEY=your_api_key_here
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
```
POST /upload
Content-Type: multipart/form-data
```

### Ask a Question
```
POST /upload/ask
Content-Type: application/json
```

Request:
```json
{
  "question": "What is the main topic of this document?"
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
3. Extracted text is injected as context into the prompt
4. Claude API generates a context-aware response
5. Answer is displayed in the chat interface

---

## 🚧 Future Improvements

- 🔍 Implement RAG with vector database (Pinecone / FAISS)
- 📚 Multi-document support
- 💾 Chat history with MongoDB
- 🔐 User authentication
- ⚡ Streaming AI responses

---

## ⚠️ Notes

- Start backend before frontend
- Upload a PDF before asking questions
- Never expose API keys in frontend code

---

## 👩‍💻 Author

**Akshada Wagadare**
[GitHub](https://github.com/akshadawagadare) • [LinkedIn](https://www.linkedin.com/in/akshadawagadare/)

---

⭐ If this helped you, consider starring the repo!