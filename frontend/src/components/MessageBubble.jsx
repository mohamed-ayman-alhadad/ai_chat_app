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
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

        .row { display:flex; align-items:flex-end; gap:8px; animation:fadeIn .25s ease; margin-bottom:4px; }
        .row.user{flex-direction:row-reverse;}

        .av {
          width:26px; height:26px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:11px;
        }
        .av.ai{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-weight:700;}
        .av.user{background:var(--surface2);border:1px solid var(--border);color:var(--muted);}

        @media(max-width:480px){
          .av{width:22px;height:22px;font-size:10px;}
        }

        .bwrap{position:relative;}
        .row.user .bwrap{display:flex;flex-direction:column;align-items:flex-end;}

        /* Max width responsive */
        .bubble {
          padding:10px 14px; border-radius:18px;
          font-size:clamp(13px,3.5vw,14px); line-height:1.65;
          font-family:var(--font); word-break:break-word; position:relative;
          max-width: min(72vw, 520px);
        }
        @media(max-width:480px){
          .bubble{padding:9px 12px; max-width:82vw;}
        }
        @media(max-width:360px){
          .bubble{max-width:88vw;}
        }

        .bubble.user{
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          color:#fff; border-bottom-right-radius:4px;
        }
        .bubble.ai{
          background:var(--ai-bg); color:var(--text);
          border:1px solid var(--border); border-bottom-left-radius:4px;
        }
        .bubble.ai p{margin:0 0 8px}
        .bubble.ai p:last-child{margin-bottom:0}
        .bubble.ai strong{font-weight:600}
        .bubble.ai code{
          background:rgba(124,109,250,.15); color:var(--accent);
          padding:2px 5px; border-radius:5px;
          font-family:var(--mono); font-size:11px;
        }
        .bubble.ai pre{
          background:#0a0a0f; border:1px solid var(--border);
          border-radius:10px; padding:10px 12px; overflow-x:auto; margin:8px 0;
        }
        .bubble.ai pre code{background:none;color:#a5f3a5;padding:0;font-size:11px;}
        .bubble.ai ul,.bubble.ai ol{padding-left:18px;margin:6px 0;}
        .bubble.ai li{margin:3px 0;}
        .bubble.ai h1,.bubble.ai h2,.bubble.ai h3{font-weight:700;margin:10px 0 5px;letter-spacing:-.3px;}

        .typing{display:flex;gap:5px;align-items:center;height:18px;padding:0 2px;}
        .dot{width:6px;height:6px;border-radius:50%;animation:dotBounce 1.2s ease-in-out infinite;}
        .dot:nth-child(1){background:var(--accent);}
        .dot:nth-child(2){background:linear-gradient(var(--accent),var(--accent2));animation-delay:.2s;}
        .dot:nth-child(3){background:var(--accent2);animation-delay:.4s;}

        .cursor{
          display:inline-block;width:2px;height:13px;background:var(--accent);
          margin-left:2px;vertical-align:middle;border-radius:2px;
          animation:blink .8s ease-in-out infinite;
        }

        .gen-img{border-radius:12px;max-width:100%;display:block;border:1px solid var(--border);}
        .img-lbl{
          font-size:10px;color:var(--muted);font-family:var(--mono);
          margin-bottom:7px;display:flex;align-items:center;gap:5px;
        }
        .img-lbl::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--accent2);display:inline-block;}

        .copy-btn{
          display:flex;align-items:center;gap:4px;margin-top:5px;
          background:none;border:none;font-size:11px;color:var(--muted);
          cursor:pointer;font-family:var(--font);opacity:0;
          transition:opacity .15s,color .15s;padding:2px 0;
        }
        .bwrap:hover .copy-btn{opacity:1;}
        .copy-btn:hover{color:var(--accent);}
        .copy-btn.copied{color:#4ade80;opacity:1;}

        @media(hover:none){
          .copy-btn{opacity:1;}
        }
      `}</style>

      <div className={`row ${isUser ? "user" : "ai"}`}>
        <div className={`av ${isUser ? "user" : "ai"}`}>{isUser ? "U" : "✦"}</div>
        <div className="bwrap">
          <div className={`bubble ${isUser ? "user" : "ai"}`}>
            {message.imageUrl ? (
              <div>
                <div className="img-lbl">generated image</div>
                <img src={message.imageUrl} alt="generated" className="gen-img" />
              </div>
            ) : isTyping ? (
              <div className="typing">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            ) : isUser ? message.content : (
              <div>
                <ReactMarkdown>{message.content}</ReactMarkdown>
                <span className="cursor"/>
              </div>
            )}
          </div>
          {!isUser && message.content && (
            <button className={`copy-btn ${copied?"copied":""}`} onClick={handleCopy}>
              {copied ? "✓ copied" : "⎘ copy"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default MessageBubble;