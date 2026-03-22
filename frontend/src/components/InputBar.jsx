import { useState, useRef, useEffect } from "react";
import VoiceButton from "./VoiceButton";

function InputBar({ onSend, loading }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceResult = (transcript) => {
    setText((prev) => (prev ? prev + " " + transcript : transcript));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap');

        .input-area {
          padding: 12px 16px 16px;
          background: var(--bg);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        .input-box {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 10px 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-box:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(124, 109, 250, 0.12);
        }

        .msg-textarea {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          resize: none;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
          min-height: 22px;
          max-height: 120px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .msg-textarea::placeholder { color: var(--muted); }

        .send-btn {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none; border-radius: 12px;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
        .send-btn:not(:disabled):hover { opacity: 0.85; transform: scale(1.05); }
        .send-btn:not(:disabled):active { transform: scale(0.95); }

        .send-icon {
          display: inline-block;
          transition: transform 0.2s;
        }
        .send-btn:not(:disabled):hover .send-icon { transform: translateX(2px) translateY(-2px); }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .input-hint {
          text-align: center;
          font-size: 11px;
          color: var(--muted);
          margin-top: 8px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Voice button override */
        .voice-wrap button {
          width: 36px !important;
          height: 36px !important;
          border-radius: 12px !important;
          background: var(--surface2) !important;
          border: 1px solid var(--border) !important;
          font-size: 15px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: var(--muted) !important;
          transition: all 0.15s !important;
        }
        .voice-wrap button:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          background: var(--surface) !important;
        }
      `}</style>

      <div className="input-area">
        <div className="input-box">
          <div className="voice-wrap">
            <VoiceButton onResult={handleVoiceResult} disabled={loading} />
          </div>

          <textarea
            ref={textareaRef}
            className="msg-textarea"
            placeholder="Message NeuralChat... (Shift+Enter for new line)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <span className="send-icon">↑</span>
            )}
          </button>
        </div>

        <div className="input-hint">
          Enter to send · Shift+Enter for new line · 🎤 for voice
        </div>
      </div>
    </>
  );
}

export default InputBar;