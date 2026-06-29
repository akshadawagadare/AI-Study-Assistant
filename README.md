# 📚 AI Study Assistant

Upload any PDF and ask questions about it in plain English — instant AI-powered answers without reading the whole document.

## 🌐 Live Demo
👉 [Click here to try it live](https://ai-study-assistant-theta-one.vercel.app)

## 📸 Screenshots

![Chat Interface](screenshots/chat.png)
![PDF Upload](screenshots/upload.png)

## ✨ Features
- 📄 Upload and process PDF documents
- 🤖 Ask questions based on document content
- 🧠 Context-aware AI responses via Google Gemini API
- 💬 Chat-style user interface

## 🛠 Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React (Vite), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI | Google Gemini API (gemini-2.5-flash) |
| DevOps | Docker, Docker Compose |

## 🐳 Run with Docker
1. Clone the repo
2. Set your API key — `export GEMINI_API_KEY=your_key`
3. Run — `docker compose up`
- Frontend → http://localhost
- Backend → http://localhost:5000

## ⚙️ Run Locally
```bash
# Backend
cd backend && npm install && node server.js

# Frontend
cd frontend && npm install && npm run dev
```

## 👩‍💻 Author
**Akshada Wagadare** — [GitHub](https://github.com/akshadawagadare) • [LinkedIn](https://www.linkedin.com/in/akshadawagadare/)

⭐ If this helped you, consider starring the repo!