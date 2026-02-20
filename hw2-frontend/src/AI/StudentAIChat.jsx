import React, { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';

const AIChat = ({ studentId,studentName}) => {
  const [showBox, setShowBox] = useState(false);
  const [input, setInput] = useState('');

    // State to store chat messages; initially contains a greeting from the AI including student's name
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `👋 Hi ${studentName}! I'm your AI assistant. Feel free to ask me anything about classes, your simulation results, or your teachers. I'm here to help you succeed! 🎓`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const chatRef = useRef(null);

  const toggleChatBox = () => setShowBox(!showBox);
  const closeChat = () => setShowBox(false);

  // Scroll chat container to bottom so newest messages are visible
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  // Effect hook to scroll chat down automatically when messages or loading state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Function for submitting question
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to current message list
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send POST request to backend API with student ID and messages formatted for AI
      const res = await fetch('/api/claude/student-chat-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        // Append AI's response to messages
        setMessages([...newMessages, { role: 'ai', content: data.response }]);
      } else {
        // Handle unsuccessful response from backend
        setMessages([...newMessages, { role: 'ai', content: 'Something went wrong.' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'ai', content: 'Error contacting AI.' }]);
    } finally {
      // Reset loading indicator 
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animation CSS injected */}
      <style>{`
        .dot {
          width: 6px;
          height: 6px;
          margin-right: 4px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          animation: jump 1.4s infinite ease-in-out both;
        }
        .dot1 { animation-delay: -0.32s; }
        .dot2 { animation-delay: -0.16s; }
        .dot3 { animation-delay: 0; }

        @keyframes jump {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Floating button to open/close chat box */}
      <button
        onClick={toggleChatBox}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        title="Ask the AI"
      >
        💬
      </button>

      {/* Chat box UI */}
      {showBox && (
        <div className={`fixed bottom-24 right-6 w-96 max-h-[80vh] flex flex-col border rounded-lg shadow-lg z-50 ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}`}>
        <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold">Ask the AI</h4>
              {/* Help button showing alert with instructions */}
              <button
                title="How to use this assistant"
                onClick={() =>
                  alert(
                    "🎓 I'm your AI assistant, here to support you with anything related to your classes, simulations, or teachers. You can ask me about your progress, get help improving your answers, or just explore insights from your class activity. I’m here to help you learn and grow—just start typing! 💬"
                  )
                }
                 className="bg-gray-200 text-blue-700 dark:bg-gray-700 dark:text-white px-3 py-1 rounded text-sm hover:bg-blue-400 disabled:opacity-50"
              >
                ?
              </button>
            </div>
           <button  onClick={closeChat}  className="bg-gray-200 text-blue-700 dark:bg-gray-700 dark:text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50">&times;
           </button>
          </div>
          {/* Messages container, scrollable, with ref for auto-scroll */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {/* Render each message */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-md text-sm whitespace-pre-wrap max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white self-end ml-auto'
                    : isDark
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {/* Label messages as "You" or "AI" */}
                <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div
                className={`p-2 rounded-md text-sm max-w-[85%] inline-flex items-center gap-1 ${
                  isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                <strong>AI:</strong>
                <div className="flex ml-2">
                  <span className="dot dot1" />
                  <span className="dot dot2" />
                  <span className="dot dot3" />
                </div>
              </div>
            )}
          </div>
          {/* Input area with text input and send button */}
         <div className={`flex items-center p-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about classes and simulations..."
              className={`flex-1 border rounded p-2 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
/>
           <button
             onClick={handleSend}
             disabled={loading}
             className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              {loading ? '...' : 'Ask'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
