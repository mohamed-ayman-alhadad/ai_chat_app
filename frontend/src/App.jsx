import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";

const generateId = () => Math.random().toString(36).substring(2);
const createNewChat = () => ({
  id: generateId(),
  sessionId: generateId(),
  title: "New Chat",
  messages: [],
});

function App() {
  const [chats, setChats] = useState([createNewChat()]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 768;
      setMobile(isMob);
      if (!isMob) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const isImageRequest = (text) => {
    const keywords = ["draw", "generate image", "image of", "picture of", "/image", "صورة", "ارسم"];
    return keywords.some((k) => text.toLowerCase().includes(k));
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    if (mobile) setSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (mobile) setSidebarOpen(false);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId);
      if (filtered.length === 0) {
        const newChat = createNewChat();
        setActiveChatId(newChat.id);
        return [newChat];
      }
      if (chatId === activeChatId) setActiveChatId(filtered[0].id);
      return filtered;
    });
  };

  const updateChat = (chatId, newMessage, title) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, newMessage], title: title || c.title }
          : c
      )
    );
  };

  const typeMessage = (chatId, fullText) => {
    return new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        index++;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== chatId) return c;
            const messages = [...c.messages];
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content: fullText.slice(0, index),
            };
            return { ...c, messages };
          })
        );
        if (index >= fullText.length) { clearInterval(interval); resolve(); }
      }, 12);
    });
  };

  const handleSend = async (text) => {
    const userMessage = { role: "user", content: text };
    const isFirst = activeChat.messages.length === 0;
    const chatTitle = isFirst ? text.slice(0, 28) : null;
    updateChat(activeChatId, userMessage, chatTitle);
    setLoading(true);
    try {
      if (isImageRequest(text)) {
        const res = await fetch("https://aichatapp-production.up.railway.app/image", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();
        updateChat(activeChatId, { role: "assistant", content: "", imageUrl: data.imageUrl });
      } else {
        const res = await fetch("https://aichatapp-production.up.railway.app/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, sessionId: activeChat.sessionId }),
        });
        const data = await res.json();
        updateChat(activeChatId, { role: "assistant", content: "" });
        await typeMessage(activeChatId, data.reply);
      }
    } catch {
      updateChat(activeChatId, { role: "assistant", content: "⚠️ Error connecting to server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24;
          --border: rgba(255,255,255,0.06); --border-hover: rgba(255,255,255,0.12);
          --accent: #7c6dfa; --accent2: #fa6d9a; --text: #f0f0ff; --muted: #6b6b8a;
          --ai-bg: #1a1a24; --font: 'Syne', sans-serif; --mono: 'JetBrains Mono', monospace;
        }
        html:not(.dark) {
          --bg: #f5f4ff; --surface: #ffffff; --surface2: #eeecff;
          --border: rgba(0,0,0,0.07); --border-hover: rgba(0,0,0,0.14);
          --accent: #6355e8; --accent2: #e83585; --text: #0d0d1a; --muted: #8888aa; --ai-bg: #eeecff;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInLeft { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        body { font-family: var(--font); background: var(--bg); color: var(--text); height: 100dvh; overflow: hidden; }

        .shell { display:flex; height:100dvh; position:relative; overflow:hidden; }

        /* Overlay */
        .overlay {
          display:none; position:fixed; inset:0;
          background:rgba(0,0,0,.55); z-index:40; backdrop-filter:blur(3px);
        }
        .overlay.show { display:block; }

        /* Sidebar */
        .sidebar {
          width: 260px; background: var(--surface);
          border-right: 1px solid var(--border);
          display:flex; flex-direction:column;
          flex-shrink:0; z-index:50;
          transition: margin 0.3s cubic-bezier(.4,0,.2,1);
        }
        .sidebar.hide-desk { margin-left:-260px; }

        @media(max-width:767px){
          .sidebar {
            position:fixed; top:0; left:0; bottom:0;
            width: min(260px, 82vw);
            transform:translateX(-100%);
            transition:transform .28s cubic-bezier(.4,0,.2,1);
            margin:0 !important;
          }
          .sidebar.show-mob {
            transform:translateX(0);
            animation:slideInLeft .25s ease;
          }
        }

        .s-logo {
          padding:18px 16px 12px; display:flex; align-items:center; gap:10px;
          border-bottom:1px solid var(--border); flex-shrink:0;
        }
        .s-logo-icon {
          width:30px; height:30px; border-radius:9px; flex-shrink:0;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          display:flex; align-items:center; justify-content:center; font-size:14px;
        }
        .s-logo-text { font-size:15px; font-weight:700; letter-spacing:-.3px; }

        .s-new {
          margin:10px 12px; padding:10px 14px;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          border:none; border-radius:12px; color:#fff;
          font-family:var(--font); font-size:13px; font-weight:600;
          cursor:pointer; display:flex; align-items:center; gap:8px;
          transition:opacity .2s,transform .15s; flex-shrink:0;
        }
        .s-new:hover{opacity:.9;transform:scale(1.02)}
        .s-new:active{transform:scale(.97)}

        .s-list { flex:1; overflow-y:auto; padding:6px 8px; scrollbar-width:thin; }
        .s-item {
          display:flex; align-items:center; padding:9px 10px; border-radius:10px;
          cursor:pointer; gap:8px; border:1px solid transparent;
          transition:background .15s; animation:fadeIn .2s ease;
        }
        .s-item:hover { background:var(--surface2); }
        .s-item.active { background:var(--surface2); border-color:var(--border-hover); }
        .s-dot { width:6px; height:6px; border-radius:50%; background:var(--muted); flex-shrink:0; transition:background .2s; }
        .s-item.active .s-dot { background:var(--accent); }
        .s-name {
          flex:1; font-size:13px; color:var(--muted);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .s-item.active .s-name,.s-item:hover .s-name { color:var(--text); }
        .s-del {
          opacity:0; background:none; border:none; color:var(--muted);
          cursor:pointer; font-size:13px; padding:2px 5px; border-radius:4px;
          transition:opacity .15s,color .15s; flex-shrink:0;
        }
        .s-item:hover .s-del{opacity:1}
        .s-del:hover{color:#f87171}
        .s-foot {
          padding:10px 14px; border-top:1px solid var(--border);
          font-size:10px; color:var(--muted); font-family:var(--mono); flex-shrink:0;
        }

        /* Main */
        .main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

        /* Topbar */
        .topbar {
          display:flex; align-items:center; justify-content:space-between;
          padding:0 16px; height:56px;
          border-bottom:1px solid var(--border); background:var(--surface); flex-shrink:0; gap:8px;
        }
        .t-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
        .t-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .t-info { min-width:0; flex:1; }
        .t-title { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .t-sub { font-size:10px; color:var(--muted); font-family:var(--mono); }

        .ibtn {
          width:34px; height:34px; flex-shrink:0; background:none;
          border:1px solid var(--border); border-radius:9px; color:var(--muted);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          font-size:15px; transition:all .15s;
        }
        .ibtn:hover{background:var(--surface2);border-color:var(--border-hover);color:var(--text)}

        .s-status { width:7px; height:7px; border-radius:50%; background:#4ade80; position:relative; flex-shrink:0; }
        .s-status::after {
          content:''; position:absolute; inset:-3px; border-radius:50%;
          background:#4ade80; animation:pulse-ring 1.5s ease-out infinite;
        }

        @media(max-width:480px){
          .topbar{padding:0 10px;}
          .t-title{font-size:12px;}
        }
      `}</style>

      <div className="shell">
        {/* Overlay */}
        <div className={`overlay ${mobile && sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <div className={`sidebar ${mobile ? (sidebarOpen ? "show-mob" : "") : (sidebarOpen ? "" : "hide-desk")}`}>
          <div className="s-logo">
            <div className="s-logo-icon">✦</div>
            <span className="s-logo-text">NeuralChat</span>
          </div>
          <button className="s-new" onClick={handleNewChat}>
            <span style={{fontSize:17}}>+</span> New conversation
          </button>
          <div className="s-list">
            {chats.map((chat) => (
              <div key={chat.id} className={`s-item ${chat.id === activeChatId ? "active" : ""}`} onClick={() => handleSelectChat(chat.id)}>
                <div className="s-dot" />
                <span className="s-name">{chat.title}</span>
                <button className="s-del" onClick={(e) => handleDeleteChat(chat.id, e)}>✕</button>
              </div>
            ))}
          </div>
          <div className="s-foot">v1.0 · llama-3.3 + pollinations</div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className="t-left">
              <button className="ibtn" onClick={() => setSidebarOpen((p) => !p)}>☰</button>
              <div className="t-info">
                <div className="t-title">{activeChat?.title}</div>
                <div className="t-sub">{activeChat?.messages.length || 0} messages</div>
              </div>
            </div>
            <div className="t-right">
              <div className="s-status" title="Connected" />
              <button className="ibtn" onClick={() => setDark((p) => !p)}>{dark ? "☀" : "☽"}</button>
            </div>
          </div>
          <ChatWindow messages={activeChat?.messages || []} dark={dark} />
          <InputBar onSend={handleSend} loading={loading} dark={dark} />
        </div>
      </div>
    </>
  );
}

export default App;