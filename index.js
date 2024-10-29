const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages, language, personality } = req.body;

  const apiMessages = messages.map((message) => {
    return {
      role: message.sender === "ChatGPT" ? "assistant" : "user",
      content: message.message,
    };
  });

  const systemMessage = {
    role: "system",
    content: `Respond to the user in ${language} as a ${personality} shopping assistant.`,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [systemMessage, ...apiMessages],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const messageContent = response.data.choices[0].message.content;
    res.json({ message: messageContent });
  } catch (error) {
    console.error("Error with OpenAI API", error.message);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
