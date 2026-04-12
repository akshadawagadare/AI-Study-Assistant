📚 AI Study Assistant

An AI-powered study tool that allows users to upload PDFs and ask questions based on their content. The system uses Node.js, React, and Claude AI to extract and understand study materials intelligently.

🚀 Features
📄 Upload PDF documents
🤖 Ask questions based on uploaded PDFs
🧠 AI-powered answers using Claude
💬 Chat-like interface (ChatGPT style UI)
⚡ Real-time responses
📚 Context-aware study assistance
🛠️ Tech Stack
Frontend
React (Vite)
TypeScript
Tailwind CSS
Lucide Icons
Backend
Node.js
Express.js
Multer (file upload)
pdfjs-dist (PDF parsing)
Anthropic Claude API
📁 Project Structure
AI-Study-Assistant/
│
├── backend/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone repository
git clone https://github.com/your-username/ai-study-assistant.git
cd ai-study-assistant
2️⃣ Backend setup
cd backend
npm install

Create .env file:

CLAUDE_API_KEY=your_api_key_here

Run backend:

node server.js

Backend runs on:

http://localhost:5000
3️⃣ Frontend setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
🔌 API Endpoints
Upload PDF
POST /upload
Ask Question
POST /upload/ask

Body:

{
  "question": "What is Newton's second law?"
}
📌 How It Works
User uploads a PDF
Backend extracts text from PDF
User asks a question
Claude AI uses PDF context to answer
Response is shown in chat UI
🧠 Key Learning
File upload handling in Node.js
PDF text extraction
REST API integration
AI prompt engineering
React state management
Full-stack communication
⚠️ Notes
Make sure backend is running before using frontend
Upload PDF before asking questions
Do not expose API keys in frontend
👨‍💻 Future Improvements
Multi-PDF chat support
Chat history saving
Streaming AI responses
User authentication
Database integration

⭐ Author

Built by Akshada Wagadare
For learning full-stack AI integration.