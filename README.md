# Concept Fix | AI Misconception Detector 🔬

**Concept Fix** is an intelligent learning platform that goes beyond identifying syntax errors. It diagnoses the **underlying conceptual misunderstandings** in a student's Python code and provides tailored pedagogical guidance.

## 🚀 Key Features

*   **Multi-Pass Error Diagnostics**: Uses `Flake8` for static analysis to report multiple syntax/naming errors simultaneously, bypassing single-exception blockages.
*   **Dual-Pane IDE Workspace**: A premium glassmorphism layout splits the workspace into an editable Code block and dynamic diagnostics diagnostics.
*   **The "Fast Path" Analysis Engine**: Instantly matches 20+ common Python mistakes (IndexErrors, TypeErrors, Colons) against a local Regex core for **0.01s latency**.
*   **AI Fallback Support**: Delegates novel or complex errors to a local **Llama 3.1** instance via Ollama that structures responses securely into Misconceptions and Fixing Guidelines.
*   **Sassy Repeated Error Alerts**: Actively queries the `SQLite` history database; if you make the same mistake twice, the AI will playfully call you out on it!
*   **Personalized Practice Simulator**: Queries your recent difficulties and triggers Ollama to generate a strictly targeted single-task challenge to practice.

---

## 🛠️ Tech Architecture

*   **Backend**: `FastAPI` (Python 3.10+), `SQLAlchemy` ORM, `SQLite`
*   **Static analysis core**: `Flake8` multiplexing
*   **AI Diagnostics layer**: `Ollama` (Local model `llama3.1`)
*   **Frontend**: `React 18`, `Vite`, `Lucide Icons`, `Tailwind CSS` (Configured via Stitch styles)

---

## 💻 Setup and Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16+)
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Ollama Desktop](https://ollama.com/) 

---

### 2. AI Model Sync
Open your terminal and pull down local reference weights:
```bash
# Pull Llama 3.1 (Required for AI Fallback)
ollama run llama3.1
```

---

### 3. Backend Setup
```bash
# Navigate to backend 
cd backend

# Create & activate a Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy flake8

# Start the API 
uvicorn main:app --reload
```
The API sets up on **http://localhost:8000** automatically creating `misconceptions.db`.

---

### 4. Frontend Setup
```bash
# Open a second terminal and navigate to frontend
cd frontend

# Install Node modules
npm install

# Start the dev workflow
npm run dev
```
The workspace is now accessible over your browser framework at **http://localhost:5173**.

---

## 📂 Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI endpoints & database orchestrator
│   ├── execution.py         # Subprocess runtime and Flake8 analyzer
│   ├── analyzer.py          # Fast-path rule matching engine
│   ├── llm_service.py       # Local Ollama prompts & system templates
│   ├── models.py            # Pydantic & SQLAlchemy validation structures
│   ├── database.py          # SQLite engine definitions
│   └── misconceptions.json  # 20+ Pre-indexed pedagogical mapping
└── frontend/
    ├── src/
    │   ├── App.jsx          # Main Dual-Pane React module
    │   └── index.css        # Material style variables
    └── index.html           # Main mounting point carrying Tailwind CDN
```
