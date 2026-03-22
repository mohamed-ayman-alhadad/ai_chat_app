import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function ChatWindow({ messages, dark }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <style>{`
        .chat-window {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
          background: var(--bg);
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding-bottom: 80px;
        }
        .empty-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          box-shadow: 0 8px 32px rgba(124, 109, 250, 0.25);
        }
        .empty-title {
          font-size: 20px; font-weight: 700;
          color: var(--text);
          letter-spacing: -0.5px;
        }
        .empty-sub {
          font-size: 13px; color: var(--muted);
          text-align: center; max-width: 280px;
          line-height: 1.6;
        }
        .empty-chips {
          display: flex; flex-wrap: wrap; gap: 8px;
          justify-content: center; margin-top: 8px;
        }
        .chip {
          padding: 6px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 12px; color: var(--muted);
          cursor: pointer; transition: all 0.15s;
          font-family: inherit;
        }
        .chip:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--surface2);
        }
      `}</style>

      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <div className="empty-title">How can I help?</div>
            <div className="empty-sub">Ask me anything, generate images, or use your voice.</div>
            <div className="empty-chips">
              <button className="chip">Write some code</button>
              <button className="chip">🎨 Draw a landscape</button>
              <button className="chip">Explain a concept</button>
              <button className="chip">Translate text</button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} dark={dark} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </>
  );
}

export default ChatWindow;