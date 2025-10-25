# 🧠 Athena Conversational AI Copilot

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb)
![Pinecone](https://img.shields.io/badge/Pinecone-3B82F6?style=for-the-badge&logo=pinecone)
![Groq](https://img.shields.io/badge/Groq-412991?style=for-the-badge&logo=groq)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)

---

A **multimodal conversational AI system** that integrates text and image understanding using a **Retrieval-Augmented Generation (RAG)** pipeline with **Pinecone**, **MongoDB**, and **GROQ APIs** — built with a **FastAPI** backend and a **Next.js** frontend.

---

## 🚀 Overview

Athena Conversational AI Copilot is designed to act as an intelligent assistant capable of handling **contextual text queries**, **image-based understanding**, and **knowledge retrieval** from custom data sources.

The project combines **FastAPI**, **Pinecone**, **GROQ**, and **MongoDB** for backend intelligence, while the **Next.js + TypeScript** frontend delivers a sleek chat interface for human-AI interaction.

The system leverages:

- **FastAPI** for backend orchestration
- **Pinecone** for semantic vector retrieval
- **GROQ** for natural language reasoning and multimodal generation
- **Next.js** for a clean, reactive, and responsive chat interface

---

## ⚙️ Tech Stack

### 🧩 Backend (FastAPI)

- **Python** (FastAPI, Uvicorn)
- **GROQ API** for text and multimodal responses
- **Pinecone Vector Database** for retrieval and context search
- **MongoDB** for storing conversations and chat metadata
- **Docker** for containerized deployment

### 💻 Frontend (Next.js + TypeScript)

- **Next.js 14 (App Router)** with **TypeScript**
- **Tailwind CSS** for styling
- **Clerk** for authentication and user management
- **React Context API** for chat state management
- **Deployed on Vercel**

---

## 🗂️ Directory Structure

```bash
ankit5803-athena-conversational-ai-copilot/
├── backend/
│ ├── app.py
│ ├── blip.py
│ ├── Dockerfile
│ ├── manual_ingestion.py
│ ├── mongodb.py
│ ├── multimodal.py
│ ├── pinecone_ingestion.py
│ ├── preprocess_pipeline.py
│ ├── rag_pipeline.py
│ └── requirements.txt
└── frontend/
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── src/
├── app/
│ ├── layout.tsx
│ ├── page.tsx
│ ├── api/
│ │ ├── chat/
│ │ │ ├── route.ts
│ │ │ └── [id]/
│ │ │ ├── route.ts
│ │ │ ├── messages/
│ │ │ │ └── route.ts
│ │ │ └── streammsg/
│ │ │ └── route.ts
│ │ ├── folder/
│ │ │ ├── route.ts
│ │ │ └── [id]/route.ts
│ │ └── user/route.ts
│ └── chat/page.tsx
├── components/
│ ├── AIAssistantUI.tsx
│ ├── ChatPane.tsx
│ ├── Composer.tsx
│ ├── Sidebar.tsx
│ ├── Message.tsx
│ └── contexts/ChatContext.tsx
├── interfaces/
│ └── interface.ts
├── models/
│ ├── Conversation.ts
│ ├── Folder.ts
│ ├── Message.ts
│ └── User.ts
└── utils/
├── database.ts
└── util.ts
```

---

## 🔑 Environment Variables

### Backend (`.env`)

```bash
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
MONGO_URI=your_mongodb_connection_string
```

### Frontend(`.env`)

```bash
BACKEND_URL=http://localhost:8000
MONGO_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

---

## 🧠 Core Features

- **RAG (Retrieval-Augmented Generation)** pipeline using Pinecone for context retrieval

- **Multimodal understanding** — supports both text and image inputs

- **Conversational memory** stored in MongoDB

- **Dynamic chat folder and message** management

- **Clerk authentication** for secure user sessions

- **Real-time streaming responses** from backend to frontend using Server-Sent Events (SSE)

- **Dockerized backend** for easy deployment

- **Modern Next.js UI** with responsive, animated chat experience

---

## ⚡ Setup Instructions

### 🐳 Backend (FastAPI)

1. Clone the repository

```bash
git clone https://github.com/ankit5803/athena-conversational-ai-copilot.git
cd athena-conversational-ai-copilot/backend
```

2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # for Mac/Linux
venv\Scripts\activate     # for Windows
```

4. Install dependencies

```bash
pip install -r requirements.txt
```

5. Run the FastAPI server

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

6. Docker (optional)

```bash
docker build -t athena-backend .
docker run -d -p 8000:8000 athena-backend
```

### 💻 Frontend (Next.js)

1. Navigate to frontend folder

```bash
cd ../frontend
```

2. Install dependencies

```bash
npm install
```

3. Run development server

```bash
npm run dev
```

App will be available at:
👉 `http://localhost:3000`

---

## 🔗 API Endpoints (Backend)

| Endpoint  | Method | Description                             |
| --------- | ------ | --------------------------------------- |
| `/search` | POST   | Perform RAG-based query (SSE streaming) |
| `/health` | GET    | Check backend health                    |

---

## 📦 Deployment

- **Backend** → Deployed via Docker on Render(any cloud/VPS or container service)

- **Frontend** → Deployed on Vercel

- Both parts communicate via the environment variable `BACKEND_URL`

---

## 🧭 Folder Highlights

### 🧠 Backend Logic

- **rag_pipeline.py** → Handles context retrieval from Pinecone

- **multimodal.py** → Integrates BLIP image understanding

- **mongodb.py** → Handles MongoDB interactions

- **preprocess_pipeline.py** → Cleans and prepares documents before embedding

- **manual_ingestion.py / pinecone_ingestion.py** → Handle knowledge ingestion

### 💬 Frontend Components

- **AIAssistantUI.tsx** → Core chat interface

- **ChatPane.tsx** → Displays conversation stream

- **Composer.tsx** → Input area with actions

- **Sidebar.tsx** → Folder & conversation navigation

- **ChatContext.tsx** → Manages global chat state

---

## 🧑‍💻 Contributions

- **[Sandarva-9304](https://github.com/Sandarva-9304)**

- **[ankit-5803](https://github.com/ankit-5803)**

Feel free to fork the repository, open issues, or submit pull requests to improve the project!

---
