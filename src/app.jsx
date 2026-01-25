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
  Sparkles,
  Calendar,
  Trophy,
  ChevronDown,
  ChevronUp,
  Target,
  Plus,
  X,
  File,
  Paperclip
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
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [roadmaps, setRoadmaps] = useState(() => {
    const saved = localStorage.getItem("skill_roadmaps");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem("skill_roadmaps", JSON.stringify(roadmaps));
  }, [roadmaps]);

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

  const scrollToBottom = (smooth = false) => {
    if (messagesAreaRef.current) {
      const container = messagesAreaRef.current;

      // Calculate distances
      const scrollPos = container.scrollTop + container.clientHeight;
      const isNearBottom = container.scrollHeight - scrollPos < 150;

      // Only auto-scroll if user is near the bottom or we're in "sticky" mode
      if (isNearBottom || !isUserScrollingRef.current) {
        if (smooth) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth"
          });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  };

  // Detect user manual scrolling
  const handleScroll = () => {
    if (messagesAreaRef.current) {
      const container = messagesAreaRef.current;
      const atBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 20;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      if (!atBottom) {
        isUserScrollingRef.current = true;
        // Reset sticky scroll after user stays idle at the bottom
        scrollTimeoutRef.current = setTimeout(() => {
          const stillAtBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 20;
          if (stillAtBottom) isUserScrollingRef.current = false;
        }, 1500);
      } else {
        isUserScrollingRef.current = false;
      }
    }
  };

  useEffect(() => {
    // Only scroll automatically if we are NOT in the middle of a streaming/typewriting session
    // because the typewriting loop handles its own scrolling for better stability
    const isStreaming = messages.some(m => m.streaming);
    if (!isStreaming) {
      scrollToBottom(true);
    }
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];

    for (const file of files) {
      const base64 = await fileToBase64(file);
      newAttachments.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file: file,
        name: file.name,
        type: file.type,
        url: base64,
        preview: file.type.startsWith('image/') ? base64 : null
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      attachments: [...attachments] // Save attachments in message
    };

    const userInput = input;
    const currentAttachments = [...attachments];

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    const aiMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:5000/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: activeFeature,
          input: userInput,
          conversationId: conversationId,
          conversationHistory: conversationHistory,
          attachments: currentAttachments.map(a => ({
            name: a.name,
            type: a.type,
            url: a.url
          }))
        }),
      });

      if (!response.ok) throw new Error('Stream request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullContent = "";
      let displayedContent = "";
      let isTyping = true;
      let streamDone = false;
      let rafId = null;

      // Frame-synced Typewriter engine
      let lastTime = performance.now();
      const typeWriter = (time) => {
        if (!isTyping) return;

        const deltaTime = time - lastTime;

        // Target ~30 characters per second for "premium" feel, or faster if buffer is large
        const targetCps = fullContent.length - displayedContent.length > 200 ? 100 : 40;
        const charStep = (targetCps * deltaTime) / 1000;

        if (displayedContent.length < fullContent.length) {
          const nextIndex = Math.min(fullContent.length, displayedContent.length + Math.max(1, charStep));
          displayedContent = fullContent.substring(0, Math.ceil(nextIndex));

          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[aiMessageIndex]) {
              newMessages[aiMessageIndex] = {
                ...newMessages[aiMessageIndex],
                content: displayedContent,
                streaming: true
              };
            }
            return newMessages;
          });

          // Stabilize scroll in sync with frame
          scrollToBottom(false);
          lastTime = time;
          rafId = requestAnimationFrame(typeWriter);
        } else if (streamDone) {
          // Finished typing and stream is over
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[aiMessageIndex]) {
              newMessages[aiMessageIndex] = {
                ...newMessages[aiMessageIndex],
                content: fullContent,
                streaming: false
              };
            }
            return newMessages;
          });
          isTyping = false;
        } else {
          // Wait for more data
          lastTime = time;
          rafId = requestAnimationFrame(typeWriter);
        }
      };

      // Start the frame-synced typewriter
      rafId = requestAnimationFrame(typeWriter);

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          streamDone = true;
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.content) {
                fullContent += data.content;
              }
              if (data.done) {
                // Backend says stream is finished
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
        if (newMessages[aiMessageIndex]) {
          newMessages[aiMessageIndex] = {
            role: "assistant",
            content: "Error: Failed to connect to the backend.",
            streaming: false
          };
        }
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

  // Helper to parse roadmap from markdown
  const parseRoadmap = (text, title) => {
    const days = [];
    const lines = text.split('\n');
    let currentDay = null;

    lines.forEach(line => {
      // More flexible regex: Matches headings or BOLD lines starting with Day/Step/Phase etc.
      const dayMatch = line.match(/^(?:#{1,4}\s*|\*\*\s*)((?:Day|Step|Phase|Week|Milestone|Level)\s*\d+[:\s-]\s*(.*)|(?:\d+\.)\s+(.*))/i);

      if (dayMatch) {
        if (currentDay) days.push(currentDay);
        // Extract title: either from captures 2/3 or the whole match, cleaning trailing bold symbols
        const titleText = (dayMatch[2] || dayMatch[3] || dayMatch[1]).replace(/\*\*$/, '');
        currentDay = {
          title: titleText.trim(),
          tasks: []
        };
      } else if (currentDay) {
        // Look for bullet points or numbered sub-lists
        const taskMatch = line.match(/^\s*[-\*\d\.]+\s+(.*)/);
        if (taskMatch) {
          const taskText = taskMatch[1].replace(/\*\*$/, '').trim();
          // Avoid adding the milestone header itself as a task
          if (taskText && !taskText.toLowerCase().startsWith('day') && !taskText.toLowerCase().startsWith('step')) {
            currentDay.tasks.push({
              id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              text: taskText,
              completed: false
            });
          }
        }
      }
    });

    if (currentDay) days.push(currentDay);

    return {
      id: `roadmap_${Date.now()}`,
      title: title || "New Roadmap",
      days: days,
      createdAt: new Date().toISOString()
    };
  };

  const startTracking = (text, userPrompt) => {
    const newRoadmap = parseRoadmap(text, userPrompt);
    if (newRoadmap.days.length === 0) {
      alert("I couldn't find a day-by-day plan here. Please try asking the AI to 'Provide a step-by-step roadmap with Day X headings' to enable tracking!");
      return;
    }
    setRoadmaps(prev => [newRoadmap, ...prev]);
    setActiveRoadmap(newRoadmap.id);

    // Scroll to tracker
    setTimeout(() => {
      const tracker = document.getElementById("progress-tracker");
      tracker?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleTask = (roadmapId, dayIndex, taskId) => {
    setRoadmaps(prev => prev.map(rm => {
      if (rm.id !== roadmapId) return rm;
      return {
        ...rm,
        days: rm.days.map((day, idx) => {
          if (idx !== dayIndex) return day;
          return {
            ...day,
            tasks: day.tasks.map(task => {
              if (task.id !== taskId) return task;
              return { ...task, completed: !task.completed };
            })
          }
        })
      };
    }));
  };

  const deleteRoadmap = (id) => {
    if (confirm("Are you sure you want to delete this roadmap?")) {
      setRoadmaps(prev => prev.filter(rm => rm.id !== id));
      if (activeRoadmap === id) setActiveRoadmap(null);
    }
  };

  const calculateProgress = (roadmap) => {
    const allTasks = roadmap.days.flatMap(d => d.tasks);
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(t => t.completed).length;
    return Math.round((completedTasks / allTasks.length) * 100);
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
          <div className="messages-area" ref={messagesAreaRef} onScroll={handleScroll}>
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
                      {/* Render User Attachments */}
                      {message.role === "user" && message.attachments && message.attachments.length > 0 && (
                        <div className="message-attachments-view">
                          {message.attachments.map(att => (
                            <div key={att.id} className="attachment-bubble">
                              {att.preview ? (
                                <img src={att.preview} alt="upload" className="attachment-img-preview" />
                              ) : (
                                <div className="file-icon-bubble">
                                  <File size={20} />
                                  <span>{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {message.role === "assistant" ? (
                        <>
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

                          {/* Track Progress Button for Roadmaps */}
                          {activeFeature === "roadmap" && !message.streaming && (
                            <motion.button
                              className="track-progress-inline-btn"
                              onClick={() => startTracking(message.content, messages[index - 1]?.content)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Target size={16} />
                              Start Tracking This Roadmap
                            </motion.button>
                          )}
                        </>
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
          <div className="input-container-wrapper">
            {attachments.length > 0 && (
              <div className="attachment-previews-bar">
                {attachments.map(att => (
                  <div key={att.id} className="preview-pill">
                    {att.preview ? <img src={att.preview} alt="pre" /> : <File size={16} />}
                    <span className="file-name">{att.name}</span>
                    <button onClick={() => removeAttachment(att.id)} className="remove-att">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="input-container">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
              />
              <button
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Plus size={24} />
              </button>

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
                disabled={loading || (!input.trim() && attachments.length === 0)}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Track Progress Section - Appears at the bottom via scroll */}
      <section id="progress-tracker" className="progress-tracker-section">
        <div className="section-header">
          <div className="section-title">
            <Trophy className="section-icon" size={32} />
            <div>
              <h2>Track Your Progress</h2>
              <span>Your personalized learning checkpoints</span>
            </div>
          </div>
          {roadmaps.length > 0 && (
            <div className="roadmap-selector">
              <select
                value={activeRoadmap || ""}
                onChange={(e) => setActiveRoadmap(e.target.value)}
              >
                <option value="" disabled>Select a roadmap to track</option>
                {roadmaps.map(rm => (
                  <option key={rm.id} value={rm.id}>{rm.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {roadmaps.length === 0 ? (
          <div className="empty-tracker">
            <Calendar size={48} />
            <h3>No active roadmaps</h3>
            <p>Use the <strong>Learning Path</strong> feature above to generate a roadmap, then click "Start Tracking" to see it here.</p>
          </div>
        ) : !activeRoadmap ? (
          <div className="empty-tracker">
            <Target size={48} />
            <h3>Select a roadmap</h3>
            <p>Choose one of your saved roadmaps from the dropdown above to continue tracking.</p>
          </div>
        ) : (
          <div className="active-roadmap-view">
            {roadmaps.filter(rm => rm.id === activeRoadmap).map(rm => (
              <div key={rm.id} className="roadmap-tracking-card">
                <div className="roadmap-card-header">
                  <div className="roadmap-card-info">
                    <h3>{rm.title}</h3>
                    <div className="progress-stats">
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${calculateProgress(rm)}%` }}
                        ></div>
                      </div>
                      <span className="progress-percentage">{calculateProgress(rm)}% Complete</span>
                    </div>
                  </div>
                  <button className="delete-roadmap-btn" onClick={() => deleteRoadmap(rm.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="days-grid">
                  {rm.days.map((day, dayIdx) => (
                    <div key={dayIdx} className="day-card">
                      <div className="day-header">
                        <h4>{day.title}</h4>
                        <span className="task-count">
                          {day.tasks.filter(t => t.completed).length}/{day.tasks.length}
                        </span>
                      </div>
                      <ul className="task-list">
                        {day.tasks.map(task => (
                          <li key={task.id} className={task.completed ? "completed" : ""}>
                            <label className="task-checkbox">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(rm.id, dayIdx, task.id)}
                              />
                              <span className="checkmark"></span>
                              <span className="task-text">{task.text}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer></footer>
    </div>
  );
}

export default App;
