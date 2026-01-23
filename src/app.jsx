import { useState } from "react";
import {
  BookOpen,
  Code,
  Brain,
  FileText,
  Lightbulb,
  Activity,
  WifiOff,
  ShieldAlert
} from "lucide-react";
import "./App.css";

function App() {
  const [activeFeature, setActiveFeature] = useState("explainer");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput(""); // Clear previous output

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: activeFeature,
          input: input,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setOutput(data.result);
      } else {
        setOutput("Error: No result from AI.");
      }
    } catch (error) {
      console.error("Error calling API:", error);
      setOutput("Error: Failed to connect to the backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { id: "explainer", name: "Concept Explainer", icon: <BookOpen size={28} /> },
    { id: "code", name: "Code Explainer", icon: <Code size={28} /> },
    { id: "roadmap", name: "Learning Path", icon: <Brain size={28} /> },
    { id: "summary", name: "Smart Notes", icon: <FileText size={28} /> },
    { id: "ideas", name: "Project Ideas", icon: <Lightbulb size={28} /> },
  ];

  const getPlaceholder = (feature) => {
    switch (feature) {
      case "code": return "Paste your code snippet here to get a detailed explanation...";
      case "roadmap": return "Enter a topic (e.g., 'React', 'Machine Learning') to generate a learning path...";
      default: return "Enter topic, doubt, or question...";
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header>
        <div className="brand">
          <h1>LEARNER ASSIST</h1>
          <span></span>
        </div>
        <div className="status-bar">
          <div className="status-item">
            <span>GITA Autonomous College</span>
          </div>
          <div className="status-item">
            <span className={`status-dot ${output ? "active" : "offline"}`}></span>
            <span>{output ? "Backend Active" : "Backend Offline"}</span>
          </div>
        </div>
      </header>

      {/* Navigation - 5 Full Width Cards */}
      <nav className="features-nav">
        {features.map((f) => (
          <div
            key={f.id}
            className={`feature-card ${activeFeature === f.id ? "active" : ""}`}
            onClick={() => setActiveFeature(f.id)}
          >
            <div className="feature-icon">{f.icon}</div>
            <span className="feature-name">{f.name}</span>
          </div>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-panel">
          <div className="panel-header">
            <ShieldAlert className="panel-icon" size={24} />
            {features.find((f) => f.id === activeFeature)?.name}
          </div>

          <textarea
            className="input-area"
            placeholder={getPlaceholder(activeFeature)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="action-bar">
            <button
              className="action-btn"
              onClick={handleGenerate}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? "Analyzing..." : "Analyze Input"}
            </button>
          </div>

          <div className="output-area">
            <span className="output-label">System Output</span>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {output || "Waiting for input analysis..."}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>

      </footer>
    </div>
  );
}

export default App;
