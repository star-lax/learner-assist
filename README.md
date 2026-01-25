# Learner Assist 🎓

**Hackathon Project: CHAKRAVYUH 1.0**  
**Problem Statement:** GITA-CVPS001

Learner Assist is an AI-powered educational platform designed to help students understand concepts, code, and learning roadmaps through an interactive interface.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher installed)
- npm (comes with Node.js)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/star-lax/learner-assist.git
    cd learner-assist
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 🏃 Running the Project
**1. Start the Backend:**
   Open a new terminal:
   ```bashins 
   cd server
   npm install
   npm run dev
   ```
   - Server runs on `http://localhost:5000`

**2. Start the Frontend:**
   Open a new terminal:
   ```bash
   npm run dev
   ```
   - App runs on `http://localhost:5173`


---

## 📂 Project Structure

Here is a guide to the key files for collaboration:

### **Frontend (Main)**
- **`src/app.jsx`** → **MAIN UI COMPONENT**.
    - Contains the entire layout, header, footer, and logic for switching between feature cards.
    - Edit this file to add new UI sections or change the card layout.
- **`src/App.css`** → **MAIN STYLESHEET**.
    - Contains all the CSS for the dark purple theme, glassmorphism effects, and responsiveness.
- **`src/index.jsx`** → Entry point that mounts React to the DOM.
- **`vite.config.js`** → Configuration for the Vite build tool.

### **Backend**
- **`server/index.js`** → **MAIN BACKEND SERVER**.
    - Express.js server that handles API requests.
    - Integrates with Groq AI API for content generation.
    - Runs on `http://localhost:5000`.
- **`server/.env`** → **ENVIRONMENT VARIABLES**.
    - Contains `GROQ_API_KEY` and `PORT` configuration.
    - **Required:** Create this file with your Groq API key.
- **`server/package.json`** → Backend dependencies and scripts.

#### **API Endpoints:**
- `GET /` → Health check endpoint.
- `POST /api/generate` → Main AI generation endpoint.
    - **Request Body:** `{ feature: string, input: string }`
    - **Supported Features:** `explainer`, `code`, `roadmap`, `summary`, `ideas`
    - **Response:** `{ result: string }`

---

## 🛠 Tech Stack
### **Frontend**
- **Library:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Vanilla CSS (CSS Variables + Flexbox/Grid)
- **Icons:** [Lucide React](https://lucide.dev/)

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **AI API:** [Groq SDK](https://groq.com/) (Llama 4 Scout model)
- **Environment Management:** dotenv

---

## 🤝 Collaboration Guide

Since we are working as a team:

1.  **Pull before you push:** Always run `git pull` before making changes to avoid conflicts.
2.  **Branching:**
    - `main`: Stable version.
    - Create feature branches for new work: `git checkout -b feature-name`
3.  **Merge Conflicts:** If you touch `src/app.jsx` at the same time as someone else, communicate!

### Happy Hacking! 🚀
