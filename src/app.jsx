import { useState, useRef, useEffect, useCallback } from "react";
import {
    BookOpen, Code, Brain, FileText, Lightbulb, ShieldAlert, Send, Trash2,
    Copy, Check, Sparkles, Calendar, Trophy, ChevronDown, ChevronUp, Target,
    Plus, X, File, Paperclip, Moon, Sun, Mic, MicOff, Volume2, VolumeX,
    Download, Share2, Star, Bookmark, Search, Zap, Award, TrendingUp,
    MessageCircle, Users, Settings, Menu, Grid, List, Filter, SortAsc,
    Play, Pause, SkipForward, RotateCcw, CheckCircle, Circle, Terminal,
    Eye, Edit3, Trash, FolderPlus, Tag, Clock, BarChart2, Activity,
    HelpCircle, Maximize2, Minimize2, RefreshCw, Link, Heart, Flag,
    AlignLeft, Type, Palette, Keyboard, Layers, Box, Cpu, Database,
    GitBranch, Globe, Map, Compass, Briefcase, GraduationCap, BookMarked,
    PenTool, Coffee, Flame, Repeat, ChevronLeft, ChevronRight
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import "./app.css";

// ==================== UTILITY COMPONENTS ====================

// Toast Notification System
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            className={`toast toast-${type}`}
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
        >
            {type === 'success' && <CheckCircle size={20} />}
            {type === 'error' && <X size={20} />}
            {type === 'info' && <Sparkles size={20} />}
            <span>{message}</span>
        </motion.div>
    );
};

// Settings Modal
const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content settings-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2><Settings size={24} /> Settings & Preferences</h2>
                    <button onClick={onClose} className="modal-close"><X size={20} /></button>
                </div>

                <div className="settings-grid">
                    <div className="setting-item">
                        <div className="setting-label">
                            <Palette size={18} />
                            <span>Accent Color</span>
                        </div>
                        <select
                            value={settings.accentColor}
                            onChange={(e) => onSettingsChange('accentColor', e.target.value)}
                        >
                            <option value="purple">Purple</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="orange">Orange</option>
                            <option value="pink">Pink</option>
                        </select>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <Type size={18} />
                            <span>Font Size</span>
                        </div>
                        <select
                            value={settings.fontSize}
                            onChange={(e) => onSettingsChange('fontSize', e.target.value)}
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="xlarge">Extra Large</option>
                        </select>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <Volume2 size={18} />
                            <span>Auto-play Responses</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.autoPlayAudio}
                                onChange={(e) => onSettingsChange('autoPlayAudio', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <Keyboard size={18} />
                            <span>Keyboard Shortcuts</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.keyboardShortcuts}
                                onChange={(e) => onSettingsChange('keyboardShortcuts', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <Zap size={18} />
                            <span>Animations</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.animations}
                                onChange={(e) => onSettingsChange('animations', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Quiz Modal
const QuizModal = ({ isOpen, onClose, quiz, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    if (!isOpen || !quiz) return null;

    const handleAnswer = (questionIndex, answer) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });
        return Math.round((correct / quiz.questions.length) * 100);
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content quiz-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2><Brain size={24} /> {quiz.title}</h2>
                    <button onClick={onClose} className="modal-close"><X size={20} /></button>
                </div>

                {!showResults ? (
                    <div className="quiz-content">
                        <div className="quiz-progress">
                            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="question-card">
                            <h3>{quiz.questions[currentQuestion].question}</h3>
                            <div className="answer-options">
                                {quiz.questions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        className={`answer-option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(currentQuestion, option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="quiz-next-btn"
                            onClick={handleNext}
                            disabled={!answers[currentQuestion]}
                        >
                            {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Show Results'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="quiz-results">
                        <div className="score-circle">
                            <Trophy size={48} />
                            <h2>{calculateScore()}%</h2>
                            <p>Your Score</p>
                        </div>
                        <div className="results-breakdown">
                            {quiz.questions.map((q, idx) => (
                                <div key={idx} className={`result-item ${answers[idx] === q.correctAnswer ? 'correct' : 'incorrect'}`}>
                                    <span className="result-icon">
                                        {answers[idx] === q.correctAnswer ? <CheckCircle size={16} /> : <X size={16} />}
                                    </span>
                                    <span>{q.question}</span>
                                </div>
                            ))}
                        </div>
                        <button className="quiz-close-btn" onClick={onComplete}>
                            Complete Quiz
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// Code Playground Modal
const CodePlayground = ({ isOpen, onClose, initialCode = '' }) => {
    const [code, setCode] = useState(initialCode || '// Write your code here\nconsole.log("Hello World!");');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('javascript');

    if (!isOpen) return null;

    const runCode = () => {
        try {
            const logs = [];
            const customConsole = {
                log: (...args) => logs.push(args.join(' ')),
                error: (...args) => logs.push('Error: ' + args.join(' ')),
                warn: (...args) => logs.push('Warning: ' + args.join(' '))
            };

            const func = new Function('console', code);
            func(customConsole);
            setOutput(logs.join('\n') || 'Code executed successfully!');
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content playground-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2><Terminal size={24} /> Code Playground</h2>
                    <div className="playground-controls">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="javascript">JavaScript</option>
                        </select>
                        <button onClick={runCode} className="run-btn">
                            <Play size={16} /> Run Code
                        </button>
                        <button onClick={onClose} className="modal-close"><X size={20} /></button>
                    </div>
                </div>

                <div className="playground-content">
                    <div className="code-editor">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="code-textarea"
                            spellCheck={false}
                        />
                    </div>
                    <div className="code-output">
                        <h4>Output:</h4>
                        <pre>{output || 'Run your code to see output...'}</pre>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Flashcard Viewer Component
const FlashcardViewer = ({ isOpen, onClose, cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState(new Set());
    const [learningCards, setLearningCards] = useState(new Set());
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
        setLearningCards(new Set());
    }, [cards]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
            if (e.key === 'ArrowUp' || e.key === 'f') { e.preventDefault(); setIsFlipped(f => !f); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, currentIndex]);

    if (!isOpen || !cards || cards.length === 0) return null;

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
            setDirection(1);
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(i => i + 1), 50);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(i => i - 1), 50);
        }
    };

    const markKnown = () => {
        setKnownCards(prev => new Set([...prev, currentIndex]));
        setLearningCards(prev => { const n = new Set(prev); n.delete(currentIndex); return n; });
        goNext();
    };

    const markLearning = () => {
        setLearningCards(prev => new Set([...prev, currentIndex]));
        setKnownCards(prev => { const n = new Set(prev); n.delete(currentIndex); return n; });
        goNext();
    };

    const card = cards[currentIndex];
    const progress = Math.round(((knownCards.size) / cards.length) * 100);

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content flashcard-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header flashcard-modal-header">
                    <h2><Layers size={24} /> Flashcards</h2>
                    <div className="flashcard-header-info">
                        <span className="flashcard-counter">{currentIndex + 1} / {cards.length}</span>
                        <button onClick={onClose} className="modal-close"><X size={20} /></button>
                    </div>
                </div>

                <div className="flashcard-progress-bar">
                    <div className="flashcard-progress-track">
                        <div className="flashcard-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flashcard-progress-labels">
                        <span className="fc-known"><CheckCircle size={14} /> {knownCards.size} Known</span>
                        <span className="fc-learning"><RotateCcw size={14} /> {learningCards.size} Learning</span>
                        <span className="fc-remaining">{cards.length - knownCards.size - learningCards.size} Remaining</span>
                    </div>
                </div>

                <div className="flashcard-stage">
                    <button
                        className="flashcard-nav-btn nav-prev"
                        onClick={goPrev}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            className={`flashcard-3d-container ${isFlipped ? 'flipped' : ''}`}
                            onClick={() => setIsFlipped(f => !f)}
                            initial={{ x: direction * 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction * -300, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="flashcard-3d">
                                <div className="flashcard-face flashcard-front">
                                    <div className="flashcard-label">TERM</div>
                                    <div className="flashcard-term">{card.front}</div>
                                    <div className="flashcard-hint">Click or press ↑ to flip</div>
                                </div>
                                <div className="flashcard-face flashcard-back">
                                    <div className="flashcard-label">DEFINITION</div>
                                    <div className="flashcard-definition">{card.back}</div>
                                    <div className="flashcard-hint">Click or press ↑ to flip back</div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <button
                        className="flashcard-nav-btn nav-next"
                        onClick={goNext}
                        disabled={currentIndex === cards.length - 1}
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

                <div className="flashcard-actions">
                    <motion.button
                        className="fc-action-btn fc-learning-btn"
                        onClick={markLearning}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RotateCcw size={18} />
                        Still Learning
                    </motion.button>
                    <motion.button
                        className="fc-action-btn fc-known-btn"
                        onClick={markKnown}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <CheckCircle size={18} />
                        Got It!
                    </motion.button>
                </div>

                <div className="flashcard-keyboard-hints">
                    <span><kbd>←</kbd><kbd>→</kbd> Navigate</span>
                    <span><kbd>↑</kbd> Flip</span>
                    <span><kbd>Space</kbd> Next</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ==================== MAIN APP COMPONENT ====================

function App() {
    // ========== STATE MANAGEMENT ==========
    const [activeFeature, setActiveFeature] = useState("explainer");
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_messages');
        return saved ? JSON.parse(saved) : [];
    });
    const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [attachments, setAttachments] = useState([]);

    // Theme & Settings
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('settings');
        return saved ? JSON.parse(saved) : {
            accentColor: 'purple',
            fontSize: 'medium',
            autoPlayAudio: false,
            keyboardShortcuts: true,
            animations: true
        };
    });
    const [showSettings, setShowSettings] = useState(false);

    // Voice & Audio
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);

    // Modals & Features
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [showPlayground, setShowPlayground] = useState(false);
    const [playgroundCode, setPlaygroundCode] = useState('');
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [currentFlashcards, setCurrentFlashcards] = useState(null);

    // Bookmarks & Favorites
    const [bookmarks, setBookmarks] = useState(() => {
        const saved = localStorage.getItem('bookmarks');
        return saved ? JSON.parse(saved) : [];
    });
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [viewMode, setViewMode] = useState('chat'); // chat, bookmarks, analytics

    // Analytics
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('stats');
        return saved ? JSON.parse(saved) : {
            totalMessages: 0,
            topicsStudied: [],
            timeSpent: 0,
            streak: 0,
            achievements: []
        };
    });

    // Roadmaps
    const [roadmaps, setRoadmaps] = useState(() => {
        const saved = localStorage.getItem("skill_roadmaps");
        return saved ? JSON.parse(saved) : [];
    });
    const [activeRoadmap, setActiveRoadmap] = useState(null);

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Refs
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesAreaRef = useRef(null);
    const textareaRef = useRef(null);
    const isUserScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);

    // ========== FEATURES CONFIGURATION ==========
    const features = [
        { id: "explainer", name: "Concept Explainer", icon: <BookOpen size={28} />, color: "#8b5cf6" },
        { id: "code", name: "Code Explainer", icon: <Code size={28} />, color: "#3b82f6" },
        { id: "roadmap", name: "Learning Path", icon: <Brain size={28} />, color: "#10b981" },
        { id: "summary", name: "Smart Notes", icon: <FileText size={28} />, color: "#f59e0b" },
        { id: "ideas", name: "Project Ideas", icon: <Lightbulb size={28} />, color: "#ec4899" },
        { id: "quiz", name: "Quiz Generator", icon: <Trophy size={28} />, color: "#ef4444" },
        { id: "flashcards", name: "Flashcards", icon: <Layers size={28} />, color: "#06b6d4" },
        { id: "interview", name: "Interview Prep", icon: <Briefcase size={28} />, color: "#8b5cf6" },
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
        ],
        quiz: [
            "Generate a quiz on JavaScript basics",
            "Test my knowledge on React hooks",
            "Create a Python quiz for beginners"
        ],
        flashcards: [
            "Create flashcards for SQL commands",
            "Make flashcards for data structures",
            "Generate flashcards for HTML tags"
        ],
        interview: [
            "Common React interview questions",
            "System design interview practice",
            "Behavioral interview questions for developers"
        ]
    };

    // ========== EFFECTS ==========

    // Theme persistence
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-accent', settings.accentColor);
        document.documentElement.setAttribute('data-font-size', settings.fontSize);
    }, [theme, settings.accentColor, settings.fontSize]);

    // Settings persistence
    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify(settings));
    }, [settings]);

    // Bookmarks & Favorites persistence
    useEffect(() => {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Stats persistence
    useEffect(() => {
        localStorage.setItem('stats', JSON.stringify(stats));
    }, [stats]);

    // Roadmaps persistence
    useEffect(() => {
        localStorage.setItem("skill_roadmaps", JSON.stringify(roadmaps));
    }, [roadmaps]);

    // Messages persistence
    useEffect(() => {
        localStorage.setItem("chat_messages", JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll messages
    useEffect(() => {
        const isStreaming = messages.some(m => m.streaming);
        if (!isStreaming) {
            scrollToBottom(true);
        }
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!settings.keyboardShortcuts) return;

        const handleKeyPress = (e) => {
            // Ctrl/Cmd + K: Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(prev => !prev);
            }
            // Ctrl/Cmd + /: Settings
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setShowSettings(prev => !prev);
            }
            // Ctrl/Cmd + B: Toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleTheme();
            }
            // Escape: Close modals
            if (e.key === 'Escape') {
                setShowSettings(false);
                setShowQuiz(false);
                setShowPlayground(false);
                setShowSearch(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [settings.keyboardShortcuts]);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + ' ' + transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = () => {
                setIsRecording(false);
                showToast('Voice recognition error', 'error');
            };
        }

        // Initialize speech synthesis
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    // ========== HELPER FUNCTIONS ==========

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        showToast(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`, 'success');
    };

    const handleSettingsChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            showToast('Voice input not supported', 'error');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
            showToast('Listening...', 'info');
        }
    };

    const speakText = (text) => {
        if (!synthRef.current) {
            showToast('Text-to-speech not supported', 'error');
            return;
        }

        if (isSpeaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            synthRef.current.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const scrollToBottom = (smooth = false) => {
        if (messagesAreaRef.current) {
            const container = messagesAreaRef.current;
            const scrollPos = container.scrollTop + container.clientHeight;
            const isNearBottom = container.scrollHeight - scrollPos < 150;

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

    const handleScroll = () => {
        if (messagesAreaRef.current) {
            const container = messagesAreaRef.current;
            const atBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 20;

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

            if (!atBottom) {
                isUserScrollingRef.current = true;
                scrollTimeoutRef.current = setTimeout(() => {
                    const stillAtBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 20;
                    if (stillAtBottom) isUserScrollingRef.current = false;
                }, 1500);
            } else {
                isUserScrollingRef.current = false;
            }
        }
    };

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
        showToast(`${files.length} file(s) attached`, 'success');
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

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        showToast('Copied to clipboard!', 'success');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const toggleBookmark = (messageIndex) => {
        const message = messages[messageIndex];
        const bookmarkId = `bookmark_${Date.now()}`;

        const isBookmarked = bookmarks.some(b => b.messageIndex === messageIndex);

        if (isBookmarked) {
            setBookmarks(prev => prev.filter(b => b.messageIndex !== messageIndex));
            showToast('Bookmark removed', 'info');
        } else {
            setBookmarks(prev => [...prev, {
                id: bookmarkId,
                messageIndex,
                content: message.content,
                feature: activeFeature,
                timestamp: Date.now()
            }]);
            showToast('Bookmarked!', 'success');
        }
    };

    const toggleFavorite = (feature) => {
        const isFavorite = favorites.includes(feature);

        if (isFavorite) {
            setFavorites(prev => prev.filter(f => f !== feature));
        } else {
            setFavorites(prev => [...prev, feature]);
        }
    };

    const exportChat = () => {
        const chatContent = messages.map(m =>
            `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`
        ).join('\n\n');

        const blob = new Blob([chatContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Chat exported!', 'success');
    };

    const clearChat = () => {
        if (window.confirm('Clear all messages?')) {
            setMessages([]);
            showToast('Chat cleared', 'info');
        }
    };

    const parseQuizFromMarkdown = useCallback((content) => {
        try {
            const questions = [];
            const lines = content.split('\n');

            let currentQuestion = null;
            let currentOptions = [];
            let correctAnswer = null;

            const saveCurrentQuestion = () => {
                if (currentQuestion && currentOptions.length >= 2) {
                    questions.push({
                        question: currentQuestion,
                        options: [...currentOptions],
                        correctAnswer: correctAnswer || currentOptions[0]
                    });
                }
            };

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Match question lines: "Q1:", "Question 1:", "1.", "1)", "**1.**", "**Q1:**"
                const qMatch = trimmed.match(/^(?:\*\*)?(?:Q(?:uestion)?[.\s]*)?([\d]+)[.):\-]+\s*\*?\*?\s*(.+)/i);
                if (qMatch && qMatch[2].replace(/\*/g, '').trim().length > 8) {
                    saveCurrentQuestion();
                    currentQuestion = qMatch[2].replace(/\*\*/g, '').replace(/\*$/,'').trim();
                    currentOptions = [];
                    correctAnswer = null;
                    continue;
                }

                // Match option lines: "A)", "A.", "a)", "- A)", "**A)**"
                const optMatch = trimmed.match(/^(?:[-*]\s*)?(?:\*\*)?([A-Da-d])[.)]+\*?\*?\s*(.+)/i);
                if (optMatch && currentQuestion) {
                    currentOptions.push(optMatch[2].replace(/\*\*/g, '').trim());
                    continue;
                }

                // Match answer lines: "Answer: A", "Correct Answer: B", "**Answer: A**"
                const ansMatch = trimmed.match(/(?:correct\s*)?answer[:\s]+(?:\*\*)?\s*([A-Da-d])(?:[.)\s]|\*|$)/i);
                if (ansMatch && currentQuestion) {
                    const idx = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
                    if (currentOptions[idx]) {
                        correctAnswer = currentOptions[idx];
                    }
                    continue;
                }
            }

            // Save last question
            saveCurrentQuestion();

            if (questions.length >= 2) {
                return { title: 'AI Generated Quiz', questions };
            }
            return null;
        } catch (e) {
            console.error('Quiz parsing error:', e);
            return null;
        }
    }, []);

    const launchInteractiveQuiz = (content) => {
        const parsed = parseQuizFromMarkdown(content);
        if (parsed) {
            setCurrentQuiz(parsed);
            setShowQuiz(true);
        } else {
            showToast('Could not parse quiz questions from the response. Try asking again!', 'error');
        }
    };

    const generateQuiz = async (topic) => {
        // Set the input and trigger a send for a real AI-generated quiz
        setInput(`Generate a quiz on ${topic}`);
        // Small delay to let state update, then trigger send
        setTimeout(() => {
            const sendBtn = document.querySelector('.send-btn');
            if (sendBtn) sendBtn.click();
        }, 100);
    };

    const handleQuizComplete = () => {
        setShowQuiz(false);
        setCurrentQuiz(null);

        // Update stats
        setStats(prev => ({
            ...prev,
            achievements: [...prev.achievements, {
                id: Date.now(),
                name: 'Quiz Master',
                description: 'Completed a quiz',
                icon: '🏆'
            }]
        }));

        showToast('Quiz completed! +10 XP', 'success');
    };

    // ========== FLASHCARD FUNCTIONS ==========

    const parseFlashcardsFromMarkdown = useCallback((content) => {
        try {
            const cards = [];
            const lines = content.split('\n');

            let currentFront = null;
            let currentBack = null;

            const saveCard = () => {
                if (currentFront && currentBack) {
                    cards.push({
                        front: currentFront.replace(/\*\*/g, '').trim(),
                        back: currentBack.replace(/\*\*/g, '').trim()
                    });
                }
            };

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Pattern: "**Term:** definition" or "**Term** - definition"
                const boldTermMatch = trimmed.match(/^\*\*(.+?)\*\*[:\-–—]\s*(.+)/);
                if (boldTermMatch && boldTermMatch[1].length < 100) {
                    saveCard();
                    currentFront = boldTermMatch[1];
                    currentBack = boldTermMatch[2];
                    continue;
                }

                // Pattern: "Term: definition" at line start with numbered prefix
                const numberedMatch = trimmed.match(/^(?:\d+[.)\-]\s*)?(?:\*\*)?(.+?)(?:\*\*)?[:\-–—]\s+(.{15,})/);
                if (numberedMatch && numberedMatch[1].length < 80 && numberedMatch[1].length > 1) {
                    saveCard();
                    currentFront = numberedMatch[1].replace(/\*\*/g, '');
                    currentBack = numberedMatch[2].replace(/\*\*/g, '');
                    continue;
                }

                // Pattern: Front: xxx / Back: xxx
                const frontMatch = trimmed.match(/^(?:front|term|question|concept)[:\s]+(.+)/i);
                if (frontMatch) {
                    saveCard();
                    currentFront = frontMatch[1].replace(/\*\*/g, '');
                    currentBack = null;
                    continue;
                }

                const backMatch = trimmed.match(/^(?:back|definition|answer|explanation)[:\s]+(.+)/i);
                if (backMatch && currentFront) {
                    currentBack = backMatch[1].replace(/\*\*/g, '');
                    continue;
                }

                // Continuation of a back definition
                if (currentFront && currentBack && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
                    currentBack += ' ' + trimmed.replace(/\*\*/g, '');
                }
            }

            saveCard();

            return cards.length >= 2 ? cards : null;
        } catch (e) {
            console.error('Flashcard parsing error:', e);
            return null;
        }
    }, []);

    const launchFlashcards = (content) => {
        const parsed = parseFlashcardsFromMarkdown(content);
        if (parsed) {
            setCurrentFlashcards(parsed);
            setShowFlashcards(true);
        } else {
            showToast('Could not parse flashcards. Try asking again with a different format!', 'error');
        }
    };

    const openPlayground = (code = '') => {
        setPlaygroundCode(code);
        setShowPlayground(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && attachments.length === 0) || loading) return;

        const userMessage = {
            role: "user",
            content: input,
            attachments: [...attachments],
            timestamp: Date.now()
        };

        const userInput = input;
        const currentAttachments = [...attachments];

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setAttachments([]);
        setLoading(true);

        // Update stats
        setStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1,
            topicsStudied: [...new Set([...prev.topicsStudied, activeFeature])]
        }));

        const aiMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true, timestamp: Date.now() }]);

        try {
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/generate/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feature: activeFeature,
                    input: activeFeature === 'quiz'
                        ? `${userInput}\n\nIMPORTANT: Format your response as a numbered quiz. Use EXACTLY this format for each question:\n\nQ1. [question text]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nAnswer: [letter]\n\nGenerate at least 5 questions. Make sure every question has exactly 4 options (A-D) and a correct answer line.`
                        : activeFeature === 'flashcards'
                        ? `${userInput}\n\nIMPORTANT: Format your response as flashcards. Use EXACTLY this format for each card:\n\n1. **Term/Concept** - Definition or explanation here\n2. **Another Term** - Another definition here\n\nGenerate at least 10 flashcards. Each card should have a bold term followed by a dash and its definition. Make each definition concise but informative (1-2 sentences).`
                        : userInput,
                    conversationId: conversationId,
                    conversationHistory: conversationHistory,
                    attachments: currentAttachments.map(att => ({
                        type: att.type,
                        url: att.url,
                        name: att.name
                    }))
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.content) {
                                accumulatedText += data.content;

                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[aiMessageIndex] = {
                                        ...newMessages[aiMessageIndex],
                                        content: accumulatedText,
                                        streaming: true
                                    };
                                    return newMessages;
                                });

                                scrollToBottom(false);
                            }
                        } catch (e) {
                            console.error('JSON parse error:', e);
                        }
                    }
                }
            }

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[aiMessageIndex] = {
                    ...newMessages[aiMessageIndex],
                    streaming: false
                };
                return newMessages;
            });

            // Auto-play if enabled
            if (settings.autoPlayAudio && accumulatedText) {
                speakText(accumulatedText);
            }

            // Auto-parse quiz after streaming completes
            if (activeFeature === 'quiz' && accumulatedText) {
                const parsed = parseQuizFromMarkdown(accumulatedText);
                if (parsed) {
                    showToast(`Quiz ready! ${parsed.questions.length} questions parsed. Click "Take Interactive Quiz" to start!`, 'success');
                } else {
                    showToast('Response received!', 'success');
                }
            } else if (activeFeature === 'flashcards' && accumulatedText) {
                const parsed = parseFlashcardsFromMarkdown(accumulatedText);
                if (parsed) {
                    showToast(`${parsed.length} flashcards ready! Click "View Flashcards" to study!`, 'success');
                } else {
                    showToast('Response received!', 'success');
                }
            } else {
                showToast('Response received!', 'success');
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[aiMessageIndex] = {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                    streaming: false,
                    error: true
                };
                return newMessages;
            });
            showToast('Error generating response', 'error');
        } finally {
            setLoading(false);
        }
    };

    const startTracking = (roadmapContent, userPrompt) => {
        console.log("=== START TRACKING DEBUG ===");
        console.log("User Prompt:", userPrompt);
        console.log("Content length:", roadmapContent.length);

        try {
            const lines = roadmapContent.split('\n').filter(line => line.trim());
            console.log("Total lines:", lines.length);

            const days = [];
            let currentDay = null;
            let taskCounter = 0; // CRITICAL: Counter for unique task IDs

            lines.forEach((line, idx) => {
                const dayMatch = line.match(/^#+\s*(Day|Step|Phase|Week|Month|Module|Lesson|Part|Section|Stage|Level|Unit)\s*(\d+)[:\-\s]*(.*)/i);

                if (dayMatch) {
                    console.log(`Found heading at line ${idx}:`, line);
                    if (currentDay) {
                        console.log(`Pushing previous day with ${currentDay.tasks.length} tasks`);
                        days.push(currentDay);
                    }

                    const prefix = dayMatch[1];
                    const number = dayMatch[2];
                    const suffix = dayMatch[3] ? `: ${dayMatch[3].trim()}` : '';

                    currentDay = {
                        title: `${prefix} ${number}${suffix}`,
                        tasks: []
                    };
                    console.log("Created new day:", currentDay.title);
                }
                else if (currentDay && (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./))) {
                    const taskText = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                    if (taskText && !taskText.startsWith('#')) {
                        // FIXED: Guaranteed unique ID with counter
                        const newTask = {
                            id: `task_${Date.now()}_${taskCounter++}_${Math.random().toString(36).substr(2, 9)}`,
                            text: taskText,
                            completed: false
                        };
                        currentDay.tasks.push(newTask);
                        console.log(`Added task ${taskCounter} with ID: ${newTask.id} | Text: ${taskText.substring(0, 40)}...`);
                    }
                }
            });

            if (currentDay) {
                console.log(`Pushing last day with ${currentDay.tasks.length} tasks`);
                days.push(currentDay);
            }

            console.log("Total days/steps parsed:", days.length);
            console.log("Total tasks created:", taskCounter);

            if (days.length > 0) {
                const newRoadmap = {
                    id: `roadmap_${Date.now()}`,
                    title: userPrompt || "Learning Roadmap",
                    content: roadmapContent,
                    days: days,
                    createdAt: Date.now()
                };

                console.log("Creating roadmap with", days.length, "days and", taskCounter, "tasks");

                setRoadmaps(prev => {
                    const updated = [...prev, newRoadmap];
                    console.log("Total roadmaps:", updated.length);

                    // Debug: Log all task IDs
                    newRoadmap.days.forEach((day, idx) => {
                        console.log(`Day ${idx} (${day.title}):`, day.tasks.map(t => `${t.id} - ${t.text.substring(0, 30)}`));
                    });

                    return updated;
                });

                setActiveRoadmap(newRoadmap.id);
                showToast('Roadmap tracking started!', 'success');

                setTimeout(() => {
                    const trackerElement = document.getElementById('progress-tracker');
                    trackerElement?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            } else {
                showToast('Could not parse roadmap. Make sure it has headings like "Day 1:", "Step 1:", or "Phase 1:"', 'error');
            }
        } catch (error) {
            console.error('Error parsing roadmap:', error);
            showToast(`Error creating roadmap: ${error.message}`, 'error');
        }
    };

    const toggleTask = (roadmapId, dayIndex, taskId) => {
        console.log("=== TOGGLE TASK DEBUG ===");
        console.log("Roadmap ID:", roadmapId);
        console.log("Day Index:", dayIndex);
        console.log("Task ID to toggle:", taskId);

        setRoadmaps(prev => {
            const updated = prev.map(rm => {
                if (rm.id === roadmapId) {
                    console.log("✓ Found matching roadmap");

                    // Create a deep copy to ensure React detects the change
                    const updatedDays = JSON.parse(JSON.stringify(rm.days));

                    if (updatedDays[dayIndex]) {
                        const dayTasks = updatedDays[dayIndex].tasks;
                        console.log(`Day ${dayIndex} has ${dayTasks.length} tasks`);
                        console.log("Available task IDs:", dayTasks.map(t => t.id));

                        const taskIndex = dayTasks.findIndex(t => t.id === taskId);

                        if (taskIndex !== -1) {
                            const task = dayTasks[taskIndex];
                            console.log("✓ Found task at index", taskIndex);
                            console.log("  Task text:", task.text);
                            console.log("  Current state:", task.completed);

                            task.completed = !task.completed;

                            console.log("  New state:", task.completed);
                        } else {
                            console.error("✗ Task not found!");
                            console.error("  Looking for:", taskId);
                            console.error("  Available IDs:", dayTasks.map(t => t.id));
                        }
                    } else {
                        console.error("✗ Day index out of bounds! Max index:", updatedDays.length - 1);
                    }

                    return { ...rm, days: updatedDays };
                }
                return rm;
            });

            console.log("State updated");
            return updated;
        });
    };



    const calculateProgress = (roadmap) => {
        const allTasks = roadmap.days.flatMap(d => d.tasks);
        const completedTasks = allTasks.filter(t => t.completed);
        return allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
    };

    const deleteRoadmap = (id) => {
        if (window.confirm('Delete this roadmap?')) {
            setRoadmaps(prev => prev.filter(rm => rm.id !== id));
            if (activeRoadmap === id) setActiveRoadmap(null);
            showToast('Roadmap deleted', 'info');
        }
    };

    // ========== RENDER ==========

    return (
        <div className={`app-container ${settings.animations ? 'animations-enabled' : ''}`}>
            {/* Toast Notifications */}
            <div className="toast-container">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showSettings && (
                    <SettingsModal
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        settings={settings}
                        onSettingsChange={handleSettingsChange}
                    />
                )}
                {showQuiz && (
                    <QuizModal
                        isOpen={showQuiz}
                        onClose={() => setShowQuiz(false)}
                        quiz={currentQuiz}
                        onComplete={handleQuizComplete}
                    />
                )}
                {showPlayground && (
                    <CodePlayground
                        isOpen={showPlayground}
                        onClose={() => setShowPlayground(false)}
                        initialCode={playgroundCode}
                    />
                )}
                {showFlashcards && (
                    <FlashcardViewer
                        isOpen={showFlashcards}
                        onClose={() => setShowFlashcards(false)}
                        cards={currentFlashcards}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <header>
                <div className="brand">
                    <h1>
                        <Sparkles size={24} className="brand-icon" />
                        AI Learning Assistant
                    </h1>
                    <span>Your Personal Study Companion</span>
                </div>

                <div className="header-actions">
                    <button
                        className="icon-btn"
                        onClick={() => setShowSearch(!showSearch)}
                        title="Search (Ctrl+K)"
                    >
                        <Search size={20} />
                    </button>

                    <button
                        className="icon-btn"
                        onClick={toggleTheme}
                        title="Toggle Theme (Ctrl+B)"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button
                        className="icon-btn"
                        onClick={() => setShowSettings(true)}
                        title="Settings (Ctrl+/)"
                    >
                        <Settings size={20} />
                    </button>

                    <div className="stats-badge">
                        <Flame size={16} />
                        <span>{stats.streak} day streak</span>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="features-nav">
                {features.map((feature) => (
                    <motion.button
                        key={feature.id}
                        className={`feature-card ${activeFeature === feature.id ? 'active' : ''}`}
                        onClick={() => setActiveFeature(feature.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="feature-icon" style={{ color: feature.color }}>
                            {feature.icon}
                        </div>
                        <span className="feature-name">{feature.name}</span>
                        {favorites.includes(feature.id) && (
                            <Star className="favorite-badge" size={16} fill="currentColor" />
                        )}
                        <button
                            className="favorite-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(feature.id);
                            }}
                        >
                            <Heart
                                size={14}
                                fill={favorites.includes(feature.id) ? 'currentColor' : 'none'}
                            />
                        </button>
                    </motion.button>
                ))}
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <div className="chat-container">
                    {/* Chat Header */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <ShieldAlert className="panel-icon" size={24} />
                            <span>{features.find(f => f.id === activeFeature)?.name}</span>
                        </div>

                        <div className="chat-header-actions">
                            <button
                                className="header-action-btn"
                                onClick={exportChat}
                                disabled={messages.length === 0}
                                title="Export Chat"
                            >
                                <Download size={18} />
                            </button>

                            <button
                                className="header-action-btn"
                                onClick={() => setViewMode(viewMode === 'chat' ? 'bookmarks' : 'chat')}
                                title="View Bookmarks"
                            >
                                <Bookmark size={18} />
                                {bookmarks.length > 0 && (
                                    <span className="badge">{bookmarks.length}</span>
                                )}
                            </button>

                            <button
                                className="header-action-btn"
                                onClick={() => setViewMode(viewMode === 'chat' ? 'analytics' : 'chat')}
                                title="View Analytics"
                            >
                                <BarChart2 size={18} />
                            </button>

                            <button
                                className="clear-btn"
                                onClick={clearChat}
                                disabled={messages.length === 0}
                            >
                                <Trash2 size={18} />
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        className="messages-area"
                        ref={messagesAreaRef}
                        onScroll={handleScroll}
                    >
                        {viewMode === 'chat' && (
                            <>
                                {messages.length === 0 ? (
                                    <div className="welcome-screen">
                                        <Sparkles className="welcome-icon" size={64} />
                                        <h2>Welcome to {features.find(f => f.id === activeFeature)?.name}!</h2>
                                        <p>Ask me anything or try one of these examples:</p>

                                        <div className="example-prompts">
                                            {examplePrompts[activeFeature]?.map((prompt, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    className="example-prompt"
                                                    onClick={() => setInput(prompt)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {prompt}
                                                </motion.button>
                                            ))}
                                        </div>

                                        {activeFeature === 'quiz' && (
                                            <motion.button
                                                className="action-btn-large"
                                                onClick={() => generateQuiz('JavaScript')}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Trophy size={20} />
                                                Generate Sample Quiz
                                            </motion.button>
                                        )}

                                        {activeFeature === 'code' && (
                                            <motion.button
                                                className="action-btn-large"
                                                onClick={() => openPlayground()}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Terminal size={20} />
                                                Open Code Playground
                                            </motion.button>
                                        )}
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={index}
                                                className={`message ${message.role}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                            >
                                                <div className="message-content">
                                                    {message.attachments && message.attachments.length > 0 && (
                                                        <div className="message-attachments-view">
                                                            {message.attachments.map(att => (
                                                                <div key={att.id} className="attachment-bubble">
                                                                    {att.preview ? (
                                                                        <img src={att.preview} alt="attachment" className="attachment-img-preview" />
                                                                    ) : (
                                                                        <div className="file-icon-bubble">
                                                                            <File size={16} />
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
                                                                            <div className="code-block-wrapper">
                                                                                <div className="code-block-header">
                                                                                    <span>{match[1]}</span>
                                                                                    <button
                                                                                        className="code-action-btn"
                                                                                        onClick={() => openPlayground(String(children))}
                                                                                    >
                                                                                        <Play size={14} /> Run
                                                                                    </button>
                                                                                </div>
                                                                                <SyntaxHighlighter
                                                                                    style={theme === 'dark' ? vscDarkPlus : vs}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, '')}
                                                                                </SyntaxHighlighter>
                                                                            </div>
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

                                                            {activeFeature === "quiz" && !message.streaming && message.content.length > 50 && (
                                                                <motion.button
                                                                    className="track-progress-inline-btn quiz-launch-btn"
                                                                    onClick={() => launchInteractiveQuiz(message.content)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <Trophy size={16} />
                                                                    🎯 Take Interactive Quiz
                                                                </motion.button>
                                                            )}

                                                            {activeFeature === "flashcards" && !message.streaming && message.content.length > 50 && (
                                                                <motion.button
                                                                    className="track-progress-inline-btn flashcard-launch-btn"
                                                                    onClick={() => launchFlashcards(message.content)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <Layers size={16} />
                                                                    🃏 View Flashcards
                                                                </motion.button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p>{message.content}</p>
                                                    )}
                                                </div>

                                                {message.role === "assistant" && (
                                                    <div className="message-actions">
                                                        <button
                                                            className="message-action-btn"
                                                            onClick={() => copyToClipboard(message.content, index)}
                                                            title="Copy"
                                                        >
                                                            {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>

                                                        <button
                                                            className="message-action-btn"
                                                            onClick={() => toggleBookmark(index)}
                                                            title="Bookmark"
                                                        >
                                                            <Bookmark
                                                                size={16}
                                                                fill={bookmarks.some(b => b.messageIndex === index) ? 'currentColor' : 'none'}
                                                            />
                                                        </button>

                                                        <button
                                                            className="message-action-btn"
                                                            onClick={() => speakText(message.content)}
                                                            title="Read Aloud"
                                                        >
                                                            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                                        </button>

                                                        <button
                                                            className="message-action-btn"
                                                            onClick={() => shareMessage(message.content)}
                                                            title="Share"
                                                        >
                                                            <Share2 size={16} />
                                                        </button>
                                                    </div>
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
                            </>
                        )}

                        {viewMode === 'bookmarks' && (
                            <div className="bookmarks-view">
                                <h2><Bookmark size={24} /> Your Bookmarks</h2>
                                {bookmarks.length === 0 ? (
                                    <div className="empty-state">
                                        <Bookmark size={48} />
                                        <p>No bookmarks yet. Save important responses to access them later!</p>
                                    </div>
                                ) : (
                                    <div className="bookmarks-grid">
                                        {bookmarks.map(bookmark => (
                                            <motion.div
                                                key={bookmark.id}
                                                className="bookmark-card"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                            >
                                                <div className="bookmark-header">
                                                    <span className="bookmark-feature">{bookmark.feature}</span>
                                                    <button
                                                        onClick={() => setBookmarks(prev => prev.filter(b => b.id !== bookmark.id))}
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                                <p className="bookmark-content">{bookmark.content.substring(0, 200)}...</p>
                                                <span className="bookmark-time">
                                                    {new Date(bookmark.timestamp).toLocaleDateString()}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {viewMode === 'analytics' && (
                            <div className="analytics-view">
                                <h2><BarChart2 size={24} /> Learning Analytics</h2>
                                <div className="analytics-grid">
                                    <div className="stat-card">
                                        <MessageCircle size={32} />
                                        <h3>{stats.totalMessages}</h3>
                                        <p>Total Messages</p>
                                    </div>
                                    <div className="stat-card">
                                        <Brain size={32} />
                                        <h3>{stats.topicsStudied.length}</h3>
                                        <p>Topics Studied</p>
                                    </div>
                                    <div className="stat-card">
                                        <Flame size={32} />
                                        <h3>{stats.streak}</h3>
                                        <p>Day Streak</p>
                                    </div>
                                    <div className="stat-card">
                                        <Award size={32} />
                                        <h3>{stats.achievements.length}</h3>
                                        <p>Achievements</p>
                                    </div>
                                </div>

                                {stats.achievements.length > 0 && (
                                    <div className="achievements-section">
                                        <h3>Recent Achievements</h3>
                                        <div className="achievements-list">
                                            {stats.achievements.slice(-5).map(achievement => (
                                                <div key={achievement.id} className="achievement-item">
                                                    <span className="achievement-icon">{achievement.icon}</span>
                                                    <div>
                                                        <h4>{achievement.name}</h4>
                                                        <p>{achievement.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {viewMode === 'chat' && (
                        <div className="input-container-wrapper">
                            {attachments.length > 0 && (
                                <div className="attachment-previews-bar">
                                    {attachments.map(att => (
                                        <div key={att.id} className="preview-pill">
                                            {att.preview ? <img src={att.preview} alt="preview" /> : <File size={16} />}
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
                                    accept="image/*,application/pdf,.doc,.docx,.txt"
                                    onChange={handleFileSelect}
                                />

                                <button
                                    className="attach-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    title="Attach File"
                                >
                                    <Paperclip size={20} />
                                </button>

                                <button
                                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                                    onClick={toggleVoiceInput}
                                    disabled={loading}
                                    title="Voice Input"
                                >
                                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
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

                            <div className="input-hints">
                                <span className="hint">
                                    <Keyboard size={12} /> Press <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line
                                </span>
                                <span className="hint">
                                    <Zap size={12} /> <kbd>Ctrl</kbd> + <kbd>K</kbd> to search
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Progress Tracker Section */}
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
                                        <motion.div
                                            key={dayIdx}
                                            className="day-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: dayIdx * 0.1 }}
                                        >
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
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer>
                <p>Made with ❤️ for learning | Press <kbd>Ctrl+K</kbd> to search, <kbd>Ctrl+/</kbd> for settings</p>
            </footer>
        </div>
    );
}

// Helper function for sharing (placeholder)
const shareMessage = (content) => {
    if (navigator.share) {
        navigator.share({
            title: 'AI Learning Assistant',
            text: content.substring(0, 200)
        });
    } else {
        navigator.clipboard.writeText(content);
        alert('Content copied to clipboard!');
    }
};

export default App;