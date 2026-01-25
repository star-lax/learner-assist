import { useState } from "react";
import { Code, Sparkles, Send, AlertCircle } from "lucide-react";
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function LiveCodeMentor() {
  const [code, setCode] = useState(`// Try writing some code here!
function calculateSum(a, b) {
  var result = a + b;
  console.log("Sum is: " + result);
  if (result == 10) {
    return true;
  }
  return result;
}

calculateSum(5, 5);`);
  
  const [feedback, setFeedback] = useState([]);
  const [overall, setOverall] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('javascript');

  const analyzeCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setFeedback([]);
    setOverall("");
    
    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          language, 
          use_ai: true 
        })
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setFeedback(data.feedback || []);
      setOverall(data.overall || "");
    } catch (error) {
      console.error('Error:', error);
      setFeedback([{ 
        severity: 'error', 
        message: 'Connection Error',
        explanation: 'Make sure the Flask backend is running on port 5001. Run: cd backend && python app.py'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    return severity === 'error' ? 'var(--error)' : 
           severity === 'warning' ? 'var(--warning)' : 
           'var(--primary)';
  };

  const getSeverityIcon = (severity) => {
    return severity === 'error' ? '🚨' : 
           severity === 'warning' ? '⚠️' : '💡';
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Code size={28} style={{ color: 'var(--primary)' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Live Code Mentor</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Get real-time AI feedback as you code
          </p>
        </div>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            marginLeft: 'auto',
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        padding: '20px',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Code Editor Section */}
        <motion.div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>
            Code Editor
          </h3>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              flex: 1,
              padding: '15px',
              fontFamily: "'Fira Code', 'Consolas', monospace",
              fontSize: '14px',
              lineHeight: '1.6',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: '#f9fafb',
              resize: 'none',
              outline: 'none'
            }}
            placeholder="Write your code here..."
          />
          <button
            onClick={analyzeCode}
            disabled={loading}
            style={{
              marginTop: '15px',
              padding: '12px 24px',
              backgroundColor: loading ? 'rgba(99, 102, 241, 0.5)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={18} />
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </motion.div>

        {/* Feedback Section */}
        <motion.div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '15px', 
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            AI Feedback
            <span style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {feedback.length} insights
            </span>
          </h3>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {feedback.length === 0 && !loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: 'var(--text-muted)' 
              }}>
                <AlertCircle size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p>Write code and click "Analyze Code" to get AI-powered feedback</p>
              </div>
            ) : (
              <>
                {feedback.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                      padding: '15px',
                      borderLeft: `4px solid ${getSeverityColor(item.severity)}`,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {getSeverityIcon(item.severity)} {item.message}
                      </div>
                      {item.line && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: 'var(--text-muted)',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          Line {item.line}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-muted)', 
                      marginBottom: '10px',
                      lineHeight: '1.5'
                    }}>
                      {item.explanation}
                    </div>
                    {item.suggestion && (
                      <div style={{ 
                        fontSize: '13px', 
                        backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                        padding: '10px',
                        borderRadius: '6px',
                        borderLeft: '2px solid var(--primary)'
                      }}>
                        <strong>💡 Tip:</strong> {item.suggestion}
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {overall && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      marginTop: '10px',
                      padding: '15px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }}
                  >
                    <strong>✨ Overall:</strong> {overall}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LiveCodeMentor;