import { useState, useRef, useEffect } from "react";
import VoiceButton from "./VoiceButton";

function InputBar({ onSend, loading }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend(text);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  return (
    <>
      <style>{`
        .inp-area {
          padding:10px 14px 14px; background:var(--bg);
          border-top:1px solid var(--border); flex-shrink:0;
        }
        @media(max-width:480px){ .inp-area{padding:8px 10px 12px;} }

        .inp-box {
          display:flex; align-items:flex-end; gap:8px;
          background:var(--surface); border:1px solid var(--border);
          border-radius:16px; padding:9px 10px;
          transition:border-color .2s,box-shadow .2s;
        }
        .inp-box:focus-within{
          border-color:var(--accent);
          box-shadow:0 0 0 3px rgba(124,109,250,.1);
        }

        .msg-ta {
          flex:1; background:none; border:none; outline:none;
          resize:none; font-family:var(--font);
          font-size:clamp(13px,3.5vw,14px);
          color:var(--text); line-height:1.5;
          min-height:22px; max-height:120px; overflow-y:auto;
          scrollbar-width:thin;
        }
        .msg-ta::placeholder{color:var(--muted);}

        .send-btn {
          width:34px; height:34px; flex-shrink:0;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          border:none; border-radius:10px; color:#fff;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          font-size:16px; transition:opacity .2s,transform .15s;
        }
        .send-btn:disabled{opacity:.35;cursor:not-allowed;}
        .send-btn:not(:disabled):hover{opacity:.85;transform:scale(1.05);}
        .send-btn:not(:disabled):active{transform:scale(.95);}

        .send-icon{display:inline-block;transition:transform .2s;}
        .send-btn:not(:disabled):hover .send-icon{transform:translateX(2px) translateY(-2px);}

        .spinner{
          width:14px;height:14px;
          border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin .7s linear infinite;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        .inp-hint {
          text-align:center; font-size:10px; color:var(--muted);
          margin-top:6px; font-family:var(--mono);
        }
        @media(max-width:480px){ .inp-hint{display:none;} }

        /* Voice button override */
        .vwrap button {
          width:34px !important; height:34px !important;
          border-radius:10px !important; background:var(--surface2) !important;
          border:1px solid var(--border) !important; font-size:14px !important;
          display:flex !important; align-items:center !important;
          justify-content:center !important; color:var(--muted) !important;
          transition:all .15s !important;
        }
        .vwrap button:hover{
          border-color:var(--accent) !important;
          color:var(--accent) !important;
          background:var(--surface) !important;
        }
      `}</style>

      <div className="inp-area">
        <div className="inp-box">
          <div className="vwrap">
            <VoiceButton onResult={handleVoiceResult} disabled={loading} />
          </div>
          <textarea
            ref={textareaRef}
            className="msg-ta"
            placeholder="Message NeuralChat..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading || !text.trim()}>
            {loading ? <div className="spinner"/> : <span className="send-icon">↑</span>}
          </button>
        </div>
        <div className="inp-hint">Enter to send · Shift+Enter new line · 🎤 voice</div>
      </div>
    </>
  );
}

export default InputBar;