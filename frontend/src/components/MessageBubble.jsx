import { useState } from "react";
import ReactMarkdown from "react-markdown";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const isTyping = !isUser && message.content === "" && !message.imageUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .bubble-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: fadeSlideIn 0.25s ease;
          margin-bottom: 6px;
        }
        .bubble-row.user { flex-direction: row-reverse; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }
        .avatar.ai {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-weight: 700;
        }
        .avatar.user {
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--muted);
        }

        .bubble-wrap { max-width: 72%; position: relative; }
        .bubble-row.user .bubble-wrap { align-items: flex-end; display: flex; flex-direction: column; }

        .bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.65;
          font-family: 'Syne', sans-serif;
          word-break: break-word;
          position: relative;
        }
        .bubble.user {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .bubble.ai {
          background: var(--ai-bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }

        /* Markdown styling inside AI bubble */
        .bubble.ai p { margin: 0 0 8px; }
        .bubble.ai p:last-child { margin-bottom: 0; }
        .bubble.ai strong { font-weight: 600; color: var(--text); }
        .bubble.ai code {
          background: rgba(124,109,250,0.15);
          color: var(--accent);
          padding: 2px 6px; border-radius: 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }
        .bubble.ai pre {
          background: #0a0a0f;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          overflow-x: auto;
          margin: 10px 0;
        }
        .bubble.ai pre code {
          background: none; color: #a5f3a5; padding: 0;
          font-size: 12px;
        }
        .bubble.ai ul, .bubble.ai ol {
          padding-left: 20px; margin: 8px 0;
        }
        .bubble.ai li { margin: 4px 0; }
        .bubble.ai h1, .bubble.ai h2, .bubble.ai h3 {
          font-weight: 700; margin: 12px 0 6px;
          letter-spacing: -0.3px;
        }

        /* Typing dots */
        .typing-dots {
          display: flex; gap: 5px; align-items: center; height: 20px; padding: 0 4px;
        }
        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent);
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; background: linear-gradient(var(--accent), var(--accent2)); }
        .dot:nth-child(3) { animation-delay: 0.4s; background: var(--accent2); }

        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* Cursor blink */
        .cursor {
          display: inline-block;
          width: 2px; height: 14px;
          background: var(--accent);
          margin-left: 2px;
          vertical-align: middle;
          border-radius: 2px;
          animation: blink 0.8s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Image */
        .gen-image {
          border-radius: 14px;
          max-width: 100%;
          display: block;
          border: 1px solid var(--border);
        }
        .image-label {
          font-size: 11px; color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .image-label::before {
          content: '';
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent2); display: inline-block;
        }

        /* Copy button */
        .copy-btn {
          display: flex; align-items: center; gap: 5px;
          margin-top: 6px;
          background: none; border: none;
          font-size: 11px; color: var(--muted);
          cursor: pointer; font-family: 'Syne', sans-serif;
          opacity: 0;
          transition: opacity 0.15s, color 0.15s;
          padding: 2px 0;
        }
        .bubble-wrap:hover .copy-btn { opacity: 1; }
        .copy-btn:hover { color: var(--accent); }
        .copy-btn.copied { color: #4ade80; opacity: 1; }
      `}</style>

      <div className={`bubble-row ${isUser ? "user" : "ai"}`}>
        <div className={`avatar ${isUser ? "user" : "ai"}`}>
          {isUser ? "U" : "✦"}
        </div>

        <div className="bubble-wrap">
          <div className={`bubble ${isUser ? "user" : "ai"}`}>
            {message.imageUrl ? (
              <div>
                <div className="image-label">generated image</div>
                <img src={message.imageUrl} alt="generated" className="gen-image" />
              </div>
            ) : isTyping ? (
              <div className="typing-dots">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            ) : isUser ? (
              message.content
            ) : (
              <div>
                <ReactMarkdown>{message.content}</ReactMarkdown>
                <span className="cursor" />
              </div>
            )}
          </div>

          {!isUser && message.content && (
            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✓ copied" : "⎘ copy"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default MessageBubble;