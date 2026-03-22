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
        .chat-win {
          flex:1; overflow-y:auto; padding:20px 16px 8px;
          display:flex; flex-direction:column; gap:2px;
          scrollbar-width:thin; scrollbar-color:var(--border) transparent;
          background:var(--bg);
        }
        @media(max-width:480px){ .chat-win{padding:14px 10px 6px;} }

        .empty {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:14px; padding-bottom:60px; padding:20px 20px 80px;
          text-align:center;
        }
        .empty-icon {
          width:58px; height:58px;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          border-radius:18px; display:flex; align-items:center; justify-content:center;
          font-size:26px; box-shadow:0 8px 28px rgba(124,109,250,.22);
          flex-shrink:0;
        }
        .empty-title { font-size:clamp(16px,4vw,20px); font-weight:700; letter-spacing:-.5px; }
        .empty-sub { font-size:clamp(12px,3vw,13px); color:var(--muted); max-width:260px; line-height:1.6; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:6px; }
        .chip {
          padding:6px 13px; background:var(--surface);
          border:1px solid var(--border); border-radius:999px;
          font-size:12px; color:var(--muted); cursor:pointer;
          transition:all .15s; font-family:inherit;
          white-space:nowrap;
        }
        .chip:hover{border-color:var(--accent);color:var(--accent);background:var(--surface2)}
        @media(max-width:360px){ .chip{font-size:11px; padding:5px 10px;} }
      `}</style>

      <div className="chat-win">
        {messages.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✦</div>
            <div className="empty-title">How can I help?</div>
            <div className="empty-sub">Ask anything, generate images, or use your voice.</div>
            <div className="chips">
              <button className="chip">Write some code</button>
              <button className="chip">🎨 Draw a landscape</button>
              <button className="chip">Explain a concept</button>
              <button className="chip">Translate text</button>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} dark={dark} />)
        )}
        <div ref={bottomRef} />
      </div>
    </>
  );
}

export default ChatWindow;