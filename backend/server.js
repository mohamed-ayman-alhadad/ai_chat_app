import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store conversation history per session
const conversations = {};

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!conversations[sessionId]) {
      conversations[sessionId] = [
        {
          role: "system",
          content: "You are a helpful and friendly assistant. Reply in the same language the user writes in.",
        },
      ];
    }

    conversations[sessionId].push({
      role: "user",
      content: message,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: conversations[sessionId],
    });

    const reply = response.choices[0].message.content;

    conversations[sessionId].push({
      role: "assistant",
      content: reply,
    });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
 