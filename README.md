# 📚 AI Study Assistant

Your AI-powered study companion. Upload lecture notes, research papers, or textbooks and chat with them — get instant answers, summaries, and explanations.

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

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine

### Steps
1. Clone the repository
```bash
   git clone https://github.com/akshadawagadare/AI-Study-Assistant.git
   cd AI-Study-Assistant
```
2. Set your Gemini API key
```bash
   export GEMINI_API_KEY=your_key_here
```
3. Start all services
```bash
   docker compose up
```

- Frontend → http://localhost
- Backend → http://localhost:5000

---

## ⚙️ Run Locally

### Prerequisites
- Node.js v18+ installed
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/akshadawagadare/AI-Study-Assistant.git
cd AI-Study-Assistant
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```env
GEMINI_API_KEY=your_key_here
PORT=5000
```
Start the server:
```bash
node server.js
```
Backend runs on: http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

> ⚠️ Make sure backend is running before starting the frontend
```

## 👩‍💻 Author
**Akshada Wagadare** — [GitHub](https://github.com/akshadawagadare) • [LinkedIn](https://www.linkedin.com/in/akshadawagadare/)

⭐ If this helped you, consider starring the repo!