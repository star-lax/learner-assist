import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Code,
  Brain,
  FileText,
  Lightbulb,
  ShieldAlert,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import "./App.css";

function App() {
  const [activeFeature, setActiveFeature] = useState("explainer");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const features = [
    { id: "explainer", name: "Concept Explainer", icon: <BookOpen size={28} /> },
    { id: "code", name: "Code Explainer", icon: <Code size={28} /> },
    { id: "roadmap", name: "Learning Path", icon: <Brain size={28} /> },
    { id: "summary", name: "Smart Notes", icon: <FileText size={28} /> },
    { id: "ideas", name: "Project Ideas", icon: <Lightbulb size={28} /> },
  ];

  const examplePrompts = {
    explainer: [
      "Explain quantum computing in simple terms",
      "What is machine learning?",
      "How does blockchain work?"
    ],
    code: [
      "Explain this React useState hook",
      "What does async/await do in JavaScript?",
      "How does recursion work?"
    ],
    roadmap: [
      "Create a learning path for React",
      "Roadmap to become a full-stack developer",
      "How to learn data science?"
    ],
    summary: [
      "Summarize key concepts of OOP",
      "Main points about REST APIs",
      "Core principles of clean code"
    ],
    ideas: [
      "Project ideas for React portfolio",
      "Python automation project ideas",
      "Creative web development projects"
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const userInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Add placeholder for AI message that will be streamed
    const aiMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use fetch for streaming with Server-Sent Events
      const response = await fetch('http://localhost:5000/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: activeFeature,
          input: userInput,
          conversationId: conversationId,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[aiMessageIndex] = {
                    role: "assistant",
                    content: "Error: " + data.error,
                    streaming: false
                  };
                  return newMessages;
                });
                break;
              }

              if (data.content) {
                streamedContent += data.content;
                // Update the AI message with streamed content
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[aiMessageIndex] = {
                    role: "assistant",
                    content: streamedContent,
                    streaming: true
                  };
                  return newMessages;
                });
              }

              if (data.done) {
                // Mark streaming as complete
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[aiMessageIndex] = {
                    role: "assistant",
                    content: data.fullText || streamedContent,
                    streaming: false
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error calling API:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = {
          role: "assistant",
          content: "Error: Failed to connect to the backend. Is the server running?",
          streaming: false
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExampleClick = (example) => {
    setInput(example);
  };

  const handleFeatureChange = (featureId) => {
    setActiveFeature(featureId);
    // Optionally clear messages when switching features
    // setMessages([]);
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
            <span className={`status-dot ${messages.length > 0 ? "active" : "offline"}`}></span>
            <span>{messages.length > 0 ? "Backend Active" : "Backend Offline"}</span>
          </div>
        </div>
      </header>

      {/* Navigation - 5 Full Width Cards */}
      <nav className="features-nav">
        {features.map((f) => (
          <div
            key={f.id}
            className={`feature-card ${activeFeature === f.id ? "active" : ""}`}
            onClick={() => handleFeatureChange(f.id)}
          >
            <div className="feature-icon">{f.icon}</div>
            <span className="feature-name">{f.name}</span>
          </div>
        ))}
      </nav>

      {/* Main Chat Content Area */}
      <main className="main-content">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-title">
              <ShieldAlert className="panel-icon" size={24} />
              {features.find((f) => f.id === activeFeature)?.name}
            </div>
            {messages.length > 0 && (
              <button className="clear-btn" onClick={clearConversation} title="Clear conversation">
                <Trash2 size={18} />
                Clear Chat
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <motion.div
                  className="welcome-icon"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Sparkles size={64} />
                </motion.div>
                <h2>Welcome to {features.find((f) => f.id === activeFeature)?.name}</h2>
                <p>Start a conversation by typing your question below or try an example:</p>
                <div className="example-prompts">
                  {examplePrompts[activeFeature]?.map((example, idx) => (
                    <motion.button
                      key={idx}
                      className="example-prompt"
                      onClick={() => handleExampleClick(example)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`message ${message.role}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`message-content ${message.streaming ? 'streaming' : ''}`}>
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                    {message.role === "assistant" && (
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(message.content, index)}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {loading && (
              <motion.div
                className="message assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder={`Ask anything about ${features.find((f) => f.id === activeFeature)?.name.toLowerCase()}... (Shift+Enter for new line)`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer></footer>
    </div>
  );
}

export default App;
