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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const isImageRequest = (text) => {
    const keywords = ["draw", "generate image", "image of", "picture of", "/image", "صورة", "ارسم"];
    return keywords.some((k) => text.toLowerCase().includes(k));
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
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
        const res = await fetch("http://localhost:5000/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();
        updateChat(activeChatId, { role: "assistant", content: "", imageUrl: data.imageUrl });
      } else {
        const res = await fetch("http://localhost:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          --bg: #0a0a0f;
          --surface: #111118;
          --surface2: #1a1a24;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.12);
          --accent: #7c6dfa;
          --accent2: #fa6d9a;
          --text: #f0f0ff;
          --muted: #6b6b8a;
          --user-bg: linear-gradient(135deg, #7c6dfa, #fa6d9a);
          --ai-bg: #1a1a24;
          --font: 'Syne', sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }

        body.light-mode, html:not(.dark) body {
          --bg: #f5f4ff;
          --surface: #ffffff;
          --surface2: #eeecff;
          --border: rgba(0,0,0,0.07);
          --border-hover: rgba(0,0,0,0.14);
          --accent: #6355e8;
          --accent2: #e83585;
          --text: #0d0d1a;
          --muted: #8888aa;
          --ai-bg: #eeecff;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        .app-shell {
          display: flex;
          height: 100vh;
          background: var(--bg);
          font-family: var(--font);
          color: var(--text);
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.3s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }
        .sidebar.closed { width: 0; border: none; }

        .sidebar-logo {
          padding: 20px 16px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border);
        }
        .logo-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .logo-text {
          font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
          white-space: nowrap;
        }

        .new-chat-btn {
          margin: 12px;
          padding: 10px 14px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none; border-radius: 12px;
          color: #fff; font-family: var(--font);
          font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .new-chat-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .new-chat-btn:active { transform: scale(0.98); }

        .chat-list {
          flex: 1; overflow-y: auto; padding: 8px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .chat-item {
          display: flex; align-items: center;
          padding: 9px 12px; border-radius: 10px;
          cursor: pointer; gap: 8px;
          transition: background 0.15s;
          border: 1px solid transparent;
          animation: fadeSlideIn 0.2s ease;
        }
        .chat-item:hover { background: var(--surface2); }
        .chat-item.active {
          background: var(--surface2);
          border-color: var(--border-hover);
        }
        .chat-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--muted); flex-shrink: 0;
          transition: background 0.2s;
        }
        .chat-item.active .chat-dot { background: var(--accent); }
        .chat-title {
          flex: 1; font-size: 13px; color: var(--muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s;
        }
        .chat-item.active .chat-title, .chat-item:hover .chat-title { color: var(--text); }
        .chat-delete {
          opacity: 0; background: none; border: none;
          color: var(--muted); cursor: pointer; font-size: 14px;
          padding: 2px 4px; border-radius: 4px;
          transition: opacity 0.15s, color 0.15s;
        }
        .chat-item:hover .chat-delete { opacity: 1; }
        .chat-delete:hover { color: #f87171; }

        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          font-size: 11px; color: var(--muted);
          font-family: var(--mono);
          white-space: nowrap;
        }

        /* ── Main ── */
        .main {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
        }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          height: 56px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          flex-shrink: 0;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .topbar-right { display: flex; align-items: center; gap: 8px; }

        .icon-btn {
          width: 36px; height: 36px;
          background: none; border: 1px solid var(--border);
          border-radius: 10px; color: var(--muted);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: all 0.15s;
        }
        .icon-btn:hover {
          background: var(--surface2);
          border-color: var(--border-hover);
          color: var(--text);
        }

        .topbar-title {
          font-size: 14px; font-weight: 600;
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; max-width: 280px;
        }
        .topbar-sub {
          font-size: 11px; color: var(--muted); font-family: var(--mono);
        }

        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80; position: relative;
        }
        .status-dot::after {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse-ring 1.5s ease-out infinite;
        }
      `}</style>

      <div className="app-shell">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">
            <div className="logo-icon">✦</div>
            <span className="logo-text">NeuralChat</span>
          </div>

          <button className="new-chat-btn" onClick={handleNewChat}>
            <span style={{ fontSize: 18 }}>+</span> New conversation
          </button>

          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="chat-dot" />
                <span className="chat-title">{chat.title}</span>
                <button className="chat-delete" onClick={(e) => handleDeleteChat(chat.id, e)}>✕</button>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">v1.0 · llama-3.3 + pollinations</div>
        </div>

        {/* Main Area */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="icon-btn" onClick={() => setSidebarOpen((p) => !p)}>
                ☰
              </button>
              <div>
                <div className="topbar-title">{activeChat?.title}</div>
                <div className="topbar-sub">
                  {activeChat?.messages.length || 0} messages
                </div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="status-dot" title="Connected" />
              <button className="icon-btn" onClick={() => setDark((p) => !p)} title="Toggle theme">
                {dark ? "☀" : "☽"}
              </button>
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