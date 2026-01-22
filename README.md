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
To start the **frontend** development server:

```bash
npm run dev
```
- The app will run at `http://localhost:5173/` (or similar, check terminal output).
- Changes are auto-reloaded.

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
> ⚠️ **Status: Backend Offline**  
> Currently, this repository contains only the frontend. 
> *If you are adding backend code:*
> - Create a `server/` or `backend/` directory.
> - Typically, the main backend file would be `index.js` or `app.py`.

---

## 🛠 Tech Stack
- **Frontend library:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Vanilla CSS (CSS Variables + Flexbox/Grid)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🤝 Collaboration Guide

Since we are working as a team:

1.  **Pull before you push:** Always run `git pull` before making changes to avoid conflicts.
2.  **Branching:**
    - `main`: Stable version.
    - Create feature branches for new work: `git checkout -b feature-name`
3.  **Merge Conflicts:** If you touch `src/app.jsx` at the same time as someone else, communicate!

### Happy Hacking! 🚀
